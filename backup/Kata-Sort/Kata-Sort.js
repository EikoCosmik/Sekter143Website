////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Vars ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let algBlockEl;
let elementCount = 59;
let timeStep = 0;
let allSolved = true;
let allReset = false;

const algDict = 
{
	bogoSort: {},
	bubbleSort: {},
	insertionSort: {},
	quickSort: {},
	RadixLSDSort: {}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Setup ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function fYScramble(array)
{
	for (let i = array.length - 1; i > 0; i--)
	{
		// Pick a random index from 0 to i
		const j = Math.floor(Math.random() * (i + 1));

		// Swap elements array[i] and array[j]
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

function loadKata()
{
	algBlockEl = document.getElementById("algBlocks");

	Object.entries(algDict).forEach(([k, v]) =>
	{
		algBlockEl.appendChild(getSortBlock(k));
		v.el = document.getElementById(k);
		v.timer = document.getElementById(`${k}time`);
		v.solved = false;
	});

	reset();
}

function getSortBlock(id)
{
	let newEl = document.createElement("div");
	newEl.classList.add("solveBlock");
	let headEl = document.createElement("h3");
	headEl.innerHTML = `${id}`;
	let timeEl = document.createElement("div");
	timeEl.id = `${id}time`;
	headEl.appendChild(timeEl);
	newEl.appendChild(headEl);
	let sortEl = document.createElement("div");
	sortEl.classList.add("sortBlock");
	sortEl.id = id;
	newEl.appendChild(sortEl);
	return newEl;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Inits ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function reset()
{
	if(allSolved)
	{
		allSolved = false;
		const tempArr = [];
		for(i = 1; i <= elementCount; i++)
		{
			tempArr.push(i);
		}
		fYScramble(tempArr);
		Object.entries(algDict).forEach(([k, v]) =>
		{
			tempArr.forEach((el, i) =>
			{
				let newEl = document.createElement("div");
				newEl.style.gridColumn = i + 1;
				newEl.style.height = ((el / elementCount) * 100) + "%";
				newEl.classList.add("column");
				v.el.appendChild(newEl);
			});

			v.arr = [...tempArr];
		});
		allReset = true;
		triggerSorts();
	}
}

function triggerSorts()
{		
	Object.entries(algDict).forEach(([k, v]) =>
	{
		v.mainFunction();
	});
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Stress //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function stressTest(amnt)
{
	let logDict = {}
	Object.entries(algDict).forEach(([k, v]) =>
	{
		logDict[k] = {};
		logDict[k].time = 0;
		logDict[k].verify = [];
		logDict[k].err = false;
	});
	for(let i = 0; i < amnt; i++)
	{
		const testArr = [];
		for(let j = 1; j <= 5000; j++)
		{
			testArr.push(j);
		}
		fYScramble(testArr);
		Object.entries(logDict).forEach(([k, v]) =>
		{
			let copyArr = [...testArr]
			let res = algDict[k].timeAlg(copyArr);
			let resv = res[0];
			let t = res[1];
			logDict[k].time += t;
			logDict[k].verify.push(resv);
		});
	}
	Object.entries(logDict).forEach(([k, v]) =>
	{
		logDict[k].time = logDict[k].time / amnt;
		logDict[k].verify.forEach(element =>
		{
			if(!element)
			{
				logDict[k].err = true;
			}
		});
	});
	return logDict
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Helpers /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function checkArr(dict)
{
	let arrlength = dict.arr.length;
	let solved = true;
	for(let i = 0; i < arrlength - 1; i++)
	{
		if(dict.arr[i] > dict.arr[i+1])
		{
			solved = false;
			for(let j = 0; j < arrlength - 1; j++)
			{
				let item1 = dict.el.querySelector(`[style*="grid-column: ${j+1}"]`);
				item1.classList.remove("solved")
			}
			break;
		}
		else
		{
			let item1 = dict.el.querySelector(`[style*="grid-column: ${i+1}"]`);
			item1.classList.add("solved");
			draw(dict);
			await delay();
		}
	}
	for(let i = 0; i < arrlength - 1; i++)
	{
		let item1 = dict.el.querySelector(`[style*="grid-column: ${i+1}"]`);
		item1.classList.remove("solved")
	}
	return solved;
}

function verifySort(arr)
{
	let solved = true;
	for(let i = 0; i < arr.length - 1; i++)
	{
		if(arr[i] > arr[i+1])
		{
			solved = false;
		}
	}
	return solved;
}

function draw(dict)
{
	let displayArr = dict.el.getElementsByClassName("column");
	Array.prototype.forEach.call(displayArr, function (el, i)
	{
		el.style.height = ((dict.arr[i] / elementCount) * 100) + "%";
	});
}

async function delay(ms = timeStep)
{
	return new Promise(resolve => setTimeout(resolve, ms));
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// sortAlgs ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////
// BogoSort //////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

algDict.bogoSort.externalTime = 0;

algDict.bogoSort.mainFunction = async function ()
{
	let displayArr = algDict.bogoSort.el.getElementsByClassName("column");
	Array.prototype.forEach.call(displayArr, function (el, i)
	{
		el.classList.add("check");
	});
	let excludedTime = 0;
	let startExclude;
	let t0 = performance.now();
	while(!algDict.bogoSort.solved)
	{
		fYScramble(algDict.bogoSort.arr)
		if (await checkArr(algDict.bogoSort))
		{
			algDict.bogoSort.solved = true;
			algDict.bogoSort.el.classList.add("solved");
		}
		//notTimed//
			startExclude = performance.now();
			draw(algDict.bogoSort)
			await delay();
			excludedTime += performance.now() - startExclude;
		//notTimed//
	}
	const finalTime = performance.now() - t0 - excludedTime;
	Array.prototype.forEach.call(displayArr, function (el, i)
	{
		el.classList.remove("check");
	});
	algDict.bogoSort.timer.innerHTML = finalTime;
}

algDict.bogoSort.myAttempt = async function ()
{
	let time = 0;	
	let displayArr = algDict.bogoSort.el.getElementsByClassName("column");
	Array.prototype.forEach.call(displayArr, function (el, i)
	{
		el.classList.add("check");
	});
	const t0 = performance.now();
	while(!algDict.bogoSort.solved)
	{
		fYScramble(algDict.bogoSort.arr)
		if (await checkArr(algDict.bogoSort))
		{
			algDict.bogoSort.solved = true;
			algDict.bogoSort.el.classList.add("solved");
		}
		//notTimed//
			let p1 = performance.now();
			draw(algDict.bogoSort)
			await delay();
			let p2 = performance.now();
			time -= p2 - p1;
		//notTimed//
	}
	time += performance.now() - t0;
	Array.prototype.forEach.call(displayArr, function (el, i)
	{
		el.classList.remove("check");
	});
	algDict.bogoSort.timer.innerHTML = time;
}

algDict.bogoSort.rawAlg = function (arr)
{
	let isSolved = false
	while(!isSolved)
	{
		fYScramble(arr)
		isSolved = true;

		for(i = 0; i < arr.length - 1; i++)
		{
			if(arr[i] > arr[i+1])
			{
				isSolved = false;
			}
		}
	}
	return arr;
}

algDict.bogoSort.timeAlg = function (arr)
{
	return [verifySort(arr), 1]
}

//////////////////////////////////////////////////////////////////////////////////////////
// BubbleSort ////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

algDict.bubbleSort.externalTime = 0;

algDict.bubbleSort.mainFunction = async function ()
{
	let excludedTime = 0;
	let startExclude;
	let t0 = performance.now();

	const arrayLength = algDict.bubbleSort.arr.length;
    let isSwapped;

    for (let i = 0; i < arrayLength; i++)
	{		
		isSwapped = false;

        for (let j = 0; j < arrayLength - i - 1; j++)
		{
			//notTimed//
				startExclude = performance.now();
				let item1 = algDict.bubbleSort.el.querySelector(`[style*="grid-column: ${j+1}"]`);	
				let item2 = algDict.bubbleSort.el.querySelector(`[style*="grid-column: ${j+2}"]`);
				excludedTime += performance.now() - startExclude;
			//notTimed//

            if (algDict.bubbleSort.arr[j] > algDict.bubbleSort.arr[j + 1])
			{
				//notTimed//
					startExclude = performance.now();
					item1.classList.add("swap");
					item2.classList.add("swap");
					excludedTime += performance.now() - startExclude;
				//notTimed//

                [algDict.bubbleSort.arr[j], algDict.bubbleSort.arr[j + 1]] = [algDict.bubbleSort.arr[j + 1], algDict.bubbleSort.arr[j]];
                isSwapped = true;

				//notTimed//
					startExclude = performance.now();
					draw(algDict.bubbleSort);
					await delay();
					item1.classList.remove("swap");
					item2.classList.remove("swap");
					excludedTime += performance.now() - startExclude;
				//notTimed//
            }
			else
			{
				//notTimed//
					startExclude = performance.now();
					item1.classList.add("check");
					item2.classList.add("check");
					draw(algDict.bubbleSort);
					await delay();
					item1.classList.remove("check");
					item2.classList.remove("check");
					excludedTime += performance.now() - startExclude;
				//notTimed//
			}
        }

        if (!isSwapped)
		{
            break;
		}
    }
	//Time
	const finalTime = performance.now() - t0 - excludedTime;
	// Verify
	if (await checkArr(algDict.bubbleSort))
	{
		algDict.bubbleSort.solved = true;
		algDict.bubbleSort.el.classList.add("solved");
	}
	//Update
	algDict.bubbleSort.timer.innerHTML = finalTime;
}

algDict.bubbleSort.myAttempt = async function ()
{
	let time = 0;	
	while(!algDict.bubbleSort.solved)
	{
		const t0 = performance.now();
		// bubbleSort
		for(let i = 0; i < algDict.bubbleSort.arr.length - 1; i++)
		{
			//notTimed//
				let p1 = performance.now();
				let item1 = algDict.bubbleSort.el.querySelector(`[style*="grid-column: ${i+1}"]`);
				let item2 = algDict.bubbleSort.el.querySelector(`[style*="grid-column: ${i+2}"]`);
				let p2 = performance.now();
				time -= p2-p1;
			//notTimed//

			if (algDict.bubbleSort.arr[i] > algDict.bubbleSort.arr[i+1])
			{
				//notTimed//
					p1 = performance.now();
					item1.classList.add("swap");
					item2.classList.add("swap");
					p2 = performance.now();
					time -= p2-p1;
				//notTimed//

				let tI = algDict.bubbleSort.arr[i];
				algDict.bubbleSort.arr[i] = algDict.bubbleSort.arr[i+1];
				algDict.bubbleSort.arr[i+1] = tI;
			}
			else
			{
				//notTimed//
					p1 = performance.now();
					item1.classList.add("leave");
					item2.classList.add("leave");
					p2 = performance.now();
					time -= p2-p1;
				//notTimed//
			}
			//notTimed//
				p1 = performance.now();
				draw(algDict.bubbleSort);
				await delay();
				item1.classList.remove("leave");
				item2.classList.remove("leave");
				item1.classList.remove("swap");
				item2.classList.remove("swap");
				p2 = performance.now();
				time -= p2-p1;
			//notTimed//
		}
		// Verify
		if (await checkArr(algDict.bubbleSort.arr))
		{
			algDict.bubbleSort.solved = true;
			algDict.bubbleSort.el.classList.add("solved");
		}
		//Time
		let stopTime = performance.now();
		time += stopTime - t0;
		// Update
		algDict.bubbleSort.timer.innerHTML = time;
	}
}

algDict.bubbleSort.rawAlg = function (arr)
{
	const arrayLength = arr.length;
    let isSwapped;
    for (let i = 0; i < arrayLength; i++)
	{		
		isSwapped = false;

        for (let j = 0; j < arrayLength - i - 1; j++)
		{
            if (arr[j] > arr[j + 1])
			{
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                isSwapped = true;
            }
        }

        if (!isSwapped)
		{
            break;
		}
    }
	return arr
}

algDict.bubbleSort.timeAlg = function (arr)
{
	const t0 = performance.now();
	const arrayLength = arr.length;
    let isSwapped;
    for (let i = 0; i < arrayLength; i++)
	{		
		isSwapped = false;

        for (let j = 0; j < arrayLength - i - 1; j++)
		{
            if (arr[j] > arr[j + 1])
			{
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                isSwapped = true;
            }
        }

        if (!isSwapped)
		{
            break;
		}
    }
	let time = performance.now() - t0;
	return [verifySort(arr), time]
}

//////////////////////////////////////////////////////////////////////////////////////////
// insertionSort /////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

algDict.insertionSort.externalTime = 0;

algDict.insertionSort.mainFunction = async function ()
{
	let excludedTime = 0;
	let startExclude;
	let t0 = performance.now();

	for (let i = 1; i < algDict.insertionSort.arr.length; i++)
	{
		//notTimed//
			startExclude = performance.now();
			let item1 = algDict.insertionSort.el.querySelector(`[style*="grid-column: ${i+1}"]`);
			item1.classList.add("swap");
			excludedTime += performance.now() - startExclude;
		//notTimed//

		let key = algDict.insertionSort.arr[i];
		let j = i - 1;

		while (j >= 0 && algDict.insertionSort.arr[j] > key)
		{
			//notTimed//
				startExclude = performance.now();
				let item2 = algDict.insertionSort.el.querySelector(`[style*="grid-column: ${j+1}"]`);
				item2.classList.add("check");
				excludedTime += performance.now() - startExclude;
			//notTimed//
			
			algDict.insertionSort.arr[j + 1] = algDict.insertionSort.arr[j];
			j = j - 1;

			//notTimed//
				startExclude = performance.now();
				await delay();
				item2.classList.remove("check");
				excludedTime += performance.now() - startExclude;
			//notTimed//
		}
		algDict.insertionSort.arr[j + 1] = key;
		//notTimed//
			startExclude = performance.now();
			item1.classList.remove("swap");
			draw(algDict.insertionSort);
			excludedTime += performance.now() - startExclude;
		//notTimed//
	}
	//Time
	const finalTime = performance.now() - t0 - excludedTime;
	// Verify
	if (await checkArr(algDict.insertionSort))
	{
		algDict.insertionSort.solved = true;
		algDict.insertionSort.el.classList.add("solved");
	}
	//Update
	algDict.insertionSort.timer.innerHTML = finalTime;
}

algDict.insertionSort.myAttempt = async function ()
{
	let time = 0;
	let sorted = [algDict.insertionSort.arr[0]];
	let unsorted = algDict.insertionSort.arr.slice(1);
	while(!algDict.insertionSort.solved)
	{	
		const t0 = performance.now();
		for (let i = unsorted.length - 1; i >= 0; i--)
		{
			//notTimed//
				let p1 = performance.now();
				let item1 = algDict.insertionSort.el.querySelector(`[style*="grid-column: ${unsorted.length+sorted.length}"]`);
				let item2;
				item1.classList.add("swap");
				let p2 = performance.now();
				time -= p2 - p1;
			//notTimed//
			const item = unsorted.pop();
			let inserted = false;
			for (let j = sorted.length - 1; j >= 0; j--)
			{
				//notTimed//
					p1 = performance.now();
					item2 = algDict.insertionSort.el.querySelector(`[style*="grid-column: ${j+1}"]`);
					item2.classList.add("leave");
					p2 = performance.now();
					time -= p2 - p1;
				//notTimed//
				if(item > sorted[j])
				{
					//notTimed//
						p1 = performance.now();
						item2.classList.remove("leave");
						item2.classList.add("swap");
						p2 = performance.now();
						time -= p2 - p1;
					//notTimed//
					sorted.splice(j+1,0,item);
					inserted = true;
				}
				else if(j == 0)
				{
					//notTimed//
						p1 = performance.now();
						item2.classList.remove("leave");
						item2.classList.add("swap");
						p2 = performance.now();
						time -= p2 - p1;
					//notTimed//
					sorted.splice(0,0,item);
					inserted = true;
				}
				algDict.insertionSort.arr = sorted.concat(unsorted);
				//notTimed//
					p1 = performance.now();
					draw(algDict.insertionSort);
					await delay();
					item2.classList.remove("swap");
					item2.classList.remove("leave");
					p2 = performance.now();
					time -= p2 - p1;
				//notTimed//
				if(inserted)
				{
					break;
				}
			}
			//notTimed//
				p1 = performance.now();
				item1.classList.remove("swap");
				p2 = performance.now();
				time -= p2 - p1;
			//notTimed//
		}
		// Verify
		if (await checkArr(algDict.insertionSort))
		{
			algDict.insertionSort.solved = true;
			algDict.insertionSort.el.classList.add("solved");
		}
		//Time
		time += performance.now() - t0;
		//Update
		algDict.insertionSort.timer.innerHTML = time;
	}
}

algDict.insertionSort.rawAlg = function (arr)
{
	for (let i = 1; i < arr.length; i++)
	{
		let key = arr[i];
		let j = i - 1;

		while (j >= 0 && arr[j] > key)
		{			
			arr[j + 1] = arr[j];
			j = j - 1;
		}

		arr[j + 1] = key;
	}
	return arr;
}

algDict.insertionSort.timeAlg = function (arr)
{
	const t0 = performance.now();
	for (let i = 1; i < arr.length; i++)
	{
		let key = arr[i];
		let j = i - 1;

		while (j >= 0 && arr[j] > key)
		{			
			arr[j + 1] = arr[j];
			j = j - 1;
		}

		arr[j + 1] = key;
	}
	let time = performance.now() - t0;
	return [verifySort(arr), time]
}

//////////////////////////////////////////////////////////////////////////////////////////
// quickSort /////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

algDict.quickSort.externalTime = 0;
algDict.quickSort.excludedTime = 0;

algDict.quickSort.mainFunction = async function ()
{
	let t0 = performance.now();
	await algDict.quickSort.recursiveFunction(algDict.quickSort.arr);
	algDict.quickSort.externalTime += performance.now() - t0;
	const finalTime = algDict.quickSort.externalTime - algDict.quickSort.excludedTime;
	// Verify
	if (await checkArr(algDict.quickSort))
	{
		algDict.quickSort.solved = true;
		algDict.quickSort.el.classList.add("solved");
	}
	algDict.quickSort.timer.innerHTML = finalTime;
}

algDict.quickSort.recursiveFunction = async function (arr, low = 0, high = arr.length - 1)
{
	let startExclude;

	if (low >= high)
	{
		return arr;
	}

	//Partition
	let pivot = arr[high];
    let i = low - 1;

	//notTimed//
		startExclude = performance.now();
		let piEl = algDict.quickSort.el.querySelector(`[style*="grid-column: ${high+1}"]`);
		piEl.classList.add("pivot");

		for (let j = low; j <= high - 1; j++)
		{
			let item = algDict.quickSort.el.querySelector(`[style*="grid-column: ${j+1}"]`)
			item.classList.add("curSub");
		}
		algDict.quickSort.excludedTime += performance.now() - startExclude;
	//notTimed//

    for (let j = low; j <= high - 1; j++)
	{
		//notTimed//
			startExclude = performance.now();
			let item = algDict.quickSort.el.querySelector(`[style*="grid-column: ${j+1}"]`)
			algDict.quickSort.excludedTime += performance.now() - startExclude;
		//notTimed//

        if (arr[j] < pivot)
		{
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
			//notTimed//
				startExclude = performance.now();
				item.classList.add("swap");
				algDict.quickSort.excludedTime += performance.now() - startExclude;
			//notTimed//
        }
		else
		{
			//notTimed//
				startExclude = performance.now();
				item.classList.add("check");
				algDict.quickSort.excludedTime += performance.now() - startExclude;
			//notTimed//
		}

		//notTimed//
			startExclude = performance.now();
			draw(algDict.quickSort);
			await delay();
			item.classList.remove("swap");
			item.classList.remove("check");
			algDict.quickSort.excludedTime += performance.now() - startExclude;
		//notTimed//
    }
	//notTimed//
		startExclude = performance.now();
		for (let j = low; j <= high - 1; j++)
		{
			let item = algDict.quickSort.el.querySelector(`[style*="grid-column: ${j+1}"]`)
			item.classList.remove("curSub");
		}
		piEl.classList.remove("pivot");
		algDict.quickSort.excludedTime += performance.now() - startExclude;
	//notTimed//

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
	let pi = i + 1;
	//Partition
	
   	await algDict.quickSort.recursiveFunction(arr, low, pi - 1);
	await algDict.quickSort.recursiveFunction(arr, pi + 1, high);
}

algDict.quickSort.myAttempt = async function ()
{
	let solved = await algDict.quickSort.myAttemptRec(algDict.quickSort.arr);
	console.log(solved)
	draw(algDict.quickSort);
	return solved;
}

algDict.quickSort.myAttemptRec = async function (arr)
{
	let pivot = arr[Math.floor(arr.length * 0.5), 1];
	let high = [];
	let low = [];
	let same = [];
	
	for(let i = 0; i < arr.length; i++)
	{
		switch(true)
		{
			case arr[i] > pivot:
				high.push(arr[i]);
				break;
			case arr[i] < pivot:
				low.push(arr[i]);
				break;
			default:
				same.push(arr[i]);
				break;
		}
	}

	high = (high.length > 1) ? await algDict.quickSort.subFunction(high) : high;
	low = (low.length > 1) ? await algDict.quickSort.subFunction(low) : low;
	let outArr = [...low, ...same, ...high];
	
	return outArr;
}

algDict.quickSort.rawAlg = function (arr, low = 0, high = arr.length - 1)
{
	if (low >= high)
	{
		return arr;
	}

	let pivot = arr[high];
    let i = low - 1;

    for (let j = low; j <= high - 1; j++)
	{
        if (arr[j] < pivot)
		{
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
	let pi = i + 1;

   	algDict.quickSort.rawAlg(arr, low, pi - 1);
	algDict.quickSort.rawAlg(arr, pi + 1, high);

	return arr
}

algDict.quickSort.timeAlg = function (arr, low = 0, high = arr.length - 1)
{
	const t0 = performance.now();

	if (low >= high)
	{
		return arr;
	}

	let pivot = arr[high];
    let i = low - 1;

    for (let j = low; j <= high - 1; j++)
	{
        if (arr[j] < pivot)
		{
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
	let pi = i + 1;

   	algDict.quickSort.rawAlg(arr, low, pi - 1);
	algDict.quickSort.rawAlg(arr, pi + 1, high);

	let time = performance.now() - t0;
	return [verifySort(arr), time]
}

//////////////////////////////////////////////////////////////////////////////////////////
// RadixLSDSort //////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

algDict.RadixLSDSort.mainFunction = async function ()
{
	let excludedTime = 0;
	let startExclude;
	let t0 = performance.now();
	
	const length = algDict.RadixLSDSort.arr.length;
	let maxNumber = algDict.RadixLSDSort.arr[0];

	for (let i = 1; i < length; i++)
	{
		maxNumber = (algDict.RadixLSDSort.arr[i] > maxNumber) ? algDict.RadixLSDSort.arr[i] : maxNumber
	}
	
	for (let exp = 1; Math.floor(maxNumber / exp) > 0; exp *= 10)
	{
		let output = Array(length);
		let count = Array(10).fill(0, 0);

		for (let i = 0; i < length; i++)
		{
			const digit = Math.floor(algDict.RadixLSDSort.arr[i] / exp) % 10;
			count[digit]++;
		}

		for (let i = 1; i < 10; i++)
		{
			count[i] += count[i - 1];
		}

			//notTimed//
				startExclude = performance.now();
				let copyForDraw = [...algDict.RadixLSDSort.arr];
				excludedTime += performance.now() - startExclude;
			//notTimed//

		for (let i = length - 1; i >= 0; i--)
		{
			const digit = Math.floor(copyForDraw[i] / exp) % 10;
			output[count[digit] - 1] = copyForDraw[i];
			count[digit]--;
			//notTimed//
				startExclude = performance.now();
				algDict.RadixLSDSort.arr = output;
				draw(algDict.RadixLSDSort);
				await delay();
				excludedTime += performance.now() - startExclude;
			//notTimed//
		}
	}
	const finalTime = performance.now() - t0 - excludedTime;
	if (await checkArr(algDict.RadixLSDSort))
	{
		algDict.RadixLSDSort.solved = true;
		algDict.RadixLSDSort.el.classList.add("solved");
	}
	algDict.RadixLSDSort.timer.innerHTML = finalTime;
}

algDict.RadixLSDSort.myAttempt = async function ()
{
	let t0 = performance.now();
	let maxLen = -1;
	for(let i = 0; i < algDict.RadixLSDSort.arr.length; i++)
	{
		//notTimed//
			algDict.RadixLSDSort.externalTime += performance.now() - t0;
			let item = algDict.RadixLSDSort.el.querySelector(`[style*="grid-column: ${i+1}"]`);
			item.classList.add("check");
			t0 = performance.now();
		//notTimed//

		let len = algDict.RadixLSDSort.arr[i].toString().length;
		maxLen = (len > maxLen) ? len : maxLen;

		//notTimed//
			algDict.RadixLSDSort.externalTime += performance.now() - t0;
			draw(algDict.RadixLSDSort);
			await delay();
			item.classList.remove("check");
			t0 = performance.now();
		//notTimed//
	}
	for(let i = 0; i < maxLen; i++)
	{
		let buckets = [0,0,0,0,0,0,0,0,0,0];
		for(let j = 0; j < algDict.RadixLSDSort.arr.length; j++)
		{
			//notTimed//
				algDict.RadixLSDSort.externalTime += performance.now() - t0;
				let item = algDict.RadixLSDSort.el.querySelector(`[style*="grid-column: ${j+1}"]`);
				item.classList.add("check");
				t0 = performance.now();
			//notTimed//
			const element = algDict.RadixLSDSort.arr.splice(j, 1)[0];
			let digit = (element / 10 ** i) % 10 | 0;
			algDict.RadixLSDSort.arr.splice(buckets[digit], 0, element);
			for(let b = digit; b < buckets.length; b++)
			{
				buckets[b]++;
			}
			//notTimed//
				algDict.RadixLSDSort.externalTime += performance.now() - t0;
				draw(algDict.RadixLSDSort);
				await delay();
				item.classList.remove("check");
				t0 = performance.now();
			//notTimed//
		}
	}
	algDict.RadixLSDSort.externalTime += performance.now() - t0;
	// Verify
	if (await checkArr(algDict.RadixLSDSort))
	{
		algDict.RadixLSDSort.solved = true;
		algDict.RadixLSDSort.el.classList.add("solved");
	}
	algDict.RadixLSDSort.timer.innerHTML = algDict.RadixLSDSort.externalTime;
}

algDict.RadixLSDSort.timeAlg = function (arr)
{
	let t0 = performance.now();
	
	const length = arr.length;
	let mx = arr[0];
	for (let i = 1; i < length; i++)
	{
		if (arr[i] > mx) mx = arr[i];
	}
	const maxNumber = mx;
	let sortedArr = [...arr];
	for (let exp = 1; Math.floor(maxNumber / exp) > 0; exp *= 10)
	{
		
		const length = arr.length;
		let output = Array(length);
		let count = Array(10).fill(0, 0);

		for (let i = 0; i < length; i++)
		{
			const digit = Math.floor(arr[i] / exp) % 10;
			count[digit]++;
		}

		for (let i = 1; i < 10; i++)
		{
			count[i] += count[i - 1];
		}

		for (let i = length - 1; i >= 0; i--)
		{
			const digit = Math.floor(arr[i] / exp) % 10;
			output[count[digit] - 1] = arr[i];
			count[digit]--;
		}
		const sortedIteration = output;

		sortedArr = sortedIteration;
	}

	let time = performance.now() - t0;
	return [verifySort(sortedArr), time]
}
document.addEventListener("DOMContentLoaded", () => {
loadKata();
});