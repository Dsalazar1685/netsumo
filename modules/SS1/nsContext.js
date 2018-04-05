var nlobjRecord = require('./nlobjRecord.js');
var nlobjSearchFilter = require('./nlobjSearchFilter.js');
var nlobjSearchColumn = require('./nlobjSearchColumn.js');
var nlobjSearchResult = require('./nlobjSearchResult.js');
var nlobjResponse = require('./nlobjResponse.js')
var nlobjError = require('./nlobjError.js');
var context = require('./nlobjContext.js');
var nodemailer = require('nodemailer');
var pickupTransport = require('nodemailer-pickup-transport');


var executionLogLevelMappings ={
  debug: 1,
  audit: 2,
  error: 3,
  emergency: 4,
  system: 5
}


exports.getDefaultContext = function(opts) {

  if(!opts) {
    opts = {};
  }

  var defaultContextOptions = opts;
  var recordsArray = [];
  var recordId = 0;
  var recordType = '';
  var currentRecord = null;
  var oldRecord = {};
  var endPoints = [];
  var scriptStatus = 'INPROGRESS'; //netsumo usage only
  var nlobjContext = context();

  var nlapiScheduleScript = function(scriptId, deployId, params) {
    nlobjContext.decreaseUnits(20);
    scriptStatus = 'QUEUED';
    return 'QUEUED';
  }

  var nlapiYieldScript = function() {
    return {
      status: 'RESUME', //yield status - RESUME or FAILURE
      reason: 'SS_NLAPIYIELDSCRIPT', //Reason for yielding
      size: 1, //size of saved recovery point object
      information: 'someinfo' //additional information about yield status
    }
  }

   var nlapiLogExecution = function(type,title,details) {
    if(defaultContextOptions.suppressNlapiLogOutput) {
      return
    }
    var level = executionLogLevelMappings[type.toLowerCase()];
    var minLevel = 0;
    if(defaultContextOptions.NlapiLogOutLevel){
      minLevel = executionLogLevelMappings[defaultContextOptions.NlapiLogOutLevel.toLowerCase()]
    }
    if(level >= minLevel){
      console.log("TYPE: "+type+" | TITLE: "+title+" | DETAILS: "+details)
    }
  }

  var nlapiCreateError = function(code,details,suppressNotification) {
    return new Error("NLAPI ERROR CODE: "+code+" | DETAILS: "+details+" | SUPPRESS NOTIFICATION: "+suppressNotification);
  };

  var nlapiGetRecordId = function() {
    return recordId;
  };

  var nlapiSetRecordId = function(id) {
    recordId = id;
  };

  var nlapiGetRecordType = function() {
    return recordType;
  };

  var nlapiSetRecordType = function(type) {
    recordType = type;
  };

  var nlapiCreateRecord = function(type,initializeValues) {
    //if standard transaction
    nlobjContext.decreaseUnits(10);
    //else if standard non-transaction
    //nlobjContext.decreaseUnits(5);
    //else if custom record;
    //nlobjContext.decreaseUnits(2);
    var record = new nlobjRecord(type);
    return record;
  };

  var nlapiDeleteRecord = function(type,id) {
    //if standard transaction
    nlobjContext.decreaseUnits(20);
    //else if standard non-transaction
    //nlobjContext.decreaseUnits(10);
    //else if custom record;
    //nlobjContext.decreaseUnits(4);
    for(var i = 0; i < recordsArray.length; i++) {
      var record = recordsArray[i];
      if(record.getRecordType() == type && record.getId() == id) {
        recordsArray.splice(i, 1);
        return;
      }
    }
    throw new Error('NETSIM ERROR: Couldnt find any record matching id:'+id+' with type: '+type);
  };

  var nlapiSubmitRecord = function(record,doSourcing,ignoreMandatoryFields) {
    //if standard transaction
    nlobjContext.decreaseUnits(20);
    //else if standard non-transaction
    //nlobjContext.decreaseUnits(10);
    //else if custom record;
    //nlobjContext.decreaseUnits(4);
    var updatedExistingRecord = false;
    for(var i = 0; i < recordsArray.length; i++) {
      var storedRecord = recordsArray[i];
      if(storedRecord.getId() == record.getId()) {
        oldRecord = storedRecord.copy();
        recordsArray[i] = record;
        updatedExistingRecord = true;
        break;
      }
    }

    if(!updatedExistingRecord) {
      recordsArray.push(record);
    }

    currentRecord = record;
    recordId = record.getId();
    recordType = record.getRecordType();

    return recordId;
  };

  var nlapiLoadRecord = function(type,id,initializeValues) {
    //if standard transaction
    nlobjContext.decreaseUnits(10);
    //else if standard non-transaction
    //nlobjContext.decreaseUnits(5);
    //else if custom record;
    //nlobjContext.decreaseUnits(2);
    for(var i = 0; i < recordsArray.length; i++) {
      var record = recordsArray[i];
      if(record.getRecordType() == type && record.getId() == id) {
        return record.copy();
      }
    }
    throw new Error('NETSIM ERROR: Couldnt find any record matching id:'+id+' with type: '+type);
  };

  var nlapiTransformRecord = function(type,id,transformType,transformValues) {
    //if standard transaction
    nlobjContext.decreaseUnits(10);
    //else if standard non-transaction
    //nlobjContext.decreaseUnits(5);
    //else if custom record;
    //nlobjContext.decreaseUnits(2);

    var record = nlapiLoadRecord(type,id);
    var transformedRecord = record.transform(transformType, getNextAvailableRecordId());

    return transformedRecord;
  };

  var nlapiSearchRecord = function(type,id,filters,columns) {

    var matchingResults = [];

    if(!id || id == null || id == '' || id == undefined) {

      recordsArray.forEach(function(record){

        var matchingRecord = record.getRecordType() == type;

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

  var nlapiCopyRecord = function(type, id) {
    var record = nlapiLoadRecord(type, id);
    return record.copy();
  }

  var nlapiGetFieldValue = function(field) {
    return currentRecord.getFieldValue(field);
  };

  var nlapiSendEmail = function (author,recipient,subject,body,cc,bcc,records,attachments,notifySenderOnBounce,internalOnly,replyTo) {

    var mailOptions = {
        from: author,
        to: recipient,
        subject: subject,
        html: body
    };

    if(typeof defaultContextOptions.emailPath == 'undefined' || defaultContextOptions.emailPath == null) {
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

  var nlapiResolveURL = function(type,identifier,id,displayMode) {

    if(type == 'record' && identifier == 'returnauthorization') {
      return "https://system.na1.netsuite.com/app/accounting/transactions/rtnauth.nl?id="+id+"&whence=";
    }

  };

  var getNextAvailableRecordId = function() {
    var maxRecordId = 0;

    for(var i = 0; i < recordsArray.length; i++) {
      var record = recordsArray[i];

      if(record.getId() > maxRecordId) {
        maxRecordId = record.getId();
      }
    }

    return maxRecordId + 1;

  };

  var setNlobjContext = function(nlobjContext) {
    nlobjContext = this.nlobjContext;
  };

  var nlapiGetContext = function() {
    return nlobjContext;
  };

  var nlapiCreateError = function(code, details, suppressNotification) {
    return new nlobjError(code, details);
  };

  var getAllRecords = function() {
    return recordsArray;
  };

   var nlapiLookupField = function(type, id, fields, text){
    nlobjContext.decreaseUnits(10);
    var record = nlapiLoadRecord(type,id);
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


  var nlapiSubmitField = function(type, id, fields, values) {
    nlobjContext.decreaseUnits(10);
    for (var i = 0 ; i < recordsArray.length ; i ++) {
      var record = recordsArray[i];
      if (record.getRecordType() == type && record.getId() == id) {
        if (Array.isArray(fields) && Array.isArray(values)) {
          fields.forEach(function(field, index) {
            record.setFieldValue(field, values[index]);
          })
          return;
        } else {
          record.setFieldValue(fields, values);
          return;
        }
      }
    }
  }

  var nlapiAddMonths = function(date, months){
    return date.setMonth(date.getMonth() + months);
  };

  nlapiStringToDate = function(str, format){
    var monthDayYearArray = [];
    if(str.indexOf('/') > -1){
      monthDayYearArray = str.split('/');
    }else{
      monthDayYearArray = str.split('.');
    }
    return new Date(monthDayYearArray[2], monthDayYearArray[1], monthDayYearArray[0]);
  };

  nlapiDateToString = function(d, format){
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
  var nlapiRequestURL = function(url, postdata, headers, callback, httpMethod){

    var response;
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

  var nlapiEscapeXML = function(text){
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&apos;').replace(/"/g, ' &quot;');
    }

  var addEndpoint = function(endPoint){
    if(!endPoint.url && !endPoint.regex){
      throw new Error('Either url or regex are required.');
    }
    endPoints.push(endPoint);
  }

 //netsumo usage only:
  var getScriptStatus = function() {
    return scriptStatus;
  }

var nlapiGetOldRecord = function() {
  return oldRecord;
}

  return {
    nlapiLogExecution : nlapiLogExecution,
    nlapiCreateError : nlapiCreateError,
    nlapiGetRecordId : nlapiGetRecordId,
    nlapiSetRecordId : nlapiSetRecordId,
    nlapiGetRecordType : nlapiGetRecordType,
    nlapiSetRecordType : nlapiSetRecordType,
    nlapiSubmitRecord : nlapiSubmitRecord,
    nlapiGetFieldValue : nlapiGetFieldValue,
    nlapiLoadRecord : nlapiLoadRecord,
    nlapiTransformRecord : nlapiTransformRecord,
    nlobjSearchFilter : nlobjSearchFilter,
    nlobjSearchColumn : nlobjSearchColumn,
    nlapiSearchRecord : nlapiSearchRecord,
    nlapiSendEmail : nlapiSendEmail,
    nlapiResolveURL : nlapiResolveURL,
    nlapiDeleteRecord : nlapiDeleteRecord,
    nlapiCreateRecord : nlapiCreateRecord,
    getAllRecords : getAllRecords,
    nlapiLookupField: nlapiLookupField,
    nlapiAddMonths: nlapiAddMonths,
    nlapiStringToDate: nlapiStringToDate,
    nlapiDateToString: nlapiDateToString,
    nlapiRequestURL: nlapiRequestURL,
    nlapiEscapeXML: nlapiEscapeXML,
    addEndpoint: addEndpoint,
    nlobjError: nlobjError,
    nlapiScheduleScript: nlapiScheduleScript,
    nlapiYieldScript: nlapiYieldScript,
    getScriptStatus: getScriptStatus,
    nlapiGetContext: nlapiGetContext,
    nlapiGetOldRecord : nlapiGetOldRecord,
    nlapiSubmitField : nlapiSubmitField,
  };

};
