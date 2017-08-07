var YoutubePlayer =  class {
	constructor(oUPlayer, onReady) {
        this.insert = oUPlayer.wrapper.querySelector('[data-CombinedPlayer-insert="video"]');
        this.insert.innerHTML = '<iframe class="combinedPlayer_youtube" src="'+ oUPlayer.data.youtube +'?enablejsapi=1" allowfullscreen="" frameborder="0"></iframe>';
        this.youtubeIframe = this.insert.firstChild;
        var self = this;

        this.oUPlayer = oUPlayer;
        this.YT = new YT.Player(this.youtubeIframe, {
            events: {
                'onReady': function(event){onReady(event)},
                'onStateChange': function(event){self._onPlayerStateChange.call(self, event)}
            }
        });
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
            try {document[exit]()} catch(e){};
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





































