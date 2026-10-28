export function getHeader()
{
	return `
<div class="headerInternal">
	<a class="image logo" href="/">
		<img src="/assets/images/site_logo.gif">
	</a>
	<div id="headerNav" class="tabs">
		<nav class="tabs navTabs">
			<a class="button aquaElement" href="/siteNav">Site Map</a>
			<a class="button azureElement" href="/guestbook">GuestBook</a>
			<a class="button yellowElement" href="/chat">Chat</a>
			<a class="button rubyElement" href="/aboutMe">About Me</a>
		</nav>
		<nav class="tabs miniNavTabs">
			<a class="button small redElement" href="/bad">BAD</a>
			<a class="button small darkElement" href="/crochetBall">Ball</a>
			<a class="button small liteElement" href="mailto:admin@sekter143.com" rel="me">Email</a>
			<a class="button small azureElement" href="/mathFormulaSheet">Math</a>
			<a class="button small beigeElement" href="/credits">Credits</a>
		</nav>
	</div>
	<div class="ads">
		<div id="sponsorImg" class="image">
			
		</div>
	</div>
</div>
`;
}

//