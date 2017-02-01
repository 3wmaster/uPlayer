(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var YoutubePlayer = (function () {
    function YoutubePlayer(oUPlayer) {
        _classCallCheck(this, YoutubePlayer);

        oUPlayer.insert.innerHTML = '<iframe class="combinedPlayer_youtube" src="' + oUPlayer.data.youtube + '?enablejsapi=1" allowfullscreen="" frameborder="0"></iframe>';
        this.ready = false;
        var self = this;

        this.oUPlayer = oUPlayer;
        this.YT = new YT.Player(oUPlayer.insert.firstChild, {
            events: {
                'onReady': function onReady(event) {
                    self._onPlayerReady.call(self, event);
                },
                'onStateChange': function onStateChange(event) {
                    self._onPlayerStateChange.call(self, event);
                }
            }
        });
    }

    YoutubePlayer.prototype._onPlayerReady = function _onPlayerReady(event) {
        this.ready = true;
        event.target.playVideo();
    };

    YoutubePlayer.prototype._onPlayerStateChange = function _onPlayerStateChange(event) {
        if (event.data === 0) this.afterEnd();
    };

    YoutubePlayer.prototype.abort = function abort() {
        if (this.YT.getPlayerState && this.YT.getPlayerState() === 2) return false;
        if (this.YT.pauseVideo) this.YT.pauseVideo();
        this.afterAbort(); //определяется в основном плеере
    };

    YoutubePlayer.prototype.del = function del() {
        this.YT.destroy();
        this.oUPlayer.insert.innerHTML = '';
    };

    return YoutubePlayer;
})();

//
exports.YoutubePlayer = YoutubePlayer;

},{}]},{},[1]);
