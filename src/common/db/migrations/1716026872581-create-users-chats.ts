import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersChats1716026872581 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'users_chats',
                columns: [
                    { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                    { name: 'chat_id', type: 'int', isNullable: false },
                    { name: 'is_private', type: 'boolean', isNullable: false },
                    { name: 'title', type: 'varchar', isNullable: true },
                    { name: 'user_id', type: 'int', isNullable: false },
                    { name: 'messages_count', type: 'int', isNullable: false, default: 1 },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('users_voices');
    }
}
