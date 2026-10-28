////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Vars ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Types
// -2 = Sparkle Sub
// -1 = Rocket 
// 0 = Basic
// 1 = Two Tiered
// 2 = Three Tiered
// 3 = Sparkle
// 4 = Split
// 5 = Hang
// 6 = Target

// Canvas
let c;
let ctx;

// Movement
const gravity = 0.1;
const vecAmt = 2048;
const vecX = new Float32Array(vecAmt);
const vecY = new Float32Array(vecAmt);

// Spawning
let spawnInt = 350;
let partMod = 500;
const MAXPARTS = 100000;
let minVel = 6;
let maxVel = 14;
let minEnergy = 1;
let maxEnergy = 6;
let maxTypes = 6;

// Modifiers
let volMod = 0.05;
let screenRatioW = 1;
let screenRatioH = 1;
let screenRatioA = 1;
let ActWidth;
let ActHeight;

// Drawing
let buckets = [];
let activeColors = new Set();
const posColors = [];
let maxCols = 0;
let curCol = -1;

// Time Syncing
let startTime = Date.now();
let oT = startTime;
let lastSpawn = startTime;
let dT = 1;

// Parallel Arrays
let particleCount = 0;
let energy = new Float16Array(MAXPARTS);
let posX = new Float32Array(MAXPARTS);
let posY = new Float32Array(MAXPARTS);
let drawSize = new Float16Array(MAXPARTS);
let halfSize = new Float16Array(MAXPARTS);
let drawPositionX = new Float32Array(MAXPARTS);
let drawPositionY = new Float32Array(MAXPARTS);
let sizeChange = new Float16Array(MAXPARTS);
let gravMod = new Float16Array(MAXPARTS);
let moveX = new Float16Array(MAXPARTS);
let moveY = new Float16Array(MAXPARTS);
let col = new Uint16Array(MAXPARTS);
let col2 = new Uint16Array(MAXPARTS);
let type = new Int8Array(MAXPARTS);
let exData = new Float32Array(MAXPARTS);
let initY = new Float32Array(MAXPARTS);
let initX = new Float32Array(MAXPARTS);

// Debugging
let dFWVel = false;
let dFWSway = false;
let dForceSpawn = false; //inFloat0-1
let dispalyData = false;
let dAsPoints = false;
let dNoBack = false;
let dLogBottles = false;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Tools ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function playSound(fWSize)
{
	var audio;
	audio = new Audio('ex' + getRndInt(0, 1) + '.wav');
	audio.volume = (fWSize / (maxEnergy)) * volMod;
	audio.play();
}

function hideNotif()
{
	let curOpac = (document.getElementById("notify").style.opacity == "") ? 1 : parseFloat(document.getElementById("notify").style.opacity);

	if (curOpac > 0)
	{
		document.getElementById("notify").style.opacity = (curOpac - 0.01);
		setTimeout(hideNotif, 0);
	}
}

function getRndInt(min, max) 
{
	const minCeiled = Math.ceil(min);
	const maxFloored = Math.floor(max);
	return Math.floor(Math.random() * (maxFloored - minCeiled + 1)) + minCeiled;
}

function getRndFlt(min, max)
{
	return Math.random() * (max - min) + min;
}

function forceMod(n, m)
{
	return ((n % m) + m) % m;
}

