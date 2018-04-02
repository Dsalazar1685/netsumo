var nlobjResponse = function (body) {
  this.body = body;
  this.headers = {};
}

nlobjResponse.prototype.addHeader =function(name, value){
  this.headers[name] = value
}

nlobjResponse.prototype.getAllHeaders =function(){
  let returnValues = [];
  for(var header in this.headers){
    if(headers.hasOwnKey(header)){
      var obj = {};
      obj[header] = headers[header];
      returnValues.push(obj);
    }
  }
  return returnValues;
}

nlobjResponse.prototype.getBody =function(){
  return this.body;
}

nlobjResponse.prototype.getCode =function(){
  return 200
}

nlobjResponse.prototype.getError =function(){
}

nlobjResponse.prototype.getHeader =function(name){
  for(var header in this.headers){
    if(this.headers.hasOwnKey(header) &&  header === name){
      return this.headers[name];
    }
  }
  throw new Error('Header '+ name + ' not found');
}

nlobjResponse.prototype.getHeaders =function(name){

}

nlobjResponse.prototype.renderPDF =function(xmlString){

}

nlobjResponse.prototype.setCDNCacheable =function(type){

}

nlobjResponse.prototype.setContentType =function(type, name, disposition){

}

nlobjResponse.prototype.setEncoding =function(encodingType){

}

nlobjResponse.prototype.setHeader =function(name, value){

}

nlobjResponse.prototype.sendRedirect =function(type, identifier, id, editmode, parameters){

}

nlobjResponse.prototype.write =function(output){

}

nlobjResponse.prototype.writeLine =function(output){

}

nlobjResponse.prototype.writePage =function(pageobject){

}

module.exports = nlobjResponse
