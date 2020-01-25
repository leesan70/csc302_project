var mongoose = require('mongoose'),
    Schema = mongoose.Schema

import SDCFormResponse from './SDCFormResponse'

var SDCPersistentLink = new Schema({
	link: {type: String},
	timestamp: {type: String},
	response: {type: SDCFormResponse.schema}
}, {collection: "SDCPersistentLink"})

export default mongoose.model('SDCPersistentLink', SDCPersistentLink)