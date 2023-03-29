import { VercelRequest, VercelResponse } from '@vercel/node';
import { Telegraf, Context as TelegrafContext } from 'telegraf';
// import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import { about, sendkey } from '../commands';
import { greeting } from '../text';

// import { development, production } from "../core";

// 公共变量
const TCKEY = process.env.TCKEY || '';
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';
const VERCEL_URL = process.env.VERCEL_URL;

const md5 = require('md5');

import axios from 'axios';

import { ok } from './responses';

const debug = require('debug')('lib:telegram');
const isDev = ENVIRONMENT == 'development';

export const bot = new Telegraf(BOT_TOKEN);

function botUtils() {
	bot.use(Telegraf.log());
	bot.use(logger);
	bot.command('about', about()).command('sendkey', sendkey());
	bot.on('message', greeting());
}

async function localBot() {
	debug('Bot is running in development mode at http://localhost:3000');

	const botInfo = await bot.telegram.getMe();
	// bot.options.username = botInfo.username;

	console.info('Server has initialized bot username: ', botInfo.username);

	debug(`deleting webhook`);
	await bot.telegram.deleteWebhook();

	debug(`starting polling`);
	await bot.launch();
}

export async function useWebhook(req: VercelRequest, res: VercelResponse) {
	if (req.url?.substring(0, 9) == '/api/send') {
		const text = req.query?.text || req.body?.text || '';
		const sendkey = req.query?.sendkey || req.body?.sendkey || '';
		const desp = req.query?.desp || req.body?.desp || '';
		const markdown = req.query?.markdown || req.body?.markdown || '';

		if (text == '' || sendkey == '') {
			throw new Error('text & sendkey cannot be empty');
		} else {
			const key_info: String[] = String(sendkey).split('T');

			if (key_info[1] != md5(TCKEY + key_info[0])) {
				throw new Error('sendkey error');
			} else {
				var params = new URLSearchParams();
				params.append('chat_id', String(key_info[0]));
				let content = String(text) + '\n\n' + String(desp);
				if (markdown != '') {
					content += String(markdown);
					params.append('parse_mode', 'MarkdownV2');
				}

				params.append('text', content);

				const ret = await axios.post(
					'https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage',
					params,
				);
				res.status(200).json(ret.data);
			}
		}
	}

	try {
		if (!isDev && !VERCEL_URL) {
			throw new Error('VERCEL_URL is not set.');
		}

		const getWebhookInfo = await bot.telegram.getWebhookInfo();

		const botInfo = await bot.telegram.getMe();
		// bot.options.username = botInfo.username;
		console.info(
			'Server has initialized bot username using Webhook. ',
			botInfo.username,
		);

		if (getWebhookInfo.url !== VERCEL_URL + '/api') {
			debug(`deleting webhook`);
			await bot.telegram.deleteWebhook();
			debug(`setting webhook to ${VERCEL_URL}/api`);
			await bot.telegram.setWebhook(`${VERCEL_URL}/api`);
		}

		// call bot commands and middlware
		botUtils();

		if (req.method === 'POST') {
			await bot.handleUpdate(req.body, res);
		} else {
			ok(res, 'Listening to bot events...');
		}
	} catch (error) {
		console.error(error);
		return error || '';
	}
}

export const hiddenCharacter = '\u200b';

export const logger = async (
	_: TelegrafContext,
	next: Function,
): Promise<void> => {
	const start = new Date();
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	await next();
	const ms = new Date().getTime() - start.getTime();
	console.log('Response time: %sms', ms);
};

if (isDev) {
	console.log('isDev', isDev);

	localBot().then(() => {
		// call bot commands and middlware
		botUtils();

		// launch bot
		bot.launch();
	});
}
