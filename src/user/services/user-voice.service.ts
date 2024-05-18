import { Repository } from 'typeorm';
import UserVoiceEntity from '../entities/user-voice';
import UserEntity from '../entities/user.entity';

export default class UserVoiceService {
    constructor(private readonly userVoiceService: Repository<UserVoiceEntity>) {}

    create(
        duration: number,
        fileId: string,
        fileUniqueId: string,
        fileSize: number | undefined,
        user: UserEntity,
        chatId: number,
    ): Promise<UserVoiceEntity> {
        return this.userVoiceService.save(
            this.userVoiceService.create({ duration, fileId, fileUniqueId, fileSize, userId: user.id, chatId }),
        );
    }

    async getUsersVoicesLength(
        user: UserEntity,
        chatId: number,
        timeFrame?: { start: Date; end: Date },
    ): Promise<number> {
        const builder = await this.userVoiceService
            .createQueryBuilder('voices')
            .select(['voices.chatId'])
            .addSelect('sum(voices.duration) as length')
            .leftJoin('voices.chat', 'chats')
            .where('chats.chatId = :chatId and voices.userId = :userId', { chatId, userId: user.id })
            .groupBy('voices.chatId');

        if (timeFrame) {
            builder.andWhere('voices.createdAt between :start and :end', { ...timeFrame });
        }

        const stmt = await builder.getRawOne();
        if (!stmt) {
            return 0;
        }
        return stmt.length;
    }

    async getTopVoicesLengthByChat(
        tgChatId: number,
        timeFrame?: { start: Date; end: Date },
    ): Promise<Map<number, number>> {
        const builder = await this.userVoiceService
            .createQueryBuilder('voices')
            .select(['voices.userId as user_id'])
            .addSelect('sum(voices.duration) as length')
            .leftJoin('voices.chat', 'chats')
            .where('chats.chatId = :chatId', { chatId: tgChatId })
            .orderBy('length', 'DESC')
            .groupBy('voices.userId');

        if (timeFrame) {
            builder.andWhere('voices.createdAt between :start and :end', { ...timeFrame });
        }

        const stmt = await builder.getRawMany();
        const result = new Map();
        if (stmt) {
            stmt.forEach((row) => result.set(row.user_id, row.length));
        }
        return result;
    }

    async getUserVoicesCount(user: UserEntity, tgChatId: number, timeFrame?: { start: Date; end: Date }) {
        const builder = await this.userVoiceService
            .createQueryBuilder('voices')
            .select(['voices.chatId'])
            .addSelect('count(voices.id) as cnt')
            .leftJoin('voices.chat', 'chats')
            .where('chats.chatId = :chatId and voices.userId = :userId', { chatId: tgChatId, userId: user.id })
            .groupBy('voices.chatId');

        if (timeFrame) {
            builder.andWhere('voices.createdAt between :start and :end', { ...timeFrame });
        }

        const stmt = await builder.getRawOne();
        if (!stmt) {
            return 0;
        }
        return stmt.cnt;
    }
}
