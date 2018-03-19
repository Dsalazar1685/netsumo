var clone = require('clone')
//comment comment
module.exports = function () {

  var name = '';
  var user = undefined;
  var usage = 1000; //needs to be 10000 for scheduled scripts

  var getName = function() {
    return name;
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

  return {
    getName : getName,
    getUser : getUser,
    setName : setName,
    setUser : setUser,
    getScriptId : getScriptId,
    getDeploymentId : getDeploymentId,
    getRemainingUsage : getRemainingUsage,
  };
}
