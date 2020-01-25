var mongoose = require('mongoose'),
    Schema = mongoose.Schema

import SDCFormField from './SDCFormField'
import SDCFormChoice from './SDCFormChoice'

var SDCFormDependency = new Schema({
	nodeID: {type: String},
	choiceID: {type: String}
},{_id:false})

var SDCFormNodeSchema = new Schema({
	_id: {type: String},
	title: {type: String},
	referenceID: {type: String},
	section: {type: Number},
	dependencies: {type:[SDCFormDependency], default:undefined},
	maxSelections: {type: Number, default: undefined},
	choices: {type: [SDCFormChoice.schema], default:undefined},
	field: {type: SDCFormField.schema, default:undefined}
})

export default mongoose.model('SDCFormNode', SDCFormNodeSchema)
