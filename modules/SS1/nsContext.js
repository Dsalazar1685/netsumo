var nlobjRecord = require('./nlobjRecord.js');
var nlobjSearchFilter = require('./nlobjSearchFilter.js');
var nlobjSearchColumn = require('./nlobjSearchColumn.js');
var nlobjSearchResult = require('./nlobjSearchResult.js');
var nlobjResponse = require('./nlobjResponse.js')
var nlobjError = require('./nlobjError.js');
var context = require('./nlobjContext.js');
var nodemailer = require('nodemailer');
var pickupTransport = require('nodemailer-pickup-transport');

var getDefaultContext = function(opts) {

  if(!opts) {
    opts = {};
  }
  var newContext = Object.create(getDefaultContext.prototype);
  newContext.defaultContextOptions = opts;
  newContext.executionLogLevelMappings ={
    debug: 1,
    audit: 2,
    error: 3,
    emergency: 4,
    system: 5
  }
  newContext.recordsArray = [];
  newContext.recordId = 0;
  newContext.recordType = '';
  newContext.currentRecord = null;
  newContext.oldRecord = {};
  newContext.endPoints = [];
  newContext.scriptStatus = 'INPROGRESS'; //netsumo usage only
  newContext.nlobjContext = context();
  return newContext;
}

getDefaultContext.prototype.nlapiScheduleScript = function(scriptId, deployId, params) {
  this.nlobjContext.decreaseUnits(20);
  this.scriptStatus = 'QUEUED';
  return this.scriptStatus;
}

getDefaultContext.prototype.nlapiYieldScript = function() {
  return {
    status: 'RESUME', //yield status - RESUME or FAILURE
    reason: 'SS_NLAPIYIELDSCRIPT', //Reason for yielding
    size: 1, //size of saved recovery point object
    information: 'someinfo' //additional information about yield status
  }
}

 getDefaultContext.prototype.nlapiLogExecution = function(type,title,details) {
  if(this.defaultContextOptions.suppressNlapiLogOutput) {
    return
  }
  var level = this.executionLogLevelMappings[type.toLowerCase()];
  var minLevel = 0;
  if(this.defaultContextOptions.NlapiLogOutLevel){
    minLevel = this.executionLogLevelMappings[this.defaultContextOptions.NlapiLogOutLevel.toLowerCase()]
  }
  if(level >= minLevel){
    console.log("TYPE: "+type+" | TITLE: "+title+" | DETAILS: "+details)
  }
}

getDefaultContext.prototype.nlapiCreateError = function(code,details,suppressNotification) {
  return new Error("NLAPI ERROR CODE: "+code+" | DETAILS: "+details+" | SUPPRESS NOTIFICATION: "+suppressNotification);
};

getDefaultContext.prototype.nlapiGetRecordId = function() {
  return this.recordId;
};

getDefaultContext.prototype.nlapiSetRecordId = function(id) {
  this.recordId = id;
};

getDefaultContext.prototype.nlapiGetRecordType = function() {
  this.recordType;
};

getDefaultContext.prototype.nlapiSetRecordType = function(type) {
  this.recordType = type;
};

getDefaultContext.prototype.nlapiCreateRecord = function(type,initializeValues) {
  //if standard transaction
  this.nlobjContext.decreaseUnits(10);
  //else if standard non-transaction
  //nlobjContext.decreaseUnits(5);
  //else if custom record;
  //nlobjContext.decreaseUnits(2);
  var record = new nlobjRecord(type);
  return record;
};

getDefaultContext.prototype.nlapiDeleteRecord = function(type,id) {
  //if standard transaction
  this.nlobjContext.decreaseUnits(20);
  //else if standard non-transaction
  //nlobjContext.decreaseUnits(10);
  //else if custom record;
  //nlobjContext.decreaseUnits(4);
  for(var i = 0; i < recordsArray.length; i++) {
    var record = this.recordsArray[i];
    if(record.getRecordType() === type && record.getId() === id) {
      recordsArray.splice(i, 1);
      return;
    }
  }
  throw new Error('NETSIM ERROR: Couldnt find any record matching id:'+id+' with type: '+type);
};

