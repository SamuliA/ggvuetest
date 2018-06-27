var _ = require('underscore');
const { Transform } = require('stream');

class ArrToObjTransform extends Transform {
    constructor(options) {
        super(_.extend({
            objectMode: true
        }, options));

    }
}

ArrToObjTransform.prototype._transform = function(chunk, encoding, done) {
    var obj = {};
    //console.log( chunk );
    if (!this.header) {
    	//console.log( 'HEADER FOUND: ' + chunk );
        this.header = chunk;
    } else {
    	var head = this.header;
        _.each(chunk, function(item, index) {
            obj[head[index]] = item;
        });
    }
    done(null, obj);
}

module.exports = ArrToObjTransform;
