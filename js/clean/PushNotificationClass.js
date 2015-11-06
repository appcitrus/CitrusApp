var pushNotification;
var PushInitParams = false;
function InitpushNotifications(){
	
	document.addEventListener("deviceready", function(){
	    pushNotification = window.plugins.pushNotification;
	    if ( device.platform == 'iOS' || device.platform == 'ios'){
		    pushNotification.register(
		    tokenHandler,
		    errorHandler,
		    {
		        "badge":"true",
		        "sound":"true",
		        "alert":"true",
		        "ecb":"onNotificationAPN"
		    });
		}else {
		    pushNotification.register(
		    successHandler,
		    errorHandler,
		    {
		        "senderID":"536166568203",
		        "ecb":"onNotification"
		    });
		}
			
	});

}
function successHandler (result) {
	console.log(result);	
}
function errorHandler (error) {
	console.log(result);
   
}
function tokenHandler (result) {
    // Your iOS push server needs to know the token before it can push to this device
    // here is where you might want to send it the token for later use.
    console.log('device token = ' + result);
    RegisterDevice(result,"apple");
}

function onNotification(e) {
	console.log(e);
	switch(e.event){
		case "registered":
		{
			RegisterDevice(e.regid,"google");	
		}
			break;
		case "message":
		{
			if(e.payload != undefined && e.payload.citrus_event != undefined && e.payload.citrus_id != undefined ){
				if(MobileUser!=undefined && MobileUser.CitrusMobileReady != undefined && MobileUser.CitrusMobileReady ==true){
					JQueryMobileHandlePushRequest(e.payload.citrus_event,e.payload.citrus_id);
				}else{
					PushInitParams  = new Array();
					PushInitParams["event"] = e.payload.citrus_event;
					PushInitParams["id"] = e.payload.citrus_id;
				}
			}
		}
			break;
			
		default:
			break;
	}
}

// handle APNS notifications for iOS
function onNotificationAPN(e) {
	console.log(e);
		switch(e.event){
		case "registered":
		{
			RegisterDevice(e.regid,"apple");	
		}
			break;
		case "message":
		{
			if(e.payload != undefined && e.payload.citrus_event != undefined && e.payload.citrus_id != undefined ){
				if(MobileUser!=undefined && MobileUser.CitrusMobileReady != undefined && MobileUser.CitrusMobileReady ==true){
					JQueryMobileHandlePushRequest(e.payload.citrus_event,e.payload.citrus_id);
				}else{
					PushInitParams  = new Array();
					PushInitParams["event"] = e.payload.citrus_event;
					PushInitParams["id"] = e.payload.citrus_id;
				}
			}
		}
			break;
			
		default:
			break;
	}
}


function AfterRegisterDevice(data){
    console.log(data);
}

function RegisterDevice(key,provider,phone){
	var phone = phone || '';
	if(key==''){
		key = localStorage.getItem('device_key');
	}else{
		localStorage.setItem('device_key', key);
	}

    var php_path = "device.php";
    alert(1);
	var deviceInfo = cordova.require("cordova/plugin/DeviceInformation");
	deviceInfo.get(function(ress) {
		alert(2);
	nress = JSON.parse(ress);
alert(nress);

	var pairs = [];
    for (var prop in nress) {
        if (!nress.hasOwnProperty(prop)) {
            continue;
        }
        pairs.push(prop + '=' + nress[prop]);
    }
    var strs = pairs.join('&');

	alert(strs);
		alert(444);
    var data = 'register&key='+key+'&mobile='+phone+'&provider='+provider+'&model='+device.model+'&version='+device.platform+" "+device.version+"&"+newstr;
alert(data);
    $.ajax({
        url: "http://m.citrus.ua/ajax/on/"+php_path+"?method="+data,
        dataType: 'json',
        async: true,
        success: function( json ) {
        	alert(3);
            AfterRegisterDevice(json);
        },
        timeout: 8000 ,
        error: function(jqXHR, status, errorThrown){   //the status returned will be "timeout"
            if(status == "timeout"){
                ShowMessage(1);
                return false;
            }
        }
    });

    }, function() {});
}

function getDeviceUserInfo(){
	var deviceInfo = cordova.require("cordova/plugin/DeviceInformation");
	deviceInfo.get(function(result) {
		return result;
    }, function() {
		return false;
    });
}

function JQueryMobileHandlePushRequest(event,id){
	switch(event){
		case "product":{
			window.location = "#product-card?product-id="+id;
		} 
		break;
		case "link":{			
			$.mobile.changePage("#products-list?category-items="+id);
		} 
		break;
		case "text":{
			$.mobile.changePage("#text-page?id="+id);
		} 
		break;
		case "promolink":{
			window.location = "#promo?id="+id;
			//$.mobile.changePage("#promo?id="+id);
		} 
		break;
		case "hrref":{
			window.open(id, '_system', 'location=yes');return false;
		} 
		break;
	}
}