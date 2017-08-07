(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _default = (function () {
	function _default(oUPlayer, data) {
		_classCallCheck(this, _default);

		this._createElements(oUPlayer, data);
		this._addEventsName();
		this._addEvents();
	}

	_default.prototype._getHtml = function _getHtml() {
		return '<div data-js="adv-player" class="advPlayer">' + '<video data-js="adv-video" class="advPlayer_video"></video>' + '<a data-js="adv-clicking-btn" class="advPlayer_link" target="_blank"></a>' + '<div class="advPlayer_controls">' + '<div class="advPlayer_controlsCell">' + '<span class="advPlayer_param">Реклама.</span> <span data-js="adv-left" class="advPlayer_param">&nbsp;</span>' + '</div>' + '<div class="advPlayer_controlsCell">' + '<a data-js="adv-skip-btn" class="advPlayer_param" href="#">&nbsp;</a>' + '</div>' + '</div>' + '<div class="advPlayer_before">' + '<div class="advPlayer_beforeContent">' + '<div class="advPlayer_beforeContentItem">Реклама</div>' + '</div>' + '</div>' + '<div class="advPlayer_preloader"></div>' + '</div>';
	};

	_default.prototype._createElements = function _createElements(oUPlayer, data) {
		this.oUPlayer = oUPlayer;
		this.data = data;
		this.insert = oUPlayer.wrapper.querySelector('[data-CombinedPlayer-insert="adv"]');
		this.insert.innerHTML = this._getHtml();
		this.wrapper = this.insert.firstChild;
		this.param = JSON.parse(oUPlayer.wrapper.getAttribute('data-param'));
		this.video = this.wrapper.querySelector('[data-js="adv-video"]');
		this.clickingBtn = this.wrapper.querySelector('[data-js="adv-clicking-btn"]');
		this.skipBtn = this.wrapper.querySelector('[data-js="adv-skip-btn"]');
		this.advLeft = this.wrapper.querySelector('[data-js="adv-left"]');
		this.format = 'mp4';
		this.userAgent = this._defineUserAgent();
		this.keyFrameAll = []; //массив времени в %  когда отпраляется стата - 0% 25% 50% 75% 100%
		this.statEventAll = {}; //все типы событий по которым отправляется стата, ключ - src
	};

	_default.prototype._defineUserAgent = function _defineUserAgent() {
		var agentAll = ['ipod', 'iphone', 'ipad', 'android', 'blackberry'],
		    i = 0;

		for (i; i < agentAll.length; i++) {
			var re = new RegExp(agentAll[i], 'i');
			if (re.test(navigator.userAgent)) return agentAll[i];
		}
		return false;
	};

	_default.prototype._addEventsName = function _addEventsName() {
		this.eNames = {};
		if (window.navigator.pointerEnabled) this.eNames = { 'down': 'pointerdown', 'move': 'pointermove', 'enter': 'pointerenter', 'leave': 'pointerleave', 'up': 'pointerup' };else if (window.navigator.msPointerEnabled) this.eNames = { 'down': 'MSPointerDown', 'move': 'MSPointerMove', 'enter': 'MSPointerEnter', 'leave': 'MSPointerLeave', 'up': 'MSPointerUp' };else if ('ontouchstart' in document.documentElement) {
			this.eNames = { 'down': 'touchstart', 'move': 'touchmove', 'enter': 'touchstart', 'leave': 'touchend', 'up': 'touchend' };
		} else this.eNames = { 'down': 'mousedown', 'move': 'mousemove', 'enter': 'mouseenter', 'leave': 'mouseleave', 'up': 'mouseup' };
	};

	_default.prototype._addEvents = function _addEvents() {
		var self = this;

		this.video.onloadedmetadata = function (event) {
			self._updateTimeCur.call(self, 0);
			self._ready.call(self);
		};

		this.video.ontimeupdate = function () {
			/*
   * В ФФ это событие может сработать после события onended
   * при этом время продолжительности видео возвращается NAN
   * TODO в основном плеере
   * */
			if (isNaN(this.duration)) return false;
			self._updateTimeCur.call(self, this.currentTime);
		};

		this.video.onended = function () {
			self._endCallback.call(self);
		};

		this.skipBtn.onclick = function () {
			self._skip.call(self);
			return false;
		};

		this.clickingBtn.onclick = function () {
			self._clicking.call(self);
		};
	};

	_default.prototype._skip = function _skip() {
		if (this.skipBtn.innerHTML !== 'Пропустить') return false;

		this.wrapper.className = this.wrapper.className.replace(/\s*advPlayer-active/, '');
		this.video.pause();
		this.afterSkip();
	};

	_default.prototype._clicking = function _clicking() {
		this.wrapper.className = this.wrapper.className.replace(/\s*advPlayer-active/, '');
		this.video.pause();
		this.afterClicking();
	};

	_default.prototype._endCallback = function _endCallback() {
		this.wrapper.className = this.wrapper.className.replace(/\s*advPlayer-active/, '');
		this.afterEnd(); //определяется в основном плеере
	};

	_default.prototype._reloadData = function _reloadData(data) {
		var source = document.createElement('SOURCE');

		//
		this.clickingBtn.setAttribute('href', data.clickThrough);
		this.video.innerHTML = '';
		source.setAttribute('src', data.mediaFile);
		source.setAttribute('type', 'video/' + this.format);
		this.video.appendChild(source);
		this.video.load();
	};

	_default.prototype._updateTimeCur = function _updateTimeCur(sec) {
		var leftTime = Math.floor(this.video.duration - sec),
		    text = leftTime ? 'Осталось ' + leftTime + 'сек' : '&nbsp;',
		    skipTime = Math.round(5 - sec);

		this.advLeft.innerHTML = text;

		if (skipTime > 0 && this.userAgent !== 'iphone') this.skipBtn.innerHTML = 'Пропустить через ' + skipTime; //В айфоне всегда можно закрыть
		else this.skipBtn.innerHTML = 'Пропустить';
		this._checkStat();
	};

	_default.prototype._checkStat = function _checkStat() {
		/* делаем по аналогии с флеш-плеером, где даже при перемотке статистика считается */
		if (!this.data.keyFrameAll.length) return false;

		var persent = Math.round(this.video.currentTime / this.video.duration * 100);
		if (this.data.keyFrameAll[0] === persent || this.data.keyFrameAll[0] < persent) {
			this._sendStat(this.data.keyFrameAll[0] + '');

			this.data.keyFrameAll.shift();
			this._checkStat();
		}
	};

	_default.prototype._sendStat = function _sendStat(name) {
		var arr;
		if (arr = this.data.statEventAll[name]) {
			for (var i = 0, j = arr.length; i < j; i++) {
				var src;
				if (src = arr[i]) {
					var image = document.createElement('IMG');
					image.src = src;
					image.setAttribute('data-name', name);
					image.style.cssText = 'visibility:hidden;position:absolute;left:-9999px;top:-9999px;display:block;width:1px;height:1px;overflow:hidden;';
					document.body.appendChild(image);
				}
			}
		}
	};

	_default.prototype._ready = function _ready() {
		var self = this;

		//this.video.muted = false;

		/*if( this.userAgent === 'iphone'){
  	this.wrapper.className = 'advPlayer advPlayer-ready advPlayer-active advPlayer-before';
  	setTimeout(function(){
  		self.wrapper.className = 'advPlayer advPlayer-ready advPlayer-active';
  		self.video.play();
  	}, 1500);
  }
  else {
  	this.wrapper.className = 'advPlayer advPlayer-ready advPlayer-active';
  	this.video.play();
  }*/

		this.wrapper.className = 'advPlayer advPlayer-ready advPlayer-active';
		this.video.play();

		//this.video.muted = false;
	};

	_default.prototype.start = function start(data) {
		/* TODO сейчас данные никакие не передаются, а сохраняются при инициализции плеера. Пока не знаю как лучше будет */
		var self = this;
		this.wrapper.className = 'advPlayer advPlayer-active  advPlayer-waiting';
		self._reloadData.call(self, self.data);

		/* оправляем статистику начала проигрывания */
		var impressionAll = this.data.impressionAll;
		for (var i = 0, j = impressionAll.length; i < j; i++) {
			var src = impressionAll[i];
			var image = document.createElement('IMG');

			//
			image.src = src;
			image.style.cssText = 'visibility:hidden;position:absolute;left:-9999px;top:-9999px;display:block;width:1px;height:1px;overflow:hidden;';
			document.body.appendChild(image);
		}
	};

	_default.prototype.abort = function abort() {
		if (this.video.paused) return;
		this.wrapper.className = this.wrapper.className.replace(/\s*advPlayer-active/, '');
		this.video.pause();
	};

	_default.prototype.del = function del() {
		this.video.onloadedmetadata = function () {};
		this.video.innerHTML = '';
		this.video.setAttribute('src', '');
		this.insert.innerHTML = '';
	};

	return _default;
})();

exports['default'] = _default;
module.exports = exports['default'];

},{}]},{},[1]);
