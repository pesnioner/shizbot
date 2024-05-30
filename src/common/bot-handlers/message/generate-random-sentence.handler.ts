import PhraseService from '../../../phrase/phrase.service';
import Redis from '../../db/redis/redis';
import IBotHandler from '../../interfaces/bot-handler.interface';
import { CustomContext } from '../../types/custom-context.type';

export default class GenerateRandomSentenceBotHandler implements IBotHandler {
    private readonly phraseService: PhraseService;

    constructor() {
        this.phraseService = new PhraseService(Redis.getRedisConnection());
    }

    async process(ctx: CustomContext): Promise<void> {
        if (!ctx.message) {
            throw new Error('Voice handler without message body');
        }
        if (!ctx.message.chat || !ctx.chat || !ctx.message.text) {
            throw new Error('Voice handler without chat properties');
        }

        if (ctx.isOutDatedMessage) {
            throw new Error('Message is out dated');
        }

        const phrase = await (this.isContextNeeded(ctx.message.text)
            ? this.phraseService.generateSentence(this.getContext(ctx.message.text))
            : this.phraseService.getRandomSentence());

        if (!phrase) {
            throw new Error('Не удалось сгенерировать фразу');
        }

        await ctx.reply(phrase, { reply_parameters: { message_id: ctx.message.message_id } });
    }

    private isContextNeeded(message: string): boolean {
        return !/шиз/gi.test(message);
    }

    private getContext(message: string): string {
        const words = this.phraseService.extractWords(message);
        const initialWordIndex = Math.floor(Math.random() * (words.length - 1));
        let context = words[initialWordIndex];
        if (words.length > 1) {
            if (initialWordIndex === words.length - 1) {
                context = `${words[initialWordIndex - 1]} ${context}`;
            } else {
                context += ` ${words[initialWordIndex + 1]}`;
            }
        }
        return context;
    }
}
