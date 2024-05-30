import ChatEntity from '../../../chat/entities/chat.entity';
import ChatService from '../../../chat/services/chat.service';
import MessageEntity from '../../../message/entities/message.entity';
import MessageService from '../../../message/services/message.service';
import VoiceEntity from '../../../voice/entities/user-voice.entity';
import VoiceService from '../../../voice/services/voice.service';
import Db from '../../db/db';
import IBotHandler from '../../interfaces/bot-handler.interface';
import { CustomContext } from '../../types/custom-context.type';

export default class OwnMessagesCountCommandHandler implements IBotHandler {
    private readonly chatService: ChatService;
    private readonly messageService: MessageService;

    constructor() {
        const ds = Db.getDataSource();
        this.chatService = new ChatService(ds.getRepository(ChatEntity));
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

        let chat = ctx.user.chats.find((_chat) => _chat.chatId === ctx.chat?.id);
        if (!chat) {
            const isChatExists = await this.chatService.getChatByTelegramId(ctx.chat.id);
            if (!isChatExists) {
                throw new Error(`Chat doesn't exists`);
            }
            chat = isChatExists;
        }
        let messagesToday = await this.messageService.getMessageByChat(chat, new Date());
        if (!messagesToday) {
            messagesToday = await this.messageService.create(chat, new Date());
        }
        const totalMessages = await this.messageService.getTotalMessagesCountByChat(chat);
        const response = `Общее количество сообщений: ${totalMessages}\nСообщений за сегодня: ${messagesToday.messagesCount}`;
        await ctx.reply(response, { reply_parameters: { message_id: ctx.message?.message_id } });
    }
}
