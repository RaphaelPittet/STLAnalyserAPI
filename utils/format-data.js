module.exports = { formatReqSlicingPram }

function formatReqSlicingPram(reqBody){
    let slicingParam = {};

    // init all slicing param values to be equal of the values in the body request, or if they aren't specified, add default values
    slicingParam.filamentType = typeof reqBody.filamentType == 'undefined' ? slicingParam.filamentType = '' :  slicingParam.filamentType = reqBody.filamentType ;
    slicingParam.printSettings = typeof reqBody.printSettings =='undefined' ? slicingParam.printSettings = '' : slicingParam.printSettings = reqBody.printSettings;
    slicingParam.printerType = typeof reqBody.printerType == 'undefined' ? slicingParam.printerType = '' : slicingParam.printerType = reqBody.printerType;
    slicingParam.fillDensity = typeof reqBody.fillDensity == 'undefined' ? slicingParam.fillDensity = '' : slicingParam.fillDensity = reqBody.fillDensity;
    slicingParam.scalePercent = typeof reqBody.scalePercent == 'undefined' ? slicingParam.scalePercent = '' : slicingParam.scalePercent = reqBody.scalePercent;
    slicingParam.xScale = typeof reqBody.xScale == 'undefined' ? slicingParam.xScale = '' : slicingParam.xScale = reqBody.xScale;
    slicingParam.yScale = typeof reqBody.yScale == 'undefined' ? slicingParam.yScale = '' : slicingParam.yScale = reqBody.yScale;
    slicingParam.zScale = typeof reqBody.zScale == 'undefined' ? slicingParam.zScale = '' : slicingParam.zScale = reqBody.zScale;

    return slicingParam;
}