import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsers1715940770651 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'users',
                columns: [
                    { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                    { name: 'tg_id', type: 'int8', isUnique: true, isNullable: false },
                    { name: 'tg_first_name', type: 'varchar', isNullable: true },
                    { name: 'tg_username', type: 'varchar', isNullable: true },
                    { name: 'internal_alias', type: 'varchar', isNullable: true },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('users');
    }
}
