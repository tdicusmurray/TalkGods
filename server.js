var fs = require('fs');
var privateKey = fs.readFileSync('/etc/letsencrypt/live/talkgods.com/privkey.pem', 'utf8');
var certificate = fs.readFileSync('/etc/letsencrypt/live/talkgods.com/fullchain.pem', 'utf8');

var credentials = { key: privateKey, cert: certificate };
var https = require('https');

var httpsServer = https.createServer(credentials);
httpsServer.listen(1337);

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({
    server: httpsServer
});

var fs = require('fs');
var PeerServer = require('peer').PeerServer;
 
var server = PeerServer({
  port: 7777,
  allow_discovery: true,
  ssl: {
    key: fs.readFileSync('/etc/letsencrypt/live/talkgods.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/talkgods.com/fullchain.pem')
  }
});
server.on('connection', (client) => {
  console.log(client);
}); 

const { Client } = require('pg');
const database = new Client({user: 'postgres',host: 'localhost',database: 'TalkGods',password: 'red832',port: 5432});

database.connect();

database.query('LISTEN new_post');
const eventDatabase = new Client({user: 'postgres',host: 'localhost',database: 'TalkGods',password: 'red832',port: 5432});
eventDatabase.connect();


wss.on('connection', function connection(connection) {
    database.on('notification', function(msg) {
      connection.send(JSON.stringify(msg));
    });

    connection.on('message', function(message) {
      var messageObject = JSON.parse(message);
      function send(tag, data) {
  data.push({type: tag});
  connection.send(JSON.stringify(data));
}
      switch(messageObject.type) {

       case "tag":
        eventDatabase.query("SELECT * FROM tag WHERE name LIKE ($1) LIMIT 15;", ["%"+messageObject.data+"%"])
        .then( res => {send("tag",res.rows); }, err => {console.error(err)});
      break;
      case "cryptohashcash":
        eventDatabase.query("SELECT * FROM tag;")
        .then( res => {send("cryptohashcash",res.rows); }, err => {console.error(err)});
      break;
      case "payment":
          var stripe = require("stripe")("sk_test_G1N9qxAcSJmpdv8Aj9geA0Bu");
          stripe.customers.create({
            description: 'New Customer',
            source: messageObject.data 
          }, function(err, customer) {
          });
      break;
      case "timeline":
        eventDatabase.query("SELECT post.*,person.first_name FROM post LEFT JOIN person ON (post.person_id = person.id) WHERE person_id = 1 ORDER BY id DESC LIMIT 15;")
        .then( res => {send("timeline",res.rows); }, err => {console.error(err)});
      break;
      case "full_name":
        eventDatabase.query("SELECT first_name,last_name FROM person WHERE id = ($1);",[messageObject.data])
        .then( res => {send("full_name",res.rows); }, err => {console.error(err)});
      break;
      case "chat_message":
        eventDatabase.query("INSERT INTO message (sender_id, receiver_id, message) VALUES( ($1), ($2), ($3) ) RETURNING *;",[1,1,messageObject.message])
        .then( res => {send("active_chat_messages",res.rows); }, err => {console.error(err)});
      break;
      case "active_chat_messages":
        eventDatabase.query("SELECT message.*,person.first_name,person.last_name FROM message LEFT JOIN person ON( message.sender_id = person.id ) WHERE sender_id = ($1) OR receiver_id = ($1) ORDER BY message.id ASC;",[messageObject.data])
        .then( res => {send("full_chat",res.rows); }, err => {console.error(err)});
      break;
     case "post":
        eventDatabase.query("INSERT INTO post (person_id,text) VALUES ( ($1), ($2) ) RETURNING *;",[1, messageObject.data])
        .then( res => {send("success",res.rows); }, err => {console.error(err)});
     break;
     case "voip_call":
          var twilio = require('twilio');
          var accountSid = 'ACfcb10fa6f5778c0ee76dbacef2e4df59';
          var authToken = 'a3e0e545a0414ebf004579f563ef38c5';
          const client = require('twilio')(accountSid, authToken);

          client.calls.create({
               url: 'http://demo.twilio.com/docs/voice.xml',
               to: '+17028485785',
               from: '+14132676705'
          }).then(call => console.log(call.sid));
          break;
      }
    });
    connection.on('close', function(connection) {});
});

var fs = require('fs');
const http = require('http');
var https = require('https');
const express = require('express');
const ClientCapability = require('twilio').jwt.ClientCapability;

var privateKey = fs.readFileSync('/etc/letsencrypt/live/talkgods.com/privkey.pem', 'utf8');
var certificate = fs.readFileSync('/etc/letsencrypt/live/talkgods.com/fullchain.pem', 'utf8');

var credentials = { key: privateKey, cert: certificate };
const app = express();
// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'https://198.199.69.48/');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
app.get('/token', (req, res) => {
  // put your Twilio API credentials here
  const accountSid = 'ACfcb10fa6f5778c0ee76dbacef2e4df59';
  const authToken = 'a3e0e545a0414ebf004579f563ef38c5';

  // put your Twilio Application Sid here
  const appSid = 'APb36d85f12e9e69d5d5dd99a802a7efa5';

  const capability = new ClientCapability({
    accountSid: accountSid,
    authToken: authToken,
  });
  capability.addScope(
    new ClientCapability.OutgoingClientScope({ applicationSid: appSid })
  );
  capability.addScope(new ClientCapability.IncomingClientScope('joey'));
  const token = capability.toJwt();

  res.set('Content-Type', 'application/jwt');
  res.send(token);
});

app.post('/voice', (req, res) => {

const VoiceResponse = require('twilio').twiml.VoiceResponse;

response = new VoiceResponse();
response.say({
    voice: 'woman',
    language: 'en'
}, 'I will rule the world with an iron fist, and our enemies shall fall!');

const dial = response.dial({
    callerId: '+14132676705'
});
dial.number('+17028485785');
res.send(response.toString());
});

var twilioserver = https.createServer(credentials, app);
twilioserver.listen(1338);
console.log('Twilio Client app server running at https://127.0.0.1:1338/token/');