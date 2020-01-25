import fs from 'fs'
import path from 'path';
import { Client } from 'elasticsearch'

import SDCForm from './models/SDCForm'
import SDCFormResponse from './models/SDCFormResponse'
import SDCFormAnswer from './models/SDCFormAnswer'
import SDCQueryableAnswer from './models/SDCQueryableAnswer'
import logger from './logger'
import request from 'request'

var client       = new Client({ hosts: [`${process.env.ES_HOST}`] });
const index_name = 'answer_index'
var clientExists = 0


/** 
 * Check if there is an elastic instance running
 */
function hasClient() {
	return new Promise((resolve, reject) => {
		if(clientExists!=0) {
			resolve(clientExists==1?true:false)
			return
		}
		client.ping({
		  requestTimeout: 10000,
		}, (error) =>{
			if (error) { 
				console.log("No elastic search client, the error message is okay")
				clientExists = -1
				resolve(false)
			} else {
				clientExists = 1
				resolve(true)
			}
		});
	})
}
hasClient()


/** 
 * Delete our elastic search index
 */
function deleteIndex() {
	return hasClient()
	.then(clientAlive => {
		if(!clientAlive)
			return

		return client.indices.delete({
			index:index_name
		}, (err, resp, status) => {
			if(err) {
				if(err.message.indexOf("index_not_found_exception") == -1)
					logger.error(err)
			}
		})
	})
}


/** 
 * Initialize our elastic search index
 */
function initIndex() {
	return hasClient()
	.then(clientAlive => {
		if(!clientAlive)
			return

		return client.indices.create({
			index:index_name
		}, (err, resp, status) => {
			if(err) {
				if(err.message.indexOf("resource_already_exists_exception") == -1) 
					logger.error(err)
			}
		});
	})
}

/** 
 * Index a list of SDCQueryableAnswers
 * @param answers [SDCQueryableAnswer]
 */
function indexAnswers(answers) {
	return hasClient()
	.then(clientAlive => {
		if(!clientAlive) {
			return
		}
		
		var body = []
		for(let i = 0; i < answers.length; i++) {
			body.push({index: {_index: index_name}})
			var ans = answers[i].toObject()
			if("_id" in ans)
				delete ans["_id"]
			body.push(ans)
		}
		return new Promise((resolve, reject) => {

			client.bulk({refresh:true, body},
				(err, resp, status) => {
					if(err) {
						reject(err)
					} else {
						resolve()
					}
				})
		})
	})
}

/** 
 * Perform a search query 
 * @param options, the search options
 */
function search(options = {}) {
	var matchOn = ["diagnosticProcedureID", "nodeID", "patientID", "choiceID", "formTitle", "choiceTitle"]
	var searchQuery = Object.keys(options).filter(x => matchOn.includes(x)).map(function(index){
		return {
			"match": { [index] : options[index] }
	    }
	})

	var stringValue = options.stringValue
	var numberValue = options.numberValue
	var operator = options.operator
	var filterQuery = []
	var aggregateQuery = null 
	if(operator != null) {
		switch(operator) {
			case 'EQUAL':
				if(numberValue != null)
					searchQuery.push({"match": {"numberValue": parseFloat(numberValue) }})
				else if(stringValue != null)
					searchQuery.push({"match": {"stringValue": stringValue }})
			break
			case 'GREATER_THAN':
				if(numberValue != null)
					filterQuery.push({"range": {"numberValue": {"gt":parseFloat(numberValue)}}})
			break
			case 'LESS_THAN':
				if(numberValue != null)
					filterQuery.push({"range": {"numberValue": {"lt":parseFloat(numberValue)}}})
			break
			case 'MIN':
			aggregateQuery = {
				"Minimum": {
					"min" : {
						"field": "numberValue"
					}
				}
			}
			searchQuery.push({"exists": { "field": "numberValue" }})
			break
			case 'MAX':
			aggregateQuery = {
				"Maximum": {
					"max" : {
						"field": "numberValue"
					}
				}
			}
			searchQuery.push({"exists": { "field": "numberValue" }})
			break
			case 'AVG':
			aggregateQuery = {
				"Average": {
					"avg" : {
						"field": "numberValue"
					}
				}
			}
			searchQuery.push({"exists": { "field": "numberValue" }})
			break
			case 'COUNT':
			var fieldToCount = "choiceTitle"
			if(options.fieldToCount != null)
				fieldToCount = options.fieldToCount
			aggregateQuery = {
				"Count": {
					"terms": { 
						"field": `${fieldToCount}.keyword`
					}
				}
			}
			break
		}
	}

	var query = {
		"bool": {
			"must": searchQuery,
		},
	}

	if(filterQuery.length > 0)
		query.bool.filter = filterQuery

	var body = {
		'query':query,
		'_source': [
		'diagnosticProcedureID',
		'nodeID',
		'choiceID', 
		'choiceTitle', 
		'formTitle',
		'stringValue', 
		'numberValue', 
		'patientID',
		'formFillerID',
		'responseID'
		]
	}

	if(aggregateQuery != null) {
		body.aggs = aggregateQuery	
		//body.size = 0
		if(operator != "COUNT") {
			if(operator == "MIN")
				options.sort = 'ASC'
			else
				options.sort = 'DESC'
		}
	}

	if(options.sort != null && operator != "COUNT") {
		if(options.sort == 'ASC') {
			body.sort = [{numberValue:"asc"}]
		} else if(options.sort == 'DESC') {
			body.sort = [{numberValue:"desc"}]
		}
	}	

	if(options.limit != null) {
		body.from = 0
		body.size = options.limit
	}

	return new Promise((resolve, reject) => {
		client.search({
			'index': index_name,
			'pretty': true,
			'body': body
		})
		.then(x => {
			resolve(transformElasticResult(x, body))
		})
		.catch(err => {
			console.log("ERRORR!!!")
			console.log(err)
			reject(err)
		})
	})
}

