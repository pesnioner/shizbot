import MessageEntity from '../../../message/entities/message.entity';
import MessageService from '../../../message/services/message.service';
import Db from '../../db/db';
import IBotHandler from '../../interfaces/bot-handler.interface';
import { CustomContext } from '../../types/custom-context.type';

export default class ChatTopMessagesCommandHandler implements IBotHandler {
    private readonly messageService: MessageService;

    constructor() {
        const ds = Db.getDataSource();
        this.messageService = new MessageService(ds.getRepository(MessageEntity));
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

        const top = await this.messageService.countMessagesByTgChat(ctx.chat.id);
        const message = `Топ спамеров:\n`;
        await ctx.api.sendMessage(
            ctx.chat.id,
            top.reduce((acc, curr) => {
                if (!curr) {
                    return acc;
                }
                return `${acc}<a href="t.me/${curr.username}">${curr.firstName}</a> - ${curr.amount || 0} сообщений\n`;
            }, message),
            { parse_mode: 'HTML', link_preview_options: { is_disabled: true } },
        );
    }
}
