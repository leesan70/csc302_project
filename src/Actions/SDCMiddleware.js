import { SDCFormIterator } from 'Actions'
import { SDCResponseBuilder } from 'Actions'

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

function postOptions() {
	var options = fetchOptions()
	options.method = 'POST'
	return options
}

function handleErrors(res) {
    if (!res.ok) throw Error(res.statusText);
    return res;
}

/** 
 * Retrieves a list of the available forms by their titles
 * @return Promise
 */
function getFormsList() {
	return new Promise((resolve, reject) => {
		fetch('/api/form')
		.then(handleErrors)
		.then(data => {
			return data.json();
		})
		.then(resolve)
		.catch(reject)
	})
}


/** 
 * Get a specific form
 * @param dpID String
 * @return Promise
 */
function getForm(dpID, fullData=false) {
	console.log("GET FORM")
	return new Promise((resolve, reject) => {
		var path = '/api/form/'+dpID
		if(fullData)
			path += '?fullData=true'
		fetch(path)
		.then(handleErrors)
		.then(res => {
			return res.json()
		})
		.then(resolve)
		.catch(reject)
	})
}

/**
 * Get an iterator for the specified form
 * @param diagnosticProcedureID String
 * @param fullData Boolean, for testing, sets whether the full original XML and json will be sent
 * @return Promise
 */
function getFormIterator(dpID, fullData=false) {
	console.log("GET ITERATOR")
	return new Promise((resolve, reject) => {
		getForm(dpID, fullData)
		.then(data => {
			SDCFormIterator.createFromData(data)
			.then(iterator => {
				data.iterator = iterator
				resolve(data)
			})
			.catch(reject)
		})
		.catch(reject)
	})
}

/**
 * Add a new form to the database from an XML form
 * @param xmlData 
 * @return Promise
 */
function addNewForm(diagnosticProcedureID, xmlData) {
	// TODO: this is probably the wrong interface for uploading a file
	return new Promise((resolve, reject) => {
		var options = postOptions()
		options.body = JSON.stringify({diagnosticProcedureID:diagnosticProcedureID, xmlData:xmlData})
		fetch('/api/form', options)
		.then(handleErrors)
		.then(resolve)
		.catch(reject)
	})
}

// Keep track of the current response to the form
var currentResponse = null
/** 
 * Start a new form response with an SDCResponseBuilder
 * @param String diagnosticProcedureID
 * @return SDCResponseBuilder
 */
function startResponse(diagnosticProcedureID, formFillerID = 0, patientID = 0) {
	return new Promise((resolve, reject) => {
		var options = fetchOptions()
		options.method = 'POST'
		options.body = JSON.stringify({diagnosticProcedureID:diagnosticProcedureID, patientID:patientID, formFillerID:formFillerID})
		fetch('/api/response', options)
		.then(handleErrors)
		.then(res => {
			return res.json();
		}).then(response => {
			currentResponse = SDCResponseBuilder(response)
			resolve(response)
		})	
		.catch(reject)
	})
}

function getResponses(options = {diagnosticProcedureID:null, formFillerID:null, patientID:null}) {
	return new Promise((resolve, reject) => {
		var path = '/api/response/search?'
		if(options.diagnosticProcedureID != null)
			path += 'diagnosticProcedureID='+options.diagnosticProcedureID
		if(options.formFillerID != null)
			path += '&formFillerID='+options.formFillerID
		if(options.patientID != null)
			path += '&patientID='+options.patientID
		fetch(path)
		.then(handleErrors)
		.then(res => {return res.json()})
		.then(responses => {
			resolve(responses)
		})
		.catch(e => {
			console.log("Error getting responses: " + e)
			resolve([])
		})
	})
}
function editResponse(responseID) {
	return new Promise((resolve, reject) => {
		fetch('/api/response/'+responseID)
		.then(handleErrors)
		.then(res => {return res.json()})
		.then(response => {
			if(response == null)
				reject("response not found")
			currentResponse = SDCResponseBuilder(response)
			resolve(response)
		})
		.catch(reject)
	})
}

export const SDCMiddleware =  {
	getFormsList,
	getForm,
	getFormIterator,
	addNewForm,
	startResponse,
	getResponses,
	editResponse,
	response: () => {
		return currentResponse
	}
}