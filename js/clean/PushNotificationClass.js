var pushNotification;
var PushInitParams = false;

function InitpushNotifications() {
    document.addEventListener("deviceready", function() {
        pushNotification = window.plugins.pushNotification;
        if (device.platform == 'iOS' || device.platform == 'ios') {
            pushNotification.register(tokenHandler, errorHandler, {
                "badge": "true",
                "sound": "true",
                "alert": "true",
                "ecb": "onNotificationAPN"
            });
        } else {
            pushNotification.register(successHandler, errorHandler, {
                "senderID": "536166568203",
                "ecb": "onNotification"
            });
        }
    });
}

function successHandler(result) {
    console.log(result);
}

function errorHandler(error) {
    console.log(result);
}

function tokenHandler(result) {
    // Your iOS push server needs to know the token before it can push to this device
    // here is where you might want to send it the token for later use.
    console.log('device token = ' + result);
    RegisterDevice(result, "apple");
}

function onNotification(e) {
    console.log(e);
    switch (e.event) {
        case "registered":
            {
                RegisterDevice(e.regid, "google");
            }
            break;
        case "message":
            {
                if (e.payload != undefined && e.payload.citrus_event != undefined && e.payload.citrus_id != undefined) {
                    if (MobileUser != undefined && MobileUser.CitrusMobileReady != undefined && MobileUser.CitrusMobileReady == true) {
                        JQueryMobileHandlePushRequest(e.payload.citrus_event, e.payload.citrus_id);
                    } else {
                        PushInitParams = new Array();
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
    switch (e.event) {
        case "registered":
            {
                RegisterDevice(e.regid, "apple");
            }
            break;
        case "message":
            {
                if (e.payload != undefined && e.payload.citrus_event != undefined && e.payload.citrus_id != undefined) {
                    if (MobileUser != undefined && MobileUser.CitrusMobileReady != undefined && MobileUser.CitrusMobileReady == true) {
                        JQueryMobileHandlePushRequest(e.payload.citrus_event, e.payload.citrus_id);
                    } else {
                        PushInitParams = new Array();
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

function AfterRegisterDevice(data) {
    console.log(data);
}
var Base64 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function(input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = Base64._utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }
        return output;
    },
    decode: function(input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = Base64._utf8_decode(output);
        return output;
    },
    _utf8_encode: function(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    },
    _utf8_decode: function(utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
}

function RegisterDevice(key, provider, phone) {
    var phone = phone || '';
    if (key == '') {
        key = localStorage.getItem('device_key');
    } else {
        localStorage.setItem('device_key', key);
    }
    var php_path = "device.php";
    // var deviceInfo = cordova.require("cordova/plugin/DeviceInformation");
    //deviceInfo.get(function(nres) {
    var nres = '';
    if (provider != 'apple') {
        //get information from plugin (may have some problems with plugin)
        if(nresa = getDeviceUserInfo()){
            nres = Base64.encode(nresa);
        }
    }
    var data = 'register&key=' + key + '&mobile=' + phone + '&provider=' + provider + '&model=' + device.model + '&version=' + device.platform + " " + device.version + "&dui=" + nres;
    $.ajax({
        url: "http://m.citrus.ua/ajax/on/" + php_path + "?method=" + data,
        dataType: 'json',
        async: true,
        success: function(json) {
            AfterRegisterDevice(json);
        },
        timeout: 8000,
        error: function(jqXHR, status, errorThrown) { //the status returned will be "timeout"
            if (status == "timeout") {
                ShowMessage(1);
                return false;
            }
        }
    });
}

/**
 * Get user information
 * @return {[type]} [description]
 */
function getDeviceUserInfo() {
    setTimeout(function() {
    try {
        console.log('TEST');
        var deviceInfo = cordova.require("cordova/plugin/DeviceInformation");
        deviceInfo.get(function(result) {
            console.log('good');
            console.log(result);
            return result;
        }, function() {
            console.log('bad');
            return false;
        });
    } catch(e) {
        return false;
    }
  }, 100);    
}

function JQueryMobileHandlePushRequest(event, id) {
    switch (event) {
        case "product":
            {
                window.location = "#product-card?product-id=" + id;
            }
            break;
        case "link":
            {
                $.mobile.changePage("#products-list?category-items=" + id);
            }
            break;
        case "text":
            {
                $.mobile.changePage("#text-page?id=" + id);
            }
            break;
        case "promolink":
            {
                window.location = "#promo?id=" + id;
                //$.mobile.changePage("#promo?id="+id);
            }
            break;
        case "hrref":
            {
                window.open(id, '_system', 'location=yes');
                return false;
            }
            break;
    }
}