var clone = require('clone')
//comment comment
var nlobjContext = function () {
  var context = Object.create(nlobjContext.prototype);
  context.name = '';
  context.executionContext = '';
  context.user = undefined;
  context.usage = 1000; //needs to be 10000 for scheduled script
  return context;
}

nlobjContext.prototype.clone = clone;

nlobjContext.prototype.getName = function() {
  return this.name;
}

nlobjContext.prototype.getExecutionContext = function() {
  return this.executionContext;
}

//netsumo only function for manually creating a script execution context
nlobjContext.prototype.setExecutionContext = function(newContext) {
  this.executionContext = newContext;
}

nlobjContext.prototype.getUser = function() {
  return this.user;
}

nlobjContext.prototype.setName = function(name) {
  this.name = name;
  return this.name;
}

nlobjContext.prototype.setUser = function(user) {
  this.user = user;
  return this.user;
}

nlobjContext.prototype.getScriptId = function() {
  return 1; //placeholder
}

nlobjContext.prototype.getDeploymentId = function() {
  return 1; //placeholder
}

nlobjContext.prototype.getRemainingUsage = function() {
  return this.usage;
}

nlobjContext.prototype.decreaseUnits = function(number) {
  //Not available in Netsuite - this is used to mock the NS API usage behavior
  if (this.usage - number < 0) {
    throw new Error('Usage limit exceeded error');
  }
  this.usage = this.usage - number;
}

nlobjContext.prototype.resetUnits = function(number) {
  //Not available in Netsuite - this is used to mock script rescheduling unit resets
  this.usage = number || 1000;
}

exports.nlobjContext = nlobjContext;
