import Meter from '../js/Meter';

export default class{
	constructor(oUPlayer, HTMLDataApi){
		this._createElements(oUPlayer, HTMLDataApi);
		this._resetStat();
		this._addEventsName();

		if(!this._defineTech()) {
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

    _getHtml(data){

        var LQ = data.files.low ? data.files.low.path.replace(/\.mp4$/, '') : false;
        var HQ = data.files.high ? data.files.high.path.replace(/\.mp4$/, '') : false;
        var quality = '"LQ": "' + LQ + '"' + (HQ ? (', "HQ": "' + HQ + '"') : '');

        return  '<div data-js="html-player" data-quality=\'{'+ quality +'}\' class="htmlPlayer">'+
            '<video data-js="video" preload="metadata" class="htmlPlayer_video" controls="controls" poster="'+ data.poster +'" webkit-playsinline>'+
            '<source src="'+ data.files.low.path +'" type="video/mp4" />'+
            '<a class="htmlPlayer_altVideo" href="'+ data.files.low.path +'"  style="background-image:url('+ data.poster +')">'+
            '<img class="htmlPlayer_altVideoPoster" src="'+ data.poster +'" alt="" />'+
            '<img class="htmlPlayer_altVideoBtn" src="https://video.kinoafisha.info/i/player/play-btn.png" alt="" />'+
            '</a>'+
            '</video>'+
            '<div data-js="toggle" class="htmlPlayer_toggle">'+
            '<img class="htmlPlayer_bigPauseBtn" src="https://video.kinoafisha.info/i/player/pause-btn.png" alt="" />'+
            '</div>'+
            '<div data-js="footer" class="htmlPlayer_footer">'+
            '<div data-js="controls" class="htmlPlayer_controls">'+
            '<div class="htmlPlayer_controlsCell htmlPlayer_controlsCell-shrink">'+
            '<div class="htmlPlayer_playback htmlPlayer_controlsBtn">'+
            '<img data-js="play"  class="htmlPlayer_playBtn" src="https://video.kinoafisha.info/i/player/play.png" alt="" />'+
            '<img data-js="pause"  class="htmlPlayer_pauseBtn" src="https://video.kinoafisha.info/i/player/pause.png" alt="" />'+
            '</div>'+
            '<div class="htmlPlayer_time">'+
            '<span data-js="timeCur" class="htmlPlayer_timeCur"></span>'+
            '<span class="htmlPlayer_timeSep">/</span>'+
            '<span data-js="timeDur" class="htmlPlayer_timeDur"></span>'+
            '</div>'+
            '</div>'+

            '<div class="htmlPlayer_controlsCell">'+
            '<div data-js="rewind" data-meter = \'{}\'  class="playerMeter  htmlPlayer_controlsBtn">'+
            '<div class="playerMeter-strip"></div>'+
            '<div data-js="buffered" class="playerMeter-buffered"></div>'+
            '<div data-js="progress" class="playerMeter-progress"></div>'+
            '<div data-js="slider" class="playerMeter-slider"></div>'+
            '</div>'+
            '</div>'+

            '<div class="htmlPlayer_controlsCell  htmlPlayer_controlsCell-shrink">'+
            '<span data-js="quality" class="htmlPlayer_qualityBtn htmlPlayer_controlsBtn">hq</span>'+

            '<div data-js="mute" class="htmlPlayer_mute htmlPlayer_controlsBtn">'+
            '<img  data-js="mute-on" data-js="mute-on"  class="htmlPlayer_muteOn" src="https://video.kinoafisha.info/i/player/mute-on.png" alt="" />'+
            '<img  data-js="mute-off" data-js="mute-off"  class="htmlPlayer_muteOff" src="https://video.kinoafisha.info/i/player/mute-off.png" alt="" />'+
            '</div>'+

            '<div data-js="volume" data-meter = \'{"value": 1}\'  class="playerMeter playerMeter_volume htmlPlayer_controlsBtn">'+
            '<div class="playerMeter-strip"></div>'+
            '<div data-js="progress" class="playerMeter-progress"></div>'+
            '<div data-js="slider" class="playerMeter-slider"></div>'+
            '</div>'+

            '<div data-js="fullscreen" class="htmlPlayer_fullscreen htmlPlayer_controlsBtn"> '+
            '<img data-js="fullscreen-request"  class="htmlPlayer_fullscreenRequest" src="https://video.kinoafisha.info/i/player/fullscreen-request.png" alt="" />'+
            '<img data-js="fullscreen-exit"  class="htmlPlayer_fullscreenExit" src="https://video.kinoafisha.info/i/player/fullscreen-exit.png" alt="" />'+
            '</div>'+

            '<div data-js="share-btn" class="htmlPlayer_shareBtn htmlPlayer_controlsBtn">&lt;/&gt;</div>'+

            '</div>'+
            '</div>'+
            '<div data-js="share" class="htmlPlayer_share">'+
            '<div class="htmlPlayer_shareItem">'+
            '<div class="htmlPlayer_shareCell htmlPlayer_shareCell-title">'+
            'Ссылка на ролик'+
            '</div>'+
            '<div class="htmlPlayer_shareCell">'+
            '<input readonly class="htmlPlayer_shareField htmlPlayer_shareField-insert" type="text" value="'+ data.trailer_url +'" />'+
            '</div>'+
            '<div class="htmlPlayer_shareCell htmlPlayer_shareCell-shrink">'+
            '&nbsp;'+
            '</div>'+
            '</div>'+
            '<div class="htmlPlayer_shareItem">'+
            '<div class="htmlPlayer_shareCell htmlPlayer_shareCell-title">'+
            'Код для вставки'+
            '</div>'+
            '<div class="htmlPlayer_shareCell htmlPlayer_shareCell-shrink">'+
            '<span class="htmlPlayer_shareNote">ширина</span>'+
            '<input data-js="embed-width" class="htmlPlayer_shareField htmlPlayer_shareField-size" type="text" value="640" />'+
            '<span class="htmlPlayer_shareNote">высота</span>'+
            '<input data-js="embed-height" class="htmlPlayer_shareField htmlPlayer_shareField-size" type="text" value="360" />'+
            '</div>'+
            '<div class="htmlPlayer_shareCell">'+
            '<input data-js="embed" readonly class="htmlPlayer_shareField htmlPlayer_shareField-insert" type="text" value=\''+ data.embed_url +'\' />'+
            '</div>'+
            '<div class="htmlPlayer_shareCell htmlPlayer_shareCell-shrink">'+
            '&nbsp;'+
            '</div>'+
            '</div>'+
            '</div>'+
            '</div>'+
            '<img  class="htmlPlayer_logo" src="https://video.kinoafisha.info/i/player/logo.png" alt="" />'+
            '<div data-js="poster" class="htmlPlayer_poster" style="background-image:url('+ data.poster +')">'+
            '<div class="htmlPlayer_posterInfo">'+
            '<span class="htmlPlayer_posterCat">'+ data.title +'</span>'+
            '<span class="htmlPlayer_posterName">'+ data.movie_name +'</span>'+
            '</div>'+
            '<img  class="htmlPlayer_posterBtn" src="https://video.kinoafisha.info/i/player/play-btn.png" alt="" />'+
            '</div>'+
            '<div class="htmlPlayer_preloader"></div>'+
            '</div>';
    }
	
	_createElements(oUPlayer, HTMLDataApi){
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
		this.playBtn =  this.controls.querySelector('[data-js="play"]');
		this.pauseBtn =  this.controls.querySelector('[data-js="pause"]');
		this.qualityBtn =  this.controls.querySelector('[data-js="quality"]');
		this.timeDur =  this.controls.querySelector('[data-js="timeDur"]');
		this.timeCur =  this.controls.querySelector('[data-js="timeCur"]');
		this.buffered = this.controls.querySelector('[data-js="buffered"]');
		this._onBuffered = function(event){
			try{
				var buffered = Math.floor(self.video.buffered.end(0) / self.video.duration*100);
				self.buffered.style.width = buffered + '%';
			} catch(e){};
		};
		this.toggle = this.wrapper.querySelector('[data-js="toggle"]');
		this.shareBtn =  this.controls.querySelector('[data-js="share-btn"]');//кнопка для показа/скрытия панели "Поделиться"
		this.share =  this.footer.querySelector('[data-js="share"]'); //Панель поделиться
		this.embedField = this.share.querySelector('[data-js="embed"]');
		this.embedWidthField = this.share.querySelector('[data-js="embed-width"]');
		this.embedHeightField = this.share.querySelector('[data-js="embed-height"]');
		this.embedTemplate = this.embedField.value;
		this.embedWidth = 640; // ширина по умолчанию для кода ифрейма
		this.aspectRatio = .5625; //если не удается определить размер видео, по умолчанию используется соотношение сторон 16/9
		this.controlsDur=3000;
		this.format;
		this.quality;
		this.dataQuality = JSON.parse(this.wrapper.getAttribute('data-quality'));
		this.isCanPlay = true; //можем проигрывать или нет. Если нет - будет грузиться флеш
		this.keyFrameAll; //массив времени в %  когда отпраляется стата - 0% 50% 90% 100%
        this.isAutoPlay = true; //теперь постер отдельно и при вызове объекта сразу начинаем проигрывание
	}

	_resetStat(){
		this.keyFrameAll =[0, 50, 90, 100];
	}

	_checkStat(){/* делаем по аналогии с флеш-плеером, где даже при перемотке статистика считается */
		if(!this.keyFrameAll.length) return false;

		var persent = Math.round(this.video.currentTime/this.video.duration*100);
		if((this.keyFrameAll[0] === persent) || (this.keyFrameAll[0] < persent)){
			this._sendStat(this.keyFrameAll[0]);
			this.keyFrameAll.shift();
			this._checkStat();
		}
	}

	_sendStat(persent){
		var image = document.createElement('IMG'),
            path = window.location.hostname.indexOf('kinoafishaspb.ru') === -1 ? 'kinoafisha.info' : 'kinoafishaspb.ru';
		image.src = 'https://api.'+ path +'/player/stat/?trailer_id=' + this.paramPlayer.trailer_id + '&host=' + this.paramPlayer.host + '&mobile=' + uPlayer.isMobile + '&percent=' + persent;
		image.style.cssText = 'visibility:hidden;position:absolute;left:-9999px;top:-9999px;display:block;width:1px;height:1px;overflow:hidden;';
		document.body.appendChild(image);
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

	_defineFormat(){
		if (!this.video.canPlayType) this.format = false;
		else if ( this.video.canPlayType('video/mp4') ) this.format = 'mp4';
		else this.format = false;

		if(this.format) return true;
		else return false;
	}

	_defineTech(){
		if(!document.addEventListener || !this._defineFormat()) return false;
		else return true;
	}

	_resetNativeVideo () {
		this.video.removeAttribute('controls');
		this.video.removeAttribute('poster');
		this.video.innerHTML = '';
	}

	_initPoster () {
		var self = this;

		this.poster.onclick = function(event){
            self.isAutoPlay = true;
            self._ready.call(self);
		}
		this.poster.onmousemove = function(event){
			event = event || window.event;
			event.stopPropagation ? event.stopPropagation() : (event.cancelBubble=true);
		}
	}

	_initMute(){
		this.mute = this.controls.querySelector('[data-js="mute"]');
		this.muteOn = this.mute.querySelector('[data-js="mute-on"]');
		this.muteOff = this.mute.querySelector('[data-js="mute-off"]');

		var self = this;
		this.muteOn.onclick = function(){
			self.video.muted = true;
			localStorage.videoMuted = 'on';
		}
		this.muteOff.onclick = function(){
			self.video.muted = false;
			localStorage.videoMuted = 'off';
		}

		this.video.onvolumechange = function(){
			self.mute.className = self.video.muted === true ? (self.mute.className.replace(/\s*htmlPlayer_mute_off/, '') + ' htmlPlayer_mute_off') : self.mute.className.replace(/\s*htmlPlayer_mute_off/, '');
		}

		if (localStorage.videoMuted === 'on') self.video.muted = true;
		else self.video.muted = false;

		this.video.onvolumechange();

	}

	_initVolume(){
		var el = this.controls.querySelector('[data-js="volume"]');
		var self = this;

		if (localStorage.videoVolume !== undefined)  {
			el.setAttribute('data-meter', '{"value": '+ localStorage.videoVolume +'}' );
			self.video.volume = localStorage.videoVolume;
		}

		var volume = new Meter(el);
		volume.callback = function(status, value){
			self.video.volume = value;
			if (status === 'up') localStorage.videoVolume = value;
		}
	}

	_initRewind(){
		var el, self;

		el = this.controls.querySelector('[data-js="rewind"]');
		self = this;

		this.rewind = new Meter(el);
		this.rewind.callback = function(status, value){
			if (status === 'down') {
				self.isRewind = self.video.paused === true ? 'paused' : 'playing';
				self.video.pause();
				self.video.currentTime = value;
			}
			else if (status === 'move') {
				self.video.currentTime = value;
			}
			else if (status === 'up') {
				self.video.currentTime = value;
				if(self.isRewind === 'playing') {
					self.video.play();
				}
				self.isRewind =false;
			}
		}
	}

	_initBuffered(){
		this.video.addEventListener("progress", this._onBuffered, false);
	}

	_initEmbed(){
		var self = this;

		this.embedTemplate = this.embedTemplate.replace(/\|LEFT\|/g, '<').replace(/\|RIGHT\|/g, '>');

		this.embedWidthField.onkeyup = function(){
			var w = parseInt(this.value) || 0;
			self._changeEmbed.call(self, w, w * self.aspectRatio);
		}
		this.embedHeightField.onkeyup = function(){
			var h = parseInt(this.value) || 0;
			self._changeEmbed.call(self, h / self.aspectRatio, h);
		}
	}

	_changeEmbed(w, h){
		var w = parseInt(w) || '',
			h = parseInt(h) || '';

		this.embedWidthField.value = w;
		this.embedHeightField.value = h;
		this.embedField.value = this.embedTemplate.replace(/width_height/, 'width="' + w + '" height="' + h + '"');
	}

	_addEvents(){
		var self = this;
		this.playBtn.onclick = function(){
			self.video.play();
		}
		this.pauseBtn.onclick = function(){
			self.video.pause();
		}
		this.video.onloadedmetadata = function (event){
			self._reloadTime.call(self);
			self._reloadRewind.call(self);
			self._reloadBuffered.call(self);
			self._reloadAspectRatio.call(self);
			self._reloadEmbed.call(self);
			self._ready.call(self);
		}
		this.video.onpause = function (){
			if (!self.isRewind) self._pauseCallback.call(self);
		}
		this.video.onplaying = function (){
			self._playingCallback.call(self);
		}
		this.video.onended = function(){
			if (!self.isRewind) {
				self._endCallback.call(self);
			}
		}
		this.video.ontimeupdate = function (){
			self._timeupdateCallback.call(self);
		}
		this.video.onwaiting = function(){
			console.log('waiting');
		}
	}

	_addToggle(){
		var self = this;

        this.toggle['on'+this.eNames.down] = function(e){
            self._toggle.call(self, e);
        }
	}

	_addFooterPanel(){
		var self = this;
		this.wrapper['on'+this.eNames.enter] = function(){self._showControlsAtTime.call(self);}
		this.wrapper['on'+this.eNames.leave] = function(){self._hideControlsAtTime.call(self);}
		this.wrapper['on'+this.eNames.move] = function(){self._showControlsAtTime.call(self);}
		this.footer['on'+this.eNames.enter] = function(){
			self.wrapper['on'+self.eNames.enter] = function(){}
			self.wrapper['on'+self.eNames.move] = function(){}
			self._showControls.call(self);
		}
		this.footer['on'+this.eNames.leave] = function(){
			self.wrapper['on'+self.eNames.enter] = function(){self._showControlsAtTime.call(self);}
			self.wrapper['on'+self.eNames.move] = function(){self._showControlsAtTime.call(self);}
		}
	}

	_toggle(e){
        /* на точах не будет паузы при нажатии, потому что будет показываться навигация  */
        if(e.type === 'mousedown' || (e.pointerType && e.pointerType === 'mouse')){
            this.video.paused ? this.video.play() : this.video.pause();
        }
	}

	_playingCallback(){
		this.wrapper.className =  this.wrapper.className.replace(/\s*(htmlPlayer-pause|htmlPlayer-playing)/g, '') + ' htmlPlayer-playing';
	}

	_pauseCallback(){
		this.wrapper.className =  this.wrapper.className.replace(/\s*(htmlPlayer-pause|htmlPlayer-playing)/g, '') + ' htmlPlayer-pause';
	}

	_endCallback(){
		this.wrapper.className =  this.wrapper.className.replace(/\s*(htmlPlayer-pause|htmlPlayer-playing)/g, '');
        this.afterEnd(); //определяется в основном плеере
	}

	_timeupdateCallback(){
		this._updateTimeCur(this.video.currentTime);
		if (!this.isRewind){
			this.rewind.update({value: this.video.currentTime, max:this.video.duration});
			this._checkStat();
		}
	}

	_showControls(){
		this._clearControlsAtTime();
		this.wrapper.className =  this.wrapper.className.replace(/\s*htmlPlayer-footer/, '') + ' htmlPlayer-footer';
	}

	_showControlsAtTime(){
		var self = this;
		this._clearControlsAtTime();
		this._showControls();
		this._hideControlsAtTime();
	}

	_clearControlsAtTime(){
		try{clearTimeout(this.clearControls)} catch(e) {}
	}

	_hideControls(){
		this._clearControlsAtTime();
		this.wrapper.className =  this.wrapper.className.replace(/\s*htmlPlayer-(footer|share)/g, '');
	}

	_hideControlsAtTime(){
		var self = this;
		this._clearControlsAtTime();
		this.clearControls = setTimeout(function(){
			self._hideControls.call(self);
		}, this.controlsDur);
	}

	_getQuality(){
		if (Object.keys(this.dataQuality).length > 1) {
			if(localStorage.videoQuality && this.dataQuality[localStorage.videoQuality]) this.quality = localStorage.videoQuality;
			else if (this.dataQuality.HQ && screen.height > 1079) this.quality = 'HQ';
			else this.quality = 'LQ';
		}
		else this.quality = 'LQ';
	}

	_addQuality(){
		if (Object.keys(this.dataQuality).length > 1) {
			var self = this;

			this.qualityBtn.className = this.qualityBtn.className + ' htmlPlayer_qualityBtn-' + this.quality;

			this.qualityBtn.onclick = function(){
				self._changeQuality.call(self);
			}
		}
		else this.qualityBtn.style.display = 'none';
	}

	_changeQuality(){
		var cls = this.qualityBtn.className.replace( ' htmlPlayer_qualityBtn-' + this.quality, '');
		this.quality = this.quality === 'HQ' ? 'LQ' : 'HQ';
		localStorage.videoQuality = this.quality;
		this.qualityBtn.className = cls + ' htmlPlayer_qualityBtn-' + this.quality;
		this.isAutoPlay = true;
		this._reloadVideo();
	}

	_addFullscreen(){
		this.fullscreen =  this.controls.querySelector('[data-js="fullscreen"]');
		this.fullscreenRequest =  this.fullscreen.querySelector('[data-js="fullscreen-request"]');
		this.fullscreenExit =  this.fullscreen.querySelector('[data-js="fullscreen-exit"]');

		var enabledName = function (doc){
			if('fullscreenEnabled' in doc) return 'fullscreenEnabled';
			if('mozFullScreenEnabled' in doc) return 'mozFullScreenEnabled';
			if('webkitFullscreenEnabled' in doc) return 'webkitFullscreenEnabled';
			if('msFullscreenEnabled' in doc) return 'msFullscreenEnabled';
			return false;
		}(document);

		if(!enabledName){
			this.fullscreen.style.display = 'none';
			return false;
		}

		var self = this;

		var eName = function (doc){
			if('onfullscreenchange' in doc) return 'fullscreenchange';
			if('onmozfullscreenchange' in doc) return 'mozfullscreenchange';
			if('onwebkitfullscreenchange' in doc) return 'webkitfullscreenchange';
			if('onmsfullscreenchange' in doc) return 'msfullscreenchange'; //MSFullscreenChange
			return false;
		}(document);

		var fullscreenElement = function (doc){
			if('fullscreenElement' in doc) return 'fullscreenElement';
			if('mozFullScreenElement' in doc) return 'mozFullScreenElement';
			if('webkitFullscreenElement' in doc) return 'webkitFullscreenElement';
			if('msFullscreenElement' in doc) return 'msFullscreenElement';
			return false;
		}(document);

		var request = function (el){
			if(el.requestFullscreen) return 'requestFullscreen';
			if(el.mozRequestFullScreen) return 'mozRequestFullScreen';
			if(el.webkitRequestFullscreen) return 'webkitRequestFullscreen';
			if(el.msRequestFullscreen) return 'msRequestFullscreen';
			return false;
		}(this.wrapper);

		var exit = function (){
			if(document.exitFullscreen) return 'exitFullscreen';
			else if(document.mozCancelFullScreen) return 'mozCancelFullScreen';
			else if(document.webkitCancelFullScreen) return 'webkitCancelFullScreen';
			else if(document.msExitFullscreen) return 'msExitFullscreen';
			return false;
		}();

		document['on' + eName] = function (event){
			event.preventDefault();
			if(document[fullscreenElement]) self._showFullscreen.call(self);
			else self._hideFullscreen.call(self);
		}

		this.fullscreenRequest.onclick = function(){
			if(request) {
				self.wrapper[request]();
			}
			else alert('К сожалению, ваш браузер не поддерживает фуллскрин');
		}

		this.fullscreenExit.onclick = function(){
			if(exit) {
				document[exit]();
			}
			else alert('Нажмите кнопку ESC для выхода из полноэкранного режима');
		}
	}

	_showFullscreen(){
		var self = this;
		this.wrapper.className = this.wrapper.className.replace(/\s*htmlPlayer-fullscreen/, '') + ' htmlPlayer-fullscreen';
	}

	_hideFullscreen(){
		this.wrapper.className = this.wrapper.className.replace(/\s*htmlPlayer-fullscreen/, '');
	}

	_addSharePanel(){
		var self = this;

		this.shareBtn.onclick = function(){
			if(self.wrapper.className.indexOf('htmlPlayer-share') !== -1) {
				self.wrapper.className = self.wrapper.className.replace(/\s*htmlPlayer-share/, '');
			}
			else self.wrapper.className = self.wrapper.className + ' htmlPlayer-share';
		};
	}

	_reloadVideo(){
		this.wrapper.className = this.wrapper.className.replace(/\s*htmlPlayer-(ready|poster|playing|pause)/g, '');

		this.video.innerHTML = '';
		var source = document.createElement('SOURCE');
		source.setAttribute('src', this.dataQuality[this.quality] + '.' + this.format);
		source.setAttribute('type', 'video/' + this.format);
		this.video.appendChild(source);
		this.video.load();
	}

	_reloadTime(){
		this._updateTimeDur(this.video.duration);
		this._updateTimeCur(0);
	}

	_reloadRewind(){
		this.rewind.update({"value": 0, "max": this.video.duration});
	}

	_reloadBuffered(){
		this.buffered.style.width = '0%';
	}

	_reloadAspectRatio(){
		if(this.video.videoWidth) this.aspectRatio = this.video.videoHeight/this.video.videoWidth;
		else this.aspectRatio = .5625;
		//this.wrapper.style.paddingTop = this.aspectRatio * 100 + '%';

		if(this.onsetSize){
			var box = this.wrapper.getBoundingClientRect();
			this.onsetSize({width:box.right-box.left, height: box.bottom-box.top})
		}
	}

	_reloadEmbed(){
		var h = this.embedWidth*this.aspectRatio;
		this._changeEmbed(this.embedWidth, h);
	}

	_updateTimeCur(sec){
		this.timeCur.innerHTML = this._convertTime(sec);
	}

	_updateTimeDur(sec){
		this.timeDur.innerHTML = this._convertTime(sec);
	}

	_convertTime (sec){
		function num(val){
			val = Math.floor(val);
			return val < 10 ? '0' + val : val;
		}

		var hours = num(sec / 3600  % 24),
			minutes = num(sec / 60 % 60),
			seconds = num(sec % 60);

		hours = hours === '00' ? '' : hours+':';
		return hours + minutes + ':' + seconds;

	}

	_ready(){/* нафиг теперь не нужно, нужно сразу запускать */
		var cls = this.wrapper.className.replace(/\s*htmlPlayer-(ready|poster|disabled)/g, '') + ' htmlPlayer-ready';

		if(this.isAutoPlay){
			this.isAutoPlay = false;
			this.paramPlayer.autoplay = false;

			this._showControlsAtTime();
			this.video.play();
		}
		this.wrapper.className = cls;
	}

	initialize(){
		this.video.innerHTML = '';
		this.video.load();
	}

	start(){
		this._reloadVideo();
	}

    abort(){
        if(this.video.paused) return;
        this.wrapper.className =  this.wrapper.className.replace(/\s*(htmlPlayer-pause|htmlPlayer-playing)/g, '');
        this.video.pause();
    }

    del(){
        this.video.onloadedmetadata = function(){};
        this.video.innerHTML = '';
        this.video.setAttribute('src', '');
        this.insert.innerHTML = '';
    }
}





