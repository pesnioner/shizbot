import { Repository } from 'typeorm';
import UserEntity from '../entities/user.entity';

export default class UserService {
    constructor(private readonly userRepository: Repository<UserEntity>) {}

    findOneByTgId(tgId: UserEntity['tgId']) {
        return this.userRepository.findOne({ where: { tgId }, relations: { voices: true, chats: true } });
    }

    createFromTgProfile(tgId: number, tgFirstName: string, tgUsername?: string): Promise<UserEntity> {
        return this.userRepository.save(this.userRepository.create({ tgId, tgFirstName, tgUsername }));
    }

    findById(id: number) {
        return this.userRepository.findOne({ where: { id } });
    }
}
