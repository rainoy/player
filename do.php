<?php
/**
 * description : 获取豆瓣电台的播放列表 返回json
 * 20120614   14:17
 * author : ariel
 */
//获取播放列表 并加载第一首歌曲
if($_GET['do'] == 'getlist'){
	$channel = $_GET['channel']+0;
	$channelList = array(
		"265" => "聆听寂寞",
		"349" => "早安",
		"266" => "华语怀旧",
		"341" => "晚安",
		"259" => "欧美流行",
		"142" => "新歌",
		"346" => "午后提神",
		"361" => "女声",
		"352" => "毕业时节",
		"350" => "童年",
		"288" => "欧美怀旧",
		"260" => "摇滚",
		"264" => "天籁纯音",
		"300" => "木吉他"
	);
	$url = 'http://fm.renren.com/fm/radio/change?radioId='.$channel.'&radioType=0';
	$json = file_get_contents($url);		//获取播放列表
	$songList = json_decode($json, true);	//解码json数据
	//构建新播放列表（去除原列表内无用杂项）
	$playList = array();
	foreach ($songList['songs'] as $key => $value) {
		$playList[$key]['title'] = $value['name'];
		$playList[$key]['artist'] = $value['artistName'];
		$playList[$key]['albumtitle'] = $value['albumName'];
		$playList[$key]['channel'] = $channelList[$channel];
		$playList[$key]['url'] = $value['src'];
		$playList[$key]['picture'] = $value['albumSrc'];
		$playList[$key]['lyric'] = $value['lyric'];
	}	
	// var_dump($playList);
	echo json_encode($playList);
}	
?>