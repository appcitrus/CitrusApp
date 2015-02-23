//--------------
function supportsSVG() {
    return !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', "svg").createSVGRect;
  }
function loadjscssfile(filename, filetype){
 if (filetype=="js"){ //if filename is a external JavaScript file
  var fileref=document.createElement('script')
  fileref.setAttribute("type","text/javascript")
  fileref.setAttribute("src", filename)
 }
 else if (filetype=="css"){ //if filename is an external CSS file
  var fileref=document.createElement("link")
  fileref.setAttribute("rel", "stylesheet")
  fileref.setAttribute("type", "text/css")
  fileref.setAttribute("href", filename)
 }
 if (typeof fileref!="undefined")
  document.getElementsByTagName("head")[0].appendChild(fileref)
}

if(supportsSVG()){
	loadjscssfile("css/icons-svg.css","css");
}else{
	loadjscssfile("css/icons-png.css","css");
}
function changePage (page) {
    $.mobile.changePage(page, {
        transition: "none",
        changeHash: false
    });
}
var loaded_pages = new Array();
function include_page(page_name){

	if($("#"+page_name).length == 0 ){	
	  loadjscssfile("/pages/"+page_name+"/style.css?","css");
	 // loadjscssfile("/pages/"+page_name+"/script.js?","js");
	  $( document ).on( "pageinit", "#"+page_name, function() {
	  		//console.log("init - #"+page_name);
	  	  	$( ".navPanelChild.menu_to_clone" ).each(function(key,value) {
			  var navpanelCopy = $( "#nav-panel" ).html();
		  	  $(value).html(navpanelCopy).trigger( "updatelayout" );	
		  	  $(value).find('[data-role="listview"]').listview();	   
			});

	  	 $('#'+page_name+' .cit_panel_href').on(eventstring,function(event){
					event.stopPropagation();
					event.preventDefault();
					
					$($(this).attr('link') ).panel( "open" );					
		  });	
	  	  loadjscssfile("/pages/"+page_name+"/script.js?","js");
		  changePage("#"+page_name);		 
	  });
	  $.get( "/pages/"+page_name+"/index.html?", function( data ) {
		 loaded_pages[page_name] = data;
		 $("body").append(data);
		 $("#"+page_name).page();
	  });
	  //$( ":mobile-pagecontainer" ).pagecontainer( "load", "/pages/"+page_name+"/index.html?" );
	  
	 }else{
	 	changePage("#"+page_name);		 
	 } 

		
}

function goBack(){
	var previousPage =$.mobile.activePage.data('ui.prevPage');
	if(typeof previousPage.prevObject[0]!='undefined'){
	$.mobile.changePage(previousPage.prevObject[0].id, 'slide', true, true);
	}
}

// Инициализация свайпа навигационного меню
function  SwipeInit(){
	$("html").swipe({
		  swipeLeft:function(event, direction, distance, duration, fingerCount) {
			$( "#nav-panel" ).panel( "close" );
		  },
		  swipeRight:function(event, direction, distance, duration, fingerCount) {
			$("#nav-panel" ).panel( "open" );
		  }
	});				
}

// Отображение иконки ожидания загрузки данных
function ShowLoading(){
	
	var $this = $( this ),
    theme = $this.jqmData( "theme" ) || $.mobile.loader.prototype.options.theme,
    msgText = $this.jqmData( "msgtext" ) || $.mobile.loader.prototype.options.text,
    textVisible = $this.jqmData( "textvisible" ) || $.mobile.loader.prototype.options.textVisible,
    textonly = !!$this.jqmData( "textonly" );
    html = $this.jqmData( "html" ) || "";
   
    $.mobile.loading( "show", {
            text: msgText,
            textVisible: textVisible,
            theme: theme,
            textonly: textonly,
            html: html
    });
}
// Инициализация зависимости visability элемента от прокрутки страницы
function InitScrollElementVisability(id,scrollposition){
	$(window).scroll(function () {
		if ($(window).scrollTop() > scrollposition) {
			$('#search').hide();							
		} else {
			$('#search').show();
		}		
	});
}


