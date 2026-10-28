import * as KT from "./KataToolKit_Single.js";

const newsItemsAll =
[
	"Alert, this is a news headline. Please disregard any other news items you may have seen.",
	"If you or a loved one have accessed the Sekter143.com website, you may be entitled to a warm Thank You 🩵",
	"I spent 2 Hours setting up this News Ticker and all i have to show for it is this T-Shirt.",
	"Look ->&nbsp;<span style='color:var(--col_purpleMain);'>Color!</span>",
	"<span class='spoilerText'>AHHHHHHHH DON'T LOOK</span>",
	"<span class='makeTulyn'>If you can read this, you either looked at the source code, or translated it. Either way, Nerd.</span>",
	"I think a wet T-Shirt contest in sub 0°c temperatures would indeed go hard.",
	"Did you know you can submit news headlines? Heck they may even link to your site! Email me if you want	🩵",
	"The Sekter143 website has not been FDA approved, side affects may include; Awe, Warmth, Happiness, and the everlasting sense of a small hummingbird watching you.",
	"Todays secret password is: Estrogen",
	"!!Warning!! Cognito hazard ahead ->&nbsp;<span class='spoilerText'>moist</span>"
]

const items = newsItemsAll;
const ticker = document.getElementById("newsTicker");
const parser = new DOMParser();
let lastIndex = -1;
const divider = "♦";

const interval = 20; //ms
const distance = 1; //px

export function setupNewsTicker()
{
	addItem();
	setupNews();
	const rate = distance / (interval / 1000);
	return setInterval(updateNews, interval);
}

function wrapArticle(item, index)
{
	const doc = parser.parseFromString(`<div id="tickerItem${index}" class="newsItem">${item}<a class="ntDiv">${divider}</a></div>`, 'text/html');
	return doc.body.firstElementChild;
}

function addItem()
{
	let newIndex = KT.getRandomInt(0, items.length);
	while (newIndex == lastIndex)
	{
		newIndex = KT.getRandomInt(0, items.length);
	}
	lastIndex = newIndex;
	const newItem = wrapArticle(items[newIndex], newIndex);
	ticker.append(newItem);
}

function setupNews()
{
	let elements = document.getElementById("newsTicker").children;

	let previousRight = 0;

	for (let i = 0; i < elements.length; i++)
	{
		const element = elements[i];
		if (i == 0) element.style.left = `50px`;
		else element.style.left = (previousRight) + "px";
		previousRight = element.getBoundingClientRect().right;
	}

	const ticker = document.getElementById("newsTicker");

	while (elements[elements.length - 1].getBoundingClientRect().right < ticker.getBoundingClientRect().right)
	{
		addItem();
		elements = document.getElementById("newsTicker").children;
		const element = elements[elements.length - 1];
		element.style.left = (previousRight) + "px";
		previousRight = element.getBoundingClientRect().right;
	}
}

function updateNews()
{
	const elements = document.getElementById("newsTicker").children;

	let previousRight = 0;

	for (let i = 0; i < elements.length; i++)
	{
		const element = elements[i];
		if (i == 0) element.style.left = (element.getBoundingClientRect().left - distance) + "px";
		else element.style.left = (previousRight) + "px";
		previousRight = element.getBoundingClientRect().right;
	}

	if(elements[0].getBoundingClientRect().right <= 0)
	{
		document.getElementById(elements[0].id).remove();
	}

	const ticker = document.getElementById("newsTicker");

	if(elements[elements.length - 1].getBoundingClientRect().right < ticker.getBoundingClientRect().right)
	{
		addItem();
	}
}