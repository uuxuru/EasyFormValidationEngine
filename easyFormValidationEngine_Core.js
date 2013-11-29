/*
* easy Form Validation Engine
* Version: 1.0.0
*
* Copyright(c)2013, Nguyen Van Tuan
* Email: uuxuru@gmail.com
* https://github.com/uuxuru/EasyFormValidationEngine
*
* Form validation engine supported ajax technique
*
* Licensed under the GNU License
*
*/

$(document).ready(function () {
	"use strict";
	$(document).ajaxComplete(function (event, xhr, settings) {
		// Your code
		if (typeof(xhr.responseText) == "undefined")
			return;
		var inputRegex = /\["[\w\W]+"\]/;
		var formRegex = /\[\["[\w\W]+"\]\]/;

		// Check if this ajax response is for easyValidate
		// This is processor for a form submit
		if (xhr.responseText.match(formRegex)) {
			var data = $.parseJSON(xhr.responseText);
			var isFormValid = true;
			var o;
			for (var i = 0; i < data.length; i++) {
				if($("#" + data[i][0]).length < 1) {
					continue;// this input is not exist
				}
				$("#" + data[i][0]).get(0).easyPrototype.validateFromServer = data[i][1];
				$("#" + data[i][0]).get(0).easyPrototype.messageFromServer = data[i][2];
				isFormValid = isFormValid && data[i][1];
				o = $("#" + data[i][0]).closest("form").get(0);
				//alert($("#" + data[i][0]).get(0).id+" - "+$("#" + data[i][0]).get(0).easyPrototype.messageFromServer);
			}
			o.easyPrototype.isValidated = isFormValid;
			o.easyPrototype.isAjaxSubmitWaiting = false;
		}

		// This is processor for an input submit only
		else if (xhr.responseText.match(inputRegex)) {
			var data = $.parseJSON(xhr.responseText);

			var thisIdClass = $("#" + data[0]).get(0).easyPrototype.easyID;

			$("#" + data[0]).get(0).easyPrototype.func.ajax["isValidated"] = data[1];
			$("#" + data[0]).get(0).easyPrototype.func.ajax["message"] = data[2];
			$("#" + data[0]).get(0).easyPrototype.isAjaxSubmitWaiting = false;
			if (!data[1])
				$("#" + data[0]).get(0).easyPrototype.isValidated = false;
			easyMethods.showPrompt($("#" + data[0]).get(0));
		}
	});

	var easyMethods = {
		/*
		 *
		 */
		init : function (option) {
			easyMethods.attackEvent();
		},

		attackEvent : function () {
			var inputID = 0;
			$("[class*='easyValidate']").each(function () {
				if(this.id == "") {
					alert(easyLanguage.requestIDerror);
					return false;
				}
				if (this.tagName == "FORM") {
					this.easyPrototype = new easyFormPrototype();
					$(this).find("input").not("[class*='easyValidate']").not("[type='submit']").each(function () {
						if(this.id == "") {
							alert(easyLanguage.requestIDerror+"\n\n"+easyLanguage.requestIDerror2+$(this).closest("form").get(0).id);
							return false;
						}
						this.easyPrototype = new easyInputPrototype();
						this.easyPrototype.easyID = "easyID" + inputID++;
						easyMethods.getClassNameAndItsParameter(this);

					});
					easyMethods.getClassNameAndItsParameter(this);
					this.easyPrototype.easyID = "easyID" + inputID++;
					easyMethods.onSubmit(this);
					return;
				} else {
					this.easyPrototype = new easyInputPrototype();
				}
				easyMethods.getClassNameAndItsParameter(this);

				this.easyPrototype.easyID = "easyID" + inputID++;
				easyMethods.onMouseClick(this);
				easyMethods.onTyping(this);
				easyMethods.onLeave(this);
				easyMethods.onSubmit(this);

				$(".easyValidBoxContainner").live("click", function () {
					$(this).fadeOut();
				});

			});
		},

		getSStillMeetChar : function (s, st, n, c) {
			var sReturn = "";

			//alert(s+"-"+st+"-"+n+"-"+c+";"+s.length);
			for (var i = st, j = -1; i < s.length; i++) {
				if (s[i] == c) {
					j++;
					if (j == n) {
						return sReturn;
					}
					sReturn = "";
					continue;
				}
				sReturn += s[i];
			}
			return sReturn;
		},

		getClassParams : function (s) {
			//. *? + [ ] ( ) { } ^ $ ¦ \
			var sReturn = Array();
			var i = -1;

			// "required(),scroll:true"
			// 'beforeSubmit(aaa),scroll:true"
			var removeRegex = /[ ]*[\,]*/;
			var funcRefexName = /([0-9a-zA-Z])+\(/;
			var funcRefexValue = /([0-9a-zA-Z])*\)/;
			var valueRefexName = /([0-9a-zA-Z])+\:/;
			var valueRefexValue = /([0-9a-zA-Z])*[\, \]$]*/;
			var valueMatched = "";
			while (s.length > 0) {
				valueMatched = s.match(removeRegex);
				s = s.substr(valueMatched[0].length, s.length);
				if (s.match(funcRefexName) != null) {
					i++;
					sReturn[i] = Array();

					valueMatched = s.match(funcRefexName);
					s = s.substr(valueMatched[0].length, s.length);
					sReturn[i]["type"] = "func";
					valueMatched = valueMatched[0].substr(0, valueMatched[0].length - 1);
					sReturn[i]["name"] = valueMatched;

					valueMatched = s.match(funcRefexValue);
					s = s.substr(valueMatched[0].length, s.length);
					valueMatched = valueMatched[0].substr(0, valueMatched[0].length - 1);
					sReturn[i]["params"] = valueMatched;
				} else if (s.match(valueRefexName) != null) {
					i++;
					sReturn[i] = Array();

					valueMatched = s.match(valueRefexName);

					s = s.substr(valueMatched[0].length, s.length);
					sReturn[i]["type"] = "value";
					valueMatched = valueMatched[0].substr(0, valueMatched[0].length - 1);
					sReturn[i]["name"] = valueMatched;

					valueMatched = s.match(valueRefexValue);
					s = s.substr(valueMatched[0].length, s.length);
					sReturn[i]["params"] = valueMatched = valueMatched[0].substr(0, valueMatched[0].length);
				} else
					break;
			}
			if (i == -1)
				return null;
			return sReturn;
		},

		strpos : function (haystack, needle, offset) {
			var i = (haystack + '').indexOf(needle, (offset || 0));
			return i === -1 ? false : i;
		},

		getClassNameAndItsParameter : function (o) {
			o.easyPrototype.fullClassName = o.className;
			var ss = easyMethods.strpos(o.className, "easyValidate");
			var easyClassString = easyMethods.getSStillMeetChar(o.className, ss + "easyValidate".length + 1, 0, "]");

			var arrClassParams = Array();
			arrClassParams = easyMethods.getClassParams(easyClassString);
			if (arrClassParams == null)
				return;
			for (var i = 0; i < arrClassParams.length; i++) {
				if (arrClassParams[i]["type"] == "func") {
					//alert(o.id+" - "+arrClassParams[i]["name"]+" - "+ arrClassParams[i]["params"]);
					o.easyPrototype.func[arrClassParams[i]["name"]].userDefined = true;
					o.easyPrototype.func[arrClassParams[i]["name"]].validatevalue = arrClassParams[i]["params"];
				} else if (arrClassParams[i]["type"] == "value") {
					o.easyPrototype[arrClassParams[i]["name"]] = arrClassParams[i]["params"];
				}
			}
		},

		testingGetAttr : function (object) {
			for (var i in object) {
				alert(i + " - " + object[i] + ";;;");
			}
		},

		onMouseClick : function (o) {
			$(o).live("click", function () {});
		},

		/*
		 * Capture user input value and show a alert pop up if the value is not match condition.
		 */
		onTyping : function (o) {
			$(o).live("keyup", function () {
				if (o.value == o.easyPrototype.preTypingValue)
					return;
				o.easyPrototype.preTypingValue = o.value;

				// Attemp this input is validted
				o.easyPrototype.isValidated = true;

				for (var s in o.easyPrototype.func) {
					o.easyPrototype.func[s].message = "";
					if ((o.easyPrototype.func[s].onTyping == true) && (o.easyPrototype.func[s].userDefined == true)) {
						easyMethods.validateThisInput(o, s);
					}
				}
				easyMethods.showPrompt(o);
			});
		},

		onLeave : function (o) {
			$(o).live("focusout", function (e) {
				if (o.value == o.easyPrototype.preValue && o.value != "" && o.easyPrototype.isValidated == true)
					return;
				o.easyPrototype.preValue = o.value;

				// Attemp this input is validted
				o.easyPrototype.isValidated = true;

				for (var s in o.easyPrototype.func) {
					o.easyPrototype.func[s].message = "";
					if ((o.easyPrototype.func[s].onLeave == true) && (o.easyPrototype.func[s].userDefined == true)) {
						easyMethods.validateThisInput(o, s);
					}
				}
				easyMethods.showPrompt(o);
			});
		},

		onSubmit : function (o) {
			// o now form
			$(o).live("submit", function (e) {
				// check if form validated before call ajax and submits functions
				// reset last valid result
				o.easyPrototype.isValidated=true;
				
				$("#" + o.id + " [class*='easyValidate']").each(function () {
					o.easyPrototype.isValidated = o.easyPrototype.isValidated && this.easyPrototype.isValidated
				});
				if (o.easyPrototype.isValidated) {
					// Do before Submit functions
					var afterSubmitFuncList = Array();
					var i = 0;
					for (var s in o.easyPrototype.func) {
						if ((o.easyPrototype.func[s].onSubmit == true) && (o.easyPrototype.func[s].userDefined == true)) {
							var fun = "f" + s;
							if (o.easyPrototype.func[s].when == "beforeSubmit")
								o.easyPrototype[fun](o);
							else
								afterSubmitFuncList[i++] = o.easyPrototype[fun];
						}
					}

					// process false message from server if exist via ajax
					$(o).find("input").not("[type='submit']").each(function () {
						//if (!this.easyPrototype.validateFromServer) {
							easyMethods.showPrompt(this);
						//}
					});
					// Do after Submit functions
					if (o.easyPrototype.doNotAutoSubmit!="true"){
						for (var j = 0; j < i; j++)
							afterSubmitFuncList[j](o);
					}
				} else {
					easyMethods.scrollToFirstWrongInput(o);
					return false;
				}

				// If user want to do their submit function: stop submit via easy
				if (o.easyPrototype.doNotAutoSubmit=="true" || o.easyPrototype.isValidated == false){
					return false;
				}
				else{
					return true;
				}
			});
		},

		scrollToFirstWrongInput : function (o) {
			// o is form
			var first = true;
			$(o).find("[class*='easyValidate']").each(function () {
				if (!this.easyPrototype.isValidated) {
					var pos = $(this).position().top - 30;
					if (first) {
						first = false;
						if(o.easyPrototype.scroll == true){
							$('body,html').animate({scrollTop : pos}, 1000, function () {});
						}
						$("html").children("." + this.easyPrototype.easyID).fadeOut(50).fadeIn(100).fadeOut(50).fadeIn(200);
					}
					return;
				}
			});
		},

		showPrompt : function (o) {
			// Remove all message before on this input
			$("html").children("." + o.easyPrototype.easyID).remove();

			// If there have message sent from server: just show that message
			// If this input is waiting for a response from server: show waiting message
			// If state false, just show wrong message
			// Else, show all message

			var state = o.easyPrototype.isValidated;
			var messages = "";
			var nullRegex = /[\S]/;
			if(!o.easyPrototype.validateFromServer){
				state= false;
				messages = o.easyPrototype.messageFromServer;
			}
			else if (o.easyPrototype.isAjaxSubmitWaiting) {
				messages = o.easyPrototype.ajaxWattingMessage;
			} else if (o.easyPrototype.messageFromServer) {
				messages = o.easyPrototype.messageFromServer;
			} else {
				if (!state) {
					for (var s in o.easyPrototype.func) {
						if (o.easyPrototype.func[s].message != "")
							if (o.easyPrototype.func[s].userDefined &&
								!o.easyPrototype.func[s].isValidated &&
								o.easyPrototype.func[s].message.match(nullRegex) != null) {

								messages += "* " + o.easyPrototype.func[s].message + " </br>";
							}
					}
				} else {
					for (var s in o.easyPrototype.func) {
						if (o.easyPrototype.func[s].userDefined &&
							o.easyPrototype.func[s].message.match(nullRegex) != null) {

							messages += "* " + o.easyPrototype.func[s].message + " </br>";
						}
					}
				}
			}

			// Show message
			// If message null, don't show it
			if(messages =="") return;
			if (messages.match(nullRegex) == null)
				return;
			// do function showpromt
			easyMethods.prompt.show(o, state, messages);

		},

		prompt : promptStyleList.easyDefault,

		validateThisInput : function (o, field) {
			// Erase all last validation result
			o.easyPrototype.func[field].isValidated = true;
			o.easyPrototype.func[field].message = "";

			var fun = "f" + field;
			//alert(fun);
			var res = o.easyPrototype[fun](o);
			o.easyPrototype.func[field].isValidated = res["isMatch"];
			o.easyPrototype.func[field].message = res["message"];
			if (!res["isMatch"])
				o.easyPrototype.isValidated = false;
			return res["isMatch"];
		}
	};

	// userInterface
	var easySetting;
	$.fn.easySetting = easySetting = {
		beforeSubmit : function () {},
		afterSubmit : function () {}
	};
	$.fn.validateThisForm = function (o) {
		return ;
	};
	$.fn.hideThisInputValidatePopup = function (option) {
		$("."+this.get(0).easyPrototype.easyID).fadeOut();
	};
	$.fn.showThisInputValidatePopup = function (option) {
		$("."+this.get(0).easyPrototype.easyID).fadeIn();
	};
	$.fn.isFormValidated = function () {
		//easyMethods.testingGetAttr(this);
		return this.get(0).easyPrototype.isValidated;
	};
	$.fn.showAllValidatePopup = function (option) {
		$(".easyValidBoxContainner").fadeIn(1000);
	};
	$.fn.hideAllValidatePopup = function (option) {
		$(".easyValidBoxContainner").fadeOut(1000);
	};
	easyMethods.init();
});
