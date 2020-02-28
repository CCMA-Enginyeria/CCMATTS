import $ from 'jquery';
import Backbone from 'backbone';
import TextToSpeech from './TextToSpeech';


const TextToSpeechConfig = Backbone.Model.extend({
    /*
    * -----------------------------------------------
    * Valors per defecte
    * -----------------------------------------------
    */
    defaults: {
        titleSection: null,
        title: "No és un element DÓM HTML ",
        cancellable: false,
        priority: 10,
        id: 'normal',
        beautifier: 'normal',
        speed: 'normal'
    },

    initialize: function(model, options) {
        /*jslint unparam:true*/
        Backbone.Model.prototype.initialize.apply(this, arguments);
        this.textToSpeech = TextToSpeech.getInstance();
    },
    /*
    * -----------------------------------------------
    * Accions
    * -----------------------------------------------
    */
    getDefaultConfig: function(){
        return this.toJSON();
    },
    getConfigFromElementWithSection: function(el){
        el = $(el);
        this._setOptions(el);
        this.set({
            'title': this._setTitle(el),
            'titleSection': this._setTitleSection(el)
        });
        if(this.get('title') === '_beep'){
            this._getBeepOptions(); 
        }
        return this.toJSON();
        
    },
    getConfigFromElement: function(el){
        el = $(el);
        this._setOptions(el);
        this.set({
            'title': this._setTitle(el),
            'titleSection': null
        });
        if(this.get('title') === '_beep'){
            this._getBeepOptions(); 
        }
        return this.toJSON();
        
    },
    /*
    * -----------------------------------------------
    * Mètodes privats
    * -----------------------------------------------
    */
    _getBeepOptions: function(){
        this.set({
            cancellable: false,
            priority: -1,
            id: 'normal',
            beautifier: 'normal',
            titleSection: null
        });
    },
    _setOptions: function(el) {
        this.textToSpeech.set({
            speedToPlay: el.data('texttospeech-speed') ?  el.data('texttospeech-speed') : this.textToSpeech.get('speed')
        });
        this.set({
            cancellable: el.data('texttospeech-cancellable'),
            priority: el.data('texttospeech-priority') || 0,
            id: el.data('texttospeech-id') || 'normal',
            beautifier: el.data('texttospeech-beautifier') || 'normal'
        });
    },
    _setTitle: function(el) {
        return this._getAccessibleText(el);
    },
    _setTitleSection: function(el) {
        var blockElement = el.parents('[aria-label],[aria-labelledby]');
        if(blockElement.length) {
            return this._getAccessibleText(blockElement.eq(0));
        }
        return 'SENSE TITOL';
    },
    _getAccessibleText: function(el) {
        var title = el.attr('aria-label'),
            labelId,
            labelElement,
            src;
        if(title) {
            return title;
        }
        labelId = el.attr('aria-labelledby');
        if(labelId) {
            labelElement = $('#' + labelId);
            if(labelElement.length > 0) {
                src = this._getText(labelElement);
                return src;
            }                
        } else {
            src = this._getText(el);
            return src;
        }
    },
    _getText: function(labelElement) {
        var src = '', i,
            contents;
        if(labelElement.attr('aria-hidden')){
            if(labelElement.attr('aria-hidden') === "true"){
                return src;
            }
        }else if(labelElement.children().length === 0){
            src += labelElement.text()+' ';
            return src;
        }
        
        contents = labelElement.contents();
        for(i = 0; i < contents.length; i = i + 1){
            if(contents.eq(i).nodeType === Node.TEXT_NODE) {
                src += ' '+contents.eq(i).text();
            } else {
                src += ' '+this._getText(contents.eq(i));    
            }
        }

        return src.trim();
    }

}, {
    getInstance: function() {
        return new TextToSpeechConfig();
    }
});

export default TextToSpeechConfig;