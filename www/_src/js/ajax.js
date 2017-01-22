var ajax = (function() {
	function createRequest(){
		var request = null;
		try {request = new XMLHttpRequest();}
		catch (trymicrosoft)
		{
			try {request = new ActiveXObject("Msxml2.XMLHTTP");}
			catch (othermicrosoft)
			{
				try {request = new ActiveXObject ("Microsoft.XMLHTTP");}
				catch (failed) {request = null;}
			}
		}
		if (request == null)
		{
			alert ('Внимание! Объект запроса не создан. Обратитесь к разработчику');
		}
		else {return request;}
	}

	return function sendRequest(userData){
		var str = null,
            method = userData.method || 'POST';

		if(method === 'POST'){
            str = '';
            for(var key in userData.data){
                str += key + '=' + userData.data[key] + '&';
            }
            str = str.slice(0, -1);
        };


		var request=createRequest();
		request.open (method, userData.url, true);
        request.setRequestHeader('Content-Type', 'application/xml');
		request.onreadystatechange =function (){getRequest(request, userData)};
		request.send(str);
        return request;
	}

	function getRequest(request, userData){
		if (request.readyState == 4){
            console.log('request.status=' + request.status);
			if (request.status == 200){
				var message = request.responseText; //передаем полученные данные переменной
				userData.callback(message);
			}
		}
	}
}());

export {ajax};










