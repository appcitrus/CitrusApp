function sendMethod(data,path,session_id,callback){				if(arguments.length>2 && session_id!= undefined){			data += "&session_id="+session_id;					}        //console_log("sendMethod");       // console_log(data);		var sync = false;		var make_callback = false;		if(arguments.length==4 && callback!= undefined){			make_callback = true;			sync = true;		}		var data_json = undefined;		var app =isIOS()?"ios":3;		$.ajax({ 		  url: "http://m.citrus.ua/ajax/on/"+path+"?app="+app+"&method="+data, 		  dataType: 'json', 		   async: sync, 		  success: function( json ) {						 if(!make_callback){			 	data_json =  json;			 }else{			 	callback(json);			 }		  }, 		  timeout: 20000 ,		  error: function(jqXHR, status, errorThrown){   //the status returned will be "timeout" 		  	//console.log("error - " + status);            //console_log("error - " + status);              ShowMessage(1);			 	return false;							 		  } 		});		//		return data_json;}function CitrusMobileUserBasket(init_session_id){	this.php_path = "basket.php";			this.Init = function(session_id){		this.session_id = session_id;	}		this.ListCart = function (callback){		var data = 'lists';		sendMethod(data,this.php_path,this.session_id,callback);	}	this.getViewedProducts = function(callback) {        var data = 'getViewedProducts';        sendMethod(data, this.php_path, this.session_id, callback);    }    this.setViewedProduct = function(product_id, callback) {        var data = 'setViewedProduct&id=' + product_id;        return sendMethod(data, this.php_path, this.session_id, callback);    }	this.addToCart = function (product_id,callback){		var data = 'add&id='+product_id;		return sendMethod(data,this.php_path,this.session_id,callback);	}	this.addToCartCO = function (product_id,coid,callback){		var data = 'addCO&id='+product_id+'&coid='+coid;		return sendMethod(data,this.php_path,this.session_id,callback);	}	this.addToCartSale = function(product_id, callback) {        var data = 'addSale&id=' + product_id;        return sendMethod(data, this.php_path, this.session_id, callback);    }	this.addBundleToCart = function (bundle_id,callback){		var data = 'addBundle&id='+bundle_id;		return sendMethod(data,this.php_path,this.session_id,callback);	}	this.updateCart = function(basket_item_id, qnt,callback){		var data = 'up&idd='+basket_item_id+'&qnt='+qnt;		sendMethod(data,this.php_path,this.session_id,callback);	}	this.delFromCart= function(basket_item_id,callback){		var data = 'del&idd='+basket_item_id;		sendMethod(data,this.php_path,this.session_id,callback);	}	this.Order = function(fio,email,city,callback){		var data = 'create&fio='+encodeURIComponent(fio)+ "&email="+encodeURIComponent(email)+"&city="+encodeURIComponent(city);		sendMethod(data,this.php_path,this.session_id,callback);	}	this.preOrder = function(fio,email,city,product_id,comment,phone,callback){		var data = 'create_preorder&user_name='+encodeURIComponent(fio)+ "&email="+encodeURIComponent(email)+"&city="+encodeURIComponent(city)		+"&product_id="+encodeURIComponent(product_id)		+"&comment="+encodeURIComponent(comment)		+"&phone="+encodeURIComponent(phone);		sendMethod(data,this.php_path,this.session_id,callback);	}		this.Init(init_session_id);}function CitrusMobileUser(){	if ( arguments.callee.instance ){		return arguments.callee.instance;	}        arguments.callee.instance = this;		this.session_key_string = "citrus_mobile_session_id";		this.auth_key_string = "citrus_mobile_auth";		this.php_path = "user.php";	this.IsAuthorized = false;	this.backurl = "#main";	this.mobile_phone;	this.CitrusMobileReady = false;	this.DeviceReady = false;	this.userID = false;	// конструктор	this.Init = function(){				this.storage = new LocalStorage();			var key = this.storage.Get(this.session_key_string);		var Authorization = this.storage.Get(this.auth_key_string);		if(key !== undefined){			this.session_id = key;						if(Authorization !== undefined && Authorization == "Y"){								this.CheckAuthorization();			}else{				this.IsAuthorized = false;							}					}else{			this.StartSession();		}			this.basket = new CitrusMobileUserBasket(this.session_id);				this.CitrusMobileReady = true;		if(this.DeviceReady){			console.log(" this.Init this.DeviceReady");			navigator.splashscreen.hide();		}		if(PushInitParams !==false && PushInitParams["event"]!= undefined && PushInitParams["id"]!= undefined){			JQueryMobileHandlePushRequest(PushInitParams["event"],PushInitParams["id"]);		}	}	this.StartSession = function (){		var json = sendMethod("start_session",this.php_path);		this.session_id = json.session_id;		this.storage.Set(this.session_key_string,this.session_id);	}	this.CheckAuthorization = function (){		var json = sendMethod("check_auth",this.php_path,this.session_id);		if(json !== undefined && json.IsAuthorized !== undefined  &&  json.IsAuthorized =="Y"){			this.IsAuthorized = true;			if(json.userID>0){				this.userID = json.userID;			}		}		if(json !== undefined && json.fuid != undefined && json.fuid==false){			this.StartSession();		}			}		this.SetStorage = function (name,val){		return this.storage.Set(name,val);	}	this.GetStorage = function (name){		return this.storage.Get(name);	}	this.GetUserPush = function (callback){		var device =isIOS()?"apple":3;		var json = sendMethod("GetUserPush"+"&device="+device,this.php_path,this.session_id,callback);	}	this.GetUserPreOrders = function (callback){		var json = sendMethod("GetUserPreOrders",this.php_path,this.session_id,callback);	}	this.GetUserWishes = function (callback){		var json = sendMethod("GetUserWishes",this.php_path,this.session_id,callback);	}	this.GetUserWish = function (id,callback){		var json = sendMethod("GetUserWish"+'&wishlist_id='+id,this.php_path,this.session_id,callback);	}	this.GetUserOrders = function (callback){		var json = sendMethod("GetUserOrders",this.php_path,this.session_id,callback);	}	this.GetUserOrder = function (order_id,callback){		var json = sendMethod("GetUserOrder"+'&order_id='+order_id,this.php_path,this.session_id,callback);	}	this.UpdateUserInfo = function (user_info,callback){		var json = sendMethod("UpdateUserInfo"+user_info,this.php_path,this.session_id,callback);	}	this.UserInfo = function (callback){		var json = sendMethod("check_auth",this.php_path,this.session_id,callback);		if(json !== undefined && json.IsAuthorized !== undefined  &&  json.IsAuthorized =="Y"){			this.IsAuthorized = true;		}			}	this.LoginPromt = function(){		if(this.IsAuthorized==true){			$.mobile.changePage("#page-personal",{changeHash:true});		}else{			//this.backurl = document.URL;			this.backurl = window.location.href.toString().split(window.location.host)[1];			if(this.backurl!='#page-cart'){				this.backurl = "#main";			}			$.mobile.changePage("#login-page",{changeHash:true});		}	}	this.VerifyPhoneInput = function (phone_input,button){			var value = $(phone_input).val();		value = value.substring(4);		value = value.replace(/[^\d,+]/g, "");		value = "+380"+value;		$(phone_input).val(value);		if(!this.ValidatePhone(value)){			$(button).attr("disabled","disabled")		}else{			$(button).removeAttr("disabled");		}	}	this.ValidatePhone = function (phone,alert_contaner){			if(phone.length!=13){						if(arguments.length==2 && alert_contaner!= undefined){				$(alert_contaner).html("Некорректный формат номера телефона!");				$(alert_contaner).show();			}			return false;					}		$(alert_contaner).hide();		return true;	}	this.Authorization_sendCode = function (phone){		if(!this.ValidatePhone(phone)){			return false;		}        GA_event( 'Authorization', 'TrySendCode', phone);		ShowLoading();		$.ajax({ 		  url: "http://m.citrus.ua/ajax/on/"+this.php_path+"?method=SendAuthSMSCode&phone="+phone+"&session_id="+this.session_id, 		  dataType: 'json', 		   async: true, 		  success: function( json ) {		  		if(json.error === undefined && json.SMS_SENDED !=undefined && json.SMS_SENDED=="Y"){                    GA_event( 'Authorization', 'SendCodeSended', phone);					$("#sms-code-btn").attr("phone",phone);					$.mobile.changePage("#sms-page",{transition: "slide",changeHash:true});				}else{									}				$.mobile.loading( "hide" );						  }, 		  timeout: 25000 ,		  error: function(jqXHR, status, errorThrown){   //the status returned will be "timeout" 						 	$.mobile.loading( "hide" );			 	ShowMessage(1);			 	return false;							 		  } 		});		}	this.AuthorizeByCode = function (phone,code){		var wrongCodeSms = $("#wrongCodeSms");wrongCodeSms.html('');		ShowLoading();        GA_event('Authorization', 'TryAuthorizeByCode', phone);		$.ajax({ 		  url: "http://m.citrus.ua/ajax/on/"+this.php_path+"?method=AuthorizationTry&phone="+phone+"&sms_code="+code+"&session_id="+this.session_id, 		  dataType: 'json', 		   async: true, 		  success: function( json ) {		  		if(json.error === undefined && json.AuthorizationSuccess !=undefined && json.AuthorizationSuccess=="Y"){		  			alert("AuthorizeByCode");					this.mobile_phone = phone;					RegisterDevice('',isIOS()?"apple":"google",phone);                    GA_event( 'Authorization', 'AuthorizeByCodeSuccess', phone);					var singletonCitrusMobileUser = new CitrusMobileUser();					singletonCitrusMobileUser.IsAuthorized = true;					singletonCitrusMobileUser.storage.Set(singletonCitrusMobileUser.auth_key_string,"Y");					alert("singletonCitrusMobileUser.backurl");					window.location = singletonCitrusMobileUser.backurl;					//$.mobile.changePage(singletonCitrusMobileUser.backurl,{changeHash:true});									}else{                    GA_event( 'Authorization', 'AuthorizeByCodeWrongCode', phone);                    wrongCodeSms.html('Неверный код');				}				$.mobile.loading( "hide" );						  }, 		  timeout: 25000 ,		  error: function(jqXHR, status, errorThrown){   //the status returned will be "timeout" 						 	$.mobile.loading( "hide" );			 	ShowMessage(1);			 	return false;						  } 		});		}	this.Init();	$.mobile.loading( "hide" );}var MobileUser;function OutedStart(){			MobileUser = new CitrusMobileUser();}document.addEventListener("deviceready", onDeviceReady, false);function onDeviceReady() {	MobileUser.DeviceReady = true;	if(!MobileUser.CitrusMobileReady){		console.log(" onDeviceReady !MobileUser.CitrusMobileReady");	}else{		console.log(" onDeviceReady MobileUser.CitrusMobileReady");		navigator.splashscreen.hide();	}    GA_track("App_open");}