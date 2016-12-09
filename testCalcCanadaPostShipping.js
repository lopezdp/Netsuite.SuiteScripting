var TestLopez = TestLopez || {};

TestLopez.getCanadaRates = (function(){
	/**
	* Please develop a script that will allow us to click the "calculate" button 
	* in a SO (next to shipping cost field) under the shipping subtab and it will 
	* do an API call to the Canada Post to obtain real time rates. This should 
	* apply when Shipping methods ID = 5323, 5320 and 5322 are selected. 
	* Canada Post Credentials
	* User Name : ******
	* Password: ******
	* - use C197794 as test customer.
	* - Use SO form VW Sales Order Manager
	* - set department to retail
	* - set location = Warehouses : Canada
	* - item use PL-PAX2-BLK
	* - use 3400 Ridgeway Drive address for ship to address
	* - if saving the SO, under the billing tab set Payment Method to Cash. 
	*
	* Author: David P. Lopez 12/2016
	**/

	var output = {};

	/**
	* Event fired just before a 
	* database write operation
	*
	* @function beforeSubmit
	**/

	function beforeSubmit(type){

		var salesOrder = nlapiGetNewRecord();

		getCanadaPostRates(salesOrder);
	}

	//Query REST SERVICE
	//URI & FORMAT OF REQUEST
	//SUPPORTED VERBS GET POST PUT DELETE

	/** 
	* Development URI Endpoint 
	* ReST Request:
	* POST https://ct.soa-gw.canadapost.ca/rs/ship/price/{Accept}/{Content-Type}/{Authorization}/{Accept Language en-CA} + {QueryString}
	**/

	function getCanadaPostRates(salesOrder){
		// Check if Order is eligible for Canada Post shipping rates
		// done
		if(!hasEligibleShippingMethod(salesOrder)){
			nlapiLogExecution("AUDIT", "CP Shipping Method: ", "This order is not eligible for Canada Post Shipping"); //2
			return;
		}

		getRates(salesOrder);

		//addRates(salesOrder);
	}

	// done
	function hasEligibleShippingMethod(salesOrder){
		// 1st get value of selected shipping method
		// done
		var selectedShippingMethod = salesOrder.getFieldValue("shipmethod");
		nlapiLogExecution("DEBUG", "selectedShippingMethod: ", selectedShippingMethod); //1

		// return true if the selectedShippingMethod matches Method ID's == 5323, 5320, or 5322
		// done
		return (selectedShippingMethod == 1008 || selectedShippingMethod == 1008 || selectedShippingMethod == 1008);
	}

	function addRates(salesOrder){
		getRates(salesOrder);
		

		//salesOrder.setLineItemValue();

		// etc etc etc
		// not complete!!!!!!
	}

	function getRates(salesOrder){
		nlapiLogExecution("AUDIT", "CP Getting Rates: ", "***Connecting to Canada Post API***");
		/**
		* Canada Post API credentials:
		* Base64 encoding needed
		**/
		var apiKey = nlapiEncrypt("***************:******************", "base64");
		nlapiLogExecution("AUDIT", "EncodedApiKey: ", apiKey);

		// assign value to shipToCountry;
		var shipToCountry = salesOrder.getFieldValue("shipcountry");
		nlapiLogExecution("AUDIT", "shipToCountry: ", shipToCountry);
		nlapiLogExecution("AUDIT", "shipToCountry Type: ", typeof(shipToCountry));

		// assign value to postalCode;
		var postalCode = hasCorrectPostalCodeFormat(salesOrder.getFieldValue("shipzip"));
		nlapiLogExecution("AUDIT", "postalCode: ", postalCode);
		nlapiLogExecution("AUDIT", "postalCode Type: ", typeof(postalCode));

		// assign value to zipCode;
		var zipCode = parseInt(hasCorrectPostalCodeFormat(salesOrder.getFieldValue("shipzip")));
		nlapiLogExecution("AUDIT", "zipCode: ", zipCode);		
		nlapiLogExecution("AUDIT", "zipCode Type: ", typeof(zipCode));	
		
		// access weight from each item in item sublist and accumulate using totalWeight
		var itemID;
		var itemWeightLbs;
		var totalWeightKg = 0;
		var itemCount = salesOrder.getLineItemCount("item");

		for(var i = 1; i <= itemCount; i++){
			itemID = salesOrder.getLineItemValue("item", "item", i);
			itemWeightLbs = nlapiLookupField("item", itemID, "weight");
			totalWeightKg += convertWeight(parseInt(itemWeightLbs));
		}
		nlapiLogExecution("AUDIT", "totalWeightKg: ", totalWeightKg);
		nlapiLogExecution("AUDIT", "totalWeightKg Type: ", typeof(totalWeightKg));

		// get the originating postalCode from the location record
		// Format ANANAN
		var originPostalCode = hasCorrectPostalCodeFormat(nlapiLookupField("location", "name", "zip"));
		nlapiLogExecution("AUDIT", "originPostalCode: ", originPostalCode);
		nlapiLogExecution("AUDIT", "originPostalCode Type: ", typeof(originPostalCode));

		// XML Request Template
		var quoteType = "counter";
		var xml;
		if(shipToCountry == "US"){
			xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
			"<mailing-scenario xmlns=\"http://www.canadapost.ca/ws/ship/rate-v3\">" +
				"<quote-type>" + quoteType + "</quote-type>" + 
				"<parcel-characteristics>" +
					"<weight>" + totalWeightKg + "</weight>" + 
				"</parcel-characteristics>" +
				"<origin-postal-code>" + originPostalCode + "</origin-postal-code>" +
				"<destination>" +
					"<united-states>" +
						"<zip-code>" + zipCode + "</zip-code>" +
					"</united-states>" +
				"</destination>" +
			"</mailing-scenario>";
		}else if(shipToCountry == "CA"){
			xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
			"<mailing-scenario xmlns=\"http://www.canadapost.ca/ws/ship/rate-v3\">" +
				"<quote-type>" + quoteType + "</quote-type>" + 
				"<parcel-characteristics>" +
					"<weight>" + totalWeightKg + "</weight>" +
				"</parcel-characteristics>" +
				"<origin-postal-code>" + originPostalCode + "</origin-postal-code>" +
				"<destination>" +
					"<domestic>" +
						"<postal-code>" + postalCode + "</postal-code>" +
					"</domestic>" +
				"</destination>" +
			"</mailing-scenario>";
		}		
		//ENDPOINT POST https://XX/rs/ship/price
		// XX (Development): ct.soa-gw.canadapost.ca*
		// XX (Production): soa-gw.canadapost.ca
		var url = "https://ct.soa-gw.canadapost.ca/rs/ship/price"; // + accept + "/" + contentType + "/" + authorization + "/" + acceptLanguage ;
		// RBody used for POST Request
		var postData = nlapiStringToXML(xml);
		nlapiLogExecution("AUDIT", "xml: ", xml);
		// header variables
		// application/vnd.cpc.ship.rate-v3+xml (Note: */* in place of the header value will return an error)
		var xmlRequest = "/application/vnd.cpc.ship.rate-v3+xml";
		// application/vnd.cpc.ship.rate-v3+xml (Note: */* in place of the header value will return an error)
		var isXml = "/application/vnd.cpc.ship.rate-v3+xml";
		// Basic {Base64 encoding of userid:password}
		var credentials = "Basic " + apiKey;
		nlapiLogExecution("AUDIT", "credentials: ", credentials);
		nlapiLogExecution("AUDIT", "credentials Type: ", typeof(credentials));
		// en-CA or fr-CA
		var isEnglish = "en-CA";
		// POST Request Headers
		var headers = { "Accept" : xmlRequest, 
						"Content-Type" : isXml, 
						"Authorization" : credentials, 
						"Accept-language" : isEnglish 
					};
		// Call nlapiRequestURL(url, postdata, headers, callback, httpMethod) and save response
		var response = nlapiRequestURL(url, postData, headers);
		nlapiLogExecution("AUDIT", "response: ", response);

		var responseHeaderTitles = response.getAllHeaders();
		var responseHeaderValues = [];


		for(var header = 0; header < responseHeaderTitles.length; header++){

			responseHeaderValues.push(response.getHeader(responseHeaderTitles[header]));
			nlapiLogExecution("AUDIT", responseHeaderTitles[header] + ": " , responseHeaderValues[header]);

		}

		var responseBody = response.getBody();
		nlapiLogExecution("AUDIT", "responseBody: ", responseBody);
		var responseCode = response.getCode();
		nlapiLogExecution("AUDIT", "responseCode: ", responseCode);

		



		//parse xml in javascript with xpath
		//you get xml as a string
		//pass it to NS xml api --> turns string into xml doc object
		//on xml object use Xpath
	}

	function convertWeight(weightInLbs){
		var Lbs = 2.2;
		var kg = weightInLbs / Lbs;
		return Math.round(kg*1000)/1000;
	}

	function hasCorrectPostalCodeFormat(postalCode){
		// Format ANANAN
		var newPostalCode = postalCode.replace(/\s+/g, '');
		return newPostalCode.toUpperCase();
	}



		


	

	

	output.beforeSubmit = beforeSubmit;
	return output;
}) ();



/*
Status Code:                400 Bad Request
Content-Type:                   text/xml; charset=UTF-8
Date:                   Thu, 08 Dec 2016 22:44:55 GMT
Server:               Oracle-iPlanet-Web-Server/7.0
Transfer-Encoding:              chunked
X-backside-transport:                FAIL FAIL,FAIL FAIL
X-client-ip:                         10.229.109.82
X-global-transaction-id:            94113857
*/
