import VoiceEntity from '../../../voice/entities/user-voice.entity';
import VoiceService from '../../../voice/services/voice.service';
import Db from '../../db/db';
import IBotHandler from '../../interfaces/bot-handler.interface';
import { CustomContext } from '../../types/custom-context.type';
import datetimeUtil from '../../utils/datetime.util';

export default class OwnVoicesLengthCommandHandler implements IBotHandler {
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

        if (ctx.isOutDatedMessage) {
            throw new Error('Message is out dated');
        }

        const now = new Date();
        const start = new Date(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`);
        const end = new Date(start);
        end.setHours(23);
        end.setMinutes(59);
        end.setSeconds(59);

        const totalUserVoicesLength = await this.voiceService.getUsersVoicesLength(ctx.user, ctx.chat.id);
        const todayUserVoicesLength = await this.voiceService.getUsersVoicesLength(ctx.user, ctx.chat.id, {
            start,
            end,
        });

        const totalChatVoicesLength = await this.voiceService.getChatTotalVoicesDuration(ctx.chat.id);

        const totalDurationMessage = `Общеем время голосовых сообщений: ${datetimeUtil.parseSecondsIntoTimeString(totalUserVoicesLength)}`;
        const todayDurationMessage = `Длительность голосовых сообщений за сегодня: ${datetimeUtil.parseSecondsIntoTimeString(todayUserVoicesLength)}`;

        const partOfTotal = `Процент всех гс от общей длительности по чату: ${Math.round((totalUserVoicesLength / totalChatVoicesLength) * 100)}`;

        const message = `${totalDurationMessage}\n${todayDurationMessage}\n\n${totalChatVoicesLength ? partOfTotal : ''}`;

        await ctx.reply(message, {
            reply_parameters: { message_id: ctx.message.message_id },
        });
    }
}
