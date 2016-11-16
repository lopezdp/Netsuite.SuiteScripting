var Resource = Resource || {};

Resource.projectLaborCosts = (function ()
	{
		// Admin needs to ensure that employees working on a project have an 
		// associated labor cost

		var UIoutput = {};

		function beforeSubmit(type)
		{
			if (!isEmployeeValid(nlapiGetNewRecord()))
			{
				throw nlapiCreateError("LCM_ERROR", "Employee data is not valid", true);
			}
		}

		function isEmployeeValid(employee)
		{
			return (!isProjectResource(employee) || hasValidLaborCost(employee));
		}

		function isProjectResource(employee)
		{
			return (employee.getFieldValue("isjobresource") === "T");
		}

		function hasValidLaborCost(employee)
		{
			var laborCost = parseFloat(employee.getFieldValue("laborcost"));

			return (Boolean(laborcost) && (laborcost > 0));
		}

		UIoutput.beforeSubmit = beforeSubmit;

		return UIoutput;

	}) ();