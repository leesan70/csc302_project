var mongoose = require('mongoose'),
    Schema = mongoose.Schema

import SDCFormField from './SDCFormField'
import SDCFormChoice from './SDCFormChoice'

var SDCFieldAnswer = new Schema({
	stringValue: {type: String, default:undefined},
	numberValue: {type: Number, default:undefined}
}, {_id:false})

var SDCChoiceAnswer = new Schema({
	choiceID: {type: String},
	field: {type: SDCFieldAnswer, default:undefined}
}, {_id:false})

var SDCFormAnswerSchema = new Schema({
	_id: {type: mongoose.Types.ObjectId, auto: true},
	responseID: {type: String},
	nodeID: {type: String},
	choices: {type: [SDCChoiceAnswer], default:undefined},
	field: {type: SDCFieldAnswer, default:undefined}
}, {collection: 'SDCFormAnswer'})

export default mongoose.model('SDCFormAnswer', SDCFormAnswerSchema)