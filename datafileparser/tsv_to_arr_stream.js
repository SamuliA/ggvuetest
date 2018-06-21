'use strict';
//Take TSV format file and convert each line into an array.
var csv = require('csv-streamify');

module.exports = exports = function() {
    return csv({
        objectMode: true,
        delimiter: '\t',
        newline: '\r\n',
        quote: "½"
    });
}