let testingData = true;
let testLength = 100;
let lastTest = startTime;
let testParticle = 0;

let testDict = {};

// OnInit
for (ty = -1; ty <= maxTypes; ty++)
{
    let name = "";
    switch(ty)
    {
        case -1:
            name = "Rocket"
            break;
        case 0:
            name = "Basic"
            break;
        case 1:
            name = "TwoTiered"
            break;
        case 2:
            name = "ThreeTiered"
            break;
        case 3:
            name = "Sparkle"
            break;
        case 4:
            name = "Split"
            break;
        case 5:
            name = "Hang"
            break;
        case 6:
            name = "Target"
            break;
    }
    testDict[ty] = {
        testName: {},

        testDifX: {},
        testMaxX: {},
        testMinX: {},
        testSumX: {},

        testDifY: {},
        testMaxY: {},
        testMinY: {},
        testSumY: {}
    }

    for (en = 0; en <= maxEnergy; en++)
    {
        if(en == 0)
        {
            testDict[ty].testName = name;
        }
        else
        {
            testDict[ty].testDifX[en] = [];
            testDict[ty].testMaxX[en] = -Infinity;
            testDict[ty].testMinX[en] = Infinity;
            testDict[ty].testSumX[en] = 0;

            testDict[ty].testDifY[en] = [];
            testDict[ty].testMaxY[en] = -Infinity;
            testDict[ty].testMinY[en] = Infinity;
            testDict[ty].testSumY[en] = 0;
        }
        
    }
}	

// On Draw
// Testing Data - Debug Only
if (testingData &&Date.now() - lastTest > 2000)
{
    console.clear();
    let outStr = ""; 

    outStr += 
    "-||DspInfo||-" +
    "\nTime:" + dT.toFixed(2);

    //REMOVE SCREEN RATIOS
    //ADD CASE FOR AVERAGE ALL

    for(ty = 0; ty <= maxTypes; ty++)
    {
        outStr += "\n-||" + testDict[ty].testName + "||-";

        let avgXStr = "";
        let avgYStr = "";
        let maxXStr = "";
        let maxYStr = "";
        let minXStr = "";
        let minYStr = "";
        let AmmAXStr = "";
        let AmmAYStr = "";
        let RadStr = "";

        for(en = minEnergy; en <= maxEnergy; en++)
        {
            let xAvg = testDict[ty].testSumX[en] / testDict[ty].testDifX[en].length;
            let yAvg = testDict[ty].testSumY[en] / testDict[ty].testDifY[en].length;
            let xMMAvg = ((Math.abs(testDict[ty].testMaxX[en]) + Math.abs(testDict[ty].testMinX[en])) / 2);
            let yMMAvg = ((Math.abs(testDict[ty].testMaxY[en]) + Math.abs(testDict[ty].testMinY[en])) / 2);

            avgXStr += en + "(" + xAvg.toFixed(2) + ") | ";
            avgYStr += en + "(" + yAvg.toFixed(2) + ") | ";

            maxXStr += en + "(" + testDict[ty].testMaxX[en].toFixed(2) + ") | ";
            maxYStr += en + "(" + testDict[ty].testMaxY[en].toFixed(2) + ") | ";
            minXStr += en + "(" + testDict[ty].testMinX[en].toFixed(2) + ") | ";
            minYStr += en + "(" + testDict[ty].testMinY[en].toFixed(2) + ") | ";

            AmmAXStr += en + "(" + xMMAvg.toFixed(2) + ") | ";
            AmmAYStr += en + "(" + yMMAvg.toFixed(2) + ") | ";

            RadStr += en + "(" + ((xMMAvg + yMMAvg) / 2).toFixed(2) + ") | ";
        }
        outStr +=
        "\n| AvgX | " + avgXStr +
        "\n| AvgY | " + avgYStr +
        "\n| MaxX | " + maxXStr +
        "\n| MaxY | " + maxYStr +
        "\n| MinX | " + minXStr +
        "\n| MinY | " + minYStr +
        "\n| ARad | " + RadStr;
    }
    console.log(outStr);

    lastTest = Date.now();
}

//In Update
function logTest(i)
{
	if(type[i] < 0){return false}
	let ty = type[i];
	let en = energy[i];

	if(ty == 5)
	{
		en *= 2;
	}
	
	if (testDict[ty].testDifX[en].length + 1 > testLength)
	{
		testDict[ty].testSumX[en] -= testDict[ty].testDifX[en].shift();
	}
	if (testDict[ty].testDifY[en].length + 1 > testLength)
	{
		testDict[ty].testSumY[en] -= testDict[ty].testDifY[en].shift();
	}

	let diffX = initX[i] - posX[i];
	let diffY = initY[i] - posY[i];

	testDict[ty].testDifX[en].push(diffX);
	testDict[ty].testDifY[en].push(diffY);

	testDict[ty].testSumX[en] += diffX;
	testDict[ty].testSumY[en] += diffY;

	testDict[ty].testMaxX[en] = (diffX > testDict[ty].testMaxX[en]) ? diffX : testDict[ty].testMaxX[en];
	testDict[ty].testMinX[en] = (diffX < testDict[ty].testMinX[en]) ? diffX : testDict[ty].testMinX[en];
	testDict[ty].testMaxY[en] = (diffY > testDict[ty].testMaxY[en]) ? diffY : testDict[ty].testMaxY[en];
	testDict[ty].testMinY[en] = (diffY < testDict[ty].testMinY[en]) ? diffY : testDict[ty].testMinY[en];
}