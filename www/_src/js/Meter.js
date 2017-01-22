export default class {
	constructor(wrapper) {
		this.console = document.getElementById('console');
		this._createElements(wrapper);
		this._addEventsName();
		this._updateData(JSON.parse(this.wrapper.getAttribute('data-meter')));
		this._addProgress('init', this._calculateRatioByValue());
		this._addEvents();
	}

	_createElements(wrapper){
		this.wrapper = wrapper;
		this.progress = this.wrapper.querySelector('[data-js="progress"]');
		this.slider = this.wrapper.querySelector('[data-js="slider"]');
		this.data = {min: 0, max: 1, value: 0}; //by default
	}

	_addEventsName(){
		this.eNames = {}
		if (window.navigator.pointerEnabled) this.eNames = {'down': 'pointerdown', 'move': 'pointermove', 'leave':'pointerleave', 'up': 'pointerup'};
		else if(window.navigator.msPointerEnabled) this.eNames = {'down': 'MSPointerDown', 'move': 'MSPointerMove', 'leave':'MSPointerLeave', 'up': 'MSPointerUp'};
		else if('ontouchstart' in document.documentElement) {
			this.eNames = {'down': 'touchstart', 'move': 'touchmove', 'leave':'touchend', 'up': 'touchend'};
		}
		else this.eNames = {'down': 'mousedown', 'move': 'mousemove', 'leave':'mouseleave', 'up': 'mouseup'};
	}

	_updateData(data){
		for(var key in this.data){
			this.data[key] = (data[key] === undefined ? this.data[key] : data[key]);
		}
		this.curValue = this.data.value;
		this.data.delta = this.data.max - this.data.min;

	}

	_addProgress(status, ratio){

		var per = ratio * 100 + '%';
		this.slider.style.left = per;
		this.progress.style.width = per;

		this.curValue = ratio*this.data.delta + this.data.min;
		try{this.callback(status, this.curValue)} catch (e) {}
	}

	_addEvent(elem, type, handler){
		if (elem.addEventListener){
			elem.addEventListener(type, handler, false)
		} else {
			elem.attachEvent("on"+type, handler)
		}
	}

	_removeEvent(elem, type, handler){
		if (elem.removeEventListener){
			elem.removeEventListener(type, handler, false)
		} else {
			elem.detachEvent("on"+type, handler)
		}
	}

	_addEvents(){
		var self=this;

		self._circuitStartChange = function(event){
			self._startChange.call(self, event);
		}
		self._circuitChange = function (event){
			self._change.call(self, event);
		}
		self._circuit_stopChange = function (event){
			self._stopChange.call(self, event);
		}

		this._addEvent(this.wrapper, this.eNames.down, function(event){
			event = event || window.event;
			event.preventDefault(); // Для андройда, чтобы срабатывало touchend

			self._startChange.call(self, event);
			self._addEvent(document.body, self.eNames.move, self._circuitChange);
			self._addEvent(document.body, self.eNames.leave, self._circuit_stopChange);
			self._addEvent(document.body, self.eNames.up, self._circuit_stopChange);
		});
	}

	_startChange(event){
		event=event||window.event;
		event = event.touches ? event.touches[0] : event;
		this.startX = event.clientX;
		this.wrapperWidth = this.wrapper.getBoundingClientRect().right - this.wrapper.getBoundingClientRect().left;
		this.progressWidth = this.startX - this.wrapper.getBoundingClientRect().left;

		var ratio = Math.min(Math.max(0, this.progressWidth/this.wrapperWidth), 1);
		this._addProgress('down', ratio);
	}

	_change(event){
		event=event||window.event;
		event = event.targetTouches ? event.targetTouches[0] : event;

		this._addProgress('move', this._calculateRatioByEvent(event));
	}

	_stopChange(event){
		event=event||window.event;
		event = event.changedTouches ? event.changedTouches[0] : event;

		this._removeEvent(document.body, this.eNames.move,this._circuitChange);
		this._removeEvent(document.body, this.eNames.leave, this._circuit_stopChange);
		this._removeEvent(document.body, this.eNames.up, this._circuit_stopChange);

		this._addProgress('up', this._calculateRatioByEvent(event));
	}

	_calculateRatioByEvent(event){
		var offset = event.clientX - this.startX;
		var ratio = (this.progressWidth + offset) / this.wrapperWidth;
		ratio = Math.min(Math.max(0, ratio), 1);
		return ratio;
	}

	_calculateRatioByValue(){
		var ratio = this.data.delta ? ((this.data.value - this.data.min) / this.data.delta) : 0;
		return ratio;
	}

	update(data){

		this._updateData(data);
		this._addProgress('update', this._calculateRatioByValue());
	}

	getValue(){
		return this.curValue;
	}
};




