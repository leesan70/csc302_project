var mongoose = require('mongoose'),
    Schema = mongoose.Schema

import SDCFormAnswer from './SDCFormAnswer'

var SDCFormResponseSchema = new Schema({
	diagnosticProcedureID: {type: String},
	formVersion: {type: Number, default:0},
	patientID: {type: String},
	formFillerID: {type: String},
	createdAt: {type: String},
	updatedAt: {type: String, default:undefined},
	persistentID: {type: String},
	answers: {type: [SDCFormAnswer.schema], default:undefined},
	persistentLinks: {type: [{_id:false, link:{type:String}, timestamp: {type: String}}]}
}, { collection: "SDCFormResponse" })

export default mongoose.model('SDCFormResponse', SDCFormResponseSchema)