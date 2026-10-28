import * as KT from "./KataToolKit_Single.js";
export const holidays = halloween();

function none() {}

function halloween()
{
	document.querySelector("html").classList.add("halloween");
	const container = document.createElement("div");
	container.id = "halloweenBucket";

	const bucket = document.createElement("div");
	bucket.className = "bucket";
	bucket.onclick = halloweenGetCandy;
	container.appendChild(bucket);

	const candy = document.createElement("div");
	candy.className = "candy";
	container.appendChild(candy);

	document.getElementById("staticBlock").appendChild(container);
}

function halloweenGetCandy()
{
	const candy = document.querySelector("#halloweenBucket .candy");
	candy.className = "candy";

	if (candy.style.display == "block") { return }
	else
	{
		const chance = KT.getRandomInt(0, 100);
		
		if(chance < 48) candy.classList.add("common");
		else if (chance < 72) candy.classList.add("uncommon");
		else if (chance < 87) candy.classList.add("rare");
		else if (chance < 96) candy.classList.add("epic");
		else candy.classList.add("legendary");

		candy.style.display = "block";
		setTimeout(() =>
		{
			candy.style.display = "none";
		}, 2000);
	}
}