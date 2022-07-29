const { exec } = require("child_process");
const fs = require('fs');
// init printing param with default value
const cmdArgs = {
    filamentType: "PLA",
    printSettings: "20mm",
    printerType: "ender3-V2",
    fillDensity: ".15",
    fileName: ""
}


/*
* exectueCmd get a cmd in parameter, execute this commande on a shell 
* and log the result
* @param cmd - String command
*/
function executeCmd (cmd){
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                reject(error);
                return;
            }
            console.log(`stdout: ${stdout}`);
            resolve(stdout);
        });
    })
}
/* 
* initCmd function generate shel command by fetching data from agrv
*/
function initCmd(){



    // check if stl file is specified
    if(typeof process.argv[2] === 'undefined')console.log("no file please add stl file")
    else{
    // init each param in function of arg passed in 
    process.argv.forEach((val, index) => {
        if(val.startsWith('-') == true){
            switch(val) {
                case "-file":
                    cmdArgs.fileName = process.argv[index+1].split(".stl")[0];
                    break;
                case "-print-settings":
                    cmdArgs.printSettings = process.argv[index+1];
                    break;
                case "-filament-type":
                    cmdArgs.filamentType = process.argv[index+1];
                    break;
                case "-density":
                    cmdArgs.fillDensity = process.argv[index+1];
                    break;
                case "-printer-type":
                    cmdArgs.printerType = process.argv[index+1]
            }
        }
      });
    }


    return `prusa-slicer --export-gcode tmp/${cmdArgs.fileName}.stl --load ./config/config-files/print-settings/${cmdArgs.printSettings}.ini --load ./config/config-files/filament-type/${cmdArgs.filamentType}.ini --load ./config/config-files/printer-type/${cmdArgs.printerType}.ini --fill-density ${cmdArgs.fillDensity} --output export-gcodes/${cmdArgs.fileName}.gcode`;
}
executeCmd(initCmd()).then(() => {
    let printingInformations = {
        printingTime: "",
        filamentUsedInMillimeter: "",
        filamentUsedInGramme: "",
        totalCost: ""
    }
    fs.readFile(`./export-gcodes/${cmdArgs.fileName}.gcode`, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    data.split(/\r?\n/).forEach(line =>  {
        if(line.search("; estimated printing time")!= -1) printingInformations.printingTime = line.split("; estimated printing time (normal mode) = ")[1];
        if(line.search("; filament used [g]")!= -1) printingInformations.filamentUsedInGramme = line.split("; filament used [g] = ") + " g";
        if(line.search("; filament used [mm]")!= -1) printingInformations.filamentUsedInMillimeter = line.split("; filament used [mm] = ")+ " mm";
        if(line.search("; total filament cost")!= -1) printingInformations.totalCost = line.split("; total filament cost = ")[1] + " CHF";


      });
    console.log(Object.values(printingInformations));
});
});