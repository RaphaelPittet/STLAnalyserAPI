const express = require('express')
const app = express()
const {format, createLogger, transports} = require('winston');
const {combine, timestamp, printf} = format;
const STLAnalyser = require('./stl-analyser/index');
const Utils = require('./utils/format-data');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');



// init directory where file will be stored
const storage = multer.diskStorage(
    {
        destination: './stl-analyser/tmp/',
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        }
    }
);
const upload = multer({storage: storage});


// init logger
const loggerFormat = printf(({level, message, timestamp}) => {
    let timestampArray = timestamp.split('T');
    let timestampFormat = `${timestampArray[0]} ${timestampArray[1].split('', 8).join('')}`
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


// all request pass through this "middleware"
app.use(cors());

app.use((req, res, next) => {
    logger.log({
        level: 'info',
        message: `STL-ANALYSER-API - middleware - New request on: ${req.url}[${req.method}]`
    });
    next();
})

//Encode URL to be readable
app.use(bodyParser.urlencoded({extended: true}));


app.get('/test', function (req, res) {
    res.send('Hello World');
});

/*-----------------------------------------------------------------------------------------
CRUD Print Setting
------------------------------------------------------------------------------------------ */
app.get('/api/admin/print-settings/', function (req,res){

    let files = fs.readdirSync('./stl-analyser/config/config-files/print-settings/');
    console.log(files);

    res.json(files);

});




// this endpoint provide information about stl after slicing wth given param
app.post('/upload', upload.single('file'), (req, res) => {
    let slicingParam = {};
    // verify if there is a file in the request and if the file has the right format
    if (typeof req.file == 'undefined') {
        return res.json(`Please send a file with your request`);
    }

    /*
    if(req.file.mimetype != 'application/octet-stream') {
      console.log('Please send an STL file with your request');
       return res.json(`Please send an STL file with your request`);

    }
    */

    //init Data with slicing parameter given in the body of the request
    slicingParam = Utils.formatReqSlicingPram(req.body);
    slicingParam.fileName = req.file.originalname.split('.stl')[0];

    STLAnalyser.analyseSTL(slicingParam)
        .then(information => {
            logger.log({
                level: 'info',
                message: `STL-ANALYSER-API/upload[${req.method}] - analyseSTL - new stl (${slicingParam.fileName})[layer-height:${slicingParam.printSettings}-fill:${slicingParam.fillDensity * 100}%-scaling:${slicingParam.scalePercent}%] - [Time:${information.printingTime}-Cost:${information.totalCost}-used[gr]:${information.filamentUsedInGram}-used[mm]:${information.filamentUsedInMillimeter}]`
            });
            return res.json(information)
        })
        .catch(err => {
            logger.log({
                level: 'error',
                message: err.log
            });
            res.send(err)
        });
});

app.listen(3000)