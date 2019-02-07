var VpaidPlayer =  class {
	constructor(oUPlayer, vast) {
		this._createElements(oUPlayer, vast);
        this._insertVideoTag();
        this._load();
	}

	_getHtml(){
        return '<div data-js="adv-player" class="advPlayer">' + '<div data-js="vpaid-slot" style="position:absolute;left:0;top:0;display:block;width:100%;height:100%;"></div>' + '</div>';
    }

	_createElements(oUPlayer, vast){
		this.oUPlayer = oUPlayer;
		this.vast = vast;
		this.insert = oUPlayer.wrapper.querySelector('[data-CombinedPlayer-insert="adv"]');
		this.insert.innerHTML = this._getHtml();
		this.wrapper =  this.insert.firstChild;
        this.video = oUPlayer.initVideo;
		this.slot = this.wrapper.querySelector('[data-js="vpaid-slot"]');
        this.vpaid = false;
        this.isAdClickThru = false; /* кликнул или нет пользователь по рекламе. Если кликнул - видео не производим */
		this.isFinish = false;
		this.isAdLoaded = false; /* AdError может сработать до AdLoaded TODO (может, сделать как то поинтереснее)  */
		this.isAdClickThru = false /* кликнул или нет пользователь по рекламе. Если кликнул - видео не производим */
	}

	_insertVideoTag(){
        this.video.removeAttribute('style');
        this.video.className = 'advPlayer_video';
        this.wrapper.insertBefore(this.video, this.slot);
	}

	_load(){
		this.loadScriptInIFrame(this.vast.mediaFile, (iframe) => {
			var rect = this.insert.getBoundingClientRect();

            if (!iframe.contentWindow.getVPAIDAd) {
                /* связано с загрузкой ифрейм и переменной inDapIF */
                console.error('iframe.contentWindow.getVPAIDAd отсутствует');
                _this.del();
                _this.oUPlayer._start();
                return;
            }

			this.vpaid = iframe.contentWindow.getVPAIDAd();

			this.vpaid.subscribe(() => {
				console.log("uPlayer: VPAID событие AdLoaded (реклама загружена)");
				this.isAdLoaded = true;
				this.oUPlayer._start();
				//vpaid.startAd();
			}, "AdLoaded");

			this.vpaid.subscribe(() => {
				console.log('uPlayer: VPAID событие AdStarted (реклама запущена)', this.vast.statEventAll.creativeView);
				this._sendStat(this.vast.statEventAll.creativeView, 'AdStarted');
			}, "AdStarted");

			this.vpaid.subscribe(() => {
				console.log("uPlayer: VPAID событие AdImpression (начало реального просмотра)");
				this._sendStat(this.vast.impressionAll, 'impression');
			}, "AdImpression");

			this.vpaid.subscribe(() => {
				console.log("uPlayer: VPAID событие AdVideoStart (старт рекламного видео)");
				this._sendStat(this.vast.statEventAll['0'], 'start');
			}, "AdVideoStart");

			this.vpaid.subscribe(() => {
				console.log("uPlayer: VPAID событие AdVideoFirstQuartile (просмотрена первая четверть)");
				this._sendStat(this.vast.statEventAll['25'], 'firstQuartile');
			}, "AdVideoFirstQuartile");

			this.vpaid.subscribe(() => {
				console.log("uPlayer: VPAID событие AdVideoMidpoint (просмотрена вторая четверть)");
				this._sendStat(this.vast.statEventAll['50'], 'midpoint');
			}, "AdVideoMidpoint");

			this.vpaid.subscribe(() => {
				console.log("uPlayer: VPAID событие AdVideoThirdQuartile (просмотрена третья четверть)");
				this._sendStat(this.vast.statEventAll['75'], 'thirdQuartile');
			}, "AdVideoThirdQuartile");

			this.vpaid.subscribe(() => {
				console.log("uPlayer: VPAID событие AdVideoComplete (просмотрена четвертая четверть)");
				this._sendStat(this.vast.statEventAll['100'], 'complete');
			}, "AdVideoComplete");

			this.vpaid.subscribe(() => {
				console.log("uPlayer: VPAID событие AdStopped (Показ рекламы окончен)");
				this._finish();
			}, "AdStopped");

			this.vpaid.subscribe((url, uid, playerHandles) => {
				console.log('uPlayer: VPAID событие AdClickThru (был осуществлён переход по рекламе)');
				this._sendStat(this.vast.clickTrackingAll, 'clickTracking');
				if(playerHandles){
					this.isAdClickThru = true;
					//this._finish(true);
					window.open(url);
				}
			}, "AdClickThru");

			this.vpaid.subscribe(() => {
				console.log("VPAID: Реклама пропущена пользователем (AdSkipped)");
				this._finish();
			}, "AdSkipped");

			this.vpaid.subscribe(() => {
				console.log("uPlayer: VPAID событие AdUserClose (реклама закрыта пользователем)");
				this._finish();
			}, "AdUserClose");

			this.vpaid.subscribe((data) => {
				console.log("uPlayer: VPAID событие AdError (Ошибка показа рекламы)");
				this._finish();
			}, "AdError");

			this.vpaid.initAd(rect.width, rect.height, "normal", 0, {
				AdParameters: this.vast.AdParameters
				}, {
				slot:this.slot,
				videoSlot: this.video,
				videoSlotCanAutoPlay: false //передавать true или false в зависимости от возможности программного автозапуска для данного элемента video
			});
		});
	}

	start(data){ /* TODO сейчас данные никакие не передаются, а сохраняются при инициализции плеера. Пока не знаю как лучше будет */
		var self = this;
        this.wrapper.className = 'advPlayer advPlayer-ready advPlayer-active'; /* TODO */
		this.vpaid.startAd();
	}

	_finish(){
        /* если пользователь щелкнул на рекламу - все останавливаем и дальше не продолжаем*/
        //может срабатывать несколько раз, например, сначала срабатывает AdSkipped, а затем при AdStopped для поддержки видеоплееров с использованием более ранней версии VPAID
        // TODO - мож покороче как нить..

        if (this.isFinish) return;
        this.isFinish = true;

        this.oUPlayer.isShowAdv = false; /* TODO ??  */

        console.log('this.isAdLoaded', this.isAdLoaded);

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
	}

	_sendStat(arr, name) {/* везде сделано по разному, нужно как здесь, наверное  */
		if (!arr) return;
		if (typeof arr == 'string') arr = [arr];

		for(var i=0,j=arr.length; i<j; i++){
			var src = arr[i];
			var image = document.createElement('IMG');

			//
			image.src = src;
			image.style.cssText = 'visibility:hidden;position:absolute;left:-9999px;top:-9999px;display:block;width:1px;height:1px;overflow:hidden;';
			image.setAttribute('data-stat', name); /* просто для инфо */
			document.body.appendChild(image);
		}
	}

	loadScriptInIFrame(url, success) {
		var iframe = document.createElement("iframe");
		iframe.style.top = "0";
		iframe.style.position = "absolute";
		iframe.style.width = "1px";
		iframe.style.height = "1px";
		iframe.style.left = "-90000px";

		iframe.onload = function()
		{
            //TODO wmg
            iframe.contentWindow.inDapIF = true;
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.onload = function() {
				success(iframe);
			};
			script.onerror = function() {
				console.log("uPlayer: ошибка загрузки VPAID скрипта)");
			};
			iframe.contentWindow.document.body.appendChild(script);
			script.src = url;
		}

		//iframe.src = "about:self";
		iframe.src = "about:blank";
		document.body.appendChild(iframe);
	}

	abort(){
		/*if(this.video.paused) return;
		this.wrapper.className = this.wrapper.className.replace(/\s*advPlayer-active/, '');
		this.video.pause();*/
	}

	del(){
		this.insert.innerHTML = '';
		this.oUPlayer.oVpaidPlayer = undefined;
	}
};

export {VpaidPlayer};