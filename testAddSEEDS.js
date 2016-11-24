var TestLopez = TestLopez || {};

TestLopez.addSeeds = (function(){
	/**
	* Admin Needs a User Event script that will add item GS-GPRO-SDB-SEEDS to
	* any Sales Order that contains the item GS-GPRO-SDB, once the order is SAVED.
	*
	*
	*	- The price for line item GS-GPRO-SDB should be $0
	*	- This should only apply if field "custbody_replace_order" is set to False. 
	*	- This should only apply If the SO department is Retail (Internal ID = 2) 
	*		and the subsidiary is Warehouse Goods LLC (Internal ID = 1). 
	*
	*
	* Author: David P. Lopez 11/2016
	**/

	var output = {};
	var lineCount;
	var GS_GPRO_SDB_Qty;

	function beforeSubmit(type){
		if(type != "create"){
			return;
		}
		
		var salesOrder = nlapiGetNewRecord();

		addSDS_SEEDS(salesOrder);
	}

	function addSDS_SEEDS(salesOrder){
		
		if(qualifiedSO(salesOrder)){
			addItem(salesOrder);
		}
	}

	function qualifiedSO(salesOrder){
		//module logic
		var department = salesOrder.getFieldValue("department");
		//nlapiLogExecution("DEBUG", "department Recorded?: ", "dept = " + department);

		var subsidiary = salesOrder.getFieldValue("subsidiary");
		//nlapiLogExecution("DEBUG", "subsidiary Recorded?: ", "subsidiary = " + subsidiary);

		var replaceOrder = salesOrder.getFieldValue("custbody_replace_order");
		//nlapiLogExecution("DEBUG", "replacement Recorded?: ", "replace = " + replaceOrder);

		// if subsidiaryID == 1 && departmentID == 2 && custbody_replace_order == False then return true
		return (subsidiary == 1 && department == 2 && replaceOrder === "F")
	}

	function addItem(salesOrder){
		//module logic
		//check if GS_GPRO_SDB exists on SO
		if(checkItem(salesOrder)){

			//insert new line item
			salesOrder.selectNewLineItem("item");

			//set the value of the item to be added to "GS_GPRO_SDB_SEEDS"
			salesOrder.setCurrentLineItemValue("item", "item", 8465); //GS_GPRO_SDB_SEEDS InternalID == 8465

			//set the value of the rate for the item to be added to zero
			salesOrder.setCurrentLineItemValue("item", "rate", 0);

			//set the value of the quantity for the item to be added to the same amount as GS_GPRO_SDB_Qty
			salesOrder.setCurrentLineItemValue("item", "quantity", GS_GPRO_SDB_Qty);
			
			//commit the changes to the subList
			salesOrder.commitLineItem("item");

			//Submit the record to commit all changes to the database
			//nlapiSubmitRecord(salesOrder, true); 
		}

		//function will never execute here...	
	}

	function checkItem(salesOrder){
		lineCount = salesOrder.getLineItemCount("item");
		//nlapiLogExecution("DEBUG", "Line Count Recorded?: ", "Count = " + lineCount);
		var line;

		for(var i = 1; i <= lineCount; i++){

			line = salesOrder.getLineItemValue("item", "item", i);
			//nlapiLogExecution("DEBUG", "Line Item InternalID Recorded?: ", "ID = " + line);

			//GS_GPRO_SDB InternalID == 8528
			if(line === "8528"){

				//initialize globa var with qty
				GS_GPRO_SDB_Qty = salesOrder.getLineItemValue("item", "quantity", i);
				//nlapiLogExecution("DEBUG", "Item Quantity Recorded?: ", "Qty = " + GS_GPRO_SDB_Qty);

				return true;
			}
		}
		return false;
	}

	output.beforeSubmit = beforeSubmit;
	return output;
}) ();




