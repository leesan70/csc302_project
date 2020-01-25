import express from 'express'
import util from '../util'
import fetch from 'node-fetch'
import fs from 'fs'
import FormData from 'form-data'
import path from 'path'
import parser from '../parser'
import elastic from '../elastic'


import SDCForm from '../models/SDCForm'
import SDCFormResponse from '../models/SDCFormResponse'
import SDCFormAnswer from '../models/SDCFormAnswer'
import SDCQueryableAnswer from '../models/SDCQueryableAnswer'
import SDCPersistentLink from '../models/SDCPersistentLink'

var forms = []
var files = fs.readdirSync(path.resolve('forms'))
forms = []
for(let i = 0; i < files.length; i++) {
	forms.push(files[i].replace('.xml', ''))
}

var formsGenerated = 0
var responsesGenerated = []

var answerBatch = []
var batchTotal = 0
var baseUrl = ""
var sendBatch = (batch) => {
	//console.log("Send batch! " + batch.length)
	return new Promise((resolve, reject) => {
		SDCFormAnswer.collection.insertMany(batch, (err, docs) => {
			batch = []
			if(err) {
				console.log("Batch failed")
				reject(err)
			}
			else {
				batchTotal += docs.ops.length
				//console.log("Batch send complete. Total: " + batchTotal)
				resolve()
			}
		});
	})
}
var batchAnswer = (answer) => {
	return new Promise((resolve, reject) => {
		answerBatch.push(answer)
		if(answerBatch.length >= 250) {
			var tempBatch = answerBatch
			answerBatch = []
			sendBatch(tempBatch)
			.then(() => {
				resolve()
			})
			.catch(reject)
		} else {
			resolve()
		}
	})
}

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
		referrer: 'no-referrer' // no-referrer, *client
	}	
}

function formFetchOptions() {
	return {
		mode: 'cors',
		cache: 'no-cache', 
		credentials: 'same-origin',
		redirect: 'follow',
		referrer: 'no-referrer'
	}	
}


function handleErrors(res) {
    if (!res.ok) throw Error(res.statusText);
    return res;
}

var clearForms = () => {
	return new Promise((resolve, reject) => {
		SDCForm.deleteMany({}, err => {
			if(err) reject()
			resolve()
		})
	})
}

var clearAnswers = () => {
	return new Promise((resolve, reject) => {
		SDCFormAnswer.deleteMany({}, (err) => {
			if(err) reject(err)
			SDCQueryableAnswer.deleteMany({}, (err) => {
				if(err) reject(err)
				resolve()
			})
		})
	})
}

var clearLinks = () => {
	return new Promise((resolve, reject) => {
		SDCPersistentLink.deleteMany({}, (err) => {
			if(err) reject()
			resolve()
		})
	})
}		

var clearResponses = () => {
	return new Promise((resolve, reject) => {
		SDCFormResponse.deleteMany({}, (err) => {
			if(err) reject()
			resolve()
		})
	})
}	

function randomTimestamp(daysOffset, hoursOffset) {
	var format = ''
	var language = 'en-US'
    var dt = new Date();
    dt.setDate(dt.getDate() + daysOffset)
    dt.setHours(dt.getHours() + hoursOffset)
    var model = "YYYYMMDD-HHmmSS-mss";
    if (format !== '') {
        model = format;
    }
    model = model.replace("YYYY", dt.getFullYear());
    model = model.replace("MM", (dt.getMonth() + 1).toLocaleString(language, { minimumIntegerDigits: 2, useGrouping: false }));
    model = model.replace("DD", dt.getDate().toLocaleString(language, { minimumIntegerDigits: 2, useGrouping: false }));
    model = model.replace("HH", dt.getHours().toLocaleString(language, { minimumIntegerDigits: 2, useGrouping: false }));
    model = model.replace("mm", dt.getMinutes().toLocaleString(language, { minimumIntegerDigits: 2, useGrouping: false }));
    model = model.replace("SS", dt.getSeconds().toLocaleString(language, { minimumIntegerDigits: 2, useGrouping: false }));
    model = model.replace("mss", dt.getMilliseconds().toLocaleString(language, { minimumIntegerDigits: 3, useGrouping: false }));
    return model;
}

