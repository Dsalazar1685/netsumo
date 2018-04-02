var nlobjSelectOption = require('./nlobjSelectOption.js')

var nlobjField = function (name, join, summary) {
  this.name = name;
  this.join = join;
  this.summary = summary;
  this.selectOptions = [];
}

nlobjField.prototype.addSelectOption = function(value, text, selected) {
  this.selectOptions.push(new nlobjSelectOption(value, text))
}

nlobjField.prototype.getName = function() {
  return this.name;
}

nlobjField.prototype.getSelectOptions = function(filter, filteroperator) {

  if(filter == null) {
    return this.selectOptions;
  }

  var filteredSelectOptions = [];

  this.selectOptions.forEach(function(selectOption) {

    if(filteroperator == null || filteroperator == 'contains') {
      if(selectOption.getText().indexOf(filter) > -1) {
        filteredSelectOptions.push(selectOption)
      }
    } else if(filteroperator == 'is' && selectOption.getText() == filter) {
      filteredSelectOptions.push(selectOption)
    }

  })

  return filteredSelectOptions;

}

module.exports = nlobjField
