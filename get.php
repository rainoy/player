<?php
/**
 *  Document   	: 抓取MP3并存储于storage
 *  Created on 	: 2012-12-23 18:24:55
 *  Author     	: Ariel <wodi88@gmail.com>
 *  Description : This is only for Ariel.
 */

$st = new SaeStorage();
$domain = 'file';
//获取列表  并开始下载
$channel = 20;
$r = substr(md5(mt_rand(1,2)), 0, 10);
$url = 'http://douban.fm/j/mine/playlist?type=n&channel='.$channel.'&from=mainsite&r='.$r;
$json = file_get_contents($url);		//获取豆瓣播放列表
$songList = json_decode($json, true);	//解码json数据
//判断获取列表是否成功，失败时 退出执行
if(!$songList['r'] == 0){
	echo '{"msg":"从豆瓣获取列表失败！"}';
	exit();
}
//取出播放列表数组
$songs = $songList['song'];

// 循环下载播放列表内所有歌曲
foreach ($songs as $key => $value) {
	$mp3 = file_get_contents($value['url']);
	$pic = file_get_contents(str_replace('mpic', 'lpic', $value['picture']));
	$st->write($domain, 'get/'.$value['albumtitle'].'.mp3', $mp3);
	$st->write($domain, 'get/'.$value['albumtitle'].'.jpg', $pic);
}


if($_GET['do'] == 'sum'){
	echo $st->getFilesNum($domain, 'get/');
}









?>
