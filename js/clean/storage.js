function LocalStorage(){

	this.Init = function (){
	
	}


	this.Get = function(key){
		var value = localStorage.getItem(key);
		if(value== null){
			value = undefined;
		}
		
		return value;
	}
	this.Set = function(key,value){
		localStorage.setItem(key, value);
		return true;
	}
	

	this.Init();
		
}
