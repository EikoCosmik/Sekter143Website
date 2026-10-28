class database
{
	constructor()
	{
		// this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
		this.responceBlockTemplate = (title, message) => `<h2 class="underline">${title}</h2><div>${message}<div>`
	}

	updateResponceBlock(responceBlock, title, message, classList)
	{
		responceBlock.className = "responceBlock block " + classList;
		responceBlock.innerHTML = this.responceBlockTemplate(title, message);
		responceBlock.style.display = "grid";
	}

	async guestbookAdd(id)
	{
		const form = document.getElementById(id);
		const inputs = form.querySelectorAll("input, select, textarea");
		const responceBlock = document.getElementById(`${id}_responceBlock`);
		responceBlock.style.display = "none";

		let sendData = {};

		for (let i = 0; i < inputs.length; i++) 
		{
			const input = inputs[i];
			const val = input.value;
			const scriptTest = /<(\/)?[ \t\r\n]*script[^>]*>/g;

			if (scriptTest.test(val)) { this.updateResponceBlock(responceBlock, "Invalid Input", `Script tags are not alowed in "${input.id}" input.`, "redElement"); return; };
			sendData[input.id] = val;
		}

		if (sendData.username == "") sendData.username = "Anonymous";
		if (sendData.color == "") sendData.color = "ruby";
		if (sendData.message == "") { this.updateResponceBlock(responceBlock, "Invalid Message", `Message input is required.`, "redElement"); return; };

		const token = turnstile.getResponse();
		if (!token) { this.updateResponceBlock(responceBlock, "Captcha Err", `Please complete captcha.`, "redElement"); return; }
		sendData.token = token;

		const response = await fetch('/api/guestbookAdd', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(sendData),
		});
		
		const localResponce = await response.json();

		this.updateResponceBlock(responceBlock, localResponce.title, localResponce.message, localResponce.color);

		this.guestbookUpdate(id);
	}

	async guestbookUpdate(id)
	{
		const el = document.getElementById(id + "Responces");

		const response = await fetch('/api/guestbookGet', {	method: 'GET' });
		const data = await response.json();
		const arr = JSON.parse(data.responces.data).data.sort((a, b) => b.id - a.id);
		
		let outstring = "";

		for (let i = 0; i < arr.length; i++)
		{
			const message = arr[i];
			outstring += `<div class="guestbookMessage${message.color != "" ? ` ${message.color}Element` : ""} ${id == "recentGuestbook" ? "ADMINGUESTBOOK" : ""}">${id == "recentGuestbook" ? `<div class="adminBox"><button class="button cyanElement" onclick="db.createAdminResponceBlock(${message.id}, 'GuestBook')">Respond</button><button class="button redElement" onclick="db.createAdminDeleteBlock(${message.id}, 'GuestBook')">Delete</button></div>` : ""}<h3 class="username">From: ${message.username ?? ""}</h3>${message.website != "" ? `<div class="website">Site: ${message.website}</div>` : ""}<div class="message">${message.message}</div><div class="createdAt">${await this.convertDateTime(message.created_at)}</div>${(message.adminResponce != null && message.adminResponce != "") ? `<div class="eikoResponce"><h3>From Eiko:</h3><div class="responceText">${message.adminResponce}</div></div>` : ""}</div>`
		}
		el.innerHTML = outstring;
	}

	convertDateTime(dbString)
	{
		const date = new Date(dbString);
		const options = {
			year: "numeric",
			month: "numeric",
			day: "numeric",
			hour: "numeric",
			minute: "numeric",
			second: "numeric",
			hour12: false,
			timeZone: "Australia/Sydney",
			timeZoneName: "short",
		};
		return new Intl.DateTimeFormat("en-AU", options).format(date);
	}

	async commentAdd(id)
	{
		const form = document.getElementById(id);
		const inputs = form.querySelectorAll("input, select, textarea");
		const responceBlock = document.getElementById(`${id}_responceBlock`);
		responceBlock.style.display = "none";

		let sendData = {};
		sendData.postID = id;

		for (let i = 0; i < inputs.length; i++) 
		{
			const input = inputs[i];
			const val = input.value;
			const scriptTest = /<(\/)?[ \t\r\n]*script[^>]*>/g;

			if (scriptTest.test(val)) { this.updateResponceBlock(responceBlock, "Invalid Input", `Script tags are not alowed in "${input.id}" input.`, "redElement"); return; };
			sendData[input.id] = val;
		}

		if (sendData.username == "") sendData.username = "Anonymous";
		if (sendData.message == "") { this.updateResponceBlock(responceBlock, "Invalid Message", `Message input is required.`, "redElement"); return; };

		const token = turnstile.getResponse();
		if (!token) { this.updateResponceBlock(responceBlock, "Captcha Err", `Please complete captcha.`, "redElement"); return; }
		sendData.token = token;

		const response = await fetch('/api/commentAdd', {
		 	method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(sendData),
		});

		const localResponce = await response.json();

		this.updateResponceBlock(responceBlock, localResponce.title, localResponce.message, localResponce.color);

		this.commentUpdate(id);
	}

	async commentUpdate(id)
	{
		const el = document.getElementById("comments" + id);

		let sendData = {};
		sendData.postID = (id == "ALLWHE") ? id : "commentForm" + id;

		const response = await fetch('/api/commentGet', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(sendData),
		});
		const data = await response.json();
		const arr = JSON.parse(data.responces.data).data.sort((a, b) => b.id - a.id);		

		let outstring = "";

		for (let i = 0; i < arr.length; i++)
		{
			const message = arr[i];
			outstring += `<div class="commentMessage ${id == "ALLWHE" ? "ADMINCOMMENTS" : ""}">${id == "ALLWHE" ? `<div class="adminBox"><button class="button cyanElement" onclick="db.createAdminResponceBlock(${message.id}, 'Comments')">Respond</button><button class="button redElement" onclick="db.createAdminDeleteBlock(${message.id}, 'Comments')">Delete</button></div>` : ""}<h3 class="username">From: ${message.username ?? ""} @&nbsp;<div class="createdAt">${await this.convertDateTime(message.created_at)}</div>${id == "ALLWHE" ? `<div style="color: var(--col_redMain)">&nbsp;From: ${message.postID}</div>` : ""}</h3><div class="message">${message.message}</div>${(message.adminResponce != null && message.adminResponce != "") ? `<div class="eikoResponce"><h3>From Eiko:</h3><div class="responceText">${message.adminResponce}</div></div>` : ""}</div>`
		}
		el.innerHTML = outstring;
	}

	async wheLogin()
	{
		const loginForm = document.getElementById("welcomeHomeEikoLogin");
		const innerAdmin = document.getElementById("innerAdmin");
		const username = document.getElementById("username");
		const password = document.getElementById("password");

		const sendData = { username: username.value, password: password.value }

		const response = await fetch('/api/welcomeHomeEikoLogin', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(sendData),
		});
		if (response.status == 403) window.location.replace("/");


		const localResponce = await response.json();
		const adminPage = localResponce.html;


		loginForm.remove();
		innerAdmin.innerHTML = adminPage
		window.adminPage = adminPage;
	}

	async wheRespond(postID, tableID, message)
	{
		let sendData = {};
		sendData.id = postID;
		sendData.table = tableID;

		const scriptTest = /<(\/)?[ \t\r\n]*script[^>]*>/g;
		if (scriptTest.test(message)) return;
		sendData.message = message;

		const token = turnstile.getResponse();
		if (!token) { this.updateResponceBlock(responceBlock, "Captcha Err", `Please complete captcha.`, "redElement"); return; }
		sendData.token = token;

		const response = await fetch('/api/adminRespond', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(sendData),
		});

		const localResponce = await response.json();

		console.log(localResponce);

		if (tableID == "GuestBook") this.guestbookUpdate("recentGuestbook");
		else if(tableID == "Comments") this.commentUpdate("ALLWHE");		
	}
	
	async wheDelete(postID, tableID)
	{

		let sendData = {};
		sendData.id = postID;
		sendData.table = tableID;

		const token = turnstile.getResponse();
		if (!token) { this.updateResponceBlock(responceBlock, "Captcha Err", `Please complete captcha.`, "redElement"); return; }
		sendData.token = token;

		const response = await fetch('/api/adminDelete', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(sendData),
		});

		const localResponce = await response.json();

		console.log(localResponce);

		if (tableID == "GuestBook") this.guestbookUpdate("recentGuestbook");
		else if (tableID == "Comments") this.commentUpdate("ALLWHE");
	}

	createAdminResponceBlock(postID, tableID)
	{
		if (postID == null || tableID == null) return;

		const body = document.getElementsByTagName("body")[0];
		const adminResponceBlock = document.createElement("div");
		adminResponceBlock.id = "adminResponceBlock";
		adminResponceBlock.innerHTML = `
		<div class="adminResponceContainer">
			<div class="inputBlock adminResponce cyanElement">
				<label for="adminResponce">Reply:</label>
				<textarea id="adminResponce"></textarea>
			</div>
			<button class="button submit greenElement" onclick="db.wheRespond(${postID}, '${tableID}', document.getElementById('adminResponce').value); document.getElementById('adminResponceBlock').remove()">Submit</button>
			<button class="button orangeElement" onclick="document.getElementById('adminResponceBlock').remove()">Cancel</button>
		</div>
		`
		body.appendChild(adminResponceBlock);
	}

	createAdminDeleteBlock(postID, tableID)
	{
		if (postID == null || tableID == null) return;

		const body = document.getElementsByTagName("body")[0];
		const AdminDeleteBlock = document.createElement("div");
		AdminDeleteBlock.id = "adminResponceBlock";
		AdminDeleteBlock.innerHTML = `
		<div class="adminResponceContainer adminDeleteBlock">
			<button class="button submit redElement" onclick="db.wheDelete(${postID}, '${tableID}'); document.getElementById('adminResponceBlock').remove()">Are you sure?</button>
			<button class="button cancel orangeElement" onclick="document.getElementById('adminResponceBlock').remove()">Cancel</button>
		</div>
		`
		body.appendChild(AdminDeleteBlock);
	}
}

export const db = new database();