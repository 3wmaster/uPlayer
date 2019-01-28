var YoutubePlayer =  class {
	constructor(oUPlayer, onReady) {
        this.insert = oUPlayer.wrapper.querySelector('[data-CombinedPlayer-insert="video"]');
        this.insert.innerHTML = '<iframe class="combinedPlayer_youtube" src="'+ oUPlayer.data.youtube +'?enablejsapi=1" allowfullscreen="" frameborder="0"></iframe>';
        this.youtubeIframe = this.insert.firstChild;
        this.isFullscreenMode = false; /* отслеживаем, этот ли плеер находится в полноэкранном режиме */
        var self = this;

        this.oUPlayer = oUPlayer;
        this.YT = new YT.Player(this.youtubeIframe, {
            events: {
                'onReady': function(event){onReady(event)},
                'onStateChange': function(event){self._onPlayerStateChange.call(self, event)}
            }
        });

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

        document.addEventListener(eName, function(e){
            if(document[fullscreenElement] == self.youtubeIframe){
                self.isFullscreenMode = true;
                oUPlayer._onFullscreen('youtube');
            } else if(self.isFullscreenMode === true){ //этот плеер находился в полноэкранном режиме
                self.isFullscreenMode = false;
                oUPlayer._onFullscreenExit('youtube');
            }
        });

        setInterval(function(){
            if(document[fullscreenElement]){
                console.log('Элемент в полноэкранном режиме', document[fullscreenElement]);
            }
        }, 100);
	}

    _onPlayerStateChange(event){
        if(event.data === 0){
            //конец проигрывания
            var exit = function (){
                if(document.exitFullscreen) return 'exitFullscreen';
                else if(document.mozCancelFullScreen) return 'mozCancelFullScreen';
                else if(document.webkitCancelFullScreen) return 'webkitCancelFullScreen';
                else if(document.msExitFullscreen) return 'msExitFullscreen';
                return false;
            }();

            //выходим из фуллскрина
            if(self.isFullscreenMode){
                try {document[exit]()} catch(e){};
            }

            this.afterEnd();
        }
    }

    initialize(){
        this.YT.playVideo();
        this.YT.pauseVideo();
    }

    start(){
        this.YT.playVideo();
    }

    abort(){
        if(this.YT.getPlayerState && this.YT.getPlayerState() === 2) return false;
        if(this.YT.pauseVideo) this.YT.pauseVideo();
    }

    del(){
        this.YT.destroy();
        this.insert.innerHTML = '';
    }
};

//
export {YoutubePlayer};





































