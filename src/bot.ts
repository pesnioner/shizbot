import { Bot } from 'grammy';
import envUtil from './common/utils/env.util';
import * as dotenv from 'dotenv';
import Db from './common/db/db';

dotenv.config();

const bot = new Bot(envUtil.extractString('BOT_TOKEN'));

const ds = Db.getDataSource();
ds.initialize().then(() => bot.start());

// bot.command('start', (ctx) => console.log(JSON.stringify(ctx)));

// bot.on('message:voice', (ctx) => {
//     const isAnyVoiceSended = voiceCounter.get(ctx.from.id.toString());
//     let counter = isAnyVoiceSended || 0;
//     ++counter;

//     bot.api.sendMessage(ctx.chat.id, 'Не могу послушать, это важно?');
//     if (counter > 3) {
//         bot.api.sendMessage(ctx.chat.id, `Это уже твое ${counter}е сообщение чертила, лимит исчерпан`);
//     }
//     voiceCounter.set(ctx.from.id.toString(), counter);
//     console.log(voiceCounter);
//     let csvString = '';
//     voiceCounter.forEach((value, key) => {
//         csvString += `${key},${value}\n`;
//     });
//     writeFile('voices.csv', csvString);
// });

// bot.on('message', (ctx) => {
//     if (ctx.message.text?.toLowerCase()?.includes('темка')) {
//         bot.api.sendMessage(ctx.chat.id, 'Куда ты лезешь, оно тебя сожрет');
//     }
//     if (ctx.message.photo) {
//         ctx.reply('Ясно, хуета, давай по новой');
//     }
//     console.log('Message\n', JSON.stringify(ctx));
// });

// bot.on(':media', (ctx) => {
//     ctx.reply('Ясно, хуета, давай по новой');
//     bot.api.sendMessage(ctx.chat.id, 'Абоба');
// });

// bot.start();
// readCsv();

// async function readCsv() {
//     const data = (await readFile('voices.csv')).toString();
//     data.split('\n').forEach((row) => {
//         const _row = row.split(',');
//         console.log(_row);
//         if (_row[0]) {
//             voiceCounter.set(_row[0], Number(_row[1]));
//         }
//     });
//     console.log(voiceCounter);
// }
