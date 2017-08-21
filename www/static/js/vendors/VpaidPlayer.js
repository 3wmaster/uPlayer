(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var VpaidPlayer = (function () {
	function VpaidPlayer(oUPlayer, vast) {
		_classCallCheck(this, VpaidPlayer);

		this._createElements(oUPlayer, vast);
		this._load();
	}

	VpaidPlayer.prototype._getHtml = function _getHtml() {
		return '<div data-js="adv-player" class="advPlayer">' + '<video data-js="adv-video" class="advPlayer_video"></video>' + '<div data-js="vpaid-slot" style="position:absolute;left:0;top:0;display:block;width:100%;height:100%;"></div>' + '</div>';
	};

	VpaidPlayer.prototype._createElements = function _createElements(oUPlayer, vast) {
		this.oUPlayer = oUPlayer;
		this.vast = vast;
		this.insert = oUPlayer.wrapper.querySelector('[data-CombinedPlayer-insert="adv"]');
		this.insert.innerHTML = this._getHtml();
		this.wrapper = this.insert.firstChild;
		this.video = this.wrapper.querySelector('[data-js="adv-video"]');
		this.slot = this.wrapper.querySelector('[data-js="vpaid-slot"]');
		this.vpaid = false;
		this.isFinish = false;
		this.isAdLoaded = false; /* AdError может сработать до AdLoaded TODO (может, сделать как то поинтереснее)  */
		this.isAdClickThru = false; /* кликнул или нет пользователь по рекламе. Если кликнул - видео не производим */
	};

	VpaidPlayer.prototype._load = function _load() {
		var _this = this;

		this.loadScriptInIFrame(this.vast.mediaFile, function (iframe) {
			var rect = _this.insert.getBoundingClientRect();

			_this.vpaid = iframe.contentWindow.getVPAIDAd();

			_this.vpaid.subscribe(function () {
				console.log("uPlayer: VPAID событие AdLoaded (реклама загружена)");
				_this.isAdLoaded = true;
				_this.oUPlayer._checkInitPlayers();
				//vpaid.startAd();
			}, "AdLoaded");

			_this.vpaid.subscribe(function () {
				console.log('uPlayer: VPAID событие AdStarted (реклама запущена)', _this.vast.statEventAll.creativeView);
				_this._sendStat(_this.vast.statEventAll.creativeView, 'AdStarted');
			}, "AdStarted");

			_this.vpaid.subscribe(function () {
				console.log("uPlayer: VPAID событие AdImpression (начало реального просмотра)");
				_this._sendStat(_this.vast.impressionAll, 'impression');
			}, "AdImpression");

			_this.vpaid.subscribe(function () {
				console.log("uPlayer: VPAID событие AdVideoStart (старт рекламного видео)");
				_this._sendStat(_this.vast.statEventAll['0'], 'start');
			}, "AdVideoStart");

			_this.vpaid.subscribe(function () {
				console.log("uPlayer: VPAID событие AdVideoFirstQuartile (просмотрена первая четверть)");
				_this._sendStat(_this.vast.statEventAll['25'], 'firstQuartile');
			}, "AdVideoFirstQuartile");

			_this.vpaid.subscribe(function () {
				console.log("uPlayer: VPAID событие AdVideoMidpoint (просмотрена вторая четверть)");
				_this._sendStat(_this.vast.statEventAll['50'], 'midpoint');
			}, "AdVideoMidpoint");

			_this.vpaid.subscribe(function () {
				console.log("uPlayer: VPAID событие AdVideoThirdQuartile (просмотрена третья четверть)");
				_this._sendStat(_this.vast.statEventAll['75'], 'thirdQuartile');
			}, "AdVideoThirdQuartile");

			_this.vpaid.subscribe(function () {
				console.log("uPlayer: VPAID событие AdVideoComplete (просмотрена четвертая четверть)");
				_this._sendStat(_this.vast.statEventAll['100'], 'complete');
			}, "AdVideoComplete");

			_this.vpaid.subscribe(function () {
				console.log("uPlayer: VPAID событие AdStopped (Показ рекламы окончен)");
				_this._finish();
			}, "AdStopped");

			_this.vpaid.subscribe(function (url, uid, playerHandles) {
				console.log('uPlayer: VPAID событие AdClickThru (был осуществлён переход по рекламе)');
				_this._sendStat(_this.vast.clickTrackingAll, 'clickTracking');
				if (playerHandles) {
					_this.isAdClickThru = true;
					//this._finish(true);
					window.open(url);
				}
			}, "AdClickThru");

			_this.vpaid.subscribe(function () {
				console.log("VPAID: Реклама пропущена пользователем (AdSkipped)");
				_this._finish();
			}, "AdSkipped");

			_this.vpaid.subscribe(function () {
				console.log("uPlayer: VPAID событие AdUserClose (реклама закрыта пользователем)");
				_this._finish();
			}, "AdUserClose");

			_this.vpaid.subscribe(function (data) {
				console.log("uPlayer: VPAID событие AdError (Ошибка показа рекламы)");
				_this._finish();
			}, "AdError");

			_this.vpaid.initAd(rect.width, rect.height, "normal", 0, {
				AdParameters: _this.vast.AdParameters
			}, {
				slot: _this.slot,
				videoSlot: _this.video,
				videoSlotCanAutoPlay: false //передавать true или false в зависимости от возможности программного автозапуска для данного элемента video
			});
		});
	};

	VpaidPlayer.prototype.start = function start(data) {
		/* TODO сейчас данные никакие не передаются, а сохраняются при инициализции плеера. Пока не знаю как лучше будет */
		var self = this;
		this.wrapper.className = 'advPlayer advPlayer-ready advPlayer-active';
		this.vpaid.startAd();
	};

	VpaidPlayer.prototype._finish = function _finish() {
		/* если пользователь щелкнул на рекламу - все останавливаем и дальше не продолжаем*/
		//может срабатывать несколько раз, при AdStopped, AdError; TODO - мож покороче как нить..
		if (this.isFinish) return;
		this.isFinish = true;

		if (!this.isAdLoaded) {
			this.oUPlayer._checkInitPlayers();
			this.del();
		} else {
			var oUPlayer = this.oUPlayer;

			if (this.isAdClickThru) {
				/* был клик по рекламе */
				this.oUPlayer._returnOriginalView('oVpaidPlayer');
			} else {
				if (oUPlayer.oYoutubePlayer) oUPlayer.oYoutubePlayer.start();else oUPlayer.oHTMLPlayer.start();
				oUPlayer.wrapper.className = oUPlayer.wrapper.className.replace(' js-active-adv', ' js-active-video');
			}
		}
	};

	VpaidPlayer.prototype._sendStat = function _sendStat(arr, name) {
		/* везде сделано по разному, нужно как здесь, наверное  */
		if (!arr) return;
		if (typeof arr == 'string') arr = [arr];

		for (var i = 0, j = arr.length; i < j; i++) {
			var src = arr[i];
			var image = document.createElement('IMG');

			//
			image.src = src;
			image.style.cssText = 'visibility:hidden;position:absolute;left:-9999px;top:-9999px;display:block;width:1px;height:1px;overflow:hidden;';
			image.setAttribute('data-stat', name); /* просто для инфо */
			document.body.appendChild(image);
		}
	};

	VpaidPlayer.prototype.loadScriptInIFrame = function loadScriptInIFrame(url, success) {
		var iframe = document.createElement("iframe");
		iframe.style.top = "0";
		iframe.style.position = "absolute";
		iframe.style.width = "1px";
		iframe.style.height = "1px";
		iframe.style.left = "-90000px";

		iframe.onload = function () {
			iframe.contentWindow.inDapIF = true;
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.onload = function () {
				success(iframe);
			};
			script.onerror = function () {
				console.log("uPlayer: ошибка загрузки VPAID скрипта)");
			};
			iframe.contentWindow.document.body.appendChild(script);
			script.src = url;
		};

		//iframe.src = "about:self";
		iframe.src = "about:blank";
		document.body.appendChild(iframe);
	};

	VpaidPlayer.prototype.abort = function abort() {
		/*if(this.video.paused) return;
  this.wrapper.className = this.wrapper.className.replace(/\s*advPlayer-active/, '');
  this.video.pause();*/
	};

	VpaidPlayer.prototype.del = function del() {
		this.insert.innerHTML = '';
		this.oUPlayer.oVpaidPlayer = undefined;
	};

	return VpaidPlayer;
})();

exports.VpaidPlayer = VpaidPlayer;

},{}]},{},[1]);
