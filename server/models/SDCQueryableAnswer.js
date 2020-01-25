var mongoose = require('mongoose'),
    Schema = mongoose.Schema

/*var SDCQueryableFieldAnswer = new Schema({
	stringValue: {type: String, default:undefined},
	numberValue: {type: Number, default:undefined}
}, {_id:false})

var SDCQueryableChoiceAnswer = new Schema({
	choiceTitle: {type: String},
	field: {type: SDCQueryableFieldAnswer, default:undefined}
}, {_id:false})*/

var SDCQueryableAnswerSchema = new Schema({
	// Form
	diagnosticProcedureID: {type: String},
	formTitle: {type: String},
	formVersion: {type: Number, default:0},
	// Response
	patientID: {type: String},
	formFillerID: {type: String},
	responseID: {type: String},
	// Node
	nodeID: {type: String},
	nodeTitle: {type: String},
	// Answer
	choiceID: {type: String, default:undefined},
	choiceTitle: {type: String, default:undefined},
	stringValue: {type: String, default:undefined},
	numberValue: {type: Number, default:undefined}
}, {collection:"SDCWarehouse"});

export default mongoose.model('SDCQueryableAnswer', SDCQueryableAnswerSchema)