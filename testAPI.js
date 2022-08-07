const axios = require('axios').default;
const FormData = require('form-data');
const fs = require('fs');

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

let testParamWithoutFilamentType = {
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

let testParamWithoutPrintSettings = {
  filamentType: "PLA",
  printSettings: "",
  printerType: "ender3-V2",
  fillDensity: ".10",
  fileName: "entonoir",
  scalePercent: "88"
}

let testParamWithoutDensity = {
  filamentType: "PLA",
  printSettings: "",
  printerType: "ender3-V2",
  fillDensity: ".10",
  fileName: "Monkey_astronaut",
  scalePercent: "88"
}

function initFormData(slicingPram){
  let tmpFormData = new FormData();
  for (const property in slicingPram) {
    tmpFormData.append(property, slicingPram[property]);
  }
  return tmpFormData
}


function generateRequestWithoutFile(slicingParam){

  // fill formData variable with slicing param and provided file
  let formData = initFormData(slicingParam);
  // launch post request
  axios.post('http://localhost:3000/upload', formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      maxBodyLength: Infinity
    })
    .then(res => {
      console.log(res.data);
    })
    .catch(err => {
      console.log(err.message);
    });
}



function generateRequest(slicingParam){

  // fill formData variable with slicing param and provided file
  let formData = initFormData(slicingParam);
  formData.append('file', fs.createReadStream(`./test-files/${slicingParam.fileName}.stl`));

  // launch post request
  axios.post('http://localhost:3000/upload', formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      maxBodyLength: Infinity
    })
    .then(res => {
      console.log(res.data);
    })
    .catch(err => {
      console.log(err.message);
    });
}

//generateRequest(testParam1);
//generateRequestWithoutFile(testParam2);
//generateRequest(testParam3);
//generateRequest(testParamWithoutfileName);
generateRequest(testParamWithoutDensity);
generateRequest(testParamWithoutPrintSettings);
generateRequest(testParamWithoutFilamentType);