// Загрузчик каталога
function LoadDefaultCatalog(category,position){
	product_list_page_loded = false;


	var request = "";
    var position_to_get = "0";
	
	
	if(arguments.length==1 && category!= undefined){
		request = "&link=" + category;
		ShowLoading();
		
	}
	if(arguments.length==2 && category!= undefined){
		request = "&link=" + category;
		ShowLoading();
		var position_to_get = position;
	}
	
	$("#catalog-footer").hide();
	var showFootbar = false;
	var json_props = [];
	for(key in FilterEnums.props){
				json_props.push({"prop_id":key,"data":FilterEnums.props[key]});				
	}
	if(FilterEnums.active_sort > 0){
		request += "&sort=" + FilterEnums.sort_values[FilterEnums.active_sort];
	}		
	
	$.ajax({ 
	  url: "http://m.citrus.ua/ajax/catalog_lazy.php?position="+position_to_get+"&count=20"+request, 
	  type: "POST",
	  dataType: 'json', 
	  data: {data:JSON.stringify(json_props)},
	  success: function( json ) {
			 var output = "";
			 var count = 0;
			 if(json.items != undefined && json.items.length > 0){
			 $.each( json.items, function( key, value ) {
				
				count = count +1;	 
				var url ;			
				url = "category-items=" +  value.link;	
				var lazy = "";
				if(key ==json.items.length-1)
				{
					if(json.parameters && json.parameters.lazy && json.parameters.lazy == 1){
						
						lazy = "lazy_load_more";
					}
				}
				
 				if(json.parameters!= undefined && json.parameters.parent_name != undefined &&  $("#CatalogBack").length > 0){
                    $("#CatalogBack").html(json.parameters.parent_name);
                }

				var dop_class="";
				if(value.price){
					
					showFootbar = true;
					dop_class=dop_class+" product";
					url = "#product-card?product-id=" + value.id;
					
					var row2 = '';
					if(parseInt(value.price) > 1 && value.can_buy =="Y"){
						row2 = '<div class="price">'+value.price+' грн</div>';	
					}
					else{
						row2 = '<div class="status">'+value.can_buy_status+'</div>';;
					}
					
					var prop = "";
					if(value.props!= undefined){
						prop = value.props;
					}
					
					var bonuses = "";
					if(value.bonuses != undefined && parseInt(value.bonuses) > 5){
						bonuses = '<div class="props">+'+parseInt(value.bonuses)+' грн на бонусный счет</div>';
					}

					output += '<li class="'+lazy+'"><a data-transition="slide" data-ajax=false class="vclick_d_link"  link="'+url+'"> 					<table style="width:100%"> 						<tr> 							<td style="vertical-align: middle;text-align:center;width:64px" class="first"> 								<img src="' + value.image + '" >							 							</td> 							<td style="vertical-align:middle;text-align:left;padding-left:1.1rem;"> 								<h2 class="item_name_only '+dop_class+'">' + value.name + '</h2><div class="props">'+prop+'</div>'+row2+bonuses+' 							</td> 							<td style="width:25px"> 							</td> 						</tr> 					</table> 					 				</a></li>';
					
					
									
				}else{									
							
				output += '<li class="'+lazy+'"><a data-transition="slide" data-ajax=false class="vclick_d_link"  link="#products-list?'+url+'"> 					<table style="width:100%"> 						<tr> 							<td style="vertical-align: middle;text-align:center;width:64px"  class="first"> 								<img src="' + value.image + '" >							 							</td> 							<td style="vertical-aling:middle;text-align:left;padding-left:1.1rem;"> 								<h2 class="item_name_only '+dop_class+'">' + value.name + '</h2> 							</td> 							<td style="width:25px"> 							</td> 						</tr> 					</table> 					 				</a></li>';
							}
					
			});	
			
			}else{
				showFootbar = true;
				output = '<li><a > 					<table style="width:100%"> 						<tr> 							<td style="vertical-align: middle;text-align:center;width:64px" class="first"> 													 							</td> 							<td style="vertical-align:middle;text-align:left;padding-left:1.1rem;"> 								<h2 class="item_name_only ">Ничего не найдено....</h2>							</td> 							<td style="width:25px"> 							</td> 						</tr> 					</table> 					 				</a></li>';
			}
			
			 if( position > 0){
				  $('#products-listview').html($('#products-listview').html()+output).listview("refresh");
			 }else{
				  
				  
				  $('#products-listview').html(output).listview("refresh");
			 }	
			if(showFootbar){
				
				$("#catalog-footer").show();
				$("#filter_btn").unbind();
				$("#filter_btn").on("click",function(){
					ShowFilter(category);
				})
				
			}
			
			$(".ui-panel-open").panel("close"); 
			ProssedTapEvents();
			product_list_page_loded = true;
			 $.mobile.loading( "hide" );
			 
			  
		 }, 
	  timeout: 10000 ,
	  error: function(jqXHR, status, errorThrown){   //the status returned will be "timeout" 
		
			
			product_list_page_loded = true;
			ShowMessage(1);
			
		
	  } 
	});

}


// Выбор каталога на основе адреса страницы
function showCategory( urlObj, options )
{
			var categoryName = "";
			
			
			if(urlObj.href.search("category-items") !== -1){			
				if( urlObj.hash != undefined){
					categoryName = urlObj.hash.replace( /.*category-items=/, "" );
					
				}else{
				
				}
			}
		
			
			if ( categoryName ) {
				
				LoadDefaultCatalog(categoryName);
				
			}else{
				LoadDefaultCatalog();
				
			}
			

}
	
function LazyListView(ListId){
	// конструктор
	this.ListId = ListId;
	
	this.position = 0;
	this.count = 20;
	// Инициализация
	this.Init = function(){		
		// Эвент скрола окна
		
		
		
		window.onscroll = function() {

		
		   if($.mobile.activePage.attr('id') =="products-list"){
		   	 var WindowScrollTop = $(window).scrollTop();
			 
						 
			 if($(".lazy_load_more").length>0){
			 
			 	
			 	var diff = $(".lazy_load_more:first").offset().top - WindowScrollTop - $( window ).height();
				
				 if(diff <=600){
				 	this.LoadMore();
				 }
				 
			 }
		   	 
		   	}
			}
				
	}	
	
	this.LoadMore = function(){
		
		 this.position = this.position + this.count;
       
		 var u = $.mobile.path.parseUrl( document.URL ),
		 re = "category-items=";				
		 if ( document.URL.search(re) !== -1 ) {
            var categoryName = document.URL.replace( /.*?category-items=/, "" );
        
            $(".lazy_load_more").removeClass("lazy_load_more");
			LoadDefaultCatalog(categoryName,this.position);
			
		 }
		 
	}
	
	this.Init();
	
}		
function InitCatalog(){
			var url =  document.URL;
			var u = $.mobile.path.parseUrl( url),
			re = "category-items=";
			
			if ( url.search(re) !== -1 ) {
				showCategory( url );
				var LazyList = LazyListView("products-listview");				
			}else{
			
				LoadDefaultCatalog();
				
			}	
}

function DelegateMenu(page){
	
}	


