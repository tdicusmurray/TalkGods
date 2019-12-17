function hearandspeak() {
	var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
	var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
var synth = window.speechSynthesis;
	var recognition = new SpeechRecognition();
	recognition.continuous = true;
	recognition.lang = 'en-US';
	recognition.interimResults = true;
	recognition.maxAlternatives = 1;
	  voices = speechSynthesis.getVoices();
	function populateVoiceList() {
	  for(i = 0; i < voices.length ; i++) {
	    var option = document.createElement('option');
	    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

	    $(option).attr('data-lang', voices[i].lang);
	   $(option).attr('data-name', voices[i].name);
	    document.getElementById("voiceSelect").appendChild(option);
	    voiceSelect =document.getElementById("voiceSelect");
	  }
	}

	populateVoiceList();
	if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
	  speechSynthesis.onvoiceschanged = populateVoiceList;
	}

	recognition.onresult = function(event) {
	  var last = event.results.length - 1;
	  var transcript = event.results[last][0].transcript;

	  var utterThis = new SpeechSynthesisUtterance(transcript);
	  var selectedOption = $(voiceSelect.selectedOptions[0]).attr('data-name');
	  for(i = 0; i < voices.length ; i++) {
	    if(voices[i].name === selectedOption) {
	      utterThis.voice = voices[i];
	    }
	  }
	  synth.speak(utterThis);
	}

	//recognition.start();

}