/** 
 * Search the elastic search instance with a raw query
 * @param body, the elastic search query
 */
function searchRaw(body) {
	return new Promise((resolve, reject) => {
		client.search({
			'index': index_name,
			'pretty': true,
			'body':body
		})
		.then(x => {
			resolve(transformElasticResult(x, body))
		})
		.catch(err => {
			reject(err)
		})
	})
}

/** 
 * Transform elastic search results into some slightly more readable on the frontend
 * @param x, the results
 * @param body, original query
 */
function transformElasticResult(x, body) {
	var results = {query:body, type:"ELASTIC", answer: {}}
	if("hits" in x && "hits" in x.hits) {
		var hits = []
		for(let i = 0; i < x.hits.hits.length; i++) {
			hits.push(x.hits.hits[i]._source)
		}
		results.answer.hits = hits
	}
	if("aggregations" in x) {
		results.answer.aggs = x.aggregations
	}
	return results
}

/** 
 * Process an SDCResponse and insert results into elastic search
 * @param response
 * @return Promise
 */
 function addResponseToElasticSearch(response) {
 	return new Promise((resolve, reject) => {
		SDCForm.findOne({diagnosticProcedureID: response.diagnosticProcedureID.toString(), version:response.formVersion}, (err, form) => {
			if(err) {
				reject(err)
			} else if(!form) {
				reject("no form")
			} else {
				// Have all the info we need to build the elastic search objects
				var nodeMap = {}
				for(let i = 0; i < form.nodes.length; i++) {
					nodeMap[form.nodes[i].referenceID] = form.nodes[i]
				}
				var queryAnswers = []
				for(let i = 0; i < response.answers.length; i++) {
					var answer = response.answers[i]
					var node = nodeMap[answer.nodeID]

					var getAnswer = () => {
						var qAnswer = new SDCQueryableAnswer();
						qAnswer.diagnosticProcedureID = form.diagnosticProcedureID
						qAnswer.formTitle = form.title
						qAnswer.formVersion = form.verion
						qAnswer.patientID = response.patientID
						qAnswer.formFillerID = response.formFillerID
						qAnswer.nodeTitle = node.title
						qAnswer.nodeID = node.referenceID
						qAnswer.responseID  = answer.responseID
						return qAnswer
					}
					if(answer.choices != null) {
						var choiceTitles = {}
						for(let j = 0; j < node.choices.length; j++) {
							choiceTitles[node.choices[j].referenceID] = node.choices[j].title
						}
						for(let j = 0; j < answer.choices.length; j++) {
							var choice = answer.choices[j]
							// Get the choice from the form
							var qAnswer = getAnswer()
							qAnswer.choiceID = choice.choiceID
							qAnswer.choiceTitle = choiceTitles[choice.choiceID]
							if(choice.field != null) {
								if(choice.field.stringValue)
									qAnswer.stringValue = choice.field.stringValue
								if(choice.field.numberValue) 
									qAnswer.numberValue = choice.field.numberValue
							}
							queryAnswers.push(qAnswer)
						}
					}
					if(answer.field != null) {
						var qAnswer = getAnswer()
						if(answer.field.stringValue)
							qAnswer.stringValue = answer.field.stringValue
						if(answer.field.numberValue) 
							qAnswer.numberValue = answer.field.numberValue
						//Push query answers to Elastic search
						queryAnswers.push(qAnswer)
					}
				}
				if(queryAnswers.length == 0) {
					resolve()
				} else {
					indexAnswers(queryAnswers)
					.then(() => {
						warehouseAnswers(queryAnswers)
						.then(resolve)
						.catch(reject)
					})
					.catch(reject)
				}
			}
	 	})
 	})
}

/** 
 * Backup is to insert answers into our mongoDB warehouse
 */
function warehouseAnswers(qAnswers) {
	return new Promise((resolve, reject) => {
		SDCQueryableAnswer.collection.insertMany(qAnswers, (err, docs) => {
			if(err) {
				reject(err)
			} else {
				resolve()
			}
		});
	})
}

export default {
	deleteIndex,
	initIndex,
	search,
	searchRaw,
	addResponseToElasticSearch,
	getCount: (x) => {client.count({index: index_name},x)},
	getClient: () => {return client},
	hasClient
}

