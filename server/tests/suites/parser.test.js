import SDCForm from '../../models/SDCForm'
import parser from '../../parser'

var testID = "PKG_ACR_CT_STROKE"
var testID2 = "PKG_Lung_Surgery_CCO"

export default (chai, app, data) => {
	return () => {
		var should = chai.should()
		var expect = chai.expect

		describe('Parser', () => {
			before(done => {
				SDCForm.deleteMany({}, () => {
					done()
				})
			})

			it('it should PARSE the form and contain all the model attributes', done => {
				var path = './forms/' + testID + '.xml';
				parser.transformXMLAtPathToForm(path)
					.then(data => {
						var form = data.form
						expect(form).to.be.an('object')
						// Keys wasn't working
						expect(form).to.have.property('version')
						expect(form).to.have.property('title')
						expect(form).to.have.property('nodes')
						expect(form).to.have.property('sections')
						done()
					})
			})
		})
	}
}