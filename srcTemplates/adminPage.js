export function adminPage()
{
	return `
	<div id="adminControls">
		<button class="button" id="refreshButton" onclick=
		"
			document.getElementById('innerAdmin').innerHTML = window.adminPage;
			db.guestbookUpdate('recentGuestbook');
			db.commentUpdate('ALLWHE');
		">Refresh</button>
	</div>
	<h1>Recent GuestBooks</h1>
	<div id=recentGuestbookResponces></div>
	<h1>Recent Comments</h1>
	<div id="commentsALLWHE"></div>
	`
}