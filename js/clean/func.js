var app_ver = '110',
    app_ver_print = '1.1 beta',
    product_list_offset = [],
    main_page_load = false,
    main_images = false,
    eventstring = (!navigator.userAgent.match(/(iPad|iPhone|iPod touch);.*CPU.*OS 7_\d/i))?"vclick":"tap";

/**
 * Main page
 *
 */
function LoadMainPageData() {
    if (!main_page_load) {
        var device = isIOS() ? "apple" : "3";
        $.ajax({
            url: "http://m.citrus.ua/ajax/main.php?app=" + device + "&bb=1",
            dataType: 'json',
            async: true,
            success: function(json) {
                if (json.page404 == undefined) {
                    main_page_load = true;
                    var images = "";
                    $.each(json.banner, function(key, value) {
                        var link = "";
                        if (value.type == "external") {
                            link = 'href="' + value.href + '" target="_blank"';
                        }
                        if (value.type == "product") {
                            link = 'href="#product-card?product-id=' + value.product_id + '"';
                        }
                        if (value.type == "text") {
                            link = 'href="#text-page?id=' + value.text_id + '"';
                        }
                        if (value.type == "section") {
                            link = 'href="#products-list?category-items=' + value.mob_link + '"';
                        }
                        if (value.type == "promo") {
                            link = 'href="#promo?id=' + value.promo_id + '"';
                        }
                        if (value.type == "any") {
                            link = value.any;
                        }
                        images += '<div class="item"><a ' + link + ' data-ajax=false><img class="owl-lazy gas" gac="InnerBanner" gaa="TopSliderClick" gam="' + value.name + '"  data-src="' + value.image + '"></a></div>';
                    });
                    main_images = images;
                    $(".owl-carousel").html(images).trigger('destroy.owl.carousel').owlCarousel({
                        items: 1,
                        lazyLoad: true,
                        nav: true,
                        autoplay: true,
                        autoplayTimeout: 10000,
                        margin: 0
                    });
                    $.each(json.top_goods, function(key1, value1) {
                        var output = "";
                        $.each(value1.items, function(key, value) {
                            output += generateSectionProductItem(value, '');
                        });
                        $('#main-listview-' + key1).html(output).listview("refresh");
                    });
                    MobileUser.basket.getViewedProducts(showViewedProductsOnMain);
                    var device = isIOS() ? "apple" : "3";
                    $.ajax({
                        url: "http://m.citrus.ua/ajax/on/status.php?app=" + device + "&ver=" + app_ver,
                        dataType: 'json',
                        async: true,
                        success: function(res) {
                            if (res.CatalogAllow != 'N') {
                                $('.world').removeClass('world');
                            }
                            if (res.needUpdate == 'Y') {
                                var nuStatus = MobileUser.GetStorage('needUpdate');
                                if (nuStatus != undefined && nuStatus == app_ver) {
                                    $('#needUpdate').remove();
                                }
                                if (!isIOS()) {
                                    $('#needUpdate').html('<div class="needUpdate_bg"></div><div class="needUpdateContent"><div class="needUpdateLogo"><img src="img/png/logo.png"></div><div class="needUpdateTitle">Доступна новая версия<br>приложения ' + res.version + '</div><div class="needUpdateText">ЧТО НОВОГО<br>' + res.needUpdateText + '</div><button id="needUpdateButton" class="green_btn ui-btn ui-corner-all"><i class="c_icon c_need_update c_ibtn"></i>    Обновить</button><span class="needNoUpdate">Спасибо. Продолжаю использовать старую версию</span></div>').show();
                                }
                                if (!MobileUser.IsAuthorized) {
                                    var loStatus = sessionStorage.getItem('needLogin');
                                    if (loStatus != undefined) {
                                        $('#needLogin').remove();
                                    } else {
                                        ShowAutorizationWindow();
                                    }
                                }
                            }
                            $('.app_version').html(' v. ' + app_ver_print);
                        }
                    });
                    //MobileUser.basket.getViewedProducts(showViewedProductsOnMain);
                    ProssedTapEvents();
                    $.mobile.loading("hide");
                }
            },
            timeout: 25000,
            error: function(jqXHR, status, errorThrown) { //the status returned will be "timeout" 
                console.log("error - " + status);
                ShowMessage(1);
            }
        });
    } else {
        $(".owl-carousel").html(main_images).trigger('destroy.owl.carousel').owlCarousel({
            items: 1,
            lazyLoad: true,
            nav: true,
            margin: 0
        });
        $.mobile.loading("hide");
    }
}

/**
 * Главный Каталог
 * @param {[type]} category [description]
 * @param {[type]} position [description]
 * @param {[type]} count    [description]
 */
function LoadDefaultCatalog(category, position, count) {
    var counts = count ? count : 20;
    product_list_page_loded = false;
    var request = "",
        position_to_get = "0";
    if (arguments.length == 1 && category != undefined) {
        request = "&link=" + category;
        ShowLoading();
    }
    if (arguments.length == 2 && category != undefined) {
        request = "&link=" + category;
        ShowLoading();
        var position_to_get = position;
    }
    if (arguments.length == 3 && category != undefined) {
        request = "&link=" + category;
        ShowLoading();
        counts = (Math.ceil(counts / 20) * 20);
        var position_to_get = 0;
    }
    $("#catalog-footer").hide();
    var showFootbar = false,
        json_props = [];
    for (key in FilterEnums.props) {
        json_props.push({
            "prop_id": key,
            "data": FilterEnums.props[key]
        });
    }
    if (FilterEnums.active_sort > 0) {
        request += "&sort=" + FilterEnums.sort_values[FilterEnums.active_sort];
    }
    $.ajax({
        url: "http://m.citrus.ua/ajax/catalog_lazy.php?position=" + position_to_get + "&count=" + counts + request,
        type: "POST",
        dataType: 'json',
        data: {
            data: JSON.stringify(json_props)
        },
        success: function(json) {
            var output = "",
                count = 0;
            if (json.items != undefined && json.items.length > 0) {
                $.each(json.items, function(key, value) {
                    var url,
                        lazy = "";
                    count = count + 1;
                    url = "category-items=" + value.link;
                    if (key == json.items.length - 1) {
                        if (json.parameters && json.parameters.lazy && json.parameters.lazy == 1) {
                            lazy = "lazy_load_more";
                        }
                    }
                    if (json.parameters != undefined && json.parameters.parent_name != undefined && $("#CatalogBack").length > 0) {
                        $("#CatalogBack").html(json.parameters.parent_name);
                    }
                    output += generateSectionProductItem(value, lazy);
                });
            } else {
                showFootbar = true;
                output = '<li><a><table style="width:100%"><tr><td style="vertical-align: middle;text-align:center;width:64px" class="first"></td><td style="vertical-align:middle;text-align:left;padding-left:1.1rem;"><h2 class="item_name_only ">Ничего не найдено....</h2></td><td style="width:25px"></td></tr></table></a></li>';
            }
            if (position > 0 && position != null) {
                output = $('#products-listview').html() + output;
            }
            $('#products-listview').html(output).listview("refresh");
            if (savePos !== null && savePos > 0 && product_list_offset[savePos] != undefined) {
                this.position = counts;
                $.mobile.silentScroll(product_list_offset[savePos]);
            }
            if (showFootbar) {
                $("#catalog-footer").show();
                $("#global-up-button").css('bottom', '60px');
                $("#filter_btn").unbind().on("click", function() {
                    ShowFilter(category);
                })
            }
            ProssedTapEvents();
            product_list_page_loded = true;
            var images = "",
                owlcs = $(".owl-carousel-section");
            owlcs.html('');
            if (json.banner != undefined) {
                $.each(json.banner, function(key, value) {
                    var link = "";
                    if (value.type == "external") {
                        link = 'href="' + value.href + '" target="_blank"';
                    }
                    if (value.type == "product") {
                        link = 'href="#product-card?product-id=' + value.product_id + '"';
                    }
                    if (value.type == "promo") {
                        link = 'href="#promo?id=' + value.promo_id + '"';
                    }
                    if (value.type == "any") {
                        link = value.any;
                    }
                    images += '<div class="item"><a ' + link + ' data-ajax=false><img class="owl-lazy gas" gac="InnerBanner" gaa="TopSliderClick" gam="' + value.name + '"  data-src="' + value.image + '"></a></div>';
                });
                if (owlcs != undefined && owlcs.find("div").length > 1) {
                    owlcs.html(images);
                    owlcs.trigger('destroy.owl.carousel');
                    var owl = $(".owl-carousel").data('owlCarousel');
                    owlcs.owlCarousel({
                        items: 1,
                        lazyLoad: true,
                        loop: true,
                        nav: true,
                        autoplay: true,
                        autoplayTimeout: 10000,
                        margin: 0
                    });
                }
            }
            $.mobile.loading("hide");
        },
        timeout: 25000,
        error: function(jqXHR, status, errorThrown) { //the status returned will be "timeout" 
            product_list_page_loded = true;
            ShowMessage(1);
        }
    });
}

/**
 * Checking SVG support
 * @return {[type]} [description]
 */
function supportsSVG() {
    return !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', "svg").createSVGRect;
}

/**
 * Loading js/css files
 * @param  {[type]} filename [description]
 * @param  {[type]} filetype [description]
 * @return {[type]}          [description]
 */
function loadjscssfile(filename, filetype) {
    if (filetype == "js") { //if filename is a external JavaScript file
        var fileref = document.createElement('script')
        fileref.setAttribute("type", "text/javascript")
        fileref.setAttribute("src", filename)
    } else if (filetype == "css") { //if filename is an external CSS file
        var fileref = document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }
    if (typeof fileref != "undefined") document.getElementsByTagName("head")[0].appendChild(fileref)
}
if (supportsSVG()) {
    loadjscssfile("css/icons-svg.css", "css");
} else {
    loadjscssfile("css/icons-png.css", "css");
}

function changePage(page) {
    $.mobile.changePage(page, {
        transition: "none",
        changeHash: false
    });
}
var loaded_pages = new Array();

function include_page(page_name) {
    if ($("#" + page_name).length == 0) {
        loadjscssfile("/pages/" + page_name + "/style.css?", "css");
        $(document).on("pageinit", "#" + page_name, function() {
            $(".navPanelChild.menu_to_clone").each(function(key, value) {
                var navpanelCopy = $("#nav-panel").html();
                $(value).html(navpanelCopy).trigger("updatelayout");
                $(value).find('[data-role="listview"]').listview();
            });
            $('#' + page_name + ' .cit_panel_href').on(eventstring, function(event) {
                event.stopPropagation();
                event.preventDefault();
                $($(this).attr('link')).panel("open");
            });
            loadjscssfile("/pages/" + page_name + "/script.js?", "js");
            changePage("#" + page_name);
        });
        $.get("/pages/" + page_name + "/index.html?", function(data) {
            loaded_pages[page_name] = data;
            $("body").append(data);
            $("#" + page_name).page();
        });
    } else {
        changePage("#" + page_name);
    }
}

function goBack() {
    var previousPage = $.mobile.activePage.data('ui.prevPage');
    if (typeof previousPage.prevObject[0] != 'undefined') {
        $.mobile.changePage(previousPage.prevObject[0].id, 'slide', true, true);
    }
}
// Инициализация свайпа навигационного меню
/*function  SwipeInit(){
    $("html").swipe({
          swipeLeft:function(event, direction, distance, duration, fingerCount) {
            $( "#nav-panel" ).panel( "close" );
          },
          swipeRight:function(event, direction, distance, duration, fingerCount) {
            $("#nav-panel" ).panel( "open" );
          }
    });             
}*/
// The display icons standby load data
function ShowLoading() {
    var $this = $(this),
        theme = $this.jqmData("theme") || $.mobile.loader.prototype.options.theme,
        msgText = $this.jqmData("msgtext") || $.mobile.loader.prototype.options.text,
        textVisible = $this.jqmData("textvisible") || $.mobile.loader.prototype.options.textVisible,
        textonly = !!$this.jqmData("textonly");
    html = $this.jqmData("html") || "";
    $.mobile.loading("show", {
        text: msgText,
        textVisible: textVisible,
        theme: theme,
        textonly: textonly,
        html: html
    });
}
// Инициализация зависимости visability элемента от прокрутки страницы
function InitScrollElementVisability(id, scrollposition) {
    $(window).scroll(function() {
        if ($(window).scrollTop() > scrollposition) {
            $('#search').hide();
        } else {
            $('#search').show();
        }
    });
}

