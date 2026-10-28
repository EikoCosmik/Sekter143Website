import fs from 'node:fs/promises';
import path from 'node:path';
import { htmlWrap } from './srcTemplates/htmlWrap.js';
import { getHeader } from './srcTemplates/siteHeader.js';

const skMds = {};
const distPath = "./dist";
const srcPath = "./src";
const settingsPath = "./srcTemplates";
const postModules = {};
const elementTemplates = {};

let posts = "";
let forms = "";
let badges = [];

async function rebuild()
{
	//Clear Old
	try
	{
   		await fs.rm(distPath, { recursive: true, force: true });
    	await fs.mkdir(distPath, { recursive: true });
	}
	catch (error) { console.error(`Error: ${error.message}`); return; }

	//Setup Vars
	const postsJson = await readF(settingsPath + "/posts.json");
	const unsorted = JSON.parse(postsJson);
	posts = unsorted.sort((a, b) => parseInt(b.date.replace(/[^\w\d]/g, "")) - parseInt(a.date.replace(/[^\w\d]/g, "")));

	const formsJson = await readF(settingsPath + "/forms.json");
	forms = JSON.parse(formsJson);

	const badgesJson = await readF(settingsPath + "/badges.json");
	badges = JSON.parse(badgesJson);
	
	await copyStyles();
	await generateRSS();
	await generatePosts();
	await rebuildHTML();
	await generateAllPosts();

	await copyF("./favicon.ico", distPath +"/favicon.ico");

    console.log(`Site Built!`);
}

// #region ===================================================
// #region =================| Utils |=========================
// #region ===================================================

async function readF(filePath, encoding = "utf8")
{
	try
	{
		const data = await fs.readFile(filePath, encoding);
		return data;
	}
	catch (err)
	{
		console.error('Error Reading File:', err.message);
	}
}

async function writeF(outPath, content, encoding = "utf8")
{
	try
	{
		await fs.writeFile(outPath, content, encoding);
	} 
	catch (err) 
	{
		console.error('Error Writing File:', err.message);
	}
}

function generatePostID(title, date)
{
	const cleanTitle = title.toUpperCase().replace(/[^\w\d]/g, "");
	const cleanDate = date.replace(/[^\w\d]/g, "");
	return "#" + cleanTitle + cleanDate;
}

function generatePhotoID(title, date)
{
	const cleanTitle = title.replace(/[^\w\d]/g, "");
	const cleanDate = date.replace(/[^\w\d]/g, "").slice(2);
	return cleanDate + "_" + cleanTitle;
}

async function copyF(src, destination)
{
	try
	{
    	await fs.copyFile(src, destination);
  	}
	catch (err)
	{
    	console.error('Error copyF:', err.message + src);
  	}
}

async function copyFolder(src, destination)
{
	fs.cp(src, destination, { recursive: true }, (err) =>
	{
		if (err) console.error('Error copyFolder:', err);
	});
}

// #endregion ==============! Utils !=========================

// #region ===================================================
// #region =================| Posts |=========================
// #region ===================================================

function generatePosts()
{
	for (let i = 0; i < posts.length; i++)
    {
    	const post = posts[i];
		if(post.active == false) continue;
		if(!(post.category in postModules)) postModules[post.category] = [];

		let newPost;
		let id; 
		
		if (post.category == "photography")
		{
			id = generatePhotoID(post.title, post.date);
			post.id = id;
			newPost = generatePhotographyItem(post);
		}
		else
		{
			id = generatePostID(post.title, post.date);
			post.id = id;
			newPost = generatePostItem(post);
		}

		createPostPage(newPost, post, id);

		postModules[post.category].push(newPost);
	}
}

function createPostPage(newPost, post, id)
{
	const postBlock = 
	`
	<section id="pageContent">
		${newPost}
		${generateCommentBox(id)}
	</section>
	`

	writeF(distPath + `/${id.replace("#", "")}.html`, flattenString(htmlWrap(getHeader(), "", "", postBlock, { class: `${post.class} postPage` })));
}

