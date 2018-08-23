class VASTTag {
	constructor(param){
		this.param = param;
		this._createElements();
		this._add(this.param.path);
	}

	_createElements(){
		this.data = {}; /* все данные с тега */
		this.data.mediaFile = undefined; /* ссылка на медиа файл */
		this.data.clickThrough = undefined; /* ссылка с видео */
		this.data.clickTrackingAll = []; /* статистика клика по видео */
		this.data.impressionAll = []; /* src статистика начала проигрывания */
		this.data.keyFrameAll = [0, 25, 50, 75, 100]; /* ключевые кадры в процентах */
		this.data.statEventAll = {};/* соотв им названия, например, при 50% - название midpoint итд + все остальные */
		this.xhr = false; /* XMLHttpRequest */
	}

	_add(path){
		if(!path){
			console.error('uPlayer', 'тег отсутствует');
			this.param.onError();
			return;
		}

		this._getAdTag(path, (adTag) => {
			/* TODO может быть несколько креативов 'Creative' итд В общем сделать нормальный разбор */

			if(!adTag){
				console.error('uPlayer', 'пустой тег или <nobanner></nobanner>');
				this.param.onError();
			} else {
				/* может быть как в WrapperAd так и в прямой рекламе */
				var videoClicksTag = adTag.querySelector('VideoClicks'),
					clickTrackingAll = videoClicksTag ? videoClicksTag.querySelectorAll('ClickTracking') : null,
					impressionAll = adTag.querySelectorAll('Impression'),
					trackingEventsTag = adTag.querySelector('TrackingEvents');


				//
				if(clickTrackingAll) this._pushCDATA(clickTrackingAll, 'clickTrackingAll');
				if(impressionAll.length) this._pushCDATA(impressionAll, 'impressionAll');
				if(trackingEventsTag) this._pushTrackingEvents(trackingEventsTag);

				// WrapperAd или нет
				if(adTag.firstElementChild.nodeName === 'Wrapper'){
					var path = this._getAdURI(adTag);
					this._add(path);
				}
				else {
					var advFile = this._getAdvFile(adTag);

					if(!advFile){
						console.error('uPlayer', 'Не найдено нужного формата -  mp4 или VPAID');
						this.param.onError();
					}
					else {
						this.data.mediaFile = advFile.file;
						if(advFile.type == 'mp4'){
							this.data.skipoffset = this._getSkipoffset(adTag);
							this.data.clickThrough = videoClicksTag.querySelector('ClickThrough').childNodes[0].wholeText.replace(/^\s+/, '').replace(/\s+$/, '');
							this.param.onVast(this.data); /* все получено, всего хватает, можно запускать рекламу mp4 */
						}
						else {
							var AdParameters = adTag.querySelector('AdParameters');
							this.data.AdParameters = AdParameters ? AdParameters.childNodes[0].wholeText.replace(/^\s+/, '').replace(/\s+$/, '') : '';
							this.param.onVpaid(this.data); /* все получено, всего хватает, можно запускать рекламу VPAID */
						}
					}
				}
			}
		});
	}

	_pushCDATA(tags, key){
		var self = this;
		Array.prototype.forEach.call (tags, function (tag) {
			var textNode = tag.childNodes[0];
			if(textNode) self.data[key].push(textNode.wholeText.replace(/^\s+/, '').replace(/\s+$/, ''));
		});
	}

	_pushTrackingEvents(tag){
		var TrackingEvents = tag.querySelector('TrackingEvents'),
			TrackingAll = tag.querySelectorAll('Tracking');

		//
		for(var i=0,j=TrackingAll.length; i<j; i++){
			var name = TrackingAll[i].getAttribute('event'),
				src = TrackingAll[i].childNodes[0].wholeText.replace(/^\s+/, '').replace(/\s+$/, '');
			//
			switch(name){
				case 'start' : name = '0'; break;
				case 'firstQuartile' : name = '25'; break;
				case 'midpoint' : name = '50'; break;
				case 'thirdQuartile' : name = '75'; break;
				case 'complete' : name = '100'; break;
				default : name = name;
			}

			if(!this.data.statEventAll[name]) this.data.statEventAll[name] = [];
			this.data.statEventAll[name].push(src);
		}
	}

	_getAdvFile(tag){
		var mediaFilesTag = tag.querySelector('MediaFiles'),
			optimWidth = 640,
			optimFile = false,
			delta= false,
			mediaFile = false;

		if(!mediaFilesTag){
			console.error('uPlayer', 'mediaFilesTag не найден');
			return false;
		}

		Array.prototype.forEach.call(mediaFilesTag.querySelectorAll('MediaFile'), (file) => {
			var type = file.getAttribute('type'),
			apiFramework,
			newDelta,
			w;

			if((type === 'application/javascript') && (file.getAttribute('apiFramework') === 'VPAID')){
				mediaFile = {};
				mediaFile.type = 'VPAID';
				mediaFile.file = file.childNodes[0].wholeText.replace(/^\s+/, '').replace(/\s+$/, '');

				return;
			}
			else if (type === 'video/mp4') {
				w = file.getAttribute('width');
				newDelta = Math.abs(w-optimWidth);

				if(!optimFile || (newDelta < delta)){
					optimFile = file;
					delta = newDelta;
				}
			}
		});

		if(optimFile) {
			mediaFile = {};
			mediaFile.type = 'mp4';
			mediaFile.file = optimFile.childNodes[0].wholeText.replace(/^\s+/, '').replace(/\s+$/, '');
		}

		if(mediaFile) return mediaFile;
		else return false;
	}

	_getAdTag(path, callback){
		console.log('get ad tag');
		/* TODO почему то не работает */
		//if(this.xhr) return; /* на всякий */
		this.xhr = new XMLHttpRequest();
		this.xhr.withCredentials = true;
		this.xhr.open("GET", path, true);
		this.xhr.onload = () => {
			console.log('uPlayer', 'Рекламный тег загружен. Смотрим содержимое...');
			var parser = new DOMParser (),
				xmlDoc = parser.parseFromString (this.xhr.responseText, "text/xml"),
				adTag = xmlDoc.querySelector('Ad');
			//
			callback(adTag);
			//this.xhr = false;
		}
		this.xhr.timeout = 5000;
		this.xhr.ontimeout = () => {
			this.xhr.abort();
			//this.xhr = false;
			console.log('uPlayer', 'Рекламный тег грузится более 5 секунд');
			this.param.onError();
		}
		this.xhr.onerror = () => { /* например, блокировщик рекламы */
			//this.xhr = false;
			this.param.onError();
		}
		this.xhr.send(null);
	}

	_getAdURI(tag){
		return tag.querySelector('VASTAdTagURI').childNodes[0].wholeText.replace(/^\s+/, '').replace(/\s+$/, '');
	}

	_getSkipoffset(tag){
		var skipoffset = tag.querySelector('Linear').getAttribute('skipoffset');
		if(!skipoffset) return 5;

		//
		if(skipoffset.indexOf('%') === -1){
			var arr = skipoffset.split(':');
			var seconds = arr[0] * 60 * 60 + arr[1] * 60 + arr[2]*1;
			return seconds;
		} else {
			/* TODO % */
			return 5;
		}
	}
}
export {VASTTag}



