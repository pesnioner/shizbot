import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import UserVoiceEntity from './user-voice';
import UserChatEntity from './user-chat';

@Entity({ name: 'users' })
export default class UserEntity {
    @PrimaryGeneratedColumn({ name: 'id' })
    id: number;

    @Column({ name: 'tg_id' })
    tgId: number;

    @Column({ name: 'tg_first_name' })
    tgFirstName: string;

    @Column({ name: 'tg_username' })
    tgUsername: string;

    @Column({ name: 'internal_alias' })
    internalAlias: string;

    @OneToMany(() => UserVoiceEntity, (_: UserVoiceEntity) => _.user)
    voices: UserVoiceEntity[];

    @OneToMany(() => UserChatEntity, (_: UserChatEntity) => _.user)
    chats: UserChatEntity[];
}
