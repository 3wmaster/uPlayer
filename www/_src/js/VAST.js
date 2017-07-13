import {scriptonload} from '../js/scriptonload';

class VAST {
	constructor(param){
		this.param = param;
		this._createElements();
		this._add(this.param.path);
	}

	_createElements(){
		this.data = {}; /* все данные с тега */
		this.data.mediaFile = undefined; /* ссылка на mp4 файл */
		this.data.clickThrough = undefined; /* ссылка с видео */
		this.data.clickTrackingAll = []; /* статистика клика по видео */
		this.data.impressionAll = []; /* src статистика начала проигрывания */
		this.data.keyFrameAll = [0, 25, 50, 75, 100]; /* ключевые кадры в процентах */
		this.data.statEventAll = {};/* соотв им названия, например, при 50% - название midpoint итд */
		this.xhr = false; /* XMLHttpRequest */
	}

	_add(path){
		this._getAdTag(path, (adTag) => {
			if(!adTag){
				console.error('uPlayer', 'пустой тег (яндекс, например) или <nobanner></nobanner>');
				this.param.onError();
			}
			else {
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
					/* TODO - здесь будет проверяться VPAID */

					if(!this._pushMediaFile(adTag)){
						this.param.onError(); //медиафайл может не подходить (не мп4 VPAID итд)
					}
					else {
						this.data.clickThrough = videoClicksTag.querySelector('ClickThrough').childNodes[0].wholeText.replace(/^\s+/, '').replace(/\s+$/, '');
						this.param.onSuccess(this.data); /* все получено, всего хватает, можно запускать рекламу */
					}
				}
			}
		});
	}

	_pushCDATA(tags, key){
		tags.forEach((tag) => {
			var textNode = tag.childNodes[0];
			if(textNode) this.data[key].push(textNode.wholeText.replace(/^\s+/, '').replace(/\s+$/, ''));
		});
	}

	_pushTrackingEvents(tag){
		var TrackingAll = tag.getElementsByTagName('Tracking');

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
			}

			if(!this.data.statEventAll[name]) this.data.statEventAll[name] = [];
			this.data.statEventAll[name].push(src);
		}
	}

	_pushMediaFile(tag){
		var  mediaFilesTag = tag.querySelector('MediaFiles'),
			optimType = 'video/mp4',
			optimWidth = 640,
			optimFile = false,
			delta= false;


		if(!mediaFilesTag){
			console.error('uPlayer', 'mediaFilesTag is not define');
			return false;
		}

		mediaFilesTag.querySelectorAll('MediaFile').forEach((file) => {
			var type = file.getAttribute('type'),
				w = file.getAttribute('width');

			if(type == optimType){
				var newDelta = Math.abs(w-optimWidth);

				if(!optimFile || (newDelta < delta)){
					optimFile = file;
					delta = newDelta;
				}
			}
		});

		if(optimFile) {
			this.data.mediaFile = optimFile.childNodes[0].wholeText.replace(/^\s+/, '').replace(/\s+$/, '');
			return true;
		}
		else{
			return false;
		}
	}

	_getAdTag(path, callback){
		path = path + '&rnd=' + new Date().getTime();
		console.log('uPlayer',  'loading vast tag ' + path);
		/* TODO почему то не работает */
		//if(this.xhr) return; /* на всякий */
		this.xhr = new XMLHttpRequest();
//		this.xhr.withCredentials = true; /* это для теста */
		this.xhr.open("GET", path, true);
		this.xhr.onload = () => {
			//console.log('uPlayer vast tag onload', this.xhr.responseText);
			var parser = new DOMParser (),
				xmlDoc = parser.parseFromString (this.xhr.responseText, "text/xml"),
				adTag = xmlDoc.querySelector('Ad');
			//
			callback(adTag);
			//this.xhr = false;
		}
		this.xhr.timeout = 3000;
		this.xhr.ontimeout = () => {
			this.xhr.abort();
			//this.xhr = false;
			console.log('uPlayer', 'VAST tag грузится более 3 секунд');
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
}
export {VAST}



