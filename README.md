# STLAnalyserAPI

Node backend server with express who provide informations about an STL file after being tranformed in GCODE with prusaslicer  


## Steps
| Description | Version | Progress | Note |
|:-:|:-:|:-:|:-:|
| Execute command correclty and generate Gcode | 1.00 | Done |   |
| Execute command with parameter (printer profil, filament type, etc) | 2.00 | Done |   |
| Execute command correclty and provide informations | 3.00 | Done |   |
| Express API Server | 4.00  | DONE |   |
| POST Endpoint provide needed informations  | 5.00 | DONE |   
| Adding Endpoint to CRUD other printing pramaeter file | 6.00 | In-Progress



## Required
- NodeJS
- Prusa-slicer 


## Docs

### INSTALLATION
```
npm install 
```
### START SERVER

```
node server
```


### REQUEST


make a **POST** request with **multipart/form-data** content type. 

- request url [http://localhost:3000/upload]

The request must be done with:
- an .stl file with file key attribut
- an object with slicing parameter:
  - filename
  - [optional] printer-type
  - [optional] print-settings 
  - [optional] fill-density 
  - [optional] scale
  - [optional] filament-type

### test

```
node testAPI.js
```




