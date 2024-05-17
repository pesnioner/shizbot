import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class CreateUsersAndVoicesFk1715941954538 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createForeignKey(
            'users_voices',
            new TableForeignKey({
                name: 'user_fk',
                columnNames: ['user_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('users_voices', 'user_fk');
    }
}
