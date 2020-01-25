/* global __dirname */

// routes/User
import express from 'express'
import util from '../util.js'
import parser from '../parser.js'
import fs from 'fs'
import path from 'path'
import SDCForm from '../models/SDCForm'
import SDCFormResponse from '../models/SDCFormResponse'
import SDCFormAnswer from '../models/SDCFormAnswer'
import SDCPersistentLink from '../models/SDCPersistentLink'
import db from '../db'

export default (passport) => {
	var router = express.Router();

	/**
	 * Get a list of all SDCForms available for retrieval
	 */
	router.get('/', (req, res) => {
		SDCForm.find({active:true}, {active:0, sections:0, nodes:0}).sort('-version').exec((err, forms) => {
			if(err)
				util.errorMessage(res, err, "getting forms")
			else {
				var formMap = {}
				// Theres probably a mongo way to do this but dont have time to figure it out
				for(let i = 0; i < forms.length; i++) {
					var form = forms[i]
					var dp = forms[i].diagnosticProcedureID
					if(!(dp in formMap) || form.version > formMap[dp].version)
						formMap[dp] = form
				}
				var formList = []
				for(var key in formMap) {
					formList.push(formMap[key])
				}
				res.send(formList)
			}
		})
	})

	/**
	 * Retreive a specific SDCForm
	 */
	router.get('/:diagnosticProcedureID', (req, res) => {
		SDCForm.findOne({diagnosticProcedureID: req.params.diagnosticProcedureID, active:true}).sort('-version').exec((err, form) => {
			if(err)
				util.errorMessage(res, err, 'finding form')
			else if(!form) {
				if(!req.query.fullData && !req.query.force)
					res.sendStatus(404);
				else {
					// Just parse it if we have it
					var formPath = path.format({
						"root" : "/",
						"dir" : path.resolve(process.env.INIT_CWD, "forms"),
						"name" : req.params.diagnosticProcedureID,
						"ext" : ".xml"
					})
					parser.addFormAtPath(req.params.diagnosticProcedureID, formPath)
					.then(data => {
						if(req.query.fullData)
							res.send(data);
						else
							res.send(data.form)	
					})
					.catch(err => {
						util.errorMessage(res, err, "parsing xml")
					})
				}
			} else {
				res.send({form:form})

			}
		})
	})

	/**
	 * Delete an SDCForm
	 */
	router.delete('/:diagnosticProcedureID', (req, res) => {
		// TODO use "population" to aggregate SDCForm responses that correspond to old SDCForms, if a form has no responses actually delete it
		SDCForm.updateMany({diagnosticProcedureID: req.params.diagnosticProcedureID}, {active:false}, err => {
			if(err) {
				util.errorMessage(res, err, "deleting form")
			} else {
				res.sendStatus(200)
			}
		})
	})

	/**
	 * Submit an XML Form 
	 * Upload it to the server then convert it to an SDCForm
	 */
	router.post('/', (req, res) => {
		var body = req.body;
		// Save data to path
		parseSubmittedXMLform(req, res).then(function(path) {
			parser.addFormAtPath(body.diagnosticProcedureID, path, true)
			.then(data => {
				res.sendStatus(200)
			})
		}).catch(err => {
			util.errorMessage(res, err, "parsing xml file")
		})	
	})

	/**
	 * Parses and uploads submitted XML form
	 */
	function parseSubmittedXMLform(req, res) {
		var file       = req.files.form;
		var origPath   = file.path;
		const DIR      = path.resolve(__dirname, 'uploads');
		var targetPath = path.resolve(DIR, file.originalFilename);
	    if (!fs.existsSync(DIR)) {
	      fs.mkdirSync(DIR);
	    }
	    return new Promise(function(resolve, reject) {
	        fs.rename(origPath, targetPath, function (err) {
	        if (err) reject(err);
	        resolve(targetPath);
	      });
	    })
	}


	return router
}