function loadProductCard(id,owl){
		ShowLoading();
		
	if(arguments.length==2 && owl != undefined){
		var owlreinit = owl;
		
	}
	
	$.ajax({ 
	  url: "http://m.citrus.ua/ajax/product.php?id="+parseInt(id), 
	  dataType: 'json',
	   async: false, 
	  success: function( json ) {	
			if(json.page404 == undefined && json.name !== undefined){	
			
						
				$('#current_product_id').val(id);
				$('#product-card-name').html(json.name);
				$('#product-card-code').html(json.idd);
				$('#product-card-info-block-content').hide().html("");
				$('#product-card-chars-block-content').hide().html("");
				$('#product-card-info-block-content').parent().removeClass("module-open").addClass("module-close");
				$('#product-card').attr("info_load","N");
				$('#product-card').attr("chars_load","N");
				$('#product-card').attr("product_id",parseInt(id));
				$('#card_dmode_link').attr("href","http://m.citrus.ua/go.php?id="+id);
				 
				if(json.bonuses!= undefined && parseInt(json.bonuses.summ) > 2 ){
					$('#citrus_club').html(
						"<div>Возвращаем <b>"+json.bonuses.summ+" грн</b> на бонусный счет</div>"
					);
					$('#citrus_club').show();
				}else{
					$('#citrus_club').hide();
				}
				
				$('#product-card-info-link').unbind();
				//$('#product-card-info-link').attr("href","#text-page?id="+id);
				$('#product-card-info-link').on("click",function(event){
					var loc = $.mobile.path.parseLocation();
					$.mobile.changePage("#text-page?id="+id,{transition: "slide",changeHash:true});
       			 	event.preventDefault();
				});
				
				$('#product-card-props-link').unbind();
				$('#product-card-props-link').on("click",function(event){
					var loc = $.mobile.path.parseLocation();
					$.mobile.changePage("#text-page?id="+id+"&detail_text=Y",{transition: "slide",changeHash:true});
       			 	event.preventDefault();
				});
				
				
				
				$('#product-card-buy-btn').unbind().on("vclick",function(){

					StartBuyProduct(id);
				});
				if(json.can_buy!= undefined && json.can_buy=="Y" ){					
					$('#product-card-buy-btn').show();
					$('#product-card-pre-btn').hide();
					$('#product-card-status').hide();
				}else{
					$('#product-card-buy-btn').hide();
					$('#product-card-pre-btn').show();
					$('#product-card-status').html(json.can_buy_status);
					$('#product-card-status').show();
				}
		
				if(json.mini_property !== undefined){
					$('#product-card-chars-block-content').html(json.mini_property);
				}
				//--------------------------- Image Slider START
				var images = "";
				if(json.images!= undefined && $.isArray(json.images))
				$.each( json.images, function( key, value ) {
					images += '<div class="item"><div class="cell"> <img class="owl-lazy" data-src="'+value.url+'"></div></div>';
				});
				images = '<div id="product-card-images" class="owl-carousel-product-card"  >'+images+'</div>';
				
				
				
				//$("#product-card-images-contaner").html("");					
				$("#product-card-images-contaner").html(images);
				
		
				
				//--------------------------- Image Slider END
				
				//--------------------------- variations init START
				var variations = '';
				if(json.variations!= undefined && $.isArray(json.variations))
				$.each( json.variations, function( key, value ) {
				
					variations +='<div class="variation_list_contaner"><div class="variation_type_name">'+value.name+'</div><div class="variation_list_items">';		
					
					$.each( value.items, function( item_key, item_value ) {
						var active ="";
						if(item_value.active=="Y"){
							var active ="active";
						}
						if(item_value.type =="color"){
							variations +='<div class="v_color_p v_color_c '+active+'"><div class="v_color_w"><a    product_id="'+item_value.id+'" class="vclick_link_product"><div class="v_color" style="background-color:'+item_value.value+'"></div></a></div></div>';
						}
						if(item_value.type =="text"){
							variations +='<div class="v_color_p v_color_p_text  '+active+'"><div class="v_color_w v_color_w_text"><a   product_id="'+item_value.id+'"  class="vclick_link_product"><div class="v_color v_color_text">'+item_value.value+'</div></a></div></div>';
						}
					});		
					variations +='</div></div>';
					
					
				});
				$("#product-card-variations").html(variations);
				
				//--------------------------- variations init END
				//--------------------------- variations init START
				var prices = "";
				$("#current_product_price").val(0);
				if(json.prices != undefined && $.isArray(json.prices)){
					$("#current_product_price").val(json.prices[0].price);
					json.prices[0].price = json.prices[0].price.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
					prices+= '<div class="prices_item_cr"><div class="prices_item">'+json.prices[0].name+'</div><div class="prices_item_value"><div class="pre_sup_text">'+json.prices[0].price+'</div><div class="pre_sup">грн</div></div></div>';
				}
				$("#product-card-prices").html(prices);
				
					if(json.accs !== undefined){
						
				
					var output ="";
					
					$.each( json.accs, function( key, value ) {
					
					var url ;			
					url = "#product-card?product-id=" + value.id;
					var row2 = '';
						row2 = '<div class="price">'+value.price+' грн</div>';	
					
					
					var prop = "";
					if(value.props!= undefined){
						prop = value.props;
					}
					
					output += '<li class=""><a data-transition="slide" data-ajax=false product_id="'+value.id+'" class="vclick_link_product"  > 					<table style="width:100%"> 						<tr> 							<td style="vertical-align: middle;text-align:center;width:64px" class="first"> 								<img src="' + value.image + '" >							 							</td> 							<td style="vertical-align:middle;text-align:left;padding-left:1.1rem;"> 								<h2 class="item_name_only product">' + value.name + '</h2>'+row2+'</div> 							</td> 							<td style="width:25px"> 							</td> 						</tr> 					</table> 					 				</a></li>';
					
					});
					 $("#accs_container").show();
					 $('#accs-listview').html(output).listview("refresh");
					}else{
						$("#accs_container").hide();
					}

					if(owlreinit!= undefined && owlreinit ==true){
						ReinitowlProductCard();
						
					}

				
				$('#product-card-content').show();
				ProssedTapEvents();
			}else{
				document.location.href ="index.html";
				
			}
			$.mobile.loading( "hide" );
			
			
		}, 
	  timeout: 10000 ,
	  error: function(jqXHR, status, errorThrown){   //the status returned will be "timeout" 
		
			
			ShowMessage(1);
		 
	  } 
	});

}

