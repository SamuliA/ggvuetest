'use strict';

//Node Streams practise
//Takes text file (Tab-separated) as stdin input and exports objects (JSONified)
var fs = require('fs');
var JSONStream = require('JSONStream');
var tsv_to_arr = require('./tsv_to_arr_stream.js')();
var ArrToObjTransform = require('./ArrToObjTransform.js');
var ObjStreamSeparator = require('./ObjStreamSeparator.js');
var arr_to_obj = new ArrToObjTransform();
var obj_sep = new ObjStreamSeparator({foo:'foo'});
var jsonToStrings = JSONStream.stringify(false);
const argv = require('yargs')
//    .alias('i', 'input')
    .argv;

    //console.log(arr_to_obj);
var types = {};
var istream;
try {
    //console.log( argv.i );
    istream = fs.createReadStream( argv.i );
} catch (e) {
    istream = process.stdin;
}

istream
    .pipe(tsv_to_arr)
    .pipe(arr_to_obj)
    .on('data', (chunk) => {
        if (chunk.linetype == "#types") {
            obj_sep.types = chunk;
        }
    })
    .pipe(obj_sep)
    .on('data', (chunk) => console.log(chunk))
//.pipe(jsonToStrings)
//.pipe(process.stdout);