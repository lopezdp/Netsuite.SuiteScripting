var Status = Status || {};

Status.emailEmployeeStatusChange = (function ()
	{
		// LCM Group
		// Admin needs a script that will send an email to the project supervisor 
		// when the status of an employee changes

		var UIoutput = {};

		function afterSubmit(type)
		{
			if(type == "delete")
			{
				return;
			}

			notifySupervisor();
		}

		function notifySupervisor()
		{
			var employee = nlapiGetNewRecord();
			var prevEmployee = nlapiGetOldRecord();

			if (didStatusChange(employee, prevEmployee))
			{
				sendNotification(employee);
			}
		}

		function didStatusChange(employee, prevEmployee)
		{
			var status = employee.getFieldValue("employeestatus");
			var prevStatus = prevEmployee.getFieldValue("employeestatus");

			return ((prevStatus || status) && (status !== prevStatus));
		}

		function sendNotification(employee)
		{
			var sender = nlapiGetUser();
			var supervisor = employee.getFieldValue("supervisor");
			var firstName = employee.getFieldValue("firstname");
			var lastName = employee.getFieldValue("lastname");
			var employeeStatus = employee.getFieldText("employeestatus");

			var subject = "Employee Satus Change Notification";
			var body = "The status of " + [firstName, lastName].join(" ") +
					" has changed to " + (employeeStatus || "blank");

			nlapiSendEmail(sender, supervisor, subject, body);
		}

		UIoutput.afterSubmit = afterSubmit;
		return UIoutput;
	}) ();