/**
 * HTML5音乐播放器js文件
 * Author : 乔雨
 * Created on : 2012-11-16 19:08:31
 */
/*---------------------------------------------------------------------------------*/
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
			} else {
				// setTimeout(function(){
				// 	console.log('fail load playlist online!');
				// 	var plist = local();
				// 	callback(plist);
				// }, 5000);
				// var plist = local();
				// callback(plist);
			}
		}
		xhr.open('get', url, isTrue);
		xhr.send(null);
	}
	/**
	 * 取得元素的左边偏移 offsetleft  距离最外层
	 */
	function getOffsetLeft(element){
		var offset = element.offsetLeft;
		var current = element.offsetParent;
		while(current !== null){
			offset += current.offsetLeft;
			current = current.offsetParent;
		}
		return offset;
	}
	/*---------------------------------------------------------------------------------*/
	/**
	 * 所有应用元素对象
	 */
	var player       = $('audioPlayer');
	var channelList  = $('channelList');
	var channelName  = $('channelName');
	var songsName    = $('songsName');
	var artist       = $('artist');
	var albumTitle   = $('albumTitle');
	var albumPicture = $('albumPicture');
	var albumPic     = $('albumPic');
	var startTime    = $('startTime');
	var endTime      = $('endTime');
	var timeLine     = $('timeLine');
	var pointer      = $('pointer');
	var loading      = $('loading');
	var controls     = $('controlButton');
	var pause        = $('pause');
	var fLyric       = $('fLyric');
	var sLyric       = $('sLyric');
	/**
	 * 预定义变量
	 */
	var title = document.title;
	var currentChannelList = 361;   //当前频道   初始化时 默认频道
	var songs, i=0;  //初始化歌曲，默认播放第一首
	/*---------------------------------------------------------------------------------*/
	/**
	 * 设置播放器封面背景图片 随机
	 */
	function setAlbumPic(){
		//Math.floor(Math.random()*7+1)   产生0-7的随机数字
		var picUrl = './image/music/'+Math.floor(Math.random()*7+1)+'.png';
		albumPicture.src = picUrl;
	}/**
	 * 设置背景图片 随机
	 */
	function setBackgroundPic(){
		//Math.floor(Math.random()*7+1)   产生0-7的随机数字
		// var picUrl = 'image/background'+Math.floor(Math.random()*13+1)+'.jpg';
		var picUrl = 'image/background1.jpg';
		document.body.style.backgroundImage = 'url(\''+picUrl+'\')';
		// console.log(document.body.style.backgroundImage);
		// console.log(picUrl);
	}
	/**
	 * 移动封面图片
	*/    
	function moveAlbumPic(){
		addE(albumPic, 'mouseover', move);  //添加鼠标事件监听
		/**
		 * 封面图片移动函数
		 * @return {null]
		 */
		function move(){
			setTimeout(setDefer, 388);   //延迟执行图片移动  为优化体验
			function setDefer(){
				var b = 0, t = 0, d = 100;
				//初始化位置为左边
				if(albumPic.style.left == 0 || albumPic.style.left == '0px'){
					var c = 300;
				} else if (albumPic.style.left == '300px'){
					var b = 300,c = -300;
				}
				//实现动画效果
				moveByTween();
				function moveByTween(){
					albumPic.style.left = tween(t,b,c,d)+'px';
				    if(t<d){
				        t++;
				        setTimeout(moveByTween, 5);
				    }
				}
			}
		}
	}
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
		// 点击 next 按钮时  播放 下一首
		if(event.target.id == 'next'){
			playSong();
		}
	}
	/**
	 * 鼠标滚轮音量控制
	 */
	function volumControl(event){
		var volume = Math.round(player.volume*10)/10;
		console.log('volume : ',volume);
		if(event.wheelDelta > 0){
			if (volume < 1) {player.volume = volume + 0.1;};
		} else {
			if (volume > 0) {player.volume = volume - 0.1;};
		}
	}	
	/**
	 * 键盘播放控制函数
	 * @param  {[object]} event [事件对象]
	 * @return {[null]}       [无返回值]
	 */
	function keyboardControl(event){
		if(event.ctrlKey && event.keyCode == 38){
			playOrPause();
		}
		if(event.ctrlKey && event.keyCode == 39){
			playSong();
		}
		if(event.ctrlKey && event.keyCode == 37){
			playSong('pre');
		}
		// console.log('keyCode : '+event.keyCode);
		
	}
	/**
	 * 播放/暂停控制   自动判断当前播放状态  并切换相应的图标
	 */
	function playOrPause(){
		if(player.paused){
			player.play();
			pause.style.background = "url('./image/button.png') -120px -51px";
		}else{
			player.pause();
			pause.style.background = "url('./image/button.png') 0px -150px";
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
		addE(controls, 'click', mouseControl);
		//鼠标滚轮音量控制
		addE(document, 'mousewheel', volumControl);
		//键盘控制播放事件监听  默认，下一曲：Ctrl+右箭头   暂停：Ctrl+上箭头
		addE(document, 'keydown', keyboardControl);
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
		document.title = songs[i].title+' - '+title;
		songsName.innerHTML = '<a href="'+songs[i].url+'" title="点击下载">'+songs[i].title+'</a>';
		artist.innerHTML = songs[i].artist;
		albumTitle.innerHTML = '<a target="_blank" title="点此搜索" href="http://music.baidu.com/search?key='+songs[i].title+'">'+songs[i].albumtitle+'</a>';
		albumPicture.style.display = 'none';
		desktopNotice(songs[i].picture, songs[i].title, songs[i].artist); //显示桌面通知
		// lyric = songs[i].lyric;
		lyric = anaLyric(songs[i].lyric);
		//图片加载完成时 对其进行缩放 到  宽为300px  高度等比例缩放并居中显示
		var newPic = new Image();  //新建image对象  完成实例化
		//获取待处理图片 替换是为了取得大图地址
		newPic.src = songs[i].picture.replace('newalbum_64', 'newalbum_200'); 
		//图片完全下载后  调用处理函数  onload事件方法
		newPic.onload =  function(){
			//取得原图宽高并保存此值
			var sw = newPic.width;
			var sh = newPic.height;
			//等比例缩放
			newPic.width = 300;
			newPic.height = 300/sw*sh;
			//设置 宽度缩放到300时  竖直居中显示
			newPic.style.marginTop = -(newPic.height-300)/2;
			//将新节点加入到DOM树 
			albumPic.replaceChild(newPic, albumPic.firstChild);
		}
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
		var w = 280;			//指示条像素长度
		var timeNow;
		//设置播放和缓冲指示条宽度 使之可以每秒钟随播放时间变化
		pointer.style.width = Math.floor(c/d*w)+'px';
		loading.style.width = Math.floor(b/d*w)+'px';
		//点击切换播放位置
		addE(timeLine, 'click', gotoSomeTime);
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
	 * [桌面通知功能实现函数]
	 * @param  {[string]} pic     [通知图标路径]
	 * @param  {[string]} title   [通知title]
	 * @param  {[string]} content [通知主体内容]
	 * @return {[无返回值]}         
	 */
	function desktopNotice(pic, title, content){
		var notice = window.webkitNotifications;  //获取通知接口对象，只支持chrome
		if(notice){	//判断是否获取成功
			if(notice.checkPermission() == 0){	//判断权限
				var notification = notice.createNotification(pic, title, content);
				//显示通知触发事件 延时3秒关闭通知
				notification.ondisplay = function(){setTimeout(function(){notification.cancel();}, 3000);};
				notification.replaceId = 'songs';  //设置replaceId替换之前的弹出通知，避免弹出多个通知
				notification.show();//显示通知到桌面
			} else {
				notice.requestPermission();//请求获取用户权限
			}
		} else {
			console.log('浏览器不支持桌面通知！');
		}
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
		if(navigator.userAgent.indexOf('Chrome') == -1){
			// console.log(navigator.userAgent.indexOf('Chrome'));
			location.href = 'nochrome.html';
			return true;
		}
	}
	/**
	 * 本地播放
	 */
	function local(){
		var playlist = [
			{
				title: "仰望",
				artist: "杨丞琳",
				albumtitle: "仰望",
				url: "./media/1.mp3",
				picture: "./media/pic/1.jpg"
			},
			{
				title: "A Little Love",
				artist: "冯曦妤",
				albumtitle: "A Little Love",
				url: "./media/2.mp3",
				picture: "./media/pic/2.jpg"
			},
			{
				title: "改变",
				artist: "张靓颖",
				albumtitle: "来不及说爱你",
				url: "./media/3.mp3",
				picture: "./media/pic/3.jpg"
			},
			{
				title: "Walk Me Home",
				artist: "Mandy Moore",
				albumtitle: "The Best of Mandy Moore",
				url: "./media/4.mp3",
				picture: "./media/pic/4.jpg"
			},
			{
				title: "我们的纪念日",
				artist: "范玮琪",
				albumtitle: "我们的纪念日",
				url: "./media/5.mp3",
				picture: "./media/pic/5.jpg"
			}
		];
		return JSON.stringify(playlist);
	}
	var channels = {};
	/*---------------------------------------------------------------------------------*/
	//执行初始化
	addE(window, 'load', function(){
		// if(isChrome()) return;
		setBackgroundPic();
		connectRenren();	//连接人人，完成认证
		setAlbumPic();		// 设置初始封面背景图片
		moveAlbumPic();		//封面可移动
		getPlayList();  	//获取列表 初始化播放器 开始播放
	});
})();