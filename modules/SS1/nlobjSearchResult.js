var nlobjSearchResult = function () {
  var searchResult = Object.create(nlobjSearchResult.prototype);
  searchResult.id = ''
  searchResult.recordType = ''
  searchResult.values = {}
  return searchResult;
}

nlobjSearchResult.prototype.getAllColumns = function() {
  return Object.keys(this.values)
}

nlobjSearchResult.prototype.getId = function() {
  return this.id
}

nlobjSearchResult.prototype.setId = function(identifier) {
  this.id = identifier
}

nlobjSearchResult.prototype.getRecordType = function() {
  return this.recordType
}

nlobjSearchResult.prototype.setRecordType = function(recType) {
  this.recordType = recType
}

nlobjSearchResult.prototype.setValue = function(column, value) {
  this.values[column] = value
}

nlobjSearchResult.prototype.getValue = function(column) {

  if(column.getName != null || typeof column.getName != 'undefined') {
    return this.values[column.getName()]
  }

  return this.values[column]
}

var getText = function(column, join) {
  if(column.getName != null || typeof column.getName != 'undefined') {
    return this.values[column.getName()]
  }

  return this.values[column]
}

module.exports = nlobjSearchResult
