import _ from 'underscore';
import Backbone from 'backbone';


const TextToSpeech = Backbone.Model.extend({
    /*
    * -----------------------------------------------
    * Valors per defecte
    * -----------------------------------------------
    */
    defaults: {
        titol_bloc: null,
        titol: null,
        audio_buffer: [],
        isPlaying: false,
        isCancellable: true,
        speed: 'normal',
        speedToPlay: 'normal'
    },

    initialize: function(model, options) {
        /*jslint unparam:true*/
        Backbone.Model.prototype.initialize.apply(this, arguments);
        this.audioBuffer = [];
        this.mapDies = this.getMapDies();
        this.mapCanals = this.getMapCanals();
        this.listenTo(this, 'change:isPlaying', _.bind(this.onPlayingChange, this));
        this.changeAudioDebounced = _.debounce(this.changeAudio, 500);
    },
    /*
    * -----------------------------------------------
    * Accions
    * -----------------------------------------------
    */
    doBeep: function() {
        this.trigger('onBeep');
    },
    push: function(config, notPlay) {
        var audioStr = {
            'titol_bloc': config.titleSection,
            'titol': config.title,
            'options': config
        };
        this.audioBuffer.push(audioStr);
        if(config.id === 'intro'){
            this.changeAudio();
        }else if(!notPlay){
            this.changeAudioDebounced();
        }
    },
    onPlayingChange: function() {
        if (this.get('isPlaying') === false) {
            if (this.audioBuffer.length > 0) {
                this.changeAudioDebounced();
            }
        }
    },
    changeAudio: function() {
        if (this.get('isPlaying') && !this.get('isCancellable')) {
            return;
        }
        if (this.audioBuffer.length > 1 || !this._hasRenderPage()) {
            this.orderedAudioBuffer = this._getOrderedAudioBuffer();
            if (this._checkBeep()) {
                this.doBeep();
                return;
            }
            var titolBlocStr = this.get('titol_bloc'),
                audioText = '',
                audios = [];
            audios = _.map(this.orderedAudioBuffer, _.bind(function(element) {
                element = this._beautifyTTSElement(element);
                audioText = '';
                if (element.titol_bloc !== null && element.titol_bloc !== titolBlocStr) {
                    titolBlocStr = element.titol_bloc;
                    audioText += element.titol_bloc + '. ';
                }
                audioText += element.titol + '. ';
                return audioText;
            }, this));
            this.set({
                'audio_buffer': audios,
                'titol_bloc': titolBlocStr,
                'titol': audios.join(''),
                'isCancellable': this._isCancellable(this.orderedAudioBuffer)
            });
            this.audioBuffer = [];
        }
    },
    getAudios: function() {
        return this.get('audio_buffer');
    },

    resetAudios: function() {
        this.set({'audio_buffer': []});
    },

    getCatchup: function(str) {
        var splitted = str.split(" "),
            output = "";
        if (splitted.length === 2) {
            return this.mapCanals[splitted[1]].canal;
        }
        if (splitted[2] === "undefined") {
            output += this.mapDies[splitted[1]].dia + " ";
        } else {
            output += this.mapDies[splitted[1]].dia + " " + splitted[2] + " ";
        }
        if (splitted.length > 3) {
            output += this.mapCanals[splitted[3]].canal;
        }
        return output;
    },

    getMapDies: function() {
        var map = {};
        map.DL = { dia: "Dilluns" };
        map.DT = { dia: "Dimarts" };
        map.DM = { dia: "Dimecres" };
        map.DJ = { dia: "Dijous" };
        map.DV = { dia: "Divendres" };
        map.DS = { dia: "Dissabte" };
        map.DG = { dia: "Diumenge" };
        map.AVUI = { dia: "AVUI" };
        map.AHIR = { dia: "AHIR" };
        return map;
    },

    getMapCanals: function() {
        var map = {};
        map.tv3 = { canal: "tv3" };
        map['324'] = { canal: "3 24" };
        map.cs3 = { canal: "super 3" };
        map['33d'] = { canal: "33" };
        map.es3 = { canal: "esport 3" };
        return map;
    },

    /*
     * -----------------------------------------------
     * Helpers
     * -----------------------------------------------
     */

    _getWhiteListData: function() {
        this.whitelist = WhitelistModel.getInstance();
        this.listenTo(this.whitelist, 'sync', this.onWhiteListChange);
        this.onWhiteListChange();
    },

    _hasRenderPage: function() {
        var result = _.filter(this.audioBuffer, function(element) {
            return (element.options.id === 'renderPage');
        });
        return (result.length > 0);
    },

    _checkBeep: function() {
        if (this._hasBeep()) {
            var result = _.filter(this.orderedAudioBuffer, function(element) {
                return (element.options.id === 'renderResults');
            });
            return !(result.length > 0);
        }
        return false;
    },

    _hasBeep: function() {
        var i,
            result = _.filter(this.orderedAudioBuffer, function(element) {
                return (element.titol.indexOf('_beep') >= 0);
            });
        for (i = 0; i < result.length; i = i + 1) {
            this.orderedAudioBuffer = _.without(this.orderedAudioBuffer, result[i]);
            this.audioBuffer = _.without(this.audioBuffer, result[i]);
        }
        return (result.length > 0);
    },

    _isCancellable: function(audioBuffer) {
        var result = _.filter(audioBuffer, function(element) {
            return (element.options.cancellable === false);
        });
        return !(result.length > 0);
    },

    _getOrderedAudioBuffer: function() {
        /*jslint unparam:true*/
        var filteredRepeatedIds = _.reduce(this.audioBuffer.reverse(), function(result, element, index, rest) {
            result[element.options.id] = result[element.options.id] || element;
            if (result[element.options.id].options.priority < element.options.priority) {
                result[element.options.id] = element;
            }
            return result;
        }, {}),
            orderedByPriority = _.sortBy(_.values(filteredRepeatedIds), function(element) {
                return -element.options.priority;
            });
        return orderedByPriority;
    },

    

    _beautifyTTSElement: function(element) {
        switch (element.options.beautifier) {
            case 'catchup':
                return {
                    titol: this.getCatchup(element.titol),
                    titol_bloc: element.titol_bloc
                };
            case 'catchup_titol_bloc':
                return {
                    titol: element.titol,
                    titol_bloc: this.getCatchup(element.titol_bloc)
                };
            default:
                if (element.titol_bloc) {
                    return {
                        titol: element.titol,
                        titol_bloc: element.titol_bloc
                    };
                }
                return {
                    titol: element.titol,
                    titol_bloc: element.titol_bloc
                };


        }
    },
    _getTitle: function() {
        return this._getAccessibleText(this.$el);
    },
    _getBlockTitle: function() {
        var blockElement = this.$el.parents('[aria-label],[aria-labelledby]');
        if (blockElement.length) {
            return this._getAccessibleText(blockElement.eq(0));
        }
        return 'SENSE TITOL';
    }

}, {
    singleton: null,

    getInstance: function() {
        TextToSpeech.singleton = TextToSpeech.singleton || new TextToSpeech();
        return TextToSpeech.singleton;
    }

});

export default TextToSpeech;
