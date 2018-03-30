var clone = require('clone')
var nlobjField = require('./nlobjField.js')
var nlobjSubRecord = require('./nlobjSubRecord.js')

var nlobjRecord = function (recordtype, internalid) {

  if(!internalid) {
    internalid = parseInt((Math.random() * 100), 10)
  }

  var record = {};
  record.id = internalid;
  record.type = recordtype;
  record.fields = [];
  record.fieldValues = {};
  record.currentLineItems =  {
    'item': {},
    'addressbook': {},
    'contactroles': {},
  };
  record.lineItemOptions = {
    'item' : [],
    'addressbook' : [],
    'contactroles' : [],
  }

  record.fieldValues.internalid = internalid;

  return record;
}


  nlobjRecord.prototype.setFieldValue = function(name, value) {
    this.fieldValues[name] = value
  }

  nlobjRecord.prototype.getFieldValue = function(name) {
    if(typeof this.fieldValues[name] !== 'undefined') {
      return this.fieldValues[name]
    }

    return undefined;
  }

  nlobjRecord.prototype.getFieldText = function(name) {
    //in Netsuite, this translates the internal id of a text value into the text it represents.  We're simplifying it here.
    return this.fieldValues[name];
  }

  nlobjRecord.prototype.getLineItemCount = function(group) {
    var items = this.lineItemOptions[group];
    if (items) {
      return items.length;
    }
    return 0;
  }

  nlobjRecord.prototype.setLineItemValue = function(group,name,line,value) {
    var items = this.lineItemOptions[group];
    if (items) {
      if(!items[line - 1]) {
        items[line - 1] = {};
      }
      items[line-1][name] = value;
    } else {
      this.lineItemOptions[group] = [];
      items = this.lineItemOptions[group];
      items[line - 1] = {};
      items[line-1][name] = value;
    }
  }

  nlobjRecord.prototype.getLineItemValue = function(group,name,line) {
    var items = this.lineItemOptions[group];
    if (items) {
      return items[line - 1][name]
    }
    return undefined;
  }

  nlobjRecord.prototype.selectNewLineItem = function(group) {
    var currentLineItems = this.currentLineItems;
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

  nlobjRecord.prototype.createCurrentLineItemSubrecord = function(sublist,fldname) {
    var subRecord = new nlobjSubRecord(fldname);
    this.currentLineItems[sublist][fldname].push(subRecord);
    return subRecord;
  }

  nlobjRecord.prototype.selectLineItem = function(group, line) {
    var items = this.lineItemOptions[group];
    if (items) {
      this.currentLineItems[group] = items[line - 1];
    } else {
      throw new Error('NETSIM ERROR: Group ' + group + ' has not been created.');
    }
  }

  nlobjRecord.prototype.viewCurrentLineItemSubrecord = function(sublist,fldname) {
    return this.currentLineItems[sublist][fldname][0]
  }

  nlobjRecord.prototype.setCurrentLineItemValue = function(group,name,value) {
    this.currentLineItems[group][name] = value
  }

  nlobjRecord.prototype.commitLineItem = function(group,ignoreRecalc) {
    var items = this.lineItemOptions[group];
    var currentItem = this.currentLineItems[group];
    if (items && currentItem) {
      items.push(currentItem);
    } else if (currentItem) {
      items = [];
      items.push(currentItem);
      this.lineItemOptions[group] = items;
    }
  }

  nlobjRecord.prototype.getRecordType = function() {
    return this.type
  }

  nlobjRecord.prototype.getId = function() {
    return this.id
  }

  nlobjRecord.prototype.getField = function(fldnam) {
    for(var i = 0; i < fields.length; i++) {
      var field = this.fields[i]
      if(field.getName() === fldnam) {
        return field;
      }
    }
  }

  //This funtion is for netsim use only, do not use as part of a suitescript
  //as it is not part of the netsuite api.
  nlobjRecord.prototype.addField = function(name,type,label,source,group) {
    this.fields.push(new nlobjField(name));
  }

  //This funtion is for netsim use only, do not use as part of a suitescript
  //as it is not part of the netsuite api.
  nlobjRecord.prototype.transform = function(transformType, newRecordId) {
    var clonedLineItems = clone(this.lineItemOptions)
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

  // var setAllFieldValues = function(values) {
  //   fieldValues = Object.assign({}, values);
  // }
  //
  // var setAllFields = function(newFields) {
  //   fields = fields.slice();
  // }
  //
  // var setAllCurrentLineItems = function(lineItems) {
  //   currentLineItems = Object.assign({}, lineItems);
  // }
  //
  // var setAllLineItemOptions = function(options) {
  //   lineItemOptions = Object.assign({}, options);
  // }
  //
  // var setId = function(newId) {
  //   id = newId;
  // }

  nlobjRecord.prototype.copy = function() {
    var newRecord = Object.create(nlobjRecord.prototype);
    Object.assign(newRecord, this);
    return newRecord;
  }

module.exports = nlobjRecord
