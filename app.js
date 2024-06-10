const express = require("express");
const app = express();
const serverPort = 8080;

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

app.use(express.json({extended: true}));
var bodyParser = require('body-parser');

app.use(bodyParser.json());     
app.use(express.urlencoded());

app.use('/static', express.static('static'));
app.use('/static/lang', express.static('lang'));
app.use('/static/includes', express.static('includes'));

const fs = require('fs');
var path = require('path');
var glob = require( 'glob' );

app.engine('pug', require('pug').__express)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


//Start Server  
const server = app.listen(serverPort, () => {
    console.log('App running on port '+serverPort);
});



//Language
function languageTransform(string){
    if(string == 'en'){
        return 1;
    }else{
        return 0;
    }
}


//Navigation
async function getNavigation() {
    const response = await fetch("https://env-9468449.appengine.flow.ch/items/Navigation_translations");
    if (!response.ok) {
        console.log('Response not okay');
        const data = '';
        return data;
    }else
    {
        const data = await response.json();
        return data;
    }
}

//News
async function getNews() {
    const response = await fetch("https://env-9468449.appengine.flow.ch/items/News?fields[]=*.*");
    if (!response.ok) {
        console.log('Response not okay');
        const data = '';
        return data;
    }else
    {
        const data = await response.json();
        return data;
    }
}

//Footer
async function getFooter() {
    const response = await fetch("https://env-9468449.appengine.flow.ch/items/Footer_translations");
    if (!response.ok) {
        console.log('Response not okay');
        const data = '';
        return data;
    }else
    {
        const data = await response.json();
        return data;
    }
}







//Timetable
async function getAllEvents() {
    const response = await fetch("https://env-9468449.appengine.flow.ch/items/Navigation_translations");
    const data = await response.json();
    return data;
}

app.get("/timetable", async function (req, res) {

    try { 
        result = await getAllEvents();
        res.render('timetable', result);
        console.log('', result);
    
        res.status(200).json();
        res.end;
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching events");
    }
});

//Page
async function getPage(pageSlug) {
    console.log(pageSlug);
    const response = await fetch("https://env-9468449.appengine.flow.ch/items/Pages/?filter[slug][_eq]="+pageSlug+"&fields[]=*.*");
    if (!response.ok) {
        console.log('Response not okay');
        const data = '';
        return data;
    }else
    {
        const data = await response.json();
        return data;
    }
}

app.get("/pages/:pageSlug/:language?", async function (req, res) {

    try { 
        pageSlug = req.params.pageSlug;
        language = req.params.language  || 'en';

        //console.log(language);
        result = await getPage(pageSlug);
        navigation = await getNavigation();
        footer = await getFooter();
        news = await getNews();

        //console.log(result.data[0]);
        languageObject = [language,languageTransform(language)];
        if(result.data[0]){
            console.log(languageObject);
            res.render('page',{data:result.data[0],navigation:navigation.data,footer:footer.data,language:languageObject,news:news.data});
        }

    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching page");
    }
});


//Event
async function getEvent(eventSlug) {
    console.log(eventSlug);
    const response = await fetch("https://env-9468449.appengine.flow.ch/items/Events/?filter[slug][_eq]="+eventSlug+"&fields[]=*.*");
    if (!response.ok) {
        console.log('Response not okay');
        const data = '';
        return data;
    }else
    {
        const data = await response.json();
        return data;
    }
}

app.get("/events/:eventSlug", async function (req, res) {

    try { 
        eventSlug = req.params.eventSlug;
        result = await getEvent(eventSlug);
        console.log(result.data[0]);
        res.render('event', {data:result.data[0]});
    
        res.status(200).json();
        res.end;
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching page");
    }
});


//Startpage
async function getStartpage() {
    const response = await fetch("https://env-9468449.appengine.flow.ch/items/Startpage?fields[]=*.*.*");

    if (!response.ok) {
        console.log('Response not okay');
        const data = '';
        return data;
    }else
    {
        const data = await response.json();
        return data;
    }
}

app.get("/:language?", async function (req, res) {

    try { 
        language = req.params.language  || 'en';

        result = await getStartpage();
        navigation = await getNavigation();
        footer = await getFooter();
        news = await getNews();

        languageObject = [language,languageTransform(language)];

        //console.log(result);
        //console.log(language);

        if(result){
             res.render('startpage',{data:result.data,navigation:navigation.data,footer:footer.data,news:news.data,language:languageObject});
        }

    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching page");
    }
});













//404
/* app.get('*', function(req, res){
    res.status(404).send('what???');
}); */


// robots.txt
app.get('/robots.txt', function (req, res) {
    res.type('text/plain');
    res.send("User-agent: *");
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