function ShowMessage(type){
	
	var text ="";
	switch(type){
		case 1:{
			text ="Проверьте соединение с интернет";
			$.mobile.changePage('#lost-connection-page');
			if(MobileUser.DeviceReady){
				console.log(" ShowMessage  MobileUser.DeviceReady");
				navigator.splashscreen.hide();
			}
			return;
		}
			
			break;
		case 2:
			break;
		case 3:
			break;
		case 4:
			break;
		default:
			break;
	}
	alert(text);
}	

function Showtextpage(id,detail){
	var dt = "";
	if(detail!= undefined && detail == true){
		dt = "&detail_text=Y";
	}
	$('#text-page-content').html("");
	
	$.mobile.changePage("#text-page?id="+id+dt,{transition: "slide",changeHash:true});
}

function ProssedTapEvents(){
	
	 var eventstring = "vclick";
	 if(navigator.userAgent.match(/(iPad|iPhone|iPod touch);.*CPU.*OS 7_\d/i)){
	 	eventstring = "vclick";
	 }
	 
	 var ua = navigator.userAgent.toLowerCase();
	 var isAndroid = ua.indexOf("android") > -1;
	 if(isAndroid){
	 	eventstring = "tap";
	 }
	 $('.vclick_d_link').unbind();
	// $('.vclick_d_link').off();
	 $('.vclick_d_link').on(eventstring,function(event)
			 	{
					
					$('.vclick_d_link').unbind();
					$('#products-listview').html("");
					$('#search-listview').html("");
					
					event.stopPropagation();
					event.preventDefault();
					
					window.location = $(this).attr('link');
					
		
			 	}
	 );	
	 $('.vclick_link_product').unbind();
	 
	 $('.vclick_link_product').on(eventstring,function(event)
			 	{
				//	$('.vclick_link_product').unbind();
					event.stopPropagation();
					event.preventDefault();
				   
					loadProductCard($(this).attr('product_id'),true);
					window.scrollTo(0,0);
			 	}
	 );	
	 
}
function ReinitowlProductCard(){
	 //$('.owl-carousel-product-card').trigger('destroy.owl.carousel');
	
  
	 $('.owl-carousel-product-card').owlCarousel({
	    items:1,
		lazyLoad:true,
	    nav:true,
		margin:0 
    });
   
}
var main_page_load = false;
var main_images  = false;
function LoadMainPageData(){
	if(!main_page_load){
		
	
	$.ajax({ 
	  url: "http://m.citrus.ua/ajax/main.php", 
	  dataType: 'json',
	  async: true, 
	  success: function( json ) {	
			if(json.page404 == undefined ){	
				
				main_page_load = true;	
				
				var images = "";
			
				$.each( json.banner, function( key, value ) {
					
					var link = "";
					if(value.type =="external"){
						link = 'href="'+value.href+'" target="_blank"';
					}
					if(value.type =="product"){
						link = 'href="#product-card?product-id='+value.product_id+'"';
					}
                    if(value.type =="text"){
                        link = 'href="#text-page?id='+value.text_id+'"';
                    }
					 
					images += '<div class="item"><a '+link+' data-ajax=false><img class="owl-lazy gas" gac="InnerBanner" gaa="TopSliderClick" gam="'+value.name+'"  data-src="'+value.image+'"></a></div>';
				});
			
				$(".owl-carousel").html(images);
				main_images = images;
				$('.owl-carousel').trigger('destroy.owl.carousel');
				var owl = $(".owl-carousel").data('owlCarousel');
				$('.owl-carousel').owlCarousel({
				    items:1,
					lazyLoad:true,
	   				 nav:true,
					margin:0 
				});
				$.each( json.top_goods, function( key1, value1 ) {	
						var output = "";				
						$.each( value1.items, function( key, value ) {

									
									var url = "#product-card?product-id=" + value.id;
									
									var row2 = '';
									if(parseInt(value.price) > 1 && value.can_buy =="Y"){
										row2 = '<div class="price">'+value.price+' грн</div>';	
									}
									else{
										row2 = '<div class="status">'+value.can_buy_status+'</div>';;
									}
									
									
									output += '<li class=""><a data-transition="slide" data-ajax=false class="vclick_d_link"  link="'+url+'"> 					<table style="width:100%"> 						<tr> 							<td style="vertical-align: middle;text-align:center;width:64px" class="first"> 								<img src="' + value.image + '" >							 							</td> 							<td style="vertical-align:middle;text-align:left;padding-left:1.1rem;"> 								<h2 class="item_name_only product">' + value.name + '</h2>'+row2+'<div class="props">'+value.props+'</div> 							</td> 							<td style="width:25px"> 							</td> 						</tr> 					</table> 					 				</a></li>';
									
					
						});
						$('#main-listview-'+key1).html(output).listview("refresh");
			 
						
				});
				ProssedTapEvents();
				$.mobile.loading( "hide" );
			}
	  }, 
	  timeout: 8000 ,
	  error: function(jqXHR, status, errorThrown){   //the status returned will be "timeout" 
	  	console.log("error - "+status);	
		 
		ShowMessage(1);
		 
	  } 
	});
	}else{
		
		//$('.owl-carousel').trigger('refresh.owl.carousel');
		$(".owl-carousel").html(main_images);
		$('.owl-carousel').trigger('destroy.owl.carousel');
				var owl = $(".owl-carousel").data('owlCarousel');
				$('.owl-carousel').owlCarousel({
				    items:1,
					lazyLoad:true,
	   				 nav:true,
					margin:0 
				});
		$.mobile.loading( "hide" );
	}
}
function moduletoggle(module){
	if($(module).parent().hasClass("module-open")){
		$(module).parent().find(".product-card-info-content").slideUp();
		$(module).parent().removeClass("module-open").addClass("module-close");
	}else{
		$(module).parent().find(".product-card-info-content").slideDown();
		$(module).parent().removeClass("module-close").addClass("module-open");
	}
}
function echoSelectBox(value){
	var maxcount = 10;
	var temp = 	'<select onchange="ChangeBasketItem(this)">';	
	for(var i = 1; i <= 10; i++){
		if(i == value){
			temp+='<option selected value="'+i+'">'+i+' шт.</option>';
		}else{
			temp+='<option value="'+i+'">'+i+' шт.</option>';
		}
	}	
	
	return temp + '</select >';
		
}
var lastBasket = [],
	lastBasketTotal = 0;
