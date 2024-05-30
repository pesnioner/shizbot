import { Context } from 'grammy';
import UserEntity from '../../user/entities/user.entity';

type CustomContext = Context & { user: UserEntity; isOutDatedMessage?: boolean };

export { CustomContext };
