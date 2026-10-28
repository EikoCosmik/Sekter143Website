import express from 'express';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { adminPage } from './srcTemplates/adminPage.js';

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static('dist', { extensions: ['html'] }));
app.set("trust proxy", true);
try { process.loadEnvFile() } catch { };

app.use((req, res, next) =>
{
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Origin', 'https://sekter143.com/');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	if (req.method === 'OPTIONS')
	{
		return res.sendStatus(204);
	}

	next();
});

app.listen(port, () => 
{
	console.log(`Running on port ${port}`);
});

app.post('/api/guestbookAdd', async (req, res) =>
{
	const receivedData = req.body;

	const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

	const rtn = await supabase.functions.invoke('sign-guestbook', {
		body: {
			...receivedData
		},
	});

	const sts = rtn.response.status;

	if (sts != 200)
	{
		return res.status(400).json({
			title: `Server Error (${sts}):`,
			message: `${responce.error}`,
			color: "redElement"
		});
	}
	else if (sts == 200)
	{
		return res.status(200).json({
			title: "Message Sent! ",
			message: 'Thank you for leaving a message 🩵',
			color: "greenElement"
		});
	}
	return res.status(500).json({
		title: `Unknown Error: ${sts}`,
		message: `I have no idea?`,
		color: "yellowElement"
	});
});

app.get('/api/guestbookGet', async (req, res) =>
{
	const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
	const rtn = await supabase.functions.invoke('get-guestbook', {});
	const sts = rtn.response.status;

	if (sts != 200)
	{
		return res.status(400).json({ sts: sts });
	}
	else if (sts == 200)
	{
		return res.status(200).json({ sts: sts, responces: rtn });
	}
	return res.status(500).json({ sts: sts });
});

app.post('/api/commentAdd', async (req, res) =>
{
	const receivedData = req.body;

	const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

	const rtn = await supabase.functions.invoke('addComment', {
		body: {
			...receivedData
		},
	});

	const sts = rtn.response.status;
	console.log(rtn.response)

	if (sts != 200)
	{
		return res.status(400).json({
			title: `Server Error (${sts}):`,
			message: `${sts}`,
			color: "redElement"
		});
	}
	else if (sts == 200)
	{
		return res.status(200).json({
			title: "Message Sent! ",
			message: 'Thank you for leaving a message 🩵',
			color: "greenElement"
		});
	}
	return res.status(500).json({
		title: `Unknown Error: ${sts}`,
		message: `I have no idea?`,
		color: "yellowElement"
	});
});

app.post('/api/commentGet', async (req, res) =>
{
	const receivedData = req.body;


	const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
	const rtn = await supabase.functions.invoke('get-comment', {
		body: {
			...receivedData
		},
	});
	const sts = rtn.response.status;

	if (sts != 200)
	{
		return res.status(400).json({ sts: sts });
	}
	else if (sts == 200)
	{
		return res.status(200).json({ sts: sts, responces: rtn });
	}
	return res.status(500).json({ sts: sts });
});

app.post('/api/welcomeHomeEikoLogin', async (req, res) =>
{
	const receivedData = req.body;
	if (receivedData.username == process.env.WELCOME_HOME_EIKO_USR && receivedData.password == process.env.WELCOME_HOME_EIKO_PSD) return res.status(200).json({ html: adminPage() });
	else return res.status(403).json({ html: `<div>Denied</div>` });
});

app.post('/api/adminRespond', async (req, res) =>
{
	const receivedData = req.body;

	const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

	const rtn = await supabase.functions.invoke('adminResponces', {
		body: {
			...receivedData
		},
	});

	const sts = rtn.response.status;

	if (sts != 200)
	{
		return res.status(400).json({
			title: `Server Error (${sts}):`,
			message: `${sts}`,
			color: "redElement"
		});
	}
	else if (sts == 200)
	{
		return res.status(200).json({
			title: "Message Sent! ",
			message: 'Thank you for leaving a message 🩵',
			color: "greenElement"
		});
	}
	return res.status(500).json({
		title: `Unknown Error: ${555}`,
		message: `I have no idea?`,
		color: "yellowElement"
	});
});

app.post('/api/adminDelete', async (req, res) =>
{
	const receivedData = req.body;

	const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

	const rtn = await supabase.functions.invoke('adminDelete', {
		body: {
			...receivedData
		},
	});

	const sts = rtn.response.status;

	if (sts != 200)
	{
		return res.status(400).json({
			title: `Server Error (${sts}):`,
			message: `${sts}`,
			color: "redElement"
		});
	}
	else if (sts == 200)
	{
		return res.status(200).json({
			title: "Message Deleted",
			message: 'Message Deleted',
			color: "greenElement"
		});
	}
	return res.status(500).json({
		title: `Unknown Error: ${555}`,
		message: `I have no idea?`,
		color: "yellowElement"
	});
});