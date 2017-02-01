(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

exports.__esModule = true;
var ajax = (function () {
	function createRequest() {
		var request = null;
		try {
			request = new XMLHttpRequest();
		} catch (trymicrosoft) {
			try {
				request = new ActiveXObject("Msxml2.XMLHTTP");
			} catch (othermicrosoft) {
				try {
					request = new ActiveXObject("Microsoft.XMLHTTP");
				} catch (failed) {
					request = null;
				}
			}
		}
		if (request == null) {
			alert('Внимание! Объект запроса не создан. Обратитесь к разработчику');
		} else {
			return request;
		}
	}

	return function sendRequest(userData) {
		var str = null,
		    method = userData.method || 'POST';

		if (method === 'POST') {
			str = '';
			for (var key in userData.data) {
				str += key + '=' + userData.data[key] + '&';
			}
			str = str.slice(0, -1);
		};

		var request = createRequest();
		request.open(method, userData.url, true);
		request.setRequestHeader('Content-Type', 'application/xml');
		request.onreadystatechange = function () {
			getRequest(request, userData);
		};
		request.send(str);
		return request;
	};

	function getRequest(request, userData) {
		if (request.readyState == 4) {
			console.log('request.status=' + request.status);
			if (request.status == 200) {
				var message = request.responseText; //передаем полученные данные переменной
				userData.callback(message);
			}
		}
	}
})();

exports.ajax = ajax;

},{}]},{},[1]);
