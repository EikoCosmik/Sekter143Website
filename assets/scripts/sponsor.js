import * as KT from "./KataToolKit_Single.js";

const imgs = 
[
	"DEMA",
	"TheVoid",
	"Estrogen"
];

export function setupSponsor()
{
	const el = document.getElementById("sponsorImg");
	el.innerHTML = `<img src="/assets/images/fakeAd_${imgs[KT.getRandomInt(0, imgs.length)]}.gif"></img>`
}