import { RedisConnectionEnum } from '../../enum/redis-connection.enum';
import envUtil from '../../utils/env.util';

export default class RedisConfig {
    private _dbNumber: number;
    constructor(type: RedisConnectionEnum) {
        this._dbNumber = type;
    }

    get configURL() {
        const host = envUtil.extractString('REDIS_HOST');
        const port = envUtil.extractString('REDIS_PORT');
        const dbNumber = envUtil.extractInt('REDIS_DB');
        return `redis://@${host}:${port}/${this._dbNumber}`;
    }
}
