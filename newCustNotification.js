/**
* LCM Group
* NewCustNotifcation.js
* Module Notifies Owner when a new customer record is created
*/

// create new namespace
var custNotify = custNotify || {};

/**
* The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
* @appliedtorecord recordType
*
* @param {String} type Operation types: create, edit, delete, xedit,
*					 approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
*					 pack, ship (IF only)
*					 dropship, specialorder, ordertimes, (PO only)
*					 paybills (vendor payments)
*
* @returns {Void}
*/

custNotify.sendEmail = function (type)
{
	if(type != 'create')
	{
		return;
	}

	var custRecord = nlapiGetNewRecord();

	var context = nlapiGetContext();

	var employeeRecord = nlapiLoadRecord('Employee', context.getUser());

	var recipient = 'davids@uribeconstruction.com';
	var subject = 'New Customer Alert!';
	var body = '<b>New NetSuite Customer Record</b>'
		+ '<br/>Customer Name: '
		+ '<br/>' + custRecord.getFieldValue('entityid')
		+ '<br/><b>Created By: </b>'
		+ '<br/>' + employeeRec.getFieldValue('firstname');

	nlapiSendEmail(context.getUser(), recipient, subject, body);





};