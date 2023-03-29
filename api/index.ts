import { VercelRequest, VercelResponse } from '@vercel/node';

import { useWebhook } from '../src/lib/telegram';

// main function
export default async function handle(req: VercelRequest, res: VercelResponse) {
	try {
		await useWebhook(req, res);
	} catch (e: any) {
		res.statusCode = 500;
		res.json(e.message);
	}
}

// import { startVercel } from '../src';

// export default async function handle(req: VercelRequest, res: VercelResponse) {
// 	try {
// 		// await startVercel(req, res);
// 	} catch (e: any) {
// 		res.statusCode = 500;
// 		res.setHeader('Content-Type', 'text/html');
// 		res.end('<h1>Server Error</h1><p>Sorry, there was a problem</p>');
// 		console.error(e.message);
// 	}
// }
