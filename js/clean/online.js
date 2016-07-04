$(document).ready(function () {

	var widget_id = 668014;
		_shcp =[{widget_id : widget_id, side : 'top', position: 'center', autostart: true, callback:callbackStart }];
	var lang =(navigator.language || navigator.systemLanguage 
	|| navigator.userLanguage ||"en")
	.substr(0,2).toLowerCase();
	var url = "widget.siteheart.com/widget/sh/" + widget_id + "/"
	+ lang + "/widget.js";
	var hcc = document.createElement("script");
	hcc.type = "text/javascript";
	hcc.async = true;
	hcc.src = ("https:" == document.location.protocol ? "https" : "http")
	+ "://" + url;
	var s = document.getElementsByTagName("script")[0];
	s.parentNode.insertBefore(hcc, s.nextSibling);

	
	function callbackStart(chat){
		setTimeout(function() {
			$.each( $('.sh_avatar'), function(key, val){
				if($(val).attr('src')=="//esapi.siteheart.com/esapi/avatar/small/23281121"){
					$(val).attr('src','http://m.citrus.ua/images/logo-min.png');
				}
			 });
		$.each( $('.sh_mess_nick_sel'), function(key, val){
			if($(val).text()=="m.citrus.ua"){
				$(val).text('Цитрус');
			}
		 });
		},100);
	}
	
/* 	callback = function(chat){
    // не показывает, что оператор подключился к диалогу
		chat.on("clientRoomSellerAccepted", function(data){
		return false;
    });
	
    // вызывается когда клиент закрывает окно чата
		chat.on("eventJSWidgetExit", function(){
		window.location = "http://m.citrus.ua"
		});
    }; */
	
/* 	var url ="widget.siteheart.com/widget/sh/"+ widget_id +"/"+ lang +"/widget.js",
		src =("https:"== document.location.protocol ?"https":"http")
	+"://"+ url
	
 	$.getScript(src).done(function() {
		setTimeout(function() {
			$('#sh_button').click();
		},500);
	});

  $('body').on('click', '#sh_button', function() {
		console.log('#online start');
  }); */
  

  
});