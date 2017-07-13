(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _jsScriptonload = require('../js/scriptonload');

var VAST = (function () {
	function VAST(param) {
		_classCallCheck(this, VAST);

		this.param = param;
		this._createElements();
		this._add(this.param.path);
	}

	VAST.prototype._createElements = function _createElements() {
		this.data = {}; /* все данные с тега */
		this.data.mediaFile = undefined; /* ссылка на mp4 файл */
		this.data.clickThrough = undefined; /* ссылка с видео */
		this.data.clickTrackingAll = []; /* статистика клика по видео */
		this.data.impressionAll = []; /* src статистика начала проигрывания */
		this.data.keyFrameAll = [0, 25, 50, 75, 100]; /* ключевые кадры в процентах */
		this.data.statEventAll = {}; /* соотв им названия, например, при 50% - название midpoint итд */
		this.xhr = false; /* XMLHttpRequest */
	};

	VAST.prototype._add = function _add(path) {
		var _this = this;

		this._getAdTag(path, function (adTag) {
			if (!adTag) {
				console.error('uPlayer', 'пустой тег (яндекс, например) или <nobanner></nobanner>');
				_this.param.onError();
			} else {
				/* может быть как в WrapperAd так и в прямой рекламе */
				var videoClicksTag = adTag.querySelector('VideoClicks'),
				    clickTrackingAll = videoClicksTag ? videoClicksTag.querySelectorAll('ClickTracking') : null,
				    impressionAll = adTag.querySelectorAll('Impression'),
				    trackingEventsTag = adTag.querySelector('TrackingEvents');

				//
				if (clickTrackingAll) _this._pushCDATA(clickTrackingAll, 'clickTrackingAll');
				if (impressionAll.length) _this._pushCDATA(impressionAll, 'impressionAll');
				if (trackingEventsTag) _this._pushTrackingEvents(trackingEventsTag);

				// WrapperAd или нет
				if (adTag.firstElementChild.nodeName === 'Wrapper') {
					var path = _this._getAdURI(adTag);
					_this._add(path);
				} else {
					/* TODO - здесь будет проверяться VPAID */

					if (!_this._pushMediaFile(adTag)) {
						_this.param.onError(); //медиафайл может не подходить (не мп4 VPAID итд)
					} else {
							_this.data.clickThrough = videoClicksTag.querySelector('ClickThrough').childNodes[0].wholeText.replace(/^\s+/, '').replace(/\s+$/, '');
							_this.param.onSuccess(_this.data); /* все получено, всего хватает, можно запускать рекламу */
						}
				}
			}
		});
	};

	VAST.prototype._pushCDATA = function _pushCDATA(tags, key) {
		var _this2 = this;

		tags.forEach(function (tag) {
			var textNode = tag.childNodes[0];
			if (textNode) _this2.data[key].push(textNode.wholeText.replace(/^\s+/, '').replace(/\s+$/, ''));
		});
	};

	VAST.prototype._pushTrackingEvents = function _pushTrackingEvents(tag) {
		var TrackingAll = tag.getElementsByTagName('Tracking');

		for (var i = 0, j = TrackingAll.length; i < j; i++) {
			var name = TrackingAll[i].getAttribute('event'),
			    src = TrackingAll[i].childNodes[0].wholeText.replace(/^\s+/, '').replace(/\s+$/, '');
			//
			switch (name) {
				case 'start':
					name = '0';break;
				case 'firstQuartile':
					name = '25';break;
				case 'midpoint':
					name = '50';break;
				case 'thirdQuartile':
					name = '75';break;
				case 'complete':
					name = '100';break;
			}

			if (!this.data.statEventAll[name]) this.data.statEventAll[name] = [];
			this.data.statEventAll[name].push(src);
		}
	};

	VAST.prototype._pushMediaFile = function _pushMediaFile(tag) {
		var mediaFilesTag = tag.querySelector('MediaFiles'),
		    optimType = 'video/mp4',
		    optimWidth = 640,
		    optimFile = false,
		    delta = false;

		if (!mediaFilesTag) {
			console.error('uPlayer', 'mediaFilesTag is not define');
			return false;
		}

		mediaFilesTag.querySelectorAll('MediaFile').forEach(function (file) {
			var type = file.getAttribute('type'),
			    w = file.getAttribute('width');

			if (type == optimType) {
				var newDelta = Math.abs(w - optimWidth);

				if (!optimFile || newDelta < delta) {
					optimFile = file;
					delta = newDelta;
				}
			}
		});

		if (optimFile) {
			this.data.mediaFile = optimFile.childNodes[0].wholeText.replace(/^\s+/, '').replace(/\s+$/, '');
			return true;
		} else {
			return false;
		}
	};

	VAST.prototype._getAdTag = function _getAdTag(path, callback) {
		var _this3 = this;

		path = path + '&rnd=' + new Date().getTime();
		console.log('uPlayer', 'loading vast tag ' + path);
		/* TODO почему то не работает */
		//if(this.xhr) return; /* на всякий */
		this.xhr = new XMLHttpRequest();
		//		this.xhr.withCredentials = true; /* это для теста */
		this.xhr.open("GET", path, true);
		this.xhr.onload = function () {
			//console.log('uPlayer vast tag onload', this.xhr.responseText);
			var parser = new DOMParser(),
			    xmlDoc = parser.parseFromString(_this3.xhr.responseText, "text/xml"),
			    adTag = xmlDoc.querySelector('Ad');
			//
			callback(adTag);
			//this.xhr = false;
		};
		this.xhr.timeout = 3000;
		this.xhr.ontimeout = function () {
			_this3.xhr.abort();
			//this.xhr = false;
			console.log('uPlayer', 'VAST tag грузится более 3 секунд');
			_this3.param.onError();
		};
		this.xhr.onerror = function () {
			/* например, блокировщик рекламы */
			//this.xhr = false;
			_this3.param.onError();
		};
		this.xhr.send(null);
	};

	VAST.prototype._getAdURI = function _getAdURI(tag) {
		return tag.querySelector('VASTAdTagURI').childNodes[0].wholeText.replace(/^\s+/, '').replace(/\s+$/, '');
	};

	return VAST;
})();

exports.VAST = VAST;

},{"../js/scriptonload":2}],2:[function(require,module,exports){
'use strict';

exports.__esModule = true;
var scriptonload = function scriptonload(srcAll, func) {
	if (typeof srcAll === 'string') srcAll = [srcAll];

	var total = srcAll.length,
	    counter = 0,
	    checkAll = function checkAll() {
		counter++;
		if (counter === total && func) func();
	},
	    loadCallback = function loadCallback(fname) {
		/* fname - for ie8 */
		if (this.addEventListener) {
			this.removeEventListener('load', loadCallback, false);
			this.isLoading = false;
			checkAll();
		} else if (this.readyState == "complete" || this.readyState == "loaded") {
			this.detachEvent('onreadystatechange', fname);
			this.isLoading = false;
			checkAll();
		}
	},
	    addEvent = function addEvent(script) {
		if (script.addEventListener) {
			script.addEventListener('load', loadCallback, false);
		} else {
			script.attachEvent('onreadystatechange', function fname() {
				loadCallback.call(script, fname);
			});
		}
	},
	    checkArr = function checkArr(arr) {
		var iMax = arr.length,
		    testobj = {},
		    result = false;

		for (var i = 0; i < iMax; i++) {
			result = result || testobj.hasOwnProperty(arr[i]);
			testobj[arr[i]] = arr[i];
		}
		return !result;
	};

	//
	if (!checkArr(srcAll)) {
		var msg = 'scriptonload.js: Scripts are not unique!';
		try {
			console.error(msg);
		} catch (e) {
			alert(msg);
		};
		return;
	}

	for (var i = 0; i < total; i++) {
		var id = 'scriptonload-' + srcAll[i].replace(/[^A-Za-z0-9]/g, '_'),
		    script = document.scripts[id];

		if (script) {
			if (script.isLoading) addEvent(script);else checkAll();
		} else {
			script = document.createElement('script');
			script.setAttribute('async', false);
			script.setAttribute('src', srcAll[i]);
			script.setAttribute('id', id);
			script.isLoading = true;
			addEvent(script);
			document.body.appendChild(script);
		}
	}
};
exports.scriptonload = scriptonload;

},{}]},{},[1]);