getDefaultContext.prototype.nlapiSubmitRecord = function(record,doSourcing,ignoreMandatoryFields) {
  //if standard transaction
  console.log('START:', this.oldRecord, record.getFieldValue('name'))
  this.nlobjContext.decreaseUnits(20);
  //else if standard non-transaction
  //nlobjContext.decreaseUnits(10);
  //else if custom record;
  //nlobjContext.decreaseUnits(4);
  var updatedExistingRecord = false;
  var records = this.recordsArray;
  for(var i = 0; i < records.length; i++) {
    var storedRecord = records[i];
    if(storedRecord.getId() === record.getId()) {
      console.log('VALUES:', storedRecord.getFieldValue('name'), record.getFieldValue('name'))
      this.oldRecord = storedRecord.copy();
      records[i] = record;
      updatedExistingRecord = true;
      break;
    }
  }

  if(!updatedExistingRecord) {
    this.oldRecord = record.copy();
    records.push(record);
  }

  currentRecord = record;
  recordId = record.getId();
  recordType = record.getRecordType();

  return recordId;
};

getDefaultContext.prototype.nlapiLoadRecord = function(type,id,initializeValues) {
  //if standard transaction
  this.nlobjContext.decreaseUnits(10);
  //else if standard non-transaction
  //nlobjContext.decreaseUnits(5);
  //else if custom record;
  //nlobjContext.decreaseUnits(2);
  var records = this.recordsArray;
  for(var i = 0; i < records.length; i++) {
    var record = records[i];
    if(record.getRecordType() === type && record.getId() === id) {
      return record.copy();
    }
  }
  throw new Error('NETSIM ERROR: Couldnt find any record matching id:'+id+' with type: '+type);
};

getDefaultContext.prototype.nlapiTransformRecord = function(type,id,transformType,transformValues) {
  //if standard transaction
  this.nlobjContext.decreaseUnits(10);
  //else if standard non-transaction
  //nlobjContext.decreaseUnits(5);
  //else if custom record;
  //nlobjContext.decreaseUnits(2);

  var record = this.nlapiLoadRecord(type,id);
  var transformedRecord = record.transform(transformType, this.getNextAvailableRecordId());

  return transformedRecord;
};

getDefaultContext.prototype.nlapiSearchRecord = function(type,id,filters,columns) {

  var matchingResults = [];

  if(!id || id == null || id == '' || id == undefined) {

    this.recordsArray.forEach(function(record){

      var matchingRecord = record.getRecordType() === type;

      filters.forEach(function(filter){

        if(!filter.matchesRecord(record)) {
          matchingRecord = false;
        }

      });

      if(matchingRecord) {
        matchingResults.push(record);
      }

    });

  }


  var searchResults = [];

  if(matchingResults.length > 0) {
    matchingResults.forEach(function(matchingResult) {

      var searchResult = new nlobjSearchResult();
      searchResult.setId(matchingResult.getId());
      searchResult.setRecordType(matchingResult.getRecordType());

      columns.forEach(function(column) {
        var value = matchingResult.getFieldValue(column.getName());
        searchResult.setValue(column.getName(), value);
      });

      searchResults.push(searchResult);
    });
  }

  return searchResults;
};

getDefaultContext.prototype.nlapiCopyRecord = function(type, id) {
  var record = this.nlapiLoadRecord(type, id);
  return record.copy();
}

getDefaultContext.prototype.nlapiGetFieldValue = function(field) {
  return this.currentRecord.getFieldValue(field);
};

getDefaultContext.prototype.nlapiSendEmail = function (author,recipient,subject,body,cc,bcc,records,attachments,notifySenderOnBounce,internalOnly,replyTo) {

  var mailOptions = {
      from: author,
      to: recipient,
      subject: subject,
      html: body
  };

  if(typeof defaultContextOptions.emailPath === 'undefined' || defaultContextOptions.emailPath === null) {
    console.log(mailOptions);
  } else {
    // create reusable transporter object using the default SMTP transport
    var transporter = nodemailer.createTransport(pickupTransport({
        directory: defaultContextOptions.emailPath
    }));

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
    });
  }
};

getDefaultContext.prototype.nlapiResolveURL = function(type,identifier,id,displayMode) {

  if(type === 'record' && identifier === 'returnauthorization') {
    return "https://system.na1.netsuite.com/app/accounting/transactions/rtnauth.nl?id="+id+"&whence=";
  }

};

