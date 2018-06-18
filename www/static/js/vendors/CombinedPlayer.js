(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _default = (function () {
	function _default(oUPlayer, data) {
		_classCallCheck(this, _default);

		this._createElements(oUPlayer, data);
		this._insertVideoTag();
		this._addEventsName();
		this._addEvents();
	}

	_default.prototype._getHtml = function _getHtml() {
		return '<div data-js="adv-player" class="advPlayer">' + '<a data-js="adv-clicking-btn" class="advPlayer_link" target="_blank"></a>' + '<div class="advPlayer_controls">' + '<div class="advPlayer_controlsCell">' + '<span class="advPlayer_param">Реклама.</span> <span data-js="adv-left" class="advPlayer_param">&nbsp;</span>' + '</div>' + '<div class="advPlayer_controlsCell">' + '<a data-js="adv-skip-btn" class="advPlayer_param" href="#">&nbsp;</a>' + '</div>' + '</div>' + '<div class="advPlayer_before">' + '<div class="advPlayer_beforeContent">' + '<div class="advPlayer_beforeContentItem">Реклама</div>' + '</div>' + '</div>' + '<div class="advPlayer_preloader"></div>' + '</div>';
	};

	_default.prototype._createElements = function _createElements(oUPlayer, data) {
		this.oUPlayer = oUPlayer;
		this.data = data;
		this.insert = oUPlayer.wrapper.querySelector('[data-CombinedPlayer-insert="adv"]');
		this.insert.innerHTML = this._getHtml();
		this.wrapper = this.insert.firstChild;
		this.param = JSON.parse(oUPlayer.wrapper.getAttribute('data-param'));
		this.video = oUPlayer.initVideo;
		this.clickingBtn = this.wrapper.querySelector('[data-js="adv-clicking-btn"]');
		this.skipBtn = this.wrapper.querySelector('[data-js="adv-skip-btn"]');
		this.advLeft = this.wrapper.querySelector('[data-js="adv-left"]');
		this.format = 'mp4';
		this.userAgent = this._defineUserAgent();
		this.keyFrameAll = []; //массив времени в %  когда отпраляется стата - 0% 25% 50% 75% 100%
		this.statEventAll = {}; //все типы событий по которым отправляется стата, ключ - src
	};

	_default.prototype._insertVideoTag = function _insertVideoTag() {
		this.video.removeAttribute('style');
		this.video.className = 'advPlayer_video';
		this.wrapper.insertBefore(this.video, this.clickingBtn);
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

		this.wrapper.className = 'advPlayer advPlayer-ready advPlayer-active'; /* TODO */
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

var _jsVpaidPlayer = require('../js/VpaidPlayer');

var _jsScriptonload = require('../js/scriptonload');

var _jsVASTTag = require('../js/VASTTag');

var _jsIMA = require('../js/IMA');

var CombinedPlayer = (function () {
    function CombinedPlayer(wrapper, param) {
        _classCallCheck(this, CombinedPlayer);

        this.wrapper = wrapper;
        this.data = param; /* TODO change this.data to this.param */
        this.name = this.data.name;
        this.countPLayers = 0;
        this.isShowAdv = this.data.adv === 'hide' ? false : true;
        this._insertHTML(wrapper); /*  */
        this.btn = this.wrapper.querySelector('[data-CombinedPlayer-btn]');
        this.isMobileAgent = this._defineUserAgent();
        this.oAdvPlayer = undefined;
        this.oVpaidPlayer = undefined;
        this.oHTMLPlayer = undefined;
        this.oYoutubePlayer = undefined;
        this.HTMLDataApi; /* данные Html плеера. будем загружать только один раз и зранить здесь */
        this.initVideo; /* тег видео, который будем инициализировать при клике и вставлять в нужное место. Нужно для IOS */
        this._initPlayers();
        this._addEvents();
    }

    CombinedPlayer.prototype._initPlayers = function _initPlayers() {
        var self = this;

        if (this.data.youtube) this._getYoutubeData();else this._getHtmlData(); /* TODO теперь не нужно - данные сразу в разметку теперь вставляются */
    };

    CombinedPlayer.prototype._checkInitPlayers = function _checkInitPlayers() {
        this.countPLayers++;
        if (1 === 1) {
            /* TODO */

            // Все плееры инициализированы. Можно показывать обложку и, при необходимости, сразу запускать
            if (this.data.autoplay && !uPlayer.isNeedActivation) this._getAdvData();
            this.wrapper.className = this.wrapper.className + ' js-ready';
        }
    };

    CombinedPlayer.prototype._insertHTML = function _insertHTML() {
        var _this = this;

        var age = this.data.age ? '<svg class="combinedPlayer_header_age" role="img"><use xlink:href="/static/img/symbols/sprite.svg#age' + this.data.age + '"></use></svg>' : '';
        var allVideoLink = this.data.allVideoLink ? '<a class="combinedPlayer_header_allVideoLink" href="' + this.data.allVideoLink + '">Все видео</a>' : '';
        var category = this.data.category ? '<span class="combinedPlayer_header_category">' + this.data.category + '</span>' : '';
        var preview = (function () {
            if (_this.data.cover.indexOf('.mp4') !== -1) {
                return '<video loop muted autoplay class="combinedPlayer_preview" src="' + _this.data.cover + '"></video>';
            } else return '<div class="combinedPlayer_preview" style="background-image:url(' + _this.data.cover + ')">';
        })();
        var btns = this.data.online ? '<div class="combinedPlayer_playBtns">' + '<div class="combinedPlayer_playBtns_frame">' + '<a class="combinedPlayer_onlineBtn" href="' + this.data.online + '">' + '<svg class="combinedPlayer_onlineBtn_symbol" role="img"><use xlink:href="/static/img/symbols/sprite.svg#play"></use></svg>' + '<span class="combinedPlayer_onlineBtn_text">Смотреть online<br />бесплатно</span>' + '</a>' + '<a data-CombinedPlayer-btn class="combinedPlayer_trailerBtn" href="#">' + '<span class="combinedPlayer_trailerBtn_text">трейлер</span>' + '<svg class="combinedPlayer_trailerBtn_symbol" role="img"><use xlink:href="/static/img/symbols/sprite.svg#play"></use></svg>' + '</a>' + '</div>' + '</div>' : '<a data-CombinedPlayer-btn class="combinedPlayer_playBtn" href="#">' + '<span class="combinedPlayer_playBtn_circle">' + '<svg class="combinedPlayer_playBtn_symbol" role="img"><use xlink:href="/static/img/symbols/sprite.svg#play"></use></svg>' + '</span>' + '</a>';

        this.wrapper.innerHTML = '<div data-CombinedPlayer-insert="adv" class="combinedPlayer_insert combinedPlayer_insert-adv"></div>' + '<div data-CombinedPlayer-insert="video" class="combinedPlayer_insert combinedPlayer_insert-video"></div>' + preview + '<span class="combinedPlayer_shadow"></span>' + btns + '<div class="combinedPlayer_header">' + '<div class="combinedPlayer_header_left">' + '&nbsp;' + '</div>' + '<div class="combinedPlayer_header_right">' + category + allVideoLink + age + '</div>' + '</div>' + '</div>';
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
        var self = this,
            throttle = function throttle(type, name, obj) {
            obj = obj || window;
            var running = false;
            var func = function func() {
                if (running) {
                    return;
                }
                running = true;
                requestAnimationFrame(function () {
                    obj.dispatchEvent(new CustomEvent(name));
                    running = false;
                });
            };
            obj.addEventListener(type, func);
        };

        throttle("resize", "optimizedResize");

        // handle event
        window.addEventListener("optimizedResize", function () {
            console.log('uPlayer', 'resized');
        }, true);

        _jsEvent.event.add(this.btn, 'click', function (e) {
            e.preventDefault();

            if (self.isShowAdv) {
                self._initializeVideoTag.call(self);
                self._getAdvData.call(self);
            } else {
                self._start.call(self);
            }
        });
    };

    CombinedPlayer.prototype._initializeVideoTag = function _initializeVideoTag() {
        var initVideo = document.createElement('video');
        initVideo.style.cssText = 'visibility:hidden; position:absolute; left: -9999px; top: -9999px; width:1px; height:1px; overflow:hidden;';
        document.body.appendChild(initVideo);
        initVideo.load();
        this.initVideo = initVideo;

        /* for IOS */
        if (this.oYoutubePlayer) this.oYoutubePlayer.initialize();else this.oHTMLPlayer.initialize();
    };

    CombinedPlayer.prototype._start = function _start() {
        uPlayer.abortAll(this);

        this._sendStat('');

        if (this.oAdvPlayer && this.isShowAdv) {
            /* TODO избавиться от isShowAdv Нужно удалять oAdvPlayer */
            this.oAdvPlayer.start();

            //this.wrapper.className = this.wrapper.className + ' js-active js-active-adv';
            this.isShowAdv = false; //если один раз показали - больше в этом плеере не показываем, без разницы какая реклама
        } else if (this.oVpaidPlayer && this.isShowAdv) {
                /* TODO избавиться от isShowAdv Нужно удалять oVpaidPlayer */
                this.oVpaidPlayer.start();

                //this.wrapper.className = this.wrapper.className + ' js-active js-active-adv';
                this.isShowAdv = false; /* если один раз показали - больше в этом плеере не показываем, без разницы какая реклама */
            } else if (this.oHTMLPlayer) {
                    this.wrapper.className = this.wrapper.className.replace(' js-active js-active-adv', ''); /* TODO переделать на общий прелоадер */
                    this.oHTMLPlayer.start();
                    this.wrapper.className = this.wrapper.className + ' js-active js-active-video';
                } else {
                    this.wrapper.className = this.wrapper.className.replace(' js-active js-active-adv', ''); /* TODO переделать на общий прелоадер */
                    this.oYoutubePlayer.start();
                    this.wrapper.className = this.wrapper.className + ' js-active js-active-video';
                }

        if (this.onActive) this.onActive();
    };

    CombinedPlayer.prototype._returnOriginalView = function _returnOriginalView(name) {
        /* TODO больше не удаляем плееры */
        this.wrapper.className = this.wrapper.className.replace(/ js-active(-video|-adv)*/g, '');
        //this[name].del();
        //delete this[name];
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

    CombinedPlayer.prototype._getHtmlData = function _getHtmlData() {
        /* TODO - теперь ничего не получаем, данные в  */

        var self = this;

        self.oHTMLPlayer = new _jsHTMLPlayer2['default'](self, self.data);
        self.oHTMLPlayer.afterEnd = function () {
            self._returnOriginalView.call(self, 'oHTMLPlayer');
        };
        self._checkInitPlayers.call(self);

        /*var self = this,
            path = this.data.isDev ? 'kinoafishaspb.ru' : 'kinoafisha.info',
            _onSuccess = function(dataApi){
                self._onSuccessGetHtmlData.call(self, dataApi);
            },
            _onError = function(){};
            if(this.HTMLDataApi) _onSuccess(this.HTMLDataApi);
        else {
            scriptRequest('//api.'+ path +'/player/info/' + this.data.trailer_id + '/', function(dataApi){_onSuccess(dataApi)}, function(){_onError()});
        }*/
    };

    CombinedPlayer.prototype._getYoutubeData = function _getYoutubeData() {
        var self = this,
            checkLoading = function checkLoading() {
            if (window.isYouTubeIframeAPIReady) self._onSuccessGetYoutubeData.call(self);else {
                setTimeout(function () {
                    checkLoading();
                }, 200);
            }
        };

        //
        if (!window.onYouTubeIframeAPIReady) {
            window.onYouTubeIframeAPIReady = function () {
                window.isYouTubeIframeAPIReady = true;
            };
            _jsScriptonload.scriptonload(['https://www.youtube.com/iframe_api']);
        } else {
            console.log('uPlayer: onYouTubeIframeAPIReady is already exists');
        } /* TODO */

        checkLoading();
    };

    CombinedPlayer.prototype._getAdvData = function _getAdvData() {
        var _this2 = this;

        if (!this.isShowAdv) {
            this._start();
            return;
        }

        this.wrapper.className = this.wrapper.className + ' js-active js-active-adv'; /* TODO переделать на общий прелоадер */

        var self = this,
            data = {},
            /* урл, ссылка, статистика итд */
        curTime = new Date().getTime(),
            advInterval = 24,
            url = encodeURIComponent(location.protocol + '//' + location.hostname + location.pathname),
            pathYandexTest = 'https://an.yandex.ru/meta/168554?imp-id=2&charset=UTF-8&target-ref=https://kinoafisha.info&page-ref=https://kinoafisha.info',
            pathYandex = 'https://an.yandex.ru/meta/168554?imp-id=2&charset=UTF-8&target-ref=' + url + '&page-ref=' + url,
            pathVastGoogleTest = 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=xml_vast2&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=',

        //Можно использовать даже боевой тег, добавив в него параметры- вот так http://data.videonow.ru/?profile_id=695851&format=vast&vpaid=1&flash=0 - отдается наш JS-VPID
        pathVideonowTest = 'https://data.videonow.ru/?profile_id=695851&format=vast&container=preroll&vpaid=1&flash=0',
            pathVpaidJsTest = 'http://rtr.innovid.com/r1.5554946ab01d97.36996823;cb=%25%CACHEBUSTER%25%25?1=1',
            pathGoogle = 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinearvpaid2js&correlator=' + curTime,
            pathGoogleTest = '//ima3vpaid.appspot.com/?adTagUrl=http%3A%2F%2Fgoogleads.g.doubleclick.net%2Fpagead%2Fads%3Fad_type%3Dvideo%26client%3Dca-video-pub-4968145218643279%26videoad_start_delay%3D0%26description_url%3Dhttp%253A%252F%252Fwww.google.com%26hl%3Den%26max_ad_duration%3D30000%26adtest%3Don&type=js',
            pathBoosterTest = '//boostervideo.ru/vast_vpaid/vast?hash=MzI3b1RNQ2F2dlVVT3RweFZydHZsWGhoaXRtQ1JFR0puUmxhbTZxaVUvZTlPNm9sM2s4UkJkdC9TWk4rNGVWaWpZNmdpdzUxa3Bhc09BQWhRdXpJa3c9PQ==&autoplay=1&url=' + url,
            pathBoosterTestPopcorn = '//boostervideo.ru/vast_vpaid/vast?hash=MzI3b1RNQ2F2dlVVT3RweFZydHZsWGhoaXRtQ1JFR0puUmxhbTZxaVUvZTlPNm9sM2s4UkJkdC9TWk4rNGVWaWpZNmdpdzUxa3Bhc09BQWhRdXpJa3c9PQ==&autoplay=1&url=' + url,
            pathBooster = '//boostervideo.ru/vast_vpaid/vast?hash=MzI3b1RNQ2F2dlVVT3RweFZydHZsWGhoaXRtQ1JFR0puUmxhbTZxaVUvZTlPNm9sM2s4UkJkdC9TWk4rNGVWaUZ6TXNZWUpEQ283UWFTZXpXRG5LU2c9PQ==&autoplay=1&url=' + url,
            pathMoevideo = '//moevideo.biz/vast?ref=kinoafisha.info&impressionAfterPaid=1&es=1',
            pathVideonow = '//data.videonow.ru/?profile_id=695851&format=vast&container=preroll&vpaid=1&flash=0',
            pathWmg = '//an.facebook.com/v1/instream/vast.xml?placementid=TEST_PLACEMENT_ID&pageurl=http://www.google.com&maxaddurationms=30000',
            pathOptAd360 = '//ima3vpaid.appspot.com/?adTagUrl=https%3A%2F%2Fgoogleads.g.doubleclick.net%2Fpagead%2Fads%3Fclient%3Dca-video-pub-5512390705137507%26slotname%3D9018911080%2F5952557309%26ad_type%3Dvideo%26description_url%3Dhttp%253A%252F%252Fkinoafisha.info%26max_ad_duration%3D60000%26videoad_start_delay%3D0&type=js',
            pathOptAd3602 = '//googleads.g.doubleclick.net/pagead/ads?client=ca-video-pub-5512390705137507&slotname=9018911080/5952557309&ad_type=video&description_url=http%3A%2F%2Fkinoafisha.info&max_ad_duration=60000&videoad_start_delay=0',
            pathMediawayss = '//ad.mediawayss.com/delivery/impress?video=vast&pzoneid=823&ch=DOMAIN_HERE',
            pathUnion = '//s3.utraff.com/index.php?r=vmap/vast&host_id=1945&rand=' + curTime,
            pathPladform = '//out.pladform.ru/getVast?pl=110461&type=preroll&license=1&thematic=420&age=5&duration=180&dl=' + url + '&target=web-html5&adformat=1',
            pathAdRiver = '//ad.adriver.ru/cgi-bin/rle.cgi?sid=1&bt=61&ad=657980&pid=2752474&bn=2752474&rnd=' + curTime + '&tuid=1',
            pathAdRiverWrapper = '//api.kinoafisha.info/ad/vast/?bid=20180604_homecredit',
            pathInVideo = (function () {
            var pidDesktop = 349,
                pidIOS = 350,
                pidAndroid = 351,
                pid = (function () {
                if (!uPlayer.mobileAgent) return pidDesktop;else if (uPlayer.mobileAgent.system == 'IOS') return pidIOS;else return pidAndroid;
            })(),
                puid5 = (function () {
                try {
                    return '&puid5=' + self.data.inVideo.puid5;
                } catch (e) {
                    return '';
                }
            })(),
                puid6 = (function () {
                try {
                    return '&puid6=' + self.data.inVideo.puid6;
                } catch (e) {
                    return '';
                }
            })();

            //
            return '//instreamvideo.ru/core/vpaid/linear?pid=' + pid + '&vr=1&rid=' + curTime + puid5 + puid6 + '&puid7=1&puid8=15&puid10=4&puid11=1&puid12=16&dl=' + url + '&duration=&vn=' + url;
        })(),
            pathes = {
            'RCA': pathYandex,
            'Videonow': pathVideonow,
            'Mediawayss': pathMediawayss,
            'InVideo': pathInVideo,
            'UnionTraff': pathUnion,
            'Moevideo': pathMoevideo,
            'Pladform': pathPladform
        },
            priorities = {
            'RCA': 44,
            'Videonow': 13,
            'InVideo': 13,
            'UnionTraff': 10,
            'Moevideo': 10,
            'Pladform': 10
        },
            randomKey = function randomKey(data) {
            var randomArr = [];

            for (var key in data) {
                var arr = [],
                    i = 0,
                    j = data[key];

                for (i, j; i < j; i++) {
                    arr.push(key);
                }
                randomArr = randomArr.concat(arr);
            }

            if (randomArr.length != 100) {
                throw new Error('Общее значение должно быть равно 100');
            }

            return randomArr[randomInteger(0, 99)];
        },
            randomInteger = function randomInteger(min, max) {
            var rand = min - 0.5 + Math.random() * (max - min + 1);
            rand = Math.round(rand);
            return rand;
        },
            path = (function () {
            var url = new URL(window.location.href),
                ads = url.searchParams.get('uPLayerAds');

            if (pathes[ads]) return pathes[ads];

            //return '//pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=' + curTime;
            if (_this2.data.dev === 'vpaidJsTest') return pathVpaidJsTest;
            if (_this2.data.dev === 'vastGoogleTest') return pathVastGoogleTest;
            if (_this2.data.dev === 'vpaidVideonowTest') return pathVideonowTest;
            if (_this2.data.dev === 'yandex') return pathYandex;
            if (_this2.data.dev === 'google-test') return pathGoogleTest;
            if (_this2.data.dev === 'booster') return pathBooster;
            if (_this2.data.dev === 'booster? -popcorn') return pathBoosterTestPopcorn;
            if (_this2.data.dev === 'moevideo') return pathMoevideo;
            if (_this2.data.dev === 'videonow') return pathVideonow;
            if (_this2.data.dev === 'wmg') return pathWmg;
            if (_this2.data.dev === 'optAd360') return pathOptAd360;
            if (_this2.data.dev === 'optAd3602') return pathOptAd3602;
            if (_this2.data.dev === 'mediawayss') return pathMediawayss;
            if (_this2.data.dev === 'inVideo') return pathInVideo;
            if (_this2.data.dev === 'union') return pathUnion;
            if (_this2.data.dev === 'pladform') return pathPladform;
            if (_this2.data.dev === 'adRiver') return pathAdRiver;
            if (_this2.data.dev === 'adRiverWrapper') return pathAdRiverWrapper;

            //
            //return pathes[Math.floor(Math.random() * (pathes.length))];

            try {
                if (APP.vars.locationCityMain === 'nsk' || APP.vars.locationCityMain === 'nn' || APP.vars.locationCityMain === 'chel' || APP.vars.locationCityMain === 'omsk' || APP.vars.locationCityMain === 'ufa' || APP.vars.locationCityMain === 'perm' || APP.vars.locationCityMain === 'voronezh') {
                    return pathAdRiverWrapper;
                }
            } catch (e) {};

            return pathes[randomKey(priorities)];
        })(),
            _getOur = function _getOur() {
            /* TODO пока отключил, чет не работает */
            self._start.call(self);
            /*if((localStorage && !localStorage.isKinoafishaVideoAdv) || ((curTime - parseFloat(localStorage.isKinoafishaVideoAdv))/1000/60/60 > advInterval)){
                try {
                    localStorage.isKinoafishaVideoAdv = curTime;
                    data.mediaFile = 'https://video.kinoafisha.info/branding/kinoafisha/kinoafisha-youtube3.mp4';
                    data.clickThrough = 'https://www.youtube.com/channel/UCNuQyDGBj28VwMRhCy_hTOw';
                    data.impressionAll = [];
                    data.statEventAll = {};
                    data.keyFrameAll = [];
                    self._onSuccessGetAdvData.call(self, data);
                } catch(e){
                    self._start.call(self);
                }
            }
            else self._start.call(self);*/
        };

        if (1 == 2) {

            new _jsIMA.IMA({
                oUPlayer: this,
                path: path,
                onError: function onError() {
                    /* например, блокировщик рекламы */
                    _getOur();
                }
            });
        } else {
            new _jsVASTTag.VASTTag({
                path: path,
                onVast: function onVast(data) {
                    console.log('uPlayer', 'Рекламные данные успешно  получены. Создаем mp4 плеер');
                    self._onSuccessGetAdvData.call(self, data);
                },
                onVpaid: function onVpaid(data) {
                    console.log('uPlayer', 'Рекламные данные успешно  получены. Создаем vpaid плеер');
                    self._onSuccessGetVpaidData.call(self, data);
                },
                onError: function onError() {
                    /* например, блокировщик рекламы */
                    _getOur();
                }
            });
        }
    };

    /* больше не запрашиваем данные */
    /*_onSuccessGetHtmlData(data){
        var self = this;
          self.oHTMLPlayer = new HTMLPlayer(self, data);
        self.oHTMLPlayer.afterEnd = function(){
            self._returnOriginalView.call(self, 'oHTMLPlayer');
        }
        self._checkInitPlayers.call(self);
    }*/

    CombinedPlayer.prototype._onSuccessGetVpaidData = function _onSuccessGetVpaidData(data) {
        var self = this;
        this.oVpaidPlayer = new _jsVpaidPlayer.VpaidPlayer(self, data);
    };

    CombinedPlayer.prototype._onSuccessGetAdvData = function _onSuccessGetAdvData(data) {
        var self = this;
        self.oAdvPlayer = new _jsAdvPlayer2['default'](self, data); /* при создании объекта проиходит вставка нужной разметки и инициализация плеера.(IOS) Сами Данные не вставляются */
        self.oAdvPlayer.afterEnd = function () {
            if (self.oYoutubePlayer) self.oYoutubePlayer.start();else self.oHTMLPlayer.start();

            self.wrapper.className = self.wrapper.className.replace(' js-active-adv', ' js-active-video');
        };
        self.oAdvPlayer.afterSkip = function () {
            if (self.oYoutubePlayer) self.oYoutubePlayer.start();else self.oHTMLPlayer.start();

            self.wrapper.className = self.wrapper.className.replace(' js-active-adv', ' js-active-video');
        };
        self.oAdvPlayer.afterClicking = function () {
            self.oAdvPlayer.abort();
            self._returnOriginalView.call(self, 'oAdvPlayer');
        };
        self._start.call(self);
    };

    CombinedPlayer.prototype._onSuccessGetYoutubeData = function _onSuccessGetYoutubeData() {
        var self = this;
        var onReady = function onReady(event) {
            self._checkInitPlayers.call(self);
        };

        self.oYoutubePlayer = new _jsYoutubePlayer.YoutubePlayer(self, onReady);
        self.oYoutubePlayer.afterEnd = function () {
            self._returnOriginalView.call(self, 'oYoutubePlayer');
        };
    };

    CombinedPlayer.prototype.onAdsCompleted = function onAdsCompleted() {
        /* TODO - сделать всю рекламу так */
        if (this.oYoutubePlayer) this.oYoutubePlayer.start();else this.oHTMLPlayer.start();

        this.isShowAdv = false; /* TODO ??  */
        this.wrapper.className = this.wrapper.className.replace(' js-active-adv', ' js-active-video');
    };

    CombinedPlayer.prototype.abort = function abort() {
        if (this.oAdvPlayer) this.oAdvPlayer.abort();
        if (this.oVpaidPlayer) this.oVpaidPlayer.abort();
        if (this.oHTMLPlayer) this.oHTMLPlayer.abort();else if (this.oYoutubePlayer) this.oYoutubePlayer.abort(); /* TODO в трейлерах может не быть ни того нитого - в теории такого не должно быть, разобраться */

        this._returnOriginalView();
    };

    CombinedPlayer.prototype.del = function del() {
        if (this.oAdvPlayer) this.oAdvPlayer.del();
        if (this.oVpaidPlayer) this.oVpaidPlayer.del();

        if (this.oHTMLPlayer) this.oHTMLPlayer.del();else this.oYoutubePlayer.del();

        this.wrapper.className = this.wrapper.className.replace(/ js-active(-video|-adv)*/g, '');
        this.wrapper.innerHTML = '';

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

},{"../js/AdvPlayer":1,"../js/HTMLPlayer":3,"../js/IMA":4,"../js/VASTTag":6,"../js/VpaidPlayer":7,"../js/YoutubePlayer":8,"../js/event":9,"../js/scriptRequest":10,"../js/scriptonload":11}],3:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _jsMeter = require('../js/Meter');

var _jsMeter2 = _interopRequireDefault(_jsMeter);

var _default = (function () {
	function _default(oUPlayer, HTMLDataApi) {
		_classCallCheck(this, _default);

		this._createElements(oUPlayer, HTMLDataApi);
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
	}

	_default.prototype._getHtml = function _getHtml(data) {

		var LQ = data.files.low ? data.files.low.path.replace(/\.mp4$/, '') : false;
		var HQ = data.files.high ? data.files.high.path.replace(/\.mp4$/, '') : false;
		var quality = '"LQ": "' + LQ + '"' + (HQ ? ', "HQ": "' + HQ + '"' : '');

		return '<div data-js="html-player" data-quality=\'{' + quality + '}\' class="htmlPlayer">' + '<video data-js="video" preload="metadata" class="htmlPlayer_video" controls="controls" poster="' + data.poster + '" webkit-playsinline>' + '<source src="' + data.files.low.path + '" type="video/mp4" />' + '<a class="htmlPlayer_altVideo" href="' + data.files.low.path + '"  style="background-image:url(' + data.poster + ')">' + '<img class="htmlPlayer_altVideoPoster" src="' + data.poster + '" alt="" />' + '<img class="htmlPlayer_altVideoBtn" src="https://video.kinoafisha.info/i/player/play-btn.png" alt="" />' + '</a>' + '</video>' + '<div data-js="toggle" class="htmlPlayer_toggle">' + '<img class="htmlPlayer_bigPauseBtn" src="https://video.kinoafisha.info/i/player/pause-btn.png" alt="" />' + '</div>' + '<div data-js="footer" class="htmlPlayer_footer">' + '<div data-js="controls" class="htmlPlayer_controls">' + '<div class="htmlPlayer_controlsCell htmlPlayer_controlsCell-shrink">' + '<div class="htmlPlayer_playback htmlPlayer_controlsBtn">' + '<img data-js="play"  class="htmlPlayer_playBtn" src="https://video.kinoafisha.info/i/player/play.png" alt="" />' + '<img data-js="pause"  class="htmlPlayer_pauseBtn" src="https://video.kinoafisha.info/i/player/pause.png" alt="" />' + '</div>' + '<div class="htmlPlayer_time">' + '<span data-js="timeCur" class="htmlPlayer_timeCur"></span>' + '<span class="htmlPlayer_timeSep">/</span>' + '<span data-js="timeDur" class="htmlPlayer_timeDur"></span>' + '</div>' + '</div>' + '<div class="htmlPlayer_controlsCell">' + '<div data-js="rewind" data-meter = \'{}\'  class="playerMeter  htmlPlayer_controlsBtn">' + '<div class="playerMeter-strip"></div>' + '<div data-js="buffered" class="playerMeter-buffered"></div>' + '<div data-js="progress" class="playerMeter-progress"></div>' + '<div data-js="slider" class="playerMeter-slider"></div>' + '</div>' + '</div>' + '<div class="htmlPlayer_controlsCell  htmlPlayer_controlsCell-shrink">' + '<span data-js="quality" class="htmlPlayer_qualityBtn htmlPlayer_controlsBtn">hq</span>' + '<div data-js="mute" class="htmlPlayer_mute htmlPlayer_controlsBtn">' + '<img  data-js="mute-on" data-js="mute-on"  class="htmlPlayer_muteOn" src="https://video.kinoafisha.info/i/player/mute-on.png" alt="" />' + '<img  data-js="mute-off" data-js="mute-off"  class="htmlPlayer_muteOff" src="https://video.kinoafisha.info/i/player/mute-off.png" alt="" />' + '</div>' + '<div data-js="volume" data-meter = \'{"value": 1}\'  class="playerMeter playerMeter_volume htmlPlayer_controlsBtn">' + '<div class="playerMeter-strip"></div>' + '<div data-js="progress" class="playerMeter-progress"></div>' + '<div data-js="slider" class="playerMeter-slider"></div>' + '</div>' + '<div data-js="fullscreen" class="htmlPlayer_fullscreen htmlPlayer_controlsBtn"> ' + '<img data-js="fullscreen-request"  class="htmlPlayer_fullscreenRequest" src="https://video.kinoafisha.info/i/player/fullscreen-request.png" alt="" />' + '<img data-js="fullscreen-exit"  class="htmlPlayer_fullscreenExit" src="https://video.kinoafisha.info/i/player/fullscreen-exit.png" alt="" />' + '</div>' + '<div data-js="share-btn" class="htmlPlayer_shareBtn htmlPlayer_controlsBtn">&lt;/&gt;</div>' + '</div>' + '</div>' + '<div data-js="share" class="htmlPlayer_share">' + '<div class="htmlPlayer_shareItem">' + '<div class="htmlPlayer_shareCell htmlPlayer_shareCell-title">' + 'Ссылка на ролик' + '</div>' + '<div class="htmlPlayer_shareCell">' + '<input readonly class="htmlPlayer_shareField htmlPlayer_shareField-insert" type="text" value="' + data.trailer_url + '" />' + '</div>' + '<div class="htmlPlayer_shareCell htmlPlayer_shareCell-shrink">' + '&nbsp;' + '</div>' + '</div>' + '<div class="htmlPlayer_shareItem">' + '<div class="htmlPlayer_shareCell htmlPlayer_shareCell-title">' + 'Код для вставки' + '</div>' + '<div class="htmlPlayer_shareCell htmlPlayer_shareCell-shrink">' + '<span class="htmlPlayer_shareNote">ширина</span>' + '<input data-js="embed-width" class="htmlPlayer_shareField htmlPlayer_shareField-size" type="text" value="640" />' + '<span class="htmlPlayer_shareNote">высота</span>' + '<input data-js="embed-height" class="htmlPlayer_shareField htmlPlayer_shareField-size" type="text" value="360" />' + '</div>' + '<div class="htmlPlayer_shareCell">' + '<input data-js="embed" readonly class="htmlPlayer_shareField htmlPlayer_shareField-insert" type="text" value=\'' + data.embed_url + '\' />' + '</div>' + '<div class="htmlPlayer_shareCell htmlPlayer_shareCell-shrink">' + '&nbsp;' + '</div>' + '</div>' + '</div>' + '</div>' + '<img  class="htmlPlayer_logo" src="https://video.kinoafisha.info/i/player/logo.png" alt="" />' + '<div data-js="poster" class="htmlPlayer_poster" style="background-image:url(' + data.poster + ')">' + '<div class="htmlPlayer_posterInfo">' + '<span class="htmlPlayer_posterCat">' + data.title + '</span>' + '<span class="htmlPlayer_posterName">' + data.movie_name + '</span>' + '</div>' + '<img  class="htmlPlayer_posterBtn" src="https://video.kinoafisha.info/i/player/play-btn.png" alt="" />' + '</div>' + '<div class="htmlPlayer_preloader"></div>' + '</div>';
	};

	_default.prototype._createElements = function _createElements(oUPlayer, HTMLDataApi) {
		this.HTMLDataApi = HTMLDataApi;
		this.oUPlayer = oUPlayer;
		this.paramPlayer = JSON.parse(oUPlayer.wrapper.getAttribute('data-param'));
		this.parentWrapper = oUPlayer.wrapper;
		this.insert = oUPlayer.wrapper.querySelector('[data-CombinedPlayer-insert="video"]');
		this.insert.innerHTML = this._getHtml(HTMLDataApi);
		this.wrapper = this.insert.firstChild;

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
			try {
				localStorage.videoMuted = 'on';
			} catch (e) {
				//например IOS частный доступ;
			}
		};
		this.muteOff.onclick = function () {
			self.video.muted = false;
			try {
				localStorage.videoMuted = 'off';
			} catch (e) {
				//например IOS частный доступ;
			}
		};

		this.video.onvolumechange = function () {
			self.mute.className = self.video.muted === true ? self.mute.className.replace(/\s*htmlPlayer_mute_off/, '') + ' htmlPlayer_mute_off' : self.mute.className.replace(/\s*htmlPlayer_mute_off/, '');
		};

		try {
			if (localStorage.videoMuted === 'on') self.video.muted = true;else self.video.muted = false;
		} catch (e) {
			self.video.muted = true;
		}
		this.video.onvolumechange();
	};

	_default.prototype._initVolume = function _initVolume() {
		var el = this.controls.querySelector('[data-js="volume"]');
		var self = this;

		try {
			if (localStorage.videoVolume !== undefined) {
				el.setAttribute('data-meter', '{"value": ' + localStorage.videoVolume + '}');
				self.video.volume = localStorage.videoVolume;
			}
		} catch (e) {
			//например IOS частный доступ;
		}

		var volume = new _jsMeter2['default'](el);
		volume.callback = function (status, value) {
			self.video.volume = value;
			if (status === 'up') {
				try {
					localStorage.videoVolume = value;
				} catch (e) {
					//например IOS частный доступ;
				}
			}
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
		var _this = this;

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
			if (!_this.isRewind) {
				_this._endCallback();

				// exit fullscreen
				_this.fullscreenExit.onclick();
			}
		};
		this.video.ontimeupdate = function () {
			self._timeupdateCallback.call(self);
		};
		this.video.onwaiting = function () {
			console.log('uPlayer', 'waiting');
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
			try {
				if (localStorage.videoQuality && this.dataQuality[localStorage.videoQuality]) this.quality = localStorage.videoQuality;else if (this.dataQuality.HQ && screen.height > 1079) this.quality = 'HQ';else this.quality = 'LQ';
			} catch (e) {
				this.quality = 'LQ';
			}
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
		try {
			localStorage.videoQuality = this.quality;
		} catch (e) {};
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

		/* TODO убрать */
		/*if(this.isAutoPlay){
  	this.isAutoPlay = false;
  	this.paramPlayer.autoplay = false;
  			this._showControlsAtTime();
  	this.video.play();
  }*/
		this._showControlsAtTime();
		this.video.play();
		this.wrapper.className = cls;
	};

	_default.prototype.initialize = function initialize() {
		this.video.innerHTML = '';
		this.video.load();
	};

	_default.prototype.start = function start() {
		this._reloadVideo();
	};

	_default.prototype.abort = function abort() {
		if (this.video.paused) return;
		this.wrapper.className = this.wrapper.className.replace(/\s*(htmlPlayer-pause|htmlPlayer-playing)/g, '');
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

},{"../js/Meter":5}],4:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _jsScriptonload = require('../js/scriptonload');

var IMA = (function () {
	function IMA(param) {
		_classCallCheck(this, IMA);

		this._declare(param);
		this._insertVideoTag();
		this._run();

		/*scriptonload(['//imasdk.googleapis.com/js/sdkloader/ima3.js'], () => {
  		});*/
	}

	IMA.prototype._getHtml = function _getHtml() {
		return '<div data-js="adv-player" class="advPlayer">' + '<div data-js="vpaid-slot" style="position:absolute;left:0;top:0;display:block;width:100%;height:100%;"></div>' + '</div>';
	};

	IMA.prototype._declare = function _declare(param) {
		this.param = param;
		this.oUPlayer = this.param.oUPlayer;
		this.path = this.param.path;
		this.insert = this.oUPlayer.wrapper.querySelector('[data-CombinedPlayer-insert="adv"]');
		this.insert.innerHTML = this._getHtml();
		this.wrapper = this.insert.firstChild;
		this.video = this.oUPlayer.initVideo;
		this.slot = this.wrapper.querySelector('[data-js="vpaid-slot"]');
	};

	IMA.prototype._insertVideoTag = function _insertVideoTag() {
		this.video.removeAttribute('style');
		this.video.className = 'advPlayer_video';
		this.wrapper.insertBefore(this.video, this.slot);
	};

	IMA.prototype._run = function _run() {
		/*
  	google
   https://developers.google.com/interactive-media-ads/docs/sdks/html5/
   */

		/* for code */
		var adContainer = this.slot;
		var videoContent = this.video;
		var adsManager;
		var self = this;

		var adDisplayContainer = new google.ima.AdDisplayContainer(adContainer, videoContent);

		// Must be done as the result of a user action on mobile
		adDisplayContainer.initialize();

		// Re-use this AdsLoader instance for the entire lifecycle of your page.
		var adsLoader = new google.ima.AdsLoader(adDisplayContainer);

		// Add event listeners
		adsLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, onAdsManagerLoaded, false);
		adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError, false);

		function onAdError(adErrorEvent) {
			// Handle the error logging and destroy the AdsManager
			console.log('Uplayer', 'IMA error - ' + adErrorEvent.getError());
			try {
				adsManager.destroy();
			} catch (e) {};
			self.param.onError();
		}

		// An event listener to tell the SDK that our content video
		// is completed so the SDK can play any post-roll ads.
		var contentEndedListener = function contentEndedListener() {
			adsLoader.contentComplete();
		};
		videoContent.onended = contentEndedListener;

		// Request video ads.
		var adsRequest = new google.ima.AdsRequest();
		adsRequest.adTagUrl = '//googleads.g.doubleclick.net/pagead/ads?ad_type=video&client=ca-video-pub-4968145218643279&videoad_start_delay=0&description_url=http%3A%2F%2Fwww.google.com&max_ad_duration=40000&adtest=on';
		adsRequest.adTagUrl = 'https://googleads.g.doubleclick.net/pagead/ads?ad_type=skippablevideo&client=ca-video-pub-3605597367359598&description_url=http%3A%2F%2Fkinoafisha.info&videoad_start_delay=0&hl=ru';
		//adsRequest.adTagUrl = '//pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinearvpaid2js&correlator=';

		// Specify the linear and nonlinear slot sizes. This helps the SDK to
		// select the correct creative if multiple are returned.
		adsRequest.linearAdSlotWidth = 1200;
		adsRequest.linearAdSlotHeight = 600;

		//var playButton = document.getElementById('playButton');
		//playButton.addEventListener('click', requestAds);
		this.wrapper.className = 'advPlayer advPlayer-ready advPlayer-active'; /* TODO */
		requestAds();

		function requestAds() {
			adsLoader.requestAds(adsRequest);
		}

		function onAdsManagerLoaded(adsManagerLoadedEvent) {
			// Get the ads manager.
			adsManager = adsManagerLoadedEvent.getAdsManager(videoContent); // See API reference for contentPlayback

			// Add listeners to the required events.
			adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);
			adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, onContentPauseRequested);
			adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, onContentResumeRequested);
			adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, function () {
				self.oUPlayer.onAdsCompleted.call(self.oUPlayer);
			});

			try {
				// Initialize the ads manager. Ad rules playlist will start at this time.
				adsManager.init(640, 360, google.ima.ViewMode.NORMAL);
				// Call start to show ads. Single video and overlay ads will
				// start at this time; this call will be ignored for ad rules, as ad rules
				// ads start when the adsManager is initialized.
				adsManager.start();
			} catch (adError) {
				// An error may be thrown if there was a problem with the VAST response.
				this.param.onError();
			}
		}

		function onContentPauseRequested() {
			// This function is where you should setup UI for showing ads (e.g.
			// display ad timer countdown, disable seeking, etc.)
			videoContent.removeEventListener('ended', contentEndedListener);
			videoContent.pause();
		}

		function onContentResumeRequested() {
			// This function is where you should ensure that your UI is ready
			// to play content.
			videoContent.addEventListener('ended', contentEndedListener);
			videoContent.play();
		}
	};

	return IMA;
})();

exports.IMA = IMA;

},{"../js/scriptonload":11}],5:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _default = (function () {
	function _default(wrapper) {
		_classCallCheck(this, _default);

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

},{}],6:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

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
						console.error('uPlayer', 'Не найдено нужного формата -  mp4 или VPAID');
						_this.param.onError();
					} else {
						_this.data.mediaFile = advFile.file;
						if (advFile.type == 'mp4') {
							_this.data.clickThrough = videoClicksTag.querySelector('ClickThrough').childNodes[0].wholeText.replace(/^\s+/, '').replace(/\s+$/, '');
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
		path = path + '&rnd=' + new Date().getTime();
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

	return VASTTag;
})();

