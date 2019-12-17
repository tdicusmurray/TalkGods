  $("#run_ad").click(function() {
	$("#run_ad").hide();
	$("#payment-form").show();
});
$("#crypto_btn").click(function() {
	socket.send(JSON.stringify({type: "cryptohashcash", data: []}));
});
var stripe = Stripe('pk_test_N169270SSEHLP7Ggyr5o6uBB');
var elements = stripe.elements();

var style = {
  base: {
    color: '#32325d',
    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    fontSmoothing: 'antialiased',
    fontSize: '16px',
    '::placeholder': {
      color: '#aab7c4'
    }
  },
  invalid: {
    color: '#fa755a',
    iconColor: '#fa755a'
  }
};
var card = elements.create('card', {style: style});
card.mount('#card-element');
card.addEventListener('change', function(event) {
  var displayError = document.getElementById('card-errors');
  if (event.error) {
    displayError.textContent = event.error.message;
  } else {
    displayError.textContent = '';
  }
});

var form = document.getElementById('payment-form');
form.addEventListener('submit', function(event) {
  event.preventDefault();

  stripe.createToken(card).then(function(result) {
    if (result.error) {
      var errorElement = document.getElementById('card-errors');
      errorElement.textContent = result.error.message;
    } else {
      stripeTokenHandler(result.token);
    }
  });
});

function stripeTokenHandler(token) {
  var form = document.getElementById('payment-form');
  var hiddenInput = document.createElement('input');
  hiddenInput.setAttribute('type', 'hidden');
  hiddenInput.setAttribute('name', 'stripeToken');
  hiddenInput.setAttribute('value', token.id);
  form.appendChild(hiddenInput);

  socket.send(JSON.stringify({type: "payment", data: token.id})); 
  $("#payment-form").html("<div class='alert alert-success' role='alert'>Congratulations your automatic optimized market ready advertisements are running.</div>");
}

$("#post_form").submit(function() {
	  socket.send(JSON.stringify({type: "post", data: $("#post").val()}));
    $("#post").val("");
    $("#post").focus();
	  return false; 
});
$("#chat_form").submit(function() {
	  socket.send(JSON.stringify({type: "chat_message", person_id: 1,message: $("#chat_text:last").val()}));
    $("#chat_text").val("");
    $("#chat_text").focus();
	  return false; 
});
$(".friend").click(function() {
  $(".text_container").toggle();

});
