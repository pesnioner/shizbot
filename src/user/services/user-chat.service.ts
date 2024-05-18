import { Repository } from 'typeorm';
import UserEntity from '../entities/user.entity';
import UserChatEntity from '../entities/user-chat';

export default class UserChatService {
    constructor(private readonly userChatRepository: Repository<UserChatEntity>) {}

    create(chatId: number, title: string | undefined, isPrivate: boolean, user: UserEntity): Promise<UserChatEntity> {
        return this.userChatRepository.save(
            this.userChatRepository.create({ chatId, title, isPrivate, userId: user.id }),
        );
    }

    getCountByChat(user: UserEntity, chatId: number) {
        return this.userChatRepository.findOne({ where: { chatId, userId: user.id } });
    }

    async increaseMessagesCount(user: UserEntity, chatId: number) {
        const chat = await this.getCountByChat(user, chatId);
        if (chat) {
            await this.userChatRepository.update({ id: chat.id }, { messagesCount: chat.messagesCount + 1 });
        }
    }
}
