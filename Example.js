jQuery(document).ready(function () {
	$("#d").easySetting.beforeSubmit = function () {
		if ($("#d").isFormValidated())
			alert("hello, this is alert before form submit");
	};
	$("#d").easySetting.afterSubmit = function () {
			alert("hello, this is alert after form submitted, the result of form after validate is "+$("#d").isFormValidated());
	};
	$("#e").easySetting.beforeSubmit = function () {
			alert("hi, this is alert before form submit, this form will not be submit until you made it by your code");
	};
	$("#button1").click(function(){
		$("#f1").hideThisInputValidatePopup();
	});
	$("#button2").click(function(){
		$("#f1").showThisInputValidatePopup();
	});
	$("#button3").click(function(){
		$("html").hideAllValidatePopup();
	});
	$("#button4").click(function(){
		$("html").showAllValidatePopup();
	});
});