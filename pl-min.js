(function(){function $(id){return'string'==typeof id?document.getElementById(id):false;}
function addE(element,type,handler,isBu){isBu=isBu==''?false:isBu;if(element.addEventListener){element.addEventListener(type,handler,isBu);}else if(element.attachEvent){element.attachEvent('on'+type,handler);}else{element['on'+type]=handler;}}
function removeE(element,type,handler,isBu){isBu=isBu==''?false:isBu;if(element.removeEventListener){element.removeEventListener(type,handler,isBu);}}
function tween(t,b,c,d){return c*((t=t/d-1)*t*t+1)+b;}
function get(url,callback,isTrue){isTrue=isTrue==undefined?true:false;var xhr=new XMLHttpRequest();xhr.onreadystatechange=function(){if(xhr.readyState==4){if(xhr.status==200){callback(xhr.responseText);}}else{}}
xhr.open('get',url,isTrue);xhr.send(null);}
function getOffsetLeft(element){var offset=element.offsetLeft;var current=element.offsetParent;while(current!==null){offset+=current.offsetLeft;current=current.offsetParent;}
return offset;}
var player=$('audioPlayer');var channelList=$('channelList');var channelName=$('channelName');var songsName=$('songsName');var artist=$('artist');var albumTitle=$('albumTitle');var albumPicture=$('albumPicture');var albumPic=$('albumPic');var startTime=$('startTime');var endTime=$('endTime');var timeLine=$('timeLine');var pointer=$('pointer');var loading=$('loading');var controls=$('controlButton');var pause=$('pause');var fLyric=$('fLyric');var sLyric=$('sLyric');var currentChannelList=361;var songs,i=0;function setAlbumPic(){var picUrl='./image/music/'+Math.floor(Math.random()*7+1)+'.png';albumPicture.src=picUrl;}
function setBackgroundPic(){var picUrl='image/background1.jpg';document.body.style.backgroundImage='url(\''+picUrl+'\')';}
function moveAlbumPic(){addE(albumPic,'mouseover',move);function move(){setTimeout(setDefer,388);function setDefer(){var b=0,t=0,d=100;if(albumPic.style.left==0||albumPic.style.left=='0px'){var c=300;}else if(albumPic.style.left=='300px'){var b=300,c=-300;}
moveByTween();function moveByTween(){albumPic.style.left=tween(t,b,c,d)+'px';if(t<d){t++;setTimeout(moveByTween,5);}}}}}
function getPlayList(more){if(more=='more'){get('do.php?do=getlist&channel='+currentChannelList,newPlayList);function newPlayList(playList){setNewPlayList(JSON.parse(playList));}
return true;}
get('do.php?do=getlist&channel='+currentChannelList,play);addE(channelList,'click',getList);function getList(event){currentChannelList=event.target.getAttribute('channelid');get('do.php?do=getlist&channel='+currentChannelList,play);}}
function setNewPlayList(playList){songs=playList;i=0;}
function mouseControl(event){if(event.target.id=='pause'){playOrPause();}
if(event.target.id=='next'){playSong();}}
function volumControl(event){var volume=Math.round(player.volume*10)/10;console.log('volume : ',volume);if(event.wheelDelta>0){if(volume<1){player.volume=volume+0.1;};}else{if(volume>0){player.volume=volume-0.1;};}}
function keyboardControl(event){if(event.ctrlKey&&event.keyCode==38){playOrPause();}
if(event.ctrlKey&&event.keyCode==39){playSong();}
if(event.ctrlKey&&event.keyCode==37){playSong('pre');}}
function playOrPause(){if(player.paused){player.play();pause.style.background="url('./image/button.png') -120px -51px";}else{player.pause();pause.style.background="url('./image/button.png') 0px -150px";}}
function play(playList){songs=JSON.parse(playList);playSong();addE(player,'ended',playSong);addE(controls,'click',mouseControl);addE(document,'mousewheel',volumControl);addE(document,'keydown',keyboardControl);addE(player,'timeupdate',showTime);}
function playSong(opt){if(opt=='pre'&&i>0){if(i>1){i=i-2;}else{i--;}}
player.src=songs[i].url;channelName.innerHTML=currentChannelList;songsName.innerHTML='<a href="'+songs[i].url+'" title="点击下载">'+songs[i].title+'</a>';artist.innerHTML=songs[i].artist;albumTitle.innerHTML='<a target="_blank" title="点此搜索" href="http://www.google.cn/music/search?q='+songs[i].title+'">'+songs[i].albumtitle+'</a>';albumPicture.style.display='none';lyric=anaLyric(songs[i].lyric);var newPic=new Image();newPic.src=songs[i].picture.replace('newalbum_64','newalbum_200');newPic.onload=function(){var sw=newPic.width;var sh=newPic.height;newPic.width=300;newPic.height=300/sw*sh;newPic.style.marginTop=-(newPic.height-300)/2;albumPic.replaceChild(newPic,albumPic.firstChild);}
if(i<songs.length){i++;}
if(i==songs.length){getPlayList('more');}}
function showTime(){var c=player.currentTime;var d=player.duration;if(c>1){var b=player.buffered.end(0);};var w=280;var timeNow;pointer.style.width=Math.floor(c/d*w)+'px';loading.style.width=Math.floor(b/d*w)+'px';addE(timeLine,'click',gotoSomeTime);if(c<60){timeNow=c<10?'00:0'+Math.floor(c):'00:'+Math.floor(c);}else{if(c%60<10){timeNow='0'+Math.floor(c/60)+':0'+Math.floor(c%60);}else{timeNow='0'+Math.floor(c/60)+':'+Math.floor(c%60);}}
startTime.innerHTML=timeNow;if(d>0){var dut=Math.floor(d);var dutS=Math.floor(dut/60)<10?'0'+Math.floor(dut/60):Math.floor(dut/60);var dutE=Math.floor(dut%60)<10?'0'+Math.floor(dut%60):Math.floor(dut%60);dut=dutS+':'+dutE;endTime.innerHTML=dut;}
function gotoSomeTime(event){var pointerPosition=event.clientX-getOffsetLeft(timeLine);pointer.style.width=pointerPosition+'px';player.currentTime=pointerPosition/w*d;}
showLyric();function showLyric(){var ct=Math.round(c);console.log(lyric[ct]);if(lyric[ct]){setTimeout(function(){fLyric.innerHTML=lyric[ct];},600);}}}
function anaLyric(lyric){if(lyric=='')return;var lyricArr=lyric.split('\n');var lyricObj={};for(l=0;l<lyricArr.length;l++){var lineArr=lyricArr[l].split(']');var timeIndex=parseFloat(parseInt(lineArr[0].substr(1,2)*60)+parseInt(lineArr[0].substr(4,2))+'.'+parseInt(lineArr[0].substr(7,2)));var timeIndexs=Math.round(timeIndex);lyricObj[timeIndexs]=lineArr[1];}
return lyricObj;}
function desktopNotice(pic,title,content){var notice=window.webkitNotifications;if(notice){if(notice.checkPermission()==0){var notification=notice.createNotification(pic,title,content);notification.ondisplay=function(){setTimeout(function(){notification.cancel();},5000);};notification.replaceId='songs';notification.show();}else{notice.requestPermission();}}else{console.log('浏览器不支持桌面通知！');}}
function connectRenren(){var renren=new Image();renren.src='http://music.renren.com/fm';}
function isChrome(){if(navigator.userAgent.indexOf('Chrome')==-1){location.href='nochrome.html';return true;}}
function local(){var playlist=[{title:"仰望",artist:"杨丞琳",albumtitle:"仰望",url:"./media/1.mp3",picture:"./media/pic/1.jpg"},{title:"A Little Love",artist:"冯曦妤",albumtitle:"A Little Love",url:"./media/2.mp3",picture:"./media/pic/2.jpg"},{title:"改变",artist:"张靓颖",albumtitle:"来不及说爱你",url:"./media/3.mp3",picture:"./media/pic/3.jpg"},{title:"Walk Me Home",artist:"Mandy Moore",albumtitle:"The Best of Mandy Moore",url:"./media/4.mp3",picture:"./media/pic/4.jpg"},{title:"我们的纪念日",artist:"范玮琪",albumtitle:"我们的纪念日",url:"./media/5.mp3",picture:"./media/pic/5.jpg"}];return JSON.stringify(playlist);}
addE(window,'load',function(){setBackgroundPic();connectRenren();setAlbumPic();moveAlbumPic();getPlayList();});})();