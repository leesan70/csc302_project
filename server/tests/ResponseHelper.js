import SDCFormResponse from '../models/SDCFormResponse'
import SDCFormAnswer from '../models/SDCFormAnswer'
import util from '../util'

var stringAnswer = 'test'
var integerAnswer = 1
var decimalAnswer = 1.5

function getNodeWithField(form) {
	for(let i = 0; i < form.nodes.length; i++) {
		if(form.nodes[i].field != null) {
			return form.nodes[i]
		}
	}	
	return null;
}

function getNodeWithChoice(form, andField = false, maxSelections = -1) {
	for(let i = 0; i < form.nodes.length; i++) {
		if(form.nodes[i].choices != null && form.nodes[i].choices.length > 1) {
			if(maxSelections != -1 && (form.nodes[i].maxSelections == null || form.nodes[i].maxSelections != maxSelections))
				continue

			for(let j = 0; j < form.nodes[i].choices.length; j++) {
				if(andField == (form.nodes[i].choices[j].field != null)) {
					return {node: form.nodes[i], index:j}
				}
			}
		}
	}
	return null;
}

function getNodeWithChoiceAndField(form) {
	return getNodeWithChoice(form, true)
}



function getCorrectFieldAnswer(field) {
	// Give basic answer
	if(field.valueType == 'string')
		return {stringValue: stringAnswer}
	else if(field.valueType == 'integer')
		return {numberValue: integerAnswer}
	else if(field.valueType == 'decimal')
		return {numberValue: decimalAnswer}
}

function getIncorrectFieldAnswer(field) {
	// Give basic answer
	if(field.valueType == 'string')
		return {numberValue: integerAnswer}
	else if(field.valueType == 'integer')
		return {numberValue: decimalAnswer}
	else if(field.valueType == 'decimal')
		return {stringValue: stringAnswer}
}

function getFieldAnswer(responseID, node, correct) {
	var answer = {
		responseID:responseID,
		nodeID:node.referenceID
	}

	if(node.field != null) {
		if(correct)
			answer.field = getCorrectFieldAnswer(node.field);
		else
			answer.field = getIncorrectFieldAnswer(node.field);
	} 
	return answer;
}


function getChoiceAnswer(responseID, node, index) {
	var answer = {
		responseID:responseID,
		nodeID:node.referenceID
	}

	if(node.choices != null) {
		var choice = {
			choiceID: node.choices[index].referenceID
		}

		if(node.choices[index].field != null) {
			choice.field = getCorrectFieldAnswer(node.choices[index].field)
		}

		answer.choices = [choice]
	} 
	return answer;
}

function getMultiChoiceAnswer(responseID, node, indices) {
	var answer = {
		responseID:responseID,
		nodeID:node.referenceID,
		choices:[]
	}

	if(node.choices != null) {
		for(let i = 0; i < indices.length; i++) {
			var choice = {
				choiceID: node.choices[indices[i]].referenceID
			}

			if(node.choices[indices[i]].field != null) {
				choice.field = getCorrectFieldAnswer(node.choices[indices[i]].field)
			}

			answer.choices.push(choice)
		}
	} 
	return answer;
}

export const ResponseHelper = {
	getFieldAnswer,
	getChoiceAnswer,
	getMultiChoiceAnswer,
	stringAnswer,
	integerAnswer,
	decimalAnswer,
	getNodeWithField,
	getNodeWithChoice,
	getNodeWithChoiceAndField
}