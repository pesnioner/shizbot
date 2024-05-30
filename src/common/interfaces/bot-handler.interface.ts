import { CustomContext } from '../types/custom-context.type';

export default interface IBotHandler {
    process(ctx: CustomContext): Promise<void>;
}
