var chai = require('chai');
var expect = chai.expect;
var nsContext = require('../modules/SS1/nsContext.js');
var nlobjRecord = require('../modules/SS1/nlobjRecord.js');

describe('nsContext getOldRecord functionality', function() {
  it ('Should save a reference to the old copy of a record when the record is updated', function() {
    var context = nsContext.getDefaultContext();
    expect(context.nlapiGetOldRecord()).to.deep.equal({});
    var customer = nlobjRecord('customer', 1);
    customer.setFieldValue('name', 'Doog');
    context.nlapiSubmitRecord(customer);

    var customerTwo = nlobjRecord('customer', 2);
    customerTwo.setFieldValue('name', 'Frog');
    context.nlapiSubmitRecord(customerTwo);

    var updatedCustomer = context.nlapiLoadRecord('customer', 1);
    updatedCustomer.setFieldValue('name', 'Doug');
    context.nlapiSubmitRecord(updatedCustomer);
    expect(context.nlapiGetOldRecord().getFieldValue('name')).to.equal('Doog');
    expect(context.nlapiLoadRecord('customer', 1).getFieldValue('name')).to.equal('Doug');
  })
})
