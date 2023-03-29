import { Context } from 'telegraf';
import createDebug from 'debug';
import { author, homepage, name, version } from '../../package.json';

const debug = createDebug('bot:about_command');

const about = () => async (ctx: Context) => {
	const message = `*${name} ${version}*\n${author}\n${homepage}`;
	debug(`Triggered "about" command with message \n${message}`);

	await ctx.replyWithMarkdownV2(message, { parse_mode: 'Markdown' });
	// return ctx.replyWithMarkdown(message);
};

export { about };
