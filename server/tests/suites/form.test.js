import SDCForm from '../../models/SDCForm'
import SDCFormResponse from '../../models/SDCFormResponse'
import SDCPersistentLink from '../../models/SDCPersistentLink'
import { TestHelper } from '../TestHelper'
import path from 'path';
import fs from 'fs'

export default (chai, app, data) => {
	return () => {
		var should = chai.should()
		var expect = chai.expect
		var helper = TestHelper(chai, app)
		describe('/GET forms', () => {
			before((done) => {
				helper.clearForms()
				.then(() => {
					helper.postForm(data.testID, 'form')
					.then(() => {
						helper.postForm(data.testID2, 'form')
						.then(() => {
							done()
						})
					})
				})
			})
			it('it should GET all the forms', done => {
				chai.request(app)
					.get('/api/form')
					.end((err, res) => {
						res.should.have.status(200)
						res.body.should.be.a('array')
						res.body.length.should.be.eql(2)
						done()
					})
			})
		})

		describe('/POST a form from an XML upload', () => {
			before(done => {
				helper.clearForms().then(done)
			})
			
			it('it should POST a new form with version 1', done => {
				helper.postForm(data.testID, 'form')
				.end((err, res) => {
					res.should.have.status(200)
					SDCForm.findOne({diagnosticProcedureID:data.testID}).sort('-version').exec((err, form) => {
						should.exist(form)
						expect(form.version).to.be.equal(1);
						done()
					})
				})
			})

			// Relies on previous test
			it('it should POST an updated form with version 2', done => {
				helper.postForm(data.testID, 'form')
				.end((err, res) => {
					SDCForm.findOne({diagnosticProcedureID:data.testID}).sort('-version').exec((err, form) => {
						should.exist(form)
						expect(form.version).to.be.equal(2);
						done()
					})
				})
			})

			// Relies on previous test
			it('it should POST an updated form after DEACTIVATE with version 3', done => {
				chai.request(app)
					.delete('/api/form/' + data.testID)
					.end((err, res) => {
						res.should.have.status(200)

						helper.postForm(data.testID, 'form')
						.end((err, res) => {
							res.should.have.status(200)
							SDCForm.findOne({diagnosticProcedureID:data.testID}).sort('-version').exec((err, form) => {
								should.exist(form)
								expect(form.version).to.be.equal(3);
								done()
							})
						})
					})
			})

			it('it should POST two separate forms each with version 1', done => {
				helper.clearForms().then(() => {
					helper.postForm(data.testID, 'form')
					.end((err, res) => {
						res.should.have.status(200)

						helper.postForm(data.testID2, 'form')
						.end((err, res) => {
							res.should.have.status(200)
							SDCForm.findOne({diagnosticProcedureID:data.testID}).sort('-version').exec((err, form) => {

								should.exist(form)
								expect(form.version).to.be.equal(1);
								SDCForm.findOne({diagnosticProcedureID:data.testID2}).sort('-version').exec((err, form) => {
									should.exist(form)
									expect(form.version).to.be.equal(1);
									done()
								})
							})	

						})
					})

				})
			})

			it('it should POST an new form after DELETE ALL with version 1', done => {
				SDCForm.deleteMany({diagnosticProcedureID:data.testID}, () => {
					helper.postForm(data.testID, 'form')
					.end((err, res) => {
						res.should.have.status(200)
						SDCForm.findOne({diagnosticProcedureID:data.testID}).sort('-version').exec((err, form) => {
							should.exist(form)
							expect(form.version).to.be.equal(1);
							done()
						})
					})
				})
			})
		})

		describe('/GET a form', () => {
			before(done => {
				helper.clearForms()
				.then(() => {
					helper.postForm(data.testID, 'form')
					.end(done)
				})
			})

			it('it should GET a specific form', done => {
				chai.request(app)
					.get('/api/form/' + data.testID)
					.end((err, res) => {
						res.should.have.status(200)
						res.body.should.be.a('object')
						expect(res.body.form.diagnosticProcedureID).to.be.equal(data.testID)
						done()
					})
			})

			it('it should not GET a non-existant form', done => {
				chai.request(app)
					.get('/api/form/asdfasfdadsf')
					.end((err, res) => {
						res.should.have.status(404)
						done()
					})
			})	
		})

		describe('/DELETE a form', () => {
			beforeEach(done => {
				helper.clearForms()
				.then(() => {
					helper.postForm(data.testID, 'form')
					.end(done)
				})
			})

			it('it should DEACTIVATE a form and prevent us from getting it', done => {
				chai.request(app)
					.delete('/api/form/' + data.testID)
					.end((err, res) => {
						res.should.have.status(200)
						chai.request(app)
						.get('/api/form/' + data.testID)
						.end((err, res) => {
							res.should.have.status(404)
							done()
						})
					})
			})

			it('it should DEACTIVATE a form but not delete it from the database', done => {
				chai.request(app)
					.delete('/api/form/' + data.testID)
					.end((err, res) => {
						res.should.have.status(200)
						SDCForm.findOne({diagnosticProcedureID:data.testID}, (err, form) => {
							expect(form).to.exist
							done()
						})
					})
			})
		})

	}
}
