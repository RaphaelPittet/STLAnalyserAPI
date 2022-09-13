const express = require('express')
const app = express()
const { format, createLogger, transports } = require('winston');
const { combine, timestamp, printf} = format;
const STLAnalyser = require('./stl-analyser/index');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');


// init directory where file will be stored
const storage = multer.diskStorage(
  {
      destination: './stl-analyser/tmp/',
      filename: function ( req, file, cb ) {
          cb( null, file.originalname);
      }
  }
);
const upload = multer( { storage: storage } );


// init logger
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
      new transports.File({filename: './logs/all.log', level: 'info'}),
      new transports.File({filename: './logs/errors.log', level: 'error'}),
  ],
})




// all request pass throught this "middleware"
app.use(cors());

app.use((req, res, next) => {
  logger.log({
    level: 'info',
    message: `STL-ANALYSER-API - middleware - New request on: ${req.url}[${req.method}]`
  });
  next();
})

//Encode URL to be readable
app.use(bodyParser.urlencoded({ extended: true }));






app.get('/test', function (req, res) {
  res.send('Hello World');
});




// this endpoint provide informations about stl after slicing wth given param
app.post('/upload', upload.single('file'), (req, res) => {
  let slicingParam = {};
  // verify if there is a file in the request and if the file has the right format
  if( typeof req.file == 'undefined' ) {
    return res.json(`Please send a file with your request`);  
  } 
  /*
  if(req.file.mimetype != 'application/octet-stream') {
    console.log('Please send an STL file with your request');
     return res.json(`Please send an STL file with your request`);

  } 
  */

  // init all slicing param values to be equal of the values in the body request, or if they aren't specified, add default values
  slicingParam.filamentType = typeof req.body.filamentType == 'undefined' ? slicingParam.filamentType = '' :  slicingParam.filamentType = req.body.filamentType ;
  slicingParam.printSettings = typeof req.body.printSettings =='undefined' ? slicingParam.printSettings = '' : slicingParam.printSettings = req.body.printSettings;
  slicingParam.printerType = typeof req.body.printerType == 'undefined' ? slicingParam.printerType = '' : slicingParam.printerType = req.body.printerType;
  slicingParam.fillDensity = typeof req.body.fillDensity == 'undefined' ? slicingParam.fillDensity = '' : slicingParam.fillDensity = req.body.fillDensity;
  slicingParam.scalePercent = typeof req.body.scalePercent == 'undefined' ? slicingParam.scalePercent = '' : slicingParam.scalePercent = req.body.scalePercent;
  slicingParam.xScale = typeof req.body.xScale == 'undefined' ? slicingParam.xScale = '' : slicingParam.xScale = req.body.xScale;
  slicingParam.yScale = typeof req.body.yScale == 'undefined' ? slicingParam.yScale = '' : slicingParam.yScale = req.body.yScale;
  slicingParam.zScale = typeof req.body.zScale == 'undefined' ? slicingParam.zScale = '' : slicingParam.zScale = req.body.zScale;
  slicingParam.fileName = req.file.originalname.split('.stl')[0];

  STLAnalyser.analyseSTL(slicingParam)
    .then(informations => { 
      logger.log({
        level: 'info',
        message: `STL-ANALYSER-API/upload[${req.method}] - analyseSTL - new stl (${slicingParam.fileName})[layer-height:${slicingParam.printSettings}-fill:${slicingParam.fillDensity*100}%-scaling:${slicingParam.scalePercent}%] - [Time:${informations.printingTime}-Cost:${informations.totalCost}-used[gr]:${informations.filamentUsedInGram}-used[mm]:${informations.filamentUsedInMillimeter}]`
      });
      return res.json(informations) 
    })
    .catch(err => { 
      logger.log({
        level: 'error',
        messsage: err.log
      });
    res.send(err) 
    });
});

app.listen(3000)