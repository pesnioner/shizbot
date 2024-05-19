import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class UpdateChatsMessagesAddChatFk1716114187940 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createForeignKey(
            'chats_messages',
            new TableForeignKey({
                name: 'messages_chat_fk',
                columnNames: ['chat_id'],
                referencedTableName: 'users_chats',
                referencedColumnNames: ['id'],
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('chats_messages', 'messages_chat_fk');
    }
}
