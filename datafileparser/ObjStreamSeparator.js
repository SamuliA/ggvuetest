'use strict'
//Convert object stream by running it through a set of converter functions
//Examples include separating a string value into an array of strings.

var _ = require('underscore');
var util = require('util');
const { Transform } = require('stream');

class ObjStreamSeparator extends Transform {
    constructor(options) {
        super(_.extend({
            objectMode: true
        }, options));
        this.types = options.types;
        console.log('ObjStreamSeparator options: ' + util.inspect(options));
    }
}

//options may contain an "types": an object.
//This object can include the "type-definition" of each kay in the objects
//of the object stream. If a key is found in the types object, it's value
//is used as a rule on how to process the value of the streamed object

ObjStreamSeparator.prototype._transform = function(chunk, encoding, done) {
    var obj = {};
    var types = this.types;
    //console.log('TYPES: ' + util.inspect(types));
    _.each(chunk, function(item, key) {
        if (types && types[key]) {
            item = valueToObj(item, types[key]);
        }
        //Compose result object by adding value to key
        obj[key] = item;
        //If value is an object itself, extend result object by value object.
        // (Arrays stay as values in their keys)
        if( _.isObject(item) && !_.isArray(item) ) {
            //console.log( util.inspect ( item ));
            obj = _.extend( obj, item );
        }
    });

    done(null, obj);
}

function valueToObj(value, type) {

    var parts = type.split('(');
    //console.log( 'PARTS: ' + util.inspect( parts ));
    switch (parts[0]) {
        case "str":
            //string value
            //strip whitespace
            value = value.trim();
            break;
        case "i":
            //integer value
            //Force integer
            value = ~~value;
            break;
        case "array":
            {
                //string array. separator given as a "parameter"
                // format: array(i,'/')
                var type = parts[1].split(',')[0];
                var sep = parts[1].split("'")[1];
                //console.log('array type: ' + type + ' sep: ' + sep);
                value = _.map(value.split(sep), function(itm) {
                    if (type == 'i') {
                        return ~~itm;
                    } else {
                        return itm.trim();
                    }
                });
                //console.log('value = ' + util.inspect(value));
            }
            break;
        case "combo":
            {
                //One cell contains two or more values that should be separated and
                //can be injected as separate members of the resulting object
                //Format:combo(separator_str|member_name:value_type:optional_unit|member_name:value_type:optional_unit|etc)
                //ex:
                //HS stat = combo(,|hull:i|struct:i)
                //type stat = combo( |type:str|height:str:")
                //each value of MR stat array = combo(:|type:str|speed:str:")
                //Result example:
                // 'Gear 1.5"' -> combo( |type:str|height:str:") -> {type:'Gear', height:'1.5"'}
                var fullcombo = parts[1].split(')')[0].split('|');
                var sep = fullcombo[0];
                var combo = _.rest(fullcombo);
                var valparts = value.split(sep);
                var retval = {};
                _.each(valparts, function(part, i) {
                    var name = combo[i].split(':')[0];
                    var type = combo[i].split(':')[1];
                    var unit = combo[i].split(':')[2];
                    retval[name] = getValueUsingType( part, type );
                });
                value = retval;
            }
            break;
        case "#types":
            //Do nothing, it's just the types linetype identifier
        break;
        default:
            var err = 'UNKNOWN type : ' + type;
            console.log(err);
            //Ignore
        break;
    }
    return value;
}

//Allwed types : str, i
function getValueUsingType(value, type) {
    if (type == 'i') {
        return ~~value;
    } else {
        return value.trim();
    }
}

module.exports = ObjStreamSeparator;