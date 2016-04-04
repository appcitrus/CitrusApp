var savePos = null;
$(document).on('pageshow', '[data-role=page], [data-role=dialog]', function(event, ui) {
    try {
        GA_track(window.location.hash);
    } catch (err) {
        console.log("GA_track error:");
        console.log(err);
    }
});
// GoogleAnalytics
// Инициализайция Jquery Mobile
$(document).bind('mobileinit', function() {});
//  Эвент перед созданием страницы Jquery Mobile
$(document).delegate("#main", "pagebeforecreate", function() {});
// Эвент создания страницы main Jquery Mobile
$(document).on("pagecreate", "#main", function() {});
$(document).on("pageinit", "#search-page", function() {
    InitSearchAutocomplete();
});
// Эвент создания страницы Cписка Jquery Mobile
//setup before functions
var typingTimer; //timer identifier
var doneTypingInterval = 1000; //time in ms, 5 second for example
$(document).on("pagecreate", "#search-page", function() {
    /*$("#search-page-search-input").keyup(function() {
      clearTimeout(typingTimer);
      typingTimer = setTimeout(InitSearch, doneTypingInterval);
    });
    $('#search-page-search-input').keydown(function(){
        clearTimeout(typingTimer);
    });*/
    $('#search-page-search-input').keypress(function(e) {
        if (e.which == 13) {
            InitSearch();
        }
    });
    $('#seach-input-button').on("click", function() {
        //clearTimeout(typingTimer);
        InitSearch();
    });
});
// Эвент создания страницы Jquery Mobile
$(document).delegate("#products-list", "pagebeforecreate", function() {});
$(document).on("pageshow", "#filter-page", function() {
    $('#filter-listview').listview("refresh");
});
$(document).on("pageshow", "#filter-values-page", function() {
    $('#filter-props-values-listview').listview("refresh");
});
$(document).on("pageshow", "#sort-page", function() {
    $('#sort-listview').listview("refresh");
});
$(document).on("pageshow", "#main", function() {
    ShowLoading();
    LoadMainPageData();
    setTimeout(function() {
        products_wrap = $('#main-listview-viewed-product').html();
        if (products_wrap != '') {
            $('#main-listview-viewed-products').html(products_wrap)
        }
    }, 3000);
});
$(document).on("pageshow", "#page-cart", function() {
    $("#cart-list").removeClass("edit_mode");
    $("#cart_edit_button").html("Редактировать");
    StartLoadingBasketItems();
});
$(document).on("pageshow", "#page-order", function() {
    ShowLoading();
    MobileUser.UserInfo(FillOrderPageFields);
});
$(document).on("pageshow", "#page-personal", function() {
    ShowLoading();
    MobileUser.UserInfo(FillPersonalPageFields);
});
$(document).on("pagehide", "#page-personal", function() {
    $('.personal-info-module-anketa').parent().removeClass("module-open").addClass("module-close").find(".product-card-info-content").slideUp();
});
$(document).on("pageshow", "#page-preorders", function() {
    ShowLoading();
    MobileUser.GetUserPreOrders(getUserPreOrdersList);
});
$(document).on("pageshow", "#page-orders", function() {
    ShowLoading();
    MobileUser.GetUserOrders(getUserOrdersList);
});
$(document).on("pageshow", "#order-page", function() {
    // Cтраница заказа
    var Id = "";
    var u = $.mobile.path.parseUrl(document.URL);
    if (u.href.search("id=") !== -1) {
        if (u.hash != undefined) {
            var Id = u.hash.replace(/.*id=/, "");
            var data = "";
            if (u.href.search("detail_text=Y") !== -1) {
                data = "&detail_text=Y";
            }
            //LoadOrderPage(Id,data);
            MobileUser.GetUserOrder(Id, getUserOrdersContentList);
        } else {
            alert("404");
        }
    } else {
        alert("404");
    }
});
$(document).on("pageshow", "#page-push", function() {
    ShowLoading();
    MobileUser.GetUserPush(getGetUserPushList);
});
$(document).on("pageshow", "#promo", function() {
    // Cтраница promo
    var id = "",
        u = $.mobile.path.parseUrl(document.URL);
    if (u.href.search("id=") !== -1) {
        if (u.hash != undefined) {
            var id = u.hash.replace(/.*id=/, ""),
                data = "";
            if (u.href.search("detail_text=Y") !== -1) {
                data = "&detail_text=Y";
            }
            console.log(id);
            LoadPromosPage(id, data);
        } else {
            alert("404");
        }
    } else {
        alert("404");
    }
});
$(document).on("pageshow", "#news-page", function() {
    InitNews();
});
$(document).on("pageshow", "#gadgets-page", function() {
    InitGadgets();
});
$(document).on("pageshow", "#actions-page", function() {
    localStorage.one_line = 'true';
    InitActions();
});
$(document).on("pageshow", "#maps-page", function() {
    ShowLoading();
    $('#map_canvas, #pano').height($(document).height());
    $.getScript("/js/gmap.js").done(function() {
        gmapLoadScript();
    });
});
$(document).on("pageshow", "#online-page", function() {
    ShowLoading();
    $.getScript("/js/online.js").done(function() {
        onlineLoadScript();
    });
});
$(document).on("pageshow", "#shoplist-page", function() {
    InitShopList();
});
var owlcarouselproductcard = undefined;
$(document).on("pageshow", "#product-card", function() {
    // Карточка товара
    var productId = "";
    var u = $.mobile.path.parseUrl(document.URL);
    if (u.href.search("product-id=") !== -1) {
        if (u.hash != undefined) {
            $("#product-card-content").hide();
            var productId = u.hash.replace(/.*product-id=/, "");
            loadProductCard(productId);
        } else {
            alert("hash not found");
        }
    }
    ReinitowlProductCard();
});
$(document).on("pageshow", "#products-list", function() {
    if (!product_list_page_loded) {
        ShowLoading();
    }
});
$(document).on("pageshow", "#login-page", function() {
    //$(".screen-center").css("margin-top", $("#login-page").height()/2 - 82);
    //$(".screen-center").show();
    $("#phone").val("+380");
    $('#sendCodeButton').attr("disabled", "disabled");
});
$(document).on("pageshow", "#sms-page", function() {
    //$(".screen-center").css("margin-top", $("#login-page").height()/2 - 82);
    //$(".screen-center").show();
    $("#sms_code").val("");
});
$(document).on("pageshow", "#text-page", function() {
    // Текстовая страница
    var Id = "";
    var u = $.mobile.path.parseUrl(document.URL);
    if (u.href.search("id=") !== -1) {
        if (u.hash != undefined) {
            var Id = u.hash.replace(/.*id=/, "");
            var data = "";
            if (u.href.search("detail_text=Y") !== -1) {
                data = "&detail_text=Y";
            }
            LoadTextPage(Id, data);
        } else {
            alert("404");
        }
    } else {
        alert("404");
    }
});
$(document).on("pageshow", "#reviews-page", function() {
    // Страница с отзывами
    var id = "",
        u = $.mobile.path.parseUrl(document.URL);
    if (u.href.search("id=") !== -1) {
        if (u.hash != undefined) {
            var id = u.hash.replace(/.*id=/, ""),
                data = "";
            if (u.href.search("detail_text=Y") !== -1) {
                data = "&detail_text=Y";
            }
            LoadReviewsPage(id, data);
        } else {
            alert("404");
        }
    } else {
        alert("404");
    }
});
$(document).on('click', '#main-search-input', function() {
    $.mobile.changePage('#search-page');
});
$(document).on("pageshow", "#search-page", function() {});
// Эвент перехода на новую страницу
$(document).on("pagebeforeshow", "#products-list", function(event, data) {
    if (data.prevPage != undefined) {
        var prev_id = data.prevPage.attr('id');
        if (prev_id == "filter-page" || prev_id == "filter-values-page" || prev_id == "product-card") {} else {
            FilterEnums.Clear();
        }
    }
});
var product_list_page_loded = false;
$(document).bind("pagebeforechange", function(e, data) {
    if (typeof data.toPage === "string") {
        if (data.toPage.indexOf("#products-list") !== -1) {
            if ($.mobile.activePage != undefined) {
                var prev_id = $.mobile.activePage.attr('id');
                if (prev_id == "filter-page" || prev_id == "filter-values-page" || prev_id == "product-card") {} else {
                    FilterEnums.Clear();
                }
            }
            // Страница каталог товаров
            if (data.toPage.search(re) !== -1) {
                var u = $.mobile.path.parseUrl(data.toPage),
                    re = "category-items=";
                if (data.toPage.search(re) !== -1) {
                    showCategory(u, data.options);
                    var LazyList = LazyListView("products-listview");
                } else {
                    ShowLoading();
                    showCategory(u, data.options);
                }
            }
        }
        if (data.toPage.indexOf("#search-page") !== -1) {
            //LoadSearchResults(0);
        }
    }
});
// Эвент инициализации страницы
$(document).on("pageinit", "#products-list", function() {});
var start_page;
// Эвент создания DOM
$(document).ready(function() {
    start_page = document.URL;
    $(".navPanelChild").each(function(key, value) {
        var navpanelCopy = $("#nav-panel").clone();
        var id = $(value).attr("id");
        navpanelCopy.attr("id", id);
        $(value).replaceWith(navpanelCopy);
    });
    var appsVV = parseFloat(getVersion());
    if (appsVV > 0 && appsVV < 4.2) {
        $("<style type='text/css'> " + 'html,body{		font-family:"Helvetica Neue", Helvetica, Arial, sans-serif ;}html * {	font-family:"Helvetica Neue", Helvetica, Arial, sans-serif ;}input, select, textarea, button,a {	font-family:"Helvetica Neue", Helvetica, Arial, sans-serif !important; }' + " </style>").appendTo("head");
    }
    if (appsVV > 0 && appsVV < 4.1) {
        $("<style type='text/css'> " + '#state_and_specbonus{display: none;}#sticker_img{display: none;}' + " </style>").appendTo("head");
    }
});
// the initialize event vclick
//$( document ).on( "pageinit", function() {	
var eventstring;
$(document).ready(function() {
    OutedStart();
    if (MobileUser.DeviceReady) {
        navigator.splashscreen.hide();
    }
    InitpushNotifications();
    var eventstring = "click";
    if (navigator.userAgent.match(/(iPad|iPhone|iPod touch);.*CPU.*OS 7_\d/i)) {
        eventstring = "vclick";
    }
    var ua = navigator.userAgent.toLowerCase();
    if (!isIOS) {
        eventstring = "vclick";
    }
    $('.cit_panel_href').on(eventstring, function(event) {
        event.stopPropagation();
        event.preventDefault();
        $($(this).attr('link')).panel("open");
    });
    $('.BackButton').on(eventstring, function(event) {
        event.stopPropagation();
        event.preventDefault();
        $.mobile.back();
    });
    $('.panel-menu-item').on("click", function(event) {
        event.stopPropagation();
    });
    $('body').on('click', '.click_ajax_new_link .delete_td', function(e) {
        e.stopPropagation();
    });
    $('body').on('click', '.click_ajax_new_link', function() {
        window.location = $(this).attr('link');
        //$.mobile.changePage( $(this).attr('link') );
    });
    $('.vclick_link').on(eventstring, function() {
        $.mobile.changePage($(this).attr('link'));
    });
    $('.vclick_simple_panel_close').on("click", function() {
        $(".ui-panel-open").panel("close");
        $.mobile.changePage($(this).attr('link'));
    });
});

