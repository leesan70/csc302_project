import express from 'express'
import util from '../util'
import elastic from '../elastic'
import persistent from '../persistent'

import SDCForm from '../models/SDCForm'
import SDCFormResponse from '../models/SDCFormResponse'
import SDCFormAnswer from '../models/SDCFormAnswer'
import SDCPersistentLink from '../models/SDCPersistentLink'
import SDCQueryableAnswer from '../models/SDCQueryableAnswer'


export default (passport) => {
	var router = express.Router()

	/**
	 * Start a new form response
	 */
	router.post('/', (req, res) => {
		var response
		if('response' in req.body)
			response = req.body.response
		else
			response = req.body

		var timestamp = util.timestamp()
		var newResponse = new SDCFormResponse()
		newResponse.createdAt = timestamp
		newResponse.updatedAt = timestamp
		newResponse.diagnosticProcedureID = response.diagnosticProcedureID
		newResponse.patientID = response.patientID
		newResponse.formFillerID = response.formFillerID
		if('formVersion' in response)
			newResponse.formVersion = response.formVersion
		else
			newResponse.formVersion = 1

		newResponse.save((err, resp) => {
			if (err) {
				util.errorMessage(res, err, "creating form")
			} else {
				res.send(resp)
			}
		})
	})

	/**
	 * Search form responses
	 */
	router.get('/search', (req, res) => {
		var query = {}

		// Need at least a formfillerID or patientID
		if(req.query.patientID == null && req.query.formFillerID == null) {
			util.errorMessage(res, "patientID and/or formFillerID not supplied", null, 404);
			return	
		}

		if (req.query.formFillerID != null) {
			query.formFillerID = req.query.formFillerID
		}

		if (req.query.patientID != null) {
			query.patientID = req.query.patientID;
		}

		if (req.query.diagnosticProcedureID != null) {
			query.diagnosticProcedureID = req.query.diagnosticProcedureID
		}

		SDCFormResponse.find(query).sort('-updatedAt').exec((err, resp) => {
				if (err) {
					util.errorMessage(res, err, "finding SDC forms");
				} else if(resp.length == 0) {
					res.send([])
				} else {
					res.send(resp)
				}
			})
	})

	/**
	 * Get a form response by id
	 */
	router.get('/:responseID', (req, res) => {
		if (req.params.responseID == null) {
			util.errorMessage(res, "no id supplied");
			return
		}
		getFullResponse(req.params.responseID)
		.then(resp => {
			res.send(resp)
		})
		.catch(err => {
			util.errorMessage(res, err, "getting full response")
		})
	})

	/**
	 * Update/submit a form response
	 */
	router.put('/', (req, res) => {
		// All the answers should already be in the form, at this point we just create a persistent link (if it doesn't exist)
		if (req.body._id == null) {
			util.errorMessage(res, "no id supplied");
			return
		}

		function generatePersistentLink(response) {
			SDCPersistentLink.findOne({
				"response._id": response._id,
				"response.updatedAt":response.updatedAt
			}, (err, link) => {
				if (err)
					util.errorMessage(res, err, "getting link")
				else if (link) {
					res.send({link:link.link})
				}
				else {
					// Updated at has been changed. Generate a new link
					var timestamp = persistent.timestampToDate(util.timestamp()).toUTCString()
					var link = new SDCPersistentLink();
					delete response.persistentLinks
					link.response = response
					link.link = util.uniqueID(8);
					link.timestamp = timestamp
					link.save((err) => {
						if (err)
							util.errorMessage(res, err, "saving link")
						else {
							// Finally add it to the response
							SDCFormResponse.updateOne({_id: response._id}, {$push: {persistentLinks: {link:link.link, timestamp:link.timestamp}}}, (err) => {
								if(err) {
									util.errorMessage(res, err, "updating response links")
								} else {
									res.send(link)
								}
							})
						}
					})
				}
			})
		}
		getFullResponse(req.body._id)
		.then(resp => {
			new Promise((resolve, reject) => {
				// Should we validate?
				if(req.query.validate != null && parseInt(req.query.validate) == 1) { 
					validateResponse(resp)
					.then(resolve)
					.catch(reject)
				} else {
					resolve()
				}
			})
			.then(() => {
				elastic.addResponseToElasticSearch(resp)
				.then(() =>{
					generatePersistentLink(resp)
				})
				.catch(err => {throw err})
			})
			.catch(err => {
				res.status(400).send(err)
			})	
		})
		.catch(err => {
			util.errorMessage(err, 'getting full response')
		})
	})

	/**
	 * Answer a question in a form response
	 */
	router.post('/answer', (req, res) => {
		if (req.body.answer == null) {
			util.errorMessage(res, 'no answer provided')
		}
		var newAnswer = req.body.answer

		// Update saved date
		var timestamp = util.timestamp();

		// Update or create new answer
		SDCFormAnswer.findOne({responseID: newAnswer.responseID, nodeID: newAnswer.nodeID}, (err, answer) => {
			if(err)
				util.errorMessage(res, err, "getting answer")
			else if(!answer) {
				answer = new SDCFormAnswer()
				answer.responseID = newAnswer.responseID
				answer.nodeID = newAnswer.nodeID
			} 

			if(newAnswer.field != null) {
				answer.field = newAnswer.field
			} else if(newAnswer.choices != null) {
				var newChoices = newAnswer.choices
				var maxSelection = 0
				if('maxSelection' in req.body)
					maxSelection = parseInt(req.body.maxSelection)

				// Merge with 
				if(answer.choices == null)
					answer.choices = []

				// If exclusive simply override
				if(maxSelection == 1) {
					answer.choices = newChoices
				}
				// TODO: > 1 case?
				else {
					if(answer.choices.length == 0) {
						for(let i = 0; i < newChoices.length; i++) {
							answer.choices.push(newChoices[i])
						}
					} 
					// Check for replacements
					else {
						for(let i = 0; i < newChoices.length; i++) {
							var replaced = false;
							for(let j = 0; j < answer.choices.length; j++) {
								// Replace
								if(answer.choices[j].choiceID == newChoices[i].choiceID) {
									answer.choices[j] = newChoices[i]
									replaced = true
									break
								}
							}
							if(!replaced) {
								answer.choices.push(newChoices[i])
							}
						}
					}
				}
			}

			answer.save(err => {
				if (err)
					util.errorMessage(res, err, "updating answer")
				else {
					SDCFormResponse.updateOne({_id: newAnswer.responseID}, {updatedAt: timestamp}, (err) => {
						if (err) {
							util.errorMessage(res, err, "updating response");
						} else {
							res.sendStatus(200);
						}
					})
				}	
			})
		})
	})

	router.delete('/answer', (req, res) => {
		if(req.query.responseID == null) {
			util.errorMessage(res, "responseID must be included")
			return
		}

		if(req.query.nodeID == null) {
			util.errorMessage(res, "nodeID must be included")
			return
		}

		// Deselect choice
		var choiceID = null
		if(req.query.choiceID != null) {
			choiceID = req.query.choiceID
		}

		var responseID = req.query.responseID
		var nodeID = req.query.nodeID
		SDCFormAnswer.findOne({responseID: responseID, nodeID: nodeID}, (err, answer) => {
			if(err)
				util.errorMessage(res, err, "getting answer")
			else if(answer) {
				// Determine if we delete the whole answer or just a choice/field
				var deleteAnswer = true
				if(answer.choices != null && choiceID != null) {
					for(let i = 0; i < answer.choices.length; i++) {
						if(answer.choices[i].choiceID == choiceID) {
							answer.choices.splice(i, 1)
							break
						}
					}
					// No more choices, delete entire answer
					deleteAnswer = (answer.choices.length == 0)
				}
				if(deleteAnswer) {
					SDCFormAnswer.deleteOne({_id: answer._id}, (err) => {
						if(err) {
							util.errorMessage(res, err, 'deleting answer')
						} else {
							res.sendStatus(200)
						}
					})
				} else {
					answer.save(err => {
						if(err)
							util.errorMessage(err, 'saving answer after delete')
						else
							res.sendStatus(200)
					})
				}
			} else {
				res.sendStatus(404)
			}
		})
	})

	return router
}