// The directory selection on the basis of the page address
function showCategory(urlObj, options) {
    var categoryName = "";
    if (urlObj.href.search("category-items") !== -1) {
        if (urlObj.hash != undefined) {
            categoryName = urlObj.hash.replace(/.*category-items=/, "");
        }
    }
    if (categoryName) {
        if (savePos !== undefined && savePos > 0) {
            LoadDefaultCatalog(categoryName, savePos, savePos);
        } else {
            LoadDefaultCatalog(categoryName);
        }
    } else {
        LoadDefaultCatalog();
    }
}

function LazyListView(ListId) {
    // constructor
    this.ListId = ListId;
    if (savePos !== null && savePos > 0) {
        this.position = (Math.ceil(savePos / 20) * 20) - 20;
    } else {
        this.position = 0;
    }
    this.count = 20;
    // Initialization
    this.Init = function() {
        // Event scroll window
        window.onscroll = function() {
            if ($.mobile.activePage.attr('id') == "products-list") {
                var jj = this.position;
                while (jj < (this.position + 20)) {
                    var item = $('#products-listview li').eq(jj);
                    if (item.length) {
                        product_list_offset[jj] = item.offset().top;
                    }
                    jj++;
                }
                var WindowScrollTop = $(window).scrollTop();
                if ($(".lazy_load_more").length > 0) {
                    var diff = $(".lazy_load_more:first").offset().top - WindowScrollTop - $(window).height();
                    if (diff <= 600) {
                        this.LoadMore();
                    }
                }
            }
        }
    }
    this.LoadMore = function() {
        this.position = this.position + this.count;
        var u = $.mobile.path.parseUrl(document.URL),
            re = "category-items=";
        if (document.URL.search(re) !== -1) {
            var categoryName = document.URL.replace(/.*?category-items=/, "");
            $(".lazy_load_more").removeClass("lazy_load_more");
            LoadDefaultCatalog(categoryName, this.position);
        }
    }
    this.Init();
}

function InitCatalog() {
    var url = document.URL;
    var u = $.mobile.path.parseUrl(url),
        re = "category-items=";
    if (url.search(re) !== -1) {
        showCategory(url);
        var LazyList = LazyListView("products-listview");
    } else {
        LoadDefaultCatalog();
    }
}

function DelegateMenu(page) {}

/**
 * Product card
 * @param  {[type]} id  [description]
 * @param  {[type]} owl [description]
 * @return {[type]}     [description]
 */
function loadProductCard(id, owl){
    //Проверка на Распродажу
    var sale_uri = ($.mobile.path.parseUrl(document.URL).href.search("sale=1") !== -1) ? '&sale=1' : '';

    ShowLoading();
    if (arguments.length == 2 && owl != undefined) {
        var owlreinit = owl;
    }
    $.ajax({
        url: "http://m.citrus.ua/ajax/product.php?id=" + parseInt(id) + sale_uri,
        dataType: 'json',
        async: false,
        success: function(json) {
            if (json.page404 == undefined && json.name !== undefined) {
                MobileUser.basket.setViewedProduct(id);
                $('#current_product_id').val(id);
                $('#product-card-name').html(json.name);
                $("#state_and_specbonus").html("");
                if (json.state != null && json.state != undefined) {
                    $('#state_and_specbonus').html("<div id='box_state'>" + json.state + '</div><br/>');
                }
                if (json.bonus_spec != false && json.bonus_spec != undefined) {
                    $("#box_bonus_spec").remove();
                    $("#state_and_specbonus").append("<div id='box_bonus_spec'><div id='product-card-bonus_spec'>Бонус: " + json.bonus_spec + " грн</div></div>");
                }

                $('#sticker_img').html(json.sticker_img);
                $('#product-card-code').html(json.idd);
                $('#product-card-info-block-content,#product-card-chars-block-content').hide().html("");
                $('#product-card-info-block-content').parent().removeClass("module-open").addClass("module-close");
                $('#product-card').attr({"info_load": "N","chars_load": "N","product_id": parseInt(id)});
                $('#card_dmode_link').attr("href", "http://m.citrus.ua/go.php?id=" + id);
                $('#citrus_club').hide();
                if (json.bonuses != undefined && parseInt(json.bonuses.summ) > 2) {
                    $('#citrus_club').html("<div>Возвращаем <b>" + json.bonuses.summ + " грн</b> на бонусный счет</div>").show();
                }

                $('#product-card-info-link').unbind().on("click", function(event) {
                    var loc = $.mobile.path.parseLocation();
                    $.mobile.changePage("#text-page?id=" + id, {
                        transition: "slide",
                        changeHash: true
                    });
                    event.preventDefault();
                });

                $('#product-card-reviews-link').unbind().on("click", function(event) {
                    $('#reviews-page-content').html('');
                    var loc = $.mobile.path.parseLocation();
                    window.open("http://m.citrus.ua/#reviews-page?id=" + id, '_system', 'location=yes');
                    event.preventDefault();
                });

                $('#product-card-wish-add-link').unbind().on("click", function(event) {
                    var loc = $.mobile.path.parseLocation();
                    window.location = "#wish-add-page?id=" + id;
                    event.preventDefault();
                });

                $('#product-card-props-link').unbind().on("click", function(event) {
                    var loc = $.mobile.path.parseLocation();
                    $.mobile.changePage("#text-page?id=" + id + "&detail_text=Y", {
                        transition: "slide",
                        changeHash: true
                    });
                    event.preventDefault();
                });

                //event sample buy button
                $('#product-card-buy-btn').unbind().on("vclick", function() {
                    StartBuyProduct(id);
                });

                //event CO button
                $('#product-card-co-buy-btn').unbind().on("vclick", function() {
                    StartBuyProductCO(id);
                });

                //event sale buy
                $('#product-card-sale-buy-btn').unbind().on("vclick", function() {
                    StartBuyProductSale(id);
                });

                //show/hide buy buttons
                $('.g_menu_payment_parts,#product-card-buy-btn,#product-card-pre-btn,#product-card-sale-buy-btn').hide();
                if(!!json.can_buy){
                    //if sale
                    if (json.can_buy == "Y" && !!json.sale && json.sale=='1') {
                        $('#product-card-sale-buy-btn').show();
                    } else if (json.can_buy == "Y") {
                        $('#product-card-buy-btn, .g_menu_payment_parts').show();
                        $('#product-card-status').hide();
                    } else if (json.can_buy != "N"){
                        $('#product-card-pre-btn, #product-card-status').show();
                    }
                    $('#product-card-status').html(json.can_buy_status).show();
                }

                //show mini propertys
                if (json.mini_property !== undefined) {
                    $('#product-card-chars-block-content').html(json.mini_property);
                }
                //--------------------------- Image Slider START
                var images = "";
                if (json.images != undefined && $.isArray(json.images)) $.each(json.images, function(key, value) {
                    images += '<div class="item"><div class="cell"> <img class="owl-lazy" data-src="' + value.url + '"></div></div>';
                });
                images = '<div id="product-card-images" class="owl-carousel-product-card"  >' + images + '</div>';
                $("#product-card-images-contaner").html(images);
                //--------------------------- Image Slider END
                //--------------------------- variations init START
                var variations = '';
                if (json.variations != undefined && $.isArray(json.variations)) $.each(json.variations, function(key, value) {
                    variations += '<div class="variation_list_contaner"><div class="variation_type_name">' + value.name + '</div><div class="variation_list_items">';
                    $.each(value.items, function(item_key, item_value) {
                        var product_not_available = '';
                        if (typeof(item_value.can_buy) !== "undefined" && item_value.can_buy['can_buy'] != 'Y') {
                            product_not_available = 'product_not_available';
                        }
                        var active = "";
                        if (item_value.active == "Y") {
                            var active = "active";
                        }
                        if (item_value.type == "color") {
                            variations += '<div class="v_volor_item"><div class="v_color_p v_color_c ' + active + '"><div class="v_color_w"><a product_id="' + item_value.id + '" class="vclick_link_product"><div class="v_color" style="background-color:' + item_value.value + '"></div></a></div></div></div>';
                        }
                        if (item_value.type == "text") {
                            variations += '<div class="v_color_p v_color_p_text ' + active + '"><div class="v_color_w v_color_w_text ' + product_not_available + '"><a   product_id="' + item_value.id + '"  class="vclick_link_product"><div class="v_color v_color_text ' + product_not_available + '">' + item_value.value + '</div></a></div></div>';
                        }
                    });
                    variations += '</div></div>';
                });
                $("#product-card-variations").html(variations);
                //--------------------------- variations init END
                //--------------------------- variations init START
                var prices = "",
                    pricesco = "";
                $("#current_product_price").val(0);
                if (json.prices != undefined && $.isArray(json.prices)) {
                    $('#product-card-prices-co-box,.hr_co').hide();
                    $("#product-card-prices-co").html('');
                    if (json.price_co != undefined && json.price_co > 0 && json.can_buy == "Y") {
                        json.price_co = json.price_co.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                        pricesco += '<div class="prices_item_co prices_item_cr"><a class="on_co_programm" onclick="Showtextpage(209886,true)">по программе <br />«Цитрус Обмен»</a><div class="prices_item_value"><div class="pre_sup_text green_price">' + json.price_co + '</div><div class="pre_sup green_price">грн</div></div></div>';
                        $('#product-card-co-buy-btn').attr('coid', json.set_owner);
                        $("#product-card-prices-co").html(pricesco);
                        $('#product-card-prices-co-box,.hr_co').show();
                    }
                    $("#current_product_price").val(json.prices[0].price);
                    json.prices[0].price = json.prices[0].price.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                    if(!!json.sale_price){
                        if(!!json.sale_old_price){
                            $("#product-card-old_prices").html(json.sale_old_price);
                        }
                        prices += '<div class="prices_item_cr"><div class="prices_item">цена распродажи</div><div class="prices_item_value"><div class="pre_sup_text">' + json.sale_price + '</div><div class="pre_sup">грн</div></div></div>';
                    }else{
                        prices += '<div class="prices_item_cr"><div class="prices_item">' + json.prices[0].name + '</div><div class="prices_item_value"><div class="pre_sup_text">' + json.prices[0].price + '</div><div class="pre_sup">грн</div></div></div>';
                    }
                }
                $("#product-card-prices").html(prices);
                $("#product-card-old_prices").html(json.old_price);
                //bundle
                var output = "";
                $("#bundle_block").hide();
                if (json.bundle !== undefined && json.bundle != null) {
                    if (json.bundle.bundle !== undefined) {
                        $.each(json.bundle.bundle, function(key, bundle_item) {
                            if (bundle_item != null) {
                                diskount_block = (bundle_item.old_price > 0) ? '<div class="bundle_item_skidka"><span class="bundle_strong">-' + bundle_item.diskount + '</span><span>' + bundle_item.diskount_type + '</span></div>' : '';
                                price_class = (bundle_item.old_price > 0) ? 'old_price_yes_new' : '';
                                output += '<li><a data-transition="slide" data-ajax=false bundle_id="' + bundle_item.id + '" class="vclick_bundle"><table style="width:100%"><tr><td class="first aligntab64"><div class="bundle_item ' + price_class + '"><img src="' + json.bundle.main.image + '"><br /><div class="price">' + json.bundle.main.price_print + 'грн</div></div></td><td class="aligntab64 bundle_plus">+</td><td class="aligntab64"><div class="bundle_item">' + diskount_block + '<img src="' + bundle_item.image + '"><br /> <div class="binline bindlecross"><div class="price pricegray">' + bundle_item.old_price_print + '</div></div><div class="price binline">' + bundle_item.price_print + ' грн</div> </div></td><td width="10"></td></tr></table></a></li>';
                            }
                        });
                    }
                    if (json.bundle.bundle2 !== undefined) {
                        $.each(json.bundle.bundle2, function(key, bundle_items) {
                            output += '<li><a data-transition="slide" data-ajax=false bundle_id="' + bundle_items.id + '" class="vclick_bundle"><table style="width:100%"><tr>';
                            if (bundle_items.items != null) {
                                var i = 0;
                                $.each(bundle_items.items, function(key, bundle_item) {
                                    diskount_block = (bundle_item.DISCOUNT_PERCENT > 0) ? '<div class="bundle_item_skidka"><span class="bundle_strong">-' + bundle_item.DISCOUNT_PERCENT + '</span><span>%</span></div>' : '';
                                    price_class = (bundle_item.old_price > 0) ? 'old_price_yes_new' : '';
                                    output += '<td class="aligntab64"><div class="bundle_item ' + price_class + ' ">' + diskount_block + '<img src="' + bundle_item.image + '"><br /><div class="binline bindlecross"><div class="price pricegray">' + bundle_item.old_price_print + '</div></div><div class="price binline">' + bundle_item.price_print + ' грн</div></div></td>';
                                    if (i == 0) {
                                        output += '<td class="aligntab64 bundle_plus">+</td>';
                                        i = 1;
                                    }
                                });
                            }
                            output += '<td width="10"></td></tr></table></a></li>';
                        });
                    }
                    if (output != '') {
                        $("#bundle_block").show();
                    }
                    $('#bundle-listview').html(output).listview("refresh");
                }
                if (json.accs !== undefined) {
                    var output = "";
                    $.each(json.accs, function(key, value) {
                        if (value != null) {
                            var url;
                            url = "#product-card?product-id=" + value.id;
                            var row2 = '';
                            row2 = '<div class="price">' + value.price + ' грн</div>';
                            var prop = "";
                            if (value.props != undefined) {
                                prop = value.props;
                            }
                            output += '<li class=""><a data-transition="slide" data-ajax=false product_id="' + value.id + '" class="vclick_link_product"><table style="width:100%"><tr><td style="vertical-align: middle;text-align:center;width:64px" class="first"><img src="' + value.image + '" ></td><td style="vertical-align:middle;text-align:left;padding-left:1.1rem;"><h2 class="item_name_only product">' + value.name + '</h2>' + row2 + '</div></td><td style="width:25px"></td></tr></table></a></li>';
                        }
                    });
                    $("#accs_container").show();
                    $('#accs-listview').html(output).listview("refresh");
                } else {
                    $("#accs_container").hide();
                }
                if (owlreinit != undefined && owlreinit == true) {
                    ReinitowlProductCard();
                }
                if (json.product_actions !== undefined) {
                    var output = "";
                    $.each(json.product_actions, function(key, item) {
                        if (item.text_page_id > 0) {
                            output += '<li class=""><a class="product_actions_gas" onclick="Showtextpage(' + item.text_page_id + ')"><h2>' + item.name + '</h2>' + item.content + '</a></li>';
                        } else {
                            output += '<li class=""><h2>' + item.name + '</h2>' + item.content + '</li>';
                        }
                    });
                    $("#product_actions_block").show();
                    $('#product-actions-listview').html(output).listview("refresh");
                } else {
                    $("#product_actions_block").hide();
                }
                MobileUser.basket.getViewedProducts(showViewedProductsOnProduct);
                $('#product-card-content').show();
                ProssedTapEvents();
            } else {
                document.location.href = "index.html";
            }
            $.mobile.loading("hide");
        },
        timeout: 25000,
        error: function(jqXHR, status, errorThrown) { //the status returned will be "timeout" 
            ShowMessage(1);
        }
    });
}

