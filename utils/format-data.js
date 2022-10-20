const fs = require("fs");

module.exports = {formatReqSlicingParam}

/*
Function formatReqSlicingParam check and format all data from the request body to fit with the stl-analyser
@param reqBody - the body of the request on /upload endpoint
@return - all slicing param formatted and given inside an object
 */
function formatReqSlicingParam(reqBody) {
    let slicingParam = {};
    let potentialErrors = [];
    let availableParam;

    try {
        const jsonString = fs.readFileSync("./data.json");
        availableParam = JSON.parse(jsonString.toString());
    } catch (err) {
        console.log(err);
        err.message = "error when reading data.json file";
        return err;
    }

    // check if filament type parameter is given in the request if not, give the value ''
    if (reqBody.filamentType !== undefined) {
        potentialErrors[0] = checkForGivenParam(availableParam, reqBody.filamentType, "filamentType");
    } else {
        slicingParam.filamentType = '';
    }
    // check if printer type parameter is given in the request if not, give the value ''
    if (reqBody.printerType !== undefined) {
        potentialErrors[1] = checkForGivenParam(availableParam, reqBody.printerType, "printerType");
    } else {
        slicingParam.printerType = '';
    }
    // check if print settings parameter is given in the request if not, give the value ''
    if (reqBody.printSettings !== undefined) {
        potentialErrors[2] = checkForGivenParam(availableParam, reqBody.printSettings, "printSettings");
    } else {
        slicingParam.printSettings = '';
    }
    if(reqBody.fillDensity < 0 || reqBody.fillDensity > 100){
        potentialErrors[3] = 1
    }
    //check if any of last verification test failed and throw an exception if there is
    if (potentialErrors[0] === 1 || potentialErrors[1] === 1 || potentialErrors[2] === 1) {
        throw "Some given data doesn't fit with available parameter"
    } else {
        // init all slicing param values to be equal of the values in the body request, or if they aren't specified, add default values
        slicingParam.printSettings = reqBody.printSettings;
        slicingParam.printerType = reqBody.printerType;
        slicingParam.filamentType = reqBody.filamentType;
        slicingParam.fillDensity = reqBody.fillDensity;
        slicingParam.scalePercent = typeof reqBody.scalePercent == 'undefined' ? slicingParam.scalePercent = '' : slicingParam.scalePercent = reqBody.scalePercent;
        slicingParam.xScale = typeof reqBody.xScale == 'undefined' ? slicingParam.xScale = '' : slicingParam.xScale = reqBody.xScale;
        slicingParam.yScale = typeof reqBody.yScale == 'undefined' ? slicingParam.yScale = '' : slicingParam.yScale = reqBody.yScale;
        slicingParam.zScale = typeof reqBody.zScale == 'undefined' ? slicingParam.zScale = '' : slicingParam.zScale = reqBody.zScale;
        return slicingParam;
    }
}


/*
Function checkForGivenParam, check in the data.json file, if there is some param with the same type and if the given param with body fit with data.json param
@param setOfData - all available param
@param givenParam - parameter given in the body of the request
@param searchedParam - the type of the searched param value
@return - 1 if it doesn't fit / 0 if it fit
 */
function checkForGivenParam(setOfData, givenParam, searchedParam) {
    let error = 1;
    for (let i = 0; i < setOfData.length; i++) {
        if (setOfData[i].type === searchedParam) {
            if (setOfData[i].name === givenParam) {
                error = 0;
            }
        }
    }
    return error;
}