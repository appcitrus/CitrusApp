function InitGA(){

    document.addEventListener("deviceready", function(){

    if(MobileUser.userID>0){
        window.analytics.setUserId(MobileUser.userID);
    }
    
        window.analytics.startTrackerWithId('UA-2170097-21');
        console_log("GA Init");
    });

}

function GA_track(page){

    if(page == ""){
        page = "Main page";
    }

    window.analytics.trackView(page);

    console_log("page: " + page);
}

function GA_event(Category,Action,Label,Value){
    window.analytics.trackEvent(Category, Action, Label, Value);  //Label and Value are optional, Value is numeric
}

function GA_set_id(id){
    window.analytics.setUserId(id);
    console_log("userID: " + id);
}

function GA_addTransaction(ID,Affiliation,Revenue,Tax,Shipping,Currency){
    //window.analytics.addTransaction('ID', 'Affiliation', Revenue, Tax, Shipping, 'Currency Code');
    window.analytics.addTransaction(ID, Affiliation, Revenue, Tax, Shipping, Currency);
}

function GA_addTransactionItem(ID,Name,SKU,Category,Price,Quantity,Currency){
    //window.analytics.addTransactionItem('ID', 'Name', 'SKU', 'Category', Price, Quantity, 'Currency Code');
    window.analytics.addTransactionItem(ID, Name, SKU, Category, Price, Quantity, Currency);
}


InitGA();