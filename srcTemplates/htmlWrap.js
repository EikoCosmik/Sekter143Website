export function htmlWrap(siteHeader, rightColumn, leftColumn, pageContent, settings)
{

	if (settings == undefined) settings = [];

	return `
	<html id="${settings.id ?? "sk143"}" class="${settings.class ?? "darkElement"}">
		<head>
			<meta name="viewport" content="width=device-width, initial-scale=1.0">

			<meta name="kicya-site-verification" content="c44800c1e0856c6e93126c151fe00864043c6a71343d35634398f2b7388dee9d">
			<script src="https://u.widget.st/ar.js"></script>

			<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>

			<link rel="me" href="mailto:admin@sekter143.com">

			<link rel="stylesheet" href="/assets/styles/compiled.css">


			<script>MathJax = {options:{enableMenu: false},tex: {inlineMath: [['$', '$']],displayMath: [['$$', '$$']]},};</script>
			<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>
			<script src="/assets/scripts/math.js"></script>

			<script type="module">
				const config = {number: 'BigNumber',precision: 64};
				const aMath = math.create(math.all, config);
				window.aMath = aMath;
				MathJax.typesetPromise();
			</script>

			<script type="module">import { setupNewsTicker } from '/assets/scripts/newsTicker.js';document.addEventListener("DOMContentLoaded", function() {const nt = setupNewsTicker();});</script>
			<script type="module">import { setupSponsor } from '/assets/scripts/sponsor.js';setupSponsor();</script>
			<script type="module">import { db } from '/assets/scripts/db.js'; window.db = db</script>

			<script src="https://iframe.chat/scripts/main.min.js"></script>
			
			<script type="module">import { holidays } from '/assets/scripts/holidays.js'; holidays();</script>

			<title>${settings.title ?? "Welcome!"}</title>
		</head>

		<body>
			<div class="h-card" style="display:none"><img class="u-photo" src="/assets/images/site_pfp.gif"><a class="u-url p-name" href="https://sekter143.com/">EikoCosmik</a></div>
			<div id="staticBlock">
				<header id="siteHeader">${siteHeader ?? ""}</header>
				<aside id="leftColumn">${leftColumn ?? ""}</aside>
				<aside id="rightColumn">${rightColumn ?? ""}</aside>
				<div id="newsTicker"></div>
			</div>
			<main id="page">${pageContent ?? ""}</main>
		</body>
	</html>`
}