function DoLoadBasketItems(json){

	$("#cart-list").html("");
	$('#total_price').html("");
	if(json.items != undefined && json.items.length > 0){
		lastBasket = json.items;
		var cart_items = "";
		var summ = json.total_sum + "";
		lastBasketTotal	= summ;
		summ = summ.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
		$('#total_price').html(summ+"<sup>грн</sup>");
		$.each( json.items, function( key, value ) {
		
					
					
					var dop_class=" product";
					url = "#product-card?product-id=" + value.id;
					
					var row2 = '';
					if(parseInt(value.price) > 1 && value.can_buy =="Y"){
						var count_string ="";
						if(value.qnt>1){
							count_string = value.qnt+' x ' ;
						}
						row2 = '<div class="cnr"><span id="basket_item_qnt_'+value.basket_id+'">'+count_string+'</span><span class="price">'+value.price+' грн</span> </div>';	
					}
					else{
						row2 = '<div class="status">'+value.can_buy_status+'</div>';;
					}
					cart_items += '<li id="basket_item_li_'+value.basket_id+'" class=""><a data-transition="slide" data-ajax=false class="vclick_d_link"  link="'+url+'"> 					<table style="width:100%"> 						<tr> 						<td class="delete_td"><img  item_id="'+value.basket_id+'"  class="delete_img" src="img/png/delete.png"></td>		<td style="vertical-align: middle;text-align:center;width:64px" class="first"> 								<img src="' + value.image + '" >							 							</td> 							<td style="vertical-align:middle;text-align:left;padding-left:1.1rem;"> 								<h2 id="basket_item_name_'+value.basket_id+'" class="item_name_only '+dop_class+'">' + value.name + '</h2>'+row2+' 							</td> 							<td style="width:25px" class="delete_td"> 		<div item_id="'+value.basket_id+'" class="select_basket__cnr mini_btn green">'+echoSelectBox(value.qnt)+'</div>					</td> 						</tr> 					</table> 					 				</a></li>';
		});
		$("#cart-status").html("");
		$('#cart-list').html(cart_items).listview("refresh");
		$('#order-make-btn').removeAttr("disabled");
		$("#cart_edit_button").show();
		
		ProssedTapEvents();	
	}else{
		$('#cart-list').listview("refresh");
		$('#order-make-btn').attr("disabled","disabled");
		$("#cart_edit_button").hide();
		
		
		$("#cart-status").html("Корзина пуста..");
	}
	$.mobile.loading( "hide" );
	
}
function StartLoadingBasketItems(){
	ShowLoading();
	MobileUser.basket.ListCart(DoLoadBasketItems);
}
function AfterBuyProduct(json){
	$.mobile.loading( "hide" );

	
	$.mobile.changePage( "#page-cart" );
	
}
function StartBuyProduct(product_id){
    ShowLoading();
    GA_event('OrderCreate', 'AddToCart', product_id, $('#current_product_price').val().replace(/[^\d,+]/g, ""));
	MobileUser.basket.addToCart(product_id,AfterBuyProduct);
}
function LoadCardInfo(info){
	

	if($('#product-card').attr("info_load")!="Y"){
		$('#product-card').attr("info_load","N");
		$.ajax({
		  url: "http://m.citrus.ua/ajax/on/product_info.php?id="+$('#product-card').attr("product_id"),
		  beforeSend: function( xhr ) {
		   ShowLoading();
		  }
		})
		  .done(function( data ) {
		    $.mobile.loading( "hide" );
			$('#product-card-info-block-content').html(data);
			$('#product-card').attr("info_load","Y");
		});
		
	}
	
}
function LoadTextPage(id,data){
		var send_data = data || "";
		$.ajax({
		  url: "http://m.citrus.ua/ajax/on/text-page.php?id="+id+send_data,
		  beforeSend: function( xhr ) {
		   ShowLoading();
		  }
		})
		  .done(function( data ) {
		    $.mobile.loading( "hide" );
			$('#text-page-content').html(data);
		});
	
}
function MakeOrder(){
	if(MobileUser.IsAuthorized){

        GA_event('OrderCreate', 'MakeOrder');
		$.mobile.changePage("#page-order",{changeHash:true});
	}else{
		MobileUser.LoginPromt();
	}
}
function FillOrderPageFields(json){
	
	if(json.IsAuthorized != "Y"){
		MobileUser.LoginPromt();
	}
	if(json.user_datas!= undefined){
		if(json.user_datas.NameF!= undefined)
		$("#order_fio").val(json.user_datas.NameF + " "+ json.user_datas.NameI);
		if(json.user_datas.NameI!= undefined)
		$("#order_fio_name").html( json.user_datas.NameI);
		if(json.user_datas.NameI==""){
			$("#order_fio_none_contaner").show();
			$("#order_fio_name_contaner").hide();
		}else{
			$("#order_fio_none_contaner").hide();
			$("#order_fio_name_contaner").show();
		}
		
		
		
		if(json.user_datas.Email!= undefined)
		$("#order_email").val(json.user_datas.Email);
		if(json.user_datas.City!= undefined)
		$("#order_city").val(json.user_datas.City);
		if(json.user_datas.MobilePhone!= undefined){
			$("#order_tel").val(json.user_datas.MobilePhone);
			MobileUser.mobile_phone = json.user_datas.MobilePhone;
		}
		
		
	}
	
	$.mobile.loading( "hide" );
}
function StartMakeOrderTry(){

    GA_event('OrderCreate', 'TryOrderCreate');
	MobileUser.basket.Order($("#order_fio").val(),$("#order_email").val(),$("#order_city").val(),OnMakeOrderDone)
}
function OnMakeOrderDone(json){
	
	if(json.order_id != undefined){
		// ORDER is DONE
		
        GA_addTransaction(json.order_id,'Цитрус',lastBasketTotal,0,0,'UAH');

		if(lastBasket != undefined && lastBasket.length > 0){
			$.each( lastBasket, function( key, value ) {
                GA_addTransactionItem(json.order_id,value.name,value.id,'',value.price,value.qnt,'UAH');
                console.log("order_id "+json.order_id+" name - "+value.name+" id- "+value.id+" - "+''+" price- "+value.price+" qnt- "+value.qnt+" - "+'UAH');
			});
		}

        GA_event('OrderCreate', 'OrderDone', json.order_id);
        GA_event('OrderCreate', 'OrderCreatePhone', MobileUser.mobile_phone, json.order_id);


		$('#order_done_page_order_id').html(json.order_id);		
		$.mobile.changePage("#order-done-page",{changeHash:false});
	}else{
		alert("Приносим свои изменения. При создании заказа произошла ошибка. Возможно ваша корзина пуста?");
		$.mobile.changePage("#main",{changeHash:true});
	}
}

