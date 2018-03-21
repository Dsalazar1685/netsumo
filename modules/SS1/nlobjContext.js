var clone = require('clone')
//comment comment
module.exports = function () {

  var name = '';
  var executionContext = '';
  var user = undefined;
  var usage = 1000; //needs to be 10000 for scheduled scripts

  var getName = function() {
    return name;
  }

  var getExecutionContext = function() {
    return executionContext;
  }

  //netsumo only function for manually creating a script execution context
  var setExecutionContext = function(newContext) {
    executionContext = newContext;
  }

  var getUser = function() {
    return user;
  }

  var setName = function(name) {
    return name = this.name;
  }

  var setUser = function(user) {
    return user = this.user;
  }

  var getScriptId = function() {
    return 1; //placeholder
  }

  var getDeploymentId = function() {
    return 1; //placeholder
  }

  var getRemainingUsage = function() {
    return usage;
  }

  var decreaseUnits = function(number) {
    //Not available in Netsuite - this is used to mock the NS API usage behavior
    if (usage - number < 0) {
      throw new Error('Usage limit exceeded error');
    }
    usage = usage - number;
  }

  var resetUnits = function() {
    //Not available in Netsuite - this is used to mock script rescheduling unit resets
    usage = 1000;
  }

  return {
    getName : getName,
    getUser : getUser,
    setName : setName,
    setUser : setUser,
    getExecutionContext : getExecutionContext,
    setExecutionContext : setExecutionContext,
    getScriptId : getScriptId,
    getDeploymentId : getDeploymentId,
    getRemainingUsage : getRemainingUsage,
    resetUnits: resetUnits,
    decreaseUnits: decreaseUnits,
  };
}
