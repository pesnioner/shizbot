import { Bot } from 'grammy';
import envUtil from './common/utils/env.util';
import * as dotenv from 'dotenv';
import Db from './common/db/db';
import BotHandlersBinder from './common/bot-handlers/handlers-binder';
import { BotCommandsEnum } from './common/enum/bot-commands.enum';

dotenv.config();

const bot = new Bot(envUtil.extractString('BOT_TOKEN'));

bot.api.setMyCommands([
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
        description: 'Список пользователей с самой большой общей длительностью голосовых сообщений за все время',
    },
    {
        command: BotCommandsEnum.TOP_VOICES_TODAY,
        description: 'Список пользователей с самой большой общей длительностью голосовых сообщений за сегодня',
    },
]);

const ds = Db.getDataSource();
ds.initialize()
    .then(() => new BotHandlersBinder(bot).bind())
    .then(() => bot.start());
