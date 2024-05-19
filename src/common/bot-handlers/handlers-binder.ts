import { Bot, Context } from 'grammy';
import UserService from '../../user/services/user.service';
import Db from '../db/db';
import UserEntity from '../../user/entities/user.entity';
import { BotCommandsEnum } from '../enum/bot-commands.enum';
import { VoiceSenderAliasByCount } from '../enum/voice-sender-alias-by-count.enum';
import { photoReactions } from '../list/photo-reactions.list';
import VoiceService from '../../voice/services/voice.service';
import ChatService from '../../chat/services/chat.service';
import VoiceEntity from '../../voice/entities/user-voice.entity';
import ChatEntity from '../../chat/entities/chat.entity';
import MessageService from '../../message/services/message.service';
import MessageEntity from '../../message/entities/message.entity';

export default class BotHandlersBinder {
    private COMMANDS: Map<BotCommandsEnum, (ctx: Context, user: UserEntity) => Promise<void>> = new Map([
        [BotCommandsEnum.OWN_VOICES_LENGTH, this.getOwnVoicesLength],
        [BotCommandsEnum.TOP_VOICES, this.getTopVoicesLength],
        [BotCommandsEnum.TOP_VOICES_TODAY, this.getTopVoicesLengthToday],
        [BotCommandsEnum.COUNT_MESSAGES, this.getUserMessagesCount],
    ]);

    private userService: UserService;
    private voiceService: VoiceService;
    private chatService: ChatService;
    private messageService: MessageService;

    constructor(private readonly _bot: Bot) {
        const ds = Db.getDataSource();
        this.userService = new UserService(ds.getRepository(UserEntity));
        this.voiceService = new VoiceService(ds.getRepository(VoiceEntity));
        this.chatService = new ChatService(ds.getRepository(ChatEntity));
        this.messageService = new MessageService(ds.getRepository(MessageEntity));
    }

    async bind() {
        this._bot.on('message', async (ctx) => {
            if (ctx.from.is_bot) {
                return;
            }
            const user = await this.handleTelegramUser(ctx);
            await this.handlerPhrases(ctx);
            await this.handlePhoto(ctx);
            await this.handleVoice(ctx, user);
            await this.handleCommands(ctx, user);
            await this.addMessageIntoDb(ctx, user);
            console.log('Message\n', JSON.stringify(ctx));
        });
    }

    async handleTelegramUser(ctx: Context): Promise<UserEntity> {
        if (!ctx.from) {
            throw new Error('Cannot determine from props');
        }
        if (!ctx.chat) {
            throw new Error('Cannot determine chat id');
        }
        let user = await this.userService.findOneByTgId(ctx.from.id);
        if (!user) {
            user = await this.userService.createFromTgProfile(ctx.from.id, ctx.from.first_name, ctx.from.username);
        }
        if (!user.chats || !user.chats.find((chat) => chat.chatId === ctx.chat?.id)) {
            const chat = await this.chatService.create(ctx.chat.id, ctx.chat.title, ctx.chat.type === 'private', user);
            if (!user.chats) {
                user.chats = [];
            }
            user.chats.push(chat);
        }
        return user;
    }

    async handlePhoto(ctx: Context) {
        if (!ctx.message || !ctx.message.photo) {
            return;
        }
        const index = Math.floor(Math.random() * photoReactions.length);
        ctx.reply(photoReactions[index], { reply_parameters: { message_id: ctx.message.message_id } });
    }

    async handlerPhrases(ctx: Context) {
        if (!ctx.message || !ctx.chat?.id) {
            return;
        }
        if (ctx.message.text && /темка/gi.test(ctx.message.text)) {
            ctx.reply('Куда ты лезешь, оно тебя сожрет', { reply_parameters: { message_id: ctx.message.message_id } });
        }

        if (ctx.message.text && /токсик/gi.test(ctx.message.text)) {
            this._bot.api.sendMessage(ctx.chat.id, `/voteban @${ctx.from?.username}`);
        }
    }

