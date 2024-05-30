import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateUsersAddIsBot1717084316385 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'is_bot',
                type: 'boolean',
                isNullable: false,
                default: false,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('users', 'is_bot');
    }
}
