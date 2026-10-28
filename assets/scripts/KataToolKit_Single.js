export function absolute(number)
{
	const mask = number >> 31;
	return (number + mask) ^ mask;
}
export function clamp(number, min, max)
{
	return Math.max(min, Math.min(max, number));
}
export function convertTo(inputNum, outputBase, inputBase = 10)
{
	if (typeof (inputNum) != "number") throw new Error("inputNum != number");
	if (typeof (outputBase) != "number") throw new Error("outputBase != number");
	if (typeof (inputBase) != "number") throw new Error("inputBase != number");
	const iNum = (inputBase == 10) ? inputNum : this.toDecimal(inputNum, inputBase);

	let currentOutput = "";
	let currentPower = outputBase;
	let lastPower = 1;
	let lastRemainder = 0;

	while (true)
	{
		const nextRemainder = (iNum % currentPower);
		let nextDigit = ((nextRemainder - lastRemainder) / lastPower);
		if (nextDigit >= 10)
		{
			nextDigit = this.numToLetter(nextDigit);
		}
		currentOutput = nextDigit + currentOutput;
		lastRemainder = nextRemainder;
		lastPower = currentPower;
		currentPower *= outputBase;
		if (nextRemainder == iNum) break;
	}

	return (outputBase < 11) ? Number(currentOutput) : currentOutput;
}
export function createSFC32(seed = Date.now())
{
	let sm = splitMix32(seed);
	return sfc32(sm(), sm(), sm(), sm());
}
export function dotProduct(arrayOne, arrayTwo, strictSize = true)
{
	if (arrayOne.length !== arrayTwo.length && strictSize)
		throw new Error("Invalid Array Sizes. ArrayOne.length must = ArrayTwo.length");

	let outNum = 0;
	const length = strictSize ? arrayOne.length : Math.max(arrayOne.length, arrayTwo.length);

	for (let i = 0; i < length; i++) outNum += (arrayOne[i] ?? 0) * (arrayTwo[i] ?? 0);

	return outNum;
}
export function fYScramble(arr)
{
	let curIdx = arr.length;
	let randIdx;

	while (curIdx !== 0)
	{
		randIdx = getRandomInt(0, curIdx);
		curIdx--;
		[arr[curIdx], arr[randIdx]] = [arr[randIdx], arr[curIdx]];
	}

	return arr;
}
export function forceMod(number, mod)
{
	return ((number % mod) + mod) % mod;
}
export function getCoinFlip() 
{
	return (random() * 2 | 0);
}
export function getDigit(number, digit)
{
	return (number / 10 ** digit) % 10 | 0;
}
export function getRandomDirection()
{
	let x;
	let y;
	let d;
	do
	{
		x = random() * 2 - 1;
		y = random() * 2 - 1;
		d = x * x + y * y;
	}
	while (d > 1);
	return [x, y];
}
export function getRandomFloat(min, max)
{
	return random() * (max - min) + min;
}
export function getRandomInt(min, max) 
{
	min = Math.ceil(min);
	max = max | 0;
	return (random() * (max - min) | 0) + min;
}
export function getRandomIntInclusive(min, max) 
{
	min = Math.ceil(min);
	max = max | 0;
	return (random() * (max - min + 1) | 0) + min;
}
export function getRandomIntSecure(type = "UI32", amt = 1)
{
	let A;
	switch (type)
	{
		case "I8":
			A = new Int8Array(amt);
			break;
		case "UI8":
			A = new Uint8Array(amt);
			break;
		case "UI8C":
			A = new Uint8ClampedArray(amt);
			break;
		case "I16":
			A = new Int16Array(amt);
			break;
		case "UI16":
			A = new Uint16Array(amt);
			break;
		case "I32":
			A = new Int32Array(amt);
			break;
		case "UI32":
			A = new Uint32Array(amt);
			break;
		case "I64":
			A = new BigInt64Array(amt);
			break;
		case "UI64":
			A = new BigUint64Array(amt);
			break;
	}
	return crypto.getRandomValues(A);
}
export function matrixMultiplyColumnVector(matrixOne, matrixTwo, strictSize = true)
{
	if (matrixOne.length !== matrixTwo[0].length && strictSize) throw new Error("Invalid Matrix Sizes. Need: MatrixOne = MxN, MatrixTwo = NxP");

	const transposedMatrixOne = matrixTranspose(matrixOne);
	const outMatrix = new Array(matrixOne[0].length);

	for (let i = 0; i < transposedMatrixOne.length; i++)
	{
		const outRow = new Array(transposedMatrixOne.length);

		for (let j = 0; j < matrixTwo.length; j++) { outRow[j] = dotProduct(matrixTwo[j], transposedMatrixOne[i], strictSize); }

		outMatrix[i] = outRow;
	}

	return outMatrix;
}
export function matrixMultiplyRowVector(matrixOne, matrixTwo, strictSize = true)
{
	if (matrixOne[0].length !== matrixTwo.length && strictSize) throw new Error("Invalid Matrix Sizes. Need: MatrixOne = MxN, MatrixTwo = NxP");

	const transposedMatrixTwo = matrixTranspose(matrixTwo);
	const outMatrix = new Array(matrixOne.length);

	for (let i = 0; i < matrixOne.length; i++)
	{
		const outRow = new Array(transposedMatrixTwo.length);

		for (let j = 0; j < transposedMatrixTwo.length; j++) outRow[j] = dotProduct(matrixOne[i], transposedMatrixTwo[j], strictSize);

		outMatrix[i] = outRow;
	}

	return outMatrix;
}
export function matrixTranspose(matrix)
{
	const rows = matrix.length;
	const columns = matrix[0].length;
	const outMatrix = new Array(columns);

	for (let i = 0; i < columns; i++)
	{
		const outRow = new Array(rows);

		for (let j = 0; j < rows; j++) outRow[j] = matrix[j][i];

		outMatrix[i] = outRow;
	}

	return outMatrix;
}
export function mulberry32(seed = Date.now() ^ (Math.random() * 0xffffffff))
{
	seed |= 0;
	return function () {
		seed = (seed + 0x6D2B79F5) | 0;
		let c = Math.imul(seed ^ (seed >>> 15), seed | 1);
		c ^= c + Math.imul(c ^ (c >>> 7), c | 61);
		return ((c ^ (c >>> 14)) >>> 0) / 4294967296;
	}
}
export function numToLetter(num)
{
	return String.fromCharCode(65 + num - 10);
}
export function scalarMultiply(matrix, scalar)
{
	const outMatrix = new Array(matrix.length);

	for (let i = 0; i < matrix.length; i++)
	{
		const curRow = matrix[i];
		const outRow = new Array(curRow.length);

		for (let j = 0; j < curRow.length; j++) outRow[j] = scalar * curRow[j];

		outMatrix[i] = outRow;
	}

	return outMatrix;
}
export function sfc32(a = splitDefault() | 0, b = splitDefault() | 0, c = splitDefault() | 0, d = splitDefault() | 0)
{
	return function () {
		a >>>= 0; 
		b >>>= 0; 
		c >>>= 0; 
		d >>>= 0;

		let t = (a + b) | 0;
		a = b ^ b >>> 9;
		b = (c + (c << 3)) | 0;
		c = (c << 21 | c >>> 11) | 0;
		d = (d + 1) | 0;
		t = (t + d) | 0;
		c = (c + t) | 0;

		return (t >>> 0) / 4294967296;
	}
}
export function splitMix32(seed = Date.now())
{
	return function () {
		seed |= 0;
		seed = (seed + 0x9E3779B9) | 0;
		let c = seed;
		c = (c ^ c >>> 16) | 0;
		c = Math.imul(c, 0x85EBCA6B) | 0;
		c = (c ^ c >>> 13) | 0;
		c = Math.imul(c, 0xC2B2AE35) | 0;
		c = (c ^ c >>> 16) | 0;
		return c >>> 0;
	}
}
export function toDecimal(inputNum, inputBase)
{
	if (typeof (inputNum) != "number") throw new Error("inputNum != number");
	if (typeof (inputBase) != "number") throw new Error("inputBase != number");

	const digits = Array.from(String(inputNum), Number);

	let currentPower = 1;
	let total = 0;

	for (let i = digits.length - 1; i > -1; i--)
	{
		total += digits[i] * currentPower;
		currentPower *= inputBase;
	}

	return total;
}

export const random = mulberry32();

export const randomHighQuality = createSFC32();