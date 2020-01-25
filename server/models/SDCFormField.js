var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var SDCFormFieldSchema = new Schema({
	valueType: {type: String, default: "string"}, // string, decimal, integer
	required: {type: Boolean, default:false},
	textAfter: {type: String, default:undefined},
	units: {type: String, default:undefined},
	minInclusive: {type: Number, default:undefined},
	maxInclusive: {type: Number, default:undefined}
},{_id:false})

export default mongoose.model('SDCFormField', SDCFormFieldSchema)