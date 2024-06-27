import VoiceEntity from '../../../voice/entities/user-voice.entity';
import VoiceService from '../../../voice/services/voice.service';
import Db from '../../db/db';
import { VoiceSenderAliasByCount } from '../../enum/voice-sender-alias-by-count.enum';
import IBotHandler from '../../interfaces/bot-handler.interface';
import { CustomContext } from '../../types/custom-context.type';

export default class VoiceMessageBotHandler implements IBotHandler {
    private readonly voiceService: VoiceService;

    constructor() {
        const ds = Db.getDataSource();
        this.voiceService = new VoiceService(ds.getRepository(VoiceEntity));
    }

    async process(ctx: CustomContext): Promise<void> {
        if (!ctx.message) {
            throw new Error('Voice handler without message body');
        }
        if (!ctx.message.chat || !ctx.chat) {
            throw new Error('Voice handler without chat properties');
        }

        if (ctx.message.forward_origin) {
            await ctx.reply(`А ваша мама знает что вы пересылаете сообщения???`, {
                reply_parameters: { message_id: ctx.message.message_id },
            });
            throw new Error('Forwared voice message');
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

        const chatId = ctx.user.chats.find((chat) => chat.chatId === ctx.chat?.id)?.id;
        if (!chatId) {
            throw new Error();
        }
        if (duration === undefined || fileId === undefined || fileUniqueId === undefined) {
            return;
        }

        await this.voiceService.create(duration, fileId, fileUniqueId, fileSize, ctx.user, chatId);
        if (ctx.isOutDatedMessage) {
            throw new Error('Message is out dated');
        }
        const totalVoices = await this.voiceService.getUserVoicesCount(ctx.user, ctx.chat.id);
        const now = new Date();
        const start = new Date(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`);
        const end = new Date(start);
        end.setHours(23);
        end.setMinutes(59);
        end.setSeconds(59);
        const todaysVoices = await this.voiceService.getUserVoicesCount(ctx.user, ctx.chat.id, { start, end });

        let voicesAlias = null;

        for (const key in VoiceSenderAliasByCount) {
            const number = VoiceSenderAliasByCount[key];
            if (todaysVoices > number) {
                voicesAlias = key;
            }
        }

        await ctx.reply(
            `Ваше общее количество голосовых сообщений: ${totalVoices}\n\nСегодня вы отправили ${todaysVoices}, это ${((todaysVoices / totalVoices) * 100).toFixed(2)}% от общего числа\n\nВы ${voicesAlias}\n\n`,
            { reply_parameters: { message_id: ctx.message.message_id } },
        );
    }
}
