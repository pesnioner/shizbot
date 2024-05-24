import { RedisClientType, createClient } from 'redis';
import RedisConfig from './config';

export default class Redis {
    private static client: RedisClientType;

    static getRedisConnection() {
        if (!Redis.client) {
            Redis.client = createClient({ url: new RedisConfig().configURL });
        }
        Redis.client.on('error', (error) => console.log('Redis error\t', error));
        return Redis.client;
    }
}
