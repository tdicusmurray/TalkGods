  var speakerDevices = document.getElementById('speaker-devices');
  var ringtoneDevices = document.getElementById('ringtone-devices');
  var outputVolumeBar = document.getElementById('output-volume');
  var inputVolumeBar = document.getElementById('input-volume');
  var volumeIndicators = document.getElementById('volume-indicators');

  var device;
 
  $.get('https://198.199.69.48:1338/token')
    .then(function (data) {
      device = new Twilio.Device(data, { codecPreferences: ['opus', 'pcmu'],fakeLocalDTMF: true});
      device.on('ready',function (device) {
        console.log('Twilio.Device Ready!');
      });

      device.on('error', function (error) {
        console.log('Twilio.Device Error: ' + error.message);
      });

      device.on('connect', function (conn) {
        console.log('Successfully established call!');
        bindVolumeIndicators(conn);
      });

      device.on('disconnect', function (conn) {

      });

      device.on('incoming', function (conn) {
        console.log('Incoming connection from ' + conn.parameters.From);
        var archEnemyPhoneNumber = '+12093373517';

        if (conn.parameters.From === archEnemyPhoneNumber) {
          conn.reject();
          console.log('It\'s your nemesis. Rejected call.');
        } else {
          conn.accept();
        }
      });

      device.audio.on('deviceChange', updateAllDevices.bind(device));
    }).catch(function (err) {
      console.log(err);
      console.log('Could not get a token from server!');
    });
  

  speakerDevices.addEventListener('change', function() {
    var selectedDevices = [].slice.call(speakerDevices.children)
      .filter(function(node) { return node.selected; })
      .map(function(node) { return node.getAttribute('data-id'); });

    device.audio.speakerDevices.set(selectedDevices);
  });

  ringtoneDevices.addEventListener('change', function() {
    var selectedDevices = [].slice.call(ringtoneDevices.children)
      .filter(function(node) { return node.selected; })
      .map(function(node) { return node.getAttribute('data-id'); });

    device.audio.ringtoneDevices.set(selectedDevices);
  });

  function bindVolumeIndicators(connection) {
    connection.on('volume', function(inputVolume, outputVolume) {
      var inputColor = 'red';
      if (inputVolume < .50) {
        inputColor = 'green';
      } else if (inputVolume < .75) {
        inputColor = 'yellow';
      }

      var outputColor = 'red';
      if (outputVolume < .50) {
        outputColor = 'green';
      } else if (outputVolume < .75) {
        outputColor = 'yellow';
      }

    });
  }
function phoneCall() {
  hearandspeak();
    navigator.mediaDevices.getUserMedia({ audio: true });
    var params = {
      To: document.getElementById('phone-number').value
    };

    console.log('Calling ' + params.To + '...');
    if (device) {
      device.connect(params);
    }
  }

 function endCall() {
    console.log('Hanging up...');
    if (device) {
      device.disconnectAll();
    }
  }
  function updateAllDevices() {
    updateDevices(speakerDevices, device.audio.speakerDevices.get());
    updateDevices(ringtoneDevices, device.audio.ringtoneDevices.get());
  }

  function updateDevices(selectEl, selectedDevices) {
    selectEl.innerHTML = '';

    device.audio.availableOutputDevices.forEach(function(device, id) {
      var isActive = (selectedDevices.size === 0 && id === 'default');
      selectedDevices.forEach(function(device) {
        if (device.deviceId === id) { isActive = true; }
      });

      var option = document.createElement('option');
      option.label = device.label;
      option.setAttribute('data-id', id);
      if (isActive) {
        option.setAttribute('selected', 'selected');
      }
      selectEl.appendChild(option);
    });
  }