import {scriptRequest} from '../js/scriptRequest';
import {event} from '../js/event';
import HTMLPlayer from '../js/HTMLPlayer';
import AdvPlayer from '../js/AdvPlayer';
import {YoutubePlayer} from '../js/YoutubePlayer';
import {scriptonload} from '../js/scriptonload';

var CombinedPlayer =  class {
	constructor(wrapper, name) {
        this.name = name;
        this._insertHTML(wrapper);
		this._createElements();
		this._addEvents();
        this._checkAutoplay();
	}

    _insertHTML(wrapper){
        this.wrapper = wrapper;
        this.data = JSON.parse(this.wrapper.getAttribute('data-param'));

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

        this.wrapper.innerHTML = '<div data-CombinedPlayer-insert class="combinedPlayer_insert"></div>'+
            '<div class="combinedPlayer_preview" style="background-image:url('+ this.data.cover +')">'+
            '<span class="combinedPlayer_shadow"></span>'+ btns +
            '<div class="combinedPlayer_header">' +
            '<div class="combinedPlayer_header_left">'+ '&nbsp;' + '</div>' +
            '<div class="combinedPlayer_header_right">' + category + allVideoLink + age + '</div>' +
            '</div>'+
            '</div>';
    }

	_createElements(){
        this.btn = this.wrapper.querySelector('[data-CombinedPlayer-btn]');
		this.insert = this.wrapper.querySelector('[data-CombinedPlayer-insert]');
        this.isMobileAgent = this._defineUserAgent();
        this.isShowAdv = true;
        this.oAdvPlayer;
        this.oHTMLPlayer;
        this.oYoutubePlayer;
        this.HTMLDataApi; /* данные Html плеера. будем загружать только один раз и зранить здесь */
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
            self._play.call(self);
        });
	}

    _checkAutoplay(){
        if(this.data.autoplay) this._play();
    }

    _play(){
        uPlayer.abortAll(this);

        this._sendStat('');

        if(!this.isShowAdv || this.data.adv === 'hide') { /* ||this.isMobileAgent на мобильниках реклама не будет показываться, нужно плееры загружать заранее */
            if (this.data.youtube) this._createYoutubePlayer();
            else this._createHTMLPlayer();
        }
        else {
            this._createAdvPlayer();
            //this.oAdvPlayer.initialize();
            this.oAdvPlayer.show();
            this.isShowAdv = false; /* если один раз показали - больше в этом плеере не показываем, без разницы какая реклама */
        }

        if(this.wrapper.className.indexOf('js-active') === -1) this.wrapper.className = this.wrapper.className + ' js-active';
        if(this.onActive) this.onActive();
    }

    _returnOriginalView(name){
        this.wrapper.className = this.wrapper.className.replace(' js-active', '');
        this[name].del();
        delete this[name];
        if(this.onDisableActive) this.onDisableActive();
    }

    _sendStat(persent){ /* TODO пока только работает в этом плеере и persent всегда '' сделать на все плееры, избавиться от локальных функций и посмотреть что там по стате на рекламе, там по яндексу по особенному отправляется */
        var image = document.createElement('IMG'),
            path = window.location.hostname.indexOf('kinoafishaspb.ru') === -1 ? 'kinoafisha.info' : 'kinoafishaspb.ru';
        image.src = 'https://api.'+ path +'/player/stat/?trailer_id=' + this.data.trailer_id + '&host=' + this.data.host + '&mobile=' + uPlayer.isMobile + '&percent=' + persent;
        image.style.cssText = 'visibility:hidden;position:absolute;left:-9999px;top:-9999px;display:block;width:1px;height:1px;overflow:hidden;';
        document.body.appendChild(image);
    }

    _createYoutubePlayer(){
        var self = this,
            checkLoading = function (){
                if(window.isYouTubeIframeAPIReady) addApi();
                else{
                    setTimeout(function(){
                        checkLoading();
                    }, 200);
                }
            },
            addApi = function(){
                if(!self.oYoutubePlayer) return false;

                self.oYoutubePlayer = new YoutubePlayer(self);
                self.oYoutubePlayer.afterEnd = function(){
                    self._returnOriginalView.call(self, 'oYoutubePlayer');
                }
                self.oYoutubePlayer.afterAbort = function(){
                    self._returnOriginalView.call(self, 'oYoutubePlayer');
                }
            };

        //
        this.oYoutubePlayer = 'loading'; /* если вдруг запустили другой плеер, загрузку будем прерывать  */

        if(!window.onYouTubeIframeAPIReady){
            window.onYouTubeIframeAPIReady = function(){
                window.isYouTubeIframeAPIReady = true;
            }
            scriptonload(['https://www.youtube.com/iframe_api']);
        }
        else {console.error('uPlayer: onYouTubeIframeAPIReady is already exists')} /* TODO */

        checkLoading();
    }

    _createAdvPlayer(){
        var self = this;



        this.oAdvPlayer = new AdvPlayer(self);

        this.oAdvPlayer.afterEnd = function(){
            self.oAdvPlayer.del();
            delete self.oAdvPlayer;
            if (self.data.youtube) self._createYoutubePlayer.call(self);
            else self._createHTMLPlayer.call(self);
        }
        this.oAdvPlayer.afterAbort = function(){
            self._returnOriginalView.call(self, 'oAdvPlayer');
        }
        this.oAdvPlayer.afterSkip = function(){
            self.oAdvPlayer.del();
            delete self.oAdvPlayer;
            if (self.data.youtube) self._createYoutubePlayer.call(self);
            else self._createHTMLPlayer.call(self);
        }
        this.oAdvPlayer.afterClicking = function(){
            self._returnOriginalView.call(self, 'oAdvPlayer');
        }


    }

    _createHTMLPlayer(){
        var self = this,
            path = this.data.isDev ? 'kinoafishaspb.ru' : 'kinoafisha.info',
            _onSuccess = function(dataApi){
                self.HTMLDataApi = dataApi;
                if(!self.oHTMLPlayer) return false;

                self.oHTMLPlayer = new HTMLPlayer(self);
                self.oHTMLPlayer.afterEnd = function(){
                    self._returnOriginalView.call(self, 'oHTMLPlayer');
                }
                self.oHTMLPlayer.afterAbort = function(){
                    self._returnOriginalView.call(self, 'oHTMLPlayer');
                }
            },
            _onError = function(){};

        //

        if(this.HTMLDataApi) _onSuccess(this.HTMLDataApi);
        else {
            /* TODO
             * во время загрузки белый экран. Нужно показывать  прелоадер
              * */
            this.oHTMLPlayer = 'loading'; /* если вдруг запустили другой плеер, загрузку будем прерывать  */
            scriptRequest('//api.'+ path +'/player/info/' + this.data.trailer_id + '/', function(dataApi){_onSuccess(dataApi)}, function(){_onError()});
        }
    }

    abort(){
        if(this.oAdvPlayer) this.oAdvPlayer.abort();
        else if (this.oHTMLPlayer) {
            if (this.oHTMLPlayer === 'loading'){
                this.wrapper.className = this.wrapper.className.replace(' js-active', '');
                delete this.oHTMLPlayer;
            }
            else this.oHTMLPlayer.abort();
        }
        else if(this.oYoutubePlayer){
            if (this.oYoutubePlayer === 'loading'){
                this.wrapper.className = this.wrapper.className.replace(' js-active', '');
                delete this.oYoutubePlayer;
            }
            else this.oYoutubePlayer.abort();
        }
    }

    del(){
        if(this.oAdvPlayer) this.oAdvPlayer.del();
        if(this.oHTMLPlayer && this.oHTMLPlayer.del) this.oHTMLPlayer.del();
        if(this.oYoutubePlayer && this.oYoutubePlayer.del) this.oYoutubePlayer.del();

        this.wrapper.className = this.wrapper.className.replace(' js-active', '');
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






