var addForms = () => {
	return new Promise((resolve, reject) => {
		var i = -1
		var addForm = () => {
			i += 1

			if(i >= forms.length) {
				resolve()
				return
			}

			var formID = forms[i]
			var relativePath = './forms/' + formID + '.xml';
			parser.addFormAtPath(formID, relativePath)
			.then(() => {
				formsGenerated++
				addForm()
			})
			.catch(reject)
		}
		addForm()
	})

}

var randomAnswers = (form, response) => {
	return new Promise((resolve, reject) => {
		var answerMap = {}
		for(let i = 0; i < form.nodes.length; i++) {
			var node = form.nodes[i]
			answerMap[node.referenceID] = node;
		}
		var dependencyMap = {}
		var rootAnswers = util.copyObj(answerMap)
		// Collect root answers
		var rootAnswers = util.copyObj(answerMap)
		for(let i = 0; i < form.nodes.length; i++) {
			var node = form.nodes[i]
			for(let j = 0; j < node.dependencies; j++) {
				var dep = node.dependencies[j]
				dependencyMap[dep.referenceID] = node.referenceID
				if(dep.referenceID in rootAnswers)
					delete rootAnswers[dep.referenceID]
			}
		}

		var getFieldAnswer = (node, field, choice = null) => {

			var fieldAnswer = {}
			if(field.valueType == 'string') {
				var answer = ""
				var possible = ['testA', 'testB', 'testC']
				if(possible.length > 0) {
					var randomAnswer = possible[Math.floor(Math.random()*possible.length)]
					fieldAnswer = {stringValue:randomAnswer}
				} else {
					console.log("ERROR! Missing possible string answers in responseMap")
				}
			} else if(field.valueType == 'decimal' || field.valueType == 'number') {
				var min = 0.0
				var max = 10.0
				var answer = 0
				if(field.valueType == 'decimal') {
					answer = Math.floor(10.0*min + Math.random()*max)/10.0
				} else {
					answer = min + Math.round(Math.random()*max)
				}
				fieldAnswer = {numberValue:answer}
			}
			return fieldAnswer
		}

		var getChoiceAnswer = (node) => {
			var choose = 0
			if(node.maxSelections = 1) {
				choose = 1
			} else if(node.maxSelections == 0) {
				choose = Math.floor(Math.random()*node.choices.length)
			} else {
				choose = Math.floor(Math.random()*node.maxSelections)
			}

			// Get possible choices
			var choices = []
			for(let i = 0; i < node.choices.length; i++) {
				choices.push(node.choices[i])
			}

			var answerChoices = []
			for(let i = 0; i < choose; i++) {
				var index = Math.floor(Math.random()*choices.length)
				var choice = choices[index]
				choices.splice(index, 1)

				// Send choice
				var answer = {choiceID: choice.referenceID}
				if(choice.field != null) {
					var fieldAnswer = getFieldAnswer(node, choice.field, choice)
					if(fieldAnswer != null)
						answer.field = fieldAnswer
				}
				answerChoices.push(answer)
			}
			return answerChoices
		}

		var sendAnswer = (node, choiceID) => {
			return new Promise((resolve2, reject2) => {
				var answer = {responseID: response._id.toString(), nodeID: key}
				var node = rootAnswers[key]

				var actuallySend = () => {
					return new Promise((resolve3, reject3) => {
						batchAnswer(answer)
						.then(resolve3)
					})
				}

				if(node.choices != null && node.choices.length > 0) {
					answer.choices = getChoiceAnswer(node)

					actuallySend()
					.then(() => {
						// Compare choices to dependencies and propogage
						var propogate = []
						for(let i = 0; node.dependencies != null && i < node.dependencies.length; i++) {
							for(let j = 0; j < answer.choices.length; j++) {
								if(node.dependencies[i].choiceID == null || node.dependencies[i].choiceID.localeCompare(answer.choices[j].referenceID) == 0) {
									propogate.push(node.dependencies[i].nodeID)
								}
							}
						}
						var toPropogate = propogate.length
						if(toPropogate > 0) {
							for(let i = 0; i < propogate.length; i++) {
								sendAnswer(answerMap[node.dependencies[i].nodeID])
								.then(() => {
									toPropogate--
									if(toPropogate == 0) {
										resolve2()
									}
								})
								.catch(reject2)
							}
						} else {
							resolve2()
						}
					})
					.catch(reject2)
				} else if(node.field != null) {
					var fieldAnswer = getFieldAnswer(node, node.field)
					if(fieldAnswer == null)
						resolve2()
					else {
						answer.field = fieldAnswer
						actuallySend()
						.then(resolve2)
						.catch(reject2)
					}
				} else {
					resolve2()
				}
			})
		}

		// Fire off answers
		var rootList = Object.keys(rootAnswers)
		if(rootList != null && rootList.length > 0) {
			var totalAnswers = rootList.length
			for(var key in rootAnswers) {
				sendAnswer(rootAnswers[key])
				.then(() =>  {
					totalAnswers--;
					if(totalAnswers == 0) {
						resolve()
					}
				})
				.catch(reject)
			}
		} else {
			resolve()
		}
	})
}

