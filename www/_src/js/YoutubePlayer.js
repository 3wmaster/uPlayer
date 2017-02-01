var YoutubePlayer =  class {
	constructor(oUPlayer, onReady) {
        oUPlayer.insert.innerHTML = '<iframe class="combinedPlayer_youtube" src="'+ oUPlayer.data.youtube +'?enablejsapi=1" allowfullscreen="" frameborder="0"></iframe>';
        var self = this;

        this.oUPlayer = oUPlayer;
        this.YT = new YT.Player(oUPlayer.insert.firstChild, {
            events: {
                'onReady': function(event){onReady(event)},
                'onStateChange': function(event){self._onPlayerStateChange.call(self, event)}
            }
        });
	}

    _onPlayerStateChange(event){
        if(event.data === 0) this.afterEnd();
    }

    start(){

    }

    abort(){
        if(this.YT.getPlayerState && this.YT.getPlayerState() === 2) return false;
        if(this.YT.pauseVideo) this.YT.pauseVideo();
        this.afterAbort(); //определяется в основном плеере
    }

    del(){
        this.YT.destroy();
        this.oUPlayer.insert.innerHTML = '';
    }
};

//
export {YoutubePlayer};





































