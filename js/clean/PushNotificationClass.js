var pushNotification;
var PushInitParams = false;
function InitpushNotifications(){
	
	document.addEventListener("deviceready", function(){

	    pushNotification = window.plugins.pushNotification;
		
		console.log(device);
	    if ( device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos" ){
		    pushNotification.register(
		    successHandler,
		    errorHandler,
		    {
		        "senderID":"536166568203",
		        "ecb":"onNotification"
		    });
		}else {
		    pushNotification.register(
		    tokenHandler,
		    errorHandler,
		    {
		        "badge":"true",
		        "sound":"true",
		        "alert":"true",
		        "ecb":"onNotificationAPN"
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

// handle GCM notifications for Android

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
}


function AfterRegisterDevice(data){
    console.log(data);
}

function RegisterDevice(key,provider){
    var phone = "";
    var php_path = "device.php";
    var data = 'register&key='+key+'&mobile='+phone+'&provider='+provider+'&model='+device.model+'&version='+device.platform+" "+device.version;

    $.ajax({
        url: "http://m.citrus.ua/ajax/on/"+php_path+"?method="+data,
        dataType: 'json',
        async: true,
        success: function( json ) {

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
	}
}