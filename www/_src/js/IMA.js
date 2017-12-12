import {scriptonload} from '../js/scriptonload';

class IMA {
	constructor(param){

		this._declare(param);
		this._insertVideoTag();
		this._run();

		/*scriptonload(['//imasdk.googleapis.com/js/sdkloader/ima3.js'], () => {

		});*/
	}

	_getHtml(){
		return '<div data-js="adv-player" class="advPlayer">'+
			'<div data-js="vpaid-slot" style="position:absolute;left:0;top:0;display:block;width:100%;height:100%;"></div>'+
			'</div>';
	}

	_declare(param){
		this.param = param;
		this.oUPlayer = this.param.oUPlayer;
		this.path = this.param.path;
		this.insert = this.oUPlayer.wrapper.querySelector('[data-CombinedPlayer-insert="adv"]');
		this.insert.innerHTML = this._getHtml();
		this.wrapper =  this.insert.firstChild;
		this.video = this.oUPlayer.initVideo;
		this.slot = this.wrapper.querySelector('[data-js="vpaid-slot"]');
	}

	_insertVideoTag(){
		this.video.removeAttribute('style');
		this.video.className = 'advPlayer_video';
		this.wrapper.insertBefore(this.video, this.slot);
	}

	_run(){
		/*
			google
		 https://developers.google.com/interactive-media-ads/docs/sdks/html5/
		 */


		/* for code */
		var adContainer = this.slot;
		var videoContent = this.video;
		var adsManager;
		var self = this;


		var adDisplayContainer =
			new google.ima.AdDisplayContainer(
				adContainer,
				videoContent);

		// Must be done as the result of a user action on mobile
		adDisplayContainer.initialize();

		// Re-use this AdsLoader instance for the entire lifecycle of your page.
		var adsLoader = new google.ima.AdsLoader(adDisplayContainer);

// Add event listeners
		adsLoader.addEventListener(
			google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
			onAdsManagerLoaded,
			false);
		adsLoader.addEventListener(
			google.ima.AdErrorEvent.Type.AD_ERROR,
			onAdError,
			false);

		function onAdError(adErrorEvent) {
			// Handle the error logging and destroy the AdsManager
			console.log('Uplayer', 'IMA error - ' + adErrorEvent.getError());
			try {adsManager.destroy()} catch(e){};
			self.param.onError();
		}

// An event listener to tell the SDK that our content video
// is completed so the SDK can play any post-roll ads.
		var contentEndedListener = function() {
			adsLoader.contentComplete();
		};
		videoContent.onended = contentEndedListener;

// Request video ads.
		var adsRequest = new google.ima.AdsRequest();
		adsRequest.adTagUrl = '//googleads.g.doubleclick.net/pagead/ads?ad_type=video&client=ca-video-pub-4968145218643279&videoad_start_delay=0&description_url=http%3A%2F%2Fwww.google.com&max_ad_duration=40000&adtest=on';
		adsRequest.adTagUrl = 'https://googleads.g.doubleclick.net/pagead/ads?ad_type=skippablevideo&client=ca-video-pub-3605597367359598&description_url=http%3A%2F%2Fkinoafisha.info&videoad_start_delay=0&hl=ru';
		//adsRequest.adTagUrl = '//pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinearvpaid2js&correlator=';

// Specify the linear and nonlinear slot sizes. This helps the SDK to
// select the correct creative if multiple are returned.
		adsRequest.linearAdSlotWidth = 1200;
		adsRequest.linearAdSlotHeight = 600;

		//var playButton = document.getElementById('playButton');
		//playButton.addEventListener('click', requestAds);
		this.wrapper.className = 'advPlayer advPlayer-ready advPlayer-active'; /* TODO */
		requestAds();

		function requestAds() {
			adsLoader.requestAds(adsRequest);
		}

		function onAdsManagerLoaded(adsManagerLoadedEvent) {
			// Get the ads manager.
			adsManager = adsManagerLoadedEvent.getAdsManager(
				videoContent);  // See API reference for contentPlayback

			// Add listeners to the required events.
			adsManager.addEventListener(
				google.ima.AdErrorEvent.Type.AD_ERROR,
				onAdError);
			adsManager.addEventListener(
				google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
				onContentPauseRequested);
			adsManager.addEventListener(
				google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
				onContentResumeRequested);
			adsManager.addEventListener(
				google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
				function(){self.oUPlayer.onAdsCompleted.call(self.oUPlayer)});

			try {
				// Initialize the ads manager. Ad rules playlist will start at this time.
				adsManager.init(640, 360, google.ima.ViewMode.NORMAL);
				// Call start to show ads. Single video and overlay ads will
				// start at this time; this call will be ignored for ad rules, as ad rules
				// ads start when the adsManager is initialized.
				adsManager.start();
			} catch (adError) {
				// An error may be thrown if there was a problem with the VAST response.
				this.param.onError();
			}
		}

		function onContentPauseRequested() {
			// This function is where you should setup UI for showing ads (e.g.
			// display ad timer countdown, disable seeking, etc.)
			videoContent.removeEventListener('ended', contentEndedListener);
			videoContent.pause();
		}

		function onContentResumeRequested() {
			// This function is where you should ensure that your UI is ready
			// to play content.
			videoContent.addEventListener('ended', contentEndedListener);
			videoContent.play();
		}
	}
}
export {IMA}



