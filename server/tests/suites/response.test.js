import SDCForm from '../../models/SDCForm'
import SDCFormResponse from '../../models/SDCFormResponse'
import SDCFormAnswer from '../../models/SDCFormAnswer'
import SDCPersistentLink from '../../models/SDCPersistentLink'
import { TestHelper } from '../TestHelper'
import { ResponseHelper } from '../ResponseHelper'

export default (chai, app, data) => {
	return () => {
		var should = chai.should()
		var expect = chai.expect;
		var helper = TestHelper(chai, app)

		before(done => {
			helper.clearForms()
			.then(() => {
				helper.postForm(data.testID, 'form')
				.end(() => {
					helper.postForm(data.testID2, 'form')
					.end(done)
				})
			})
		})

		describe('/POST a form response', () => {
			before(done => {
				helper.clearPersistentLink().then(done)
			})

			beforeEach(done => {
				helper.clearResponses().then(done)
			})

			it('it should POST and start a new response', done => {

				helper.postNewResponse(data.testID, data.patientID, data.formFillerID)
				.then(x => {
					x.should.have.status(200)
					SDCFormResponse.find({}, (err, resp) => {
						expect(resp).to.have.length(1)
						expect(resp[0].diagnosticProcedureID).to.be.eql(data.testID)
						expect(resp[0].patientID).to.be.eql(data.patientID)
						expect(resp[0].formFillerID).to.be.eql(data.formFillerID)
						done()
					})
				})
			})

			it('it should POST twice and have two unique responses for different ids', done => {
				helper.postNewResponse(data.testID, data.patientID, data.formFillerID)
				.then(x => {
					x.should.have.status(200)
					helper.postNewResponse(data.testID2, data.patientID2, data.formFillerID2)
					.then(x => {
						x.should.have.status(200);
						SDCFormResponse.find({}, (err, resp) => {
							expect(resp).to.have.length(2)
							if(resp[0].diagnosticProcedureID == data.testID)
								expect(resp[1].diagnosticProcedureID).to.be.eql(data.testID2)
							else
								expect(resp[1].diagnosticProcedureID).to.be.eql(data.testID)
							done()
						})
					})
				})
			})

			// it('it should POST twice and have two unique responses for the same ids', done => {
			// 	helper.postNewResponse(data.testID, data.patientID, data.formFillerID)
			// 	.then(x => {
			// 		x.should.have.status(200)
			// 		helper.postNewResponse(data.testID, data.patientID, data.formFillerID)
			// 		.then(x => {
			// 			x.should.have.status(200);
			// 			SDCFormResponse.find({}, (err, resp) => {
			// 				expect(resp).to.have.length(2)
			// 				done()
			// 			})
			// 		})
			// 	})
			// })	
		})

		describe('/GET a form response', () => {
			before(done => {
				helper.clearResponses()
				.then(() => {
					helper.postNewResponse(data.testID, data.patientID, data.formFillerID)
					.then(x => {
						x.should.have.status(200)
						helper.postNewResponse(data.testID2, data.patientID2, data.formFillerID)
						.then(x => {
							x.should.have.status(200);
							SDCFormResponse.find({}, (err, resp) => {
								expect(resp).to.have.length(2)
								done()
							})
						})
					})	
				})	
			})

			it('it should GET a specific form response from a search query with all terms, and not include answers', done => {
				chai.request(app)
				.get('/api/response/search?diagnosticProcedureID='+data.testID2+'&patientID='+data.patientID2+'&formFillerID='+data.formFillerID)
				.end((err, res) => {
					res.should.have.status(200)
					res.body.should.be.a('array')
					res.body.length.should.be.eql(1)
					// Searching doesn't return full response with answer
					should.equal(res.body.answers, undefined)
					done()
				})
			})

			it('it should GET all the form responses for a given formFiller', done => {
				chai.request(app)
				.get('/api/response/search?formFillerID='+data.formFillerID)
				.end((err, res) => {
					res.should.have.status(200)
					res.body.should.be.a('array')
					res.body.length.should.be.eql(2)
					done()
				})
			})	

			it('it should GET all the form responses for a given patientID', done => {
				chai.request(app)
				.get('/api/response/search?patientID='+data.patientID)
				.end((err, res) => {
					res.should.have.status(200)
					res.body.should.be.a('array')
					res.body.length.should.be.eql(1)
					done()
				})
			})		

			it('it should not GET responses when no patientID and formFillerID given', done => {
				chai.request(app)
				.get('/api/response/search?diagnosticProcedureID='+data.testID2)
				.end((err, res) => {
					res.should.have.status(404)
					done()
				})
			})		

			it('it should GET a specific form response by ID', done => {
				chai.request(app)
				.get('/api/response/search?diagnosticProcedureID='+data.testID+'&patientID='+data.patientID+'&formFillerID='+data.formFillerID)
				.end((err, res) => {
					chai.request(app)
					.get('/api/response/'+res.body[0]._id)
					.end((err, res) => {
						res.should.have.status(200)
						res.body.should.be.a('object')
						expect(res.body.diagnosticProcedureID).to.be.eql(data.testID)
						expect(res.body.patientID).to.be.eql(data.patientID)
						expect(res.body.formFillerID).to.be.eql(data.formFillerID)
						done()
					})

				})
			})	
		})

		describe('/PUT a form response', () => {	
			var responseA
			var responseB

			beforeEach(done => {
				helper.clearResponses()
				.then(helper.clearAnswers)
				.then(() => {
					helper.postNewResponse(data.testID, data.patientID, data.formFillerID)
					.then(x => {
						x.should.have.status(200)
						responseA = x.body
						helper.postNewResponse(data.testID2, data.patientID2, data.formFillerID)
						.then(x => {
							x.should.have.status(200);
							responseB = x.body
							SDCFormResponse.find({}, (err, resp) => {
								expect(resp).to.have.length(2)
								done()
							})
						})
					})	
				})	
			})

			it('it should PUT a form response (without validation) and retreive a persistent link', done => {
				chai.request(app)
					.put('/api/response')
					.set('content-type', 'application/json')
					.send({_id:responseA._id})
					.end((err, res) => {
						res.should.have.status(200)
						res.body.link.should.exist
						SDCPersistentLink.find({}, (err, links) => {
							links.should.be.a('array')
							links.length.should.be.eql(1)
							links[0].response._id.toString().should.be.eql(responseA._id)
							links[0].link.should.exist
							done()
						})
					})
			})

			it('it should PUT a form response twice without an edit and retreive the same persistent link', done => {
				chai.request(app)
					.put('/api/response')
					.set('content-type', 'application/json')
					.send({_id:responseA._id})
					.end((err, res) => {
						res.should.have.status(200)
						res.body.link.should.exist
						var link = res.body.link
						chai.request(app)
						.put('/api/response')
						.set('content-type', 'application/json')
						.send({_id:responseA._id})
						.end((err, res) => {	
							res.should.have.status(200)
							res.body.link.should.exist
							res.body.link.should.eql(link)
							done()
						})
					})

			})	

			it('it should PUT a form response twice with an edit and retreive a different persistent link', done => {
				chai.request(app)
					.put('/api/response')
					.set('content-type', 'application/json')
					.send({_id:responseA._id})
					.end((err, res) => {
						res.should.have.status(200)
						res.body.link.should.exist
						var link = res.body.link

						SDCForm.findOne({diagnosticProcedureID:responseA.diagnosticProcedureID, version:responseA.formVersion}, (err, form) => {

							// Answer a random question
							var node = ResponseHelper.getNodeWithField(form);
							node.should.exist
							var answer = ResponseHelper.getFieldAnswer(responseA._id, node, true)
							var nodeID = node.referenceID
							helper.postAnswer(answer)
							.end((err, res) => {
								chai.request(app)
								.put('/api/response')
								.set('content-type', 'application/json')
								.send({_id:responseA._id})
								.end((err, res) => {	
									res.should.have.status(200)
									res.body.link.should.exist
									res.body.link.should.not.eql(link)
									done()
								})
							})
						})
					})
			})	

			it('it should PUT a form response with no answers and fail validation', done => {
				SDCFormAnswer.find({responseID:responseA._id}, (err, ans) => {
					ans.length.should.eql(0)
					chai.request(app)
						.put('/api/response?validate=1')
						.set('content-type', 'application/json')
						.send({_id:responseA._id})
						.end((err, res) => {
							res.should.have.status(400)
							res.body.error.should.exist
							done()
						})
				})	
			})

			it('it should PUT an incomplete form response (with validation) and receive a validation error', done => {
				// Force the form to have a required field
				SDCForm.findOne({diagnosticProcedureID: data.testID}, (err, form) => {
					var node = ResponseHelper.getNodeWithField(form);
					var answer = ResponseHelper.getFieldAnswer(responseA._id, node, true)

					helper.postAnswer(answer)
					.end((err, res) => {	
						var required = 0
						for(let i = 0; i < form.nodes.length; i++) {
							if(form.nodes[i].field != null && form.nodes[i].referenceID != answer.nodeID) {
								required += 1
								form.nodes[i].field.required = true
							} 
						}
						form.save((err) => {
							chai.request(app)
							.put('/api/response?validate=1')
							.set('content-type', 'application/json')
							.send({_id:responseA._id})
							.end((err, res) => {
								res.should.have.status(400)
								res.body.should.be.a('object')
								expect(res.body.missingRequired).to.exist
								res.body.missingRequired.length.should.be.eql(required)
								done()
							})
						})
					})
				})
			})	


			it('it should PUT an form with a choice missing a required field and receive a validation error', done => {
				// Force the form to have a required field
				SDCForm.findOne({diagnosticProcedureID: data.testID2}, (err, form) => {
					// Answer the first choice with field and force it to be required
					var required = 0

					var node
					var choiceID
					for(let i = 0; i < form.nodes.length; i++) {
						if(form.nodes[i].choices != null) {
							for(let j = 0; j < form.nodes[i].choices.length; j++) {
								// Force this choice to have a field
								form.nodes[i].choices[j].field = {
									valueType: 'string',
									required: true
								}

								node = form.nodes[i]
								choiceID = form.nodes[i].choices[j].referenceID
								break
							}
						}
						if(node != null)
							break
					}
					form.save((err) => {
						// Answer choice without field
						helper.postAnswer({responseID: responseB._id, nodeID: node.referenceID, choices: [{choiceID:choiceID}]})
						.end((err, res) => {
							chai.request(app)
							.put('/api/response?validate=1')
							.set('content-type', 'application/json')
							.send({_id:responseB._id})
							.end((err, res) => {
								res.should.have.status(400)
								res.body.should.be.a('object')
								expect(res.body.missingRequired).to.exist
								res.body.missingRequired.length.should.be.eql(1)
								res.body.missingRequired[0].choiceID.should.be.eql(choiceID)
								done()
							})
						})
					})
				})
			})	
		})

		describe('/POST a response answer', () => {
			var form = null
			before(done => {
				helper.clearResponses()
				.then(() => {
					chai.request(app)
					.get('/api/form/' + data.testID)
					.end((err, res) => {
						res.should.have.status(200)
						res.should.be.a('object')
						form = res.body.form;
						done()
					})
				})
			})

			after(done => {
				helper.clearResponses()
				.then(helper.clearAnswers)
				.then(done)
			})

			var responseID = null
			beforeEach(done => {
				// Start a new response for each
				helper.postNewResponse(data.testID, data.patientID, data.formFillerID)
					.then(x => {
						responseID = x.body._id
						helper.clearAnswers()
						.then(done)
					})
			})

			it('it should POST a valid field answer to form response', done => {
				var node = ResponseHelper.getNodeWithField(form);
				node.should.exist
				var answer = ResponseHelper.getFieldAnswer(responseID, node, true)
				var nodeID = node.referenceID

				helper.postAnswer(answer)
				.end((err, res) => {
					res.should.have.status(200)
					SDCFormAnswer.find({}, (err, ans) => {
						ans.should.be.a('array')
						ans.length.should.eql(1)
						ans[0].responseID.should.be.eql(responseID)
						ans[0].nodeID.should.be.eql(node.referenceID)
						if(node.field.valueType == 'string')
							ans[0].field.stringValue.should.be.eql(ResponseHelper.stringAnswer)
						else if(node.field.valueType == 'integer')
							ans[0].field.numberValue.should.be.eql(ResponseHelper.integerAnswer)
						else
							ans[0].field.numberValue.should.be.eql(ResponseHelper.decimalAnswer)
						done()
					})
				})	
			})

			it('it should POST a choice answer to form response', done => {
				var temp = ResponseHelper.getNodeWithChoice(form)
				var node = temp.node;
				var choiceIndex = temp.index;

				node.should.exist
				var answer = ResponseHelper.getChoiceAnswer(responseID, node, choiceIndex)

				helper.postAnswer(answer)
				.end((err, res) => {
					res.should.have.status(200)
					SDCFormAnswer.find({}, (err, ans) => {
						ans.should.be.a('array')
						ans.length.should.eql(1)
						ans[0].responseID.should.be.eql(responseID)
						ans[0].nodeID.should.be.eql(node.referenceID)
						ans[0].choices.should.be.a('array')
						ans[0].choices.length.should.eql(1)
						ans[0].choices[0].choiceID.should.eql(node.choices[choiceIndex].referenceID)
						done()
					})
				})	
			})

			it('it should POST a choice answer with field to form response', done => {
				var temp = ResponseHelper.getNodeWithChoiceAndField(form)
				var node = temp.node
				var choiceIndex = temp.index

				node.should.exist
				var answer = ResponseHelper.getChoiceAnswer(responseID, node, choiceIndex)

				helper.postAnswer(answer)
				.end((err, res) => {
					res.should.have.status(200)
					SDCFormAnswer.find({responseID:responseID}, (err, ans) => {
						ans.should.be.a('array')
						ans.length.should.eql(1)
						ans[0].responseID.should.be.eql(responseID)
						ans[0].nodeID.should.be.eql(node.referenceID)
						ans[0].choices.should.be.a('array')
						ans[0].choices.length.should.eql(1)
						ans[0].choices[0].choiceID.should.eql(node.choices[choiceIndex].referenceID)
						expect(ans[0].choices[0].field).to.exist
						if(node.choices[choiceIndex].field.valueType == 'string')
							ans[0].choices[0].field.stringValue.should.eql(ResponseHelper.stringAnswer)
						else if(node.choices[choiceIndex].field.valueType == 'integer')
							ans[0].choices[0].field.numberValue.should.eql(ResponseHelper.integerAnswer)
						else
							ans[0].choices[0].field.numberValue.should.eql(ResponseHelper.decimalAnswer)
						done()
					})
				})	
			})

			it('it should POST two choice answers', done => {
				var temp = ResponseHelper.getNodeWithChoice(form)
				var node = temp.node;

				node.should.exist
				var answer1 = ResponseHelper.getChoiceAnswer(responseID, node, 0)
				var answer2 = ResponseHelper.getChoiceAnswer(responseID, node, 1)

				helper.postAnswer(answer1)
				.end((err, res) => {
					res.should.have.status(200)
					helper.postAnswer(answer2)
					.end((err, res) => {
						SDCFormAnswer.find({responseID:responseID}, (err, ans) => {
							ans.should.be.a('array')
							ans.length.should.eql(1)
							ans[0].choices.should.exist
							ans[0].choices.length.should.eql(2)
							done()
						})
					})
				})	
			})

			it('it should POST two choice answers with option maxSelection=1 so the second deselects the first', done => {
				var temp = ResponseHelper.getNodeWithChoice(form)
				var node = temp.node;

				node.should.exist
				var answer1 = ResponseHelper.getChoiceAnswer(responseID, node, 0)
				var answer2 = ResponseHelper.getChoiceAnswer(responseID, node, 1)

				helper.postAnswer(answer1)
				.end((err, res) => {
					res.should.have.status(200)
					helper.postAnswer(answer2, {maxSelection:1})
					.end((err, res) => {
						SDCFormAnswer.find({responseID:responseID}, (err, ans) => {
							ans.should.be.a('array')
							ans.length.should.eql(1)
							ans[0].choices.should.exist
							ans[0].choices.length.should.eql(1)
							ans[0].choices[0].choiceID = answer2.choices[0].choiceID
							done()
						})
					})
				})	
			})	

			it('it should POST two choice answers where node has maxSelection=1, so upon submission validation fails', done => {
				// Get the node with choice that has max selection = 1
				var temp = ResponseHelper.getNodeWithChoice(form, false, 1)
				var node = temp.node;

				node.should.exist
				var answer1 = ResponseHelper.getChoiceAnswer(responseID, node, 0)
				var answer2 = ResponseHelper.getChoiceAnswer(responseID, node, 1)

				helper.postAnswer(answer1)
				.end((err, res) => {
					res.should.have.status(200)
					helper.postAnswer(answer2)
					.end((err, res) => {
						// Will successfully post two answers
						SDCFormAnswer.find({responseID:responseID}, (err, ans) => {
							ans.should.be.a('array')
							ans.length.should.eql(1)
							ans[0].choices.should.exist
							ans[0].choices.length.should.eql(2)
							chai.request(app)
							.put('/api/response?validate=1')
							.set('content-type', 'application/json')
							.send({_id:responseID})
							.end((err, res) => {
								res.should.have.status(400)
								res.body.wrongChoiceCount.should.exist
								res.body.wrongChoiceCount.length.should.eql(1)
								done()
							})
						})
					})
				})	
			})		

			it('it should POST an answer and update the edit time', done => {
				// Get the initial time
				var time = 'asdf'
				SDCFormResponse.findOne({_id:responseID}, (err, resp) => {
					resp.should.be.a('object')
					time = resp.updatedAt

					// Get the first node with a field and answer if
					var node = ResponseHelper.getNodeWithField(form);
					node.should.exist
					var answer = ResponseHelper.getFieldAnswer(responseID, node, true)
					var nodeID = node.referenceID

					helper.postAnswer(answer)
					.end((err, res) => {
						res.should.have.status(200)
						SDCFormResponse.findOne({_id:responseID}, (err, resp) => {
							resp.should.be.a('object')
							var time2 = resp.updateAt
							expect(time.localeCompare(time2) == 0).to.be.false
							done()
						})
					})	
				})
			})
		})

		describe('/DELETE a response answer', () => {
			var form = null
			before(done => {
				helper.clearResponses()
				.then(() => {
					chai.request(app)
					.get('/api/form/' + data.testID)
					.end((err, res) => {
						res.should.have.status(200)
						res.should.be.a('object')
						form = res.body.form;
						done()
					})
				})
			})

			after(done => {
				helper.clearResponses()
				.then(helper.clearAnswers)
				.then(done)
			})

			var responseID = null
			beforeEach(done => {
				// Start a new response for each
				helper.postNewResponse(data.testID, data.patientID, data.formFillerID)
					.then(x => {
						responseID = x.body._id
						helper.clearAnswers()
						.then(done)
					})
			})	

			it('it should DELETE a field answer', done => {
				// Get the first node with a field and answer if
				var node = ResponseHelper.getNodeWithField(form);
				node.should.exist
				var answer = ResponseHelper.getFieldAnswer(responseID, node, true)
				var nodeID = node.referenceID

				helper.postAnswer(answer)
				.end((err, res) => {
					res.should.have.status(200)
					SDCFormAnswer.find({}, (err, ans) => {	
						ans.length.should.eql(1)
						chai.request(app)
						.delete('/api/response/answer?responseID=' + responseID + '&nodeID='+nodeID)
						.end((err, res) => {
							res.should.have.status(200)
							SDCFormAnswer.find({}, (err, ans) => {	
								ans.length.should.eql(0)
								done()
							})
						})
					})
				})
			})

			it('it should DELETE a choice answer', done => {
				// Get the first node with a field and answer if
				var temp = ResponseHelper.getNodeWithChoice(form)
				var node = temp.node;
				var choiceIndex = temp.index;

				node.should.exist
				var answer = ResponseHelper.getChoiceAnswer(responseID, node, choiceIndex)
				var nodeID = node.referenceID

				helper.postAnswer(answer)
				.end((err, res) => {
					res.should.have.status(200)
					SDCFormAnswer.find({}, (err, ans) => {	
						ans.length.should.eql(1)
						chai.request(app)
						.delete('/api/response/answer?responseID=' + responseID + '&nodeID=' + nodeID + '&choiceID=' + answer.choices[0].choiceID)
						.end((err, res) => {
							res.should.have.status(200)
							SDCFormAnswer.find({}, (err, ans) => {	
								ans.length.should.eql(0)
								done()
							})
						})
					})
				})
			})	

			it('it should DELETE a single choice from an answer with two choice answers', done => {
				// Get the first node with a field and answer if
				var temp = ResponseHelper.getNodeWithChoice(form)
				var node = temp.node;

				node.should.exist
				var answer = ResponseHelper.getMultiChoiceAnswer(responseID, node, [0, 1])
				var nodeID = node.referenceID

				helper.postAnswer(answer)
				.end((err, res) => {
					res.should.have.status(200)
					SDCFormAnswer.find({}, (err, ans) => {	
						ans.length.should.eql(1)
						ans[0].choices.length.should.eql(2)
						chai.request(app)
						.delete('/api/response/answer?responseID=' + responseID + '&nodeID=' + nodeID + '&choiceID=' + answer.choices[1].choiceID)
						.end((err, res) => {
							res.should.have.status(200)
							SDCFormAnswer.find({}, (err, ans) => {	
								ans.length.should.eql(1)
								ans[0].choices.length.should.eql(1)
								done()
							})
						})
					})
				})
			})		
		})

		describe('/GET a persistent response', () => {	
			var response
			beforeEach(done => {
				helper.clearResponses()
				.then(helper.clearAnswers)
				.then(() => {
					helper.postNewResponse(data.testID, data.patientID, data.formFillerID)
					.then(x => {
						x.should.have.status(200);
						response = x.body._id
						done()
					})	
				})	
			})

			it('it should GET a persistent response from the url', done => {
				chai.request(app)
					.put('/api/response')
					.set('content-type', 'application/json')
					.send({_id:response})
					.end((err, res) => {
						res.should.have.status(200)
						res.body.link.should.exist
						chai.request(app)
						.get('/persistent/'+res.body.link)
						.end((err, res) => {
							res.should.have.status(200)
							done()
						})
					})
			})

			it('it should not GET a persistent response from a nonexistant', done => {
				chai.request(app)
				.get('/persistent/12345678')
				.end((err, res) => {
					res.should.have.status(404)
					done()
				})
			})
		})
	}
}