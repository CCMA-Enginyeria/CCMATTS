import _ from 'underscore';
import Backbone from 'backbone';
import TextToSpeech from './TextToSpeech';

const TextToSpeechURL = Backbone.Model.extend({
    /*
    * -----------------------------------------------
    * Valors per defecte
    * -----------------------------------------------
    */
    defaults: {
        audios: null,
        audioSrc: null,
        speed: '4',
        isPlaying: false,
        bufferLenght: 800
    },

    initialize: function(model, options) {
        this.textToSpeech = TextToSpeech.getInstance();
        this.listenTo(this.textToSpeech, 'change:titol change:active', this.onModelChange);
        this.listenTo(this.textToSpeech, 'onBeep', this.onBeep);
        this.listenTo(this, 'change:audioSrc', this.onAudioURLChange);
        this.listenTo(this, 'change:isPlaying', this.onIsPlayingChange);
        this.listenTo(this.textToSpeech, 'change:speedToPlay change:speed', this.changeVelocitat);
        this.onAudioFinished = _.bind(this.onAudioFinished, this)
        this.onModelChange();
        this.changeVelocitat();
    },
    
    /*
    * -----------------------------------------------
    * Gestió d'events
    * -----------------------------------------------
    */
    onIsPlayingChange: function(){
        this.textToSpeech.set({isPlaying: this.get('isPlaying')});
    },
    onAudioFinished: function(){
        if(!this.audioQueue || this.audioQueue.length === 0) {
            this.set({
                'isPlaying': false
            });
            this.textToSpeech.set({
                'isCancellable': true
            })
        } else {
            this.set({
                text: this.audioQueue.shift()
            })
        }
    },
    onBeep: function() {
        var audios = this.textToSpeech.getAudios();
        console.log("onBeep")
        this.set({
            audios: audios,
            text: '#beep' + Math.floor((Math.random() * 1000) + 1)
        });
    },
    changeVelocitat: function(){
        var speed = this.textToSpeech.get("speedToPlay");
        if(speed && speed !== "null"){
            this.set({
                speed: this._getMapSpeed()[speed].speed
            });
        }else{
            this.set({
                speed: this._getMapSpeed()['normal'].speed
            });
        }
    },
    onModelChange: function() {
        var audios = this.textToSpeech.getAudios();
        this.set({
            audios: audios,
            text: this._getAudioSentence(audios),
            isPlaying: true
        });
        
    },

    /*
    * -----------------------------------------------
    * Mètodes privats
    * -----------------------------------------------
    */

   _getMapSpeed: function() {
        var map = {};
        map.normal = { speed: "4" };
        map.slow = { speed: "1" };
        map.fast = { speed: "7" };
        return map;
    },

    _getAudioSentence: function(audios) {
        console.log(audios)
        this.audioQueue = [];
        if (audios.length === 0) {
            return null;
        }
        var sentence = _.reduce(audios, function(res, audio) {
            res += audio + '. ';
            return res;
        }, '');

        if(sentence.length > this.get('bufferLenght')){
            this._getAudioQueue(sentence);
            return this.audioQueue.shift();
        }
        return sentence;
    },
    _getAudioQueue: function(sentence){
        var sentenceSplitted = sentence.split('.');
        this.audioQueue = _.reduce(sentenceSplitted, _.bind(function(memo, text){
            text = text.trim() + '.';
            if(memo.length === 0 || (memo[memo.length-1]+text).length > this.get('bufferLenght')){
                memo.push(text);
            }else{
                memo[memo.length-1] += text;
            }
            return memo;
        },this),[]);
    }
    

}, {
    singleton: null,

    getInstance: function() {
        TextToSpeechURL.singleton = TextToSpeechURL.singleton || new TextToSpeechURL();
        return TextToSpeechURL.singleton;
    }

});

export default TextToSpeechURL;
