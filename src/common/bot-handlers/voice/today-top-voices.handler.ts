import UserEntity from '../../../user/entities/user.entity';
import UserService from '../../../user/services/user.service';
import VoiceEntity from '../../../voice/entities/user-voice.entity';
import VoiceService from '../../../voice/services/voice.service';
import Db from '../../db/db';
import IBotHandler from '../../interfaces/bot-handler.interface';
import { CustomContext } from '../../types/custom-context.type';
import datetimeUtil from '../../utils/datetime.util';

export default class TodayTopVoicesCommandHandler implements IBotHandler {
    private readonly voiceService: VoiceService;
    private readonly userService: UserService;

    constructor() {
        const ds = Db.getDataSource();
        this.voiceService = new VoiceService(ds.getRepository(VoiceEntity));
        this.userService = new UserService(ds.getRepository(UserEntity));
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
        const top = await this.voiceService.getTopVoicesLengthByChat(ctx.chat.id, { start, end });
        if (top.size === 0) {
            await ctx.api.sendMessage(ctx.chat.id, 'Еще нет ни одного зарегистрированного голосовного сообщения');
            throw new Error('Ни одного гс за сегодня');
        }
        const promises: Promise<UserEntity | null>[] = [];
        top.forEach((_, key) => {
            promises.push(this.userService.findById(key));
        });
        const message = `Топ воис абьюзеров за сегодня:\n`;
        const users = await Promise.all(promises);

        await ctx.api.sendMessage(
            ctx.chat.id,
            users.reduce((acc, user) => {
                if (!user) {
                    return acc;
                }
                const length = top.get(user.id);
                return `${acc}<a href="t.me/${user.tgUsername}">${user.tgFirstName}</a> - ${length ? datetimeUtil.parseSecondsIntoTimeString(length) : 0}\n`;
            }, message),
            { parse_mode: 'HTML', link_preview_options: { is_disabled: true } },
        );
    }
}
