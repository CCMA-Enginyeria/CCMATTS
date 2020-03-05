import TextToSpeechConfig from './model/texttospeechConfig';
import TextToSpeech from './model/TextToSpeech';
import TextToSpeechURL from './model/TextToSpeechURL';


const textToSpeechURL = TextToSpeechURL.getInstance();
let audioServiceURLFactory;

function pushAudioConfig(config) {
    var textToSpeech = TextToSpeech.getInstance();
    if(config){
        textToSpeech.push(config);
    }else{
        textToSpeech.push(getTTSConfigFromElement());
    }
}

let callbacksURL = [];

function onAudioURLChange(cb) {
    callbacksURL.push(cb);
}

function offAudioURLChange(cb) {
    callbacksURL.splice(callbacksURL.indexOf(cb));
}

textToSpeechURL.on("change:text", function () {
    var url = audioServiceURLFactory({
        text: textToSpeechURL.get("text"),
        speed: textToSpeechURL.get("speed")
    });
    _.each(callbacksURL, function (cb) {
            cb({
                url: url,
                onAudioFinished: textToSpeechURL.onAudioFinished 
            });
    });
});

function getTTSConfigFromElement(el,hasSection) {
    var config = TextToSpeechConfig.getInstance();
    if (el && el instanceof HTMLElement) {
        if(hasSection){
            return config.getConfigFromElementWithSection(el);
        } else{
            return config.getConfigFromElement(el);
        }
    } else {
        return config.getDefaultConfig();
    }
}

function setSpeed(speed) { 
    var textToSpeech = TextToSpeech.getInstance(); 
    if(speed){
        textToSpeech.set({speed: speed})
    }
}

function setAudioServiceURLFactory(URLFactory) {
    audioServiceURLFactory = URLFactory;
}


export { pushAudioConfig, getTTSConfigFromElement, onAudioURLChange, offAudioURLChange , setSpeed , setAudioServiceURLFactory };
