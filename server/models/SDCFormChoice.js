var mongoose = require('mongoose'),
    Schema = mongoose.Schema

import SDCFormField from './SDCFormField'

var SDCFormChoiceSchema = new Schema({
	title: {type: String}, 
	referenceID: {type: String},
	field: {type: SDCFormField.schema},
	selected: {type: Boolean},
	selectionDeselectsSiblings: {type: Boolean}
},{_id:false})

export default mongoose.model('SDCFormChoice', SDCFormChoiceSchema)