function generatePhotographyItem(post)
{
	return flattenString(`
		<div class="image photographyImg ${post.class} ${post.withWarning ? `withWarning` : ""}" id="${post.id}">
			<div class="dateTitle">"${post.title}"<hr />${post.date}<hr /><a class="button small fullPostButton" href="/${post.id}">Full Post</a></div>
			<img src="/assets/images/photography/${post.id}.gif">
			${post.withWarning ? `
			<div class="contentWarning">
				<h2>Content Warning:</h2>
				<div class="warningText">${post.warningText}</div>
				<button class="button" onclick="document.getElementById('${post.id}').classList.remove('withWarning')">I want to see!</button>
			</div>` : ""}
		</div>`);
}

function generatePostItem(post)
{
	return flattenString(`
		<article id="${post.id}" class="standardPost h-entry ${post.class}">
			${(post.image != "") ? `<div class="image u-photo"><img src="${post.image}" /></div>` : ""}
			<h2 class="title p-name">${post.title}</h2>
			<div class="text e-content">${post.content}</div> 
		 	<div class="links">${post.links}<a class="button small fullPostButton" href="/${post.id.slice(1)}">Full Post</a></div>
		 	<div class="date">
		 		<time class="dt-published" datetime="${post.date}">${post.date}</time>
		 	</div>
		 	<a class="u-url" href="https://sekter143.com ${post.permalink} ${post.id}" style="display:none">permalink</a>
		 	<a class="p-category" style="display:none">${post.category}</a>
		 	<a class="p-author h-card" rel="author" style="display:none">EikoCosmik</a>
		</article>`)
}

function generateCommentBox(id)
{
	return `
		<div class="commentBox" id="commentBox${id}">
			<form id="commentForm${id}">
				<div class="cf-turnstile" data-sitekey="0x4AAAAAACyqusEj84ppGLGQ"></div>
				<div id="commentForm${id}_responceBlock" class="" style="display: none;"></div>
				<div class="inputBlock username cyanElement">
					<label for="username">Username:</label>
					<input type="text" id="username" maxlength="128" placeholder="Anonymous?">
				</div>
				<div class="inputBlock message azureElement">
					<label for="message">Leave a kind Message:</label>
					<textarea id="message" maxlength="256" placeholder="Its so nice to hear from you!"></textarea>
				</div>
				<button class="button greenElement" type="button" onclick="db.commentAdd('commentForm${id}')">Submit your message 🩵</button>
			</form>
			<div id="comments${id}" class="comments"></div>
			<script>document.addEventListener("DOMContentLoaded", () => { db.commentUpdate('${id}') });</script>
		</div>
	`
}

// #endregion ==============! Posts !=========================

// #region =================================================
// #region =================| RSS |=========================
// #region =================================================

function generateRSS()
{
	let rssFeed = `
	<?xml version="1.0" encoding="UTF-8"?>
		<rss version="2.0">
			<channel>
				<title>Sekter143</title>
				<link>https://sekter143.com</link>
				<description>Eiko's Sekter143 Site :3</description>
				<language>en-AU</language>
	`;

	for (let i = 0; i < posts.length; i++)
	{
		const post = posts[i];
		rssFeed += generateRSSItem(post.title, post.permalink, post.date, post.description);
	}

	rssFeed += `</channel></rss>`;
	writeF(distPath + "/rss.xml", flattenString(rssFeed));
}

function generateRSSItem(title, permalink, date, description)
{
	return `<item>
			<title>${title}</title>
			<link>${permalink}</link>
			<guid>${generatePostID(title, date)}</guid>
			<pubDate>${date}</pubDate>
			<description>${description}</description>
		</item>`
}

// #endregion ==============! RSS !=========================

// #region ====================================================
// #region =================| Styles |=========================
// #region ====================================================

async function copyStyles()
{
	await fs.mkdir(distPath + "/assets", { recursive: true });
	await copyFolder("./assets/fonts", distPath + "/assets/fonts");
	await copyFolder("./assets/scripts", distPath + "/assets/scripts");
	await copyFolder("./assets/images", distPath + "/assets/images");
	await copyFolder("./assets/kataAssets", distPath + "/assets/kataAssets");
	await fs.mkdir(distPath + "/assets/styles", { recursive: true });
	await copyF("./assets/styles/compiled.css", distPath + "/assets/styles/compiled.css");
}

// #endregion ==============! Styles !=========================

// #region ==================================================
// #region =================| HTML |=========================
// #region ==================================================

