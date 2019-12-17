$("#my-video").draggable();
$("#their-video").draggable();
window.peer = new Peer({host: '198.199.69.48', port: '7777',path: '/', secure: 'true', debug: true}); 
window.peer.on('open', function() {
window.peer.listAllPeers(function(peers) {
  window.peer_id = peers[0];
  });
});

window.peer.on('call', function(call){
  call.answer(window.localStream);
});
window.peer.on('error', function(err){
  console.debug(err);
});

function call_peer() { 
  $("#active_call").show();
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  navigator.getUserMedia({ audio: true, video: true },function(stream) {
   var video = document.getElementById('my-video');
   try {
      $("#my-video").prop('src',window.URL.createObjectURL(stream));
      
   } catch(error) {
      video.srcObject = stream;
   } 
   
   window.localStream = stream;
   window.existingCall = window.peer.call(window.peer_id,window.localStream);
  window.existingCall.on('stream', function(stream) { 
    var video = document.getElementById('their-video');
    try {
      $("#their-video").prop('src',window.URL.createObjectURL(stream));
    } catch(error) {
      video.srcObject = stream;
    }
    
      $("#their-video").prop('onloadedmetadata',function(e) {video.play();});
    });
   $("#my-video").prop('onloadedmetadata',function(e) {video.play();});
  },function(err) {
   alert("The following error occurred: " + err.name);
  });

}
