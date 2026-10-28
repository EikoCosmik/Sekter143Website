////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialisers ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", function ()
{
	window.addEventListener('resize', resize);
	c = document.getElementById("mainCanvas");
	ctx = c.getContext("2d");
	resize();
	drawFrame();
	setTimeout(spawnFirework, 1000);
	setTimeout(hideNotif, 2000);
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Variables ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let forceDebug = false;

// Canvas
let c;
let ctx;
let centerX;
let centerY;
// vars
let particles = [];
const gravity = 0.1;
let maxVel = 0;
let padding = 75;
let spawnInt = 250;
let partMod = 100;
let maxSize = 6;
// Debuggers
let dFWVel = false;
let dFWSway = false;
let dFWSpawnX = 0;
let dFWForceX = 0.25;
let dFWPathCol = false;
let dLogPartCont = false;
let dPSAsPoint = false;
let dPSDisableBack = false;
let dPSDisableRocket = false;
let dPForceCheck = true;
let dPForceType = 4;
// Delta Time
let startTime = Date.now();
let countTime = startTime;
let oT = startTime;
let dT = 0;
let maxParts = 50;
// Testing
let testingAvg = {}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Main Functions //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function drawFrame(time)
{
	dT = Math.min((time - oT) / 16,4);
	oT = time;

	ctx.fillStyle = dPSDisableBack ? "#00000010" : "#00000060"
	ctx.fillRect(-100, -100, c.width + 100, c.height + 100);
	dLogPartCont && console.log(particles.length);
	for (let i = particles.length - 1; i >= 0; i--)
	{
		particles[i].update(i);
	}
	// if (dT >= 20)
	// {
	// 	partMod = Math.max(partMod - 10, 5);
	// 	countTime = Date.now();
	// 	document.getElementById("partModInput").value = partMod;
	// }
	// else if (partMod < maxParts && Date.now() - countTime > 10000)
	// {
	// 	partMod += 1;
	// 	document.getElementById("partModInput").value = partMod;
	// }
	if (Object.keys(testingAvg).length > 0)
	{
		Object.entries(testingAvg).forEach(([key, value]) =>
		{
			if(value.length > 10)
			{
				let sum = 0;
				value.forEach(el =>
				{
					sum += el[0] + el[1];
				});
				sum = sum / value.length;
				rad = sum / 2
				area = Math.round(Math.PI * (rad * rad));
				windowA = c.width * c.height;
				percent = (area/windowA)*100

				if (Object.keys(testingAvg).length == 6)
				{
					
					Object.entries(testingAvg).forEach(([sK, sV]) =>
					{
						console.log(sK + "| D:" + Math.round(sV) + " R:" + rad + " A:" + area + " P:" + percent + "%");
					});
				}//FIX LOGGER
			}
		});
	}//FIX LOGGER//FIX LOGGER//FIX LOGGER//FIX LOGGER//FIX LOGGER//FIX LOGGER//FIX LOGGER//FIX LOGGER//FIX LOGGER//FIX LOGGER//FIX LOGGER//FIX LOGGER//FIX LOGGER//FIX LOGGER//FIX LOGGER//FIX LOGGER//FIX LOGGER//FIX LOGGER//FIX LOGGER//FIX LOGGER//FIX LOGGER//FIX LOGGER//FIX LOGGER//FIX LOGGER//FIX LOGGER//FIX LOGGER//FIX LOGGER
	
	requestAnimationFrame(drawFrame);
}

function spawnFirework()
{
	particles.push(new fireWork());
	setTimeout(spawnFirework, spawnInt);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Classes /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class fireWork
{
	constructor ()
	{
		//Drawing
		this.size = getRndInt(1, 6);
		this.drawSize = this.size * 3;
		this.halfSize = parseInt(this.drawSize) / 2;
		//Positioning		
		switch (dFWSpawnX)
		{
			case 0: //Default
				this.posX = getRndFlt(c.width * 0.25, c.width * 0.75);
				break;
			case 1: //Debug
				this.posX = c.width * dFWForceX;
				break;
			case 2: //Debug
				switch (getRndInt(0, 2))
				{
					case 0:
						this.posX = c.width * 0.25;
						break
					case 1:
						this.posX = c.width * 0.5;
						break
					case 2:
						this.posX = c.width * 0.75;
						break
				}
				break;
		}
		this.posY = c.height;
		//Height
		this.velocity = (dFWVel) ? maxVel : getRndFlt(5, maxVel); //If debug Else chance
		this.startVel = this.velocity;
		//Distance
		this.rndPath = getRndInt(0, 2);
		switch (true)
		{
			case this.posX < centerX:
				if (this.rndPath < 1)
				{
					this.pathType = 2;
					this.color = (dFWPathCol) ? "#ff0000" : "#333333";
				}
				else if (this.rndPath < 2)
				{
					this.pathType = 0;
					this.color = (dFWPathCol) ? "#00ff00" : "#333333";
				}
				else
				{
					this.pathType = 1;
					this.color = (dFWPathCol) ? "#0000ff" : "#333333";
				}
				break;
			case this.posX > centerX:
				if (this.rndPath < 1)
				{
					this.pathType = 0;
					this.color = (dFWPathCol) ? "#ff7700" : "#333333"; //55ff00
				}
				else if (this.rndPath < 2)
				{
					this.pathType = 2;
					this.color = (dFWPathCol) ? "#77ff00" : "#333333"; //ff5500
				}
				else
				{
					this.pathType = 1;
					this.color = (dFWPathCol) ? "#0077ff" : "#333333";
				}
				break;
			default:
				this.pathType = getRndInt(0, 2);
				this.color = "#333333";
				if (dFWPathCol)
				{
					switch (this.pathType)
					{
						case 0:
							this.color = "#ff00ff";
							break;
						case 1:
							this.color = "#00ffff";
							break;
						case 2:
							this.color = "#ffff00";
							break;
					}
				}
				break;
		}
		switch (this.pathType)
		{
			case 0:
				this.maxDist = this.posX - padding;
				this.maxSway = this.maxDist / (((10 * this.velocity) - 10) + 1);
				break;
			case 1:
				this.maxDist = Math.abs(this.posX - centerX);
				if (this.posX > centerX)
				{
					this.maxSway = this.maxDist / (((10 * this.velocity) - 10) + 1);
				}
				else if (this.posX < centerX)
				{
					this.maxSway = -(this.maxDist / (((10 * this.velocity) - 10) + 1));
				}
				else if (getRndInt(0, 1) == 0)
				{
					this.maxSway = this.maxDist / (((10 * this.velocity) - 10) + 1);
				}
				else
				{
					this.maxSway = -(this.maxDist / (((10 * this.velocity) - 10) + 1));
				}
				break;
			case 2:
				this.maxDist = c.width - this.posX - padding;
				this.maxSway = -(this.maxDist / (((10 * this.velocity) - 10) + 1));
				break;
		}
		this.sway = (dFWSway) ? this.maxSway : getRndFlt(0, this.maxSway);
		//Lifespan
		this.isLive = true;
		this.oldY = -99999;
		//Child Particles
		this.children = [];
		this.childMaxX = 0;
		this.childMinX = 99999999;
		this.parentColOne = getRndCol();
		this.parentColTwo = getRndCol();
		this.parentColThree = getRndCol();
		this.isRainbow = false;
		if (getRndInt(0, 99) == 0)
		{
			this.isRainbow = true;
		}
	}

	update(i)
	{
		if (this.isLive)
		{
			this.velocity -= gravity * dT;
			this.posY -= this.velocity * dT;
			this.posX -= this.sway * dT;
			if (this.posY > c.height + 50 || (this.posY > this.oldY - 1 && this.posY < this.oldY + 1))
			{
				this.isLive = false;
				// if (Math.floor(Math.abs(this.posX - this.originalX)) > this.maxDist)
				// {
				// 	console.log(Math.abs(this.posX - this.originalX), this.startVel, this.sway)
				// }
				this.spawnChildren();
				playSound(this.size);
			}
			else
			{
				this.oldY = this.posY;
				ctx.fillStyle = dPSDisableRocket ? this.color + "00" : this.color;
				ctx.fillRect(this.posX - this.halfSize, this.posY - this.halfSize, this.drawSize, this.drawSize);
			}
		}
		else if (this.children.length == 0)
		{
			if (!(this.size in testingAvg))
			{
				testingAvg[this.size] = []
			}
			testingAvg[this.size].push([Math.abs(this.childMaxX - this.posX), Math.abs(this.childMinX - this.posX)]);
			particles.splice(i, 1);
		}
		else
		{
			this.children.forEach((part, index) =>
			{
				this.childMaxX = (part.posX > this.childMaxX) ? part.posX : this.childMaxX;
				this.childMinX = (part.posX < this.childMinX) ? part.posX : this.childMinX;
				if (!part.update(index))
				{
					this.children.splice(i, 1);
				}
			});
		}
	}

	spawnChildren()
	{
		let pType = dPForceCheck ? dPForceType : getRndInt(0, 4);
		switch (pType)
		{
			case 0:
				for (let i = 0; i < this.size * partMod * 0.5; i++)
				{
					this.children.push(new particle({ inSize: this.size, inX: this.posX, inY: this.posY, inColors: [this.parentColOne], isRainbow: this.isRainbow }));
					this.children.push(new particle({ inSize: this.size * 0.5, inX: this.posX, inY: this.posY, inColors: [this.parentColTwo], isRainbow: this.isRainbow }));
				}
				break;
			case 1:
				for (let i = 0; i < this.size * partMod * 0.333; i++)
				{
					this.children.push(new particle({ inSize: this.size, inX: this.posX, inY: this.posY, inColors: [this.parentColOne], isRainbow: this.isRainbow }));
					this.children.push(new particle({ inSize: this.size * 0.666, inX: this.posX, inY: this.posY, inColors: [this.parentColTwo], isRainbow: this.isRainbow }));
					this.children.push(new particle({ inSize: this.size * 0.333, inX: this.posX, inY: this.posY, inColors: [this.parentColThree], isRainbow: this.isRainbow }));
				}
				break;
			case 2:
				let stepType = getRndInt(0, 1);
				for (let i = 0; i < this.size * partMod; i++)
				{
					this.children.push(new sparkleParticle({ inSize: this.size, inX: this.posX, inY: this.posY, inColors: [this.parentColOne, this.parentColTwo], isRainbow: this.isRainbow, stepTypeIn: stepType }));
				}
				break;
			case 3:
				let calcDrawAngle = Math.random() * 2 * Math.PI;
				for (let i = 0; i < this.size * partMod; i++)
				{
					this.children.push(new splitParticle({ inSize: this.size, inX: this.posX, inY: this.posY, inColors: [this.parentColOne, this.parentColTwo], isRainbow: this.isRainbow, drawAngle: calcDrawAngle }));
				}
				break;
			// case 4:
			// 	for (let i = 0; i < this.size * partMod; i++)
			// 	{
			// 		this.children.push(new hangParticle({ inSize: this.size, inX: this.posX, inY: this.posY, inColors: [this.parentColOne], isRainbow: this.isRainbow, inVeloctiy: this.startVel }));
			// 	}
			// 	break;
			default:
				for (let i = 0; i < this.size * partMod; i++)
				{
					this.children.push(new particle({ inSize: this.size, inX: this.posX, inY: this.posY, inColors: [this.parentColOne], isRainbow: this.isRainbow }));
				}
				break;
		}
	}
}

class baseParticle
{
	constructor (dictIn)
	{
		this.size = dictIn.inSize;
		this.drawSize = ('drawSize' in dictIn) ? dictIn.drawSize : (this.size * 1.5)+2;
		this.halfSize = parseInt(this.drawSize) / 2;
		this.posX = dictIn.inX;
		this.posY = dictIn.inY;
		this.drawMod = ('drawMod' in dictIn) ? dictIn.drawMod : 0.35;
		this.moveAngle = ('moveAngle' in dictIn) ? dictIn.moveAngle : Math.random() * 2 * Math.PI;
		this.moveSpeed = ('moveSpeed' in dictIn) ? dictIn.moveSpeed : getRndFlt(0.01, dictIn.inSize);
		this.moveX = this.moveSpeed * Math.cos(this.moveAngle);
		this.moveY = this.moveSpeed * Math.sin(this.moveAngle);
		this.col = dictIn.inColors[0];
	}

	update(i)
	{
		this.moveY -= gravity * 0.1 * this.moveSpeed * dT;
		this.posY -= this.moveY * dT;
		this.posX -= this.moveX * dT;
		this.drawSize = dPSAsPoint ? this.drawSize - (this.size) : this.drawSize - (gravity * this.size * this.drawMod) * dT;
		this.drawSize = (this.drawSize <= 0) ? 0 : this.drawSize;
		if (this.drawSize <= 0)
		{
			return false;
		}
		else
		{
			ctx.fillStyle = this.col;
			ctx.fillRect(this.posX - this.halfSize, this.posY - this.halfSize, this.drawSize, this.drawSize);
			return true;
		}
	}
}

class particle extends baseParticle
{
	constructor (dictIn)
	{
		if (dictIn.isRainbow)
		{
			dictIn.inColors[0] = getRndCol();
		}
		super(dictIn);
	}
}

class splitParticle extends baseParticle
{
	constructor (dictIn)
	{
		let angleLimits = [forceMod((dictIn.drawAngle + (2 * Math.PI * 0.25)), (2 * Math.PI)), forceMod((dictIn.drawAngle - (2 * Math.PI * 0.25)), (2 * Math.PI))]
		dictIn.moveAngle = Math.random() * 2 * Math.PI;
		if (dictIn.moveAngle >= Math.min(angleLimits[0], angleLimits[1]) && dictIn.moveAngle <= Math.max(angleLimits[0], angleLimits[1]))
		{
			if (dictIn.inRainbow)
			{
				dictIn.inColors[0] = getRndCol();
			}
			else
			{
				dictIn.inColors[0] = dictIn.inColors[1];
			}
		}
		super(dictIn);
	}
}

class sparkleParticle extends baseParticle
{
	constructor (dictIn)
	{
		let angleLimits = [forceMod((dictIn.drawAngle + (2 * Math.PI * 0.25)), (2 * Math.PI)), forceMod((dictIn.drawAngle - (2 * Math.PI * 0.25)), (2 * Math.PI))]
		dictIn.moveAngle = Math.random() * 2 * Math.PI;
		if (dictIn.moveAngle >= Math.min(angleLimits[0], angleLimits[1]) && dictIn.moveAngle <= Math.max(angleLimits[0], angleLimits[1]))
		{
			if (dictIn.inRainbow)
			{
				dictIn.inColors[0] = getRndCol();
			}
			else
			{
				dictIn.inColors[0] = dictIn.inColors[1];
			}
		}
		super(dictIn);
		this.partDict = dictIn;
		this.children = []
		this.isLive = true;
	}
	
	update(i)
	{
		if (this.isLive)
		{
			this.moveY -= gravity * 0.1 * this.moveSpeed * dT;
			this.posY -= this.moveY * dT;
			this.posX -= this.moveX * dT;
			this.drawSize = dPSAsPoint ? this.drawSize - (this.size) : this.drawSize - (gravity * this.size * this.drawMod) * dT;
			this.drawSize = (this.drawSize <= 0) ? 0 : this.drawSize;
			if (this.drawSize <= 0)
			{
				this.spawnChildren();
				this.isLive = false;
			}
			else
			{
				ctx.fillStyle = this.col;
				ctx.fillRect(this.posX - this.halfSize, this.posY - this.halfSize, this.drawSize, this.drawSize);
			}
			return true;
		}
		else if (this.children.length == 0)
		{
			return false;
		}
		else
		{
			for (let i = this.children.length - 1; i >= 0; i--)
			{
				if (!this.children[i].update(i))
				{
					this.children.splice(i, 1);
				}
			}
			return true;
		}
	}

	spawnChildren()
	{
		if (this.partDict.isRainbow)
		{
			switch (this.partDict.stepTypeIn)
			{
				case 0:
					let SubColor = getRndCol();
					for (let i = 0; i < 5; i++)
					{
						this.children.push(new particle({ inSize: this.partDict.inSize * 0.2, inX: this.posX, inY: this.posY, inColors: [SubColor], isRainbow: false, drawMod: 1.25, moveSpeed: getRndFlt(0, this.partDict.inSize * 0.3)}))
					}
					break;
				case 1:
					for (let i = 0; i < 5; i++)
					{
						this.children.push(new particle({ inSize: this.partDict.inSize * 0.2, inX: this.posX, inY: this.posY, inColors: [this.partDict.inColors[0]], isRainbow: false, drawMod: 1.25, moveSpeed: getRndFlt(0, this.partDict.inSize * 0.3) }))
					}
					break;
			}
		}
		else
		{
			switch (this.partDict.stepTypeIn)
			{
				case 0:
					for (let i = 0; i < 5; i++)
					{
						this.children.push(new particle({ inSize: this.partDict.inSize * 0.2, inX: this.posX, inY: this.posY, inColors: [this.partDict.inColors[0]], isRainbow: false, drawMod: 1.25, moveSpeed: getRndFlt(0, this.partDict.inSize * 0.3) }))
					}
					break;
				case 1:
					for (let i = 0; i < 5; i++)
					{
						this.children.push(new particle({ inSize: this.partDict.inSize * 0.2, inX: this.posX, inY: this.posY, inColors: [this.partDict.inColors[1]], isRainbow: false, drawMod: 1.25, moveSpeed: getRndFlt(0, this.partDict.inSize * 0.3) }))
					}
					break;
			}
		}
	}
}

class hangParticle extends baseParticle
{
	constructor (dictIn)
	{
		if (dictIn.isRainbow)
		{
			dictIn.inColors[0] = getRndCol();
		}
		dictIn.drawSize = dictIn.inSize * 0.666;
		dictIn.drawMod = 0.85 / dictIn.inVeloctiy;
		dictIn.moveSpeed = getRndFlt(0, dictIn.inSize/2);
		super(dictIn);
		this.velocity = dictIn.inVeloctiy;
		this.moveRight = (this.moveX >= 0) ? false : true;
	} 
	update(i)
	{
		this.posY -= this.moveY * dT;
		this.moveY -= gravity * 1.5 * dT;
		this.posX -= this.moveX * 1.25 * dT;		
		this.drawSize = dPSAsPoint ? this.drawSize - (this.size) : this.drawSize - (gravity * this.size * this.drawMod) * dT;
		if (this.drawSize <= 0)
		{
			return false;
		}
		else
		{
			ctx.fillStyle = this.col;
			ctx.fillRect(this.posX - this.halfSize, this.posY - this.halfSize, this.drawSize, this.drawSize);
			return true;
		}
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Utils ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function playSound(fWSize)
{
	return false
	var audio;
	switch (getRndInt(0, 1))
	{
		case 0:
			audio = new Audio('ex1.wav');
			break;
		case 1:
			audio = new Audio('ex3.wav');
			break;
	}
	audio.volume = (0.1 * fWSize) * 0.1;
	audio.play();
}

function resize()
{
	c.width = window.innerWidth;
	c.height = window.innerHeight;
	centerX = window.innerWidth / 2;
	centerY = window.innerHeight / 2;
	let ratio = 1080 / c.height;
	document.getElementById("mainCanvas").style.width = c.width;
	document.getElementById("mainCanvas").style.height = c.height;
	padding = Math.floor(c.height / 15);
	maxVel = (0.5 + Math.sqrt(72.25 + (20 * (c.height - padding)))) / 10;
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

function getRndCol()
{
	outcol = "#";
	tempArr = ["ff", "00"]
	var num = Math.floor(Math.random() * 256);
	tempArr.push(num.toString(16).padStart(2, '0'));
	while (tempArr.length > 0)
	{
		outcol += tempArr.splice(getRndInt(0, tempArr.length - 1), 1)
	}
	return outcol
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Debug Menu //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", function ()
{
	document.getElementById("controls").addEventListener("change", function ()
	{
		spawnInt = parseInt(document.getElementById("spawnIntInput").value);
		partMod = parseInt(document.getElementById("partModInput").value);

		document.querySelectorAll('#controls .debug').forEach(item =>
		{
			item.classList.toggle("isHidden", !document.getElementById("showDebugCheck").checked);
		});

		dFWVel = document.getElementById("dFWVelCheck").checked;
		dFWSway = document.getElementById("dFWSwayCheck").checked;
		dFWSpawnX = parseInt(document.getElementById("dFWSpawnXInput").value);
		dFWForceX = parseFloat(document.getElementById("dFWForceXInput").value);
		dFWPathCol = document.getElementById("dFWPathColCheck").checked;
		dLogPartCont = document.getElementById("dLogPartContCheck").checked;
		dPSAsPoint = document.getElementById("dPSAsPointCheck").checked;
		dPSDisableBack = document.getElementById("dPSDisableBackCheck").checked;
		dPSDisableRocket = document.getElementById("dPSDisableRocketCheck").checked;
		dPForceCheck = document.getElementById("dPForceCheckCheck").checked;
		dPForceType = parseInt(document.getElementById("dPForceTypeInput").value);
	});

	if (forceDebug)
	{
		document.getElementById("controls").classList.toggle("isHidden", false);
		document.getElementById("showDebugCheck").checked = true;
		document.querySelectorAll('#controls .debug').forEach(item =>
		{
			item.classList.toggle("isHidden", false);
		});
	}
});

document.addEventListener('keydown', function (event)
{
	if (event.shiftKey & event.key == "P")
	{
		document.getElementById("controls").classList.toggle("isHidden");
	}
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Debug Menu //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////