async function rebuildHTML()
{
	const all = await fs.readdir(srcPath, { recursive: true, withFileTypes: true });
	const allFiles = all.filter(entry => entry.isFile()).map(entry => [path.join(entry.parentPath, entry.name), entry.name]);

	for (const file of allFiles)
	{
		const content = await readF(file[0]);
		const innerContent = await replaceModules(content);
		const rightColumn = innerContent.match(/<aside column="rightColumn".*?>.*?<\/aside>/g);
		const leftColumn = innerContent.match(/<aside column="leftColumn".*?>.*?<\/aside>/g);
		const newContent = innerContent.match(/<section id="pageContent".*?>.*<\/section>/g);
		const pageSettings = /<pageSettings.*?>(.*)<\/pageSettings>/g.exec(innerContent);
		writeF(distPath + `/${file[1]}`, flattenString(htmlWrap(getHeader(), rightColumn, leftColumn, newContent, parseSettings(pageSettings[1]))));
 	}
}

function parseSettings(settings)
{
	const matches = [...settings.matchAll(/(\w*)="(.*?)"/g)];
	const out = {};

	for (let i = 0; i < matches.length; i++)
	{
		const match = matches[i];
		out[match[1]] = match[2];
	}
	
	return out;
}

function flattenString(string)
{
	return string.replace(/[\n\t\r]/g, "");
}

// #endregion ==============! HTML !=========================

// #region =====================================================
// #region =================| Modules |=========================
// #region =====================================================

function replaceModules(content)
{
	const flat = flattenString(content);

	const result = flat.replace(/<skModule .*?>.*?<\/skModule>/g, (match) =>
	{
		const settings = parseSettings(match);

		return skMds[settings.type](settings);
	});

	return replaceTemplates(result);
}


skMds.posts = (settings) => 
{
	let out = "";
	if (settings.category == "mostRecent") { out += generatePostItem(posts[0]);	return out;	}
	else if (settings.category == "siteUpdates") { out += postModules["siteUpdates"][0]; return out; }
	else if(postModules[settings.category] == null) return "";
	else { for (let i = 0; i < postModules[settings.category].length; i++)	{ out += postModules[settings.category][i];	} return out; }
}

skMds.form = (settings) =>
{
	const formData = forms[settings.formID];
	let out = `<form id="${settings.formID}Form" class="${formData.class} verticalTabs minRows block"><div class="cf-turnstile" data-sitekey="0x4AAAAAACyqusEj84ppGLGQ"></div><div id="${settings.formID}Form_responceBlock" class="" style="display: none;"></div>`
	
	for (let i = 0; i < formData.inputs.length; i++)
	{
		const input = formData.inputs[i];
		let inputString = `<div class="inputBlock ${input.name} ${input.class}"><label for="${input.name}">${input.label}:</label>`;


		if(input.type == "textarea") inputString += `<textarea id="${input.name}"`;
		else if(input.type == "select") inputString += `<select type="${input.type}" id="${input.name}"`;
		else inputString += `<input type="${input.type}" id="${input.name}"`;
		
		Object.entries(input.attributes).forEach(([key, value]) =>
		{
			inputString += ` ${key}="${value}"`
		});

		if(input.type == "textarea") inputString += `></textarea`;
		else if(input.type == "select") 
		{
			inputString += `>`;	

			for (let j = 0; j < input.options.length; j++)
			{
				const option = input.options[j];
				inputString += `<option class="${option.class ?? ""}" value="${option.value ?? ""}">${option.text ?? ""}</option>`;
			}

			inputString += `</select`;
		}
		inputString += `></div>`
		

		out += inputString;
	}

	out += `<button class="button ${formData.button.class}" type="button" onclick="${formData.button.onclick}">${formData.button.text}</button></form>`

	return out;
}

// #endregion ==============! Modules !=========================

// #region =======================================================
// #region =================| Templates |=========================
// #region =======================================================

function replaceTemplates(content)
{
	const result = content.replace(/<sktemplate .*?>.*?<\/sktemplate>/g, (match) =>
	{
		const settings = parseSettings(match);
		return elementTemplates[settings.type](settings);
	});

	return result;
}

