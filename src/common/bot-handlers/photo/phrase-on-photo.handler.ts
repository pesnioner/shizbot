import IBotHandler from '../../interfaces/bot-handler.interface';
import { photoReactions } from '../../list/photo-reactions.list';
import { CustomContext } from '../../types/custom-context.type';

export default class PhraseOnPhotoBotHandler implements IBotHandler {
    async process(ctx: CustomContext): Promise<void> {
        if (!ctx.message) {
            throw new Error('Photo handler without message body');
        }
        if (!ctx.message.photo) {
            throw new Error('Photo handler without photo prop');
        }

        if (ctx.isOutDatedMessage) {
            throw new Error('Message is out dated');
        }

        const index = Math.floor(Math.random() * photoReactions.length);
        await ctx.reply(photoReactions[index], { reply_parameters: { message_id: ctx.message.message_id } });
    }
}
