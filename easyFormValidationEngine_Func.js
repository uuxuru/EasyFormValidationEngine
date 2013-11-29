/*
 * easy Form Validation Engine
 *
 *
 * Copyright(c)2013, Nguyen Van Tuan
 * https : //github.com/uuxuru/EasyFormValidationEngine
 *
 * Function packet
 * Version : 1.0
 *
 * Licensed under the GNU License
 *
 */

var promptStyleList = {
	easyDefault : {
		name : "easyDefault",
		position : "",
		defaultPosition : "topLeft",
		show : function (inputObject, inputState, promptMessage) {
			if (inputObject.easyPrototype.promtpPosition != "") {
				promptStyleList.easyDefault.position = inputObject.easyPrototype.promtpPosition;
			} else if (typeof($(inputObject).closest("form").get(0).easyPrototype) != "undefined") { // if this form not defined an easy class
				promptStyleList.easyDefault.position = $(inputObject).closest("form").get(0).easyPrototype.promtpPosition;
			} else {
				promptStyleList.easyDefault.position = promptStyleList.easyDefault.defaultPosition;
			}
			var redOrGreen = inputState ? "Green" : "Red";
			var arrow;
			var containner = '<div class="easyValidBoxContainner ' + inputObject.easyPrototype.easyID + '">';
			var box = '<div class="easyValidBoxMessage easy' + redOrGreen + '">' + promptMessage + ' </div>';

			var topRefex = /(top)+/;
			if (promptStyleList.easyDefault.position.match(topRefex) != null) {
				arrow = '<div class="easyArrow easyTopArrow"><div class="easy' + redOrGreen + ' line10"></div><div class="easy' + redOrGreen + ' line9"></div><div class="easy' + redOrGreen + ' line8"></div><div class="easy' + redOrGreen + ' line7"></div><div class="easy' + redOrGreen + ' line6"></div><div class="easy' + redOrGreen + ' line5"></div><div class="easy' + redOrGreen + ' line4"></div><div class="easy' + redOrGreen + ' line3"></div><div class="easy' + redOrGreen + ' line2"></div><div class="easy' + redOrGreen + ' line1"></div></div>';
				inputObject.easyPrototype.promptDiv = containner + box + arrow + '</div>';
			} else {
				arrow = '<div class="easyArrow easyBottomArrow"><div class="easy' + redOrGreen + ' line1"></div><div class="easy' + redOrGreen + ' line2"></div><div class="easy' + redOrGreen + ' line3"></div><div class="easy' + redOrGreen + ' line4"></div><div class="easy' + redOrGreen + ' line5"></div><div class="easy' + redOrGreen + ' line6"></div><div class="easy' + redOrGreen + ' line7"></div><div class="easy' + redOrGreen + ' line8"></div><div class="easy' + redOrGreen + ' line9"></div><div class="easy' + redOrGreen + ' line10"></div></div>';
				inputObject.easyPrototype.promptDiv = containner + arrow + box + '</div>';
			}
			$("html").append(inputObject.easyPrototype.promptDiv);
			promptStyleList.easyDefault.orderly();

			return true;
		},
		orderly : function () {
			$("input").not("[type='submit']").each(function () {
				if (this.easyPrototype.promtpPosition != "") {
					promptStyleList.easyDefault.position = this.easyPrototype.promtpPosition;
				} else if (typeof($(this).closest("form").get(0).easyPrototype) != "undefined") {
					promptStyleList.easyDefault.position = $(this).closest("form").get(0).easyPrototype.promtpPosition;
				} else {
					promptStyleList.easyDefault.position = promptStyleList.easyDefault.defaultPosition;
				}
				
				var thiseasyID = this.easyPrototype.easyID;
				if ($("." + thiseasyID).length > 0) {
					var thisPrompt = $("." + thiseasyID);
					var inputLeft = $(this).offset().left;
					var inputWidth = $(this).width();
					var inputTop = $(this).offset().top;
					var inputHeight = $(this).height();

					var promptWidth = thisPrompt.width();
					var promptHeight = thisPrompt.height();

					var newPromptLeft = 100;
					var newPromptTop = 100;

					var topRefex = /(top)+/;
					if (promptStyleList.easyDefault.position.match(topRefex) != null) {
						newPromptTop = inputTop - promptHeight + 42;
					} else {
						newPromptTop = inputTop + promptHeight + 12;
					}

					var rightRefex = /[a-z0-9]+(Right)+/;
					if (promptStyleList.easyDefault.position.match(rightRefex) != null) {
						newPromptLeft = inputLeft + inputWidth - 30;
					} else {
						newPromptLeft = inputLeft;
					}

					thisPrompt.css({
						"top" : newPromptTop,
						"left" : newPromptLeft
					});

				}
			});
		},
	},
};
function easyFormPrototype() {
	this.func = {
		beforeSubmit : {
			userDefined : false,
			validatevalue : "",
			isValidated : true,
			message : "",
			onTyping : false,
			onLeave : false,
			onSubmit : true,
			when : "beforeSubmit",
		},
		afterSubmit : {
			userDefined : false,
			validatevalue : "",
			isValidated : true,
			message : "",
			onTyping : false,
			onLeave : false,
			onSubmit : true,
			when : "afterSubmit",
		},
		ajax : {
			userDefined : false,
			validatevalue : "",
			isValidated : true,
			message : "",
			onTyping : false,
			onLeave : false,
			onSubmit : true,
			when : "beforeSubmit",
		},
	};

	//option
	this.tagName = "form";
	this.fullClassName = "";
	this.promtpPosition = "topRight"; //or bottom[left,right], beside[left,right]
	this.promptDiv = "";
	this.easyID = "";
	this.isValidated = true;
	this.scroll = true;
	this.doNotAutoSubmit = false;
	this.isAjaxSubmitWaiting = false;

	//function
	this.fafterSubmit = function (o) {
		$(o).easySetting.afterSubmit();
		var ret = Array();
		ret["isMatch"] = true;
		ret["message"] = "";
		return ret;
	};

	this.fbeforeSubmit = function (o) {
		$(o).easySetting.beforeSubmit();
		var ret = Array();
		ret["isMatch"] = true;
		ret["message"] = "";
		return ret;
	};

	this.fajax = function (o) {
		// Set ajax submit waiting = true
		o.easyPrototype.isAjaxSubmitWaiting = true;

		// colect all input parameter in form // o is form
		var data = "";
		$(o).find("input").not("[type='submit']").each(function () {
			// reset last result
			this.easyPrototype.validateFromServer =true;
			this.easyPrototype.messageFromServer ="";
			if (this.id != "") {
				data += this.id + "=" + this.value + "&";
			}
		});

		var url = $(o).attr("action");
		var ret = Array();
		ret["isMatch"] = "";
		ret["message"] = "";

		$.ajaxSetup({
			async : false,
			type : $(o).attr("method"),
		});
		$.ajax({
			url : url,
			data : data + 'type=form',
		});

		// waiting for ajax response
		var r = 0;
		while (o.easyPrototype.isAjaxSubmitWaiting) {
			if (r++ == 1000000) {
				alert(easyLanguage.connectionError);
				o.easyPrototype.isAjaxSubmitWaiting = false;
				break;
			}
		}
		ret["isMatch"] = o.easyPrototype.isValidated;
		return ret;
	};
};
function easyInputPrototype() {
	this.func = {
		required : {
			userDefined : false,
			validatevalue : "",
			isValidated : true,
			message : "",
			onTyping : false,
			onLeave : true,
			onSubmit : true,
		},
		onlyNumber : {
			userDefined : false,
			validatevalue : "",
			isValidated : true,
			message : "",
			onTyping : true,
			onLeave : true,
			onSubmit : true,
		},
		onlyInteger : {
			userDefined : false,
			validatevalue : "",
			isValidated : true,
			message : "",
			onTyping : true,
			onLeave : true,
			onSubmit : true,
		},
		onlyText : {
			userDefined : false,
			validatevalue : "",
			isValidated : true,
			message : "",
			onTyping : true,
			onLeave : true,
			onSubmit : true,
		},
		onlyTextAndNumber : {
			userDefined : false,
			validatevalue : "",
			isValidated : true,
			message : "",
			onTyping : true,
			onLeave : true,
			onSubmit : true,
		},
		onlyUnicodeLetterNumber : {
			userDefined : false,
			validatevalue : "",
			isValidated : true,
			message : "",
			onTyping : true,
			onLeave : true,
			onSubmit : true,
		},
		onlyEmail : {
			userDefined : false,
			validatevalue : "",
			isValidated : true,
			message : "",
			onTyping : true,
			onLeave : true,
			onSubmit : true,
		},
		equalWithID : {
			userDefined : false,
			validatevalue : "",
			isValidated : true,
			message : "",
			onTyping : false,
			onLeave : true,
			onSubmit : true,
		},
		lagerId : {
			userDefined : false,
			validatevalue : "",
			isValidated : true,
			message : "",
			onTyping : false,
			onLeave : true,
			onSubmit : true,
		},
		smallThanId : {
			userDefined : false,
			validatevalue : "",
			isValidated : true,
			message : "",
			onTyping : false,
			onLeave : true,
			onSubmit : true,
		},
		dateTimeOnly : {
			userDefined : false,
			validatevalue : "",
			isValidated : true,
			message : "",
			onTyping : false,
			onLeave : true,
			onSubmit : true,
		},
		dateOnly : {
			userDefined : false,
			validatevalue : "",
			isValidated : true,
			message : "",
			onTyping : false,
			onLeave : true,
			onSubmit : true,
		},
		minSize : {
			userDefined : false,
			validatevalue : "",
			isValidated : true,
			message : "",
			onTyping : true,
			onLeave : true,
			onSubmit : true,
		},
		maxSize : {
			userDefined : false,
			validatevalue : "",
			isValidated : true,
			message : "",
			onTyping : true,
			onLeave : true,
			onSubmit : true,
		},
		maxDigitvalue : {
			userDefined : false,
			validatevalue : "",
			isValidated : true,
			message : "",
			onTyping : true,
			onLeave : true,
			onSubmit : true,
		},
		minDigitvalue : {
			userDefined : false,
			validatevalue : "",
			isValidated : true,
			message : "",
			onTyping : true,
			onLeave : true,
			onSubmit : true,
		},
		ajax : {
			userDefined : false,
			validatevalue : "",
			isValidated : true,
			message : "",
			onTyping : false,
			onLeave : true,
			onSubmit : false,
		},
	};

	//option
	this.tagName = "input";
	this.preTypingValue = ""; //if preTypingvalue == value: no need to validate
	this.preValue = ""; //if prevalue == value: no need to validate
	this.fullClassName = "";
	this.promtpPosition = ""; // This variable is set prompt for only an input
	this.promptDiv = "";
	this.easyID = "";
	this.isValidated = true;
	this.ajaxWattingMessage = easyLanguage.ajaxWattingMessage;
	this.isAjaxSubmitWaiting = false;
	this.messageFromServer = ""; // this is message from submit function response
	this.validateFromServer = true; // this is validate value from submit function response
	this.promptStyle = "easyArrow";

	//function
	this.frequired = function (o) {
		var ret = Array();
		ret["isMatch"] = false;
		ret["message"] = "";

		var regex = /[\S]/;
		if (o.value.match(regex) != null) {
			ret["isMatch"] = true;
			ret["message"] = "";
		} else {
			ret["isMatch"] = false;
			ret["message"] = easyLanguage.requiredError;
		}
		return ret;
	};

	this.fonlyNumber = function (o) {
		var ret = Array();
		ret["isMatch"] = false;
		ret["message"] = "";
		var regex = /^[\-\+]?((([0-9]{1,3})([,][0-9]{3})*)|([0-9]+))?([\.]([0-9]+))?$/;

		if (o.value.match(regex) != null) {
			ret["isMatch"] = true;
			ret["message"] = "";
		} else {
			ret["isMatch"] = false;
			ret["message"] = easyLanguage.onlyNumberError;
		}
		return ret;
	};

	this.fonlyInteger = function (o) {
		var ret = Array();
		ret["isMatch"] = false;
		ret["message"] = "";

		var regex = /^[\-\+]?\d+$/;
		if (o.value.match(regex) != null) {
			ret["isMatch"] = true;
			ret["message"] = "";
		} else {
			ret["isMatch"] = false;
			ret["message"] = easyLanguage.onlyIntegerError;
		}
		return ret;
	};

	this.fonlyText = function (o) {
		var ret = Array();
		ret["isMatch"] = false;
		ret["message"] = "";

		var regex = /^[a-zA-Z\ \']+$/;
		if (o.value.match(regex) != null) {
			ret["isMatch"] = true;
			ret["message"] = "";
		} else {
			ret["isMatch"] = false;
			ret["message"] = easyLanguage.onlyTextError;
		}
		return ret;
	};

	this.fonlyTextAndNumber = function (o) {
		var ret = Array();
		ret["isMatch"] = false;
		ret["message"] = "";

		var regex = /^[0-9a-zA-Z]+$/;
		if (o.value.match(regex) != null) {
			ret["isMatch"] = true;
			ret["message"] = "";
		} else {
			ret["isMatch"] = false;
			ret["message"] = easyLanguage.onlyTextAndNumberError;
		}
		return ret;
	};

	this.fonlyUnicodeLetterNumber = function (o) {
		var ret = Array();
		ret["isMatch"] = false;
		ret["message"] = "";

		var regex = /^[0-9a-zA-Zàá _ảãạéèẻẽẹúùủũụóòỏõọíìỉĩịýỷỹỵđÀÁẢÃẠÉÈẺẼẸÚÙỦŨỤÓÒỎÕỌÍÌỈĨỊÝỶỸỴĐấầẩẫậắằẳẵặứừửữựốồổỗộớờởỡợếềểễệẤẦẨẪẬẮẰẲẴẶỨỪỬỮỰỐỒỔỖỘỚỜỞỠỢẾỀỂỄỆâăêưôơÂĂÊƯÔƠ]+$/;
		if (o.value.match(regex) != null) {
			ret["isMatch"] = true;
			ret["message"] = "";
		} else {
			ret["isMatch"] = false;
			ret["message"] = easyLanguage.onlyUnicodeLetterNumberError;
		}
		return ret;
	};

	this.fonlyEmail = function (o) {
		var ret = Array();
		ret["isMatch"] = false;
		ret["message"] = "";

		var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (o.value.match(regex) != null) {
			ret["isMatch"] = true;
			ret["message"] = "";
		} else {
			ret["isMatch"] = false;
			ret["message"] = easyLanguage.onlyEmailError;
		}
		return ret;
	};

	this.fequalWithID = function (o) {
		var ret = Array();
		ret["isMatch"] = false;
		ret["message"] = "";
		var value = $("#" + o.easyPrototype.lagerId.validatevalue).val();
		if (o.value == value) {
			ret["isMatch"] = true;
			ret["message"] = easyLanguage.equalWithIDSuccess;
		} else {
			ret["isMatch"] = false;
			ret["message"] = easyLanguage.equalWithIDError;
		}
		return ret;
	};

	this.flagerId = function (o) {
		var ret = Array();
		ret["isMatch"] = false;
		ret["message"] = "";
		var value = $("#" + o.easyPrototype.lagerId.validatevalue).val();
		if (o.value > value) {
			ret["isMatch"] = true;
			ret["message"] = easyLanguage.lagerIdSuccess;
		} else {
			ret["isMatch"] = false;
			ret["message"] = easyLanguage.lagerIdError;
		}
		return ret;
	};

	this.fsmallThanId = function (o) {
		var ret = Array();
		ret["isMatch"] = false;
		ret["message"] = "";
		var value = $("#" + o.easyPrototype.lagerId.validatevalue).val();

		if (o.value < value) {
			ret["isMatch"] = true;
			ret["message"] = easyLanguage.smallThanIdSuccess;
		} else {
			ret["isMatch"] = false;
			ret["message"] = easyLanguage.smallThanIdError;
		}
		return ret;
	};

	this.fdateTimeOnly = function (o) {
		var ret = Array();
		ret["isMatch"] = false;
		ret["message"] = "";

		var regex = /^\d\d\/\d\d\/\d\d\d\d \d\d:\d\d:\d\d [AP]M$/; //MM/DD/YY HH:mm:ss AM/PM
		if (o.value.match(regex) != null) {
			ret["isMatch"] = true;
			ret["message"] = "";
		} else {
			ret["isMatch"] = false;
			ret["message"] = easyLanguage.dateTimeOnlyError;
		}
		return ret;
	};

	this.fdateOnly = function (o) {
		var ret = Array();
		ret["isMatch"] = false;
		ret["message"] = "";

		var regex = /^\d\d\/\d\d\/\d\d\d\d/; //MM/DD/YY
		if (o.value.match(regex) != null) {
			ret["isMatch"] = true;
			ret["message"] = "";
		} else {
			ret["isMatch"] = false;
			ret["message"] = easyLanguage.dateOnlyError;
		}
		return ret;
	};

	this.fminSize = function (o) {
		var ret = Array();
		ret["isMatch"] = false;
		ret["message"] = "";

		if (o.value.length >= o.easyPrototype.func.minSize.validatevalue) {
			ret["isMatch"] = true;
			ret["message"] = "";
		} else {
			ret["isMatch"] = false;
			ret["message"] = easyLanguage.minSizeError1 + o.easyPrototype.func.minSize["validatevalue"] + easyLanguage.minSizeError2;
		}
		return ret;
	};

	this.fmaxSize = function (o) {
		var ret = Array();
		ret["isMatch"] = false;
		ret["message"] = "";

		if (o.value.length <= o.easyPrototype.func.maxSize.validatevalue) {
			ret["isMatch"] = true;
			ret["message"] = "";
		} else {
			ret["isMatch"] = false;
			ret["message"] = easyLanguage.maxSizeError1 + o.easyPrototype.func.maxSize["validatevalue"] + easyLanguage.maxSizeError2;
		}
		return ret;
	};

	this.fmaxDigitvalue = function (o) {
		var ret = Array();
		ret["isMatch"] = false;
		ret["message"] = "";

		if (o.value < parseInt(o.easyPrototype.func.maxDigitvalue.validatevalue)) {
			ret["isMatch"] = true;
			ret["message"] = "";
		} else {
			ret["isMatch"] = false;
			ret["message"] = easyLanguage.maxDigitvalue + o.easyPrototype.func.maxDigitvalue.validatevalue;
		}
		return ret;
	};

	this.fminDigitvalue = function (o) {
		var ret = Array();
		ret["isMatch"] = false;
		ret["message"] = "";

		if (o.value > parseInt(o.easyPrototype.func.minDigitvalue.validatevalue)) {
			ret["isMatch"] = true;
			ret["message"] = "";
		} else {
			ret["isMatch"] = false;
			ret["message"] = easyLanguage.minDigitvalue + o.easyPrototype.func.minDigitvalue.validatevalue;
		}
		return ret;
	};

	this.fajax = function (o) {
		if (!o.easyPrototype.isValidated) {
			var ret = Array();
			ret["isMatch"] = true;
			ret["message"] = "";
			return ret;
		}
		o.easyPrototype.isAjaxSubmitWaiting = true;

		var tagName = o.tagName;
		if (tagName.toLowerCase() == "input") {
			var iId = o.id;
			var iValue = o.value;
			var url = $(o).closest("form").attr("action");
			var ret = Array();
			ret["isMatch"] = true;
			ret["message"] = "";
			$.ajaxSetup({
				type : $(o).closest("form").attr("method"),
			});
			$.ajax({
				url : url,
				data : iId + '=' + iValue + "&type=input",
			});
			return ret;
		}
	};
};