/** 
 * Get a response joined with its answers
 * @param responseID
 * @return Promise
 */
function getFullResponse(responseID) {
	return new Promise((resolve, reject) => {
		SDCFormResponse.findOne({_id: responseID}, (err, resp) => {
			if(err) {
				reject(err)
			} else if(!resp) {
				reject('response not found')
			} else {
				// Get answers for response
				SDCFormAnswer.find({responseID:responseID.toString()}, (err, answers) => {
					if(err) {
						reject(err)
					} else {
						resp = resp.toObject()
						resp.answers = answers;
						resolve(resp)
					}
				})
			}
		})
	}) 
}

/** 
 * Validate the SDCFormResponse
 * If fails returns a dictionary detailing which fields have missing required fields, and which have the wrong type
 * @return {missingRequired[], expectedType[]}
 */
function validateResponse(response) {
	return new Promise((resolve, reject) => {
		if(response.answers.length == 0) {
			reject({error: "no answers in response"})
			return
		}

		var missingRequired = []
		var expectedType = []
		var wrongChoiceCount = []

		var answerMap = {}
		if(response.answers != null) {
			for(let i = 0; i < response.answers.length; i++) {
				answerMap[response.answers[i].nodeID] = response.answers[i]
			}
		}

		var validateField = (node, field, answer) => {
			if(answer == null || answer.field == null 
				|| (answer.field.stringValue != null && answer.field.stringValue == "") 
				|| (answer.field.numberValue != null && answer.field.numberValue == "")) {
				if(field.required) {
					var req = {nodeID:node.referenceID, type:field.valueType}
					if(answer && 'choiceID' in answer)
						req.choiceID = answer.choiceID
					missingRequired.push(req)
				}
				return false
			} else if(field.valueType == 'integer') {
				if(isNaN(answer.field.numberValue) || answer.field.numberValue.indexOf('.') != -1) { 
					var expected = {nodeID:node.referenceID, type:field.valueType}
					if(answer && 'choiceID' in answer)
						expected.choiceID = answer.choiceID
					expectedType.push(expected)
					return false
				}
				return true
			} else if(field.valueType == 'decimal') {
				if(isNaN(answer.field.numberValue)) {
					var expected = {nodeID:node.referenceID, type:field.valueType}
					if(answer && 'choiceID' in answer)
						expected.choiceID = answer.choiceID
					expectedType.push(expected)
					return false
				}
				return true
			} 

			return true
		}

		// Get the form for this response
		SDCForm.findOne({version:response.formVersion , diagnosticProcedureID:response.diagnosticProcedureID}, (err, form) => {
			if(err) {
				reject(err)
			} else if(!form) {
				reject('no form found')
			} else {
				// Validate each node in the form and fill response with valid answers
				for(var i = 0; i < form.nodes.length; i++) {
					var node = form.nodes[i]
					var answer = answerMap[node.referenceID]

					// Might be null, stil need to validate based on form expectations
					if(node.field != null && !validateField(node, node.field, answer)) {
						continue
					}
					if(node.choices != null) {
						if(answer == null || answer.choices == null) {
							continue
						} else {
							if(node.maxSelections != 0 && answer.choices.length > node.maxSelections) {
								wrongChoiceCount.push({nodeID:node.referenceID, expected:node.maxSelections, actual:answer.choices.length})
							}

							for(let i = 0; i < node.choices.length; i++) {
								if(node.choices[i].field) {
									// Find corresponding choice (this is n^2 so could be improved)
									var choiceAnswer = null;
									for(let j = 0; j < answer.choices.length; j++) {
										if(answer.choices[j].choiceID == node.choices[i].referenceID) {
											choiceAnswer = answer.choices[j]
											break
										}
									}
									if(choiceAnswer != null && !validateField(node, node.choices[i].field, choiceAnswer)) {
										continue
									}
								}
							}
						}
					}
					if(answer == null) {
						continue
					}
				}
				
				if(missingRequired.length > 0 || expectedType.length > 0 || wrongChoiceCount.length > 0) {
					reject({missingRequired:missingRequired, expectedType:expectedType, wrongChoiceCount:wrongChoiceCount})
					return
				}

				resolve()
			}
		})
	})
}