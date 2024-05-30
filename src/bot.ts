import { Bot } from 'grammy';
import envUtil from './common/utils/env.util';
import * as dotenv from 'dotenv';
import Db from './common/db/db';
import BotHandlersBinder from './common/bot-handlers/handlers-binder';
import { BotCommandsEnum } from './common/enum/bot-commands.enum';
import Redis from './common/db/redis/redis';
import { CustomContext } from './common/types/custom-context.type';

dotenv.config();

const bot = new Bot<CustomContext>(envUtil.extractString('BOT_TOKEN'));

const ds = Db.getDataSource();
const redisCLient = Redis.getRedisConnection();
ds.initialize()
    .then(() => redisCLient.connect())
    .then(() => redisCLient.ping())
    .then((data) => console.log(data))
    .then(() => bot.api.getMyCommands())
    .then((commands) => {
        if (!commands.length || commands.length !== Object.keys(BotCommandsEnum).length) {
            return bot.api.setMyCommands([
                {
                    command: BotCommandsEnum.COUNT_MESSAGES,
                    description: 'Количество отправленных сообщений за все время и за сегодня',
                },
                {
                    command: BotCommandsEnum.OWN_VOICES_LENGTH,
                    description: 'Длительность голосовых сообщений в секундах за сегодня и все время',
                },
                {
                    command: BotCommandsEnum.TOP_MESSAGES,
                    description: 'Список пользователей с наибольшим количеством отправленных сообщений',
                },
                {
                    command: BotCommandsEnum.TOP_VOICES,
                    description:
                        'Список пользователей с самой большой общей длительностью голосовых сообщений за все время',
                },
                {
                    command: BotCommandsEnum.TOP_VOICES_TODAY,
                    description:
                        'Список пользователей с самой большой общей длительностью голосовых сообщений за сегодня',
                },
            ]);
        }
        return Promise.resolve(null);
    })
    .then(() => new BotHandlersBinder(bot).bind())
    .then(() => bot.start());
