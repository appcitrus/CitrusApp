function InitSearch(){	 LoadSearchResults(0);	 var LS = LazyListViewComponent("search-listview","search-page",LoadSearchResults);	}function LoadSearchResults(position_to_get){		var request = "&q="+encodeURIComponent($("#search-page-search-input").val());	//$('#search-listview').html("").listview("refresh");	ShowLoading();	 console.log("http://m.citrus.ua/ajax/search.php?position="+position_to_get+"&count=40"+request);		$.ajax({ 	  url: "ajax/search.php?position="+position_to_get+"&count=40"+request, 	  dataType: 'json', 	  success: function( json ) {			 var output = "";			 var count = 0;			 console.log(json.items);			 if(json.items !== undefined )			 $.each( json.items, function( key, value ) {								count = count +1;	 				var url ;							url = "category-items=" +  value.link;					var lazy = "";				if(key ==json.items.length-1)				{					if(json.parameters && json.parameters.lazy && json.parameters.lazy == 1){						//console.log("lazy retrived");						lazy = "lazy_load_more";					}				}								var dop_class="";				if(value.price){					dop_class=dop_class+" product";					url = "#product-card?product-id=" + value.id;										var row2 = '';					if(parseInt(value.price) > 1 && value.can_buy =="Y"){						row2 = '<div class="price">'+value.price+' грн</div>';						}					else{						row2 = '<div class="status">'+value.can_buy_status+'</div>';;					}															output += '<li class="'+lazy+'"><a data-transition="slide" data-ajax=false  class="vclick_d_link"  link="'+url+'"> 					<table style="width:100%"> 						<tr> 							<td style="vertical-align: middle;text-align:center;width:64px" class="first"> 								<img src="' + value.image + '" >							 							</td> 							<td style="vertical-align:middle;text-align:left;padding-left:1.1rem;"> 								<h2 class="item_name_only '+dop_class+'">' + value.name + '</h2>'+row2+'							</td> 							<td style="width:25px"> 							</td> 						</tr> 					</table> 					 				</a></li>';				}else{																	//  Для других типов контента																}								});													//console.log("position_to_get = " + position_to_get);			////console.log(output);			 if( position_to_get > 0){				  $('#search-listview').html($('#search-listview').html()+output).listview("refresh");			 }else{				  				  				  $('#search-listview').html(output).listview("refresh");			 }							 $.mobile.loading( "hide" );			 ProssedTapEvents();			 		 }, 	  timeout: 5000 ,	  error: function(jqXHR, status, errorThrown){   //the status returned will be "timeout" 		 if(status == "timeout"){		 $.mobile.loading( "hide" );			console.log('time is out');			//ShowMessage(1);			//location.reload();		 }	  } 	});}