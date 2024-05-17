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
    ): Promise<UserVoiceEntity> {
        return this.userVoiceService.save(
            this.userVoiceService.create({ duration, fileId, fileUniqueId, fileSize, userId: user.id }),
        );
    }

    getUsersVoicesLength(user: UserEntity) {
        return this.userVoiceService.find({ where: { userId: user.id } });
    }
}
