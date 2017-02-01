(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _default = (function () {
	function _default(wrapper) {
		_classCallCheck(this, _default);

		this.console = document.getElementById('console');
		this._createElements(wrapper);
		this._addEventsName();
		this._updateData(JSON.parse(this.wrapper.getAttribute('data-meter')));
		this._addProgress('init', this._calculateRatioByValue());
		this._addEvents();
	}

	_default.prototype._createElements = function _createElements(wrapper) {
		this.wrapper = wrapper;
		this.progress = this.wrapper.querySelector('[data-js="progress"]');
		this.slider = this.wrapper.querySelector('[data-js="slider"]');
		this.data = { min: 0, max: 1, value: 0 }; //by default
	};

	_default.prototype._addEventsName = function _addEventsName() {
		this.eNames = {};
		if (window.navigator.pointerEnabled) this.eNames = { 'down': 'pointerdown', 'move': 'pointermove', 'leave': 'pointerleave', 'up': 'pointerup' };else if (window.navigator.msPointerEnabled) this.eNames = { 'down': 'MSPointerDown', 'move': 'MSPointerMove', 'leave': 'MSPointerLeave', 'up': 'MSPointerUp' };else if ('ontouchstart' in document.documentElement) {
			this.eNames = { 'down': 'touchstart', 'move': 'touchmove', 'leave': 'touchend', 'up': 'touchend' };
		} else this.eNames = { 'down': 'mousedown', 'move': 'mousemove', 'leave': 'mouseleave', 'up': 'mouseup' };
	};

	_default.prototype._updateData = function _updateData(data) {
		for (var key in this.data) {
			this.data[key] = data[key] === undefined ? this.data[key] : data[key];
		}
		this.curValue = this.data.value;
		this.data.delta = this.data.max - this.data.min;
	};

	_default.prototype._addProgress = function _addProgress(status, ratio) {

		var per = ratio * 100 + '%';
		this.slider.style.left = per;
		this.progress.style.width = per;

		this.curValue = ratio * this.data.delta + this.data.min;
		try {
			this.callback(status, this.curValue);
		} catch (e) {}
	};

	_default.prototype._addEvent = function _addEvent(elem, type, handler) {
		if (elem.addEventListener) {
			elem.addEventListener(type, handler, false);
		} else {
			elem.attachEvent("on" + type, handler);
		}
	};

	_default.prototype._removeEvent = function _removeEvent(elem, type, handler) {
		if (elem.removeEventListener) {
			elem.removeEventListener(type, handler, false);
		} else {
			elem.detachEvent("on" + type, handler);
		}
	};

	_default.prototype._addEvents = function _addEvents() {
		var self = this;

		self._circuitStartChange = function (event) {
			self._startChange.call(self, event);
		};
		self._circuitChange = function (event) {
			self._change.call(self, event);
		};
		self._circuit_stopChange = function (event) {
			self._stopChange.call(self, event);
		};

		this._addEvent(this.wrapper, this.eNames.down, function (event) {
			event = event || window.event;
			event.preventDefault(); // Для андройда, чтобы срабатывало touchend

			self._startChange.call(self, event);
			self._addEvent(document.body, self.eNames.move, self._circuitChange);
			self._addEvent(document.body, self.eNames.leave, self._circuit_stopChange);
			self._addEvent(document.body, self.eNames.up, self._circuit_stopChange);
		});
	};

	_default.prototype._startChange = function _startChange(event) {
		event = event || window.event;
		event = event.touches ? event.touches[0] : event;
		this.startX = event.clientX;
		this.wrapperWidth = this.wrapper.getBoundingClientRect().right - this.wrapper.getBoundingClientRect().left;
		this.progressWidth = this.startX - this.wrapper.getBoundingClientRect().left;

		var ratio = Math.min(Math.max(0, this.progressWidth / this.wrapperWidth), 1);
		this._addProgress('down', ratio);
	};

	_default.prototype._change = function _change(event) {
		event = event || window.event;
		event = event.targetTouches ? event.targetTouches[0] : event;

		this._addProgress('move', this._calculateRatioByEvent(event));
	};

	_default.prototype._stopChange = function _stopChange(event) {
		event = event || window.event;
		event = event.changedTouches ? event.changedTouches[0] : event;

		this._removeEvent(document.body, this.eNames.move, this._circuitChange);
		this._removeEvent(document.body, this.eNames.leave, this._circuit_stopChange);
		this._removeEvent(document.body, this.eNames.up, this._circuit_stopChange);

		this._addProgress('up', this._calculateRatioByEvent(event));
	};

	_default.prototype._calculateRatioByEvent = function _calculateRatioByEvent(event) {
		var offset = event.clientX - this.startX;
		var ratio = (this.progressWidth + offset) / this.wrapperWidth;
		ratio = Math.min(Math.max(0, ratio), 1);
		return ratio;
	};

	_default.prototype._calculateRatioByValue = function _calculateRatioByValue() {
		var ratio = this.data.delta ? (this.data.value - this.data.min) / this.data.delta : 0;
		return ratio;
	};

	_default.prototype.update = function update(data) {

		this._updateData(data);
		this._addProgress('update', this._calculateRatioByValue());
	};

	_default.prototype.getValue = function getValue() {
		return this.curValue;
	};

	return _default;
})();

exports['default'] = _default;
;
module.exports = exports['default'];

},{}]},{},[1]);
