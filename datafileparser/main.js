'use strict';

//Takes text file (Tab-separated) as stdin input and exports objects (JSONified)

var JSONStream = require('JSONStream');
var tsv_to_arr = require('./tsv_to_arr_stream.js')();
var ArrToObjTransform = require('./ArrToObjTransform.js');

var arr_to_obj = new ArrToObjTransform();
var jsonToStrings = JSONStream.stringify(false);
console.log(arr_to_obj);
process.stdin
    .pipe(tsv_to_arr)
    .pipe(arr_to_obj)
    .on('data', (chunk) => console.log(chunk))
    .pipe(jsonToStrings)
    .pipe(process.stdout);