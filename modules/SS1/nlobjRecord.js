var clone = require('clone')
var nlobjField = require('./nlobjField.js')
var nlobjSubRecord = require('./nlobjSubRecord.js')

var nlobjRecord = function (recordtype, internalid) {

  if(!internalid) {
    internalid = parseInt((Math.random() * 100), 10)
  }

  var id = internalid;
  var type = recordtype;
  var fields = [];
  var fieldValues = {};
  var currentLineItems =  {
    'item': {},
    'addressbook': {},
    'contactroles': {},
  };
  var lineItemOptions = {
    'item' : [],
    'addressbook' : [],
    'contactroles' : [],
  }


  var setFieldValue = function(name, value) {
    fieldValues[name] = value
  }

  setFieldValue('internalid', id)

  var getFieldValue = function(name) {
    if(typeof fieldValues[name] !== 'undefined') {
      return fieldValues[name]
    }

    return undefined;
  }

  var getFieldText = function(name) {
    //in Netsuite, this translates the internal id of a text value into the text it represents.  We're simplifying it here.
    return fieldValues[name];
  }

  var getLineItemCount = function(group) {
    var items = lineItemOptions[group];
    if (items) {
      return items.length;
    }
    return 0;
  }

  var setLineItemValue = function(group,name,line,value) {
    var items = lineItemOptions[group];
    if (items) {
      if(!items[line - 1]) {
        items[line - 1] = {};
      }
      items[line-1][name] = value;
    } else {
      lineItemOptions[group] = [];
      items = lineItemOptions[group];
      items[line - 1] = {};
      items[line-1][name] = value;
    }
  }

  var getLineItemValue = function(group,name,line) {
    var items = lineItemOptions[group];
    if (items) {
      return items[line - 1][name]
    }
    return undefined;
  }

  var selectNewLineItem = function(group) {
    if (group === 'addressbook') {
      currentLineItems[group] = {}
      currentLineItems[group]['id'] = id+'_'+lineItems.length;
      currentLineItems[group]['line'] = lineItems.length;
      currentLineItems[group]['addressbookaddress'] = [];
    } else {
      currentLineItems[group] = {}
      currentLineItems[group]['id'] = id+'_'+lineItems.length;
      currentLineItems[group]['line'] = lineItems.length;
    }
  }

  var createCurrentLineItemSubrecord = function(sublist,fldname) {
    var subRecord = new nlobjSubRecord(fldname);
    currentLineItems[sublist][fldname].push(subRecord);
    return subRecord;
  }

  var selectLineItem = function(group, line) {
    var items = lineItemOptions[group];
    if (items) {
      currentLineItems[group] = items[line - 1];
    } else {
      throw new Error('NETSIM ERROR: Group ' + group + ' has not been created.');
    }
  }

  var viewCurrentLineItemSubrecord = function(sublist,fldname) {
    return currentLineItems[sublist][fldname][0]
  }

  var setCurrentLineItemValue = function(group,name,value) {
    currentLineItems[group][name] = value
  }

  var commitLineItem = function(group,ignoreRecalc) {
    var items = lineItemOptions[group];
    var currentItem = currentLineItems[group];
    if (items && currentItem) {
      items.push(currentLineItems[group]);
    } else if (currentItem) {
      items = [];
      items.push(currentItem);
      lineItemOptions[group] = items;
    }
  }

  var getRecordType = function() {
    return type
  }

  var getId = function() {
    return id
  }

  var getField = function(fldnam) {
    for(var i = 0; i < fields.length; i++) {
      var field = fields[i]
      if(field.getName() == fldnam) {
        return field;
      }
    }
  }

  //This funtion is for netsim use only, do not use as part of a suitescript
  //as it is not part of the netsuite api.
  var addField = function(name,type,label,source,group) {
    fields.push(new nlobjField(name));
  }

  //This funtion is for netsim use only, do not use as part of a suitescript
  //as it is not part of the netsuite api.
  var transform = function(transformType, newRecordId) {
    var clonedLineItems = clone(lineItemOptions)
    var clonedRecord = nlobjRecord(transformType, newRecordId)

    var clonedItemKeys = Object.keys(clonedLineItems);
    for(var i = 0; i < clonedItemKeys.length; i++) {
      var item = clonedItemKeys[i];
      var lineItems = clonedLineItems[item];
      for (var j = 0 ; j < lineItems.length ; j ++) {
        clonedRecord.selectNewLineItem(item);
        var lineItemKeys = Object.keys(lineItem)
        for (var x = 0 ; x < lineItemKeys.length ; x ++) {
          var name = lineItemKeys[x]
          var value = lineItem[name]

          clonedRecord.setCurrentLineItemValue(item, name, value)
        }
        clonedRecord.commitLineItem(item)
      }
    }
    return clonedRecord
  }

  var setAllFieldValues = function(values) {
    fieldValues = Object.assign({}, values);
  }

  var setAllFields = function(newFields) {
    fields = fields.slice();
  }

  var setAllCurrentLineItems = function(lineItems) {
    currentLineItems = Object.assign({}, lineItems);
  }

  var setAllLineItemOptions = function(options) {
    lineItemOptions = Object.assign({}, options);
  }

  var setId = function(newId) {
    id = newId;
  }

  var copy = function() {
    var record = nlobjRecord(type);
    record.setAllFieldValues(fieldValues);
    record.setAllFields(fields);
    record.setAllCurrentLineItems(currentLineItems);
    record.setAllLineItemOptions(lineItemOptions);
    record.setId(id);
    return record;
  }

  return {
    setFieldValue : setFieldValue,
    getFieldValue : getFieldValue,
    getLineItemCount : getLineItemCount,
    setLineItemValue : setLineItemValue,
    getLineItemValue : getLineItemValue,
    selectNewLineItem : selectNewLineItem,
    setCurrentLineItemValue : setCurrentLineItemValue,
    commitLineItem : commitLineItem,
    getRecordType : getRecordType,
    getId : getId,
    transform : transform,
    createCurrentLineItemSubrecord:createCurrentLineItemSubrecord,
    getField:getField,
    addField:addField,
    selectLineItem:selectLineItem,
    viewCurrentLineItemSubrecord:viewCurrentLineItemSubrecord,
    setAllFieldValues : setAllFieldValues,
    setAllFields : setAllFields,
    setAllCurrentLineItems : setAllCurrentLineItems,
    setAllLineItemOptions : setAllLineItemOptions,
    setId : setId,
    copy: copy,
  }

}

module.exports = nlobjRecord
