var Operator = require('../utils/Operators');

var nlobjSearchFilter = function (name, join, operator, value1, value2) {
  var filter = Object.create(nlobjSearchFilter.prototype);
  filter.name = name
  filter.join = join
  filter.operator = operator
  filter.value1 = value1
  filter.value2 = value2
  filter.operatorIns = new Operator();
  return filter;
}

nlobjSearchFilter.prototype.getName = function() {
  return this.name
}

nlobjSearchFilter.prototype.getJoin = function() {
  return this.join
}

nlobjSearchFilter.prototype.getOperator = function() {
  return this.operator
}

//netsumo use only function, not available in suitescript
nlobjSearchFilter.prototype.getValue1 = function() {
  return this.value1
}

//netsumo use only function, not available in suitescript
nlobjSearchFilter.prototype.getValue2 = function() {
  return this.value2
}

//netsumo use only function, not available in suitescript
nlobjSearchFilter.prototype.matchesRecord = function(record) {

  try{
    return this.operatorIns[operator](record, name, join, value1, value2);
  }catch(err){
    throw new Error('NETSIM ERROR: '+operator+' is unsupported.');
  }
}
//what is this method being used for??
// nlobjeSearchFilter.prototype.getNetsuiteDateTimeString() {
//   var date = new Date();
//   var ampm = 'am';
//   if(date.getHours() >= 12) {
//     ampm = 'pm';
//   }
//
//   var hours = date.getHours()
//
//   if(hours > 12) {
//     hours = hours - 12
//   }
//
//   var dateTimeString = date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear()+'  '+hours+':'+date.getMinutes()+':'+date.getSeconds()+' '+ampm
//
//   return dateTimeString
//
// }

module.exports = nlobjSearchFilter
