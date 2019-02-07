
export default class{
	constructor(oUPlayer, data){
		console.log('AdvPlayer', data);
		this._createElements(oUPlayer, data);
        this._insertVideoTag();
		this._addEventsName();
		this._addEvents();
	}

    _getHtml(data){
		/* in theory links may not be */
		var clickingBtn = '<a data-js="adv-clicking-btn" class="advPlayer_link" target="_blank">&nbsp;</a>';
        return  '<div data-js="adv-player" class="advPlayer">' + clickingBtn + '<div class="advPlayer_controls">' + '<div class="advPlayer_controlsCell">' + '<span class="advPlayer_param">Реклама.</span> <span data-js="adv-left" class="advPlayer_param">&nbsp;</span>' + '</div>' + '<div class="advPlayer_controlsCell">' + '<a data-js="adv-skip-btn" class="advPlayer_param" href="#">&nbsp;</a>' + '</div>' + '</div>' + '<div class="advPlayer_before">' + '<div class="advPlayer_beforeContent">' + '<div class="advPlayer_beforeContentItem">Реклама</div>' + '</div>' + '</div>' + '<div class="advPlayer_preloader"></div>' + '</div>';
    }

	_createElements(oUPlayer, data){
        this.oUPlayer = oUPlayer;
        this.data = data;
        this.insert = oUPlayer.wrapper.querySelector('[data-CombinedPlayer-insert="adv"]');
        this.insert.innerHTML = this._getHtml(data);
        this.wrapper = this.insert.firstChild;
        this.param = JSON.parse(oUPlayer.wrapper.getAttribute('data-param'));
		this.video = oUPlayer.initVideo;
		this.clickingBtn = data.clickThrough ? this.wrapper.querySelector('[data-js="adv-clicking-btn"]') : undefined;
		this.skipBtn = this.wrapper.querySelector('[data-js="adv-skip-btn"]');
		this.advLeft = this.wrapper.querySelector('[data-js="adv-left"]');
		this.format = 'mp4';
		this.userAgent = this._defineUserAgent();
        this.keyFrameAll = []; //массив времени в %  когда отпраляется стата - 0% 25% 50% 75% 100%
        this.statEventAll = {}; //все типы событий по которым отправляется стата, ключ - src
	}

    _insertVideoTag() {
        this.video.removeAttribute('style');
        this.video.className = 'advPlayer_video';
        this.wrapper.insertBefore(this.video, this.wrapper.firstElementChild);
    };

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

		if(this.clickingBtn){
            this.clickingBtn.onclick = function(){
                self._clicking.call(self);
            }
		}
	}

	_skip(){
		if(this.skipBtn && this.skipBtn.innerHTML !== 'Пропустить') return false;

		this.wrapper.className = this.wrapper.className.replace(/\s*advPlayer-active/, '');
		this.video.pause();
		this.afterSkip();
	}

	_clicking(){
        console.log('ads clicking');
        //this.wrapper.className = this.wrapper.className.replace(/\s*advPlayer-active/, '');
		//this.video.pause();
		//this.afterClicking();
	}

	_endCallback(){
		this.wrapper.className = this.wrapper.className.replace(/\s*advPlayer-active/, '');
		this.afterEnd(); //определяется в основном плеере
	}

	_reloadData(data){
        var source = document.createElement('SOURCE');

        //
        if(this.clickingBtn) this.clickingBtn.setAttribute('href', data.clickThrough);
		this.video.innerHTML = '';
		source.setAttribute('src', data.mediaFile);
		source.setAttribute('type', 'video/' + this.format);
		this.video.appendChild(source);
		this.video.load();
	}

	_updateTimeCur(sec){
		var dur = this.video.duration,
			offset = this.data.skipoffset,
			leftTime = Math.floor(dur - sec),
			text = leftTime ? ('Осталось ' + leftTime + 'сек') : '&nbsp;',
            skipTime = Math.round(offset - sec);

		this.advLeft.innerHTML = text;

		if(this.skipBtn && this.skipBtn.innerHTML != 'Пропустить'){
			if(offset >= dur){
                this.skipBtn.style.display = 'none';
                this.skipBtn = undefined; /* TODO - удалить по уму */
			} else {
                if(skipTime > 0 && this.userAgent !== 'iphone') this.skipBtn.innerHTML = 'Пропустить через ' + skipTime; //В айфоне всегда можно закрыть
                else this.skipBtn.innerHTML = 'Пропустить';
			}
		}

        this._checkStat();
	}

    _checkStat(){/* делаем по аналогии с флеш-плеером, где даже при перемотке статистика считается */
        if(!this.data.keyFrameAll.length) return false;

        var persent = Math.round(this.video.currentTime/this.video.duration*100);
        if((this.data.keyFrameAll[0] === persent) || (this.data.keyFrameAll[0] < persent)){
            this._sendStat(this.data.keyFrameAll[0]+'');

			this.data.keyFrameAll.shift();
            this._checkStat();
        }
    }

    _sendStat(name){
        var arr;
        if(arr = this.data.statEventAll[name]){
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

		this.wrapper.className = 'advPlayer advPlayer-ready advPlayer-active'; /* TODO */
		this.video.play();

        //this.video.muted = false;
	}

	start(data){ /* TODO сейчас данные никакие не передаются, а сохраняются при инициализции плеера. Пока не знаю как лучше будет */
		var self = this;
        this.wrapper.className = 'advPlayer advPlayer-active  advPlayer-waiting';
        self._reloadData.call(self, self.data);

		/* оправляем статистику начала проигрывания */
		var impressionAll = this.data.impressionAll;
		for(var i=0,j=impressionAll.length; i<j; i++){
			var src = impressionAll[i];
			var image = document.createElement('IMG');

			//
			image.src = src;
			image.style.cssText = 'visibility:hidden;position:absolute;left:-9999px;top:-9999px;display:block;width:1px;height:1px;overflow:hidden;';
			document.body.appendChild(image);
		}
    }

	abort(){
		if(this.video.paused) return;
		this.wrapper.className = this.wrapper.className.replace(/\s*advPlayer-active/, '');
		this.video.pause();
	}

    del(){
        this.video.onloadedmetadata = function(){};
        this.video.innerHTML = '';
        this.video.setAttribute('src', '');
        this.insert.innerHTML = '';
    }
}





