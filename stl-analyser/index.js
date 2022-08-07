module.exports = { analyseSTL }


//import and init
const { exec } = require("child_process");
const fs = require('fs');
const { format, winston, createLogger, transports } = require('winston');
const { combine, timestamp, printf} = format;
const loggerFormat = printf(({level, message, timestamp}) => {
    let timestampArray = timestamp.split('T');
    let timestampFormat = `${timestampArray[0]} ${timestampArray[1].split('',8).join('')}`
    return `${timestampFormat} [${level}] - ${message}`;
})

const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        loggerFormat
    ),
    defaultMeta: {service: 'user-service'},
    transports: [
        new transports.Console(),
        new transports.File({filename: '../logs.log', level: 'info'}),
        new transports.File({filename: '../errors.log', level: 'error'}),
    ],
})


// DEFAULT VALUE
const DEFAULT_PRINT_PARAM = {
    filamentType: "PLA",
    printSettings: "20mm",
    printerType: "ender3-V2",
    fillDensity: ".15",
    fileName: "",
    scalePercent: "100"
}
const GCODE_DIRECTORY = 'export-gcodes/';
const STL_DIRECTORY = 'tmp/';

let testParam = {
    filamentType: "PLA",
    printSettings: "10mm",
    printerType: "ender3-V2",
    fillDensity: ".40",
    fileName: "Monkey_astronaut",
    scalePercent: "150"
}


/*
* analyseSTL - main function of the file, ths function can be call by another file
* @param slicingParam - an object with all needed param to slice the stl correctly
* @return a promise that provide an object with all informations about the STL after slicing
*/
function analyseSTL(slicingParam){
    if(slicingParam.printSettings == "") slicingParam.printSettings = DEFAULT_PRINT_PARAM.printSettings;
    if(slicingParam.filamentType == "") slicingParam.filamentType = DEFAULT_PRINT_PARAM.filamentType;
    if(slicingParam.printerType == "") slicingParam.printerType = DEFAULT_PRINT_PARAM.printerType;
    if(slicingParam.fillDensity == "") slicingParam.fillDensity = DEFAULT_PRINT_PARAM.fillDensity;
    if(slicingParam.scalePercent == "") slicingParam.scalePercent = DEFAULT_PRINT_PARAM.scalePercent;
    if(slicingParam.fileName == "") {
        logger.error("STL-ANALYSER - analyseSTL - an STL fileName must be specified");
        return "error: an stl file must be provided";
    }
    let cmd = `prusa-slicer --export-gcode ${STL_DIRECTORY}${slicingParam.fileName}.stl --load ./config/config-files/print-settings/${slicingParam.printSettings}.ini --load ./config/config-files/filament-type/${slicingParam.filamentType}.ini --load ./config/config-files/printer-type/${slicingParam.printerType}.ini --fill-density .15 --scale ${slicingParam.scalePercent}% --output ${GCODE_DIRECTORY}${slicingParam.fileName}.gcode`;
    logger.log({
        level: 'info',
        message: `STL-ANALYSER - analyseSTL - new stl (${slicingParam.fileName}) will be sliced with param:  layer-height:${slicingParam.printSettings}-fill:${slicingParam.fillDensity*100}%-scaling:${slicingParam.scalePercent}%`
    })
    let generateGcode = executeCmd(cmd);
    let allInformations = generateGcode.then(() => {return returnInformations(slicingParam.fileName)});
    return allInformations

}




/*
* exectueCmd get a cmd in parameter, execute this commande on a shell 
* and log the result
* @param cmd - String command
* @return all commande line informations provided by the executed command
*/
function executeCmd (cmd){
    return new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                logger.error(`STL-ANALYSER - executeCmd - error during cmd execution: ${err.message}`);
                console.log(`STL-ANALYSER - executeCmd - error during cmd execution: ${err.message}`);
                reject(err);
                return;
            }
            resolve(stdout);
        });
    })
}




/*
* returnInformations return needed informations about the desired Gcode in the *export-gcodes" directory
* @param gcodeFileName - the name of the gcode that we wants informations
* @return - an object with all needed informations
*/
function returnInformations(gcodeFileName){

    // init printing informations object
    let printingInformations = {
        printingTime: "",
        filamentUsedInMillimeter: "",
        filamentUsedInGram: "",
        totalCost: ""
    }

    // new promise that return a printing informations object if ok
    // and return the err if there is error
    return new Promise((resolve, reject) => {
        fs.readFile(`${GCODE_DIRECTORY}${gcodeFileName}.gcode`, 'utf8', (err, data) => {
            if (err) {
                logger.error(`STL-ANALYSER - returnInformations - error while getting info: ${err.message}`);
                console.log(`STL-ANALYSER - returnInformations - error while getting info: ${err.message}`);
                reject(err);
            }
            // for each line in data file, check if we found need informations and store it to printing 
            // informations object
            data.split(/\r?\n/).forEach(line =>  {
                if(line.search("; estimated printing time")!= -1) printingInformations.printingTime = line.split("; estimated printing time (normal mode) = ")[1];
                if(line.search(/; filament used \[g\]/)!= -1) printingInformations.filamentUsedInGram = line.split("; filament used [g] = ")[1] + "g";
                if(line.search(/; filament used \[mm\]/)!= -1) printingInformations.filamentUsedInMillimeter = line.split("; filament used [mm] = ")[1]+ "mm";
                if(line.search("; total filament cost")!= -1) printingInformations.totalCost = line.split("; total filament cost = ")[1] + " CHF";
            });
            logger.info(`STL-ANALYSER - returnInformations - printing informations about last sliced file - Cost:${printingInformations.totalCost}-Time:${printingInformations.printingTime}-used[Gr]:${printingInformations.filamentUsedInGram}-used[mm]:${printingInformations.filamentUsedInMillimeter}`);
            let filePath = `${GCODE_DIRECTORY}${gcodeFileName}.gcode`
            fs.unlinkSync(filePath);
            resolve(printingInformations);
        });
    })
}








analyseSTL(testParam).then((val) => console.log(val));
