(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _jsScriptonload = require('../js/scriptonload');

var VASTTag = (function () {
	function VASTTag(param) {
		_classCallCheck(this, VASTTag);

		this.param = param;
		this._createElements();
		this._add(this.param.path);
	}

	VASTTag.prototype._createElements = function _createElements() {
		this.data = {}; /* все данные с тега */
		this.data.mediaFile = undefined; /* ссылка на медиа файл */
		this.data.clickThrough = undefined; /* ссылка с видео */
		this.data.clickTrackingAll = []; /* статистика клика по видео */
		this.data.impressionAll = []; /* src статистика начала проигрывания */
		this.data.keyFrameAll = [0, 25, 50, 75, 100]; /* ключевые кадры в процентах */
		this.data.statEventAll = {}; /* соотв им названия, например, при 50% - название midpoint итд + все остальные */
		this.xhr = false; /* XMLHttpRequest */
	};

	VASTTag.prototype._add = function _add(path) {
		var _this = this;

		if (!path) {
			console.error('uPlayer', 'тег отсутствует');
			this.param.onError();
			return;
		}

		this._getAdTag(path, function (adTag) {
			/* TODO может быть несколько креативов 'Creative' итд В общем сделать нормальный разбор */

			if (!adTag) {
				console.error('uPlayer', 'пустой тег или <nobanner></nobanner>');
				_this.param.onError();
			} else {
				/* может быть как в WrapperAd так и в прямой рекламе */
				var videoClicksTag = adTag.querySelector('VideoClicks'),
				    clickTrackingAll = videoClicksTag ? videoClicksTag.querySelectorAll('ClickTracking') : null,
				    impressionAll = adTag.querySelectorAll('Impression'),
				    trackingEventsTag = adTag.querySelector('TrackingEvents');

				//
				_this.data.clickThrough = (function () {
					try {
						return videoClicksTag.querySelector('ClickThrough').childNodes[0].wholeText.replace(/^\s+/, '').replace(/\s+$/, '');
					} catch (e) {
						return undefined;
					}
				})();

				if (clickTrackingAll) _this._pushCDATA(clickTrackingAll, 'clickTrackingAll');
				if (impressionAll.length) _this._pushCDATA(impressionAll, 'impressionAll');
				if (trackingEventsTag) _this._pushTrackingEvents(trackingEventsTag);

				// WrapperAd или нет
				if (adTag.firstElementChild.nodeName === 'Wrapper') {
					var path = _this._getAdURI(adTag);
					_this._add(path);
				} else {
					var advFile = _this._getAdvFile(adTag);

					if (!advFile) {
						//console.error('uPlayer', 'Не найдено нужного формата -  mp4 или VPAID');
						_this.param.onError();
					} else {
						_this.data.mediaFile = advFile.file;
						if (advFile.type == 'mp4') {
							_this.data.skipoffset = _this._getSkipoffset(adTag);
							console.log('this.data.skipoffset', _this.data.skipoffset);
							_this.data.clickThrough = (function () {
								//TODO if(this.data.clickThrough) return this.data.clickThrough;
								try {
									return videoClicksTag.querySelector('ClickThrough').childNodes[0].wholeText.replace(/^\s+/, '').replace(/\s+$/, '');
								} catch (e) {
									return undefined;
								}
							})();
							_this.param.onVast(_this.data); /* все получено, всего хватает, можно запускать рекламу mp4 */
						} else {
								var AdParameters = adTag.querySelector('AdParameters');
								_this.data.AdParameters = AdParameters ? AdParameters.childNodes[0].wholeText.replace(/^\s+/, '').replace(/\s+$/, '') : '';
								_this.param.onVpaid(_this.data); /* все получено, всего хватает, можно запускать рекламу VPAID */
							}
					}
				}
			}
		});
	};

	VASTTag.prototype._pushCDATA = function _pushCDATA(tags, key) {
		var self = this;
		Array.prototype.forEach.call(tags, function (tag) {
			var textNode = tag.childNodes[0];
			if (textNode) self.data[key].push(textNode.wholeText.replace(/^\s+/, '').replace(/\s+$/, ''));
		});
	};

	VASTTag.prototype._pushTrackingEvents = function _pushTrackingEvents(tag) {
		var TrackingEvents = tag.querySelector('TrackingEvents'),
		    TrackingAll = tag.querySelectorAll('Tracking');

		//
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
				default:
					name = name;
			}

			if (!this.data.statEventAll[name]) this.data.statEventAll[name] = [];
			this.data.statEventAll[name].push(src);
		}
	};

	VASTTag.prototype._getAdvFile = function _getAdvFile(tag) {
		var mediaFilesTag = tag.querySelector('MediaFiles'),
		    optimWidth = 640,
		    optimFile = false,
		    delta = false,
		    mediaFile = false;

		if (!mediaFilesTag) {
			console.error('uPlayer', 'mediaFilesTag не найден');
			return false;
		}

		Array.prototype.forEach.call(mediaFilesTag.querySelectorAll('MediaFile'), function (file) {
			var type = file.getAttribute('type'),
			    apiFramework,
			    newDelta,
			    w;

			if (type === 'application/javascript' && file.getAttribute('apiFramework') === 'VPAID') {
				mediaFile = {};
				mediaFile.type = 'VPAID';
				mediaFile.file = file.childNodes[0].wholeText.replace(/^\s+/, '').replace(/\s+$/, '');

				return;
			} else if (type === 'video/mp4') {
				w = file.getAttribute('width');
				newDelta = Math.abs(w - optimWidth);

				if (!optimFile || newDelta < delta) {
					optimFile = file;
					delta = newDelta;
				}
			}
		});

		if (optimFile) {
			mediaFile = {};
			mediaFile.type = 'mp4';
			mediaFile.file = optimFile.childNodes[0].wholeText.replace(/^\s+/, '').replace(/\s+$/, '');
		}

		if (mediaFile) return mediaFile;else return false;
	};

	VASTTag.prototype._getAdTag = function _getAdTag(path, callback) {
		var _this2 = this;

		console.log('get ad tag');
		/* TODO почему то не работает */
		//if(this.xhr) return; /* на всякий */
		this.xhr = new XMLHttpRequest();
		this.xhr.withCredentials = true;
		this.xhr.open("GET", path, true);
		this.xhr.onload = function () {
			console.log('uPlayer', 'Рекламный тег загружен. Смотрим содержимое...');
			var parser = new DOMParser(),
			    xmlDoc = parser.parseFromString(_this2.xhr.responseText, "text/xml"),
			    adTag = xmlDoc.querySelector('Ad');
			//
			callback(adTag);
			//this.xhr = false;
		};
		this.xhr.timeout = 5000;
		this.xhr.ontimeout = function () {
			_this2.xhr.abort();
			//this.xhr = false;
			console.log('uPlayer', 'Рекламный тег грузится более 5 секунд');
			_this2.param.onError();
		};
		this.xhr.onerror = function () {
			/* например, блокировщик рекламы */
			//this.xhr = false;
			_this2.param.onError();
		};
		this.xhr.send(null);
	};

	VASTTag.prototype._getAdURI = function _getAdURI(tag) {
		return tag.querySelector('VASTAdTagURI').childNodes[0].wholeText.replace(/^\s+/, '').replace(/\s+$/, '');
	};

	VASTTag.prototype._getSkipoffset = function _getSkipoffset(tag) {
		var offset = undefined,
		    skipoffset = undefined,
		    def = 5;

		skipoffset = tag.querySelector('Linear').getAttribute('skipoffset');
		if (!skipoffset) {
			try {
				offset = tag.querySelector('Extensions').querySelector('Extension[type*="skipTime"]').childNodes[0].wholeText.replace(/^\s+/, '').replace(/\s+$/, '');
			} catch (e) {
				return def;
			}
		} else offset = skipoffset;

		if (!offset) return def;

		//
		if (offset.indexOf('%') === -1) {
			var arr = offset.split(':'),
			    l = arr.length,
			    seconds = undefined;

			if (l == 2) {
				// время без часов TODO в цикле
				seconds = parseInt(arr[0]) * 60 + parseInt(arr[1]) * 1;
			} else {
				seconds = parseInt(arr[0]) * 60 * 60 + parseInt(arr[1]) * 60 + parseInt(arr[2]) * 1;
			}

			if (seconds == undefined) seconds = def;
			return seconds;
		} else {
			/* TODO % */
			return def;
		}
	};

	return VASTTag;
})();

exports.VASTTag = VASTTag;

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