var randomResponse = (diagnosticProcedureID, withAnswers) => {
	return new Promise((resolve, reject) => {
		// Get the form
		SDCForm.findOne({diagnosticProcedureID:diagnosticProcedureID}, (err, form) => {
			if(err) {
				reject(err)
				return
			}
			if(!form) {
				reject('no form')
				return
			}

			// Create a response
			var options = fetchOptions()
			options.method = 'POST'
			options.body = JSON.stringify({diagnosticProcedureID:diagnosticProcedureID, patientID: Math.floor(Math.random()*100), formFillerID:0})
			var path = baseUrl + '/api/response/'///'http://localhost:3001/api/response/'
			fetch(path, options)
			.then(handleErrors)
			.then(res =>  {
				return res.json()
			})
			.then((resp) => {
				SDCFormResponse.findOne({_id:resp._id}, (err, response) => {
					if(err) {
						reject(err)
						return
					}
					if(!response) {
						reject('no response')
						return
					}

					// Randomize timestamp
					var daysOffset = -Math.floor(Math.random()*30)
					var hoursOffset = -Math.floor(Math.random()*24)
					var randomCreate = randomTimestamp(daysOffset, hoursOffset)
					var randomUpdate = randomTimestamp(Math.floor(daysOffset*Math.random()), hoursOffset)
					response.createdAt = randomCreate
					response.updatedAt = randomUpdate
					response.save(err => {
						if(err) {
							reject(err)
							return
						}

						responsesGenerated.push(response._id)

						// TODO: Provide a random number of answers
						if(withAnswers) {
							randomAnswers(form, response)
							.then(resolve)
							.catch(reject)
						}
						else
							resolve()
					})
				})
			})
			.catch(reject)	
		})
	})
}

var generateResponsesWithAnswers = (whatForms, withAnswers = 0, min = 3, max = 5, ) => {
	return new Promise((resolve, reject) => {
		if(min == 0 && max == 0) {
			resolve()
			return
		}
		var i = 0
		//console.log(`Generating between ${min} and ${max} responses per form`)
		var addResponse = () => {
			//console.log(`Responses for form ${i}`)
			if(i >= whatForms.length) {
				resolve()
				return
			}

			// Add a random number of responses for each form
			var responses = []
			var count = 1
			if(max == min)
				count = min
			else if(max > min && min > 1)
				count = min + Math.floor(Math.random()*(max-min))
			var complete = 0

			var generated = () => {
				complete += 1
				if(count == complete) {
					i++
					addResponse()
				}
			}

			if(count <= 0) {
				i++
				addResponse()
				return
			}

			for(var j = 0; j < count; j++) {
				randomResponse(whatForms[i], withAnswers)
				.then(generated)
				.catch(reject)
			}

		}
		addResponse()
	})
}

