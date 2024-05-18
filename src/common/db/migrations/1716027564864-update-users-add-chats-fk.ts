import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class UpdateUsersAddChatsFk1716027564864 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createForeignKey(
            'users_chats',
            new TableForeignKey({
                name: 'chat_user_fk',
                columnNames: ['user_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('users_chats', 'chat_user_fk');
    }
}