getDefaultContext.prototype.getNextAvailableRecordId = function() {
  var maxRecordId = 0;
  var records = this.recordsArray;
  for(var i = 0; i < records.length; i++) {
    var record = records[i];

    if(record.getId() > maxRecordId) {
      maxRecordId = record.getId();
    }
  }

  return maxRecordId + 1;

};

getDefaultContext.prototype.setNlobjContext = function(nlobjContext) {
  nlobjContext = this.nlobjContext;
};

getDefaultContext.prototype.nlapiGetContext = function() {
  return this.nlobjContext;
};

getDefaultContext.prototype.nlapiCreateError = function(code, details, suppressNotification) {
  return new nlobjError(code, details);
};

getDefaultContext.prototype.getAllRecords = function() {
  return this.recordsArray;
};

 getDefaultContext.prototype.nlapiLookupField = function(type, id, fields, text){
  this.nlobjContext.decreaseUnits(10);
  var record = this.nlapiLoadRecord(type,id);
  if(typeof fields == 'string'){
    return record.getFieldValue(fields);
  }else if(Array.isArray(fields)){
    var results = {};
    for(var i = 0; i < fields.length; i++){
      results[fields[i]] = record.getFieldValue(fields[i]);
    }
    return results;
  }
  return null;
};


getDefaultContext.prototype.nlapiSubmitField = function(type, id, fields, values) {
  this.nlobjContext.decreaseUnits(10);
  var records = this.recordsArray;
  for (var i = 0 ; i < records.length ; i ++) {
    var record = records[i];
    if (record.getType() === type && record.getId() === id) {
      if (Array.isArray(fields) && Array.isArray(values)) {
        fields.forEach(function(field, index) {
          record.setFieldValue(field, values[index]);
        })
        return;
      } else {
        record.setFieldValue(field, value);
        return;
      }
    }
  }
}

getDefaultContext.prototype.nlapiAddMonths = function(date, months){
  return date.setMonth(date.getMonth() + months);
};

getDefaultContext.prototype.nlapiStringToDate = function(str, format){
  var monthDayYearArray = [];
  if(str.indexOf('/') > -1){
    monthDayYearArray = str.split('/');
  }else{
    monthDayYearArray = str.split('.');
  }
  return new Date(monthDayYearArray[2], monthDayYearArray[1], monthDayYearArray[0]);
};

getDefaultContext.prototype.nlapiDateToString = function(d, format){
  format = format.trim().toLowerCase();
  var hours = d.getHours();
  var ampm = (hours > 11 ? 'pm' : 'am' );
  if(hours > 12){
    hours = hours - 12;
  }
  var dateFormatted =  d.getMonth() + 1 +'/' + d.getDate() +'/' + d.getFullYear();
  var timeFormatted =  hours + ':' + d.getMinutes() + ' ' + ampm;

  if(!format || format == 'date'){
    return dateFormatted;
  }else if(format == 'timeofday'){
    return timeFormatted;
  }else if(format == 'datetime' || format == 'datetimetz'){
    return dateFormatted + ' ' + timeFormatted;
  }
  return '';
};

getDefaultContext.prototype.nlapiRequestURL = function(url, postdata, headers, callback, httpMethod){

  var response;
  var endPoints = this.endPoints;
  endPoints.forEach((endPoint, index) => {
    if(typeof endPoint.data == 'function'){
      endPoint.data = endPoint.data(url, postdata, headers, callback, httpMethod);
    }
    if(endPoint.regex){
      if(endPoint.regex.test(url)){
        response = new nlobjResponse(endPoint.data);
      }
    }else if(endPoint.url){
      if(endPoint.url == url){
        response = new nlobjResponse(endPoint.data);
      }
    }
  })
  if(!response){
    throw new Error('Endpoint '+url+' not found. ');
  }
  return response;
}

getDefaultContext.prototype.nlapiEscapeXML = function(text){
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&apos;').replace(/"/g, ' &quot;');
  }

getDefaultContext.prototype.addEndpoint = function(endPoint){

  if(!endPoint.url && !endPoint.regex){
    throw new Error('Either url or regex are required.');
  }

  this.endPoints.push(endPoint);
}

//netsumo usage only:
getDefaultContext.prototype.getScriptStatus = function() {
  return this.scriptStatus;
}

getDefaultContext.prototype.nlapiGetOldRecord = function() {
return this.oldRecord;
}

exports.getDefaultContext = getDefaultContext;
