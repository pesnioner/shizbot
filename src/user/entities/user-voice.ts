import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import UserEntity from './user.entity';
import UserChatEntity from './user-chat';

@Entity({ name: 'users_voices' })
export default class UserVoiceEntity {
    @PrimaryGeneratedColumn({ name: 'id' })
    id: number;

    @Column({ name: 'duration' })
    duration: number;

    @Column({ name: 'file_id' })
    fileId: string;

    @Column({ name: 'file_unique_id' })
    fileUniqueId: string;

    @Column({ name: 'file_size' })
    fileSize: number;

    @Column({ name: 'user_id' })
    userId: number;

    @Column({ name: 'chat_id' })
    chatId: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    // todo add createdAt
    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @ManyToOne(() => UserChatEntity)
    @JoinColumn({ name: 'chat_id' })
    chat: UserChatEntity;
}
