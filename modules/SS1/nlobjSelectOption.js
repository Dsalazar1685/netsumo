var nlobjSelectOption = function (id, text) {
  var option = Object.create(nlobjSelectOption.prototype);
  option.id = id;
  option.text = text;
  return option;
}

nlobjSelectOption.prototype.getId = function() {
    return this.id;
}

nlobjSelectOption.prototype.getText = function() {
    return this.text;
}

module.exports = nlobjSelectOption
