import express from 'express'
import util from '../util'

import SDCForm from '../models/SDCForm'
import SDCFormResponse from '../models/SDCFormResponse'
import SDCFormAnswer from '../models/SDCFormAnswer'
import SDCPersistentLink from '../models/SDCPersistentLink'
import SDCQueryableAnswer from '../models/SDCQueryableAnswer'
import elasticSearch from '../elastic'


export default (passport) => {
	var router = express.Router()

	/**
	 * Query responses
	 */
	 router.get('/', (req, res) => {
	 	elasticSearch.hasClient()
	 	.then(clientExists => {
	 		if(clientExists && !req.query.fallback) {
	 			queryElastic(req, res)
		 	} else {
		 		queryMongo(req, res)
		 	}
	 	})
	})
	function queryElastic(req, res) {
	 	elasticSearch.search(req.query)
	 	.then(x => {
	 		res.send(x)
	 	})
	 	.catch(err => {
	 		util.errorMessage(res, err, "query failed")
	 	})	
	}
	function queryMongo(req, res) {
		var diagnosticProcedureID = req.query.diagnosticProcedureID;
	 	var version = req.query.verion || 0
	 	var nodeID = req.query.nodeID;
	 	var operator = req.query.operator

	 	// Quantifier is the value for the operator
	 	var numberValue = null
	 	if(req.query.numberValue != null)
	 		numberValue = parseFloat(req.query.numberValue)

	 	var stringValue = req.query.stringValue

	 	// How to sort them
	 	var sort = req.query.sort

	 	var body = {
	 		query: {
		 		diagnosticProcedureID:diagnosticProcedureID,
		 		nodeID:nodeID
	 		},
	 		options: {
	 		}
	 	}

	 	if(req.query.choiceID)
	 		body.query.choiceID = req.query.choiceID

	 	if(req.query.limit != null)
	 		body.options.limit = parseInt(req.query.limit)

	 	if(req.query.patientID != null)
	 		body.query.patientID = parseInt(req.query.patientID)

	 	if(operator != null) {
	 		switch(operator) {
	 			case "EQUAL":
		 			if(numberValue != null)
		 				body.query.numberValue = numberValue
		 			else if(stringValue != null)
		 				body.query.stringValue = numberValue
	 			break
	 			case "GREATER_THAN":
		 			if(numberValue != null)
		 				body.query.numberValue = {'$gt': numberValue}
	 			break
	 			case "LESS_THAN":
		 			if(numberValue != null)
		 				body.query.numberValue = {'$lt': numberValue}
	 			break
	 		}
	 	}

	 	if(sort != null) {
	 		if(sort == 'ASC') {
		 		if(numberValue != null)
		 			body.options.sort = {'numberValue':1}
		 		else if(stringValue != null)
		 			body.options.sort = {'stringValue':1}
		 	} else if (sort == 'DESC') {
		 		if(numberValue != null)
		 			body.options.sort = {'numberValue':-1}
		 		else if(stringValue != null)
		 			body.options.sort = {'stringValue':-1}
		 	}
	 	}

	 	// Add stuff to query
	 	SDCQueryableAnswer.find(body.query, {}, body.options).exec((err, answers) => {
	 		if(err) {
	 			util.errorMessage(res, err, "finding answers")
	 			return
	 		}
	 		res.send({answer:{hits:answers}, type:"MONGO"})
	 	})
	}

	// Perform a raw search with PUT
	router.put('/', (req, res) => {
		elasticSearch.hasClient()
	 	.then(clientExists => {
	 		if(clientExists && !req.query.fallback) {
	 			queryElasticRaw(req, res)
	 		} else {
	 			util.errorMessage(res, "mongo raw unsupported", 400)
	 			//queryMongoRaw(req, res)
	 		}
		 })
	}) 
	function queryElasticRaw(req, res) {
		console.log(req.body)
	 	elasticSearch.searchRaw(req.body)
	 	.then(x => {
	 		res.send(x)
	 	})
	 	.catch(err => {
	 		util.errorMessage(res, err, "query failed")
	 	})
	}
	function queryMongoRaw(req, res) {
		var body = req.body;
	 	// Add stuff to query
	 	SDCQueryableAnswer.find(body.query, body.options).exec((err, answers) => {
	 		if(err) {
	 			util.errorMessage(res, err, "finding answers")
	 			return
	 		}
	 		res.send({answer:{hits:answers}, type:"MONGO"})
	 	})
	}

	// Debug helper endpoints
	router.get('/clear', (req, res) => {
		elasticSearch.deleteIndex()
		.then(elasticSearch.initIndex)
		.then(res.sendStatus(200))
		.catch(err => {
			util.errorMessage(res, err, "clearing elasticSearch")
		})
	})

	router.get('/count', (req, res) => {
		elasticSearch.getCount((err,resp,status) => {
			if(err) {
				util.errorMessage(res, err)
			} else {
				res.send({count:resp.count})
			}
		})
	})

	return router
}