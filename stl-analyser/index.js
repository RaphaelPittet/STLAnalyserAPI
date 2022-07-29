const { exec } = require("child_process");


/*
* exectueCmd get a cmd in parameter, execute this commande on a shell 
* and log the result
* @param cmd - String command
*/
function executeCmd (cmd){
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });

}
/* 
* initCmd function generate shel command by fetching data from agrv
*/
function initCmd(){

    let cmdArgs = {
        filamentType: "",
        printSettings: "",
        printerType: "",
        fillDensity: "",
        fileName: ""
    }
    if(typeof process.argv[2] === 'undefined')console.log("no file please add stl file")
    else{
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
// cmd: `prusa-slicer --export-gcode tmp/${stlFile} --load <print-settings> --load <filament-type> --load <printer-type> --fill-density <fill-density> --output export-gcodes/<output-name>.gocode` 
executeCmd(initCmd());