export default (passport) => {
	var router = express.Router()

	/**
	 * Generate dummy data
	 */
	router.get('/', (req, res) => {
	  	baseUrl = req ? `${req.protocol}://${req.get('Host')}` : '';
		formsGenerated = 0
		responsesGenerated = []
		answerBatch = []
		batchTotal = 0

		// Clear existing data
		// First step has this wacky wrapping
		new Promise((resolve, reject) => {
			if(req.query.clear == 1) {
				clearForms()
				.then(resolve)
				.catch(reject)
			} else {
				resolve()
			}
		})
		.then(() => {
			return new Promise((resolve, reject) => {
				if(req.query.clear != 0) { 
					elastic.deleteIndex() 
					.then(elastic.initIndex)
					.then(resolve)
					.catch(reject)
				} else {
					resolve()
				}
			})
		})
		.then(() => {
			if(req.query.clear != 0) {
				return clearAnswers()
			} else {
				return
			}
		})	
		.then(() => {
			if(req.query.clear != 0) {
				return clearLinks()
			} else {
				return
			}
		})
		.then(() => {
			if(req.query.clear != 0) {
				return clearResponses()
			} else {
				return
			}
		})
		.then(() => {
			if(req.query.forms == 1)
				return addForms()
			else
				return
		})
		.then(() => {
			// How many responses?
			var min = 0
			var max = 0
			/*if(req.query.min != null) {
				min = parseInt(req.query.min)
				max = parseInt(req.query.min)
			}
			if(req.query.max != null & parseInt(req.query.max) > min) {
				max = parseInt(req.query.max)
			}	*/
			if(req.query.responses != null && req.query.responses > 0) {
				min = req.query.responses
				max = req.query.responses
			}
			var specificForms = forms
			if(req.query.form != null)
				specificForms = [req.query.form]

			return generateResponsesWithAnswers(specificForms, req.query.answers == 1, min, max)
		})
		.then(() => {
			// Insert our batched answers to the DB
			if(answerBatch.length > 0) {
				return sendBatch(answerBatch)
			}
			return
		})
		.then(() => {
			// Submit all the forms
			var promises = []
			for(let i = 0; i < responsesGenerated.length; i++) {

				// Create a response
				var options = fetchOptions()
				options.method = 'PUT'
				options.body = JSON.stringify({_id:responsesGenerated[i]})
				var path = baseUrl + '/api/response/'
				promises.push(fetch(path, options))
			}

			return Promise.all(promises)
		})
		.then(() => {
			console.log(`Dummy data successfully generated. Generated ${formsGenerated} forms, ${responsesGenerated.length} responses, and ${batchTotal} answers`)
			res.send({message: `Dummy data successfully generated. Generated ${formsGenerated} forms, ${responsesGenerated.length} responses, and ${batchTotal} answers`})
		})
		.catch(err => {
			util.errorMessage(res, err, "generating dummy data")
		})
	})

	router.get('/reset', (req, res) => {
		res.redirect('/api/dummy?clear=1&forms=1&form=Adrenal.Bx.Res.129_3.003.001.REL_sdcFDF&responses=10&answers=1')
	})
	
	router.get('/clear', (req, res) => {
		clearForms()
		.then(clearAnswers)
		.then(() => {
			return new Promise((resolve, reject) => {
				if(req.query.clear != 0) { 
					elastic.deleteIndex() 
					.then(elastic.initIndex)
					.then(resolve)
					.catch(reject)
				} else {
					resolve()
				}
			})
		})
		.then(clearLinks)
		.then(clearResponses)
		.then(() => {
			res.sendStatus(200)
		})
		.catch(err => {
			res.sendStatus(500)
		})

	})

	return router
}