exports.VASTTag = VASTTag;

},{}],7:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var VpaidPlayer = (function () {
	function VpaidPlayer(oUPlayer, vast) {
		_classCallCheck(this, VpaidPlayer);

		this._createElements(oUPlayer, vast);
		this._insertVideoTag();
		this._load();
	}

	VpaidPlayer.prototype._getHtml = function _getHtml() {
		return '<div data-js="adv-player" class="advPlayer">' + '<div data-js="vpaid-slot" style="position:absolute;left:0;top:0;display:block;width:100%;height:100%;"></div>' + '</div>';
	};

	VpaidPlayer.prototype._createElements = function _createElements(oUPlayer, vast) {
		this.oUPlayer = oUPlayer;
		this.vast = vast;
		this.insert = oUPlayer.wrapper.querySelector('[data-CombinedPlayer-insert="adv"]');
		this.insert.innerHTML = this._getHtml();
		this.wrapper = this.insert.firstChild;
		this.video = oUPlayer.initVideo;
		this.slot = this.wrapper.querySelector('[data-js="vpaid-slot"]');
		this.vpaid = false;
		this.isFinish = false;
		this.isAdLoaded = false; /* AdError может сработать до AdLoaded TODO (может, сделать как то поинтереснее)  */
		this.isAdClickThru = false; /* кликнул или нет пользователь по рекламе. Если кликнул - видео не производим */
	};

	VpaidPlayer.prototype._insertVideoTag = function _insertVideoTag() {
		this.video.removeAttribute('style');
		this.video.className = 'advPlayer_video';
		this.wrapper.insertBefore(this.video, this.slot);
	};

	VpaidPlayer.prototype._load = function _load() {
		var _this = this;

		this.loadScriptInIFrame(this.vast.mediaFile, function (iframe) {
			var rect = _this.insert.getBoundingClientRect();

			if (!iframe.contentWindow.getVPAIDAd) {
				/* связано с загрузкой ифрейм и переменной inDapIF */
				console.error('iframe.contentWindow.getVPAIDAd отсутствует');
				_this.del();
				_this.oUPlayer._start();
				return;
			}

			_this.vpaid = iframe.contentWindow.getVPAIDAd();

			_this.vpaid.subscribe(function () {
				console.log("uPlayer: VPAID событие AdLoaded (реклама загружена)");
				_this.isAdLoaded = true;
				_this.oUPlayer._start();
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
		this.wrapper.className = 'advPlayer advPlayer-ready advPlayer-active'; /* TODO */
		this.vpaid.startAd();
	};

	VpaidPlayer.prototype._finish = function _finish() {
		/* если пользователь щелкнул на рекламу - все останавливаем и дальше не продолжаем*/
		//может срабатывать несколько раз, при AdStopped, AdError; TODO - мож покороче как нить..
		if (this.isFinish) return;
		this.isFinish = true;

		this.oUPlayer.isShowAdv = false; /* TODO ??  */

		if (!this.isAdLoaded) {
			this.oUPlayer._start();
			this.del();
		} else {
			var oUPlayer = this.oUPlayer;

			if (this.isAdClickThru) {
				/* был клик по рекламе, видео не запускаем, потому что в этот момент пользователь может смотреть рекламу */
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
			//TODO wmg
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

},{}],8:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var YoutubePlayer = (function () {
    function YoutubePlayer(oUPlayer, _onReady) {
        _classCallCheck(this, YoutubePlayer);

        this.insert = oUPlayer.wrapper.querySelector('[data-CombinedPlayer-insert="video"]');
        this.insert.innerHTML = '<iframe class="combinedPlayer_youtube" src="' + oUPlayer.data.youtube + '?enablejsapi=1" allowfullscreen="" frameborder="0"></iframe>';
        this.youtubeIframe = this.insert.firstChild;
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
    }

    YoutubePlayer.prototype._onPlayerStateChange = function _onPlayerStateChange(event) {
        if (event.data === 0) {
            //конец проигрывания
            var exit = (function () {
                if (document.exitFullscreen) return 'exitFullscreen';else if (document.mozCancelFullScreen) return 'mozCancelFullScreen';else if (document.webkitCancelFullScreen) return 'webkitCancelFullScreen';else if (document.msExitFullscreen) return 'msExitFullscreen';
                return false;
            })();
            //выходим из фуллскрина
            try {
                document[exit]();
            } catch (e) {};
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

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{}]},{},[2]);