function ShowMessage(type) {
    var text = "";
    switch (type) {
        case 1:
            {
                text = "Проверьте соединение с интернет";
                $.mobile.changePage('#lost-connection-page');
                if (MobileUser.DeviceReady) {
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

function getVersion(ua) {
    var ua = (ua || navigator.userAgent).toLowerCase();
    if (ua.match(/(ipad|iphone|ipod)/g)) {
        return false;
    } else {
        var match = ua.match(/roid\s([0-9\.]*)/);
        return match ? match[1] : false;
    }
};

function isIOS(ua) {
    var ua = ua || navigator.userAgent;
    return (ua.match(/(iPad|iPhone|iPod)/g) ? true : false);
};

function Showtextpage(id, detail) {
    var dt = "";
    if (detail != undefined && detail == true) {
        dt = "&detail_text=Y";
    }
    $('#text-page-content').html("");
    $.mobile.changePage("#text-page?id=" + id + dt, {
        transition: "slide",
        changeHash: true
    });
}

function ProssedTapEvents() {
    $('.vclick_d_link').unbind().on(eventstring, function(event) {
        if ($.mobile.activePage.attr('id') == "products-list") {
            savePos = $(this).parent('li').index();
        }
        $('.vclick_d_link').unbind();
        $('#search-page-search-input').val("");
        $('#products-listview').html("");
        $('#search-listview').html("");
        event.stopPropagation();
        event.preventDefault();
        window.location = $(this).attr('link');
    });
    $('.vclick_link_product').unbind().on(eventstring, function(event) {
        event.stopPropagation();
        event.preventDefault();
        loadProductCard($(this).attr('product_id'), true);
        window.scrollTo(0, 0);
    });
    $('.vclick_bundle').unbind().on(eventstring, function(event) {
        event.stopPropagation();
        event.preventDefault();
        window.location = "#bundle?bundle_id=" + $(this).attr('bundle_id');
        window.scrollTo(0, 0);
    });
}

function ReinitowlProductCard() {
    $('.owl-carousel-product-card').owlCarousel({
        items: 1,
        lazyLoad: true,
        nav: true,
        margin: 0
    });
}

function moduletoggle(module) {
    var mp = $(module).parent();
    if (mp.hasClass("module-open")) {
        mp.find(".product-card-info-content").slideUp();
        mp.removeClass("module-open").addClass("module-close");
    } else {
        mp.find(".product-card-info-content").slideDown();
        mp.removeClass("module-close").addClass("module-open");
    }
}

function echoSelectBox(value) {
    var maxcount = 10,
        temp = '<select onchange="ChangeBasketItem(this)">';
    for (var i = 1; i <= 10; i++) {
        if (i == value) {
            temp += '<option selected value="' + i + '">' + i + ' шт.</option>';
        } else {
            temp += '<option value="' + i + '">' + i + ' шт.</option>';
        }
    }
    return temp + '</select >';
}
var lastBasket = [],
    lastBasketTotal = 0;

function DoLoadBasketItems(json) {
    $("#cart-list,#total_price").html("");
    if (!!json.items && json.items.length > 0) {
        lastBasket = json.items;
        var cart_items = "",
            summ = json.total_sum + "";
        lastBasketTotal = summ;
        summ = summ.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        $('#total_price').html(summ + "<sup>грн</sup>");
        $.each(json.items, function(key, value) {
            var dop_class = " product",
                url = "#product-card?product-id=" + value.id,
                row2 = '';
            if(!!value.sale && value.sale=='Y'){
                url = url+"&sale=1";
            }
            if (parseInt(value.price) > 1 && value.can_buy == "Y") {
                var count_string = "";
                if (value.qnt > 1) {
                    count_string = value.qnt + ' x ';
                }
                row2 = '<div class="cnr"><span id="basket_item_qnt_' + value.basket_id + '">' + count_string + '</span><span class="price">' + value.price + ' грн</span> </div>';
            } else {
                row2 = '<div class="status">' + value.can_buy_status + '</div>';;
            }
            cart_items += '<li id="basket_item_li_' + value.basket_id + '" class=""><a data-transition="slide" data-ajax=false class="vclick_d_link"  link="' + url + '"><table style="width:100%"><tr><td class="delete_td"><img  item_id="' + value.basket_id + '" class="delete_img" src="img/png/delete.png"></td><td style="vertical-align: middle;text-align:center;width:64px" class="first"><img src="' + value.image + '" ></td><td class="middle_td"><h2 id="basket_item_name_' + value.basket_id + '" class="item_name_only ' + dop_class + '">' + value.name + '</h2>' + row2 + '</td><td style="width:25px" class="delete_td_2"><div item_id="' + value.basket_id + '" class="select_basket__cnr mini_btn green">' + echoSelectBox(value.qnt) + '</div></td></tr></table></a></li>';
        });
        $("#cart-status").html("");
        $('#cart-list').html(cart_items).listview("refresh");
        $('#order-make-btn').removeAttr("disabled");
        $("#cart_edit_button").show();
        ProssedTapEvents();
    } else {
        $('#cart-list').listview("refresh");
        $('#order-make-btn').attr("disabled", "disabled");
        $("#cart_edit_button").hide();
        $("#cart-status").html("Корзина пуста..");
    }
    $.mobile.loading("hide");
}

function StartLoadingBasketItems() {
    ShowLoading();
    MobileUser.basket.ListCart(DoLoadBasketItems);
}

function AfterBuyProduct(json) {
    $.mobile.loading("hide");
    $.mobile.changePage("#page-cart");
}

function StartBuyProduct(product_id) {
    ShowLoading();
    GA_event('OrderCreate', 'AddToCart', product_id, $('#current_product_price').val().replace(/[^\d,+]/g, ""));
    MobileUser.basket.addToCart(product_id, AfterBuyProduct);
}

function StartBuyProductCO(product_id) {
    ShowLoading();
    GA_event('OrderCreate', 'AddToCartCO', product_id, $('#current_product_price').val().replace(/[^\d,+]/g, ""));
    var coid = $('#product-card-co-buy-btn').attr('coid');
    MobileUser.basket.addToCartCO(product_id, coid, AfterBuyProduct);
}

function StartBuyProductSale(product_id) {
    ShowLoading();
    GA_event('send', 'event', 'OrderCreate', 'AddToCartSale', product_id, $('#current_product_price').val().replace(/[^\d,+]/g, ""));
    MobileUser.basket.addToCartSale(product_id, AfterBuyProduct);
}

function LoadCardInfo(info) {
    if ($('#product-card').attr("info_load") != "Y") {
        $('#product-card').attr("info_load", "N");
        $.ajax({
            url: "http://m.citrus.ua/ajax/on/product_info.php?id=" + $('#product-card').attr("product_id"),
            beforeSend: function(xhr) {
                ShowLoading();
            }
        }).done(function(data) {
            $.mobile.loading("hide");
            $('#product-card-info-block-content').html(data);
            $('#product-card').attr("info_load", "Y");
        });
    }
}

function LoadTextPage(id, data) {
    var send_data = data || "";
    $.ajax({
        url: "http://m.citrus.ua/ajax/on/text-page.php?app=1&vp=2&id=" + id + send_data,
        beforeSend: function(xhr) {
            ShowLoading();
        }
    }).done(function(data) {
        $.mobile.loading("hide");
        $('#text-page-content').html(data);
        if ($("div").is(".social-likes")) {
            $('.social-likes').socialLikes();
        }
    });
    initSubmitWebForm();
}

function MakeOrder() {
    if (MobileUser.IsAuthorized) {
        GA_event('OrderCreate', 'MakeOrder');
        $.mobile.changePage("#page-order", {
            changeHash: true
        });
    } else {
        MobileUser.LoginPromt();
    }
}

function FillOrderPageFields(json) {
    if (json.IsAuthorized != "Y") {
        MobileUser.LoginPromt();
    }
    if (json.user_datas != undefined) {
        if (json.user_datas.NameF != undefined) $("#order_fio").val(json.user_datas.NameF + " " + json.user_datas.NameI);
        if (json.user_datas.NameI != undefined) $("#order_fio_name").html(json.user_datas.NameI);
        if (json.user_datas.NameI == "") {
            $("#order_fio_none_contaner").show();
            $("#order_fio_name_contaner").hide();
        } else {
            $("#order_fio_none_contaner").hide();
            $("#order_fio_name_contaner").show();
        }
        if (json.user_datas.Email != undefined) $("#order_email").val(json.user_datas.Email);
        if (json.user_datas.City != undefined) $("#order_city").val(json.user_datas.City);
        if (json.user_datas.MobilePhone != undefined) {
            $("#order_tel").val(json.user_datas.MobilePhone);
            MobileUser.mobile_phone = json.user_datas.MobilePhone;
        }
    }
    $.mobile.loading("hide");
}

function FillPersonalPageFields(json) {
    if (json.IsAuthorized != "Y") {
        MobileUser.LoginPromt();
    }
    if (json.user_datas != undefined) {
        if (json.user_datas.NameF != undefined) {
            $("#personal_NameF").val(json.user_datas.NameF);
        }
        if (json.user_datas.NameI != undefined) {
            $("#personal_NameI").val(json.user_datas.NameI);
            $("#personal_fio_name").html(json.user_datas.NameI);
        }
        if (json.user_datas.NameO != undefined) {
            $("#personal_NameO").val(json.user_datas.NameO);
        }
        if (json.user_datas.Gender != undefined) {
            if (json.user_datas.Gender == 'Женский') {
                $("#GenderF").prop('checked', true);
            } else {
                $("#GenderM").prop('checked', true);
            }
        }
        if (json.user_datas.NameI == "") {
            $("#personal_fio_none_contaner").show();
            $("#personal_fio_name_contaner").hide();
            $(".personal-info-module-anketa").addClass('warrity_icon');
            $("#personal_NameF").addClass('error');
            moduletoggle($('.personal-info-module-anketa'));
        } else {
            $("#personal_fio_none_contaner").hide();
            $("#personal_fio_name_contaner").show();
        }
        if (json.user_datas.Email != undefined) $("#personal_email").val(json.user_datas.Email);
        if (json.user_datas.MobilePhone != undefined) {
            MobileUser.mobile_phone = json.user_datas.MobilePhone;
        }
        if ((json.user_datas.BirthDate_d != undefined) && (json.user_datas.BirthDate_m != undefined) && (json.user_datas.BirthDate_y != undefined)) {
            $("#personal_BirthDate").val(json.user_datas.BirthDate_d + '.' + json.user_datas.BirthDate_m + '.' + json.user_datas.BirthDate_y);
        }
        if (json.user_datas.region_options != undefined) {
            title_set = 0;
            $.each(json.user_datas.region_options, function(key, val) {
                checked = (val.status == 1) ? 'selected="selected"' : '';
                if (val.status == 1) {
                    $("#Region-button span.bf_select").html(val.name);
                    title_set++;
                }
                $("#Region").append('<option value="' + val.value + '" ' + checked + ' >' + val.name + '</option>');
            });
            if (title_set == 0) {
                $("#Region-button span.bf_select").html('Выберите область');
            }
        }
        if (json.user_datas.city_options != undefined) {
            title_set = 0;
            $.each(json.user_datas.city_options, function(key, val) {
                checked = (val.status == 1) ? 'selected="selected"' : '';
                if (val.status == 1) {
                    $("#City-button span.bf_select").html(val.name);
                    title_set++;
                }
                $("#City").append('<option value="' + val.value + '" ' + checked + ' >' + val.name + '</option>');
            });
            if (title_set == 0) {
                $("#City-button span.bf_select").html('Выберите город');
            }
        }
        if (json.user_datas.shops_options != undefined) {
            title_set = 0;
            $("#PointOfSaleCode").empty();
            $.each(json.user_datas.shops_options, function(key, val) {
                checked = (val.status == 1) ? 'selected="selected"' : '';
                if (val.status == 1) {
                    $("#PointOfSaleCode-button span.bf_select").html(val.name);
                    title_set++;
                }
                $("#PointOfSaleCode").append('<option value="' + val.value + '" ' + checked + ' >' + val.name + '</option>');
            });
            if (title_set == 0) {
                $("#PointOfSaleCode-button span.bf_select").html('Выберите где вы хотите обслуживаться');
            }
        }
        if (json.user_datas.AddressStreet != undefined) {
            $("#personal_AddressStreet").val(json.user_datas.AddressStreet);
        }
        if (json.user_datas.AddressHomeNum != undefined) {
            $("#personal_AddressHomeNum").val(json.user_datas.AddressHomeNum);
        }
        if (json.user_datas.AddressRoomNum != undefined) {
            $("#personal_AddressRoomNum").val(json.user_datas.AddressRoomNum);
        }
        var personal_user_bonus_box = 0;
        if ((json.user_datas.user_bonus.base != undefined) && (json.user_datas.user_bonus.base != 0)) {
            localStorage["user_bonus_base"] = json.user_datas.user_bonus.base;
            $("#personal_user_bonus_base").html(json.user_datas.user_bonus.base);
            $("#personal_user_bonus_base_box").show();
            personal_user_bonus_box++;
        } else {
            localStorage["user_bonus_base"] = '0';
        }
        if ((json.user_datas.user_bonus.special != undefined) && (json.user_datas.user_bonus.special != 0)) {
            localStorage["user_bonus_special"] = json.user_datas.user_bonus.special;
            $("#personal_user_bonus_special").html(json.user_datas.user_bonus.special);
            $("#personal_user_bonus_special_box").show();
            personal_user_bonus_box++;
        } else {
            localStorage["user_bonus_special"] = '0';
        }
        if (personal_user_bonus_box > 0) {
            $("#personal_user_bonus_box").show();
        }
    }
    $.mobile.loading("hide");
}

function UpdateUserInfoTry() {
    var user_info = '',
        ff = [];
    $.each($('#personal_anketa_box input, #personal_anketa_box select'), function(key, val) {
        var v = $(val);
        user_info = user_info + '&' + v.attr('name') + '=' + v.val();
        ff[v.attr('name')] = v.val();
        if (v.val() == '' && v.attr('rq') == '1') {
            v.closest('div').addClass('error');
        }
        if (v.val() < 1 && v.attr('rqq') == '1') {
            v.closest('div').addClass('error');
            ff[v.attr('name')] = '';
        }
    });
    user_info = ($('#GenderF').is(':checked')) ? user_info + '&Genders=1' : user_info + '&Genders=2';
    if (ff.personal_NameF != '' && ff.personal_NameI != '' && ff.personal_NameO != '' && ff.personal_email != '' && ff.personal_BirthDate != '' && ff.City != '') {
        MobileUser.UpdateUserInfo(user_info, OnUpdateUserInfo);
    } else {
        $('#personal_fio_none_contaner').show();
        $(".personal-info-module-anketa").addClass('warrity_icon');
        moduletoggle($('.personal-info-module-anketa'));
        moduletoggle($('.personal-info-module-anketa'));
    }
}

function OnUpdateUserInfo(json) {
    if (json) {
        if (json.error == 'Y') {
            $('#personal_fio_none_contaner').show();
            return;
        }
        $('#personal_save_success').show();
        $('#personal_fio_none_contaner').hide();
        $(".personal-info-module-anketa").removeClass('warrity_icon');
        moduletoggle($('.personal-info-module-anketa'));
        if (json.user_datas.NameI != undefined) {
            $("#personal_fio_name").html(json.user_datas.NameI);
        }
        $.mobile.changePage("#page-personal", {
            changeHash: false
        });
    } else {
        alert("Приносим свои изменения. При сохранение произошла ошибка. Попробуйте позже еще раз.");
        $.mobile.changePage("#main", {
            changeHash: true
        });
    }
}

function StartMakeOrderTry() {
    GA_event('OrderCreate', 'TryOrderCreate');
    MobileUser.basket.Order($("#order_fio").val(), $("#order_email").val(), $("#order_city").val(), OnMakeOrderDone)
}

function OnMakeOrderDone(json) {
    if (json.order_id != undefined) {
        // ORDER is DONE
        GA_addTransaction(json.order_id, 'Citrus', json.order_total_summ, 0, 0, 'UAH');
        if (lastBasket != undefined && lastBasket.length > 0) {
            $.each(lastBasket, function(key, value) {
                GA_addTransactionItem(json.order_id, value.name, value.id, '', value.price, value.qnt, 'UAH');
            });
        }
        GA_event('OrderCreate', 'OrderDone', json.order_id);
        GA_event('OrderCreate', 'OrderCreatePhone', MobileUser.mobile_phone, json.order_id);
        $('#order_done_page_order_id').html(json.order_id);
        $.mobile.changePage("#order-done-page", {
            changeHash: false
        });
    } else {
        alert("Приносим свои изменения. При создании заказа произошла ошибка. Возможно ваша корзина пуста?");
        $.mobile.changePage("#main", {
            changeHash: true
        });
    }
}

function OpenPreorderPage() {
    GA_event('Preoder', 'preorder_step_1', $('#product-card').attr("product_id"), $('#current_product_price').val().replace(/[^\d,+]/g, ""));
    $("#preorder_product_contaner").html("Вы оформляете предзаказ на товар: " + $("#product-card-name").html());
    $.mobile.changePage("#page-preorder", {
        changeHash: true
    });
}

function StartMakePreOrderTry() {
    GA_event('OrderCreate', 'Preoder', 'preorder_step_2', $('#product-card').attr("product_id"), $('#current_product_price').val().replace(/[^\d,+]/g, ""));
    var product_id = $("#current_product_id").val(),
        fio = $("#preorder_fio").val(),
        tel = $("#preorder_tel").val(),
        city = $("#preorder_city").val(),
        email = $("#preorder_email").val();

    u = $.mobile.path.parseUrl(document.URL);
    if(u.href.search("id=")!== -1){
        if(u.hash != undefined){                                         
            var product_id = u.hash.replace( /.*id=/, "" );    
        }
    }

    if (fio != "") {
        GA_event('send', 'event', 'Preorder', 'Preorderform-name', fio);
    }else{
        $("#preorder_fio").closest('.ui-input-text').addClass('bred');
    }

    if (tel != "") {
        GA_event('send', 'event', 'Preorder', 'Preorderform-phone', tel);
    }else{
        $("#preorder_tel").closest('.ui-input-text').addClass('bred');
    }

    if (city != "") {
        GA_event('send', 'event', 'Preorder', 'Preorderform-city', city);
    }else{
        $("#preorder_city").closest('.ui-input-text').addClass('bred');
    }

    if (email != "") {
        GA_event('send', 'event', 'Preorder', 'Preorderform-mail', email);
    }else{
        $("#preorder_email").closest('.ui-input-text').addClass('bred');
    }

    if(!$("#igreed").prop('checked')){
        $("#page-preorder .forigreed").addClass('red');
    }

    if (fio != "" && tel != "" && city != "" && email != "" && product_id != "" && (email.search(/^[-\w.]+@([A-z0-9-]+\.)+[A-z]{2,4}$/i) == 0) && ($("#igreed").prop('checked'))) {
        $('#preorder-make-btn').hide();
        $('.preorder_message').html('Подождите идет оформление ...');
        MobileUser.basket.preOrder(fio, email, city, product_id, $("#preorder_comment").val(), tel, OnMakePreOrderDone);
    } else {
        message = "Пожалуйста заполните обязательные поля !";
        $('.preorder_message').html('<span class=red>'+message+'</span>');
        alert(message);
    }

}

/**
 * Finish create preorder
 * @param {[type]} json [description]
 */
function OnMakePreOrderDone(json) {
    if (json.preorder_id != undefined) {
        // ORDER is DONE
        GA_event('Preoder', 'preorder_step_3', $('#product-card').attr("product_id"), $('#current_product_price').val().replace(/[^\d,+]/g, ""));
        $('#order_done_page_preorder_id').html(json.preorder_id);
        $.mobile.changePage("#preorder-done-page", {
            changeHash: false
        });
    } else {
        alert("Приносим свои изменения. При создании предзаказа произошла ошибка. Попробуйте еще раз");
    }
}

function ondelFromCart() {}

function DeleteItem(item) {
    if (confirm('Вы уверены,что хотите удалить товар "' + $("#basket_item_name_" + $(item).attr("item_id")).html() + '" из корзины?')) {
        // Save it!
        var basket_id = $(item).attr("item_id")
        var li = $("#basket_item_li_" + basket_id);
        li.animate({
            width: "0%"
        }, 200);
        li.remove();
        $("#cart-list").listview("refresh");
        MobileUser.basket.delFromCart(basket_id, ondelFromCart);
        EnableBasketEditMode();
        StartLoadingBasketItems();
    }
}

function EnableBasketEditMode() {
    if ($("#cart-list").hasClass("edit_mode")) {
        ProssedTapEvents();
        $(".delete_img").unbind();
        $("#cart-list").removeClass("edit_mode");
        $("#cart_edit_button").html("Редактировать");
    } else {
        $("#cart-list").addClass("edit_mode").find(".vclick_d_link").unbind();
        $(".delete_img").on("click", function() {
            DeleteItem(this);
        });
        $("#cart_edit_button").html("Завершить редакцию");
    }
}

function OnAfterChangeBasketItem() {
    ShowLoading();
    MobileUser.basket.ListCart(DoCalcBasketItems);
}

function ChangeBasketItem(select) {
    // basket_item_qnt_
    var qnt_string = "";
    if ($(select).val() > 1) {
        qnt_string = $(select).val() + " x ";
    }
    $("#basket_item_qnt_" + $(select).parent().attr("item_id")).html(qnt_string);
    MobileUser.basket.updateCart($(select).parent().attr("item_id"), $(select).val(), OnAfterChangeBasketItem);
}

function DoCalcBasketItems(json) {
    if (json.items != undefined && json.items.length > 0) {
        var summ = json.total_sum + "";
        summ = summ.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        $('#total_price').html(summ + "<sup>грн</sup>");
        //$('#cart-list').html(cart_items).listview("refresh");
        $('#order-make-btn').removeAttr("disabled");
    } else {
        //$('#cart-list').listview("refresh");
        $('#order-make-btn').attr("disabled", "disabled");
    }
    $.mobile.loading("hide");
}

function test_focus() {
    //$("#search-page-search-input").focus().trigger("click");
    $.mobile.changePage("#search-page", {
        changeHash: true
    });
}

function ShowFilter(link, back) {
    ShowLoading();
    var json_props = [],
        selected_summ_string = '';
    for (key in FilterEnums.props) {
        if (key == '99999') {
            for (key2 in FilterEnums.props[key]) {
                var item = FilterEnums.props[key][key2];
                selected_summ_string = selected_summ_string + item.name + ' ';
            }
        }
        json_props.push({
            "prop_id": key,
            "data": FilterEnums.props[key]
        });
    }
    $.ajax({
        url: "http://m.citrus.ua/ajax/filter_params.php?link=" + link,
        type: "POST",
        dataType: 'json',
        data: {
            data: JSON.stringify(json_props)
        },
        success: function(json) {
            $('#products-listview').html("");
            var output = "",
                filter_items = "";
            FilterEnums.active_link = link;
            if (json.items.length > 0) {
                if (selected_summ_string != '') {
                    selected_summ_string = selected_summ_string + ' грн.';
                }
                filter_items += '<li><a onclick="ShowFilterEnums(' + "'99999','По цене','null'" + ')" class="ui-btn ui-btn-icon-right ui-icon-carat-r"><table style="width:100%"><tr><td style="vertical-align:middle;text-align:left;padding-left:1.1rem;"><h2 class="item_name_only">По цене</h2> <div class="props">' + selected_summ_string + '</div></td><td style="width:25px"></td></tr></table></a></li>';
                $.each(json.items, function(key, value) {
                    if (value.id == 99998 || value.id == 99999) {
                        return;
                    }
                    var selected_enums = FilterEnums.getEnumString(value.id),
                        selected_enums_string = "";
                    if (selected_enums) {
                        selected_enums_string = '<div class="props">' + selected_enums + '</div>';
                    }
                    filter_items += '<li><a onclick="ShowFilterEnums(' + "'" + value.id + "','" + value.name + "','" + json.section_id + "'" + ')" class="ui-btn ui-btn-icon-right ui-icon-carat-r"><table style="width:100%"><tr><td style="vertical-align:middle;text-align:left;padding-left:1.1rem;"><h2 class="item_name_only">' + value.name + '</h2> ' + selected_enums_string + '</td><td style="width:25px"></td></tr></table></a></li>';
                });
            } else {
                filter_items = '<div class=sorrynofilter>Извините для данной категории товаров нет подходящих фильтров</div>';
            }
            $("#filter-page-h1").html(json.link_title);
            $('#filter-listview').html(filter_items);
            $("#global-up-button").css('bottom', '60px');
            if (back == undefined) {
                $.mobile.changePage('#filter-page', {
                    transition: "slide",
                    changeHash: true
                });
            } else {
                $.mobile.back();
            }
            $.mobile.loading("hide");
        },
        timeout: 25000,
        error: function(jqXHR, status, errorThrown) { //the status returned will be "timeout" 
            ShowMessage(1);
        }
    });
}

function ShowFilterEnums(id, name, section_id) {
    ShowLoading();
    var json_props = [];
    var summmin = summmax = '';
    for (key in FilterEnums.props) {
        if (key == '99999') {
            for (key2 in FilterEnums.props[key]) {
                var item = FilterEnums.props[key][key2];
                if (item.id == 99998) {
                    summmin = item.value;
                }
                if (item.id == 99999) {
                    summmax = item.value;
                }
            }
        }
        json_props.push({
            "prop_id": key,
            "data": FilterEnums.props[key]
        });
    }
    if (id == 99999) {
        FilterEnums.active_prop_id = id;
        var filter_items = "";
        filter_items = '<div class="summm_item_wrap ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset"><label for="summmin">Минимальная сумма</label><input type="text" pattern="[0-9]" name="summmin" id="summmin" class="summm_inp" onkeyup="return onlynum(this);" value="' + summmin + '"/> <label for="summmax">Максимальная сумма</label><input type="text" pattern="[0-9]" name="summmax" id="summmax" class="summm_inp" onkeyup="return onlynum(this);" value="' + summmax + '"/></div>';
        $("#filter_prop_name").html(name);
        $("#filter-props-values-listview").html(filter_items);
        $("#popupFilter").popup('open');
        $.mobile.changePage('#filter-values-page', {
            transition: "slide",
            changeHash: true
        });
        $.mobile.loading("hide");
        return;
    }
    $.ajax({
        url: "http://m.citrus.ua/ajax/filter_enums.php?id=" + id + "&section_id=" + section_id,
        type: "POST",
        dataType: 'json',
        data: {
            data: JSON.stringify(json_props)
        },
        success: function(json) {
            var output = "";
            var filter_items = "";
            if (json != undefined && json.length > 0) {
                FilterEnums.active_prop_id = id;
                $.each(json, function(key, value) {
                    //if(value.usage != undefined && value.usage=="1"){
                    var check_box = "checkbox_24x24";
                    var check_box_ch = "N";
                    if ($.inArray(value.id, FilterEnums.enums) !== -1) {
                        check_box = "checkbox-hover_24x24";
                        check_box_ch = "Y";
                    }
                    filter_items += '<li><a class="ui-btn ui-btn-icon-right ui-icon-carat-r check_a" onclick="ToggleEnums(this);"  checked_box="' + check_box_ch + '"  enum_id="' + value.id + '"><table style="width:100%"><tr><td style="vertical-align:middle;text-align:left;padding-left:1.1rem;"><h2 class="item_name_only">' + value.value + '</h2></td><td style="width:40px"><img class="check_img"  src="img/png/' + check_box + '.png"></td></tr></table></a></li>';
                    //} 
                });
                $("#filter_prop_name").html(name);
                $('#filter-props-values-listview').html(filter_items);
                $('#popupFilter').popup('open');
                $.mobile.changePage('#filter-values-page', {
                    transition: "slide",
                    changeHash: true
                });
            }
            $.mobile.loading("hide");
        },
        timeout: 25000,
        error: function(jqXHR, status, errorThrown) { //the status returned will be "timeout" 
            ShowMessage(1);
        }
    });
}

function SaveSelectedEnums() {
    var emuns_array = [];
    $(".check_a").each(function(index) {
        if ($(this).attr("checked_box") == "Y") {
            emuns_array.push({
                "name": $(this).find("h2").html(),
                "id": $(this).attr("enum_id")
            });
        }
    });
    var summmin = $('#summmin').val();
    if (summmin != undefined && summmin > 0) {
        emuns_array.push({
            "name": 'от ' + summmin,
            "id": 99998,
            "value": summmin
        });
    }
    var summmax = $('#summmax').val();
    if (summmax != undefined && summmax > 0) {
        emuns_array.push({
            "name": 'до ' + summmax,
            "id": 99999,
            "value": summmax
        });
    }
    FilterEnums.Set(emuns_array);
    ShowFilter(FilterEnums.active_link, true);
}

function ToggleEnums(enum_item) {
    if ($(enum_item).attr("checked_box") == "Y") {
        $(enum_item).attr("checked_box", "N");
        $(enum_item).find(".check_img").attr("src", "img/png/checkbox_24x24.png")
    } else {
        $(enum_item).attr("checked_box", "Y");
        $(enum_item).find(".check_img").attr("src", "img/png/checkbox-hover_24x24.png")
    }
}

function Sort_Radio_Click(radio) {
    var sort = $(radio).attr("sort");
    FilterEnums.active_sort_temp = sort;
    $(".radio_img").attr("src", "img/png/radiobutton_24x24.png");
    $(radio).find(".radio_img").attr("src", "img/png/radiobutton-hover_24x24.png");
}

function LoadSortItems() {
    var sort_items = "";
    for (key in FilterEnums.sort_values) {
        var radio_box = "radiobutton_24x24";
        if (key == FilterEnums.active_sort) {
            radio_box = "radiobutton-hover_24x24";
        }
        sort_items += '<li ><a  class="ui-btn ui-btn-icon-right ui-icon-carat-r" sort="' + key + '" onclick="Sort_Radio_Click(this);"><table style="width:100%"><tbody><tr><td style="vertical-align:middle;text-align:left;padding-left:1.1rem;"> <h2 class="item_name_only">' + FilterEnums.sort_names[key] + '</h2>  </td><td style="width:40px">    <img class="radio_img"  src="img/png/' + radio_box + '.png" >   </td></tr></tbody></table></a></li>';
    }
    $('#sort-listview').html(sort_items);
    $.mobile.changePage('#sort-page', {
        transition: "slide",
        changeHash: true
    });
}

function Enums() {
    this.sort_values = {
        0: "",
        2: "price_asc",
        3: "price_desc",
        4: "new_first",
        5: "by_name"
    };
    this.sort_names = {
        0: "Сначала рекомендованные",
        2: "От дешевых к дорогим",
        3: "От дорогих к дешевым",
        4: "Сначала новинки",
        5: "по алфавиту"
    };
    this.active_sort = "0";
    this.active_sort_temp = "0";
    this.active_prop_id = 0;
    this.active_link = "";
    this.props = [];
    this.enums = [];
    this.Set = function(enums) {
        if (enums != undefined) {
            this.props[this.active_prop_id] = enums;
            if (enums.length == 0) {
                delete this.props[this.active_prop_id];
            }
            this.enums = [];
            for (key in this.props) {
                for (enum_key in this.props[key]) {
                    this.enums.push(this.props[key][enum_key]["id"]);
                }
            }
        }
    }
    this.Clear = function() {
        this.props = [];
        this.enums = [];
    }
    this.getEnumString = function(prop_id) {
        if (this.props[prop_id] != undefined) {
            var string = "";
            var strings_array = [];
            for (enum_key in this.props[prop_id]) {
                strings_array.push(this.props[prop_id][enum_key]["name"]);
            }
            if (this.props[prop_id].length > 0) {
                string = strings_array.join(", ");
            }
            return string;
        } else {
            return false;
        }
    }
    this.ApplySort = function() {
        this.active_sort = this.active_sort_temp;
    }
    this.ClearSort = function() {
        this.active_sort = "0";
        this.active_sort_temp = "0";
    }
}
var FilterEnums = new Enums();

function InitShopList() {
    ShowLoading();
    $.ajax({
        url: "json/shoplist.json",
        dataType: 'json',
        success: function(json) {
            var output = "";
            var count = 0;
            if (json.items !== undefined) $.each(json.items, function(key, value) {
                var url;
                var image = '<img src="http://m.citrus.ua/img/png/google_map/mobapp-map-shop-list-icon.png" />';
                if (value.PROPERTY_CITY_PHONE_VALUE == undefined || value.PROPERTY_CITY_PHONE_VALUE == "") {
                    value.PROPERTY_CITY_PHONE_VALUE = "0 800 501-522"
                }
                output += '<li><a onclick="ShowDetailGoogleMape(' + value.ID + ')" data-transition="slide" data-ajax=false"><table style="width:100%"><tr><td style="vertical-align: middle;text-align:center;width:64px" class="first img_map">' + '' + image + '</td><td style="vertical-align:middle;text-align:left;padding-left:1.1rem;"> ' + '<h2 class="item_name_only product">' + value.city + ", " + htmlDecode(value.NAME) + '</h2>  <div class="preview_text">' + 'Телефон: <a>' + value.PROPERTY_CITY_PHONE_VALUE + "</a></br>Время работы: " + value.PROPERTY_CITY_WORK_TIME_VALUE + '</div></td> ' + '</tr></table></a></li>';
                // nclick="Showtextpage('+value.id+')"
            });
            $('#shoplist-listview').html(output).listview("refresh");
            $.mobile.loading("hide");
            ProssedTapEvents();
        },
        timeout: 25000,
        error: function(jqXHR, status, errorThrown) { //the status returned will be "timeout" 
            if (status == "timeout") {
                ShowMessage(1);
                $.mobile.loading("hide");
            }
        }
    });
}

function SupportCall() {
    GA_event('Звонок', 'PushCallButton', getPageName());
    window.open('tel:0800207020', '_system', 'location=yes')
}

function SupportCall2() {
    GA_event('Звонок', 'PushCallButton', getPageName());
    window.open('tel:0800207030', '_system', 'location=yes')
}

function CheckHrefChange(link) {
    var page = document.location.hash;
    if (document.location.hash == "") {
        page = "#main";
    }
    if (page == $(link).attr("href")) {
        $(".ui-panel-open").panel("close");
    }
}

function go_back() {
    if (isIOS()) {
        $.mobile.back();
        return false;
    }
}

function console_log(text) {
    if ($('#console').length > 0) {
        $('#console').append("<div>" + text + "</div>");
    }
}

function getPageName() {
    var page = document.location.hash;
    if (document.location.hash == "") {
        page = "#main";
    }
    return page;
}

function getUserWishesList(json) {
    $('.removeWishList').hide();
    ShowLoading();
    var puw = $('#personal_user_wishes_list'),
        error_massage = "<div class='no_wish'>У вас пока нет списков желаний. Выбирайте любые товары на основном сайте, нажимайте на кнопку «Добавить в список желаний», сохраняйте разные списки, делитесь ими с друзьями.</div>";
    if (json) {
        if (json.error !== undefined && json.error == 'Y') {
            puw.html(error_massage);
        } else {
            var output = "";
            if (json.wish_lists !== undefined) {
                $.each(json.wish_lists, function(key, value) {
                    output += '<li><a data-transition="slide" data-ajax="false" class="vclick_d_link ui-btn ui-btn-icon-right ui-icon-carat-r" link="#page-wish?id=' + value.wishlist_url + '"><table style="width:100%"><tr><td style="vertical-align:middle;text-align:left;padding-left:1.1rem;"><h2 class="item_name_only wishes">' + value.wishlist_name + '</h2><div class="preview_text">' + value.product_count + '</div></td></tr></table></a></li>';
                });
            } else {
                puw.html(error_massage);
            }
            puw.html(output);
            $('#personal_user_wishes_list li').last().find('a').addClass('last');
        }
    } else {
        puw.html(error_massage);
    }
    $.mobile.loading("hide");
    ProssedTapEvents();
}

function getUserWishContentList(json) {
    ShowLoading();
    if (json){
        var output = "";
        if (json.wish !== undefined) {
            json.wish.wishlist_summ = parseFloat(json.wish.wishlist_summ).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            output += '<div class=wish_content_detail><span class="wish_name"><b>' + json.wish.wishlist_name + '</b></span>';
            output += '<br /><span class="wish_count">Количество товаров: ' + json.wish.wishlist_count + '</span><br/><span class="wish_summ">Сумма: <span class="wish_summa">' + json.wish.wishlist_summ + ' грн.</span></span>';
            output += '</div><div class=wish_content_detail_list>';
            $('.wish_full_page').attr("wish_full_page", json.wish.wishlist_url);
        }
        if (json.wish_items !== undefined) {
            $.each(json.wish_items, function(key, value) {
                value.add_delete_td = 'Y';
                output += generateSectionProductItem(value, '');
            });
        }
        output += '</div>';
        $("#wishEditButton").html("Редактировать");
        $(".delete_td").hide();
        $("#wish-listview").removeClass("edit_mode").html(output);
    } else {
        $('#wish-listview').html("У Вас нет желаний");
    }
    $.mobile.loading("hide");
    ProssedTapEvents();
}

function getUserOrdersList(json) {
    ShowLoading();
    if (json) {
        var output = "";
        if (json.user_orders !== undefined) $.each(json.user_orders, function(key, value) {
            output += '<li><a data-transition="slide" data-ajax="false" class="vclick_d_link ui-btn ui-btn-icon-right ui-icon-carat-r" link="#order-page?id=' + value.ID + '"><table style="width:100%"><tr><td style="vertical-align:middle;text-align:left;padding-left:1.1rem;"><h2 class="item_name_only order">Заказ № ' + value.ORDER_NUM + ' <span>от&nbsp;' + value.DATE_INSRERT + '</span></h2><div class="preview_text">' + value.COUNT_TOVS + ' товара на сумму <span class=grn>' + value.SUMM_TOVS + '&nbsp;грн</span> <br>Статус:<span class="personal_order_status personal_order_status_code' + value.STATUS_CODE + '">' + value.STATUS + '</span></div></td></tr></table></a></li>';
        });
        $('#personal_user_orders_list').html(output);
    } else {
        $('#personal_user_orders_list').html("У Вас нет заказов");
    }
    $.mobile.loading("hide");
    ProssedTapEvents();
}

function getUserOrdersContentList(json) {
    ShowLoading();
    if (json) {
        var output = "";
        if (json.order !== undefined) {
            output += '<div class=order_content_detail> <span class="order_title">Заказ №' + json.order.ORDER_NUM + '</span> <span class="order_from">от&nbsp;' + json.order.DATE_INSRERT + '</span><br/><span class="order_status">Статус:<b>' + json.order.STATUS + '</b></span><br/><span class="order_pay">Способ оплаты:<b>' + json.order.PAY_SYSTEM_NAME + '</b></span><br/>';
            if (json.order.TTN_1C > 10000) {
                output += '<span class="order_pay">Товарно-транспортная накладная <b>№' + json.order.TTN_1C + '</b></span><br/>';
            }
            output += '<span class="order_summ">Сумма:<span class=grn>' + json.order.SUMM + '&nbsp;грн.</span></span>';
            if (json.order.PAY_ALLOW == 'Y') {
                output += '<button id="payment-btn" order_id="' + json.order.ID + '" token="' + json.order.PAY_TOKEN + '" uid="' + json.order.UID + '" class="green_btn ui-btn ui-corner-all" style=""><i class="c_icon c_payment c_ibtn"></i>   Оплатить заказ</button>';
            }
            output += '</div><div class=order_content_detail_list>';
        }
        if (json.order_items !== undefined) {
            $.each(json.order_items, function(key, value) {
                var image = "";
                if (value.PIC != undefined) {
                    image = '<img src="' + value.PIC + '" >';
                }
                if (value.NO_LINK == 1) {
                    output += '<li><div class=order_list_item><table style="width:100%"><tr> <td style="vertical-align: middle;text-align:center;width:64px" class="first">' + image + '</td> <td style="vertical-align:middle;text-align:left;padding-left:1.1rem;"><h2 class="item_name_only order">' + value.NAME + '</h2><div class="preview_text">' + value.QUANTITY + ' x <span class=grn>' + value.PRICE + ' грн </span></div></td> </tr></table></div></li>';
                } else {
                    output += '<li><a data-transition="slide" data-ajax="false" class="vclick_d_link ui-btn ui-btn-icon-right ui-icon-carat-r" link="#product-card?product-id=' + value.ID + '"> <table style="width:100%"><tr> <td style="vertical-align: middle;text-align:center;width:64px" class="first">' + image + '</td> <td style="vertical-align:middle;text-align:left;padding-left:1.1rem;"><h2 class="item_name_only order">' + value.NAME + '</h2><div class="preview_text">' + value.QUANTITY + ' x <span class=grn>' + value.PRICE + ' грн </span></div></td> </tr></table> </a></li>';
                }
            });
        }
        output += '</div>';
        $('#order-page-content').html(output);
    } else {
        $('#order-page-content').html("У Вас нет заказов");
    }
    $.mobile.loading("hide");
    ProssedTapEvents();
}

function getUserPreOrdersList(json) {
    ShowLoading();
    if (json) {
        var output = "",
            no_ord = 0;
        if (json.preorders.CAN_BUY !== undefined) {
            $.each(json.preorders.CAN_BUY, function(key, value) {
                var image = "";
                no_ord++;
                if (value.PRODUCT_PIC != undefined) {
                    image = '<img src="' + value.PRODUCT_PIC + '" >';
                }
                value.text_props = 'Предзаказ № P-' + value.PREORDER_ID + ' от ' + value.PREORDER_DATE;
                output += generateSectionProductItem(value);
            });
            $('#preorders-buy-content').html("<ul class='ui-listview'>" + output + "</ul>");
            output = "";
        }
        if (json.preorders.CANNOT_BUY !== undefined) {
            $.each(json.preorders.CANNOT_BUY, function(key, value) {
                var image = "";
                no_ord++;
                if (value.PRODUCT_PIC != undefined) {
                    image = '<img src="' + value.PRODUCT_PIC + '" >';
                }
                value.text_props = 'Предзаказ № P-' + value.PREORDER_ID + ' от ' + value.PREORDER_DATE;
                output += generateSectionProductItem(value);
            });
            $('#preorders-notbuy-content').html("<ul class='ui-listview'>" + output + "</ul>");
            if (no_ord == 0) {
                $('#preorders-no').html("<div class='page-orders-name'>У Вас нет презаказов</div>");
                $('#preorders-canbuy-info,#preorders-cannotbuy-info').hide();
            }
        }
    } else {
        $('#order-page-content').html("У Вас нет заказов");
    }
    $.mobile.loading("hide");
    ProssedTapEvents();
}

function get_city_in_region() {
    var region_id = $("#Region").val();
    $.post("http://m.citrus.ua/api/bpm/bpm_city.php", {
        region: region_id
    }).done(function(data) {
        $("#City").empty().append(data);
        $("#City-button span.bf_select").html('Выберите город');
        get_shops_in_city();
        $("#District").val("");
    });
}

function get_shops_in_city() {
    var city_id = $("#City").val();
    $.post("http://m.citrus.ua/api/bpm/bpm_city_shops.php", {
        city: city_id
    }).done(function(data) {
        $("#District").val("");
        $("#PointOfSaleCode").empty().append(data);
        var posc = $('#PointOfSaleCode option').size() || 0;
        $("#PointOfSaleCode-button span.bf_select").html(posc == 1 ? $('#PointOfSaleCode option').text() : 'Выберите где вы хотите обслуживаться');
    });
}

function get_disqus() {
    var disqus_shortname = 'citrus-ua';
    disqus_identifier = product_id;
    disqus_url = "http://www.citrus.ua/apple/iphone-6",
        disqus = document.createElement("script");
    disqus.type = "text/javascript";
    disqus.src = 'https://' + disqus_shortname + '.disqus.com/embed.js';
    var tt4 = document.getElementById('disqus_thread');
    tt4.appendChild(disqus);
}

function LoadReviewsPage(id, data) {
    var send_data = data || "";
    $.ajax({
        url: "http://m.citrus.ua/ajax/on/reviews.php?app=1&id=" + id + send_data,
        beforeSend: function(xhr) {
            ShowLoading();
        }
    }).done(function(data) {
        $.mobile.loading("hide");
        $('#reviews-page-content').html(data);
        get_disqus();
    });
}

function LoadPromosPage(id, data) {
    var send_data = data || "",
        promo_content = $('#promo-products-listview'),
        device = isIOS() ? "apple" : "3";
    $.ajax({
        url: "http://m.citrus.ua/ajax/on/promo.php?app=" + device + "&bb=1&vp=2&id=" + id + send_data,
        type: "POST",
        dataType: 'json',
        beforeSend: function(xhr) {
            ShowLoading();
        },
        success: function(json) {
            if (json.error == 'Y') {
                $('.promo-products-text').html('<table style="width:100%"><tr><td style="vertical-align: middle;text-align:center;width:64px" class="first"></td><td style="vertical-align:middle;text-align:left;padding-left:1.1rem;"><h2 class="item_name_only">Ничего не найдено....</h2></td><td style="width:25px"></td></tr></table>');
            }
            var output = "",
                count = 0,
                lazy = '';
            if (json.promo_content_text != undefined) {
                $('.promo-products-text').html(json.promo_content_text);
            }
            if (json.promo_goods != null && json.promo_goods != undefined) {
                $.each(json.promo_goods, function(promo_key, promo_goods_item) {
                    if (!promo_key) {
                        return;
                    }
                    if (promo_key == 'selectors') {
                        if (promo_goods_item != null && promo_goods_item != undefined) {
                            $.each(promo_goods_item, function(promo_key2, promo_goods_item2) {
                                selector_output = '';
                                if (promo_goods_item2 != null && promo_goods_item2.items != undefined && promo_goods_item2.items.items.length > 0) {
                                    $.each(promo_goods_item2.items.items, function(key2, value2) {
                                        count = count + 1;
                                        selector_output += generateSectionProductItem(value2, lazy)
                                    });
                                }
                                if (promo_goods_item2.title != undefined && promo_goods_item2.title != '') {
                                    selector_output = '<div class="product-card-module-cr last module-open promo-selector-title"> <div id="product-card-info" class="product-card-module main-module" onclick="moduletoggle(this);"><i class="c_icon c_lider gray main_page_icon"></i>' + promo_goods_item2.title + '</div> <div class="product-card-info-content"><ul data-role="listview" data-theme="b" data-2inset="true" class="ui-listview ui-group-theme-b">' + selector_output + '</ul></div> </div>';
                                }
                                output += selector_output;
                            });
                        }
                    } else {
                        if (promo_goods_item != null && promo_goods_item.items != null && promo_goods_item.items != undefined && promo_goods_item.items.length > 0) {
                            $.each(promo_goods_item.items, function(key, value) {
                                count = count + 1;
                                output += generateSectionProductItem(value, lazy)
                            });
                        }
                    }
                });
            }
            promo_content.html(output);
            ProssedTapEvents();
            product_list_page_loded = true;
            $.mobile.loading("hide");
        },
        timeout: 60000,
        error: function(jqXHR, status, errorThrown) { //the status returned will be "timeout" 
            if (status == "timeout") {
                product_list_page_loded = true;
                ShowMessage(1);
                location.reload();
            }
        }
    });
}

function getGetUserPushList(json) {
    ShowLoading();
    if (json) {
        var output = "";
        if (json.user_push !== undefined) {
            $.each(json.user_push, function(key, value) {
                output += '<li><a data-transition="slide" data-ajax="false" class="ui-btn ui-btn-icon-right ui-icon-carat-r goPushEvent" pevent="' + value.citrus_event + '" pid="' + value.citrus_id + '"><span class=preview_text>' + value.datetitle + '</span><h2 class="item_name_only product">' + value.title + '</h2><span class=preview_text>' + value.message + '</span></a></li>';
            });
        } else {
            output = "<div class='no_wish'>У вас пока нет сообщений.</div>";
        }
        $('#push-page-content').html(output);
        output = "";
    }
    $.mobile.loading("hide");
    ProssedTapEvents();
}

function QRScan() {
    cordova.plugins.barcodeScanner.scan(function(result) {
        window.open(result.text, '_system', 'location=yes');
        return false;
        /* alert("We got a barcode\n" +
               "Result: " + result.text + "\n" +
               "Format: " + result.format + "\n" +
               "Cancelled: " + result.cancelled);*/
    }, function(error) {
        //alert("Scanning failed: " + error);
    });
}

function LoadPromos(id) {
    window.location = "#promo?id=" + id;
}

function getUserBonusPanel() {
    var subp = 0,
        user_bonus_panel = '',
        user_bonus_menu = '';
    var user_bonus_base = localStorage["user_bonus_base"];
    if (user_bonus_base != undefined && user_bonus_base > 0) {
        user_bonus_panel += '<span class="item"><b>' + user_bonus_base + ' грн</b> баз. бонусов</span>';
        user_bonus_menu += '<span class="item">Базовых бонусов <b>' + user_bonus_base + ' грн</b></span>';
        subp++;
    }
    var user_bonus_special = localStorage["user_bonus_special"];
    if (user_bonus_special != undefined && user_bonus_special > 0) {
        user_bonus_panel += '<span class="item"><b>' + user_bonus_special + ' грн</b> спец. бонусов</span>';
        user_bonus_menu += '<span class="item">Специальных бонусов <b>' + user_bonus_special + ' грн</b></span>';
        subp++;
    }
    if (subp > 0) {
        if (subp == 2) {
            $('#user_bonus_panel').addClass('double');
        }
        $('.user_bonus_menu').addClass('active').html('<span class="title">На вашем счету:</span>' + user_bonus_menu);
        $('#user_bonus_panel').addClass('active').html('<span class="title"><i class="c_icon c_catalog gray c_club"></i>На счету:</span><span class="items">' + user_bonus_panel + '</span>');
    }
}

function ShowDetailGoogleMape(id) {
    if (isIOS()) {
        window.open('http://m.citrus.ua/#detail-googlemap?id=' + id, '_system', 'location=yes');
    } else {
        $('#text-page-content').html("");
        window.location = "#detail-googlemap?id=" + id;
    }
}

function LoadDetailPageMap(id) {
    $.ajax({
        url: "http://m.citrus.ua/ajax/on/detail_google_map.php?id=" + id,
        dataType: 'json',
        beforeSend: function(xhr) {
            ShowLoading();
        }
    }).done(function(json) {
        var doc_h = $(window).height();
        doc_h = doc_h - 303;
        $('#map_canvas').css('height', doc_h + 'px');
        /*$.mobile.loading( "hide" );
        $('#map_canvas, #pano').height($(document).height());*/
        /*$.getScript("/js/gmap.js").done(function() {
            gmapLoadScript();
        });*/
        gmapInitialize();
        var box_2_detail = "";
        if (json.coordinates_shop != '') {
            box_2_detail = "<a tel='" + json.city_phone + "' class='shopCall2 icon_detail_phone'><img src='http://m.citrus.ua/img/png/phone-icon.png' /><br/>Позвонить</a><a href='" + json.coordinates_shop + "' class='icon_detail_googlemap'><img src='http://m.citrus.ua/img/png/gmaps-icon.png' /><br/>Google Maps</a>";
        } else {
            box_2_detail = "<a tel='" + json.city_phone + "' class='shopCall2 icon_detail_phone_2'><img src='http://m.citrus.ua/img/png/phone-icon.png' /><br/>Позвонить</a>";
        }
        $('.content_detail_map').html("<div class='box_1_detail'><div class='text_detail_map'>" + json.city_region + "<br/>" + json.city_adress + "<br/>" + json.city_work_time + "<br/>" + json.city_phone + "</div></div><div class='clear'></div><div class='box_2_detail'>" + box_2_detail + "</div>");
        $.mobile.loading("hide");
    });
}

function htmlDecode(value) {
    return $('<div/>').html(value).text();
}

function LoadBundlePage(id) {
    var bundle_content = $('#bundle-content-listview'),
        device = isIOS() ? "apple" : "3";
    $.ajax({
        url: "http://m.citrus.ua/ajax/on/bundle.php?app=" + device + "&bb=1&bundle_id=" + id,
        type: "POST",
        dataType: 'json',
        beforeSend: function(xhr) {
            ShowLoading();
        },
        success: function(json) {
            if (json.error == 'Y') {
                $('.bundle-text').html('<table style="width:100%"><tr><td style="vertical-align: middle;text-align:center;width:64px" class="first"></td><td style="vertical-align:middle;text-align:left;padding-left:1.1rem;"><h2 class="item_name_only">Ничего не найдено....</h2></td><td style="width:25px"></td></tr></table>');
            }
            $('#bundle-card-buy-btn').unbind().on("vclick", function() {
                StartBuyBundle(json.id);
            });
            var output = url = "";
            if (json.bundle_goods != undefined) {
                $.each(json.bundle_goods, function(bundle_key, value) {
                    if (value != undefined) {
                        var text_flag = (value.text_flag != null) ? value.text_flag : '',
                            dop_class = "";
                        if (value.price) {
                            var old_price = (value.old_price != null) ? value.old_price : '';
                            dop_class = dop_class + " product";
                            url = "#product-card?product-id=" + value.id;
                            var row2 = '',
                                payment_parts = '',
                                price_class = (old_price > 0) ? 'old_price_yes' : '';
                            if (parseInt(value.price) > 1 && value.can_buy == "Y") {
                                row2 = '<div class="price_block ' + price_class + '"><div class="binline bindlecross"><div class="price pricegray">' + old_price + '</div></div><div class="price binline">' + value.price + ' грн</div></div>';
                                payment_parts = '<div class="catalog_payment_parts">Оплата частями</div>';
                            } else if (parseInt(value.price) > 1) {
                                row2 = '<div class="price_block ' + price_class + '"><div class="binline bindlecross"><div class="price pricegray">' + old_price + '</div></div><div class="price binline">' + value.price + ' грн</div><div class="status">' + value.can_buy_status + '</div>';
                            } else {
                                row2 = '<div class="status">' + value.can_buy_status + '</div>';;
                            }
                            var prop = (value.props != undefined) ? value.props : "";
                            var bonuses = (value.bonuses != undefined && parseInt(value.bonuses) > 5) ? '<div class="props">+' + parseInt(value.bonuses) + ' грн на бонусный счет</div>' : '';
                            output += '<li><a data-transition="slide" data-ajax=false class="vclick_d_link click_ajax_new_link ui-btn ui-btn-icon-right ui-icon-carat-r"  link="' + url + '"><table style="width:100%"><tr><td style="vertical-align: middle;text-align:center;width:64px" class="first"><img src="' + value.image + '" ></td><td style="vertical-align:middle;text-align:left;padding-left:1.1rem;"><div class="box_catalog_status">' + text_flag + ' </div><h2 class="item_name_only ' + dop_class + '">' + value.name + '</h2><div class="props">' + prop + '</div>' + row2 + bonuses + payment_parts + '</td><td style="width:25px"></td></tr></table></a></li>';
                        } else {
                            output += '<li><a data-transition="slide" data-ajax=false class="vclick_d_link click_ajax_new_link ui-btn ui-btn-icon-right ui-icon-carat-r" link="#products-list?' + url + '"><table style="width:100%"><tr><td style="vertical-align: middle;text-align:center;width:64px"  class="first"><img src="' + value.image + '" ></td><td style="vertical-aling:middle;text-align:left;padding-left:1.1rem;"><div class="box_catalog_status">' + text_flag + ' </div><h2 class="item_name_only ' + dop_class + '">' + value.name + '</h2></td><td style="width:25px"></td></tr></table></a></li>';
                        }
                    }
                });
                $('.bundle_econom').html(json.total_econom);
                $('.bundle_price_sum').html(json.total_sum_print);
                $('.bundle_old_price_sum').html(json.total_old_sum_print);
            }
            bundle_content.html(output);
            ProssedTapEvents();
            product_list_page_loded = true;
            $.mobile.loading("hide");
        },
        timeout: 25000,
        error: function(jqXHR, status, errorThrown) { //the status returned will be "timeout" 
            if (status == "timeout") {
                product_list_page_loded = true;
                ShowMessage(1);
                location.reload();
            }
        }
    });
}

function StartBuyBundle(bundle_id) {
    ShowLoading();
    MobileUser.basket.addBundleToCart(bundle_id, AfterBuyProduct);
}

function ShowAutorizationWindow() {
    setTimeout(function() {
        if (!MobileUser.IsAuthorized) {
            $('#needLogin').html('<div class="needLogin_bg"></div><div class="needLoginContent"><div class="needLoginLogo"><img src="img/png/logo.png"></div><div class="needLoginTitle">Представьтесь</div><div class="needLoginText">Авторизуйтесь сейчас, получите <br /> доступ к бонусному счету и другим <br /> функциям приложения</div><br /><span class="needLoginEnterNumberText">Введите номер телефона</span><div class="ui-input-text needLoginEnter"><input type="tel" id="needLoginEnterNumber" maxlength="13" autocomplete="off" value="+380" onkeyup="MobileUser.VerifyPhoneInput(this,\'#needLoginButton\')"></div><button id="needLoginButton" class="green_btn ui-btn ui-corner-all">Авторизоваться</button><span class="needNoLogin">Спасибо. Продолжаю использовать приложение без <br />дополнительных функций</span></div>').show();
        }
    }, 60000);
}

function showViewedProductsOnMain(datas) {
    showViewedProducts(datas, 'products');
}

function showViewedProductsOnProduct(datas) {
    showViewedProducts(datas, 'product');
}

function showViewedProducts(datas, products_name) {
    var products_wrap = $('#main-listview-viewed-' + products_name);
    if (datas.viewedItems != undefined && datas.viewedItems != null) {
        var output = "";
        $.each(datas.viewedItems, function(key, value) {
            value.aclass = 'vclick_viewed';
            output += generateSectionProductItem(value, '');
        });
        products_wrap.html(output).listview("refresh").show();
        $('.vclick_viewed').unbind().on(eventstring, function(event) {
            alert('2');
            event.stopPropagation();
            event.preventDefault();
            loadProductCard($(this).attr('product_id'), true);
            window.scrollTo(0, 0);
            /*event.stopPropagation();
            event.preventDefault();
            window.location = "#product-card?product-id=" + $(this).attr('product_id');
            window.scrollTo(0, 0);
            location.reload();*/
        });
    } else {
        products_wrap.hide();
    }
}

function initSubmitWebForm() {
    if (typeof $.fn.mask === 'function') $('.phone').mask("+380 (99) 999-99-99");
    $('#text-page-content form').submit(function() {
        var form_data = $(this).serialize() + '&web_form=Y&web_form_apply=Y';
        var form_success = "";
        $this = this;
        $.ajax({
            url: 'http://m.citrus.ua/ajax/on/success_form.php',
            type: "post",
            data: form_data,
            dataType: "html",
            beforeSend: function() {
                $($this).html("<div class='beforeSend'>Подождите! Идет обработка информации.</div>");
            },
            success: function(data) {
                $($this).parents(".web-form").html($(data));
                initSubmitWebForm();
            }
        });
        return false;
    });
}

function LoadWishAddPage(id, type, datas) {
    if (!MobileUser.IsAuthorized) {
        MobileUser.LoginPromt();
        return false;
    }
    datas = datas || {};
    datas.id = id;
    datas.type = type;
    datas.session_id = MobileUser.session_id;
    //datas = JSON.stringify(datas);
    $.ajax({
        dataType: 'json',
        data: datas,
        url: "http://m.citrus.ua/ajax/on/productWish.php",
        beforeSend: function(xhr) {
            ShowLoading();
        }
    }).done(function(json) {
        $('#user_wishes_list').html('');
        if (json != null && json != undefined) {
            if (json.user_wishes != null && json.user_wishes != undefined && json.user_wishes.length > 0) {
                var output = "";
                $.each(json.user_wishes, function(key, item) {
                    output += '<li><a class="ui-btn ui-btn-icon-right ui-icon-carat-r-no no-border-top check_wish_list" onclick="ToggleEnums(this);" checked_box="N" value="' + item.wishlist_id + '" ><table style="width:100%"><tr><td style="vertical-align:middle;text-align:left;"><h2 class="item_name_only">' + item.wishlist_name + '</h2></td><td style="width:40px"><img class="check_img" src="img/png/checkbox_24x24.png"></td></tr></table></a></li>';
                });
                $('#user_wishes_list').html(output);
            }
            if (json.success_add != undefined && json.success_add == 'Y') {
                $("#wish-done-one,#wish-done-multi").hide();
                if (json.wishlist_url != undefined) {
                    $(".social-likes-f").data('url', 'http://www.citrus.ua/wishlist/' + json.wishlist_url);
                    $("#show-page-wish").attr('onclick', "window.location='#page-wish?id=" + json.wishlist_url + "'");
                    $("#wish-done-one").show();
                } else {
                    $("#wish-done-multi").show();
                }
                $("#wish-back-to-product-btn").attr('onclick', "window.location='#product-card?product-id=" + id + "'");
                changePage('#wish-done-page');
            }
            if (json.error != undefined && json.error == 'Y') {
                alert('Произошла ошибка!');
            }
        }
        $.mobile.loading("hide");
    });
}

function getPageIdByUri() {
    var id = "",
        u = $.mobile.path.parseUrl(document.URL);
    if (u.href.search("id=") !== -1) {
        if (u.hash != undefined) {
            return u.hash.replace(/.*id=/, "");
        } else {
            alert("404");
            return false;
        }
    } else {
        alert("404");
        return false;
    }
}

function DeleteWishItem(item){
    var box = $(item).closest('.section-product-item'),
        title = box.find('h2').html();
    if (confirm('Вы уверены,что хотите удалить товар "' + title + '" из списка?')) {
        var item_id = box.attr("item_id");
        box.animate({
            width: "0%"
        }, 200).remove();
        if (wish_id = getPageIdByUri()) {
            var data = {};
            data.wish_id = wish_id;
            LoadWishAddPage(item_id, 'rem', data);
        }
    }
}

function EnableWishEditMode() {
    var wishEditButton = $("#wishEditButton"),
        wishListview = $("#wish-listview"),
        delete_img = $(".delete_img"),
        removeWishList = $('.removeWishList');
    if (wishListview.hasClass("edit_mode")) {
        ProssedTapEvents();
        delete_img.unbind();
        wishListview.removeClass("edit_mode");
        wishEditButton.html("Редактировать");
        removeWishList.hide();
    } else {
        wishListview.addClass("edit_mode").find(".vclick_d_link").unbind();
        delete_img.on("click", function() {
            DeleteWishItem(this);
        });
        removeWishList.show();
        wishEditButton.html("Завершить редакцию");
    }
}
/**
 * Filling fields of pre-order
 * @param {[type]} json [description]
 */
function FillPreorderPageFields(json) {
    if (json.IsAuthorized != "Y") {
        MobileUser.LoginPromt();
    }

    //clear tags from error styles
    $.each($('#page-preorder .red, #page-preorder .bred'), function(key, val){
        $(val).removeClass('red bred');
    });

    $('.preorder_message').html('');
    $('#preorder-make-btn').show();

    if (json.user_datas != undefined) {
        var output = '';
        if (json.user_datas.NameF != undefined) {
            output += json.user_datas.NameF;
        }
        if (json.user_datas.NameI != undefined) {
            output += ' ' + json.user_datas.NameI;
        }
        $("#preorder_fio").val(output);
        if (json.user_datas.City != undefined) {
            $("#preorder_city, #page-preorder-content .ui-input-search input").val(json.user_datas.City);
        }
        if (json.user_datas.MobilePhone != undefined) {
            $("#preorder_tel").val(json.user_datas.MobilePhone).attr('disabled', 'disabled');
        }
        if (json.user_datas.Email != undefined) {
            $("#preorder_email").val(json.user_datas.Email);
        }
    }
}

function selectCity(city_id, city_name, region) {
    if (city_id === false) {
        return;
    }
    city_enter = true;
    $("#preorder_city, #page-preorder-content .ui-input-search input").val(city_name);
    $('#preorder_city_id').val(city_id);
    $('#preorder_city_autocomplete,#page-preorder-content .ui-input-clear').hide();
}
/**
 * The generation view for section
 * @param  {[type]} value item
 * @param  {[type]} lazy  [description]
 * @return {[type]}       [description]
 */
function generateSectionProductItem(value,lazy) {
    var url = "category-items=" + value.link,
        text_flag = (value.text_flag != null && value.text_flag != false) ? value.text_flag : '',
        text_props = (value.text_props != null && value.text_props != false) ? value.text_props : '',
        dop_class = "";
    delete_td = (!!value.add_delete_td && value.add_delete_td == 'Y') ? '<td class="delete_td"><img item_id="' + value.id + '" class="delete_img cancel_icon" src="/img/svg/cancel-icon.svg"></td>' : '';
    value.id = value.id || '';
    value.aclass = value.aclass || 'vclick_d_link click_ajax_new_link ui-btn ui-btn-icon-right ui-icon-carat-r';
    if (value.price) {
        value.price = value.price.toString().replace(/[^-0-9]/gim, '');
        var old_price = (value.old_price != null) ? value.old_price : '';
        dop_class = dop_class + " product";

        var row2 = '',
            payment_parts = '';
        value.price_print = parseFloat(value.price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        if (parseInt(value.price) > 1 && value.can_buy == "Y") {
            row2 = old_price + '<div class="price">' + value.price_print + ' грн</div>';
            payment_parts = '<div class="catalog_payment_parts">Оплата частями</div>';
        } else if (parseInt(value.price) > 1) {
            row2 = old_price + '<div class="price">' + value.price_print + ' грн</div><div class="status">' + value.can_buy_status + '</div>';
        } else if (!!value.can_buy_status) {
            row2 = '<div class="status">' + value.can_buy_status + '</div>';;
        }

        url = "#product-card?product-id=" + value.id;
        if(!!value.sale&&value.sale=='Y'){
            url = url+"&sale=1";
            payment_parts = '';
        }

        var prop = (value.props != undefined) ? value.props : "",
            bonuses = (value.bonuses != undefined && parseInt(value.bonuses) > 5) ? '<div class="props">+' + parseInt(value.bonuses) + ' грн на бонусный счет</div>' : '';
        prop = (text_props != '') ? text_props : prop;
        return '<li class="section-product-item section-product-item-new ' + lazy + '" item_id="' + value.id + '"><a data-transition="slide" data-ajax=false class="'+value.aclass+'" link="' + url + '" product_id="' + value.id + '"><table style="width:100%"><tr><td style="vertical-align: middle;text-align:center;width:64px" class="first"><img src="' + value.image + '" ></td><td style="vertical-align:middle;text-align:left;padding-left:1.1rem;"><div class="box_catalog_status">' + text_flag + ' </div><h2 class="item_name_only ' + dop_class + '">' + value.name + '</h2><div class="props">' + prop + '</div>' + row2 + bonuses + payment_parts + '</td><td style="width:25px"></td>' + delete_td + '</tr></table></a></li>';
    } else {

        if(!!value.sale && value.sale=='Y'){
           url = "category-items=sale&sale_category=" + value.link;
        }

        return '<li class="section-product-item section-product-item-new ' + lazy + '" item_id="' + value.id + '"><a data-transition="slide" data-ajax=false class="'+value.aclass+' section-product-item" link="#products-list?' + url + '"><table style="width:100%"><tr><td style="vertical-align: middle;text-align:center;width:64px" class="first"><img src="' + value.image + '" ></td><td style="vertical-aling:middle;text-align:left;padding-left:1.1rem;"><div class="box_catalog_status">' + text_flag + ' </div><h2 class="item_name_only ' + dop_class + '">' + value.name + '</h2></td><td style="width:25px"></td>' + delete_td + '</tr></table></a></li>';
    }
}