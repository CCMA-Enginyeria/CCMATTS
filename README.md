# Screen Reader CCMATTS

This library has been developed for the EasyTV project.
The prime motivation of EasyTV is the necessity of equal access to television and audio-visual services to ensure that all users, especially persons with disabilities, the growing ageing population of Europe and users with special needs can derive maximum benefit in terms of choice and quality of media content and services + info:  https://easytvproject.eu/ 

## CCMA commitment to accessibility

Since 2010, the CCMA has been very sensitive to TV users with special needs, investigating and implementing services of accessibility for hybrid television within European projects. In the Hybrid Broadcast Broadband for All project (Hbb4ALL), the CCMA worked in different alternatives for audio production and distribution, including Clean Audio, Audio Description and languages learning. EASYTV project is a great challenge to follow the work initiated by Hbb4ALL in TV accessibility environment. EasyTV project has the challenge of improving the access to mainstream multimedia products and services for people with different types and levels of disabilities, such as visually or hearing impairment.

## HBBTV screen reader

One of the additional difficulties for blind and low vision people is the use of graphical user interfaces. A voice guide, can help blind people to use interfaces to interact with electronic devices. On this basis, we have added a voice interface named Screen Reader (SR) to our HbbTV service to guide the users to find and consume content through voice indication. HbbTV apps in general still have a lack of accessibility, so this is the first time an HbbTV application covers this need of voice guiding.

Using the EasyTV Voice Platform solution which offers a TTS (voice to text) service, the SR describes the graphical user interface considering the menu and sections items.


## How to use CCMATTS

A Javascript library suitable for any web page and audio players. CCMATTS can be used with any Text-to-Speech API. It integrates a modification of the aria HTML standard. It works with a priority audio queues in order to decide which is the best audio to reproduce. 

To start, you will have to include the embeded Javascript library in your website and three other libraries (jQuery, Underscore and Backbone) before the ```body``` tag.

```HTML
    <script src="path/to/underscore.js"></script>
    <script src="path/to/jquery.js"></script>
    <script src="path/to/backbone.js"></script>
    
    <script src="path/to/ccma.tts.min.js"></script>
</body>
```

This will put you CCMATTS as a global variable. You can acces to that object with window.CCMATTS or just CCMATS.

Firstly you will need to set up your Text-to-Speech API by calling setAudioServiceURLFactory. In this functon you will receive two params:
* text: String that you will pass to your service.
* speed: Integer with the speed to reproduce your text (1,"slow"), (4,"normal") and (7,"fast").
````javascript
CCMATTS.setAudioServiceURLFactory(function(params) {
    if(params.text.indexOf('#beep') >= 0){
        return '../src/audio/beep.mp3';
    }
    return 'PATH/TO/YOUR/TTS' + '?text=' + encodeURIComponent(params.text) + '&lang=en&vol=100&rate=' + encodeURIComponent(params.speed);
});
````
In order to activate your Screen Reader you will need to use this listener function that you will receive a callback to reproduce your audio.

In that function you will receive the final url to reproduce with the service you are using. Also you will receive a function that must be called when your last audio has finished.

````javascript
//START CCMATTS SERVICE
CCMATTS.onAudioURLChange(onURLChange);
function onURLChange(ev) {
    audioPlayer.src = ev.url;
    audioPlayer.play();
    audioPlayer.onended = ev.onAudioFinished
}

//STOP CCMATTS SERVICE
CCMATTS.offAudioURLChange(onURLChange);
````
You will have a config for each audio that can be readed from the HTML or doing it manually. Config consists of these parts:
````javascript
{
    titleSection: "I am a text", //String with the section text of the audio (optional default="")
    title: "I am another text", //String with the text of the audio (mandatory)
    cancellable: true, //Boolean to know if the audio can be cancelled (optional default=true)
    priority: 0, //Integer with the priority of the audio (optional default=0)
    id: 'normal', //String that identifies an audio (optional default='normal')
    speed: 'normal' //Speed to reproduce this audio (optional default=('normal' or the value set in setSpeed function))
}
````
If you want to get the config from the HTML reading arias and attributes you can use this function:
````javascript
CCMATTS.getTTSConfigFromElement(textElement,true);
````
The textElement is a DOM HTML element that you want to read the config. If the second argument is true means that the config will have titleSection and you will read the element you passed and the first parent that contains an aria attribute else it will only read the textElement. All attributes should be contained in the textElement except the text from the section.

The possible attributes of an element are:
* aria-label: String that the Screen Reader will reproduce. If the string is "" the Screen Reader will read the HTML text from the element.
* aria-labelledby: String that identifies a DOM HTML element and will reproduce the text in the HTML.
* aria-hidden: Boolean to hide elements from the Screen Reader
* data-texttospeech-id: String that identifies the audio.
* data-texttospeech-priority: Integer that puts tha priority of the audio.
* data-texttospeech-cancellable: Boolean to know if the audio can be cancelled or not
* data-texttospeech-speed: Speed to reproduce this audio ("slow","noraml","fast")

When the config is set, use this function to push it in the queue and when queue is computed you will receive the final URL in the callback function.
````javascript
CCMATTS.pushAudioConfig(config);
````
If you want to change the default speed use the next function. Values of speed con be 'slow', 'normal' or 'fast'.
````javascript
CCMATTS.setSpeed(speed);
````
You have a simple Screen Reader example in ````'./example/index.html'````. Put your service Text-to-Speech URL and try it! 


