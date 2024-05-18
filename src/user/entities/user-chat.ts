import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import UserEntity from './user.entity';
import UserVoiceEntity from './user-voice';

@Entity({ name: 'users_chats' })
export default class UserChatEntity {
    @PrimaryGeneratedColumn({ name: 'id' })
    id: number;

    @Column({ name: 'chat_id' })
    chatId: number;

    @Column({ name: 'is_private' })
    isPrivate: boolean;

    @Column({ name: 'title' })
    title: string;

    @Column({ name: 'user_id' })
    userId: number;

    @Column({ name: 'messages_count' })
    messagesCount: number;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @OneToMany(() => UserVoiceEntity, (_: UserVoiceEntity) => _.chat)
    voices: UserVoiceEntity[];
}