$(document).on("pageshow", "#loader", function() {
    // Product card
    var page_to_load = "",u = $.mobile.path.parseUrl(document.URL);
    if (u.href.search("page=") !== -1) {
        if (u.hash != undefined) {
            var page_to_load = u.hash.replace(/.*page=/, "");
            include_page(page_to_load);
        }
    }
});

function handleOpenURL(url) {
    //console.log("received url: " + url);
    var url_to = url.toLowerCase().replace("citrus://", "").replace("http://", "").replace("https://", "").replace("http", "").replace("//", "").replace("&", "").replace(" ", "");
    //console.log("url_to: " + url_to);
    if (url_to.indexOf('#product-card?product-id=') == 0) {
        window.location = url_to;
    } else {
        $.mobile.changePage(url_to);
    }
}

$(document).on('click', '#personal_BirthDate', function() {
    var currentField = $(this),
        dateval = new Date($(this).val()),
        myNewDate = dateval ? dateval : new Date();
    datePicker.show({
        date: myNewDate,
        mode: 'date',
        allowOldDates: true
    }, function(returnDate) {
        var dates = new Date(returnDate),
            year = dates.getFullYear(),
            month = (dates.getMonth() + 1),
            day = dates.getDate();
        if (month < 10) {
            month = "0" + month;
        }
        if (day < 10) {
            day = "0" + day;
        }
        var properlyFormatted = day + "." + month + "." + year;
        currentField.val(properlyFormatted);
    });
});
$(document).on('click', '.goPushEvent', function() {
    JQueryMobileHandlePushRequest($(this).attr('pevent'), $(this).attr('pid'));
});
$(document).on('click', '.shopCall', function() {
    var shop_phone = $(this).text(),
        shop_phones = shop_phone.replace(/[^-0-9,]/gim, '').split(',');
    window.open('tel:' + shop_phones[0], '_system', 'location=yes');
});
$(document).on('click', '.shopCall2', function() {
    var shop_phone = $(this).attr('tel');
    window.open('tel:' + shop_phone, '_system', 'location=yes');
});
$(document).on('click', '#needUpdateButton', function() {
    window.open('https://play.google.com/store/apps/details?id=ua.citrus.app.shop', '_system', 'location=yes');
    return false;
});
$(document).on('click', '.needNoUpdate, .needUpdate_bg', function() {
    MobileUser.SetStorage('needUpdate', app_ver);
    $('#needUpdate').remove();
});
$(document).on('click', '#needLoginButton', function() {
    $.mobile.changePage('#login-page');
    $("#phone").val($('#needLoginEnterNumber').val());
    MobileUser.Authorization_sendCode($('#phone').val());
    $('#needLogin').remove();
});
$(document).on('click', '.needNoLogin, .needLogin_bg', function() {
    sessionStorage.setItem("needLogin", 1);
    $('#needLogin').remove();
});
$(document).on('click', '#payment-btn', function() {
    window.open("http://m.citrus.ua/ajax/on/payment.php?id=" + $(this).attr('order_id') + "&uid=" + $(this).attr('uid') + "&token=" + $(this).attr('token'), '_system', 'location=yes');
    return false;
});
$(document).on("pageshow", "#page-wishes", function() {
    ShowLoading();
    MobileUser.GetUserWishes(getUserWishesList);
});
$(document).on("pageshow", "#page-wish", function() {
    // Wish Page
    var id = "", u = $.mobile.path.parseUrl(document.URL);
    if (u.href.search("id=") !== -1) {
        if (u.hash != undefined) {
            var id = u.hash.replace(/.*id=/, "");
            MobileUser.GetUserWish(id, getUserWishContentList);
        } else {
            alert("404");
        }
    } else {
        alert("404");
    }
});
$(document).on('click', '.wish_full_page', function() {
    window.open("http://www.citrus.ua/personal/wishlist/", '_system', 'location=yes');
    return false;
});
$(function() {
    $("#nav-panel").panel().enhanceWithin();
});
$.event.special.swipe.horizontalDistanceThreshold = 10;
$(document).on("swiperight swipeleft", function(e) {
    if ($(e.target).hasClass('owl-lazy')) {} else if ($.mobile.activePage.jqmData("panel") !== "open") {
        if (e.type === "swiperight") {
            $("#nav-panel").panel().panel("open");
        }
    }
});
$(document).on("pageshow", function() {
    $("#global-up-button").css('bottom', '16px');
    getUserBonusPanel();
});
$(document).on('click', '#product-card-info', function() {
    GA_event('Action block on product page', 'click-on-dropdown-aktsia', $('#product-card-content h2').first().text());
});
$(document).on('click', '.product_actions_gas', function() {
    GA_event('Action block on product page', 'click-on-active-aktsia', $(this).find('h2').first().text());
});
$("#ui-page-top").swipe({
    swipe: function(event, direction, distance, duration, fingerCount, fingerData) {
        if (direction == 'down') {
            ShowLoading();
            var deferred = $.Deferred();
            setTimeout(function() {
                location.reload();
                $.mobile.loading("hide");
            }, 2000);
            return deferred.promise();
        }
    },
    threshold: 0
});
$(document).ready(function() {
    var upb = $('#global-up-button');
    if (window.scrollY > 100) {
        upb.fadeIn();
    } else {
        upb.fadeOut();
    }
    $(document).on("scrollstart", function() {
        if ($(this).scrollTop() > 100) {
            upb.fadeIn();
        } else {
            upb.fadeOut();
        }
    });
    upb.on('click', function() {
        $('html,body').animate({
            scrollTop: 0
        }, 500);
        upb.fadeOut();
        return false;
    });
});
//google-map detail page
$(document).on("pageshow", "#detail-googlemap", function() {
    var Id = "";
    var u = $.mobile.path.parseUrl(document.URL);
    if (u.href.search("id=") !== -1) {
        if (u.hash != undefined) {
            var Id = u.hash.replace(/.*id=/, "");
            LoadDetailPageMap(Id);
        } else {
            alert("404");
        }
    } else {
        alert("404");
    }
});
//Function $.mobile.back()
$(window).on("navigate", function(event, data) {
    var direction = data.state.direction;
    if (direction == 'back') {
        savePos = null;
    }
    /*if (direction == 'forward') {
    }*/
});
$(document).on("pageshow", "#bundle", function() {
    // Cтраница bundle
    var id = "",
        u = $.mobile.path.parseUrl(document.URL);
    if (u.href.search("id=") !== -1) {
        if (u.hash != undefined) {
            var id = u.hash.replace(/.*bundle_id=/, ""),
                data = "";
            LoadBundlePage(id, data);
        } else {
            alert("404");
        }
    } else {
        alert("404");
    }
});
$(document).on("pageshow", "#wish-add-page", function() {
    // Страница добавления желания
    if (id = getPageIdByUri()) {
        LoadWishAddPage(id, 'main');
    }
});
$(document).on('click', '#wish-add-tolist-btn', function() {
    var data = {},
        user_wishes_array = [];
    $(".check_wish_list").each(function(index) {
        if ($(this).attr("checked_box") == "Y") {
            user_wishes_array.push($(this).attr('value'));
        }
    });
    data.wishlist_checkbox = user_wishes_array;
    data.wishlish_name = $('#wish-add-new-list').val();
    $('#wish-add-new-list').val('');
    $("#wishEditButton").html("Редактировать");
    $(".delete_td").hide();
    if (data.wishlist_checkbox.length == 0 && data.wishlish_name.length == 0) {
        alert('Выберите список или заполните название');
    } else if (id = getPageIdByUri()) {
        LoadWishAddPage(id, 'add', data);
        window.location = '#page-wishes';
    }
});
$(document).on("pageshow", "#wish-done-page", function() {
    loadjscssfile("http://m.citrus.ua/css/socialLikesFlat.css", "css");
    loadjscssfile("http://m.citrus.ua/js/clean/socialLikesFlat.min.js", "js");
});
$(document).on('click', '.removeWishList', function() {
    if (confirm('Вы уверены, что хотите удалить это список?')) {
        if (wish_id = getPageIdByUri()) {
            var data = {};
            data.wish_id = wish_id;
            LoadWishAddPage('', 'rem', data);
            window.location = '#page-wishes';
        }
    } else {}
});
$(document).on("pageshow", "#page-preorder", function() {
    if (!MobileUser.IsAuthorized) {
        MobileUser.LoginPromt();
        return false;
    }
    InitCityAutocomplete();
    MobileUser.UserInfo(FillPreorderPageFields);
});

