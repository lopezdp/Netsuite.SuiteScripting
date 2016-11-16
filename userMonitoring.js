// LCM Group
// Admin wants to monitor what users are doing at each interface
// userMonitoring.js

var Monitor = Monitor || {};

Monitor.userMonitoring = (function () 
{
	var UIoutput = {};

	function beforeLoad(type, form, request)
	{
		nlapiLogExecution("MONITOR", "Monitor.userMonitoring.beforeLoad",
				"type=" + type);
	}

	UIoutput.beforeLoad = beforeLoad;
	return UIoutput;
})