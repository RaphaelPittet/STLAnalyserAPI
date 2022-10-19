const fs = require("fs");

module.exports = { formatReqSlicingPram }

function formatReqSlicingPram(reqBody){
    let slicingParam = {};
    let potentialErrors = [];
    let availableParam;

    //TODO verification of body data to fit with available parameter
    try {
        const jsonString = fs.readFileSync("./customer.json");
        availableParam = JSON.parse(jsonString.toString());
    } catch (err) {
        console.log(err);
        err.message= "error when reading data.json file";
        return err;
    }

    potentialErrors[0] = checkForGivenParam(availableParam ,reqBody.filamentType, "filamentType");
    potentialErrors[1] = checkForGivenParam(availableParam ,reqBody.printerType, "printerType");
    potentialErrors[2] = checkForGivenParam(availableParam ,reqBody.printerType, "printerSettings");

    if(potentialErrors[0] === 1 | potentialErrors[1] === 1 | potentialErrors[2] === 1){
        throw "Some given data doesn't fit with available parameter"
    }else {


        // init all slicing param values to be equal of the values in the body request, or if they aren't specified, add default values
        slicingParam.filamentType = typeof reqBody.filamentType == 'undefined' ? slicingParam.filamentType = '' : slicingParam.filamentType = reqBody.filamentType;
        slicingParam.printSettings = typeof reqBody.printSettings == 'undefined' ? slicingParam.printSettings = '' : slicingParam.printSettings = reqBody.printSettings;
        slicingParam.printerType = typeof reqBody.printerType == 'undefined' ? slicingParam.printerType = '' : slicingParam.printerType = reqBody.printerType;
        slicingParam.fillDensity = typeof reqBody.fillDensity == 'undefined' ? slicingParam.fillDensity = '' : slicingParam.fillDensity = reqBody.fillDensity;
        slicingParam.scalePercent = typeof reqBody.scalePercent == 'undefined' ? slicingParam.scalePercent = '' : slicingParam.scalePercent = reqBody.scalePercent;
        slicingParam.xScale = typeof reqBody.xScale == 'undefined' ? slicingParam.xScale = '' : slicingParam.xScale = reqBody.xScale;
        slicingParam.yScale = typeof reqBody.yScale == 'undefined' ? slicingParam.yScale = '' : slicingParam.yScale = reqBody.yScale;
        slicingParam.zScale = typeof reqBody.zScale == 'undefined' ? slicingParam.zScale = '' : slicingParam.zScale = reqBody.zScale;

        return slicingParam;
    }
}

function checkForGivenParam(setOfData, givenParam, searchedParam){
    let error = 1;
    for(let i = 0; i<setOfData.length; i++){
        if (setOfData[i].type === searchedParam){
            if(setOfData[i].name === givenParam){
                error = 0;
            }
        }
    }
    return error;
}