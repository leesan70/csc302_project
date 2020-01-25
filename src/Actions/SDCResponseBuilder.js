import { SDCMiddleware } from 'Actions'

function fetchOptions() {
	return {
		mode: 'cors', // no-cors, *cors, same-origin
		cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
		credentials: 'same-origin', // include, *same-origin, omit
		headers: {
			'Content-Type': 'application/json'
			// 'Content-Type': 'application/x-www-form-urlencoded',
		},
		redirect: 'follow', // manual, *follow, error
		referrer: 'no-referrer', // no-referrer, *client
	}	
}

function handleErrors(res) {
    if (!res.ok) throw Error(res.statusText);
    return res;
}

/** 
 * Utility to help generate an SDCFormResponse
 */
export const SDCResponseBuilder = (response = {}) => {
	var fieldTimeout = {}

	/** 
	 * Post an answer to the database
	 * @param answer, SDCFormAnswer
	 */
	function postAnswer(answer, options = {}) {
		console.log("Posting answer")
		console.log(answer)
		var body = {answer:answer}
		for(var key in options)
			body[key] = options[key]
		return new Promise((resolve, reject) => {
			var options = fetchOptions()
			options.method = 'POST'
			options.body = JSON.stringify(body)
			var path = '/api/response/answer'
			fetch(path, options)
			.then(handleErrors)
			.then(resolve)
			.catch(reject)
		})
	}

	/**
	 * Delete an answer in the database
	 * @param answer, SDCFormAnswer
	 */
	function deleteAnswer(answer) {
		return new Promise((resolve, reject) => {
			var options = fetchOptions()
			options.method = 'DELETE'
			var path = '/api/response/answer?responseID=' + answer.responseID + '&nodeID=' + answer.nodeID
			if(answer.choices != null && answer.choices.length > 0)  
				path += '&choiceID=' + answer.choices[0].choiceID;
			fetch(path, options)
			.then(handleErrors)
			.then(res => {
				return res.json()
			})
			.then(resolve)
			.catch(reject)
		})
	}	

	/** 
	 * Submit a field value answer (doesn't do type check here)
	 * @param nodeID string
	 * @param answerVal string/integer/decimal
	 */
	function fieldAnswer(nodeID, answerType, answerVal, choiceID=null) {
		return new Promise((resolve, reject) => {
			if(nodeID in fieldTimeout) {
				clearTimeout(fieldTimeout[nodeID])
				delete fieldTimeout[nodeID]
			}
			fieldTimeout[nodeID] = setTimeout(() => {
				var answer = {
					responseID: response._id,
					nodeID: nodeID
				}

				if(answerType == 'integer' || answerType == 'decimal')
					answerType = 'numberValue'
				else if(answerType == 'string')
					answerType = 'stringValue'

				if(choiceID != null) {
					answer.choices = [{choiceID: choiceID, field:{}}]
					answer.choices[0].field[answerType] = answerVal
				} else {
					answer.field = {}
					answer.field[answerType] = answerVal
				}

				if(answerVal == "" && choiceID == null) {
					deleteAnswer(answer)
					.then(resolve)
					.catch(reject)
				} else {
					postAnswer(answer)
					.then(resolve)
					.catch(reject)
				}
				delete fieldTimeout[nodeID]
			}, 1000)

		})
	}

	/** 
	 * Submit a choice value answer
	 * @param nodeID string
	 * @param choiceID string, referenceID of choice chosen
	 * @param yesNo, whether the choice was selected/deselected
	 * @param maxSelection, whether this choice deselects others
	 */
	function choiceAnswer(nodeID, choiceID, yesNo, maxSelection=0) {
		console.log("Answer max selection!" + maxSelection)
		return new Promise((resolve, reject) => {
			var answer = {responseID: response._id, nodeID: nodeID, choices:[{choiceID:choiceID}]}
			if(yesNo) {
				console.log("Select " + choiceID)
				postAnswer(answer,{maxSelection:maxSelection}).then(resolve).catch(reject)
			} else {
				console.log("Deselect " + choiceID)
				deleteAnswer(answer).then(resolve).catch(reject);
			}
		})
	}

	/** 
	 * Submit an additional field value answer for a choice
	 * @param nodeID string
	 * @param choiceID string
	 * @param answerVal string/integer/decimal
	 */
	function choiceFieldAnswer(nodeID, choiceID, answerVal) {
		return fieldAnswer(nodeID, answerVal, choiceID);
	}

	/**
	 * Submit the response to the api
	 * @return Promise
	 */
	function submit() {
		return new Promise((resolve, reject) => {
			var options = fetchOptions()
			options.method = 'PUT'
			options.body = JSON.stringify(response)
			fetch('/api/response', options)
			.then(handleErrors)
			.then(res => {
				return res.json()
			})
			.then(resolve)
			.catch(reject)
		})
	}

	return {
		fieldAnswer,
		choiceAnswer,
		choiceFieldAnswer,
		submit
	}
}