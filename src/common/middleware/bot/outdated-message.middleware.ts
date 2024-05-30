import { NextFunction } from 'grammy';
import IBotMiddleware from '../../interfaces/bot-middleware.interface';
import { CustomContext } from '../../types/custom-context.type';

export default class BotOutDatedMessageMiddleware implements IBotMiddleware {
    private OUT_DATED_TIME_DIFF = 20; // time in seconds

    middleware(ctx: CustomContext, next: NextFunction) {
        if (ctx.message) {
            if (new Date().getTime() / 1000 - ctx.message.date > this.OUT_DATED_TIME_DIFF) {
                ctx.isOutDatedMessage = true;
            }
        }
        return next();
    }
}