elementTemplates.standardSidebar = (module) => `<div class="image"><img src="${module.imgSrc ?? ""}" /></div><div class="text">${module.text ?? ""}</div><div class="links">${module.links ?? ''}</div>`;
elementTemplates.simpleContent = (module) => { return `<article  class="standardPost ${module.class ?? ''}">${(module.imgSrc != null) ?	`<div class="image"><img src="${module.imgSrc}" /></div>` : ``}<h2 class="title">${module.title ?? ""}</h2><div class="text">${module.text ?? ""}</div><div class="links">${module.links ?? ""}</div><div class="date">${module.date ?? ""}</div></article>`;}
elementTemplates.badges = (module) => { if (badges.length == 0) return ""; const amount = (module.amount != null) ? fastClamp(module.amount, 0, badges.length) : badges.length; let badgesElement = `<div class="badgesList">`;	for (let i = 0; i < amount; i++) { const badge = badges[i]; badgesElement += `<a href='${badge.link}'><img src='${badge.img}' alt='${badge.alt}' style='${badge.styles}'></a>` } badgesElement += `</div>`; return badgesElement; }
elementTemplates.inputBlock = (module) => `<div class="inputBlock ${module.class ?? ''}"><label ${(module.id != null) ? `for="${module.id}"` : ""}>${module.label ?? ''}</label><input ${(module.id != null) ? `id="${module.id}"` : ""}${(module.inputType != null) ? `type="${module.inputType}"` : ""}${(module.step != null) ? `step="${module.step}"` : ""}${(module.min != null) ? `min="${module.min}"` : ""}${(module.max != null) ? `max="${module.max}"` : ""}${(module.placeholder != null) ? `placeholder="${module.placeholder}"` : ""}${(module.value != null) ? `value="${module.value}"` : ""}${(module.checked != null) ? `checked="${module.checked}"` : ""}></label></div>`;elementTemplates.loadingSpinner = (module) =>	`<div class="loadingSpinner ${module.class ?? ''}"><div class="spinner"></div></div>`;
elementTemplates.mathInteractionBlock = (module) => { const mathType = module.mathType;	let operation = module.operation;	const inputs = module.inputs;	let columns = "grid-template-columns: ";	let inputsElements = ``;	if (inputs != null)	{		const inputEls = inputs.split(' ');		inputEls.forEach(element =>		{			if (element.startsWith("#"))			{				const el = element.split('');				operation = operation.replace(element, `aMath.bignumber((parseFloat(document.getElementById('${module.mathType ?? ''}${el[1]}').value)))`)			}		});		const oninput = `document.getElementById('${mathType ?? ''}Out').innerHTML = aMath.format(aMath.round(${operation}, 5), {precision: 5, notation: 'auto', lowerExp: -8, upperExp: 9 });`; inputEls.forEach(element => { if (element.startsWith("#")) { const el = element.split(''); inputsElements += `<input class="input${el[1]}" type="number" placeholder="${el[1]}" id="${mathType ?? ''}${el[1]}" oninput = "${oninput}"</input>`; columns += "1fr "; } else { inputsElements += `<span>$${element}$</span>`; columns += "auto "; } }); }	const innerStructure = ` <div class="inputElements" style="${columns} auto"> ${inputsElements} <span class="eq">$=$</span> </div> <div class="output block" id="${mathType ?? ''}Out">Output</div>`; const output = `<div class="mathInteractionBlock ${module.class ?? ''}" style="auto 1fr;"> ${inputsElements != `` ? innerStructure : `<div class="loadingSpinner ${module.class ?? ''}" ><div class="spinner"></div></div >`} </div>`; return output; }

// #endregion ==============! Templates !=========================

// #region ======================================================
// #region =================| AllPosts |=========================
// #region ======================================================

function generateAllPosts()
{
	let allPostsDocument = `<section id="pageContent" class="verticalTabs minRows">`;

	Object.entries(postModules).forEach(([key, value]) => {
		for (let i = 0; i < value.length; i++)
		{
			allPostsDocument += value[i];	
		}
	});

	allPostsDocument += `</section>`;
	const htmlDoc = flattenString(htmlWrap(getHeader(), "", "",  allPostsDocument, {id: "allPosts", class:"liteElement",title:"All Posts"}))
	writeF(distPath + `/allPosts.html`, htmlDoc);
}

// #endregion ==============! AllPosts !=========================

rebuild();