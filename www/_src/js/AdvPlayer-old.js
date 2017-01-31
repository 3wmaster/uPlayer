
export default class{
	constructor(oUPlayer){
		this._createElements(oUPlayer);
		this._addEventsName();
		this._addEvents();
	}

    _getHtml(){
        return  '<div data-js="adv-player" class="advPlayer">'+
                    '<video data-js="adv-video" class="advPlayer_video"></video>'+
                    '<a data-js="adv-clicking-btn" class="advPlayer_link" target="_blank"></a>'+
                    '<div class="advPlayer_controls">'+
                        '<div class="advPlayer_controlsCell">'+
                            '<span class="advPlayer_param">Реклама.</span> <span data-js="adv-left" class="advPlayer_param">&nbsp;</span>'+
                        '</div>'+
                        '<div class="advPlayer_controlsCell">'+
                            '<a data-js="adv-skip-btn" class="advPlayer_param" href="#">&nbsp;</a>'+
                        '</div>'+
                     '</div>'+
                    '<div class="advPlayer_before">'+
                        '<div class="advPlayer_beforeContent">'+
                            '<div class="advPlayer_beforeContentItem">Реклама</div>'+
                        '</div>'+
                    '</div>'+
                    '<div class="advPlayer_preloader"></div>'+
                '</div>';
    }

