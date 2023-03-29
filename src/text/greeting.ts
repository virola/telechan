import { Context } from 'telegraf';
import createDebug from 'debug';

const debug = createDebug('bot:greeting_text');

const replyToMessage = (ctx: Context, messageId: number, string: string) =>
	ctx.reply(string, {
		reply_to_message_id: messageId,
	});

const greeting = () => async (ctx: Context) => {
	debug('Triggered "greeting" text command');

	const messageId = ctx.message?.message_id;
	const userName = ctx.from?.last_name
		? `${ctx.from.first_name} ${ctx.from.last_name}`
		: ctx.from?.first_name;

	if (messageId) {
		await replyToMessage(
			ctx,
			messageId,
			`Hello, ${userName}! Welcome to TeleChan, type /sendkey to get your sendkey and api url`,
		);
	}
};

export { greeting };
