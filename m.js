/**
 * HTML5音乐播放器js文件 for mobile
 * Author : 乔雨
 * Created on : 2013-02-11 20:25:00
 */

(function(){
	/**
	 * [$ 获取DOM对象方法]
	 * @param  {[string]} id [#id]
	 * @return {[object]}    [DOM对象]
	 */
	function $(id){
		return 'string' == typeof id ? document.getElementById(id) : false;
	}
	/**
	 * 添加事件监听
	 * @param {object}  element 要添加坚挺的元素
	 * @param {string}  type    事件类型 如 click
	 * @param {function}  handler 事件处理函数
	 * @param {Boolean} isBu    是否冒泡 可取 true  or false
	 */
	function addE(element, type, handler, isBu){
	    isBu = isBu == '' ? false : isBu;
	    //添加事件，兼顾IE
	    if (element.addEventListener){
	        element.addEventListener(type, handler, isBu);
	    } else if (element.attachEvent){
	        element.attachEvent('on'+type, handler);
	    } else {
	        element['on'+type] = handler;
	    }
	}
	/**
	 * 移除事件处理
	 */			
	function removeE(element, type, handler, isBu){
		isBu = isBu == '' ? false : isBu;
	    if(element.removeEventListener){
	        element.removeEventListener(type, handler, isBu);
	    }
	}
	/**
	 * Tween算法实现
	 * @type {Object}
	 */
	function tween(t,b,c,d){
		return c*((t=t/d-1)*t*t + 1) + b;
	}	
	/**
	 * 发送get请求
	 * @param  {[function]} callback [处理ajax服务器返回结果的回调函数]
	 * @param  {[string]} url [请求的url]
	 * @return {[string]}     [返回 服务器返回的字符串  一般为json数据]
	 */
	function get(url,callback,isTrue){
		//检测是否设置了异步加载
		isTrue = isTrue == undefined ? true : false;
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4){
				if(xhr.status == 200){
	             	callback(xhr.responseText);
	         	}
			} 
		}
		xhr.open('get', url, isTrue);
		xhr.send(null);
	}
	/**
	 * 
	 */
	var player      = $('player')
	var channelName = $('channelName');
	var songsName   = $('songsName');
	var artist      = $('artist');
	var albumTitle  = $('albumTitle');
	var albumPic    = $('albumPic');
	var channelList  = $('channelList');
	var controlBar = $('controlBar')
	var fLyric = $('fLyric')
	/**
	 * 预定义变量
	 */
	var currentChannelList = 361;   //当前频道   初始化时 默认频道
	var songs, i=0;  //初始化歌曲，默认播放第一首
	/*---------------------------------------------------------------------------------*/
	/**
	 * 获取播放列表
	 * @param  {num} channel 频道号码
	 * @return {object}         包含歌曲信息的对象表示
	 */
	function getPlayList(more){
		//开始播放最后一首歌时，获取新的播放列表
		if(more == 'more'){
			get('do.php?do=getlist&channel='+currentChannelList, newPlayList);
			function newPlayList(playList){
				setNewPlayList(JSON.parse(playList));
			}
			return true;
		}
		//默认的 首次加载时  初始化的 获取播放列表  调用play方法 初始化播放器
		get('do.php?do=getlist&channel='+currentChannelList, play);
		addE(channelList, 'click', getList);
		function getList(event){
			currentChannelList = event.target.getAttribute('channelid');
			get('do.php?do=getlist&channel='+currentChannelList, play);
		}
	}
	/**
	 * 自动续播 设置 新的播放列表  并将当前歌曲指针初始化为0
	 * @param {[type]} playList [description]
	 */
	function setNewPlayList(playList){
		songs = playList;
		i = 0;
	}
	/**
	 * 鼠标播放控制函数
	 * @param  {[object]} event [事件对象]
	 * @return {[null]}       [无返回值]
	 */
	function mouseControl(event){
		// 控制 播放/暂停 功能  
		if(event.target.id == 'pause'){
			playOrPause();
		}
		// 点击 pre 按钮时  播放 上一首
		if(event.target.id == 'pre'){
			playSong('pre');
		}
		// 点击 next 按钮时  播放 下一首
		if(event.target.id == 'next'){
			playSong();
		}
	}
	/**
	 * 播放/暂停控制   自动判断当前播放状态  并切换相应的图标
	 */
	function playOrPause(){
		if(player.paused){
			player.play();
			pause.style.background = "url('./image/mbutton.png') 50px -50px no-repeat";
		}else{
			player.pause();
			pause.style.background = "url('./image/mbutton.png') 50px -1px no-repeat";
		}
	}
	/*---------------------------------------------------------------------------------*/
	/**
	 * [play 播放器控制函数]
	 * @param  {[string]} playList [服务器返回的播放列表]
	 * @return {[null]}          [无返回值]
	 */
	function play(playList){
		// 获取默认播放列表，默认结构为 array(0=>array(song1 info), 1=>array(song2 info), ...)
		songs = JSON.parse(playList);
		//页面载入时 可以自动开始请求列表 并播放
		playSong();
		//一曲结束之后 自动播放下一首
		addE(player, 'ended', playSong);
		//鼠标点击播放控制事件监听
		addE(controlBar, 'click', mouseControl);
		//设置 显示播放时间
		addE(player, 'timeupdate', showTime);
	}
	/**
	 * 播放歌曲  根据播放列表
	 * @param   [opt]   [opt取值为 pre 时，播放上一曲]
	 * @return {[null]}       {[无返回值]}
	 */
	function playSong(opt){
		//上一曲
		if(opt == 'pre' && i > 0){
			if (i>1) { i = i-2; } else { i--; }
		}
		//设置显示歌曲信息
		player.src = songs[i].url;  //切换歌曲地址，实现下一曲播放
		channelName.innerHTML = songs[i].channel;
		songsName.innerHTML = songs[i].title;
		artist.innerHTML = songs[i].artist;
		albumTitle.innerHTML = songs[i].albumtitle;
		lyric = anaLyric(songs[i].lyric);
		//获取待处理图片 替换是为了取得大图地址
		albumPic.src = songs[i].picture.replace('newalbum_64', 'newalbum_200'); 
		//当前播放曲目计数
		if (i < songs.length) { i++; }
		//播放至最后一首时   请求刷新播放列表
		if (i == songs.length) { getPlayList('more');}
	}
	/**
	 * 生成合适的格式来显示播放时间
	 * @return {[type]} [description]
	 */
	function showTime(){
		//显示当前时间位置
		var c = player.currentTime;	//当前播放时间
		// console.log(c);
		var d = player.duration;  //总时长
		if (c > 1) {  var b = player.buffered.end(0); }; // 已缓冲的时长  延时1s防止出现下标错误
		var w = 480;			//指示条像素长度
		var timeNow;
		//设置播放和缓冲指示条宽度 使之可以每秒钟随播放时间变化
		pointer.style.width = Math.floor(c/d*w)+'px';
		loading.style.width = Math.floor(b/d*w)+'px';
		//点击切换播放位置
		// addE(timeLine, 'click', gotoSomeTime);
		if(c < 60){
			timeNow = c<10 ? '00:0'+Math.floor(c) : '00:'+Math.floor(c);
		} else {
			if(c % 60 < 10){ 
				timeNow = '0'+Math.floor(c / 60)+':0'+Math.floor(c % 60);
			} else {
				timeNow = '0'+Math.floor(c / 60)+':'+Math.floor(c % 60);
			}
		}
		startTime.innerHTML = timeNow;
		//显示音乐总时长
		if(d > 0){
			var dut = Math.floor(d);
			var dutS = Math.floor(dut/60) < 10 ? '0'+Math.floor(dut/60) : Math.floor(dut/60);
			var dutE = Math.floor(dut%60) < 10 ? '0'+Math.floor(dut%60) : Math.floor(dut%60);
			dut = dutS+':'+dutE;
			endTime.innerHTML = dut;
		}
		/**
		 * 根据点击位置来动态改变当前播放位置
		 * @param  {[object]} event [事件对象引用]
		 * @return {[type]}       [description]
		 */
		function gotoSomeTime(event){
			var pointerPosition = event.clientX - getOffsetLeft(timeLine);
			pointer.style.width = pointerPosition+'px';
			player.currentTime = pointerPosition / w * d;
		}
		// console.log(lyric);
		showLyric();
		/**
		 * 歌词处理
		 */
		 function showLyric(){
		 	try{
		 		var ct = Math.round(c);
		 		// console.log(lyric[ct]);
			 	if(lyric[ct]){
			 		setTimeout(function(){fLyric.innerHTML = lyric[ct];}, 600);
			 	}
		 	} catch(e) {}
		}
	}
	/**
	 * 解析歌词
	 */
	function anaLyric(lyric){
		if(lyric == '') return;
		 	var lyricArr = lyric.split('\n');
		 	var lyricObj = {};
		 	for(l = 0; l < lyricArr.length; l++){
		 		var lineArr = lyricArr[l].split(']');
		 		var timeIndex = parseFloat(parseInt(lineArr[0].substr(1,2)*60)+parseInt(lineArr[0].substr(4,2))+'.'+parseInt(lineArr[0].substr(7,2)));
		 		var timeIndexs = Math.round(timeIndex);   //暂时支持秒级匹配
		 		lyricObj[timeIndexs] = lineArr[1];
			}
		 	// console.log(lyric);
		 	// console.log(lyricArr);
			// console.log(lyricObj);
			return lyricObj;
	}
	/**
	 * 链接人人网服务器，可能是某种认证方式吧，必须连接 否则无法播放
	 * @return {[type]} [description]
	 */
	function connectRenren(){
		try{
			var renren = new Image();
			renren.src = 'http://music.renren.com/fm';
		} catch(e) {

		}
	} 
	/**
	 * 检测浏览器
	 */
	function isChrome(){
		if(navigator.userAgent.indexOf('Android') == -1){
			console.log(navigator.userAgent);
			location.href = 'nochrome.html';
			return true;
		}
	}
	/*---------------------------------------------------------------------------------*/
	//执行初始化
	addE(window, 'load', function(){
		// if(isChrome()) return;
		connectRenren();	//连接人人，完成认证
		getPlayList();  	//获取列表 初始化播放器 开始播放
	});
})();