function OpenPreorderPage(){
    GA_event( 'Preoder', 'preorder_step_1', $('#product-card').attr("product_id"), $('#current_product_price').val().replace(/[^\d,+]/g, ""));
	$("#preorder_product_contaner").html("Вы оформляете предзаказ на товар: "+$("#product-card-name").html());
	$.mobile.changePage("#page-preorder",{changeHash:true});
}

function StartMakePreOrderTry(){

	GA_event('OrderCreate','Preoder', 'preorder_step_2', $('#product-card').attr("product_id"), $('#current_product_price').val().replace(/[^\d,+]/g, ""));


    if($("#preorder_fio").val()!="" && $("#preorder_tel").val() !="" && $("#current_product_id").val()!="")
	{	
		MobileUser.basket.preOrder($("#preorder_fio").val(),$("#preorder_email").val(),$("#preorder_city").val(),$("#current_product_id").val(),$("#preorder_comment").val(),$("#preorder_tel").val(),OnMakePreOrderDone);
	}else{
		alert("Пожалуйста заполните обязательные поля !");
	}
}
function OnMakePreOrderDone(json){
	
	if(json.preorder_id != undefined){
		// ORDER is DONE
        GA_event( 'Preoder', 'preorder_step_3', $('#product-card').attr("product_id"), $('#current_product_price').val().replace(/[^\d,+]/g, ""));
		$('#order_done_page_preorder_id').html(json.preorder_id);		
		$.mobile.changePage("#preorder-done-page",{changeHash:false});
	}else{
		alert("Приносим свои изменения. При создании предзаказа произошла ошибка. Попробуйте еще раз");
		//$.mobile.changePage("#main",{changeHash:true});
	}
}
function ondelFromCart(){
	
}
function DeleteItem(item){
	
	if (confirm('Вы уверены,что хотите удалить товар "'+$("#basket_item_name_"+$(item).attr("item_id")).html()+'" из корзины?')) {
    	// Save it!
		var basket_id = $(item).attr("item_id")
		var li = $("#basket_item_li_"+basket_id);
		li.animate({width:"0%"},200);
		li.remove();
		$("#cart-list").listview("refresh");
		MobileUser.basket.delFromCart(basket_id,ondelFromCart);
		EnableBasketEditMode();
		StartLoadingBasketItems();
	} else {
	    // Do nothing!
	}
}
function EnableBasketEditMode(){
	if($("#cart-list").hasClass("edit_mode")){
		ProssedTapEvents();
		$(".delete_img").unbind();	
		$("#cart-list").removeClass("edit_mode");
		$("#cart_edit_button").html("Редактировать");
	}else{
		$("#cart-list").find(".vclick_d_link").unbind();		
		$("#cart-list").addClass("edit_mode");
		$(".delete_img").on("click",function (){
			DeleteItem(this);
		});
		$("#cart_edit_button").html("Завершить редакцию");
	}
}
function OnAfterChangeBasketItem(){
	
	ShowLoading();
	MobileUser.basket.ListCart(DoCalcBasketItems);
}
function ChangeBasketItem(select){

	 // basket_item_qnt_
	 var qnt_string = "";
	 if($(select).val()>1)
	 {
	 	qnt_string = $(select).val() + " x ";
	 }
		$("#basket_item_qnt_"+$(select).parent().attr("item_id")).html(qnt_string);
	MobileUser.basket.updateCart($(select).parent().attr("item_id"),$(select).val(),OnAfterChangeBasketItem);
}
function DoCalcBasketItems(json){
	
	if(json.items != undefined && json.items.length > 0){
		
	
		var summ = json.total_sum + "";
		summ = summ.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
		$('#total_price').html(summ+"<sup>грн</sup>");		
		//$('#cart-list').html(cart_items).listview("refresh");
		$('#order-make-btn').removeAttr("disabled");	
		
		
	}else{
		//$('#cart-list').listview("refresh");
		$('#order-make-btn').attr("disabled","disabled");
		
		
	}
	$.mobile.loading( "hide" );
	
}
function test_focus(){
	//$("#search-page-search-input").focus().trigger("click");
	$.mobile.changePage("#search-page",{changeHash:true});
}

