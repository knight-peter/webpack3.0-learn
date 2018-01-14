import css from './sass/index.css';
import sass from './sass/nav.scss';
// import $ from 'jquery';

{
  let xuqiString = "Hello XuQi.This is webpack!"
  document.getElementById('title').innerHTML = xuqiString;
}

$('#title').html('使用jquery修改后。');

/* json引入用require */
var json=require("../config.json");
document.getElementById('json').innerHTML=json.name+'的网站地址：'+json.webSite;