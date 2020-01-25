import SDCForm from '../../models/SDCForm'
import SDCFormResponse from '../../models/SDCFormResponse'
import SDCPersistentLink from '../../models/SDCPersistentLink'
import { TestHelper } from '../TestHelper'
import { ResponseHelper } from '../ResponseHelper'
import path from 'path';
import fs from 'fs'

import elastic from '../../elastic'

export default (chai, app, data) => {
	return () => {
		var should = chai.should()
		var expect = chai.expect
		var helper = TestHelper(chai, app)
		var responses
		var form
		var hasElastic = false

		before(function(done){

			elastic.hasClient()
			.then(_hasElastic => {
				console.log(_hasElastic)
				hasElastic = _hasElastic
				// Call dummy endpoint to generate responses
				chai.request(app)
				.get(`/api/dummy?form=${data.testID}&forms=1&responses=1&answers=1`)
				.end((err, res) => {
					SDCFormResponse.find({}, (err, _responses) => {
						responses = _responses
						responses.should.be.a('array')
						responses.length.should.be.gt(0)
						SDCForm.findOne({diagnosticProcedureID:data.testID}, (err, _form) => {
							form = _form
						})
						done()
					})
				})
			})	
		})

		describe('Primary query', () => {
			before(function(done) {
				if(!hasElastic)
					this.skip()
				done()
			})

			beforeEach(done => {
				elastic.deleteIndex()
				.then(elastic.initIndex)
				.then(x => {
					done()
				})
			})

			it('it should PUT a form response and add documents to the index', done => {
				chai.request(app)
					.put('/api/response')
					.set('content-type', 'application/json')
					.send({_id:responses[0]._id})
					.end((err, res) => {
						res.should.have.status(200)

						// Check with client that things were added
						elastic.getCount((err,resp,status) => {
							resp.count.should.be.gt(0)
							done()
						})
					})
			})	

			it('it should retrieve documents for a given diagnosticProcedureID and nodeID', done => {
				chai.request(app)
					.put('/api/response')
					.set('content-type', 'application/json')
					.send({_id:responses[0]._id})
					.end((err, res) => {
						res.should.have.status(200)
						var nodeID = form.nodes[0].referenceID;
						// TODO: search for a given form id
						chai.request(app)
						.get(`/api/query?diagnosticProcedureID=${responses[0].diagnosticProcedureID}&nodeID=${nodeID}`)
						.end((err, res) => {
							res.should.have.status(200)
							res.body.answer.hits.should.be.a('array');
							res.body.answer.hits[0].diagnosticProcedureID.should.be.eq(responses[0].diagnosticProcedureID);
							res.body.answer.hits[0].nodeID.should.be.eq(nodeID);
							res.body.answer.hits.length.should.be.gt(0)
							done()
						})
					})
			})

			it('it should retrieve documents for a given diagnosticProcedureID, nodeID and formTitle', done => {
				chai.request(app)
					.put('/api/response')
					.set('content-type', 'application/json')
					.send({_id:responses[0]._id})
					.end((err, res) => {
						res.should.have.status(200)
						var nodeID = form.nodes[0].referenceID;
						// Search for a given form Title
						chai.request(app)
						.get(`/api/query?diagnosticProcedureID=${responses[0].diagnosticProcedureID}&nodeID=${nodeID}&formTitle=CCO Synoptic Template for  Stroke`)
						.end((err, res) => {
							res.should.have.status(200)
							res.body.answer.hits.should.be.a('array')
							res.body.answer.hits[0].formTitle.should.be.eq('CCO Synoptic Template for  Stroke');
							res.body.answer.hits.length.should.be.gt(0)
							done()
						})
					})
			})

			it('it should retrieve documents for a given diagnosticProcedureID, nodeID and choiceID', done => {
				chai.request(app)
					.put('/api/response')
					.set('content-type', 'application/json')
					.send({_id:responses[0]._id})
					.end((err, res) => {
						res.should.have.status(200)
						var node = ResponseHelper.getNodeWithChoice(form).node;
						var nodeID = node.referenceID;
						chai.request(app)
						.get(`/api/query?diagnosticProcedureID=${responses[0].diagnosticProcedureID}&nodeID=${nodeID}&choiceID=${node.choices[0].referenceID}`)
						.end((err, res) => {
							res.should.have.status(200)
							res.body.answer.hits.should.be.a('array')
							res.body.query.query.bool.must[2].match.choiceID.should.eql(node.choices[0].referenceID)
							// No guarantee dummy answered this, just wana confirm it should work
							done()
						})
					})
			})

			it('it should count how many times each choice was selected in a given question', done => {
				chai.request(app)
					.put('/api/response')
					.set('content-type', 'application/json')
					.send({_id:responses[0]._id})
					.end((err, res) => {
						res.should.have.status(200)
						var node = ResponseHelper.getNodeWithChoice(form).node;
						var nodeID = node.referenceID
						chai.request(app)
						.get(`/api/query?diagnosticProcedureID=${responses[0].diagnosticProcedureID}&nodeID=${nodeID}&operator=COUNT`)
						.end((err, res) => {
							res.status.should.eq(200)
							res.body.answer.aggs.Count.buckets.should.be.a('array')
							res.body.answer.aggs.Count.buckets[0].doc_count.should.be.gt(0)
							done()
						})
					})
			})

			it('it should count how many responses were submitted per patient', done => {
				chai.request(app)
					.put('/api/response')
					.set('content-type', 'application/json')
					.send({_id:responses[0]._id})
					.end((err, res) => {
						res.should.have.status(200)
						var nodeID = form.nodes[0].referenceID;
						chai.request(app)
						.get(`/api/query?operator=COUNT&fieldToCount=patientID`)
						.end((err, res) => {
							res.status.should.eq(200)
							res.body.answer.aggs.Count.buckets.should.be.a('array')
							res.body.answer.aggs.Count.buckets[0].doc_count.should.be.gt(0)
							done()
						})
					})
			})

			it('it should count how many responses were submitted per form', done => {
				chai.request(app)
					.put('/api/response')
					.set('content-type', 'application/json')
					.send({_id:responses[0]._id})
					.end((err, res) => {
						res.should.have.status(200)
						var nodeID = form.nodes[0].referenceID;
						chai.request(app)
						.get(`/api/query?operator=COUNT&fieldToCount=formTitle`)
						.end((err, res) => {
							res.status.should.eq(200)
							res.body.answer.aggs.Count.buckets.should.be.a('array')
							res.body.answer.aggs.Count.buckets[0].doc_count.should.be.gt(0)
							done()
						})
					})
			})														
		})

		describe('Fallback query', () => {
			before(function(done) {
				if(!hasElastic)
					this.skip()
				done()
			})
			it('it should retrieve documents for a given diagnosticProcedureID and nodeID', done => {
				chai.request(app)
					.put('/api/response')
					.set('content-type', 'application/json')
					.send({_id:responses[0]._id})
					.end((err, res) => {
						res.should.have.status(200)
						var nodeID = form.nodes[0].referenceID;
						chai.request(app)
						.get(`/api/query?fallback=1&diagnosticProcedureID=${responses[0].diagnosticProcedureID}&nodeID=${nodeID}`)
						.end((err, res) => {
							res.should.have.status(200)
							res.body.answer.hits.should.be.a('array')
							res.body.answer.hits.length.should.be.gt(0)
							done()
						})
					})
			})
		})
	}
}
