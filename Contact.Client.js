//LCM Group
//Contact.Client.js

function pageInit(type) //common type parameters are "create" and "edit"
{
	if (type == 'create')
	{
		var context = mlapiGetContext();
		var username = context.getName();

		alert("Hello " + username);

	}

}