    async handleVoice(ctx: Context, user: UserEntity) {
        if (!ctx.message || !ctx.chat) {
            return;
        }
        if (!ctx.message.video_note && !ctx.message.voice) {
            return;
        }
        let duration, fileId, fileUniqueId, fileSize;
        if (ctx.message.video_note) {
            duration = ctx.message.video_note.duration;
            fileId = ctx.message.video_note.thumbnail?.file_id;
            fileUniqueId = ctx.message.video_note.thumbnail?.file_unique_id;
            fileSize = ctx.message.video_note.thumbnail?.file_size;
        } else {
            duration = ctx.message.voice?.duration;
            fileId = ctx.message.voice?.file_id;
            fileUniqueId = ctx.message.voice?.file_unique_id;
            fileSize = ctx.message.voice?.file_size;
        }

        const chatId = user.chats.find((chat) => chat.chatId === ctx.chat?.id)?.id;
        if (!chatId) {
            throw new Error();
        }
        if (duration === undefined || fileId === undefined || fileUniqueId === undefined) {
            return;
        }

        await this.voiceService.create(duration, fileId, fileUniqueId, fileSize, user, chatId);
        const totalVoices = await this.voiceService.getUserVoicesCount(user, ctx.chat.id);
        const now = new Date();
        const start = new Date(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`);
        const end = new Date(start);
        end.setHours(23);
        end.setMinutes(59);
        end.setSeconds(59);
        const todaysVoices = await this.voiceService.getUserVoicesCount(user, ctx.chat.id, { start, end });

        let voicesAlias = null;

        for (const key in VoiceSenderAliasByCount) {
            const number = VoiceSenderAliasByCount[key];
            if (totalVoices > number) {
                voicesAlias = key;
            }
        }

        ctx.reply(
            `Ваше общее количество голосовых сообщений: ${totalVoices}\n\nВы ${voicesAlias}\n\nСегодня вы отправили ${todaysVoices}, это ${Math.round((todaysVoices / totalVoices) * 100)}% от общего числа`,
            { reply_parameters: { message_id: ctx.message.message_id } },
        );
    }

    async handleCommands(ctx: Context, user: UserEntity) {
        if (!ctx.message || !ctx.message.text) {
            return;
        }
        const handler = this.COMMANDS.get(ctx.message.text as BotCommandsEnum)?.bind(this);
        if (handler) {
            await handler(ctx, user);
        } else {
            const groupHandler = this.COMMANDS.get(ctx.message.text.split('@')[0] as BotCommandsEnum)?.bind(this);
            if (groupHandler) {
                await groupHandler(ctx, user);
            }
        }
    }

    async getOwnVoicesLength(ctx: Context, user: UserEntity) {
        if (!ctx.chat || !ctx.message) {
            return;
        }
        const now = new Date();
        const start = new Date(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`);
        const end = new Date(start);
        end.setHours(23);
        end.setMinutes(59);
        end.setSeconds(59);
        const totalVoicesLength = await this.voiceService.getUsersVoicesLength(user, ctx.chat.id);
        const todaysVoicesLength = await this.voiceService.getUsersVoicesLength(user, ctx.chat.id, { start, end });
        const message = `Общее время голосовых сообщений: ${totalVoicesLength} секунд\nВремя голосовых сообщений за сегодня: ${todaysVoicesLength} секнуд`;
        ctx.reply(todaysVoicesLength < 600 ? message : `${message}`, {
            reply_parameters: { message_id: ctx.message.message_id },
        });
    }

    async getTopVoicesLengthToday(ctx: Context, user: UserEntity) {
        if (!ctx.chat) {
            return;
        }
        const now = new Date();
        const start = new Date(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`);
        const end = new Date(start);
        end.setHours(23);
        end.setMinutes(59);
        end.setSeconds(59);
        const top = await this.voiceService.getTopVoicesLengthByChat(ctx.chat.id, { start, end });
        if (top.size === 0) {
            this._bot.api.sendMessage(ctx.chat.id, 'Еще нет ни одного зарегистрированного голосовного сообщения');
        }
        const promises: Promise<UserEntity | null>[] = [];
        top.forEach((_, key) => {
            promises.push(this.userService.findById(key));
        });
        const message = `Топ воис абьюзеров за сегодня:\n`;
        const users = await Promise.all(promises);
        this._bot.api.sendMessage(
            ctx.chat.id,
            users.reduce((acc, user) => {
                if (!user) {
                    return acc;
                }
                const length = top.get(user.id);
                return `${acc}@${user.tgUsername} aka ${user.tgFirstName} - ${length || 0} секунд\n`;
            }, message),
        );
    }

    async getTopVoicesLength(ctx: Context, user: UserEntity) {
        if (!ctx.chat) {
            return;
        }
        const topTotal = await this.voiceService.getTopVoicesLengthByChat(ctx.chat.id);
        if (topTotal.size === 0) {
            this._bot.api.sendMessage(ctx.chat.id, 'Еще нет ни одного зарегистрированного голосовного сообщения');
        }
        const promises: Promise<UserEntity | null>[] = [];
        topTotal.forEach((_, key) => {
            promises.push(this.userService.findById(key));
        });
        const message = `Топ воис абьюзеров:\n`;
        const users = await Promise.all(promises);
        this._bot.api.sendMessage(
            ctx.chat.id,
            users.reduce((acc, user) => {
                if (!user) {
                    return acc;
                }
                const length = topTotal.get(user.id);
                return `${acc}@${user.tgUsername} aka ${user.tgFirstName} - ${length || 0} секунд\n`;
            }, message),
        );
    }

    async getUserMessagesCount(ctx: Context, user: UserEntity) {
        if (!ctx.chat || !ctx.message) {
            return;
        }
        let chat = user.chats.find((_chat) => _chat.chatId === ctx.chat?.id);
        if (!chat) {
            const isChatExists = await this.chatService.getChatByTelegramId(ctx.chat.id);
            if (!isChatExists) {
                return;
            }
            chat = isChatExists;
        }
        let message = await this.messageService.getMessageByChat(chat);
        if (!message) {
            message = await this.messageService.create(chat, new Date());
        }
        ctx.reply(message.messagesCount.toString(), { reply_parameters: { message_id: ctx.message?.message_id } });
    }

    async addMessageIntoDb(ctx: Context, user: UserEntity) {
        if (!ctx.chat) {
            return;
        }
        let chat = user.chats.find((_chat) => _chat.chatId === ctx.chat?.id);
        if (!chat) {
            const isChatExists = await this.chatService.getChatByTelegramId(ctx.chat.id);
            if (!isChatExists) {
                return;
            }
            chat = isChatExists;
        }
        let message = await this.messageService.getMessageByChat(chat);
        if (!message) {
            message = await this.messageService.create(chat, new Date());
        }
        await this.messageService.increaseMessageCounter(message);
    }
}
