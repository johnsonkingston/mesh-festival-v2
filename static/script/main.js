const socket = io();

var currentMembers = [];
var fixedElements = [];
var fixedElementsXTranslate = 0;
var padding;
var subtitles = [];
var windowWidth = $(window).width();
var windowHeight = $(window).height();

var id;
var idSelf = socket.id;

var currentMousePos = { id: idSelf, x: -1, y: -1 };

function newJoin(data){
    console.log(data.id+' joined!');
    currentMembers[data.id] = data.id;
    id = data.id;

    idSelf = socket.id;

    if(id !== idSelf){
        $('body').append('<div class="cursor" id="'+data.id+'" onmouseover="meeting(this)">'+data.id.substr(0,4).toUpperCase()+'</div>');
    }else{
        $('body').append('<div class="cursor" id="'+data.id+'">'+data.id.substr(0,4).toUpperCase()+'</div>');
    }

    $('#status').html('<div class="status">'+data.id.substr(0,4).toUpperCase()+' joined!</div>');
    $('#members').append('<div class="member" id="member'+data.id+'">'+data.id.substr(0,4).toUpperCase()+'</div>');

    setTimeout(() => {
        clearStatus();
    }, "2000");
}

function clearStatus(){
    $('#status').html('');
}





$(document).mousemove(function(event) {
    currentMousePos.x = event.clientX/windowWidth;
    currentMousePos.y = event.clientY/windowHeight;
    socket.emit('move',currentMousePos);
});  

socket.on('moveTo', function(data){
    if(data.id in currentMembers){
        $('#'+data.id).css('left',data.x*windowWidth);
        $('#'+data.id).css('top',data.y*windowHeight);      
    }else{
        newJoin(data);
    }
});

function removeItem(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }


socket.on('left', function(data){
    console.log(data+' left!');
    $('#status').html('<div class="status">'+data.substr(0,4).toUpperCase()+' left!</div>');
    $('#'+data).remove();
    $('#member'+data).remove();
    console.log(currentMembers);
    removeItem(currentMembers, data);
    setTimeout(() => {
        clearStatus();
    }, "2000");
});

function sendJoined(){
    socket.emit('move',0);
}
sendJoined();
setInterval(sendJoined, 2000);


function meeting(element){
    var meetingPoint = {};
    meetingPoint.x = parseInt($(element).css('left'))/windowWidth;
    meetingPoint.y = parseInt($(element).css('top'))/windowHeight;
    socket.emit('meeting', meetingPoint);
}

socket.on('meetingSend', function(data){
    var meetingID = new Date().getTime();
    $('body').append('<div class="meetingPoint" id="meet_'+meetingID+'" style="left:'+data.x*100+'vw;top:'+data.y*100+'vh;"><img src="static/img/meetings/'+Math.floor(Math.random() * (32 - 1 + 1) + 1)+'.jpg"></div>');
    setTimeout(() => {
        $('#meet_'+meetingID).fadeOut( "slow", function() {
            $('#meet_'+meetingID).remove();
        });
      }, "2000");

});


// Scroll positioning
$(window).scroll(function() {
    var $height = $(window).scrollTop();
    if($height > 100) {
            $('.bubblesRight').addClass('bubblesMove');
            $('.videoSubtitleWrap').addClass('videoSubtitleWrapReduced');
            $('.columnBackground').addClass('columnBackgroundMove');
            $('#lang').fadeOut();
        } else {
            $('.bubblesRight').removeClass('bubblesMove');
            $('.videoSubtitleWrap').removeClass('videoSubtitleWrapReduced');
            $('.columnBackground').removeClass('columnBackgroundMove');
            $('#lang').fadeIn();

        }
});

function setFixedElements(){
    padding = $(window).width()*0.008;
    fixedElementsXTranslate = padding;
    $('.H2desktop').each(function( index ) {
        fixedElements.push($(this));
        $(this).css('margin-left',fixedElementsXTranslate);
        fixedElementsXTranslate += $(this).outerWidth()+padding;
    });
}
$( document ).ready(function() {
    windowWidth = $(window).width();    
    windowHeight = $(window).height();
    setFixedElements();
});
$( window ).on( "resize", function() {
    setFixedElements();
    windowWidth = $(window).width();    
    windowHeight = $(window).height();
});

