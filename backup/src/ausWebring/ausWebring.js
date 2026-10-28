const el = document.getElementById("ausWebringScript0143");

async function setup()
{

	try
	{
		if (el == null)throw new Error(`Render Fail: Element not found`);

		const id = el.getAttribute("ausWebringID");
		if (id == null)throw new Error(`Render Fail: ausWebringID not found`);

		const response = await fetch("https://sekter143.com/ausWebring/ausWebringList.json");
		if (!response.ok) throw new Error(`Fetch Fail: (Response: ${response.status})`);

		const result = await response.json();

		const index = result.sites.findIndex(item => item.id === id);

		const rendered =
		`
			<style>
				#ausWebring
				{
					display: grid;
					grid-template-columns: 1fr 4fr 1fr;
					grid-gap: 10px;
					aspect-ratio: 100/25;
					width: 100%;
					height: unset;
				}

				.webring
				{
					background: linear-gradient(135deg, #161669 0%, #0d0d3f 100%);
					border: 2px solid #2d2dd2;
				}

				.back,
				.next
				{
					display: grid;
					justify-items: center;
					align-items: center;
					container-type: inline-size;
					container-name: arrows;
					background: linear-gradient(135deg, #166919 0%, #0d3f0d 100%);
					border-radius: 0 10px 10px 0;
					border: 2px solid #2dd22d;
				}

				.back
				{
					transform: scaleX(-1);
					background: linear-gradient(225deg, #166919 0%, #0d3f0d 100%);
				}

				@container arrows
				{
					.arrow
					{
						width: 75cqmin;
						height: 75cqmin;
						border: 15cqmin solid;
						border-color: #2dd22d transparent transparent #2dd22d;
						transform: rotate(135deg) translate(22%, 22%);
					}
				}
			</style>
			<div id='ausWebring'>
				<a class="back" href="${result.sites[index-1].link}"><div class="arrow"></div></a>
				<a class="webring"></a>
				<a class="next" href="${result.sites[index+1].link}"><div class="arrow"></div></a>
			</div>
		`;

		el.outerHTML = rendered;
	}
	catch (error)
	{
		console.error(error.message);
	}
	
	

	
	el.outerHTML = `<span>Err loading ausWebring</span>`;
}

setup();