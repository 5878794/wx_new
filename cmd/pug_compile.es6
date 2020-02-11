let path = require('path'),
	glob = require("glob"),
	cheerio = require("cheerio"),
	ss = require('./fn.es6'),
	fn = Symbol();

let src = path.join(__dirname,'../src/'),
	xcxDir = path.join(__dirname,'../trunk_wx_xcx'),
	zfbDir = path.join(__dirname,'../trunk_zfb'),
	h5Dir = path.join(__dirname,'../trunk_h5');


let renderFn = {
	[fn](projectName,writeFileFn){
		src = path.join(src,'/'+projectName+'/pug/');

		//获取路径下的pug文件列表
		let files = glob.sync(src+"*.pug");

		files.map(pugFile=>{
			//获取源码,并根据全局参数编译
			let html = ss.readPugFileAndCompile(pugFile);

			//加载cheerio
			let $ = cheerio.load(html,{decodeEntities: false});

			//获取title
			let titleName = $('title').text();
			$('title').remove();

			//返回html
			html = $('body').html();

			//闭合标签
			html = html.replace(/(<input.*?)>/gi ,"$1 />");
			html = html.replace(/<img(.*?)>/gi ,"<image $1></image>>");

			let fileName = pugFile.replace(src,'').split('.')[0];
			writeFileFn(fileName,html,titleName);
		});
	},


	wx(projectName){
		let xcxOutDir = path.join(xcxDir,'/'+projectName+'/miniprogram/pages/',);
		let writeFileFn = function(fileName,html,titleName){
			//判断写入文件路径是否存在
			let fileDir = path.join(xcxOutDir,'/'+fileName+'/');
			ss.dirIsExistOrCreate(fileDir);

			//根据微信app结构生成 wxml文件
			let wxFilePath = path.join(xcxOutDir,'/'+fileName+'/',fileName+'.wxml');
			ss.writeFile(wxFilePath,html);


			//提取title中的标题 生成json文件
			let jsonText = {navigationBarTitleText:titleName,usingComponents:{}};
			jsonText = JSON.stringify(jsonText);
			//json地址路径
			let jsonFileName = path.join(xcxOutDir,'/'+fileName+'/'+fileName+'.json');
			ss.writeFile(jsonFileName,jsonText);

		};

		this[fn](projectName,writeFileFn);

		//TODO
		//还需要生成外面的 app.json文件

	},
	zfb(projectName){

	},
	h5(projectName){

	}
};




var arguments = process.argv.splice(2);
let projectName = arguments[0],
	type = arguments[1];

if(renderFn[type]){
	console.log('开始编译'+projectName+'项目');
	console.log('开始编译'+type+'下的pug');
	renderFn[type](projectName);
}else{
	throw('没有找到："'+type+'"的编译程序！');
}