function ShowFilter(link,back){
	ShowLoading();
	var json_props = [];
	for(key in FilterEnums.props){
				json_props.push({"prop_id":key,"data":FilterEnums.props[key]});				
	}
	$.ajax({ 
	  url: "http://m.citrus.ua/ajax/filter_params.php?link="+link, 
	  type: "POST",
	  dataType: 'json', 
	  data: {data:JSON.stringify(json_props)},
	  success: function( json ) {
			 var output = "";

			 var filter_items= "";
			 FilterEnums.active_link = link;
			 $.each( json.items, function( key, value ) {
			 		var selected_enums = FilterEnums.getEnumString(value.id);
			 		var selected_enums_string = "";
					if(selected_enums){
						selected_enums_string = '<div class="props">'+selected_enums+'</div>';
					}
			 	
			 		filter_items += '<li><a onclick="ShowFilterEnums('+"'"+value.id+"','"+value.name+"'"+')" class="ui-btn ui-btn-icon-right ui-icon-carat-r"> 					<table style="width:100%"> 						<tr> 											<td style="vertical-align:middle;text-align:left;padding-left:1.1rem;"> 								<h2 class="item_name_only">' + value.name + '</h2> '+selected_enums_string+'	</td> 							<td style="width:25px"> 							</td> 						</tr> 					</table> 					 				</a></li>';
					
			 });
			 $("#filter-page-h1").html(json.link_title);
			$('#filter-listview').html(filter_items);
			if(back == undefined){
				$.mobile.changePage('#filter-page', { transition: "slide", changeHash: true });
			}else{
				$.mobile.back();
			}
			
			//$('#cart-list').html(cart_items).listview("refresh");
			$.mobile.loading( "hide" );
	  }, 
	  timeout: 10000 ,
	  error: function(jqXHR, status, errorThrown){   //the status returned will be "timeout" 
		
			ShowMessage(1);
		
	  } 
	});		 
}

function ShowFilterEnums(id,name){
	ShowLoading();
	var json_props = [];
	for(key in FilterEnums.props){
				json_props.push({"prop_id":key,"data":FilterEnums.props[key]});				
	}
	$.ajax({ 
	  url: "http://m.citrus.ua/ajax/filter_enums.php?id="+id, 
	  type: "POST",
	  dataType: 'json', 
	  data: {data:JSON.stringify(json_props)}, 
	  success: function( json ) {
			 var output = "";
			 
			 var filter_items= "";
			 if(json!= undefined && json.length > 0){
			 FilterEnums.active_prop_id = id;	
			 
			 $.each( json, function( key, value ) {
			   if(value.usage != undefined && value.usage=="1"){
			 	
			 
			 		var check_box = "checkbox_24x24";
					var check_box_ch = "N";
					if($.inArray(value.id,FilterEnums.enums) !==-1){
						check_box  = "checkbox-hover_24x24";
						 check_box_ch = "Y";
					}
			 		
			 		filter_items += '<li><a class="ui-btn ui-btn-icon-right ui-icon-carat-r check_a" onclick="ToggleEnums(this);"  checked_box="'+check_box_ch+'"  enum_id="'+value.id+'"> 					<table style="width:100%"> 						<tr> 											<td style="vertical-align:middle;text-align:left;padding-left:1.1rem;"> 								<h2 class="item_name_only">' + value.value + '</h2>	</td> 							<td style="width:40px"> 	<img class="check_img"  src="img/png/'+check_box+'.png" >	</td> 						</tr> 					</table> 					 				</a></li>';
				}	
			 });
			$("#filter_prop_name").html(name);
			$('#filter-props-values-listview').html(filter_items);
			$( '#popupFilter').popup( 'open' );
			$.mobile.changePage('#filter-values-page', { transition: "slide", changeHash: true });
			}
			$.mobile.loading( "hide" );
	  }, 
	  timeout: 10000 ,
	  error: function(jqXHR, status, errorThrown){   //the status returned will be "timeout" 
		
			ShowMessage(1);
		 
	  } 
	});		 
}
function SaveSelectedEnums(){
	var emuns_array = [];
	$(".check_a").each(function(index){
			if($(this).attr("checked_box")=="Y"){	
				
				emuns_array.push({"name":$(this).find("h2").html(),"id":$(this).attr("enum_id")});
			}
	});
	
		FilterEnums.Set(emuns_array);

	ShowFilter(FilterEnums.active_link,true);
}

