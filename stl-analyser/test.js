// Test file to test stl analyser
const STLAnylser = require("./index");


// init some test param
let testParam1 = {
    filamentType: "PLA",
    printSettings: "10mm",
    printerType: "ender3-V2",
    fillDensity: ".40",
    fileName: "Monkey_astronaut",
    scalePercent: "150"
}


let testParamWithoutfileName = {
    filamentType: "PLA",
    printSettings: "10mm",
    printerType: "ender3-V2",
    fillDensity: ".40",
    fileName: "",
    scalePercent: "150"
}

let testParam2 = {
    filamentType: "",
    printSettings: "10mm",
    printerType: "ender3-V2",
    fillDensity: ".40",
    fileName: "watch4-stand",
    scalePercent: "150"
}

let testParam3 = {
    filamentType: "PLA",
    printSettings: "20mm",
    printerType: "ender3-V2",
    fillDensity: ".40",
    fileName: "Monkey_astronaut",
    scalePercent: "150"
}

let testParam4 = {
    filamentType: "PLA",
    printSettings: "20mm",
    printerType: "ender3-V2",
    fillDensity: ".10",
    fileName: "entonoir",
    scalePercent: "88"
}


/*
* generateTestCmd function do execute cmd via analyseSTl function using slicingParam and log the result on the console
* @param slicingParam - an object of slicingParam
*/

function generateTestCmd(slicingParam){
    STLAnylser.analyseSTL(slicingParam)
    .then( val => { console.log(val)})
    .catch(error => { console.log(error)});
}


// test part
generateTestCmd(testParam1)
generateTestCmd(testParam2)
generateTestCmd(testParam3)
generateTestCmd(testParam4)
generateTestCmd(testParamWithoutfileName)
