import { Bot, Context } from 'grammy';
import UserService from '../../user/services/user.service';
import Db from '../db/db';
import UserEntity from '../../user/entities/user.entity';
import UserVoiceService from '../../user/services/user-voice.service';
import UserVoiceEntity from '../../user/entities/user-voice';
import { BotCommandsEnum } from '../enum/bot-commands.enum';
import UserChatService from '../../user/services/user-chat.service';
import UserChatEntity from '../../user/entities/user-chat';
import { VoiceSenderAliasByCount } from '../enum/voice-sender-alias-by-count.enum';
import { photoReactions } from '../list/photo-reactions.list';

export default class BotHandlersBinder {
    private COMMANDS: Map<BotCommandsEnum, (ctx: Context, user: UserEntity) => Promise<void>> = new Map([
        [BotCommandsEnum.OWN_VOICES_LENGTH, this.getOwnVoicesLength],
        [BotCommandsEnum.TOP_VOICES, this.getTopVoicesLength],
        [BotCommandsEnum.TOP_VOICES_TODAY, this.getTopVoicesLengthToday],
        [BotCommandsEnum.COUNT_MESSAGES, this.getUserMessagesCount],
    ]);

    private userService: UserService;
    private userVoiceService: UserVoiceService;
    private userChatService: UserChatService;

    constructor(private readonly _bot: Bot) {
        const ds = Db.getDataSource();
        this.userService = new UserService(ds.getRepository(UserEntity));
        this.userVoiceService = new UserVoiceService(ds.getRepository(UserVoiceEntity));
        this.userChatService = new UserChatService(ds.getRepository(UserChatEntity));
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
            await this.userChatService.increaseMessagesCount(user, ctx.chat.id);
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
            const chat = await this.userChatService.create(
                ctx.chat.id,
                ctx.chat.title,
                ctx.chat.type === 'private',
                user,
            );
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
        const index = Math.floor(Math.random() * (photoReactions.length + 1));
        ctx.reply(photoReactions[index - 1]);
    }

    async handlerPhrases(ctx: Context) {
        if (!ctx.message || !ctx.chat?.id) {
            return;
        }
        if (ctx.message.text && /темка/gi.test(ctx.message.text)) {
            this._bot.api.sendMessage(ctx.chat.id, 'Куда ты лезешь, оно тебя сожрет');
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

        await this.userVoiceService.create(duration, fileId, fileUniqueId, fileSize, user, chatId);
        const totalVoices = await this.userVoiceService.getUserVoicesCount(user, ctx.chat.id);
        const now = new Date();
        const start = new Date(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`);
        const end = new Date(start);
        end.setHours(23);
        end.setMinutes(59);
        end.setSeconds(59);
        const todaysVoices = await this.userVoiceService.getUserVoicesCount(user, ctx.chat.id, { start, end });

        let voicesAlias = null;

        for (const key in VoiceSenderAliasByCount) {
            const number = VoiceSenderAliasByCount[key];
            if (totalVoices > number) {
                voicesAlias = key;
            }
        }

        this._bot.api.sendMessage(
            ctx.chat.id,
            `Ваше общее количество голосовых сообщений: ${totalVoices}\n\nВы ${voicesAlias}\n\nСегодня вы отправили ${todaysVoices}, это ${Math.round((todaysVoices / totalVoices) * 100)}% от общего числа`,
        );
    }

    async handleCommands(ctx: Context, user: UserEntity) {
        if (!ctx.message || !ctx.message.text) {
            return;
        }
        const handler = this.COMMANDS.get(ctx.message.text as BotCommandsEnum)?.bind(this);
        if (handler) {
            await handler(ctx, user);
        }
    }

    async getOwnVoicesLength(ctx: Context, user: UserEntity) {
        if (!ctx.chat) {
            return;
        }
        const now = new Date();
        const start = new Date(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`);
        const end = new Date(start);
        end.setHours(23);
        end.setMinutes(59);
        end.setSeconds(59);
        const totalVoicesLength = await this.userVoiceService.getUsersVoicesLength(user, ctx.chat.id);
        const todaysVoicesLength = await this.userVoiceService.getUsersVoicesLength(user, ctx.chat.id, { start, end });
        const message = `Общее время голосовых сообщений: ${totalVoicesLength} секунд\nВремя голосовых сообщений за сегодня: ${todaysVoicesLength} секнуд`;
        this._bot.api.sendMessage(ctx.chat.id, todaysVoicesLength < 600 ? message : `${message}`);
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
        const top = await this.userVoiceService.getTopVoicesLengthByChat(ctx.chat.id, { start, end });
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
                return `${acc}@${user.tgUsername} aka ${user.tgFirstName} - ${length || 0} секунд`;
            }, message),
        );
    }

    async getTopVoicesLength(ctx: Context, user: UserEntity) {
        if (!ctx.chat) {
            return;
        }
        const topTotal = await this.userVoiceService.getTopVoicesLengthByChat(ctx.chat.id);
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
                return `${acc}@${user.tgUsername} aka ${user.tgFirstName} - ${length || 0} секунд`;
            }, message),
        );
    }

    async getUserMessagesCount(ctx: Context, user: UserEntity) {
        if (!ctx.chat) {
            return;
        }
        const chat = await this.userChatService.getCountByChat(user, ctx.chat.id);
        if (chat) {
            this._bot.api.sendMessage(ctx.chat.id, chat.messagesCount.toString());
        }
    }
}
