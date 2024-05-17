import { Bot } from 'grammy';
import envUtil from './common/utils/env.util';
import * as dotenv from 'dotenv';
import Db from './common/db/db';
import BotHandlersBinder from './common/bot-handlers/handlers-binder';

dotenv.config();

const bot = new Bot(envUtil.extractString('BOT_TOKEN'));

const ds = Db.getDataSource();
ds.initialize()
    .then(() => new BotHandlersBinder(bot).bind())
    .then(() => bot.start());
