var mongoose = require('mongoose'),
    Schema = mongoose.Schema

import SDCFormNode from './SDCFormNode'

var SDCFormSchema = new Schema({
	diagnosticProcedureID: {type: String},
	version: {type: Number, default: 0},
	active: {type: Boolean, default: true},
    title: {type: String, default: ""},
    nodes:[{type: SDCFormNode.schema}],
    sections:[{type: String}]
}, { collection: "SDCForm" })

SDCFormSchema.methods.ToString = () => {
	return this.diagnosticProcedureID
}

export default mongoose.model('SDCForm', SDCFormSchema)
