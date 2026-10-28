// const observerCallback = (mutationsList) => { testPageOverflow(); };
// const observer = new MutationObserver(observerCallback);

export async function initPage(renderHeader = false)
{
	try { observer.disconnect(); } catch (err) { }

	const urlArr = window.location.pathname.split("/").slice(1);
	const urlParams = new URLSearchParams(window.location.search);


	if (urlArr[1] != null)
	{
		if (document.querySelector("html").classList.contains(urlArr[1])) return;
		if (urlArr[1] == '') urlArr.pop();
	}

	if (renderHeader != false)
	{
		document.querySelector("#siteHeader").innerHTML = await loadComponent("/elements/headers/basicHeader.html");
	}

	document.getElementById("leftColumn").innerHTML = "";
	document.getElementById("page").innerHTML = "";

	if (urlArr[0] == "")
	{
		document.querySelector("html").id = "landingPage";
		document.querySelector("html").className = "";
		document.getElementById("page").innerHTML = await loadComponent("/pages/landingPage.html");
	}
	else
	{
		document.querySelector("html").id = urlArr[0];
		document.querySelector("html").className = "index";

		const fullURL = urlArr.join("/")

		if (urlArr.length < 2) document.getElementById("page").innerHTML = await loadComponent(`/pages/${urlArr[0]}.html`);
		else document.getElementById("page").innerHTML = await loadComponent(`/pages/${fullURL}.html`);

		if (urlArr[1] != null)
		{
			document.querySelector("html").className = urlArr.slice(1).join(" ") ?? "";
			if (urlArr[1] == "kataRunner")
			{
				const kata = urlParams.get("kata");
				document.getElementById("kataFrame").setAttribute("src", `/pages/kata143/${kata}/${kata}.html`);
			}
			else if (urlArr[0] == "math")
			{
				const mathFooter = await loadComponent("/elements/mathTopicKey.html");
				if (document.getElementById("mathFooter") != null)
				{
					document.getElementById("mathFooter").outerHTML = mathFooter;
				}
			}
			else if (urlArr[1] == "BADRunner")
			{
				const BAD = urlParams.get("BAD");
				document.getElementById("badFrame").setAttribute("src", `/pages/BAD/${BAD}.html`);
			}
		}
	}

	//testScriptRequired();

	replaceSidebars();

	//replaceModules();

	MathJax.typesetPromise();

	//testPageOverflow();

	//observer.observe(document.getElementById("page"), { childList: true, characterData: true, subtree: true });
}

// function testScriptRequired()
// {
// 	const old = document.getElementById("pageScript");
// 	if (old != null) old.remove();

// 	const src = document.getElementById('pageContent').getAttribute("hasScript");

// 	if (src != null)
// 	{
// 		const script = document.createElement('script');
// 		script.src = src;
// 		script.async = false;
// 		script.id = "pageScript";
// 		document.head.appendChild(script);
// 	}
// }

// function testPageOverflow()
// {
// 	const page = document.getElementById("page");
// 	const content = document.getElementById("pageContent");
// 	if (page.clientHeight < content.clientHeight) page.classList.add("scroll");
// 	else page.classList.remove("scroll");
// }

export function swapPage(link)
{
	window.history.pushState({}, "Title", `/${link}`);
	initPage();
}

export async function loadComponent(path)
{
	try
	{
		const res = await fetch(path);
		const htmlText = await res.text();
		if (htmlText.startsWith("<html>")) return `<section id="pageContent"><div class='simpleContent redElement' style="height:min-content; grid-template-rows: 1fr;">Error, invalid redirection, page not found.</div></section>`;
		return htmlText;
	}
	catch (error)
	{
		console.error('Failed to load HTML file:', error);
	}
}

function replaceSidebars()
{
	const sidebars = document.querySelectorAll("#page .sidebar");
	for (let i = 0; i < sidebars.length; i++)
	{
		const sidebar = sidebars[i];
		document.getElementById(`${sidebar.getAttribute("column")}`).replaceChildren(sidebar);
	}
}