function ToggleEnums(enum_item){
	if($(enum_item).attr("checked_box")=="Y"){
		$(enum_item).attr("checked_box","N");
		$(enum_item).find(".check_img").attr("src","img/png/checkbox_24x24.png")
		
	}else{
		$(enum_item).attr("checked_box","Y");
		$(enum_item).find(".check_img").attr("src","img/png/checkbox-hover_24x24.png")
	}
	
}
function Sort_Radio_Click(radio){
	var sort = $(radio).attr("sort");
	FilterEnums.active_sort_temp = sort;
	$(".radio_img").attr("src","img/png/radiobutton_24x24.png");
	$(radio).find(".radio_img").attr("src","img/png/radiobutton-hover_24x24.png");
}

function LoadSortItems(){
	
    var sort_items ="";
	
	for(key in FilterEnums.sort_values){
		var radio_box = "radiobutton_24x24";
		if(key == FilterEnums.active_sort){
			radio_box = "radiobutton-hover_24x24";
		}
		sort_items+='<li ><a  class="ui-btn ui-btn-icon-right ui-icon-carat-r" sort="'+key+'" onclick="Sort_Radio_Click(this);"><table style="width:100%"><tbody><tr><td style="vertical-align:middle;text-align:left;padding-left:1.1rem;"> <h2 class="item_name_only">'+FilterEnums.sort_names[key]+'</h2> 	</td><td style="width:40px"> 	<img class="radio_img"  src="img/png/'+radio_box+'.png" >	</td></tr></tbody></table></a></li>';
	}
	$('#sort-listview').html(sort_items);
	$.mobile.changePage('#sort-page', { transition: "slide", changeHash: true });
}


function Enums(){
	this.sort_values = {0:"",2:"price_asc",3:"price_desc",4:"new_first"};
	this.sort_names = {0:"Сначала рекомендованные",2:"От дешевых к дорогим",3:"От дорогих к дешевым",4:"Сначала новинки"};
	this.active_sort = "0";
	this.active_sort_temp = "0";
	this.active_prop_id = 0;
	this.active_link = "";
	this.props = [];
	this.enums = [];
	this.Set = function(enums){
		if( enums != undefined){			
			this.props[this.active_prop_id] = enums;
			
			if(enums.length ==0){
				delete this.props[this.active_prop_id];
			}
			
			this.enums = [];
			
			for(key in this.props){
				for(enum_key in this.props[key]){
					this.enums.push(this.props[key][enum_key]["id"]);
				}
			}
		}	
		
	}
	this.Clear = function(){
		this.props = [];
		this.enums = [];
	}
	this.getEnumString = function(prop_id){
		if(this.props[prop_id]!= undefined){
			var string = "";
			var strings_array = [];
			for(enum_key in this.props[prop_id]){
					strings_array.push(this.props[prop_id][enum_key]["name"]);
					
			}
			if(this.props[prop_id].length > 0){
				string = strings_array.join(", ");
			}
			return string;
		}else{
			return false;
		}
		
		
	}
	this.ApplySort = function(){
		this.active_sort = this.active_sort_temp;
	}
	this.ClearSort = function(){
		this.active_sort = "0";
		this.active_sort_temp = "0";
	}
}

var FilterEnums = new Enums();

function InitShopList(){	
	
	ShowLoading();
	 
	$.ajax({ 
	  url: "json/shoplist.json", 
	  dataType: 'json', 
	  success: function( json ) {
			 var output = "";
			 var count = 0;
			
			 if(json.items !== undefined )
			 $.each( json.items, function( key, value ) {
			 	var url ;			
				
				var image = "";
				if(value.image != undefined){
					image = '<img src="' + value.image + '" >';
				}
				if(value.PROPERTY_CITY_PHONE_VALUE == undefined || value.PROPERTY_CITY_PHONE_VALUE ==""){
					value.PROPERTY_CITY_PHONE_VALUE = "0 800 501-522"
				}
				output += '<li><a o data-transition="slide" data-ajax=false   "> <table style="width:100%"><tr><td style="vertical-align: middle;text-align:center;width:64px" class="first">'+
				''+image+'</td><td style="vertical-align:middle;text-align:left;padding-left:1.1rem;"> '
				+'<h2 class="item_name_only product">' 
				+ value.city +", "+value.NAME + '</h2>	<div class="preview_text">' 
				+'Телефон: '+ value.PROPERTY_CITY_PHONE_VALUE +"</br>Время работы: "+value.PROPERTY_CITY_WORK_TIME_VALUE+ '</div></td> '+
				'</tr></table></a></li>';
				// nclick="Showtextpage('+value.id+')"
			 });	
			
				  
			$('#shoplist-listview').html(output).listview("refresh");
				
			
			 $.mobile.loading( "hide" );
			 ProssedTapEvents();			 

		 }, 
	  timeout: 10000 ,
	  error: function(jqXHR, status, errorThrown){   //the status returned will be "timeout" 
		 if(status == "timeout"){
		 	ShowMessage(1);
			 $.mobile.loading( "hide" );
		 }
	  } 
	});
}
function getAndroidVersion(ua) {
    var ua = ua || navigator.userAgent; 
    var match = ua.match(/Android\s([0-9\.]*)/);
    return match ? match[1] : false;
};
function isAndroid(ua) {
    var ua = ua || navigator.userAgent;
    var match = ua.match(/Android\s([0-9\.]*)/);
    return match ? true : false;
};

function SupportCall(){
    window.open('tel:0800501522', '_system', 'location=yes')
}
function CheckHrefChange(link){
    var page = document.location.hash;
    if(document.location.hash == ""){
        page = "#main";
    }
    if(page == $(link).attr("href")) {
        $(".ui-panel-open").panel("close");
    }
}

function go_back(){
    if(!isAndroid()){
        $.mobile.back();
        return false;
    }
}


function console_log(text){
    if($('#console').length > 0){
        $('#console').append("<div>" + text + "</div>");
    }
}

