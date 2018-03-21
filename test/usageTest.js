var chai = require('chai');
var expect = chai.expect;
var nsContext = require('../modules/SS1/nsContext.js');
var nlobjRecord = require('../modules/SS1/nlobjRecord.js');

describe('Netsumo api usage additions', function() {
  it('Decreases usage units according to the nlapi function usage requirements', function() {
    var context = nsContext.getDefaultContext();
    var objContext = context.nlapiGetContext();

    expect(objContext.getRemainingUsage()).to.equal(1000);

    var customer = nlobjRecord('customer', 1);
    customer.setFieldValue('name', 'Doug');
    context.nlapiSubmitRecord(customer);

    expect(objContext.getRemainingUsage()).to.equal(980);
  })
})
