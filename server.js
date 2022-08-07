const express = require('express')
const app = express()
const { format, createLogger, transports } = require('winston');
const { combine, timestamp, printf} = format;
const STLAnalyser = require('./stl-analyser/index');
const multer = require('multer');


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


app.use((req, res, next) => {
  logger.log({
    level: 'info',
    message: `STL-ANALYSER-API - middleware - New request on: ${req.url}[${req.method}]`
  });
  next();
})


app.get('/', function (req, res) {
  res.send('Hello World');
});




// this endpoint provide informations about stl after slicing wth given param
app.post('/upload', upload.single('file'), (req, res) => {

  // verify if there is a file in the request and if the file has the right format
  if( typeof req.file == 'undefined' )  res.send(`Please send a file with your request`);
  if(req.file.mimetype != 'model/stl')  res.send(`Please send an STL file with your request`);
  console.log(req.body.fileName);
  if(req.body.fileName == "") res.send(`Please add your stl filename in your request`);

  let slicingParam = {
    filamentType: req.body.filamentTypes,
    printSettings: req.body.printSettings,
    printerType: req.body.printerType,
    fillDensity: req.body.fillDensity,
    fileName: req.body.fileName.split('.stl')[0],
    scalePercent: req.body.scalePercent,
  }

  STLAnalyser.analyseSTL(slicingParam)
    .then(informations => { 
      logger.log({
        level: 'info',
        message: `STL-ANALYSER-API/upload[${req.method}] - analyseSTL - new stl (${slicingParam.fileName})[layer-height:${slicingParam.printSettings}-fill:${slicingParam.fillDensity*100}%-scaling:${slicingParam.scalePercent}%] - [Time:${informations.printingTime}-Cost:${informations.totalCost}-used[gr]:${informations.filamentUsedInGram}-used[mm]:${informations.filamentUsedInMillimeter}]`
      });
      res.send(informations) 
    })
    .catch(err => { 
      logger.log({
        level: 'error',
        messsage: err.log
      });
      res.send(err.message) 
    });
});

app.listen(3000)