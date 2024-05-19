import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateChatsMessages1716114064577 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'chats_messages',
                columns: [
                    { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                    { name: 'chat_id', type: 'int', isNullable: false },
                    { name: 'date', type: 'date', isNullable: false },
                    { name: 'messages_count', type: 'int8', isNullable: false, default: 1 },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('chats_messages');
    }
}
