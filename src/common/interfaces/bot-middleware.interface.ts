import { MiddlewareFn } from 'grammy';
import { CustomContext } from '../types/custom-context.type';

export default interface IBotMiddleware {
    middleware: MiddlewareFn<CustomContext>;
}