function toColor(decIn)
{
	return "#" + decIn.toString(16).padStart(6, 0);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Setup ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// On Doc Ready
document.addEventListener("DOMContentLoaded", function ()
{
	// Get Canvas
	window.addEventListener('resize', resize);
	c = document.getElementById("mainCanvas");
	ctx = c.getContext("2d");

	// Set Listens
	document.getElementById("controls").addEventListener("change", function ()
	{
		spawnInt = parseInt(document.getElementById("spawnIntInput").value);
		partMod = parseInt(document.getElementById("partModInput").value);
		volMod = parseFloat(document.getElementById("volume").value);
	});

	// Calc Lookup Angles
	for (let i = 0; i < vecAmt; i++)
	{
		const angle = i / vecAmt * (Math.PI * 2);
		vecX[i] = Math.cos(angle);
		vecY[i] = Math.sin(angle);
	}

	// Calc Lookup Colors
	let colDivis = Math.ceil(255 / 64);
	for (let j = colDivis; j < 255; j += colDivis)
	{
		posColors.push("#00" + j.toString(16).padStart(2, 0) + "FF");
		posColors.push("#" + j.toString(16).padStart(2, 0) + "00FF");
		posColors.push("#00FF" + j.toString(16).padStart(2, 0));
		posColors.push("#" + j.toString(16).padStart(2, 0) + "FF00");
		posColors.push("#FF00" + j.toString(16).padStart(2, 0));
		posColors.push("#FF" + j.toString(16).padStart(2, 0) + "00");
	}

	// Set Missing Lookup Colors
	posColors.push("#0000FF");
	posColors.push("#00FF00");
	posColors.push("#00FFFF");
	posColors.push("#FF0000");
	posColors.push("#FF00FF");
	posColors.push("#FFFF00");
	maxCols = posColors.length - 1;
	posColors.push("#333333");

	// Force Val Update and Start
	resize();
	requestAnimationFrame(drawFrame);
	setTimeout(hideNotif, 2000);
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Main Functions //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Main Draw
function drawFrame(time)
{
	let StartLog = Date.now();

	// Calc Difference (dT)
	dT = Math.min((time - oT) / 1000, 0.1) * 60;

	// Debug Data
	if (dispalyData)
	{
		document.getElementById("deltaTOut").textContent = dT.toFixed(2);
		document.getElementById("partCountOut").textContent = particleCount;
		document.getElementById("partCountPercentOut").textContent = Math.round((particleCount/MAXPARTS)*100) + "%";

		switch(true)
		{
			case dT > 2.8:
				document.getElementById("deltaTOut").style.color = "red";
				break;
			case dT > 1.8:
				document.getElementById("deltaTOut").style.color = "yellow";
				break;
			case dT > 0.8:
				document.getElementById("deltaTOut").style.color = "lime";
				break;
			case dT > 0:
				document.getElementById("deltaTOut").style.color = "cyan";
				break;
		}
	}
	
	// Update Time
	oT = time;

	// Reset Canvas
	if(!dNoBack)
	{
		ctx.fillStyle = "#00000060";
		ctx.fillRect(-100, -100, ActWidth + 100, ActHeight + 100);
	}
	curCol = -1;

	let postInit = Date.now();
	
	// Update All Particles
	for (let i = 0; i < particleCount; i++)
	{
		// If After Update False Returned
		if (!updateParticle(i))
		{
			// Swap Killed Particle With Last
			particleCount--;

			energy[i] = energy[particleCount];
			posX[i] = posX[particleCount];
			posY[i] = posY[particleCount];
			drawSize[i] = drawSize[particleCount];
			halfSize[i] = halfSize[particleCount];
			drawPositionX[i] = drawPositionX[particleCount];
			drawPositionY[i] = drawPositionY[particleCount];
			sizeChange[i] = sizeChange[particleCount];
			gravMod[i] = gravMod[particleCount];
			moveX[i] = moveX[particleCount];
			moveY[i] = moveY[particleCount];
			col[i] = col[particleCount];
			col2[i] = col2[particleCount];
			type[i] = type[particleCount];
			exData[i] = exData[particleCount];
			initX[i] = initX[particleCount];
			initY[i] = initY[particleCount];

			i--;
		}
	}

	let postUpdate = Date.now();

	// Swap After Time
	if (Date.now() - lastSpawn > spawnInt && !(particleCount >= MAXPARTS))
	{
		spawnFirework({ iIn: particleCount++ });
		lastSpawn = Date.now();
	}

	let postSpawn = Date.now();

	if(dLogBottles)
	{
		console.log(
			"St:",StartLog,
			"In:",postInit-StartLog,
			"Up:",postUpdate-postInit,
			"Dr:",postDraw-postUpdate,
			"Sp:",postSpawn-postDraw,
			"Ti",time,
			"dT",dT
		)
	}
	// Request Next Frame
	requestAnimationFrame(drawFrame);
}

// Update Required Vars On Screen Resize
//function resize()
//{
	// const dpr = window.devicePixelRatio || 1;

	// ActWidth = window.innerWidth;
	// ActHeight = window.innerHeight;

	// // Set actual canvas resolution
	// c.width = ActWidth * dpr;
	// c.height = ActHeight * dpr;

	// // Set displayed size
	// c.style.width = ActWidth + "px";
	// c.style.height = ActHeight + "px";

	// // Reset transform then scale drawing to match CSS pixels
	// ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

	// // Your ratios should use CSS size, not scaled size
	// screenRatioW = ActWidth / 1920;
	// screenRatioH = ActHeight / 1080;
	// screenRatioA = ((ActHeight + ActWidth) / 2) / 1500;

	// maxVel = (0.5 + Math.sqrt(72.25 + (20 * (ActHeight * 0.9)))) / 10;
	// minVel = (0.5 + Math.sqrt(72.25 + (20 * (ActHeight * 0.1)))) / 10;
//}

function resize()
{
	ActWidth = window.innerWidth;
	ActHeight = window.innerHeight;

	// Set actual canvas resolution
	c.width = ActWidth;
	c.height = ActHeight;

	// Set displayed size
	c.style.width = ActWidth + "px";
	c.style.height = ActHeight + "px";

	// Your ratios should use CSS size, not scaled size
	screenRatioW = ActWidth / 1920;
	screenRatioH = ActHeight / 1080;
	screenRatioA = ((ActHeight + ActWidth) / 2) / 1500;

	maxVel = (0.5 + Math.sqrt(72.25 + (20 * (ActHeight * 0.9)))) / 10;
	minVel = (0.5 + Math.sqrt(72.25 + (20 * (ActHeight * 0.1)))) / 10;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Spawners ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Base Spawn, Sets All Needed Data
function spawnBase(dictIn)
{
	// Set Reqired
	energy[dictIn.iIn] = dictIn.energyIn;
	posX[dictIn.iIn] = dictIn.posXIn;
	posY[dictIn.iIn] = dictIn.posYIn;
	initX[dictIn.iIn] = dictIn.posXIn;
	initY[dictIn.iIn] = dictIn.posYIn;
	col[dictIn.iIn] = dictIn.colIn;
	col2[dictIn.iIn] = dictIn.colIn2;
	type[dictIn.iIn] = dictIn.typeIn;

	// Calc/Set If Needed Reqired
	drawSize[dictIn.iIn] = ("drawSizeIn" in dictIn) ? dictIn.drawSizeIn : ((dictIn.energyIn * 1.5) + 5) * screenRatioA;
	halfSize[dictIn.iIn] = drawSize[dictIn.iIn] / 2;
	sizeChange[dictIn.iIn] = (dAsPoints) ? 1 : ("sizeChangeIn" in dictIn) ? dictIn.sizeChangeIn : 0.045 * screenRatioA;
	gravMod[dictIn.iIn] = ("gravModIn" in dictIn) ? dictIn.gravModIn * screenRatioA : 0.25 * screenRatioA;

	// Set For Movement
	if ("moveXIn" in dictIn)
	{
		moveX[dictIn.iIn] = dictIn.moveXIn * screenRatioW;
		moveY[dictIn.iIn] = dictIn.moveYIn * screenRatioH;
	}
	
	// Calc For Movement
	else
	{
		let direction = dictIn.direction ?? Math.floor(Math.random() * vecAmt);
		let moveSpeed = dictIn.moveSpeedIn ?? (getRndFlt(0.01, dictIn.energyIn))* screenRatioA;
		moveX[dictIn.iIn] = (moveSpeed) * vecX[direction];
		moveY[dictIn.iIn] = (moveSpeed) * vecY[direction];
	}
}

// Basic Particle Overrides
function spawnParticle(dictIn)
{
	// Check Rainbow
	if (dictIn.isRainbowIn)
	{
		dictIn.colIn = getRndInt(0, maxCols);
	}
	spawnBase(dictIn); // Call Base
}

// Sparkle Particle Overrides
function spawnSparkleParticle(dictIn)
{
	// Set Overrides
	exData[dictIn.iIn] = dictIn.exDataIn; // Set Type Of Sparkle (ToChange)
	spawnBase(dictIn); // Call Base
}

// Split Particle Overrides
function spawnSplitParticle(dictIn)
{
	// Set Angle Limits From Type
	let dAngleIn = dictIn.drawAngleIn;
	let angleLimits;
	switch (dictIn.splitCountIn)
	{
		case 2:
			angleLimits = [
				forceMod((dAngleIn - Math.floor(vecAmt * 0.5)), (vecAmt)),
				forceMod(dAngleIn, vecAmt),
			];
			break;
		case 3:
			let calc3 = Math.floor(vecAmt * 0.66);
			angleLimits = [
				forceMod((dAngleIn + calc3), (vecAmt)),
				forceMod(dAngleIn, vecAmt),
				forceMod((dAngleIn - calc3), (vecAmt))
			];
			break;
		case 4:
			let calc41 = Math.floor(vecAmt * 0.25);
			angleLimits = [
				forceMod((dAngleIn - Math.floor(vecAmt * 0.5)), (vecAmt)),
				forceMod((dAngleIn - calc41), (vecAmt)),
				forceMod(dAngleIn, vecAmt),
				forceMod((dAngleIn + calc41), (vecAmt)),
			];
		case 5:
			let calc51 = Math.floor(vecAmt * 0.2);
			let calc52 = Math.floor(vecAmt * 0.4);
			angleLimits = [
				forceMod((dAngleIn - calc52), (vecAmt)),
				forceMod((dAngleIn - calc51), (vecAmt)),
				forceMod(dAngleIn, vecAmt),
				forceMod((dAngleIn + calc51), (vecAmt)),
				forceMod((dAngleIn + calc52), (vecAmt)),
			];
			break;
	}

	// Sort Because I Could Not Think Of Better
	angleLimits.sort((a, b) => b - a);

	// Get Actual Direction
	let actDirection = Math.floor(Math.random() * vecAmt)
	dictIn.direction = actDirection;

	// Check Needed Color
	splitType = angleLimits.length - 1;
	determinType = 0;
	while (determinType < angleLimits.length - 1)
	{
		//if (actDirection >= Math.min(angleLimits[determinType], angleLimits[determinType + 1]) && actDirection <= Math.max(angleLimits[determinType], angleLimits[determinType + 1]))
		if (actDirection >= angleLimits[determinType+1] && actDirection <= angleLimits[determinType])
		{
			splitType = determinType;
			determinType = determinType + angleLimits.length + 1;
			break;
		}
		determinType += 1;
	}

	// Set Color
	switch (splitType)
	{
		case 0:
			dictIn.colIn = dictIn.colIn;
			break;
		case 1:
			dictIn.colIn = dictIn.colIn2;
			break;
		case 2:
			dictIn.colIn = dictIn.colIn3;
			break;
		case 3:
			dictIn.colIn = dictIn.colIn4;
			break;
		case 4:
			dictIn.colIn = dictIn.colIn5;
			break;
	}
	spawnBase(dictIn); // Call Base
}

// Firework Particle Overrides
function spawnFirework(dictIn)
{
	//Sets
	dictIn.gravModIn = 1 / screenRatioA; // Set Gravity
	dictIn.sizeChangeIn = 0; // No Size Change For Fireworks
	dictIn.posYIn = ActHeight; // Bottom Of Screen
	dictIn.typeIn = -1;
	dictIn.energyIn = getRndFlt(minEnergy, maxEnergy); // Energy / Size Of Explosion

	// Calcs
	let moveY = (dFWVel) ? maxVel : getRndFlt(minVel, maxVel); // Still Using Old Method, I Like It, It Works
	let maxSway = ((ActWidth/screenRatioW)/(50*(Math.max(dictIn.energyIn/4,screenRatioA))))*screenRatioA / moveY; // I Dont Know Why 40 And I Dont Care, This Method Works Without Massive Switches
	dictIn.colIn = maxCols + 1; // Set Color
	dictIn.moveYIn = moveY / screenRatioH; // Im Losing Track Which Ones Need Ratios But It Works
	
	//Rands
	exData[dictIn.iIn] = getRndInt(0, maxTypes); // Set Explosion Type
	dictIn.posXIn = (dForceSpawn != false) ? ActWidth * dForceSpawn : getRndFlt(ActWidth * 0.25, ActWidth * 0.75); // Random Roughly In The Center X
	dictIn.moveXIn = (dFWSway) ? (getRndInt(0, 1) == 0) ? -maxSway : maxSway : getRndFlt(-maxSway, maxSway); // Min Max Sway Random, Should Stay In Bounds
	
	spawnBase(dictIn); // Call Base
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Modifiers ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Loop
function updateParticle(i)
{
	updateVals(i);
	if (checkDeath(i))
	{
		onDeath(i)
		return false; // Return To Remove
	}
	else
	{
		drawParticle(i)
		onLive(i);
		return true; // Return To Keep
	}
}

// Loop
function updateVals(i)
{
	posX[i] -= moveX[i] * dT;
	posY[i] -= moveY[i] * dT;
	drawPositionX[i] = posX[i] - halfSize[i];
	drawPositionY[i] = posY[i] - halfSize[i];
	moveY[i] -= gravity * gravMod[i] * dT; // Update For Gravity
	drawSize[i] = Math.max(drawSize[i] - (energy[i] * sizeChange[i]) * dT, 0); // Floor To 0
}

// Loop
function checkDeath(i)
{
	switch (type[i])
	{
		default:
			return (drawSize[i] <= 0) ? true : false; // If Cant See
		case -1:
			return (moveY[i] < 0) ? true : false; // If Firework At Peak
		case 3:
			return (drawSize[i] <= 0.5) ? true : false; // If Almost Cant See So Sparkle Looks Nicer
	}
}

function drawParticle(i)
{
	if(curCol != col[i])
	{
		ctx.fillStyle = posColors[col[i]]
		curCol = col[i];
	}
	ctx.fillRect(drawPositionX[i], drawPositionY[i], drawSize[i], drawSize[i]);
}

// Once
function onDeath(i)
{
	switch (type[i])
	{
		case -1:
			spawnChildren(i);
			//playSound(energy[i]);
			break;
		case 3:
			spawnChildren(i);
			break;
	}
}

// Once
function onLive(i)
{
	let c = col[i];
	let bucket = buckets[c];
	if (bucket === undefined)
	{
		bucket = [];
		buckets[c] = bucket;
	}
	bucket.push(i);
	activeColors.add(c);
}

// Once
function spawnChildren(parent)
{
	switch (type[parent])
	{
		case -1:
			let baseSpawn = Math.round((energy[parent] / 2) * (getRndFlt(partMod * 0.75, partMod * 1.25)));
			let defaultDict = 
			{
				energyIn: energy[parent],
				posXIn: posX[parent],
				posYIn: posY[parent],
				colIn: getRndInt(0, maxCols),
				colIn2: getRndInt(0, maxCols),
				isRainbowIn: false,
				typeIn: exData[parent],
			}
			switch (exData[parent])
			{
				case 0:
					defaultDict.isRainbowIn = (getRndInt(0, 99) == 0) ? true : false;
					for (let i = 0; i < baseSpawn; i++)
					{
						particleCount < MAXPARTS && spawnParticle({
							...defaultDict,
							iIn: particleCount++,
							//sizeChangeIn: getRndFlt(0.3, 0.5) * screenRatioA
						});
					}
					break;
				case 1:
					for (let i = 0; i < baseSpawn * 0.7; i++)
					{
						particleCount < MAXPARTS && spawnParticle({
							...defaultDict,
							iIn: particleCount++
						});
					}
					defaultDict.colIn = defaultDict.colIn2;
					let energyCheck = energy[parent] * 0.5 * screenRatioA;
					for (let i = 0; i < baseSpawn * 0.3; i++)
					{
						particleCount < MAXPARTS && spawnParticle({
							...defaultDict,
							iIn: particleCount++,
							moveSpeedIn: getRndFlt(0, energyCheck)
						});
					}
					break;
				case 2:
					for (let i = 0; i < baseSpawn * 0.45; i++)
					{
						particleCount < MAXPARTS && spawnParticle({
							...defaultDict,
							iIn: particleCount++
						});
					}
					let energyCheck2 = energy[parent] * 0.666 * screenRatioA;
					for (let i = 0; i < baseSpawn * 0.3; i++)
					{
						particleCount < MAXPARTS && spawnParticle({
							...defaultDict,
							iIn: particleCount++,
							moveSpeedIn: getRndFlt(0, energyCheck2)
						});
					}
					defaultDict.colIn = getRndInt(0, maxCols);
					energyCheck2 *= 0.5;
					for (let i = 0; i < baseSpawn * 0.3; i++)
					{
						particleCount < MAXPARTS && spawnParticle({
							...defaultDict,
							iIn: particleCount++,
							moveSpeedIn: getRndFlt(0, energyCheck2)
						});
					}
					break;
				case 3:
					defaultDict.exDataIn = getRndInt(0, 1);
					for (let i = 0; i < baseSpawn; i++)
					{
						particleCount < MAXPARTS && spawnSparkleParticle({
							...defaultDict,
							iIn: particleCount++
						});
					}
					break;
				case 4:
					defaultDict.drawAngleIn = Math.floor(Math.random() * vecAmt);
					defaultDict.splitCountIn = getRndInt(2, 5);
					switch (defaultDict.splitCountIn)
					{
						case 5:
							defaultDict.colIn5 = getRndInt(0, maxCols);
							defaultDict.colIn4 = getRndInt(0, maxCols);
							defaultDict.colIn3 = getRndInt(0, maxCols);
							break;
						case 4:
							defaultDict.colIn4 = getRndInt(0, maxCols);
							defaultDict.colIn3 = getRndInt(0, maxCols);
							break;
						case 3:
							defaultDict.colIn3 = getRndInt(0, maxCols);
							break;
					}
					for (let i = 0; i < baseSpawn; i++)
					{
						particleCount < MAXPARTS && spawnSplitParticle({
							...defaultDict,
							iIn: particleCount++
						});
					}
					break;
				case 5:
					defaultDict.energyIn = energy[parent] * 0.5;
					defaultDict.gravModIn = 0.5;
					for (let i = 0; i < baseSpawn; i++)
					{
						particleCount < MAXPARTS && spawnParticle({
							...defaultDict,
							iIn: particleCount++,
							sizeChangeIn: getRndFlt(0.025, 0.045) * screenRatioA
						});
					}
					break;
				case 6:
					let max = energy[parent];
					let min = max * 0.666;
					for (let i = 0; i < baseSpawn * 0.333; i++)
					{
						particleCount < MAXPARTS && spawnParticle({
							...defaultDict,
							iIn: particleCount++,
							moveSpeedIn: getRndFlt(min, max)* screenRatioA
						});
					}
					defaultDict.colIn = getRndInt(0, maxCols);
					defaultDict.colIn2 = getRndInt(0, maxCols);
					max = min * 0.5;
					for (let i = 0; i < baseSpawn * 0.333; i++)
					{
						particleCount < MAXPARTS && spawnParticle({
							...defaultDict,
							iIn: particleCount++,
							moveSpeedIn: getRndFlt(max, min)* screenRatioA
						});						
					}
					defaultDict.colIn = getRndInt(0, maxCols);
					defaultDict.colIn2 = getRndInt(0, maxCols);
					for (let i = 0; i < baseSpawn * 0.333; i++)
					{
						particleCount < MAXPARTS && spawnParticle({
							...defaultDict,
							iIn: particleCount++,
							moveSpeedIn: getRndFlt(0, max) * screenRatioA
						});
					}
					break;
			}
			break;
		case 3:
			let case2Spawn = (partMod > 300 & getRndInt(0, 1)) ? 0 : Math.floor(10 / (1 + Math.pow(2.718, 0.02 * (Math.max(500, partMod) - 250))) + 1);
			let subDict =
			{
				energyIn: energy[parent] * 0.5,
				posXIn: posX[parent],
				posYIn: posY[parent],
				colIn: col[parent],
				colIn2: col2[parent],
				isRainbowIn: false,
				drawSizeIn: energy[parent] * 0.75 * screenRatioA,
				typeIn: -2
			}
			switch (exData[parent])
			{
				case 0:
					for (let i = 0; i < case2Spawn; i++)
					{
						particleCount < MAXPARTS && spawnParticle({
							...subDict,
							iIn: particleCount++, 
						});
					}
					break;
				case 1:
					subDict.colIn = col2[parent];
					for (let i = 0; i < case2Spawn; i++)
					{
						particleCount < MAXPARTS && spawnParticle({
							...subDict,
							iIn: particleCount++, 
						});
					}
					break;
			}
			break;
	}
}