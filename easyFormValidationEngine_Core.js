 /*
 * easy Form Validation Engine
 * Version: 1.0.0 
 *
 * Copyright(c)2013, Nguyen Van Tuan
 * https://github.com/uuxuru/EasyFormValidationEngine
 *
 * Form validation engine supported ajax technique
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
			var isFormValid=true;
			for(var i=0;i<data.length;i++)
			{
				$("#"+data[i][0]).get(0).easyPrototype.validateFromServer = data[i][1];
				$("#"+data[i][0]).get(0).easyPrototype.messageFromServer = data[i][2];
				isFormValid=isFormValid&&data[i][1];
			}
			var o = $("#"+data[0][0]).closest("form").get(0);
			o.easyPrototype.isValidated = isFormValid;
			o.easyPrototype.isAjaxSubmitWaiting=false;
		}

		// This is processor for an input submit only
		else if (xhr.responseText.match(inputRegex)) {
			var data = $.parseJSON(xhr.responseText);
			
			var thisIdClass = $("#" + data[0]).get(0).easyPrototype.easyID;

			$("#" + data[0]).get(0).easyPrototype.func.ajaxChecking["isValidated"] = data[1];
			$("#" + data[0]).get(0).easyPrototype.func.ajaxChecking["message"] = data[2];
			$("#" + data[0]).get(0).easyPrototype.isAjaxSubmitWaiting = false;
			if(!data[1]) $("#" + data[0]).get(0).easyPrototype.isValidated=false;
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
				if (this.tagName == "FORM") {
					this.easyPrototype = new easyFormPrototype();
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
				if(o.value == o.easyPrototype.preTypingValue) return;
				o.easyPrototype.preTypingValue = o.value;

				// Attemp this input is validted
				o.easyPrototype.isValidated=true;
				
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
				if(o.value == o.easyPrototype.preValue && o.value!="" && o.easyPrototype.isValidated == true) return;
				o.easyPrototype.preValue = o.value;

				// Attemp this input is validted
				o.easyPrototype.isValidated=true;

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
				$("#"+o.id + " [class*='easyValidate']").each(function () {
					o.easyPrototype.isValidated = o.easyPrototype.isValidated && this.easyPrototype.isValidated
				});
				
				if(o.easyPrototype.isValidated){
					// Do before Submit functions
					var afterSubmitFuncList=Array();
					var i=0;
					for (var s in o.easyPrototype.func) {
						if ((o.easyPrototype.func[s].onSubmit == true) && (o.easyPrototype.func[s].userDefined == true) ) {
							var fun = "f" + s;
							if(o.easyPrototype.func[s].when == "beforeSubmit")
								o.easyPrototype[fun](o);
							else afterSubmitFuncList[i++]=o.easyPrototype[fun];
						}
					}
					
					// process false message from server if exist via ajax
					$("#"+o.id + " [class*='easyValidate']").each(function () {
						if(!this.easyPrototype.validateFromServer){
							easyMethods.showPrompt(this,true);
						}
					});
					// Do after Submit functions
					for(var j=0;j<i;j++) afterSubmitFuncList[j](o);
				}else{
					easyMethods.scrollToFirstWrongInput();
					return false;
				}
				
				// If user want to do their submit function: stop submit via easy
				if(o.easyPrototype.doNotAutoSubmit) return false;
				else return true;
			});
		},
		
		scrollToFirstWrongInput : function () {
			var first = true;
			$("[class*='easyValidate']").each(function () {
				if (!this.easyPrototype.isValidated|| !this.easyPrototype.haveMessageFromServer) {
					var pos = $(this).position().top - 30;
					if (first) {
						first = false;
						$('body,html').animate({
							scrollTop : pos
						}, 1000, function () {});
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
			if(o.easyPrototype.isAjaxSubmitWaiting){
				messages = o.easyPrototype.ajaxWattingMessage;
			}
			else if(o.easyPrototype.messageFromServer){
				messages = o.easyPrototype.messageFromServer; 
			}else{
				if(!state){
					for (var s in o.easyPrototype.func) {
						if(o.easyPrototype.func[s].message!="")
						if (o.easyPrototype.func[s].userDefined && 
							!o.easyPrototype.func[s].isValidated && 
							o.easyPrototype.func[s].message.match(nullRegex) != null){
							
							messages += "* " + o.easyPrototype.func[s].message + " </br>";
						}
					}
				}else{
					for (var s in o.easyPrototype.func) {
						if (o.easyPrototype.func[s].userDefined &&
							o.easyPrototype.func[s].message.match(nullRegex) != null){
							
							messages += "* " + o.easyPrototype.func[s].message + " </br>";
						}
					}
				}
			}
			
			// Show message
			// If message null, don't show it
			if(messages.match(nullRegex) == null) return;
			
			var left = $(o).offset().left;
			var width = $(o).width();
			var a = (width + left - 40);
			var top = $(o).offset().top + 10;
			var redOrGreen = state?"Green":"Red";
			
			if (o.easyPrototype.defaultPromtpPos == "topright") {
				o.easyPrototype.promptDiv = '<div class="easyValidBoxContainner ' + 
					o.easyPrototype.easyID + '" style="top:' + top + 
					'px; left:' + a + 
					'px;"><div class="easyValidBoxMessage easy'+redOrGreen+'">' + 	messages +
					' </div><div class="easyArrow"><div class="easy'+redOrGreen+' line10"></div><div class="easy'+redOrGreen+' line9"></div><div class="easy'+redOrGreen+' line8"></div><div class="easy'+redOrGreen+' line7"></div><div class="easy'+redOrGreen+' line6"></div><div class="easy'+redOrGreen+' line5"></div><div class="easy'+redOrGreen+' line4"></div><div class="easy'+redOrGreen+' line3"></div><div class="easy'+redOrGreen+' line2"></div><div class="easy'+redOrGreen+' line1"></div></div></div>';
			}
			$("html").append(o.easyPrototype.promptDiv);
			easyMethods.orderlyPrompts();
		},

		orderlyPrompts: function(){
			$("[class*='easyValidate']").each(function () {
				var thiseasyID = this.easyPrototype.easyID;
				if($("."+thiseasyID).length > 0){
					var thisPrompt = 	$("."+thiseasyID);
					
					var inputLeft =		$(this).offset().left;
					var inputWidth = 	$(this).width();
					var inputTop = 		$(this).offset().top;
					var inputHeight = 	$(this).height();
					
					var oldPromptLeft = 	thisPrompt.offset().left;
					var oldPromptWidth = 	thisPrompt.width();
					var oldPromptTop = 		thisPrompt.offset().top;
					var oldPromptHeight = 	thisPrompt.height();
					
					var newPromptLeft = 	inputLeft+inputWidth-20;
					var newPromptTop = 		inputTop-oldPromptHeight+42;
					
					thisPrompt.css({"top":newPromptTop,"left":newPromptLeft});
				}
			});
		},
			
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
		},
	};
		
	// userInterface
	var easySetting;
	$.fn.easySetting = easySetting = {
		beforeSubmit: function(){
		},
		afterSubmit: function(){
		},
	};
	$.fn.validateThisForm = function (o) {
		return r;
	};
	$.fn.hideThisInputValidatePopup = function (option) {
	
	};
	$.fn.isFormValidated = function(){
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

	
