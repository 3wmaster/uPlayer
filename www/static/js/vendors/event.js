(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

exports.__esModule = true;
var event = (function () {

	var guid = 0;

	function fixEvent(event) {
		event = event || window.event;

		if (event.isFixed) {
			return event;
		}
		event.isFixed = true;

		event.preventDefault = event.preventDefault || function () {
			this.returnValue = false;
		};
		event.stopPropagation = event.stopPropagaton || function () {
			this.cancelBubble = true;
		};

		if (!event.target) {
			event.target = event.srcElement;
		}

		if (!event.relatedTarget && event.fromElement) {
			event.relatedTarget = event.fromElement == event.target ? event.toElement : event.fromElement;
		}

		if (event.pageX == null && event.clientX != null) {
			var html = document.documentElement,
			    body = document.body;
			event.pageX = event.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
			event.pageY = event.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
		}

		if (!event.which && event.button) {
			event.which = event.button & 1 ? 1 : event.button & 2 ? 3 : event.button & 4 ? 2 : 0;
		}

		return event;
	}

	/* ���������� � ��������� �������� ������ this = element */
	function commonHandle(event) {
		event = fixEvent(event);

		var handlers = this.events[event.type];

		for (var g in handlers) {
			var handler = handlers[g];

			var ret = handler.call(this, event);
			if (ret === false) {
				event.preventDefault();
				event.stopPropagation();
			}
		}
	}

	return {
		add: function add(elem, type, handler) {
			if (elem.setInterval && elem != window && !elem.frameElement) {
				elem = window;
			}

			if (!handler.guid) {
				handler.guid = ++guid;
			}

			if (!elem.events) {
				elem.events = {};
				elem.handle = function (event) {
					if (typeof Event !== "undefined") {
						return commonHandle.call(elem, event);
					}
				};
			}

			if (!elem.events[type]) {
				elem.events[type] = {};

				if (elem.addEventListener) elem.addEventListener(type, elem.handle, false);else if (elem.attachEvent) elem.attachEvent("on" + type, elem.handle);
			}

			elem.events[type][handler.guid] = handler;
		},

		remove: function remove(elem, type, handler) {
			var handlers = elem.events && elem.events[type];

			if (!handlers) return;

			delete handlers[handler.guid];

			for (var any in handlers) return;
			if (elem.removeEventListener) elem.removeEventListener(type, elem.handle, false);else if (elem.detachEvent) elem.detachEvent("on" + type, elem.handle);

			delete elem.events[type];

			for (var any in elem.events) return;
			try {
				delete elem.handle;
				delete elem.events;
			} catch (e) {
				// IE
				elem.removeAttribute("handle");
				elem.removeAttribute("events");
			}
		}
	};
})();

exports.event = event;

},{}]},{},[1]);
