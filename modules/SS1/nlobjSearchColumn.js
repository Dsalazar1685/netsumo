var nlobjSearchColumn = function (name, join, summary) {
  var column = Object.create(nlobjSearchColumn.prototype);
  column.name = name
  column.join = join
  column.summary = summary
  column.sort = false;
  return column;
}

nlobjSearchColumn.prototype.getName = function() {
  return this.name;
}

nlobjSearchColumn.prototype.getJoin = function() {
  return this.join;
}

nlobjSearchColumn.prototype.getSummary = function() {
  return this.summary;
}

nlobjSearchColumn.prototype.setSort = function(order) {
  this.sort = order;
}

module.exports = nlobjSearchColumn
