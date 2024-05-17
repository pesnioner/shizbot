import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersVoices1715941788971 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'users_voices',
                columns: [
                    { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                    { name: 'duration', type: 'int', isNullable: false },
                    { name: 'file_id', type: 'varchar', isNullable: false, isUnique: true },
                    { name: 'file_unique_id', type: 'varchar', isNullable: false, isUnique: true },
                    { name: 'file_size', type: 'int', isNullable: false },
                    { name: 'user_id', type: 'int', isNullable: false },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('users_voices');
    }
}
