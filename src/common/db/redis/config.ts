import envUtil from '../../utils/env.util';

export default class RedisConfig {
    get configURL() {
        const host = envUtil.extractString('REDIS_HOST');
        const port = envUtil.extractString('REDIS_PORT');
        const dbNumber = envUtil.extractInt('REDIS_DB');
        return `redis://@${host}:${port}/${dbNumber}`;
    }
}