	_createElements(oUPlayer){
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

	_addEventsName(){
		this.eNames = {}
		if (window.navigator.pointerEnabled) this.eNames = {'down': 'pointerdown', 'move': 'pointermove', 'enter':'pointerenter', 'leave':'pointerleave', 'up': 'pointerup'};
		else if(window.navigator.msPointerEnabled) this.eNames = {'down': 'MSPointerDown', 'move': 'MSPointerMove', 'enter':'MSPointerEnter', 'leave':'MSPointerLeave', 'up': 'MSPointerUp'};
		else if('ontouchstart' in document.documentElement) {
			this.eNames = {'down': 'touchstart', 'move': 'touchmove', 'enter':'touchstart', 'leave':'touchend', 'up': 'touchend'};
		}
		else this.eNames = {'down': 'mousedown', 'move': 'mousemove', 'enter':'mouseenter', 'leave':'mouseleave', 'up': 'mouseup'};
	}

	_addEvents(){
		var self = this;

		this.video.onloadedmetadata = function (event){
			self._updateTimeCur.call(self, 0);
			self._ready.call(self);
		}

		this.video.ontimeupdate = function (){
            /*
            * В ФФ это событие может сработать после события onended
            * при этом время продолжительности видео возвращается NAN
            * TODO в основном плеере
            * */
            if(isNaN(this.duration)) return false;
			self._updateTimeCur.call(self, this.currentTime);
		}

		this.video.onended = function(){
            self._endCallback.call(self);
		}

		this.skipBtn.onclick = function(){
			self._skip.call(self);
			return false;
		}

		this.clickingBtn.onclick = function(){
			self._clicking.call(self);
		}
	}

	_skip(){
		if(this.skipBtn.innerHTML !== 'Пропустить') return false;

		this.wrapper.className = this.wrapper.className.replace(/\s*advPlayer-active/, '');
		this.video.pause();
		this.afterSkip();
	}

	_clicking(){
		this.wrapper.className = this.wrapper.className.replace(/\s*advPlayer-active/, '');
		this.video.pause();
		this.afterClicking();
	}

	_endCallback(){
		this.wrapper.className = this.wrapper.className.replace(/\s*advPlayer-active/, '');
		this.afterEnd(); //определяется в основном плеере
	}

    abort(){
        if(this.video.paused) return;
        this.wrapper.className = this.wrapper.className.replace(/\s*advPlayer-active/, '');
        this.video.pause();
        this.afterAbort(); //определяется в основном плеере
    }

	_reloadData(data){
        var source = document.createElement('SOURCE');

        //
        this.clickingBtn.setAttribute('href', data.advLink);
		this.video.innerHTML = '';
		source.setAttribute('src', data.advVideo);
		source.setAttribute('type', 'video/' + this.format);
		this.video.appendChild(source);
		this.video.load();
	}

	_updateTimeCur(sec){
		var leftTime = Math.floor(this.video.duration - sec),
			text = leftTime ? ('Осталось ' + leftTime + 'сек') : '&nbsp;',
			skipTime = Math.round(5 - sec);

		this.advLeft.innerHTML = text;

		if(skipTime > 0 && this.userAgent !== 'iphone') this.skipBtn.innerHTML = 'Пропустить через ' + skipTime; //В айфоне всегда можно закрыть
		else this.skipBtn.innerHTML = 'Пропустить';
        this._checkStat();
	}

    _checkStat(){/* делаем по аналогии с флеш-плеером, где даже при перемотке статистика считается */
        if(!this.keyFrameAll.length) return false;

        var persent = Math.round(this.video.currentTime/this.video.duration*100);
        if((this.keyFrameAll[0] === persent) || (this.keyFrameAll[0] < persent)){
            this._sendStat(this.keyFrameAll[0]+'');

            this.keyFrameAll.shift();
            this._checkStat();
        }
    }

    _sendStat(name){
        var arr;
        if(arr = this.statEventAll[name]){
            for(var i=0,j=arr.length; i<j; i++){
                var src;
                if(src = arr[i]) {
                    var image = document.createElement('IMG');
                    image.src = src;
                    image.setAttribute('data-name', name);
                    image.style.cssText = 'visibility:hidden;position:absolute;left:-9999px;top:-9999px;display:block;width:1px;height:1px;overflow:hidden;';
                    document.body.appendChild(image);
                }
            }
        }
    }

	_ready(){
		var self = this;

        //this.video.muted = false;

		if( this.userAgent === 'iphone'){
			this.wrapper.className = 'advPlayer advPlayer-ready advPlayer-active advPlayer-before';
			setTimeout(function(){
				self.wrapper.className = 'advPlayer advPlayer-ready advPlayer-active';
				self.video.play();
			}, 1500);
		}
		else {
			this.wrapper.className = 'advPlayer advPlayer-ready advPlayer-active';
			this.video.play();
		}

        //this.video.muted = false;
	}

	initialize(){
		this.video.innerHTML = '';
		this.video.load();
	}

	show(){
		var self = this;

        this.wrapper.className = 'advPlayer advPlayer-active  advPlayer-waiting';

       //if(this.param.advType === 'VAST'){
            var url = encodeURIComponent(location.protocol + '//' + location.hostname + location.pathname),
               // path = 'https://static.kinoafisha.info/static/html/vast.xml?rnd=' + new Date().getTime(),
                path = 'https://an.yandex.ru/meta/168554?imp-id=2&charset=UTF-8&target-ref='+ url +'&page-ref='+ url +'&rnd=' + new Date().getTime(),
                x = new XMLHttpRequest();


            //
            x.withCredentials = true;
            x.open("GET", path, true);
            x.onload = function (){
                var parser = new DOMParser ();
                var xmlDoc = parser.parseFromString (x.responseText, "text/xml");
                var MediaFile = xmlDoc.getElementById('480p.mp4');
                var ClickThrough = xmlDoc.getElementsByTagName('ClickThrough')[0];
                
                if(MediaFile){
                    var data = {},
                        ImpressionAll = xmlDoc.getElementsByTagName('Impression'),
                        TrackingAll = xmlDoc.getElementsByTagName('Tracking'),
                        statEventAll = {};

                    data.advVideo = MediaFile.childNodes[0].nodeValue;
                    data.advLink = ClickThrough.childNodes[0].nodeValue;

                    /* оправляем статистику начала проигрывания */
                    for(var i=0,j=ImpressionAll.length; i<j; i++){
                        var src;
                        if(src = ImpressionAll[i].childNodes[0].nodeValue) {
                            var image = document.createElement('IMG');

                            //
                            image.src = src;
                            image.style.cssText = 'visibility:hidden;position:absolute;left:-9999px;top:-9999px;display:block;width:1px;height:1px;overflow:hidden;';
                            document.body.appendChild(image);
                        }
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

                    self.keyFrameAll = [0, 25, 50, 75, 100];
                    self.statEventAll =  statEventAll;
                    self._reloadData.call(self, data);
                }

                else{
                    self.keyFrameAll = [];
                    self.statEventAll = {};
                    self._showOur.call(self);
                }
            };
            x.onerror = function(){ /* например, блокировщик рекламы */
                self.keyFrameAll = [];
                self.statEventAll = {};
                self._showOur.call(self);
            };
            x.send(null);

        //}
       // else this._showOur();
	}

    _showOur(){

        var curTime = new Date().getTime();
        var advInterval = 24;


        if((localStorage && !localStorage.isKinoafishaVideoAdv) || ((curTime - parseFloat(localStorage.isKinoafishaVideoAdv))/1000/60/60 > advInterval)){
            localStorage.isKinoafishaVideoAdv = curTime;
            var data = {};
            data.advVideo = 'https://video.kinoafisha.info/branding/kinoafisha/kinoafisha-youtube3.' + this.format;
            data.advLink = 'https://www.youtube.com/channel/UCNuQyDGBj28VwMRhCy_hTOw';
            this._reloadData(data);
        }
        else this.afterEnd();
    }

    del(){
        this.video.onloadedmetadata = function(){};
        this.video.innerHTML = '';
        this.video.setAttribute('src', '');
        this.insert.innerHTML = '';
    }
}





