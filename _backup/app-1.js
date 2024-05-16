
const express = require("express");
const app = express();
const serverPort = 8080;



app.use(express.json({extended: true}));
var bodyParser = require('body-parser');

app.use(bodyParser.json());     
app.use(express.urlencoded());

app.use('/static', express.static('static'));
app.use('/static/lang', express.static('lang'));

const fs = require('fs');
var path = require('path');
var glob = require( 'glob' );
var language_dict = {};

app.engine('pug', require('pug').__express)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


//Start Server  
const server = app.listen(serverPort, () => {
    glob.sync( 'static/lang/*.json' ).forEach( function( file ) {
        let dash = file.split("/");
        if(dash.length == 3) {
            let dot = dash[2].split(".");
          if(dot.length == 2) {
            let lang = dot[0];

            fs.readFile(file, function(err, data) {
              language_dict[lang] = JSON.parse(data.toString());
            });
        }
        }
      });
    console.log('App running on port '+serverPort);
});

// https://env-9468449.appengine.flow.ch/

// Renders
app.get('/robots.txt', function (req, res) {
    res.type('text/plain');
    res.send("User-agent: *");
});

app.get('/',(req,res) => {
    res.render('index', language_dict.de);
  });

app.get('/de',(req,res) => {
    res.render('index', language_dict.de);
}); 

app.get('/en',(req,res) => {
    res.render('index', language_dict.en);
});

app.get('/pugtest',(req,res) => {  
    res.render('pugtest', language_dict.de);
});


let exhibitions = [
    {
        id: 1,
        title: "Ausstellung Eins"
    },
    {
        id: 2,
        title: "Ausstellung Zwei"
    }
];




/*
const { createDirectus } = require('@directus/sdk');
const directus = new createDirectus({ url: 'https://env-9468449.appengine.flow.ch/' });

// Set authentication token
directus.auth.login({
    email: 'post@ivanweiss.net',
    password: 'boskop'
  }).then(() => {
    console.log('Directus client authenticated');
  }).catch(error => {
    console.error('Error authenticating Directus client:', error);
  });*/

app.get('/exhibition/:id', async (request, response) => {

    const exhibitionId = Number(request.params.id);
    const getExhibition = exhibitions.find((exhibition) => exhibition.id === exhibitionId);
  
    if (!getExhibition) {
      response.status(500).send('Exhibition not found.')
    } else {
      response.render("exhibition", getExhibition);
    }

    /*
    
    versuch mit directus
    
    try {
        // Fetch data from Directus
        const items = await directus.items('Pages').readMany();
    
        // Render the fetched data using a template engine (e.g., EJS)
        res.render('pugtest', { items });
      } catch (error) {
        // Handle errors
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
      }*/
  });


// Websocket
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:8100",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true
});

io.on('connection', function(socket) {
    var userId = socket.id;
    // console.log('joined: '+userId);
    socket.on('move', function(data){
        io.sockets.emit('moveTo', {id: userId,x:data.x, y:data.y});
    }); 
    socket.on('meeting', function(dataMeeting){
        console.log(dataMeeting)
        io.sockets.emit('meetingSend', {x: dataMeeting.x, y: dataMeeting.y } );
    }); 
    socket.on('disconnecting', function(socket){
        io.sockets.emit('left', userId);
    });
});