/**
 * Autocompletion of the city
 */
var firstClick = true,
    city_enter = false;
$(document).ready(function() {
    $('body').on('click', '#page-preorder-content .ui-input-search input', function() {
        var selCity = $(this),
            sug = $('.suggestions');
        sug.show();
        $('.suggestion-i').click(function(e) {
            e.preventDefault();
            var city_name = $(this).text();
            if (city_name == 'Введите другой город ...') {
                $(selCity).val('').attr('placeholder', 'Введите свой город').focus();
                sug.hide();
                firstClick = false;
                return;
            }
            $(selCity).val(city_name);
            sug.hide();
            firstClick = false;
        })
        firstClick = false;
    });
    $(document).bind('click.myEvent', function(e) {
        if (!firstClick && $(e.target).closest('.suggestions').length == 0 && $(e.target).data('type') != 'search') {
            $('.suggestions').hide();
            firstClick = true;
        }
    });
    $('body').on('keyup', '#page-preorder-content .ui-input-search input', function(e) {
        if (e.which == 13) {
            city_enter = true;
        } else {
            $('.suggestions').hide();
            $('#preorder_city_autocomplete').show();
            selectCity(false);
            city_enter = false;
            firstClick = false;
        }
    });
    $('body').on('focusout', '#page-preorder-content .ui-input-search input', function() {
        if (city_enter === false) {
            $(this).val('').attr('placeholder', 'Введите свой город').focus();
            selectCity(false);
        }
    });
    $(document).on('click', '.suggestion-i a', function() {
        city_enter = true;
    });
    $(document).on('click', '.search_ordat a', function(e) {
        e.preventDefault();
        var city_name = $(this).text(),
            so = $(this).closest('.search_ordat');
        $('#page-preorder-content .ui-input-search input').val(city_name);
        $('.ui-autocomplete').hide();
        city_enter = true;
        selectCity(so.attr('city_id'), so.attr('city_name'), so.attr('region'));
    })

    //footer copyright
    $.each( $('.footer_copy'), function(key, val){
        $(val).html('<span>©  Цитрус -гаджеты и аксессуары 2000-' + new Date().getFullYear())+' v. ' + app_ver_print+'<span>'; 
    });

});
$(document).on('click', '.vclick_viewed', function() {
    ShowLoading();
    window.location = '#product-card?product-id=' + $(this).attr('product_id');
});