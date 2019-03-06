import {scriptRequest} from '../js/scriptRequest';
import {event} from '../js/event';
import HTMLPlayer from '../js/HTMLPlayer';
import AdvPlayer from '../js/AdvPlayer';
import {YoutubePlayer} from '../js/YoutubePlayer';
import {VpaidPlayer} from '../js/VpaidPlayer';
import {scriptonload} from '../js/scriptonload';
import {VASTTag} from '../js/VASTTag';
//import {IMA} from '../js/IMA';

var CombinedPlayer =  class {
	constructor(wrapper, param) {
        this.wrapper = wrapper;
        this.data = param; /* TODO change this.data to this.param */
        this.name = this.data.name;
        this.countPLayers = 0 ;
        this.isShowAdv = (this.data.adv === 'hide' ? false : true);
        this.adsPathes = []; /* массив с путями рекламы  По порядку обращаемся к каждому пока не получим полож ответ*/
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

    _initPlayers(){
        var self = this;
        if (this.data.youtube) this._getYoutubeData();else this._getHtmlData(); /* TODO теперь не нужно - данные сразу в разметку теперь вставляются */
    }

    _checkInitPlayers(){
        this.countPLayers++;
        if (1 === 1) {
            /* TODO */

            // Все плееры инициализированы. Можно показывать обложку и, при необходимости, сразу запускать
            if (this.data.autoplay && !uPlayer.isNeedActivation) this._getAdvData();
            this.wrapper.className = this.wrapper.className + ' js-ready';
        }
    }

    _insertHTML(){
	    var _this = this;

        var age = this.data.age ? '<svg class="combinedPlayer_header_age" role="img"><use xlink:href="/static/img/symbols/sprite.svg#age'+ this.data.age +'"></use></svg>' : '';
        var allVideoLink = this.data.allVideoLink ? '<a class="combinedPlayer_header_allVideoLink" href="'+ this.data.allVideoLink +'">Все видео</a>' : '';
        var category = this.data.category ? '<span class="combinedPlayer_header_category">'+ this.data.category +'</span>' : '';
        var preview = (function () {
            if (_this.data.cover.indexOf('.mp4') !== -1) {
                return '<video loop muted autoplay class="combinedPlayer_preview" src="' + _this.data.cover + '"></video>';
            } else return '<div class="combinedPlayer_preview" style="background-image:url(' + _this.data.cover + ')">';
        })();
        var btns = this.data.online ?
            '<div class="combinedPlayer_playBtns">' +
                '<div class="combinedPlayer_playBtns_frame">' +
                    '<a class="combinedPlayer_onlineBtn" href="'+ this.data.online +'">' +
                        '<svg class="combinedPlayer_onlineBtn_symbol" role="img"><use xlink:href="/static/img/symbols/sprite.svg#play"></use></svg>'+
                        '<span class="combinedPlayer_onlineBtn_text">Смотреть online<br />бесплатно</span>' +
                    '</a>' +
                    '<a data-CombinedPlayer-btn class="combinedPlayer_trailerBtn" href="#">' +
                        '<span class="combinedPlayer_trailerBtn_text">трейлер</span>' +
                        '<svg class="combinedPlayer_trailerBtn_symbol" role="img"><use xlink:href="/static/img/symbols/sprite.svg#play"></use></svg>'+
                    '</a>' +
                '</div>' +
            '</div>'
            :
            '<a data-CombinedPlayer-btn class="combinedPlayer_playBtn" href="#">'+
            '<span class="combinedPlayer_playBtn_circle">'+
            '<svg class="combinedPlayer_playBtn_symbol" role="img"><use xlink:href="/static/img/symbols/sprite.svg#play"></use></svg>'+
            '</span>'+
            '</a>';

        this.wrapper.innerHTML = '<div data-CombinedPlayer-insert="adv" class="combinedPlayer_insert combinedPlayer_insert-adv"></div>' + '<div data-CombinedPlayer-insert="video" class="combinedPlayer_insert combinedPlayer_insert-video"></div>' + preview + '<span class="combinedPlayer_shadow"></span>' + btns + '<div class="combinedPlayer_header">' + '<div class="combinedPlayer_header_left">' + '&nbsp;' + '</div>' + '<div class="combinedPlayer_header_right">' + category + allVideoLink + age + '</div>' + '</div>' + '</div>';
    }

    _defineUserAgent(){
        var agentAll = ['ipod','iphone','ipad', 'android', 'blackberry'],
            i = 0;

        for(i;i< agentAll.length;i++){
            var re = new RegExp(agentAll[i], 'i');
            if( re.test( navigator.userAgent ) ) return agentAll[i];
        }
        return false;
    }

	_addEvents(){
        var self = this,
            throttle = function(type, name, obj) {
                obj = obj || window;
                var running = false;
                var func = function() {
                    if (running) { return; }
                    running = true;
                    requestAnimationFrame(function() {
                        obj.dispatchEvent(new CustomEvent(name));
                        running = false;
                    });
                };
                obj.addEventListener(type, func);
            };

        throttle("resize", "optimizedResize");

        // handle event
        window.addEventListener("optimizedResize", function() {
            console.log('uPlayer', 'resized');
        }, true);

        event.add(this.btn, 'click', function(e){
            e.preventDefault();

            if (self.isShowAdv) {
                self._initializeVideoTag.call(self);
                self._getAdvData.call(self);
            } else {
                self._start.call(self);
            }

            /* TODO */
            try {
                gtag('event', 'click', {
                    'event_category': 'engagement',
                    'event_label': 'click_video_play'
                });
            } catch (e) {}
        });
	}

    _initializeVideoTag(){
        var initVideo = document.createElement('video');
        initVideo.style.cssText = 'visibility:hidden; position:absolute; left: -9999px; top: -9999px; width:1px; height:1px; overflow:hidden;';
        document.body.appendChild(initVideo);
        initVideo.load();
        this.initVideo = initVideo;

        /* for IOS */
        if (this.oYoutubePlayer) this.oYoutubePlayer.initialize();else this.oHTMLPlayer.initialize();
    }

    _start(){
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
    }

    _returnOriginalView(playerName) { /* TODO больше не удаляем плееры */
        this.wrapper.className = this.wrapper.className.replace(/ js-active(-video|-adv)*/g, '');
        //this[playerName].del();
        //delete this[name];
        if (this.onDisableActive) this.onDisableActive();
        this._sendEventMessage('ended', playerName);
    }

    _onFullscreen(playerName){
        this._sendEventMessage('fullscreenOn', playerName);
    }

    _onFullscreenExit(playerName){
        this._sendEventMessage('fullscreenOff', playerName);
    }

    _sendEventMessage(eventName, playerName){
        try{
            window.top.postMessage(JSON.stringify({"uPLayer":true, "event": eventName}), "*");
        } catch(e){}
    }

    _sendStat(persent){ /* TODO пока только работает в этом плеере и persent всегда '' сделать на все плееры, избавиться от локальных функций и посмотреть что там по стате на рекламе, там по яндексу по особенному отправляется */
        var image = document.createElement('IMG'),
            path = window.location.hostname.indexOf('kinoafishaspb.ru') === -1 ? 'kinoafisha.info' : 'kinoafishaspb.ru';
        image.src = 'https://api.'+ path +'/player/stat/?trailer_id=' + this.data.trailer_id + '&host=' + this.data.host + '&mobile=' + uPlayer.isMobile + '&percent=' + persent;
        image.style.cssText = 'visibility:hidden;position:absolute;left:-9999px;top:-9999px;display:block;width:1px;height:1px;overflow:hidden;';
        document.body.appendChild(image);
    }

    _getHtmlData(){
        /* TODO - теперь ничего не получаем, данные в  */

        var self = this;

        self.oHTMLPlayer = new HTMLPlayer(self, self.data);
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
    }

    _getYoutubeData(){
        var self = this,
            checkLoading = function (){
                if(window.isYouTubeIframeAPIReady) self._onSuccessGetYoutubeData.call(self);
                else{
                    setTimeout(function(){
                        checkLoading();
                    }, 200);
                }
            };

        //
        if(!window.onYouTubeIframeAPIReady){
            window.onYouTubeIframeAPIReady = function(){
                window.isYouTubeIframeAPIReady = true;
            }
            scriptonload(['https://www.youtube.com/iframe_api']);
        }
        else {console.log('uPlayer: onYouTubeIframeAPIReady is already exists')} /* TODO */

        checkLoading();
    }

    _getAdvData(){
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
            pathYandex = 'https://an.yandex.ru/meta/168554?imp-id=2&charset=UTF-8&target-ref=' + url + '&page-ref=' + url + '&rnd=' + curTime,
            pathVastGoogleTest = 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=',

            //Можно использовать даже боевой тег, добавив в него параметры- вот так http://data.videonow.ru/?profile_id=695851&format=vast&vpaid=1&flash=0 - отдается наш JS-VPID
            pathVpaidJsTest = 'http://rtr.innovid.com/r1.5554946ab01d97.36996823;cb=%25%CACHEBUSTER%25%25?1=1',
            pathGoogle = 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinearvpaid2js&correlator=' + curTime,
            pathGoogleTest = '//ima3vpaid.appspot.com/?adTagUrl=http%3A%2F%2Fgoogleads.g.doubleclick.net%2Fpagead%2Fads%3Fad_type%3Dvideo%26client%3Dca-video-pub-4968145218643279%26videoad_start_delay%3D0%26description_url%3Dhttp%253A%252F%252Fwww.google.com%26hl%3Den%26max_ad_duration%3D30000%26adtest%3Don&type=js',
            pathBoosterTest = '//boostervideo.ru/vast_vpaid/vast?hash=MzI3b1RNQ2F2dlVVT3RweFZydHZsWGhoaXRtQ1JFR0puUmxhbTZxaVUvZTlPNm9sM2s4UkJkdC9TWk4rNGVWaWpZNmdpdzUxa3Bhc09BQWhRdXpJa3c9PQ==&autoplay=1&url=' + url,
            pathBoosterTestPopcorn = '//boostervideo.ru/vast_vpaid/vast?hash=MzI3b1RNQ2F2dlVVT3RweFZydHZsWGhoaXRtQ1JFR0puUmxhbTZxaVUvZTlPNm9sM2s4UkJkdC9TWk4rNGVWaWpZNmdpdzUxa3Bhc09BQWhRdXpJa3c9PQ==&autoplay=1&url=' + url,
            pathBooster = '//boostervideo.ru/vast_vpaid/vast?hash=MzI3b1RNQ2F2dlVVT3RweFZydHZsWGhoaXRtQ1JFR0puUmxhbTZxaVUvZTlPNm9sM2s4UkJkdC9TWk4rNGVWaUZ6TXNZWUpEQ283UWFTZXpXRG5LU2c9PQ==&url=' + url + '&autoplay=1&hideSkipButton=0&overroll=1' + '&rnd=' + curTime,
            pathMoevideo = '//moevideo.biz/vast?ref=kinoafisha.info&impressionAfterPaid=1&es=1' + '&rnd=' + curTime,
            pathMoevideo2 = '//ad.adriver.ru/cgi-bin/erle.cgi?sid=219765&bt=61&pz=0&bn=19&target=top&rnd=' + curTime + '&tuid=1',
            pathVideonow = (function () {
                var uid = 695851;
                try {
                    if (APP.vars.isMobile) uid = '3278726';
                } catch (e) {}
                return '//data.videonow.ru/?profile_id=' + uid + '&format=vast&container=preroll' + '&rnd=' + curTime;
            })(),
            pathWmg = '//an.facebook.com/v1/instream/vast.xml?placementid=TEST_PLACEMENT_ID&pageurl=http://www.google.com&maxaddurationms=30000' + '&rnd=' + curTime,
            pathOptAd360 = '//ima3vpaid.appspot.com/?adTagUrl=https%3A%2F%2Fgoogleads.g.doubleclick.net%2Fpagead%2Fads%3Fclient%3Dca-video-pub-5512390705137507%26slotname%3D9018911080%2F5952557309%26ad_type%3Dvideo%26description_url%3Dhttp%253A%252F%252Fkinoafisha.info%26max_ad_duration%3D60000%26videoad_start_delay%3D0&type=js' + '&rnd=' + curTime,
            pathOptAd3602 = '//googleads.g.doubleclick.net/pagead/ads?client=ca-video-pub-5512390705137507&slotname=9018911080/5952557309&ad_type=video&description_url=http%3A%2F%2Fkinoafisha.info&max_ad_duration=60000&videoad_start_delay=0' + '&rnd=' + curTime,
            pathMediawayss = '//ad.mediawayss.com/delivery/impress?video=vast&pzoneid=823&ch=DOMAIN_HERE' + '&rnd=' + curTime,
            pathPladform = (function () {
                var pl = '110461',
                    type = 'preroll',
                    license = '1',
                    thematic = self.data.ads.puid5 + '' + self.data.ads.puid6,
                    age = self.data.ads.puid7,
                    duration = 150,
                    dl = url,
                    target = (function () {
                        var val;
                        try {
                            if (APP.vars.isMobile) val = 'mobile';else val = 'web-html5';
                        } catch (e) {
                            val = 'web-html5';
                        }
                        return val;
                    })(),
                    adformat = '1';

                return '//out.pladform.ru/getVast?pl=' + pl + '&type=' + type + '&license=' + license + '&thematic=' + thematic + '&age=' + age + '&duration=' + duration + '&dl=' + dl + '&target=' + target + '&adformat=' + adformat + '&rnd=' + curTime;
            })(),
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
                    })(),
                    puid7 = (function () {
                        return '&puid7=1';
                    })(),
                    puid8 = (function () {
                        /* TODO хронометраж контента */
                        return '&puid8=4';
                    })(),
                    puid10 = (function () {
                        /* Размер плеера */
                        var val;
                        try {
                            if (APP.vars.isMobile) val = 0;else val = 1;
                        } catch (e) {
                            val = 4;
                        }
                        return '&puid10=' + val;
                    })();

                //
                return '//instreamvideo.ru/core/vpaid/linear?pid=' + pid + '&vr=1&rid=' + curTime + puid5 + puid6 + puid7 + puid8 + puid10 + '&puid11=1&puid12=16&dl=' + url + '&duration=150&vn=' + url;
            })(),
            pathAdbetnet = '//adbetnet.advertserve.com/servlet/vast3/zone?zid=4918&pid=1291&rnd=' + curTime,
            pathMarketPlace = '//widget.market-place.su/videovast/1574.xml?rnd=' + curTime,
            pathVihub = '//vast.vihub.ru/?plid=1176&startdelay=0&ref=' + url,
            pathXameleon = '//ssp.xameleon.io/?VyuED9ftSXPwzmOgOOyqDGAn6N/b4XZgKdJ7fu/5cpLNaadEDRpsYeunQNw8ykBq0j9oahcMAomAMfc3EtdLOsv2AQcnB8ipDARNGsO2lqs=',
            pathZetcat = '//3647.tech/vpaid/?domain=www.kinoafisha1.info',
            pathMediaForce = '//ads.adfox.ru/220463/getCode?p1=cdbyb&p2=frxu',
            pathIMXO = (function(){
                var pr = Math.floor(new Date().getTime()/1000) + Math.floor(Math.random()*214748364);
                var placementId = 20651;
                var sessionId = new Date().getTime() + "" + Math.floor(Math.random()*2147483647);
                var eid1 = placementId + ':' + sessionId + ':' + pr;

                //
                //return 'https://v.adfox.ru/226279/getCode?pp=eez&ps=cwpk&p2=eyit&pfc=a&pfb=a&plp=a&pli=a&pop=a&pct=d&puid5=1&puid6=1&puid30='+placementId+'&pr='+ pr +'&dl=http://kinoafisha/test/:' + url + '&eid1=' + eid1;
                return 'https://v.adfox.ru/226279/getCode?pp=eez&ps=defw&p2=eyit&pfc=a&pfb=a&plp=a&pli=a&pop=a&pct=d&puid5=1&puid6=1&puid30='+placementId+'&pr='+ pr +'&dl=' + url + '&eid1=' + eid1;

            })(),
            pathTestInline = '/vast/skipTime2.xml',
            pathes = {
                'RCA': pathYandex,
                'Videonow': pathVideonow,
                'Mediawayss': pathMediawayss,
                'InVideo': pathInVideo,
                'Moevideo': pathMoevideo,
                'Moevideo2': pathMoevideo2,
                'Pladform': pathPladform,
                'Booster': pathBooster,
                'MarketPlace': pathMarketPlace,
                'Vihub': pathVihub,
                'Zetcat': pathZetcat,
                'MediaForce': pathMediaForce,
                'IMXO': pathIMXO,
                'TestInline': pathTestInline
            },
            agents = (function () {
                if (self.data.ads.agents) {
                    return self.data.ads.agents;
                }
                if (self.data.youtube) {
                    return APP.vars.prioritiesPrerollYoutube;
                } else {
                    return APP.vars.prioritiesPreroll;
                }
            })(),
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
            agent = randomKey(agents),
            path = (function () {
                var url = new URL(window.location.href),
                    ads = url.searchParams.get('uPLayerAds');

                if (pathes[ads]) return pathes[ads];

                //return '//pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=' + curTime;

                /*if (_this2.data.dev) {
                    if (_this2.data.dev === 'vpaidJsTest') return pathVpaidJsTest;
                    if (_this2.data.dev === 'vastGoogleTest') return pathVastGoogleTest;
                    if (_this2.data.dev === 'yandex') return pathYandex;
                    if (_this2.data.dev === 'google-test') return pathGoogleTest;
                    if (_this2.data.dev === 'booster') return pathBooster;
                    if (_this2.data.dev === 'booster? -popcorn') return pathBoosterTestPopcorn;
                    if (_this2.data.dev === 'moevideo') return pathMoevideo;
                    if (_this2.data.dev === 'moevideo2') return pathMoevideo2;
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
                    if (_this2.data.dev === 'Adbetnet') return pathAdbetnet;
                    if (_this2.data.dev === 'MarketPlace') return pathMarketPlace;
                    if (_this2.data.dev === 'Xameleon') return pathXameleon;
                }*/

                //
                //return pathes[Math.floor(Math.random() * (pathes.length))];

                /*try{
                    if(APP.vars.locationCityMain === 'nsk' ||
                        APP.vars.locationCityMain === 'nn' ||
                        APP.vars.locationCityMain === 'chel' ||
                        APP.vars.locationCityMain === 'omsk' ||
                        APP.vars.locationCityMain === 'ufa' ||
                        APP.vars.locationCityMain === 'perm' ||
                        APP.vars.locationCityMain === 'voronezh') {
                        return pathAdRiverWrapper;
                    }
                } catch(e){};*/

                /* TODO */
                if(!pathes[agent]) throw new Error('Имя рекламного агента не найдено');
                else return pathes[agent];
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

        this.adsPathes.push({name:'IMXO', path:pathIMXO});
        this.adsPathes.push({name:agent, path:path});

        console.log('adsPathes', this.adsPathes);

        this._checkAdsPath(0);
    }

    /* больше не запрашиваем данные */
    /*_onSuccessGetHtmlData(data){
        var self = this;
          self.oHTMLPlayer = new HTMLPlayer(self, data);
        self.oHTMLPlayer.afterEnd = function(){
            self._returnOriginalView.call(self, 'oHTMLPlayer');
        }
        self._checkInitPlayers.call(self);
    }*/

    /* Путей может быть несколько. Если первый */
    _checkAdsPath(ind){
        if(this.adsPathes[ind]){
            this._getAdsData(this.adsPathes[ind], ind)
        }
        else {
            console.log('Ни у кого нет рекламы - запускаем видео');
            this._start();
        }
    }

    _getAdsData(ads, ind){
        var self =this,
            path = ads.path,
            agent = ads.name;

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
            console.log('Запрашиваем рекламу по адресу', path);
            new VASTTag({
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
                    self._checkAdsPath.call(self, ind+1);
                    //_getOur();
                }
            });
        }

        /* TODO Отправдляем нашу стату - какой агент пробует показать рекламу */
        console.log('Отправдляем нашу стату - какой агент пробует показать рекламу', agent);
        var image = document.createElement('IMG'),
            path = window.location.hostname.indexOf('kinoafishaspb.ru') === -1 ? 'kinoafisha.info' : 'kinoafishaspb.ru';
        image.src = 'https://api.' + path + '/player/statad/?source=' + agent;
        image.style.cssText = 'visibility:hidden;position:absolute;left:-9999px;top:-9999px;display:block;width:1px;height:1px;overflow:hidden;';
        document.body.appendChild(image);
    }

    _onSuccessGetVpaidData(data){
        var self = this;
        this.oVpaidPlayer = new VpaidPlayer(self, data);
    }

    _onSuccessGetAdvData(data){
        var self = this;

        self.oAdvPlayer = new AdvPlayer(self, data); /* при создании объекта проиходит вставка нужной разметки и инициализация плеера.(IOS) Сами Данные не вставляются */
        self.oAdvPlayer.afterEnd = function () {
            if (self.oYoutubePlayer) self.oYoutubePlayer.start();else self.oHTMLPlayer.start();

            self.wrapper.className = self.wrapper.className.replace(' js-active-adv', ' js-active-video');
        };
        self.oAdvPlayer.afterSkip = function () {
            if (self.oYoutubePlayer) self.oYoutubePlayer.start();else self.oHTMLPlayer.start();

            self.wrapper.className = self.wrapper.className.replace(' js-active-adv', ' js-active-video');
        };
        self.oAdvPlayer.afterClicking = function () {
            /* отключил, продалжаем проигрывание после клика */
            self.oAdvPlayer.abort();
            self._returnOriginalView.call(self, 'oAdvPlayer');
        };
        self._start.call(self);
    }

    _onSuccessGetYoutubeData(){
        var self = this;
        var onReady = function(event){
            self._checkInitPlayers.call(self);
        }

        self.oYoutubePlayer = new YoutubePlayer(self, onReady);
        self.oYoutubePlayer.afterEnd = function(){
            self._returnOriginalView.call(self, 'oYoutubePlayer');
        }
    }

    onAdsCompleted(){
        /* TODO - сделать всю рекламу так */
        if (this.oYoutubePlayer) this.oYoutubePlayer.start();else this.oHTMLPlayer.start();

        this.isShowAdv = false; /* TODO ??  */
        this.wrapper.className = this.wrapper.className.replace(' js-active-adv', ' js-active-video');
    }

    abort(){
        if(this.oAdvPlayer) this.oAdvPlayer.abort();
        if(this.oVpaidPlayer) this.oVpaidPlayer.abort();
        if (this.oHTMLPlayer) this.oHTMLPlayer.abort();
        else if (this.oYoutubePlayer) this.oYoutubePlayer.abort(); /* TODO в трейлерах может не быть ни того нитого - в теории такого не должно быть, разобраться */

        this._returnOriginalView();
    }

    del(){
        if(this.oAdvPlayer) this.oAdvPlayer.del();
        if(this.oVpaidPlayer) this.oVpaidPlayer.del();

        if (this.oHTMLPlayer) this.oHTMLPlayer.del();
        else this.oYoutubePlayer.del();

        this.wrapper.className = this.wrapper.className.replace(/ js-active(-video|-adv)*/g, '');
        this.wrapper.innerHTML = '';

        delete uPlayer.all[this.name];
    }

    destroy(){ /* аналог del */
        this.del();
    }
};

//
export {CombinedPlayer}






































