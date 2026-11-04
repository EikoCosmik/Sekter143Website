const widgetStyles = 
{
	"compactBar": compactBar,
	"aboutMe": aboutMe
}


export async function generateCozyTalkIframe(url, type)
{
	const response = await fetch('/api/cozyTalkWidget', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ url: url }),
	});
	const resData = await response.json();

	const parser = new DOMParser();
	const widget = parser.parseFromString(resData.htmlText, 'text/html');

	return widgetStyles[type](widget); 
}

function compactBar(widget)
{
	const avatar = widget.querySelector(".avatar");
	const stats = widget.querySelector(".stats-row").querySelectorAll("span");
	const status = widget.querySelector(".status-row").querySelectorAll("span")[1];
	const header = widget.querySelector(".widget-header").innerHTML;
	const href = widget.querySelector(".footer a").getAttribute("href");

	let statString = "";
	for (let i = 0; i < stats.length; i++)
	{
		const stat = stats[i].innerHTML;
		const text = stat.match(/ (\w.*?)$/)[1];
		const num = stat.match(/^(\w.*?) /)[1];
		statString += `<div class=${text}><div class="statNum">${num}</div><div class="statText">${text}</div></div>`;
	}

	let statusIcon = ""

	
	// f0599

	// zzz = 󰒲
	// ghost = 

	switch (status.innerHTML)
	{
		case "Online":
			statusIcon = `<div class="statusIcon asIcon" style='color: var(--col_greenMain);'></div>`;
			break;
		case "Away":
			statusIcon = `<div class="statusIcon asIcon" style='color: var(--col_yellowMain);'>󰒲</div>`;
			break;
		case "Busy":
			statusIcon = `<div class="statusIcon asIcon" style='color: var(--col_redMain);'>󱏎</div>`;
			break;
		case "Offline":
			statusIcon = `<div class="statusIcon asIcon" style='color: var(--col_greyMain);'>󰽧</div>`; // 󰕑
			break;
	}

	return `
		<a id="customCozyTalkWidget" class="compactBar button" href="${href}">
			<div class="content">
				<div class="imageContainer">
					<div class="image">
						<img src="${avatar.getAttribute("src")}" />
					</div>
				</div>
				<div class="data">
					<div class="status ${status.innerHTML}">
						${statusIcon}
						<div class="statusText">${status.innerHTML}</div>
					</div>
					${statString}
					<div class="header">${header}</div>
				</div>
			</div>
			<div class="rightIcon asIcon"></div>
		</a>`;
}

function aboutMe(widget)
{
	const avatar = widget.querySelector(".avatar");
	const stats = widget.querySelector(".stats-row").querySelectorAll("span");
	const status = widget.querySelector(".status-row").querySelectorAll("span")[1];
	const header = widget.querySelector(".widget-header").innerHTML;
	const href = widget.querySelector(".footer a").getAttribute("href");
	const pet = widget.querySelector(".pet-block").innerHTML;
	const fandom = widget.querySelector(".fandom-grid");
	const posts = widget.querySelector(".posts-block .post-snippet").innerHTML;

	console.log(fandom);
	console.log(posts);


	let statString = "";
	for (let i = 0; i < stats.length; i++)
	{
		const stat = stats[i].innerHTML;
		const text = stat.match(/ (\w.*?)$/)[1];
		const num = stat.match(/^(\w.*?) /)[1];
		statString += `<div class=${text}><div class="statNum">${num}</div><div class="statText">${text}</div></div>`;
	}

	let statusIcon = ""

	switch (status.innerHTML)
	{
		case "Online":
			statusIcon = `<div class="statusIcon asIcon" style='color: var(--col_greenMain);'></div>`;
			break;
		case "Away":
			statusIcon = `<div class="statusIcon asIcon" style='color: var(--col_yellowMain);'>󰒲</div>`;
			break;
		case "Busy":
			statusIcon = `<div class="statusIcon asIcon" style='color: var(--col_redMain);'>󱏎</div>`;
			break;
		case "Offline":
			statusIcon = `<div class="statusIcon asIcon" style='color: var(--col_greyMain);'>󰽧</div>`; // 󰕑
			break;
	}

	return `
		<div id="customCozyTalkWidget" class="aboutMe">
			<div class="content">
				<div class="imageContainer">
					<div class="image">
						<img src="${avatar.getAttribute("src")}" />
					</div>
				</div>
				<div class="data">
					<div class="status ${status.innerHTML}">
						${statusIcon}
						<div class="statusText">${status.innerHTML}</div>
					</div>
					${statString}
					<div class="header">${header}</div>
				</div>
			</div>
			<div class="center">
				<div class="recentPosts">
					<h4>Recent Posts:</h4>
					<div class="post">${posts}</div>
				</div>
			</div>
			<div class="goToContainer"><a class="button small" href="${href}"><span>Go To Profile</span><div class="rightIcon asIcon"></div></a></div>			
		</a>`;
}

/* Other Data
- 
*/