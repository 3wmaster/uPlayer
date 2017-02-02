import {scriptRequest} from '../js/scriptRequest';
import {event} from '../js/event';
import HTMLPlayer from '../js/HTMLPlayer';
import AdvPlayer from '../js/AdvPlayer';
import {YoutubePlayer} from '../js/YoutubePlayer';
import {scriptonload} from '../js/scriptonload';

var CombinedPlayer =  class {
	constructor(wrapper, param) {
        this.wrapper = wrapper;
        this.data = param;
        this.name = this.data.name;
        this.countPLayers = 0 ;
        this.isShowAdv = (this.data.adv === 'hide' ? false : true);
        this._insertHTML(wrapper); /*  */
        this.btn = this.wrapper.querySelector('[data-CombinedPlayer-btn]');
        this.isMobileAgent = this._defineUserAgent();
        this.oAdvPlayer = undefined;
        this.oHTMLPlayer = undefined;
        this.oYoutubePlayer = undefined;
        this.HTMLDataApi; /* данные Html плеера. будем загружать только один раз и зранить здесь */
        this._initPlayers();
		this._addEvents();
	}

    _initPlayers(){
        var self = this;

        if(this.isShowAdv)  this._getAdvData();
        else this.countPLayers++;

        if (this.data.youtube) this._getYoutubeData();
        else this._getHtmlData();
    }

    _checkInitPlayers(){
        this.countPLayers++;
        if(this.countPLayers === 2){
            // Все плееры инициализированы. Можно показывать обложку и, при необходимости, сразу запускать
            if(this.data.autoplay && !uPlayer.isNeedActivation) this._start();
            this.wrapper.className = this.wrapper.className + ' js-ready';
        }
    }

    _insertHTML(){
        var age = this.data.age ? '<svg class="combinedPlayer_header_age" role="img"><use xlink:href="/static/img/symbols/sprite.svg#age'+ this.data.age +'"></use></svg>' : '';
        var allVideoLink = this.data.allVideoLink ? '<a class="combinedPlayer_header_allVideoLink" href="'+ this.data.allVideoLink +'">Все видео</a>' : '';
        var category = this.data.category ? '<span class="combinedPlayer_header_category">'+ this.data.category +'</span>' : '';

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

        this.wrapper.innerHTML = '<div data-CombinedPlayer-insert="adv" class="combinedPlayer_insert combinedPlayer_insert-adv"></div>'+
            '<div data-CombinedPlayer-insert="video" class="combinedPlayer_insert combinedPlayer_insert-video"></div>'+
            '<div class="combinedPlayer_preview" style="background-image:url('+ this.data.cover +')">'+
            '<span class="combinedPlayer_shadow"></span>'+ btns +
            '<div class="combinedPlayer_header">' +
            '<div class="combinedPlayer_header_left">'+ '&nbsp;' + '</div>' +
            '<div class="combinedPlayer_header_right">' + category + allVideoLink + age + '</div>' +
            '</div>'+
            '</div>';
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
        var self = this;

        event.add(this.btn, 'click', function(e){
            e.preventDefault();
            self._start.call(self);
        });
	}

    _start(){
        uPlayer.abortAll(this);

        this._sendStat('');

        if(this.oAdvPlayer && this.isShowAdv) {
            this.oAdvPlayer.start();

            /* for IOS */
            if(this.oYoutubePlayer) this.oYoutubePlayer.initialize();
            else this.oHTMLPlayer.initialize();

            this.wrapper.className = this.wrapper.className + ' js-active js-active-adv';
            this.isShowAdv = false; /* если один раз показали - больше в этом плеере не показываем, без разницы какая реклама */
        }
        else if(this.oHTMLPlayer) {
            this.oHTMLPlayer.start();
            this.wrapper.className = this.wrapper.className + ' js-active js-active-video';

        }
        else{
            this.oYoutubePlayer.start();
            this.wrapper.className = this.wrapper.className + ' js-active js-active-video';
        }

        if(this.onActive) this.onActive();
    }

    _returnOriginalView(name){ /* TODO больше не удаляем плееры */
        this.wrapper.className = this.wrapper.className.replace(/ js-active(-video|-adv)*/g, '');
        //this[name].del();
        //delete this[name];
        if(this.onDisableActive) this.onDisableActive();
    }

    _sendStat(persent){ /* TODO пока только работает в этом плеере и persent всегда '' сделать на все плееры, избавиться от локальных функций и посмотреть что там по стате на рекламе, там по яндексу по особенному отправляется */
        var image = document.createElement('IMG'),
            path = window.location.hostname.indexOf('kinoafishaspb.ru') === -1 ? 'kinoafisha.info' : 'kinoafishaspb.ru';
        image.src = 'https://api.'+ path +'/player/stat/?trailer_id=' + this.data.trailer_id + '&host=' + this.data.host + '&mobile=' + uPlayer.isMobile + '&percent=' + persent;
        image.style.cssText = 'visibility:hidden;position:absolute;left:-9999px;top:-9999px;display:block;width:1px;height:1px;overflow:hidden;';
        document.body.appendChild(image);
    }

    _getHtmlData(){
        var self = this,
            path = this.data.isDev ? 'kinoafishaspb.ru' : 'kinoafisha.info',
            _onSuccess = function(dataApi){
                self._onSuccessGetHtmlData.call(self, dataApi);
            },
            _onError = function(){};

        //
        if(this.HTMLDataApi) _onSuccess(this.HTMLDataApi);
        else {
            scriptRequest('//api.'+ path +'/player/info/' + this.data.trailer_id + '/', function(dataApi){_onSuccess(dataApi)}, function(){_onError()});
        }
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
        else {console.error('uPlayer: onYouTubeIframeAPIReady is already exists')} /* TODO */

        checkLoading();
    }

    _getAdvData(){
        var self = this;
        var data = {}; /* урл, ссылка, статистика итд */
        var curTime = new Date().getTime();
        var advInterval = 24;

        var url = encodeURIComponent(location.protocol + '//' + location.hostname + location.pathname),
            //path = 'https://static.kinoafisha.info/static/html/vast.xml?rnd=' + new Date().getTime(),
            path = 'https://an.yandex.ru/meta/168554?imp-id=2&charset=UTF-8&target-ref='+ url +'&page-ref='+ url +'&rnd=' + new Date().getTime(),
            x = new XMLHttpRequest();

        var _getOur = function(){
            if((localStorage && !localStorage.isKinoafishaVideoAdv) || ((curTime - parseFloat(localStorage.isKinoafishaVideoAdv))/1000/60/60 > advInterval)){
                localStorage.isKinoafishaVideoAdv = curTime;
                data.advVideo = 'https://video.kinoafisha.info/branding/kinoafisha/kinoafisha-youtube3.mp4';
                data.advLink = 'https://www.youtube.com/channel/UCNuQyDGBj28VwMRhCy_hTOw';
                self._onSuccessGetAdvData.call(self, data);
            }
            else self._checkInitPlayers.call(self);
        };

        //
        data.advVideo = undefined;
        data.advLink = undefined;
        data.ImpressionAll = []; /* src статистика начала проигрывания */
        data.keyFrameAll = []; /* ключевые кадры в процентах */
        data.statEventAll = {};/* соотв им названия, например, при 50% - название midpoint итд */

        //
        x.withCredentials = true;
        x.open("GET", path, true);
        x.onload = function (){
            var parser = new DOMParser ();
            var xmlDoc = parser.parseFromString (x.responseText, "text/xml");
            var MediaFile = xmlDoc.getElementById('480p.mp4');
            var ClickThrough = xmlDoc.getElementsByTagName('ClickThrough')[0];

            if(MediaFile){
                var ImpressionAll = xmlDoc.getElementsByTagName('Impression'),
                    TrackingAll = xmlDoc.getElementsByTagName('Tracking'),
                    statEventAll = {};

                data.advVideo = MediaFile.childNodes[0].nodeValue;
                data.advLink = ClickThrough.childNodes[0].nodeValue;

                /* определяем src для статистики начала проигрывания */
                for(var i=0,j=ImpressionAll.length; i<j; i++){
                    var src;
                    if(src = ImpressionAll[i].childNodes[0].nodeValue) data.ImpressionAll.push(src);
                }

                /* формируем данные статистики ключевых кадров */
                for(var i=0,j=TrackingAll.length; i<j; i++){
                    var name = TrackingAll[i].getAttribute('event'),
                        src = TrackingAll[i].childNodes[0].nodeValue;
                    //
                    switch(name){
                        case 'start' : name = '0'; break;
                        case 'firstQuartile' : name = '25'; break;
                        case 'midpoint' : name = '50'; break;
                        case 'thirdQuartile' : name = '75'; break;
                        case 'complete' : name = '100'; break;
                    }

                    if(!statEventAll[name]) statEventAll[name] = [];
                    statEventAll[name].push(src);
                }


                data.keyFrameAll = [0, 25, 50, 75, 100];
                data.statEventAll =  statEventAll;

                self._onSuccessGetAdvData.call(self, data);
            }
            else _getOur();
        };
        x.onerror = _getOur; /* например, блокировщик рекламы */
       x.send(null);
    }

    _onSuccessGetHtmlData(data){
        var self = this;

        self.oHTMLPlayer = new HTMLPlayer(self, data);
        self.oHTMLPlayer.afterEnd = function(){
            self._returnOriginalView.call(self, 'oHTMLPlayer');
        }
        self._checkInitPlayers.call(self);
    }

    _onSuccessGetAdvData(data){
        var self = this;
        self.oAdvPlayer = new AdvPlayer(self, data); /* при создании объекта проиходит вставка нужной разметки и инициализация плеера.(IOS) Сами Данные не вставляются */
        self.oAdvPlayer.afterEnd = function(){
            if(self.oYoutubePlayer) self.oYoutubePlayer.start();
            else self.oHTMLPlayer.start();

            self.wrapper.className = self.wrapper.className.replace(' js-active-adv', ' js-active-video');
        }
        self.oAdvPlayer.afterSkip = function(){
            if(self.oYoutubePlayer) self.oYoutubePlayer.start();
            else self.oHTMLPlayer.start();

            self.wrapper.className = self.wrapper.className.replace(' js-active-adv', ' js-active-video');
        }
        self.oAdvPlayer.afterClicking = function() {
            self.oAdvPlayer.abort();
            self._returnOriginalView.call(self, 'oAdvPlayer');
        }
        self._checkInitPlayers.call(self);
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

    abort(){
        if(this.oAdvPlayer) this.oAdvPlayer.abort();

        if (this.oHTMLPlayer) this.oHTMLPlayer.abort();
        else this.oYoutubePlayer.abort();

        this._returnOriginalView();
    }

    del(){
        if(this.oAdvPlayer) this.oAdvPlayer.del();

        if (this.oHTMLPlayer) this.oHTMLPlayer.del();
        else this.oYoutubePlayer.del();

        this.wrapper.className = this.wrapper.className.replace(/ js-active(-video|-adv)*/g, '');
        this.wrapper.innerHTML = '';
;
        delete uPlayer.all[this.name];
    }

    destroy(){ /* аналог del */
        this.del();
    }
};

//
export {CombinedPlayer}






































