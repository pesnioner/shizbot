import { Bot } from 'grammy';
import envUtil from './common/utils/env.util';
import * as dotenv from 'dotenv';
import Db from './common/db/db';
import BotHandlersBinder from './common/bot-handlers/handlers-binder';
import { BotCommandsEnum } from './common/enum/bot-commands.enum';

dotenv.config();

const bot = new Bot(envUtil.extractString('BOT_TOKEN'));

bot.api.setMyCommands(Object.values(BotCommandsEnum).map((command) => ({ command, description: 'Не придумал' })));

const ds = Db.getDataSource();
ds.initialize()
    .then(() => new BotHandlersBinder(bot).bind())
    .then(() => bot.start());
