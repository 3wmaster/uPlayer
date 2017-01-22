import {CombinedPlayer} from '../js/CombinedPlayer';

export default function (root, doc){
    if(root.uPlayer) return false;

    var uPlayer = function(wrapper){
        var param = JSON.parse(wrapper.getAttribute('data-param'));
        if(!param.name) param.name = 'player-' + String(Math.random()).slice(-6);
        if(!uPlayer.all[param.name]) uPlayer.all[param.name] = new CombinedPlayer(wrapper, param.name);
        return uPlayer.all[param.name];
    }

    uPlayer.all = {};

    uPlayer.abortAll = function(cur){
      for (var name in uPlayer.all){
          var player =  uPlayer.all[name];
          if(cur !== player) player.abort();
      }
    };

    uPlayer.isMobile = function(){
        try{
            return APP.vars.isMobile;
        } catch(e){
            return false;
        }
    }();

    uPlayer.isNeedActivation = function(){
        var agentAll = ['ipod','iphone','ipad'],
            i = 0;

        for(i;i< agentAll.length;i++){
            var re = new RegExp(agentAll[i], 'i');
            if( re.test( navigator.userAgent ) ) return agentAll[i];
        }
        return false;
    }();

    root.uPlayer = uPlayer;

}(window, document);










