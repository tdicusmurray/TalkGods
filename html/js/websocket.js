let socket = new WebSocket("wss://198.199.69.48:1337");
socket.onopen = function(e) {
  socket.send(JSON.stringify({type: "timeline", data: []}));  
  socket.send(JSON.stringify({type: "full_name", data: 1}));  
  socket.send(JSON.stringify({type: "active_chat_messages", data: 1}));  

  $("#post").keyup(function () {
      socket.send(JSON.stringify({type: "tag", data: $("#post").val()}));  
  });
};
socket.onmessage = function(event) {
 handleMessage(event);
};

socket.onclose = function(event) {
  if (event.wasClean) {
    console.log("Connection closed cleanly, code=${event.code} reason=${event.reason}");
  } else {
    console.log('Connection died');
    location.reload();
  } 
};

socket.onerror = function(error) {
  console.log(error.message);
};

$("#person_box").click(function() { $(".text_container").toggle();});
function render(template, output, variables, stack, queue) {
  var template_code = $(template).html();
  var rendered = Mustache.render(template_code, variables);
  
  if (stack && !queue) $(output).append(rendered);
  else if (queue) $(output).prepend(rendered);
  else $(output).html(rendered);
}
function handleMessage(message) {
  var message_array = $.parseJSON(message.data);
  if (message_array.channel == "new_post") {
    var payload = $.parseJSON(message_array.payload);
    render("#post_template", "#timeline", {created:payload.created, text: payload.text, person_id: payload.person_id},true, true);
    return;
  }
  var message_type = message_array[message_array.length-1].type;
  switch (message_type) {
      case 'timeline':
        message_array.forEach(function(element, i) {
          if(!element.text) return;
          var post_regex = new RegExp(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/gm);

          if (post_regex.test(element.text)) {
              element.text = convertYoutube(element.text);
              render("#post_template", "#timeline", {created: new Date(element.created),youtube: element.text,person_id: element.first_name},true,true,true);
         }
          else
              render("#post_template", "#timeline", {youtube: '', created: new Date(element.created),text: element.text,person_id: element.first_name},true,true);
        });
        break;
      case 'full_name':
         render("#active_chat", "#active_chat", {first_name: message_array[0].first_name, last_name: message_array[0].last_name});
      break;
      case 'active_chat_messages':
        message_array.forEach(function(element, i) {
          if(i == message_array.length-1) return;
          render("#active_chat_messages", "#active_chat_messages_container", {person_id: element.sender_id, first_name: element.first_name, last_name: element.last_name, message: element.message},true,false);

          var objDiv = document.getElementsByClassName("text_container")[0];
          objDiv.scrollTop = objDiv.scrollHeight;
        });
        break;
      case 'full_chat':
         message_array.forEach(function(element, i) {
          if(i == message_array.length-1) return;
          render("#active_chat_messages", "#active_chat_messages_container", {person_id: element.sender_id, first_name: element.first_name, last_name: element.last_name, message: element.message},true,false);

          var objDiv = document.getElementsByClassName("text_container")[0];
          objDiv.scrollTop = objDiv.scrollHeight;
        });
        break;
      case 'cryptohashcash':
        message_array.forEach(function(element, i) {
        if ((i % 4) == 0) $("#hashtags").append("<br>");
          $("#hashtags").append("<span class='hashcash' title='$" + element.highest_bid + ".00, 24Hr Usage: 7'>#" + element.name + "</span> ");
         });
        $(".hashcash").tooltip();
        $("#hashtags").slideDown();
        break;
      case 'tag':
        var hashtag_name = Array();

        for ( var i = 0; i < message_array.length; i++ ) {
          hashtag_name.push(message_array[i].name);
        }
        $("#post").autocomplete({
            source: hashtag_name
        });
        break;
  }
}
