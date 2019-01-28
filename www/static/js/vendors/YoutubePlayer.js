(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var YoutubePlayer = (function () {
    function YoutubePlayer(oUPlayer, _onReady) {
        _classCallCheck(this, YoutubePlayer);

        this.insert = oUPlayer.wrapper.querySelector('[data-CombinedPlayer-insert="video"]');
        this.insert.innerHTML = '<iframe class="combinedPlayer_youtube" src="' + oUPlayer.data.youtube + '?enablejsapi=1" allowfullscreen="" frameborder="0"></iframe>';
        this.youtubeIframe = this.insert.firstChild;
        this.isFullscreenMode = false; /* отслеживаем, этот ли плеер находится в полноэкранном режиме */
        var self = this;

        this.oUPlayer = oUPlayer;
        this.YT = new YT.Player(this.youtubeIframe, {
            events: {
                'onReady': function onReady(event) {
                    _onReady(event);
                },
                'onStateChange': function onStateChange(event) {
                    self._onPlayerStateChange.call(self, event);
                }
            }
        });

        var eName = (function (doc) {
            if ('onfullscreenchange' in doc) return 'fullscreenchange';
            if ('onmozfullscreenchange' in doc) return 'mozfullscreenchange';
            if ('onwebkitfullscreenchange' in doc) return 'webkitfullscreenchange';
            if ('onmsfullscreenchange' in doc) return 'msfullscreenchange'; //MSFullscreenChange
            return false;
        })(document);

        var fullscreenElement = (function (doc) {
            if ('fullscreenElement' in doc) return 'fullscreenElement';
            if ('mozFullScreenElement' in doc) return 'mozFullScreenElement';
            if ('webkitFullscreenElement' in doc) return 'webkitFullscreenElement';
            if ('msFullscreenElement' in doc) return 'msFullscreenElement';
            return false;
        })(document);

        document.addEventListener(eName, function (e) {
            if (document[fullscreenElement] == self.youtubeIframe) {
                self.isFullscreenMode = true;
                oUPlayer._onFullscreen('youtube');
            } else if (self.isFullscreenMode === true) {
                //этот плеер находился в полноэкранном режиме
                self.isFullscreenMode = false;
                oUPlayer._onFullscreenExit('youtube');
            }
        });

        setInterval(function () {
            if (document[fullscreenElement]) {
                console.log('Элемент в полноэкранном режиме', document[fullscreenElement]);
            }
        }, 100);
    }

    YoutubePlayer.prototype._onPlayerStateChange = function _onPlayerStateChange(event) {
        if (event.data === 0) {
            //конец проигрывания
            var exit = (function () {
                if (document.exitFullscreen) return 'exitFullscreen';else if (document.mozCancelFullScreen) return 'mozCancelFullScreen';else if (document.webkitCancelFullScreen) return 'webkitCancelFullScreen';else if (document.msExitFullscreen) return 'msExitFullscreen';
                return false;
            })();

            //выходим из фуллскрина
            if (self.isFullscreenMode) {
                try {
                    document[exit]();
                } catch (e) {};
            }

            this.afterEnd();
        }
    };

    YoutubePlayer.prototype.initialize = function initialize() {
        this.YT.playVideo();
        this.YT.pauseVideo();
    };

    YoutubePlayer.prototype.start = function start() {
        this.YT.playVideo();
    };

    YoutubePlayer.prototype.abort = function abort() {
        if (this.YT.getPlayerState && this.YT.getPlayerState() === 2) return false;
        if (this.YT.pauseVideo) this.YT.pauseVideo();
    };

    YoutubePlayer.prototype.del = function del() {
        this.YT.destroy();
        this.insert.innerHTML = '';
    };

    return YoutubePlayer;
})();

//
exports.YoutubePlayer = YoutubePlayer;

},{}]},{},[1]);
