import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class UpdateUsersVoicesAddChatFk1716027580786 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createForeignKey(
            'users_voices',
            new TableForeignKey({
                name: 'chat_fk',
                columnNames: ['chat_id'],
                referencedTableName: 'users_chats',
                referencedColumnNames: ['id'],
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('users_voices', 'chat_fk');
    }
}
