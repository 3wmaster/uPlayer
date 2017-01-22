var scriptonload = function(srcAll, func){
	if(typeof srcAll === 'string') srcAll = [srcAll];

	var total = srcAll.length,
		counter = 0,
		checkAll = function(){
			counter++;
			if((counter===total) && func) func();
		},
		loadCallback = function(fname){ /* fname - for ie8 */
			if(this.addEventListener){
				this.removeEventListener('load', loadCallback, false);
				this.isLoading = false;
				checkAll();
			}
			else if (this.readyState == "complete" || this.readyState == "loaded") {
				this.detachEvent('onreadystatechange', fname);
				this.isLoading = false;
				checkAll();
			}
		},
		addEvent = function(script){
			if(script.addEventListener){
				script.addEventListener('load', loadCallback, false);
			}
			else {
				script.attachEvent('onreadystatechange', function fname(){loadCallback.call(script, fname)});
			}
		},
		checkArr = function(arr){
			var iMax = arr.length,
				testobj = {},
				result = false;

			for (var i=0; i< iMax; i++) {
				result = result || testobj.hasOwnProperty(arr[i]);
				testobj[arr[i]] = arr[i];
			}
			return !result;
		};


	//
	if(!checkArr(srcAll)) {
		var msg = 'scriptonload.js: Scripts are not unique!';
		try{console.error(msg)} catch(e){alert(msg)};
		return;
	}

	for(var i=0; i<total; i++){
		var id = 'scriptonload-' + srcAll[i].replace(/[^A-Za-z0-9]/g, '_'),
			script = document.scripts[id];

		if(script){
			if(script.isLoading) addEvent(script);
			else checkAll();
		}
		else {
			script = document.createElement('script');
			script.setAttribute('async', false);
			script.setAttribute('src', srcAll[i]);
			script.setAttribute('id', id);
			script.isLoading = true;
			addEvent(script);
			document.body.appendChild(script);
		}
	}
}
export {scriptonload};










