var mongoose = require('mongoose')

// Configure chai
let chai = require('chai')
let chaiHttp = require('chai-http')
import app from '../server'
chai.use(chaiHttp);

var data = {
	testID: "PKG_ACR_CT_STROKE",
	testID2: "PKG_Lung_Surgery_CCO",
	patientID: '0',
	patientID2: '1',
	formFillerID: '0',
	formFillerID2: '1'
}

import parser from './suites/parser.test';
import form from './suites/form.test';
import response from './suites/response.test';
import query from './suites/query.test';

describe('API Tests', () => {
	before(done => {
		app.on("app_started", () => {
			done()
		})
	})	

	describe('Parser tests', parser(chai, app, data))
	describe('Form tests', form(chai, app, data))
	describe('Response tests', response(chai, app, data))
	describe('Query tests', query(chai, app, data))

	after(function(done){
		mongoose.connection.db.dropDatabase(function(){			
			mongoose.connection.close(done);		
		})
	})	
})