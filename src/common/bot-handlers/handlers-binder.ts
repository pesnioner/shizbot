import { Bot } from 'grammy';
import UserService from '../../user/services/user.service';
import Db from '../db/db';
import UserEntity from '../../user/entities/user.entity';
import UserVoiceService from '../../user/services/user-voice.service';
import UserVoiceEntity from '../../user/entities/user-voice';

export default class BotHandlersBinder {
    private userService: UserService;
    private userVoiceService: UserVoiceService;

    constructor(private readonly _bot: Bot) {
        const ds = Db.getDataSource();
        this.userService = new UserService(ds.getRepository(UserEntity));
        this.userVoiceService = new UserVoiceService(ds.getRepository(UserVoiceEntity));
    }

    async bind() {
        this._bot.on('message', async (ctx) => {
            if (ctx.from.is_bot) {
                return;
            }
            let user = await this.userService.findOneByTgId(ctx.from.id);
            if (!user) {
                user = await this.userService.createFromTgProfile(ctx.from.id, ctx.from.first_name, ctx.from.username);
            }
            if (ctx.message.text?.toLowerCase()?.includes('темка')) {
                this._bot.api.sendMessage(ctx.chat.id, 'Куда ты лезешь, оно тебя сожрет');
            }
            if (ctx.message.photo) {
                const randomNumber = Math.random();
                if (randomNumber > 0.5) {
                    ctx.reply('Ясно, хуета, давай по новой');
                } else {
                    ctx.reply('Вот это богоугодная хуйня, красава');
                }
            }
            if (ctx.message.voice) {
                const _voice = ctx.message.voice;
                await this.userVoiceService.create(
                    _voice.duration,
                    _voice.file_id,
                    _voice.file_unique_id,
                    _voice.file_size,
                    user,
                );
                if (user.voices && user.voices?.length + 1 >= 3) {
                    this._bot.api.sendMessage(
                        ctx.chat.id,
                        `Это уже твое ${user.voices.length + 1}е сообщение чертила, лимит исчерпан`,
                    );
                } else {
                    this._bot.api.sendMessage(ctx.chat.id, 'Не могу послушать, это важно?');
                }
            }
            if (ctx.message.text === '/voices_length') {
                const voices = await this.userVoiceService.getUsersVoicesLength(user);
                const length = voices.reduce((acc, curr) => acc + curr.duration, 0);
                this._bot.api.sendMessage(
                    ctx.chat.id,
                    length > 180
                        ? `Вы наговорили на ${length} секунд`
                        : `Общая длительность сообщений ${length} секунд. Вам 8 лет строгача`,
                );
            }
            console.log('Message\n', JSON.stringify(ctx));
        });
    }
}
