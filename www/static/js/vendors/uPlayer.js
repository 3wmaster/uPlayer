(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _default = (function () {
  function _default(oUPlayer) {
    _classCallCheck(this, _default);

    this._createElements(oUPlayer);
    this._addEventsName();
    this._addEvents();
  }

  _default.prototype._getHtml = function _getHtml() {
    return '<div data-js="adv-player" class="advPlayer">' + '<video data-js="adv-video" class="advPlayer_video"></video>' + '<a data-js="adv-clicking-btn" class="advPlayer_link" target="_blank"></a>' + '<div class="advPlayer_controls">' + '<div class="advPlayer_controlsCell">' + '<span class="advPlayer_param">Реклама.</span> <span data-js="adv-left" class="advPlayer_param">&nbsp;</span>' + '</div>' + '<div class="advPlayer_controlsCell">' + '<a data-js="adv-skip-btn" class="advPlayer_param" href="#">&nbsp;</a>' + '</div>' + '</div>' + '<div class="advPlayer_before">' + '<div class="advPlayer_beforeContent">' + '<div class="advPlayer_beforeContentItem">Реклама</div>' + '</div>' + '</div>' + '<div class="advPlayer_preloader"></div>' + '</div>';
  };

  _default.prototype._createElements = function _createElements(oUPlayer) {
    this.oUPlayer = oUPlayer;
    this.insert = oUPlayer.insert;
    this.insert.innerHTML = this._getHtml();
    this.wrapper = oUPlayer.insert.firstChild;
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

  _default.prototype.abort = function abort() {
    if (this.video.paused) return;
    this.wrapper.className = this.wrapper.className.replace(/\s*advPlayer-active/, '');
    this.video.pause();
    this.afterAbort(); //определяется в основном плеере
  };

  _default.prototype._reloadData = function _reloadData(data) {
    var source = document.createElement('SOURCE');

    //
    this.clickingBtn.setAttribute('href', data.advLink);
    this.video.innerHTML = '';
    source.setAttribute('src', data.advVideo);
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
    if (!this.keyFrameAll.length) return false;

    var persent = Math.round(this.video.currentTime / this.video.duration * 100);
    if (this.keyFrameAll[0] === persent || this.keyFrameAll[0] < persent) {
      this._sendStat(this.keyFrameAll[0] + '');

      this.keyFrameAll.shift();
      this._checkStat();
    }
  };

  _default.prototype._sendStat = function _sendStat(name) {
    var arr;
    if (arr = this.statEventAll[name]) {
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

    if (this.userAgent === 'iphone') {
      this.wrapper.className = 'advPlayer advPlayer-ready advPlayer-active advPlayer-before';
      setTimeout(function () {
        self.wrapper.className = 'advPlayer advPlayer-ready advPlayer-active';
        self.video.play();
      }, 1500);
    } else {
      this.wrapper.className = 'advPlayer advPlayer-ready advPlayer-active';
      this.video.play();
    }

    //this.video.muted = false;
  };

  _default.prototype.initialize = function initialize() {
    this.video.innerHTML = '';
    this.video.load();
  };

  _default.prototype.show = function show() {
    var self = this;

    this.wrapper.className = 'advPlayer advPlayer-active  advPlayer-waiting';

    //if(this.param.advType === 'VAST'){
    var url = encodeURIComponent(location.protocol + '//' + location.hostname + location.pathname),

    // path = 'https://static.kinoafisha.info/static/html/vast.xml?rnd=' + new Date().getTime(),
    path = 'https://an.yandex.ru/meta/168554?imp-id=2&charset=UTF-8&target-ref=' + url + '&page-ref=' + url + '&rnd=' + new Date().getTime(),
        x = new XMLHttpRequest();

    //
    x.withCredentials = true;
    x.open("GET", path, true);
    x.onload = function () {
      var parser = new DOMParser();
      var xmlDoc = parser.parseFromString(x.responseText, "text/xml");
      var MediaFile = xmlDoc.getElementById('480p.mp4');
      var ClickThrough = xmlDoc.getElementsByTagName('ClickThrough')[0];

      if (MediaFile) {
        var data = {},
            ImpressionAll = xmlDoc.getElementsByTagName('Impression'),
            TrackingAll = xmlDoc.getElementsByTagName('Tracking'),
            statEventAll = {};

        data.advVideo = MediaFile.childNodes[0].nodeValue;
        data.advLink = ClickThrough.childNodes[0].nodeValue;

        /* оправляем статистику начала проигрывания */
        for (var i = 0, j = ImpressionAll.length; i < j; i++) {
          var src;
          if (src = ImpressionAll[i].childNodes[0].nodeValue) {
            var image = document.createElement('IMG');

            //
            image.src = src;
            image.style.cssText = 'visibility:hidden;position:absolute;left:-9999px;top:-9999px;display:block;width:1px;height:1px;overflow:hidden;';
            document.body.appendChild(image);
          }
        }

        /* формируем данные статистики ключевых кадров */
        for (var i = 0, j = TrackingAll.length; i < j; i++) {
          var name = TrackingAll[i].getAttribute('event'),
              src = TrackingAll[i].childNodes[0].nodeValue;
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

          if (!statEventAll[name]) statEventAll[name] = [];
          statEventAll[name].push(src);
        }

        self.keyFrameAll = [0, 25, 50, 75, 100];
        self.statEventAll = statEventAll;
        self._reloadData.call(self, data);
      } else {
        self.keyFrameAll = [];
        self.statEventAll = {};
        self._showOur.call(self);
      }
    };
    x.onerror = function () {
      /* например, блокировщик рекламы */
      self.keyFrameAll = [];
      self.statEventAll = {};
      self._showOur.call(self);
    };
    x.send(null);

    //}
    // else this._showOur();
  };

  _default.prototype._showOur = function _showOur() {

    var curTime = new Date().getTime();
    var advInterval = 24;

    if (localStorage && !localStorage.isKinoafishaVideoAdv || (curTime - parseFloat(localStorage.isKinoafishaVideoAdv)) / 1000 / 60 / 60 > advInterval) {
      localStorage.isKinoafishaVideoAdv = curTime;
      var data = {};
      data.advVideo = 'https://video.kinoafisha.info/branding/kinoafisha/kinoafisha-youtube3.' + this.format;
      data.advLink = 'https://www.youtube.com/channel/UCNuQyDGBj28VwMRhCy_hTOw';
      this._reloadData(data);
    } else this.afterEnd();
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

},{}],2:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _jsScriptRequest = require('../js/scriptRequest');

var _jsEvent = require('../js/event');

var _jsHTMLPlayer = require('../js/HTMLPlayer');

var _jsHTMLPlayer2 = _interopRequireDefault(_jsHTMLPlayer);

var _jsAdvPlayer = require('../js/AdvPlayer');

var _jsAdvPlayer2 = _interopRequireDefault(_jsAdvPlayer);

var _jsYoutubePlayer = require('../js/YoutubePlayer');

var _jsScriptonload = require('../js/scriptonload');

var CombinedPlayer = (function () {
    function CombinedPlayer(wrapper, name) {
        _classCallCheck(this, CombinedPlayer);

        this.name = name;
        this._insertHTML(wrapper);
        this._createElements();
        this._addEvents();
        this._checkAutoplay();
    }

    CombinedPlayer.prototype._insertHTML = function _insertHTML(wrapper) {
        this.wrapper = wrapper;
        this.data = JSON.parse(this.wrapper.getAttribute('data-param'));

        var age = this.data.age ? '<svg class="combinedPlayer_header_age" role="img"><use xlink:href="/static/img/symbols/sprite.svg#age' + this.data.age + '"></use></svg>' : '';
        var allVideoLink = this.data.allVideoLink ? '<a class="combinedPlayer_header_allVideoLink" href="' + this.data.allVideoLink + '">Все видео</a>' : '';
        var category = this.data.category ? '<span class="combinedPlayer_header_category">' + this.data.category + '</span>' : '';

        var btns = this.data.online ? '<div class="combinedPlayer_playBtns">' + '<div class="combinedPlayer_playBtns_frame">' + '<a class="combinedPlayer_onlineBtn" href="' + this.data.online + '">' + '<svg class="combinedPlayer_onlineBtn_symbol" role="img"><use xlink:href="/static/img/symbols/sprite.svg#play"></use></svg>' + '<span class="combinedPlayer_onlineBtn_text">Смотреть online<br />бесплатно</span>' + '</a>' + '<a data-CombinedPlayer-btn class="combinedPlayer_trailerBtn" href="#">' + '<span class="combinedPlayer_trailerBtn_text">трейлер</span>' + '<svg class="combinedPlayer_trailerBtn_symbol" role="img"><use xlink:href="/static/img/symbols/sprite.svg#play"></use></svg>' + '</a>' + '</div>' + '</div>' : '<a data-CombinedPlayer-btn class="combinedPlayer_playBtn" href="#">' + '<span class="combinedPlayer_playBtn_circle">' + '<svg class="combinedPlayer_playBtn_symbol" role="img"><use xlink:href="/static/img/symbols/sprite.svg#play"></use></svg>' + '</span>' + '</a>';

        this.wrapper.innerHTML = '<div data-CombinedPlayer-insert class="combinedPlayer_insert"></div>' + '<div class="combinedPlayer_preview" style="background-image:url(' + this.data.cover + ')">' + '<span class="combinedPlayer_shadow"></span>' + btns + '<div class="combinedPlayer_header">' + '<div class="combinedPlayer_header_left">' + '&nbsp;' + '</div>' + '<div class="combinedPlayer_header_right">' + category + allVideoLink + age + '</div>' + '</div>' + '</div>';
    };

    CombinedPlayer.prototype._createElements = function _createElements() {
        this.btn = this.wrapper.querySelector('[data-CombinedPlayer-btn]');
        this.insert = this.wrapper.querySelector('[data-CombinedPlayer-insert]');
        this.isMobileAgent = this._defineUserAgent();
        this.isShowAdv = true;
        this.oAdvPlayer;
        this.oHTMLPlayer;
        this.oYoutubePlayer;
        this.HTMLDataApi; /* данные Html плеера. будем загружать только один раз и зранить здесь */
    };

    CombinedPlayer.prototype._defineUserAgent = function _defineUserAgent() {
        var agentAll = ['ipod', 'iphone', 'ipad', 'android', 'blackberry'],
            i = 0;

        for (i; i < agentAll.length; i++) {
            var re = new RegExp(agentAll[i], 'i');
            if (re.test(navigator.userAgent)) return agentAll[i];
        }
        return false;
    };

    CombinedPlayer.prototype._addEvents = function _addEvents() {
        var self = this;

        _jsEvent.event.add(this.btn, 'click', function (e) {
            e.preventDefault();
            self._play.call(self);
        });
    };

    CombinedPlayer.prototype._checkAutoplay = function _checkAutoplay() {
        if (this.data.autoplay) this._play();
    };

    CombinedPlayer.prototype._play = function _play() {
        uPlayer.abortAll(this);

        this._sendStat('');

        if (!this.isShowAdv || this.data.adv === 'hide') {
            /* ||this.isMobileAgent на мобильниках реклама не будет показываться, нужно плееры загружать заранее */
            if (this.data.youtube) this._createYoutubePlayer();else this._createHTMLPlayer();
        } else {
            this._createAdvPlayer();
            //this.oAdvPlayer.initialize();
            this.oAdvPlayer.show();
            this.isShowAdv = false; /* если один раз показали - больше в этом плеере не показываем, без разницы какая реклама */
        }

        if (this.wrapper.className.indexOf('js-active') === -1) this.wrapper.className = this.wrapper.className + ' js-active';
        if (this.onActive) this.onActive();
    };

    CombinedPlayer.prototype._returnOriginalView = function _returnOriginalView(name) {
        this.wrapper.className = this.wrapper.className.replace(' js-active', '');
        this[name].del();
        delete this[name];
        if (this.onDisableActive) this.onDisableActive();
    };

    CombinedPlayer.prototype._sendStat = function _sendStat(persent) {
        /* TODO пока только работает в этом плеере и persent всегда '' сделать на все плееры, избавиться от локальных функций и посмотреть что там по стате на рекламе, там по яндексу по особенному отправляется */
        var image = document.createElement('IMG'),
            path = window.location.hostname.indexOf('kinoafishaspb.ru') === -1 ? 'kinoafisha.info' : 'kinoafishaspb.ru';
        image.src = 'https://api.' + path + '/player/stat/?trailer_id=' + this.data.trailer_id + '&host=' + this.data.host + '&mobile=' + uPlayer.isMobile + '&percent=' + persent;
        image.style.cssText = 'visibility:hidden;position:absolute;left:-9999px;top:-9999px;display:block;width:1px;height:1px;overflow:hidden;';
        document.body.appendChild(image);
    };

    CombinedPlayer.prototype._createYoutubePlayer = function _createYoutubePlayer() {
        var self = this,
            checkLoading = function checkLoading() {
            if (window.isYouTubeIframeAPIReady) addApi();else {
                setTimeout(function () {
                    checkLoading();
                }, 200);
            }
        },
            addApi = function addApi() {
            if (!self.oYoutubePlayer) return false;

            self.oYoutubePlayer = new _jsYoutubePlayer.YoutubePlayer(self);
            self.oYoutubePlayer.afterEnd = function () {
                self._returnOriginalView.call(self, 'oYoutubePlayer');
            };
            self.oYoutubePlayer.afterAbort = function () {
                self._returnOriginalView.call(self, 'oYoutubePlayer');
            };
        };

        //
        this.oYoutubePlayer = 'loading'; /* если вдруг запустили другой плеер, загрузку будем прерывать  */

        if (!window.onYouTubeIframeAPIReady) {
            window.onYouTubeIframeAPIReady = function () {
                window.isYouTubeIframeAPIReady = true;
            };
            _jsScriptonload.scriptonload(['https://www.youtube.com/iframe_api']);
        } else {
            console.error('uPlayer: onYouTubeIframeAPIReady is already exists');
        } /* TODO */

        checkLoading();
    };

    CombinedPlayer.prototype._createAdvPlayer = function _createAdvPlayer() {
        var self = this;

        this.oAdvPlayer = new _jsAdvPlayer2['default'](self);

        this.oAdvPlayer.afterEnd = function () {
            self.oAdvPlayer.del();
            delete self.oAdvPlayer;
            if (self.data.youtube) self._createYoutubePlayer.call(self);else self._createHTMLPlayer.call(self);
        };
        this.oAdvPlayer.afterAbort = function () {
            self._returnOriginalView.call(self, 'oAdvPlayer');
        };
        this.oAdvPlayer.afterSkip = function () {
            self.oAdvPlayer.del();
            delete self.oAdvPlayer;
            if (self.data.youtube) self._createYoutubePlayer.call(self);else self._createHTMLPlayer.call(self);
        };
        this.oAdvPlayer.afterClicking = function () {
            self._returnOriginalView.call(self, 'oAdvPlayer');
        };
    };

    CombinedPlayer.prototype._createHTMLPlayer = function _createHTMLPlayer() {
        var self = this,
            path = this.data.isDev ? 'kinoafishaspb.ru' : 'kinoafisha.info',
            _onSuccess = function _onSuccess(dataApi) {
            self.HTMLDataApi = dataApi;
            if (!self.oHTMLPlayer) return false;

            self.oHTMLPlayer = new _jsHTMLPlayer2['default'](self);
            self.oHTMLPlayer.afterEnd = function () {
                self._returnOriginalView.call(self, 'oHTMLPlayer');
            };
            self.oHTMLPlayer.afterAbort = function () {
                self._returnOriginalView.call(self, 'oHTMLPlayer');
            };
        },
            _onError = function _onError() {};

        //

        if (this.HTMLDataApi) _onSuccess(this.HTMLDataApi);else {
            /* TODO
             * во время загрузки белый экран. Нужно показывать  прелоадер
              * */
            this.oHTMLPlayer = 'loading'; /* если вдруг запустили другой плеер, загрузку будем прерывать  */
            _jsScriptRequest.scriptRequest('//api.' + path + '/player/info/' + this.data.trailer_id + '/', function (dataApi) {
                _onSuccess(dataApi);
            }, function () {
                _onError();
            });
        }
    };

    CombinedPlayer.prototype.abort = function abort() {
        if (this.oAdvPlayer) this.oAdvPlayer.abort();else if (this.oHTMLPlayer) {
            if (this.oHTMLPlayer === 'loading') {
                this.wrapper.className = this.wrapper.className.replace(' js-active', '');
                delete this.oHTMLPlayer;
            } else this.oHTMLPlayer.abort();
        } else if (this.oYoutubePlayer) {
            if (this.oYoutubePlayer === 'loading') {
                this.wrapper.className = this.wrapper.className.replace(' js-active', '');
                delete this.oYoutubePlayer;
            } else this.oYoutubePlayer.abort();
        }
    };

    CombinedPlayer.prototype.del = function del() {
        if (this.oAdvPlayer) this.oAdvPlayer.del();
        if (this.oHTMLPlayer && this.oHTMLPlayer.del) this.oHTMLPlayer.del();
        if (this.oYoutubePlayer && this.oYoutubePlayer.del) this.oYoutubePlayer.del();

        this.wrapper.className = this.wrapper.className.replace(' js-active', '');
        this.wrapper.innerHTML = '';
        ;
        delete uPlayer.all[this.name];
    };

    CombinedPlayer.prototype.destroy = function destroy() {
        /* аналог del */
        this.del();
    };

    return CombinedPlayer;
})();

//
exports.CombinedPlayer = CombinedPlayer;

},{"../js/AdvPlayer":1,"../js/HTMLPlayer":3,"../js/YoutubePlayer":5,"../js/event":6,"../js/scriptRequest":7,"../js/scriptonload":8}],3:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _jsMeter = require('../js/Meter');

var _jsMeter2 = _interopRequireDefault(_jsMeter);

var _default = (function () {
	function _default(oUPlayer) {
		_classCallCheck(this, _default);

		this._createElements(oUPlayer);
		this._resetStat();
		this._addEventsName();

		if (!this._defineTech()) {
			//this.wrapper.className = this.wrapper.className + ' htmlPlayer-native';
			this.isCanPlay = false;
			return false;
		}

		this._resetNativeVideo();
		this._initPoster();
		this._initMute();
		this._initVolume();
		this._initRewind();
		this._initBuffered();
		this._initEmbed();
		this._addEvents();
		this._addToggle();
		this._getQuality();
		this._addQuality();
		this._addFullscreen();
		this._addSharePanel();
		this._addFooterPanel();
		this._reloadVideo();
	}

	_default.prototype._getHtml = function _getHtml(data) {

		var LQ = data.files.low ? data.files.low.path.replace(/\.mp4$/, '') : false;
		var HQ = data.files.high ? data.files.high.path.replace(/\.mp4$/, '') : false;
		var quality = '"LQ": "' + LQ + '"' + (HQ ? ', "HQ": "' + HQ + '"' : '');

		return '<div data-js="html-player" data-quality=\'{' + quality + '}\' class="htmlPlayer">' + '<video data-js="video" preload="metadata" class="htmlPlayer_video" controls="controls" poster="' + data.poster + '" webkit-playsinline>' + '<source src="' + data.files.low.path + '" type="video/mp4" />' + '<a class="htmlPlayer_altVideo" href="' + data.files.low.path + '"  style="background-image:url(' + data.poster + ')">' + '<img class="htmlPlayer_altVideoPoster" src="' + data.poster + '" alt="" />' + '<img class="htmlPlayer_altVideoBtn" src="https://video.kinoafisha.info/i/player/play-btn.png" alt="" />' + '</a>' + '</video>' + '<div data-js="toggle" class="htmlPlayer_toggle">' + '<img class="htmlPlayer_bigPauseBtn" src="https://video.kinoafisha.info/i/player/pause-btn.png" alt="" />' + '</div>' + '<div data-js="footer" class="htmlPlayer_footer">' + '<div data-js="controls" class="htmlPlayer_controls">' + '<div class="htmlPlayer_controlsCell htmlPlayer_controlsCell-shrink">' + '<div class="htmlPlayer_playback htmlPlayer_controlsBtn">' + '<img data-js="play"  class="htmlPlayer_playBtn" src="https://video.kinoafisha.info/i/player/play.png" alt="" />' + '<img data-js="pause"  class="htmlPlayer_pauseBtn" src="https://video.kinoafisha.info/i/player/pause.png" alt="" />' + '</div>' + '<div class="htmlPlayer_time">' + '<span data-js="timeCur" class="htmlPlayer_timeCur"></span>' + '<span class="htmlPlayer_timeSep">/</span>' + '<span data-js="timeDur" class="htmlPlayer_timeDur"></span>' + '</div>' + '</div>' + '<div class="htmlPlayer_controlsCell">' + '<div data-js="rewind" data-meter = \'{}\'  class="playerMeter  htmlPlayer_controlsBtn">' + '<div class="playerMeter-strip"></div>' + '<div data-js="buffered" class="playerMeter-buffered"></div>' + '<div data-js="progress" class="playerMeter-progress"></div>' + '<div data-js="slider" class="playerMeter-slider"></div>' + '</div>' + '</div>' + '<div class="htmlPlayer_controlsCell  htmlPlayer_controlsCell-shrink">' + '<span data-js="quality" class="htmlPlayer_qualityBtn htmlPlayer_controlsBtn">hq</span>' + '<div data-js="mute" class="htmlPlayer_mute htmlPlayer_controlsBtn">' + '<img  data-js="mute-on" data-js="mute-on"  class="htmlPlayer_muteOn" src="https://video.kinoafisha.info/i/player/mute-on.png" alt="" />' + '<img  data-js="mute-off" data-js="mute-off"  class="htmlPlayer_muteOff" src="https://video.kinoafisha.info/i/player/mute-off.png" alt="" />' + '</div>' + '<div data-js="volume" data-meter = \'{"value": 1}\'  class="playerMeter playerMeter_volume htmlPlayer_controlsBtn">' + '<div class="playerMeter-strip"></div>' + '<div data-js="progress" class="playerMeter-progress"></div>' + '<div data-js="slider" class="playerMeter-slider"></div>' + '</div>' + '<div data-js="fullscreen" class="htmlPlayer_fullscreen htmlPlayer_controlsBtn"> ' + '<img data-js="fullscreen-request"  class="htmlPlayer_fullscreenRequest" src="https://video.kinoafisha.info/i/player/fullscreen-request.png" alt="" />' + '<img data-js="fullscreen-exit"  class="htmlPlayer_fullscreenExit" src="https://video.kinoafisha.info/i/player/fullscreen-exit.png" alt="" />' + '</div>' + '<div data-js="share-btn" class="htmlPlayer_shareBtn htmlPlayer_controlsBtn">&lt;/&gt;</div>' + '</div>' + '</div>' + '<div data-js="share" class="htmlPlayer_share">' + '<div class="htmlPlayer_shareItem">' + '<div class="htmlPlayer_shareCell htmlPlayer_shareCell-title">' + 'Ссылка на ролик' + '</div>' + '<div class="htmlPlayer_shareCell">' + '<input readonly class="htmlPlayer_shareField htmlPlayer_shareField-insert" type="text" value="' + data.trailer_url + '" />' + '</div>' + '<div class="htmlPlayer_shareCell htmlPlayer_shareCell-shrink">' + '&nbsp;' + '</div>' + '</div>' + '<div class="htmlPlayer_shareItem">' + '<div class="htmlPlayer_shareCell htmlPlayer_shareCell-title">' + 'Код для вставки' + '</div>' + '<div class="htmlPlayer_shareCell htmlPlayer_shareCell-shrink">' + '<span class="htmlPlayer_shareNote">ширина</span>' + '<input data-js="embed-width" class="htmlPlayer_shareField htmlPlayer_shareField-size" type="text" value="640" />' + '<span class="htmlPlayer_shareNote">высота</span>' + '<input data-js="embed-height" class="htmlPlayer_shareField htmlPlayer_shareField-size" type="text" value="360" />' + '</div>' + '<div class="htmlPlayer_shareCell">' + '<input data-js="embed" readonly class="htmlPlayer_shareField htmlPlayer_shareField-insert" type="text" value=\'' + data.embed_url + '\' />' + '</div>' + '<div class="htmlPlayer_shareCell htmlPlayer_shareCell-shrink">' + '&nbsp;' + '</div>' + '</div>' + '</div>' + '</div>' + '<img  class="htmlPlayer_logo" src="https://video.kinoafisha.info/i/player/logo.png" alt="" />' + '<div data-js="poster" class="htmlPlayer_poster" style="background-image:url(' + data.poster + ')">' + '<div class="htmlPlayer_posterInfo">' + '<span class="htmlPlayer_posterCat">' + data.title + '</span>' + '<span class="htmlPlayer_posterName">' + data.movie_name + '</span>' + '</div>' + '<img  class="htmlPlayer_posterBtn" src="https://video.kinoafisha.info/i/player/play-btn.png" alt="" />' + '</div>' + '<div class="htmlPlayer_preloader"></div>' + '</div>';
	};

	_default.prototype._createElements = function _createElements(oUPlayer) {

		this.oUPlayer = oUPlayer;
		this.paramPlayer = JSON.parse(oUPlayer.wrapper.getAttribute('data-param'));
		this.parentWrapper = oUPlayer.wrapper;
		this.insert = oUPlayer.insert;
		oUPlayer.insert.innerHTML = this._getHtml(oUPlayer.HTMLDataApi);
		this.wrapper = oUPlayer.insert.firstChild;

		var self = this;

		this.poster = this.wrapper.querySelector('[data-js="poster"]');
		this.video = this.wrapper.querySelector('[data-js="video"]');
		this.footer = this.wrapper.querySelector('[data-js="footer"]');
		this.controls = this.footer.querySelector('[data-js="controls"]');
		this.clearControls; //таймаут для скрытия подвала
		this.playBtn = this.controls.querySelector('[data-js="play"]');
		this.pauseBtn = this.controls.querySelector('[data-js="pause"]');
		this.qualityBtn = this.controls.querySelector('[data-js="quality"]');
		this.timeDur = this.controls.querySelector('[data-js="timeDur"]');
		this.timeCur = this.controls.querySelector('[data-js="timeCur"]');
		this.buffered = this.controls.querySelector('[data-js="buffered"]');
		this._onBuffered = function (event) {
			try {
				var buffered = Math.floor(self.video.buffered.end(0) / self.video.duration * 100);
				self.buffered.style.width = buffered + '%';
			} catch (e) {};
		};
		this.toggle = this.wrapper.querySelector('[data-js="toggle"]');
		this.shareBtn = this.controls.querySelector('[data-js="share-btn"]'); //кнопка для показа/скрытия панели "Поделиться"
		this.share = this.footer.querySelector('[data-js="share"]'); //Панель поделиться
		this.embedField = this.share.querySelector('[data-js="embed"]');
		this.embedWidthField = this.share.querySelector('[data-js="embed-width"]');
		this.embedHeightField = this.share.querySelector('[data-js="embed-height"]');
		this.embedTemplate = this.embedField.value;
		this.embedWidth = 640; // ширина по умолчанию для кода ифрейма
		this.aspectRatio = .5625; //если не удается определить размер видео, по умолчанию используется соотношение сторон 16/9
		this.controlsDur = 3000;
		this.format;
		this.quality;
		this.dataQuality = JSON.parse(this.wrapper.getAttribute('data-quality'));
		this.isCanPlay = true; //можем проигрывать или нет. Если нет - будет грузиться флеш
		this.keyFrameAll; //массив времени в %  когда отпраляется стата - 0% 50% 90% 100%
		this.isAutoPlay = true; //теперь постер отдельно и при вызове объекта сразу начинаем проигрывание
	};

	_default.prototype._resetStat = function _resetStat() {
		this.keyFrameAll = [0, 50, 90, 100];
	};

	_default.prototype._checkStat = function _checkStat() {
		/* делаем по аналогии с флеш-плеером, где даже при перемотке статистика считается */
		if (!this.keyFrameAll.length) return false;

		var persent = Math.round(this.video.currentTime / this.video.duration * 100);
		if (this.keyFrameAll[0] === persent || this.keyFrameAll[0] < persent) {
			this._sendStat(this.keyFrameAll[0]);
			this.keyFrameAll.shift();
			this._checkStat();
		}
	};

	_default.prototype._sendStat = function _sendStat(persent) {
		var image = document.createElement('IMG'),
		    path = window.location.hostname.indexOf('kinoafishaspb.ru') === -1 ? 'kinoafisha.info' : 'kinoafishaspb.ru';
		image.src = 'https://api.' + path + '/player/stat/?trailer_id=' + this.paramPlayer.trailer_id + '&host=' + this.paramPlayer.host + '&mobile=' + uPlayer.isMobile + '&percent=' + persent;
		image.style.cssText = 'visibility:hidden;position:absolute;left:-9999px;top:-9999px;display:block;width:1px;height:1px;overflow:hidden;';
		document.body.appendChild(image);
	};

	_default.prototype._addEventsName = function _addEventsName() {
		this.eNames = {};
		if (window.navigator.pointerEnabled) this.eNames = { 'down': 'pointerdown', 'move': 'pointermove', 'enter': 'pointerenter', 'leave': 'pointerleave', 'up': 'pointerup' };else if (window.navigator.msPointerEnabled) this.eNames = { 'down': 'MSPointerDown', 'move': 'MSPointerMove', 'enter': 'MSPointerEnter', 'leave': 'MSPointerLeave', 'up': 'MSPointerUp' };else if ('ontouchstart' in document.documentElement) {
			this.eNames = { 'down': 'touchstart', 'move': 'touchmove', 'enter': 'touchstart', 'leave': 'touchend', 'up': 'touchend' };
		} else this.eNames = { 'down': 'mousedown', 'move': 'mousemove', 'enter': 'mouseenter', 'leave': 'mouseleave', 'up': 'mouseup' };
	};

	_default.prototype._defineFormat = function _defineFormat() {
		if (!this.video.canPlayType) this.format = false;else if (this.video.canPlayType('video/mp4')) this.format = 'mp4';else this.format = false;

		if (this.format) return true;else return false;
	};

	_default.prototype._defineTech = function _defineTech() {
		if (!document.addEventListener || !this._defineFormat()) return false;else return true;
	};

	_default.prototype._resetNativeVideo = function _resetNativeVideo() {
		this.video.removeAttribute('controls');
		this.video.removeAttribute('poster');
		this.video.innerHTML = '';
	};

	_default.prototype._initPoster = function _initPoster() {
		var self = this;

		this.poster.onclick = function (event) {
			self.isAutoPlay = true;
			self._ready.call(self);
		};
		this.poster.onmousemove = function (event) {
			event = event || window.event;
			event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
		};
	};

	_default.prototype._initMute = function _initMute() {
		this.mute = this.controls.querySelector('[data-js="mute"]');
		this.muteOn = this.mute.querySelector('[data-js="mute-on"]');
		this.muteOff = this.mute.querySelector('[data-js="mute-off"]');

		var self = this;
		this.muteOn.onclick = function () {
			self.video.muted = true;
			localStorage.videoMuted = 'on';
		};
		this.muteOff.onclick = function () {
			self.video.muted = false;
			localStorage.videoMuted = 'off';
		};

		this.video.onvolumechange = function () {
			self.mute.className = self.video.muted === true ? self.mute.className.replace(/\s*htmlPlayer_mute_off/, '') + ' htmlPlayer_mute_off' : self.mute.className.replace(/\s*htmlPlayer_mute_off/, '');
		};

		if (localStorage.videoMuted === 'on') self.video.muted = true;else self.video.muted = false;

		this.video.onvolumechange();
	};

	_default.prototype._initVolume = function _initVolume() {
		var el = this.controls.querySelector('[data-js="volume"]');
		var self = this;

		if (localStorage.videoVolume !== undefined) {
			el.setAttribute('data-meter', '{"value": ' + localStorage.videoVolume + '}');
			self.video.volume = localStorage.videoVolume;
		}

		var volume = new _jsMeter2['default'](el);
		volume.callback = function (status, value) {
			self.video.volume = value;
			if (status === 'up') localStorage.videoVolume = value;
		};
	};

	_default.prototype._initRewind = function _initRewind() {
		var el, self;

		el = this.controls.querySelector('[data-js="rewind"]');
		self = this;

		this.rewind = new _jsMeter2['default'](el);
		this.rewind.callback = function (status, value) {
			if (status === 'down') {
				self.isRewind = self.video.paused === true ? 'paused' : 'playing';
				self.video.pause();
				self.video.currentTime = value;
			} else if (status === 'move') {
				self.video.currentTime = value;
			} else if (status === 'up') {
				self.video.currentTime = value;
				if (self.isRewind === 'playing') {
					self.video.play();
				}
				self.isRewind = false;
			}
		};
	};

	_default.prototype._initBuffered = function _initBuffered() {
		this.video.addEventListener("progress", this._onBuffered, false);
	};

	_default.prototype._initEmbed = function _initEmbed() {
		var self = this;

		this.embedTemplate = this.embedTemplate.replace(/\|LEFT\|/g, '<').replace(/\|RIGHT\|/g, '>');

		this.embedWidthField.onkeyup = function () {
			var w = parseInt(this.value) || 0;
			self._changeEmbed.call(self, w, w * self.aspectRatio);
		};
		this.embedHeightField.onkeyup = function () {
			var h = parseInt(this.value) || 0;
			self._changeEmbed.call(self, h / self.aspectRatio, h);
		};
	};

	_default.prototype._changeEmbed = function _changeEmbed(w, h) {
		var w = parseInt(w) || '',
		    h = parseInt(h) || '';

		this.embedWidthField.value = w;
		this.embedHeightField.value = h;
		this.embedField.value = this.embedTemplate.replace(/width_height/, 'width="' + w + '" height="' + h + '"');
	};

	_default.prototype._addEvents = function _addEvents() {
		var self = this;
		this.playBtn.onclick = function () {
			self.video.play();
		};
		this.pauseBtn.onclick = function () {
			self.video.pause();
		};
		this.video.onloadedmetadata = function (event) {
			self._reloadTime.call(self);
			self._reloadRewind.call(self);
			self._reloadBuffered.call(self);
			self._reloadAspectRatio.call(self);
			self._reloadEmbed.call(self);
			self._ready.call(self);
		};
		this.video.onpause = function () {
			if (!self.isRewind) self._pauseCallback.call(self);
		};
		this.video.onplaying = function () {
			self._playingCallback.call(self);
		};
		this.video.onended = function () {
			if (!self.isRewind) {
				self._endCallback.call(self);
			}
		};
		this.video.ontimeupdate = function () {
			self._timeupdateCallback.call(self);
		};
		this.video.onwaiting = function () {
			console.log('waiting');
		};
	};

	_default.prototype._addToggle = function _addToggle() {
		var self = this;

		this.toggle['on' + this.eNames.down] = function (e) {
			self._toggle.call(self, e);
		};
	};

	_default.prototype._addFooterPanel = function _addFooterPanel() {
		var self = this;
		this.wrapper['on' + this.eNames.enter] = function () {
			self._showControlsAtTime.call(self);
		};
		this.wrapper['on' + this.eNames.leave] = function () {
			self._hideControlsAtTime.call(self);
		};
		this.wrapper['on' + this.eNames.move] = function () {
			self._showControlsAtTime.call(self);
		};
		this.footer['on' + this.eNames.enter] = function () {
			self.wrapper['on' + self.eNames.enter] = function () {};
			self.wrapper['on' + self.eNames.move] = function () {};
			self._showControls.call(self);
		};
		this.footer['on' + this.eNames.leave] = function () {
			self.wrapper['on' + self.eNames.enter] = function () {
				self._showControlsAtTime.call(self);
			};
			self.wrapper['on' + self.eNames.move] = function () {
				self._showControlsAtTime.call(self);
			};
		};
	};

	_default.prototype._toggle = function _toggle(e) {
		/* на точах не будет паузы при нажатии, потому что будет показываться навигация  */
		if (e.type === 'mousedown' || e.pointerType && e.pointerType === 'mouse') {
			this.video.paused ? this.video.play() : this.video.pause();
		}
	};

	_default.prototype._playingCallback = function _playingCallback() {
		this.wrapper.className = this.wrapper.className.replace(/\s*(htmlPlayer-pause|htmlPlayer-playing)/g, '') + ' htmlPlayer-playing';
	};

	_default.prototype._pauseCallback = function _pauseCallback() {
		this.wrapper.className = this.wrapper.className.replace(/\s*(htmlPlayer-pause|htmlPlayer-playing)/g, '') + ' htmlPlayer-pause';
	};

	_default.prototype._endCallback = function _endCallback() {
		this.wrapper.className = this.wrapper.className.replace(/\s*(htmlPlayer-pause|htmlPlayer-playing)/g, '');
		this.afterEnd(); //определяется в основном плеере
	};

	_default.prototype._timeupdateCallback = function _timeupdateCallback() {
		this._updateTimeCur(this.video.currentTime);
		if (!this.isRewind) {
			this.rewind.update({ value: this.video.currentTime, max: this.video.duration });
			this._checkStat();
		}
	};

	_default.prototype._showControls = function _showControls() {
		this._clearControlsAtTime();
		this.wrapper.className = this.wrapper.className.replace(/\s*htmlPlayer-footer/, '') + ' htmlPlayer-footer';
	};

	_default.prototype._showControlsAtTime = function _showControlsAtTime() {
		var self = this;
		this._clearControlsAtTime();
		this._showControls();
		this._hideControlsAtTime();
	};

	_default.prototype._clearControlsAtTime = function _clearControlsAtTime() {
		try {
			clearTimeout(this.clearControls);
		} catch (e) {}
	};

	_default.prototype._hideControls = function _hideControls() {
		this._clearControlsAtTime();
		this.wrapper.className = this.wrapper.className.replace(/\s*htmlPlayer-(footer|share)/g, '');
	};

	_default.prototype._hideControlsAtTime = function _hideControlsAtTime() {
		var self = this;
		this._clearControlsAtTime();
		this.clearControls = setTimeout(function () {
			self._hideControls.call(self);
		}, this.controlsDur);
	};

	_default.prototype._getQuality = function _getQuality() {
		if (Object.keys(this.dataQuality).length > 1) {
			if (localStorage.videoQuality && this.dataQuality[localStorage.videoQuality]) this.quality = localStorage.videoQuality;else if (this.dataQuality.HQ && screen.height > 1079) this.quality = 'HQ';else this.quality = 'LQ';
		} else this.quality = 'LQ';
	};

	_default.prototype._addQuality = function _addQuality() {
		if (Object.keys(this.dataQuality).length > 1) {
			var self = this;

			this.qualityBtn.className = this.qualityBtn.className + ' htmlPlayer_qualityBtn-' + this.quality;

			this.qualityBtn.onclick = function () {
				self._changeQuality.call(self);
			};
		} else this.qualityBtn.style.display = 'none';
	};

	_default.prototype._changeQuality = function _changeQuality() {
		var cls = this.qualityBtn.className.replace(' htmlPlayer_qualityBtn-' + this.quality, '');
		this.quality = this.quality === 'HQ' ? 'LQ' : 'HQ';
		localStorage.videoQuality = this.quality;
		this.qualityBtn.className = cls + ' htmlPlayer_qualityBtn-' + this.quality;
		this.isAutoPlay = true;
		this._reloadVideo();
	};

	_default.prototype._addFullscreen = function _addFullscreen() {
		this.fullscreen = this.controls.querySelector('[data-js="fullscreen"]');
		this.fullscreenRequest = this.fullscreen.querySelector('[data-js="fullscreen-request"]');
		this.fullscreenExit = this.fullscreen.querySelector('[data-js="fullscreen-exit"]');

		var enabledName = (function (doc) {
			if ('fullscreenEnabled' in doc) return 'fullscreenEnabled';
			if ('mozFullScreenEnabled' in doc) return 'mozFullScreenEnabled';
			if ('webkitFullscreenEnabled' in doc) return 'webkitFullscreenEnabled';
			if ('msFullscreenEnabled' in doc) return 'msFullscreenEnabled';
			return false;
		})(document);

		if (!enabledName) {
			this.fullscreen.style.display = 'none';
			return false;
		}

		var self = this;

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

		var request = (function (el) {
			if (el.requestFullscreen) return 'requestFullscreen';
			if (el.mozRequestFullScreen) return 'mozRequestFullScreen';
			if (el.webkitRequestFullscreen) return 'webkitRequestFullscreen';
			if (el.msRequestFullscreen) return 'msRequestFullscreen';
			return false;
		})(this.wrapper);

		var exit = (function () {
			if (document.exitFullscreen) return 'exitFullscreen';else if (document.mozCancelFullScreen) return 'mozCancelFullScreen';else if (document.webkitCancelFullScreen) return 'webkitCancelFullScreen';else if (document.msExitFullscreen) return 'msExitFullscreen';
			return false;
		})();

		document['on' + eName] = function (event) {
			event.preventDefault();
			if (document[fullscreenElement]) self._showFullscreen.call(self);else self._hideFullscreen.call(self);
		};

		this.fullscreenRequest.onclick = function () {
			if (request) {
				self.wrapper[request]();
			} else alert('К сожалению, ваш браузер не поддерживает фуллскрин');
		};

		this.fullscreenExit.onclick = function () {
			if (exit) {
				document[exit]();
			} else alert('Нажмите кнопку ESC для выхода из полноэкранного режима');
		};
	};

	_default.prototype._showFullscreen = function _showFullscreen() {
		var self = this;
		this.wrapper.className = this.wrapper.className.replace(/\s*htmlPlayer-fullscreen/, '') + ' htmlPlayer-fullscreen';
	};

	_default.prototype._hideFullscreen = function _hideFullscreen() {
		this.wrapper.className = this.wrapper.className.replace(/\s*htmlPlayer-fullscreen/, '');
	};

	_default.prototype._addSharePanel = function _addSharePanel() {
		var self = this;

		this.shareBtn.onclick = function () {
			if (self.wrapper.className.indexOf('htmlPlayer-share') !== -1) {
				self.wrapper.className = self.wrapper.className.replace(/\s*htmlPlayer-share/, '');
			} else self.wrapper.className = self.wrapper.className + ' htmlPlayer-share';
		};
	};

	_default.prototype._reloadVideo = function _reloadVideo() {
		this.wrapper.className = this.wrapper.className.replace(/\s*htmlPlayer-(ready|poster|playing|pause)/g, '');

		this.video.innerHTML = '';
		var source = document.createElement('SOURCE');
		source.setAttribute('src', this.dataQuality[this.quality] + '.' + this.format);
		source.setAttribute('type', 'video/' + this.format);
		this.video.appendChild(source);
		this.video.load();
	};

	_default.prototype._reloadTime = function _reloadTime() {
		this._updateTimeDur(this.video.duration);
		this._updateTimeCur(0);
	};

	_default.prototype._reloadRewind = function _reloadRewind() {
		this.rewind.update({ "value": 0, "max": this.video.duration });
	};

	_default.prototype._reloadBuffered = function _reloadBuffered() {
		this.buffered.style.width = '0%';
	};

	_default.prototype._reloadAspectRatio = function _reloadAspectRatio() {
		if (this.video.videoWidth) this.aspectRatio = this.video.videoHeight / this.video.videoWidth;else this.aspectRatio = .5625;
		//this.wrapper.style.paddingTop = this.aspectRatio * 100 + '%';

		if (this.onsetSize) {
			var box = this.wrapper.getBoundingClientRect();
			this.onsetSize({ width: box.right - box.left, height: box.bottom - box.top });
		}
	};

	_default.prototype._reloadEmbed = function _reloadEmbed() {
		var h = this.embedWidth * this.aspectRatio;
		this._changeEmbed(this.embedWidth, h);
	};

	_default.prototype._updateTimeCur = function _updateTimeCur(sec) {
		this.timeCur.innerHTML = this._convertTime(sec);
	};

	_default.prototype._updateTimeDur = function _updateTimeDur(sec) {
		this.timeDur.innerHTML = this._convertTime(sec);
	};

	_default.prototype._convertTime = function _convertTime(sec) {
		function num(val) {
			val = Math.floor(val);
			return val < 10 ? '0' + val : val;
		}

		var hours = num(sec / 3600 % 24),
		    minutes = num(sec / 60 % 60),
		    seconds = num(sec % 60);

		hours = hours === '00' ? '' : hours + ':';
		return hours + minutes + ':' + seconds;
	};

	_default.prototype._ready = function _ready() {
		/* нафиг теперь не нужно, нужно сразу запускать */
		var cls = this.wrapper.className.replace(/\s*htmlPlayer-(ready|poster|disabled)/g, '') + ' htmlPlayer-ready';

		if (this.isAutoPlay) {
			this.isAutoPlay = false;
			this.paramPlayer.autoplay = false;

			this._showControlsAtTime();
			this.video.play();
		}
		this.wrapper.className = cls;
	};

	_default.prototype._initialize = function _initialize() {
		this.video.innerHTML = '';
		this.video.load();
	};

	_default.prototype.abort = function abort() {
		if (this.video.paused) return;
		this.wrapper.className = this.wrapper.className.replace(/\s*(htmlPlayer-pause|htmlPlayer-playing)/g, '');
		this.video.pause();
		this.afterAbort(); //определяется в основном плеере
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

},{"../js/Meter":4}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var scriptRequest = function scriptRequest(url, onSuccess, onError) {

    if (!window.callbackAll) window.callbackAll = {};

    var scriptOk = false; // флаг, что вызов прошел успешно

    // сгенерировать имя JSONP-функции для запроса
    var callbackName = 'cb' + String(Math.random()).slice(-6);

    // укажем это имя в URL запроса
    url += ~url.indexOf('?') ? '&' : '?';
    url += 'callback=callbackAll.' + callbackName;

    // ..и создадим саму функцию в реестре
    callbackAll[callbackName] = function (data) {
        scriptOk = true; // обработчик вызвался, указать что всё ок
        delete callbackAll[callbackName]; // можно очистить реестр
        onSuccess(data); // и вызвать onSuccess
    };

    // эта функция сработает при любом результате запроса
    // важно: при успешном результате - всегда после JSONP-обработчика
    function checkCallback() {
        if (scriptOk) return; // сработал обработчик?
        delete callbackAll[callbackName];
        onError(url); // нет - вызвать onError
    }

    var script = document.createElement('script');

    // в старых IE поддерживается только событие, а не onload/onerror
    // в теории 'readyState=loaded' означает "скрипт загрузился",
    // а 'readyState=complete' -- "скрипт выполнился", но иногда
    // почему-то случается только одно из них, поэтому проверяем оба
    script.onreadystatechange = function () {
        if (this.readyState == 'complete' || this.readyState == 'loaded') {
            this.onreadystatechange = null;
            setTimeout(checkCallback, 0); // Вызвать checkCallback - после скрипта
        }
    };

    // события script.onload/onerror срабатывают всегда после выполнения скрипта
    script.onload = script.onerror = checkCallback;
    script.src = url;

    document.body.appendChild(script);
};

exports.scriptRequest = scriptRequest;

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _jsCombinedPlayer = require('../js/CombinedPlayer');

exports['default'] = (function (root, doc) {
    if (root.uPlayer) return false;

    var uPlayer = function uPlayer(wrapper) {
        var param = JSON.parse(wrapper.getAttribute('data-param'));
        if (!param.name) param.name = 'player-' + String(Math.random()).slice(-6);
        if (!uPlayer.all[param.name]) uPlayer.all[param.name] = new _jsCombinedPlayer.CombinedPlayer(wrapper, param.name);
        return uPlayer.all[param.name];
    };

    uPlayer.all = {};

    uPlayer.abortAll = function (cur) {
        for (var name in uPlayer.all) {
            var player = uPlayer.all[name];
            if (cur !== player) player.abort();
        }
    };

    uPlayer.isMobile = (function () {
        try {
            return APP.vars.isMobile;
        } catch (e) {
            return false;
        }
    })();

    uPlayer.isNeedActivation = (function () {
        var agentAll = ['ipod', 'iphone', 'ipad'],
            i = 0;

        for (i; i < agentAll.length; i++) {
            var re = new RegExp(agentAll[i], 'i');
            if (re.test(navigator.userAgent)) return agentAll[i];
        }
        return false;
    })();

    root.uPlayer = uPlayer;
})(window, document);

;
module.exports = exports['default'];

},{"../js/CombinedPlayer":2}]},{},[9]);
