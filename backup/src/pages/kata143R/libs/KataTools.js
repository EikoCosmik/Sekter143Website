const KT = {}

Object.defineProperty(KT, "version",
{
    value: `A0.1`,
    writable: false,
    enumerable: true,
    configurable: false
});

KT.help = function(type)
{
    if(type !== undefined)
    {
        if(KT[type].description !== undefined)
        {
            console.log(KT[type].description)
        }
        else if(KT[type] !== undefined)
        {
            console.log(KT[type])
        }
        return "Enter KT.help for full List"
    }
    else
    {
        let str = ""
        for (const key in KT)
        {
            str += `${key}\n`;
        }
        console.log(str);
        return "Enter KT.help.function for further details"
    }
}
KT.help.description =
`List all tools or explain tool. Returns as String
type:
    Function name you want to learn about
`;

KT.mulberry32 = function(seed = Date.now() ^ (Math.random() * 0xffffffff))
{
    seed |= 0;
    return function()
    {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
};
KT.mulberry32.description =
`Random [0,1) using Mulberry32. Returns as Func
Seed: = Date.now()
    Seed to Generate From
`;

KT.splitMix32 = function (seed = Date.now()) {
    return function() {
        seed |= 0;
        seed = (seed + 0x9E3779B9) | 0;
        let z = seed;
        z = (z ^ z >>> 16) | 0;
        z = Math.imul(z, 0x85EBCA6B) | 0;
        z = (z ^ z >>> 13) | 0;
        z = Math.imul(z, 0xC2B2AE35) | 0;
        z = (z ^ z >>> 16) | 0;
        return z >>> 0;
    }
}
KT.splitMix32.description =
`Generate random vals for sfc32 - use createSFC32 instead. Returns as Func
Seed: = Date.now()
    Seed to Generate From
`;

KT.sfc32 = function(a = KT.splitDefault() | 0, b = KT.splitDefault() | 0, c = KT.splitDefault() | 0, d = KT.splitDefault() | 0)
{
    return function() {
        a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
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
KT.sfc32.description =
`Random [0,1) using sfc32 - use createSFC32 instead. Returns as Func
a,b,c,d: = KT.splitDefault()
    Seed to Generate From
`;

KT.createSFC32 = function(seed = Date.now())
{
    let sm = KT.splitMix32(seed);
    let a = sm(), b = sm(), c = sm(), d = sm();
    return KT.sfc32(a, b, c, d);
}
KT.createSFC32.description =
`Use to create sfc32 rand [0,1) - use this to generate if needed. Returns as Func
Seed: = Date.now()
    Seed to Generate From
`;

KT.rand = KT.mulberry32();
KT.rand.description = `Use for random nums [0,1). Returns as Float`;

KT.randHQ = KT.createSFC32();
KT.randHQ.description = `Use for random nums [0,1), Better distribution but slower. Returns as Float`;

KT.getRndInt = function (min, max) 
{
    min = Math.ceil(min);
    max = max | 0;
    return (KT.rand() * (max - min) | 0) + min;
};
KT.getRndInt.description =
`Get random integer between min and max exclusive of max. Returns as Int
min:
    Minimum Int
max:
    Maximum Int
`;

KT.getRndIntInc = function (min, max) 
{
    min = Math.ceil(min);
    max = max | 0;
    return (KT.rand() * (max - min + 1) | 0) + min;
};
KT.getRndIntInc.description =
`Get random integer between min and max inclusive of max. Returns as Int
min:
    Minimum Int
max:
    Maximum Int
`;

KT.getRndIntSec = function (type = "UI32", amt = 1)
{
    let A;
    switch(type)
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
};
KT.getRndIntSec.description = 
`Get random secure Ints. Returns as Array
type: = "UI32" 
    "I8" = Int8Array 
    "UI8" = Uint8Array 
    "UI8C" = Uint8ClampedArray 
    "I16" = Int16Array 
    "UI16" = Uint16Array 
    "I32" = Int32Array 
    "UI32" = Uint32Array 
    "I64" = BigInt64Array 
    "UI64" = BigUint64Array 
Amt: = 1
    How many to generate
`;

KT.getRndFlt = function (min, max)
{
    return Math.random() * (max - min) + min;
};
KT.getRndFlt.description =
`Get random Float between min and max exclusibe of max. Returns as Float
min:
    Minimum Float
max:
    Maximum Float
`;

KT.getCoinFlip = function () 
{
    return (KT.rand() * 2 | 0);
};
KT.getRndInt.description = `Get 0 or 1. Returns as Int`;

KT.getRndDirection = function()
{
    let x,y,d;
    do
    {
        x = KT.rand()*2 - 1;
        y = KT.rand()*2 - 1;
        d = x*x + y*y;
    } while (d > 1);
    return [x,y]
};
KT.getRndDirection.description =`Get random direction. Returns as [x,y]`;

// Math Likes
KT.forceMod = function (n, m)
{
    return ((n % m) + m) % m;
};
KT.forceMod.description =
`Get Modulo of numbers (as js dosent mod negatives). Returns as input
n:
    Number to Mod
m:
    Mod By
`;

KT.fastClamp = function (x, min, max)
{
    return Math.max(min, Math.min(max, x));
};
KT.fastClamp.description =
`Clamp to bounds. Returns as input
x:
    Number in
min:
    Lower Bounds
max:
    Upper Bounds
`;

KT.fastAbs = function (x)
{
    let mask = x >> 31;
    return (x + mask) ^ mask;
};
KT.fastAbs.description =
`Force positive. Returns as input
x:
    Number In
`;

console.log(`Welcome to KataTools ${KT.version}! Enter KT.help.list for list of tools.`)

///////////////////////////////

// function stressTest(type, amt)
// {
//     let start;
//     start = Date.now();
//     switch(type)
//     {
//         case 0:
//             console.log(KT.getRndIntSec())
//             break;
//     }
//    console.log(i, Date.now() - start)
// }

// testRig = 2;
// switch(testRig)
// {
//     case 0:
//         break;
//     case 1:
//         for(i = 0; i <= 1; i++)
//         {
//             console.log(KT.randHQ())
//         };
//         break;
//     case 2:
//         for(i = 1; i <= 1000000000; i *= 10)
//         {
//             stressTest(0,i)
//         };
//         break;
// }
