import * as path from 'path';
import { DataSourceOptions } from 'typeorm';
import envUtil from '../utils/env.util';
import UserEntity from '../../user/entities/user.entity';
import UserVoiceEntity from '../../user/entities/user-voice';

export default class DataSourceOptionsGenerator {
    private _options: DataSourceOptions;

    constructor() {
        this._options = {
            type: 'postgres',
            host: envUtil.extractString('DB_HOST'),
            port: envUtil.extractInt('DB_PORT'),
            database: envUtil.extractString('DB_NAME'),
            username: envUtil.extractString('DB_USER'),
            password: envUtil.extractString('DB_PASSWORD'),
            migrationsRun: true,
            migrationsTableName: 'migrations',
            migrations: [path.resolve(__dirname, 'migrations', '*.{ts,js}')],
            entities: [UserEntity, UserVoiceEntity],
            logging: 'all',
            synchronize: false,
        };
    }

    get options(): DataSourceOptions {
        return this._options;
    }
}
