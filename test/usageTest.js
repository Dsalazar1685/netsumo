var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var netsumo = require('netsumo');
var nsLoader = netsumo.nsLoader;
var nsContext = netsumo.nsContext;
var nlobjRecord = netsumo.nlobjRecord;

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
