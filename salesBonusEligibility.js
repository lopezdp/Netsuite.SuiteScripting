var Bonus = Bonus || {};

Bonus.bonusEligibility = (function () 
{
	var UIoutput = {};

	function beforeLoad(type, form, request)
	{
		if (type == "delete")
		{
			return;
		}

		if (wasTriggeredFromUi(nlapiGetContext()))
		{
			showBonusEligibility(form);
		}
	}

	function wasTriggeredFromUi(context)
	{
		return (context.getExecutionContext() === "userinterface");
	}

	function showBonusEligibility(form)
	{
		var field = form.addField("custpage_is_bonus_eligible", "checkbox", "Eligible for Bonus?");
		field.setDefaultValue(isEligibleForBonus() ? "T" : "F");
	}

	function isEligibleForBonus()
	{
		return true;
	}

	UIoutput.beforeLoad = beforeLoad;
	return UIoutput;
}) ();