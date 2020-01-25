
import SDCForm from '../models/SDCForm'
import SDCFormResponse from '../models/SDCFormResponse'
import SDCFormAnswer from '../models/SDCFormAnswer'
import SDCPersistentLink from '../models/SDCPersistentLink'
import SDCQueryableAnswer from '../models/SDCPersistentLink'
import fs from 'fs'

export const TestHelper = (chai, app) => {
	var clearForms = () => {
		return new Promise((resolve, reject) => {
			SDCForm.deleteMany({}, (err) => {
				if(err) reject()
				resolve()
			})
		})
	}

	var postForm = (formID, XMLFileUploadFieldID) => {
		var formName = formID + '.xml';
		var relativePath = './forms/' + formName;

		return chai.request(app)
				.post('/api/form/')
				.field('diagnosticProcedureID', formID)
				.attach(XMLFileUploadFieldID, fs.readFileSync(relativePath), formName);
	}


	var clearResponses = () => {
		return new Promise((resolve, reject) => {
			SDCFormResponse.deleteMany({}, (err) => {
				if(err) reject()
				resolve()
			})
		})
	}

	var postNewResponse = (diagnosticProcedureID, patientID, formFillerID) => {
		var data = {
			response: {
				diagnosticProcedureID:diagnosticProcedureID,
				patientID: patientID,
				formFillerID: formFillerID
			}
		}

		return new Promise((resolve, reject) => {
			// Get the most recent form version
			chai.request(app)
			.get('/api/form/' + diagnosticProcedureID)
			.end((err, res) => {
				if(err)
					reject(err)


				data.response.formVersion = res.body.form.version;
				chai.request(app)
					.post('/api/response')
					.set('content-type', 'application/json')
					.send(data)
					.end((err, res) => {
						if(err)reject(err)
						resolve(res)
					})	
			})
		})
	}

	var clearAnswers = () => {
		return new Promise((resolve, reject) => {
			SDCFormAnswer.deleteMany({}, (err) => {
				if(err) reject()

				SDCQueryableAnswer.deleteMany({}, (err) => {
					if(err) reject()
					resolve()
				})
			})
		})
	}

	var postAnswer = (answer, options = {}) => {
		var path = '/api/response/answer'
		var body = {answer:answer}
		for(var key in options) {
			body[key] = options[key]
		}
		return chai.request(app)
			.post('/api/response/answer')
			.set('content-type', 'application/json')
			.send(body)
	}	

	var clearPersistentLink = () => {
		return new Promise((resolve, reject) => {
			SDCPersistentLink.deleteMany({}, (err) => {
				if(err) reject()
				resolve()
			})
		})
	}


	return {
		clearForms,
		postForm,
		clearResponses,
		postNewResponse,
		clearAnswers,
		postAnswer,
		clearPersistentLink
	}
}