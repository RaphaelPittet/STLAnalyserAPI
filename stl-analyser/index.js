module.exports = { analyseSTL }


//import and init
const { exec } = require("child_process");
const fs = require('fs');
const { config } = require("process");


/* ----------------------------------------------------------------------------------------------------------------
INIT CONSTANT
-----------------------------------------------------------------------------------------------------------------*/
// DEFAULT VALUE
const DEFAULT_PRINT_PARAM = {
    filamentType: "PLA",
    printSettings: "20mm",
    printerType: "ender3-V2",
    fillDensity: ".15",
    fileName: "",
    scalePercent: "100",
    xScale: "100",
    yScale: "",
    zScale: ""
}

// path to Directories of the stlAnalyser according to main API folder
const GCODE_DIRECTORY = `./stl-analyser/export-gcodes/`;
const STL_DIRECTORY = `./stl-analyser/tmp/`;
const CONFIG_DIRECTORY = `./stl-analyser/config/`;



/* ----------------------------------------------------------------------------------------------------------------
FUNCTIONS
-----------------------------------------------------------------------------------------------------------------*/

/*
* analyseSTL - main function of the file, ths function can be call by another file
* @param slicingParam - an object with all needed param to slice the stl correctly
* @return a promise that provide an object with all informations about the STL after slicing
*/
function analyseSTL(slicingParam) {
    if (slicingParam.printSettings == "") slicingParam.printSettings = DEFAULT_PRINT_PARAM.printSettings;
    if (slicingParam.filamentType == "") slicingParam.filamentType = DEFAULT_PRINT_PARAM.filamentType;
    if (slicingParam.printerType == "") slicingParam.printerType = DEFAULT_PRINT_PARAM.printerType;
    if (slicingParam.fillDensity == "") slicingParam.fillDensity = DEFAULT_PRINT_PARAM.fillDensity;
    if (slicingParam.fileName == "") {
        return Promise.reject("STL-ANALYSER - analyseSTL - an STL fileName must be specified");
    }
    // new promise that check if file is scaled in percent, or by axes and return the corresponding command to launch
    editCmdPromise = new Promise((resolve) => {

        // check if file is scaled by axes
        if (slicingParam.xScale != "" && slicingParam.yScale != "" && slicingParam.zScale != "") {
            slicingParam.scalePercent = DEFAULT_PRINT_PARAM.scalePercent;
            // resizeSTL create a new stl file with the correct dimensions and return the new name of the STL
            resizeSTL(slicingParam.fileName, slicingParam.xScale, slicingParam.yScale, slicingParam.zScale)
                .then((fileName) => {
                    slicingParam.fileName = fileName;
                    resolve(`prusa-slicer --export-gcode ${STL_DIRECTORY}${slicingParam.fileName}.stl --load ${CONFIG_DIRECTORY}config-files/print-settings/${slicingParam.printSettings}.ini --load ${CONFIG_DIRECTORY}config-files/filament-type/${slicingParam.filamentType}.ini --load ${CONFIG_DIRECTORY}config-files/printer-type/${slicingParam.printerType}.ini --fill-density .15 --scale ${slicingParam.scalePercent}% --output ${GCODE_DIRECTORY}${slicingParam.fileName}.gcode`);
                })
        } else {
            // if STL isn't edited by axes, get the given scale percent and if it isn't specified, it take the default value (100%)
            slicingParam.scalePercent = slicingParam.scalePercent == "" ? slicingParam.scalePercent = slicingParam.scalePercent : slicingParam.scalePercent = DEFAULT_PRINT_PARAM.scalePercent;
            resolve(`prusa-slicer --export-gcode ${STL_DIRECTORY}${slicingParam.fileName}.stl --load ${CONFIG_DIRECTORY}config-files/print-settings/${slicingParam.printSettings}.ini --load ${CONFIG_DIRECTORY}config-files/filament-type/${slicingParam.filamentType}.ini --load ${CONFIG_DIRECTORY}config-files/printer-type/${slicingParam.printerType}.ini --fill-density .15 --scale ${slicingParam.scalePercent}% --output ${GCODE_DIRECTORY}${slicingParam.fileName}.gcode`);
        }
    });
    return editCmdPromise.then((cmd) => {
        console.log('commande to launch :', cmd);
        return executeCmd(cmd)
            .then(() => { return returnInformations(slicingParam.fileName) })
            .catch(err => {
                removeSTL(slicingParam.fileName);
                return Promise.reject(err.log)
            });

    })

}



/*
resizeSTL function get the filename, and all axes factor, to create a new stlfile with the specified dimension. 
to do that this funciton create new file with stlcmd tool and remove the old file after that
@param fileName - the name of the stl file that must be resized
@param xScale - x scale factor must be mor than 0
@param yScale - y scale factor must be mor than 0
@param zScale - z scale factor must be mor than 0
@return - A Promise with newfilename as value
*/
function resizeSTL(fileName, xScale, yScale, zScale) {
    let NewfileName = fileName + "-resized";
    return executeCmd(`stl_transform -sx ${xScale} -sy ${yScale} -sz ${zScale} ${STL_DIRECTORY}${fileName}.stl ${STL_DIRECTORY}${NewfileName}.stl`)
        .then(() => {
            let stlFilePath = `${STL_DIRECTORY}${fileName}.stl`;
            fs.unlinkSync(stlFilePath);
            return NewfileName
        });
}




/*
* exectueCmd get a cmd in parameter, execute this commande on a shell 
* and log the result
* @param cmd - String command
* @return all commande line informations provided by the executed command in a Promise
*/
function executeCmd(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                err.log = `STL-ANALYSER - executeCmd - error during cmd execution: ${err.message}`;
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
* @return - an object with all needed informations in a Promise
*/
function returnInformations(gcodeFileName) {

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
        // read gcode file with given filename in the gcode directory
        fs.readFile(`${GCODE_DIRECTORY}${gcodeFileName}.gcode`, 'utf8', (err, data) => {
            if (err) {
                err.log = `STL-ANALYSER - returnInformations - error while getting info: ${err.message}`;
                reject(err);
            }
            // for each line in data file, check if we found need informations and store it to printing 
            // informations object
            data.split(/\r?\n/).forEach(line => {
                if (line.search("; estimated printing time") != -1) printingInformations.printingTime = line.split("; estimated printing time (normal mode) = ")[1];
                if (line.search(/; filament used \[g\]/) != -1) printingInformations.filamentUsedInGram = line.split("; filament used [g] = ")[1];
                if (line.search(/; filament used \[mm\]/) != -1) printingInformations.filamentUsedInMillimeter = line.split("; filament used [mm] = ")[1];
                if (line.search("; total filament cost") != -1) printingInformations.totalCost = line.split("; total filament cost = ")[1];
            });
            removeGCode(gcodeFileName);
            removeSTL(gcodeFileName);
            resolve(printingInformations);
        });
    })
}



/*
removeGCode function get a filename as param and remove the concerned file from the GCODE_DIRECTORY
@param fileName - the name of the file that must be removed
*/
function removeGCode(fileName) {
    let gcodeFilePath = `${GCODE_DIRECTORY}${fileName}.gcode`;
    fs.unlinkSync(gcodeFilePath);
}


/*
removeSTL function get a filename as param and remove the concerned file from the STL_DIRECTORY
@param fileName - the name of the file that must be removed
*/
function removeSTL(fileName) {
    let stlFilePath = `${STL_DIRECTORY}${fileName}.stl`;
    fs.unlinkSync(stlFilePath);
}