$(window).scroll(function(){

    function elementScrolled(elem)
    {
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();
        var elemTop = elem.offset().top;
        return ((elemTop <= docViewBottom) && (elemTop >= docViewTop));
    }

    $(fixedElements).each(function( index ) {
        if(elementScrolled($(this))) {
            $(this).addClass('stickyNavItem');
        }
    });
});




//Subtitle function
var subtitleCounter = 1;

subtitle();

function subtitle(){
    setInterval(function() {
        $('.videoSubtitleLine').hide();
        $('#videoSubtitleLine'+subtitleCounter).show();
        subtitleCounter++;
        if(subtitleCounter > $('.videoSubtitleWrap').attr('data-max')){
            subtitleCounter=1;
        }
    }, 300);
};

function subtitleChange(subtitleText){
    subtitleCounter = 0;
    $('.videoSubtitleWrap').html('');
    var subtitleLines = subtitleText.split(' ');
        $(subtitleLines).each(function( index ) {
            subtitleCounter++;
            $('.videoSubtitleWrap').append('<div class="videoSubtitleLine" id="videoSubtitleLine'+subtitleCounter+'">'+this+'</div>');
        });
        subtitleCounter++;
        $('.videoSubtitleWrap').append('<div class="videoSubtitleLine" id="videoSubtitleLine'+subtitleCounter+'">&nbsp;</div>');
        $('.videoSubtitleWrap').attr('data-max',subtitleCounter);
}




// Navigation
function scrolltoContent(contentId){
    $('html, body').animate({
        scrollTop: $("#"+contentId).offset().top
    }, 500);
}


$( ".mobileH2" ).on( "click", function(element) {
    console.log(element);
    $('html, body').animate({
        scrollTop: $(this).offset().top-10
    }, 500);

} );


//Colors
var currentColor = 0;
var changeTime = 0;

const videoElement = document.getElementById('mainVideo');


function changeColors(){ 
    $(':root').css('--color1', colors[currentColor].color1);
    $(':root').css('--color2', colors[currentColor].color2);
    $('#bubbleLeftVideo').attr('src','static/videos/01-'+(currentColor+1)+'-'+lang+'.mp4')
    $('#bubbleRightVideo').attr('src','static/videos/02-'+(currentColor+1)+'-'+lang+'.mp4')

    subtitleChange(colors[currentColor].subtitle);

    //console.log('change to: '+changeTime);
    currentColor++;


    if(currentColor > colors.length-1){
        currentColor = 0;
        changeTime = videoElement.duration - 0.3;
    }else{
        changeTime = colors[currentColor].time;
    }

    //console.log('next change: '+changeTime);
}



//Video
videoElement.addEventListener('timeupdate', () => {
    const currentTime = videoElement.currentTime;
    if(currentTime > changeTime){
        changeColors();
    }
});




// Create cookie
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// Delete cookie
function deleteCookie(cname) {
    const d = new Date();
    d.setTime(d.getTime() + (24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=;" + expires + ";path=/";
}

// Read cookie
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// Set cookie consent
function acceptCookieConsent(){
    deleteCookie('user_cookie_consent');
    setCookie('user_cookie_consent', 1, 30);
    document.getElementById("cookieNotice").style.display = "none";
}

let cookie_consent = getCookie("user_cookie_consent");
if(cookie_consent != ""){
    document.getElementById("cookieNotice").style.display = "none";
}else{
    console.log('cookie_consent');

    document.getElementById("cookieNotice").style.display = "block";
}
    


//Analytics
//<![CDATA[
    var owa_baseUrl = 'https://johnsonkingston.ch/analytics/';
    var owa_cmds = owa_cmds || [];
    owa_cmds.push(['setSiteId', '4ee1809dd8d05ffe44e35fdc857a81b9']);
    owa_cmds.push(['trackPageView']);
    owa_cmds.push(['trackClicks']);
    
    (function() {
        var _owa = document.createElement('script'); _owa.type = 'text/javascript'; _owa.async = true;
        owa_baseUrl = ('https:' == document.location.protocol ? window.owa_baseSecUrl || owa_baseUrl.replace(/http:/, 'https:') : owa_baseUrl );
        _owa.src = owa_baseUrl + 'modules/base/dist/owa.tracker.js';
        var _owa_s = document.getElementsByTagName('script')[0]; _owa_s.parentNode.insertBefore(_owa, _owa_s);
    }());
//]]>