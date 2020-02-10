let lib = require('./fn.es6'),
	pug = require('pug'),
	fs = require('fs'),
	path = require('path'),
	glob = require("glob"),
	cheerio = require("cheerio"),
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
			let html = pug.renderFile(
				pugFile,
				{pretty:true}
			);

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
			// console.log(html)

		});
	},


	wx(projectName){
		let xcxOutDir = path.join(xcxDir,'/'+projectName+'/miniprogram/pages/',);
		let writeFileFn = function(fileName,html,titleName){
			//判断写入文件路径是否存在
			let fileDir = path.join(xcxOutDir,'/'+fileName+'/');
			if(!fs.existsSync(fileDir)){
				fs.mkdirSync(fileDir, '0777');
			}

			//根据微信app结构生成 wxml文件
			let wxFilePath = path.join(xcxOutDir,'/'+fileName+'/',fileName+'.wxml');
			fs.writeFileSync(wxFilePath,html,function(err){
				if(err){
					console.log(filePath+'    err!');
					console.log(err);
				}
			});

			//提取title中的标题 生成json文件
			let jsonText = {navigationBarTitleText:titleName,usingComponents:{}};
			jsonText = JSON.stringify(jsonText);
			//json地址路径
			let jsonFileName = path.join(xcxOutDir,'/'+fileName+'/'+fileName+'.json');

			fs.writeFileSync(jsonFileName,jsonText,function(err){
				if(err){
					console.log(filePath+'    err!');
					console.log(err);
				}
			});
		};

		this[fn](projectName,writeFileFn);

		//还需要生成外面的 app.json文件

	},
	zfb(projectName){

	},
	h5(projectName){

	}
};


// let renderFn = function(projectName){
// 	//获取pug目录下跟目录中的文件夹
// 	console.log('编译 '+projectName+' 下的pug');
// 	let projectPath = lib.getProjectDirPath(pugDir,projectName);
// 	// console.log(projectPath);
// 	// console.log('------------------------');
//
//
//
// 	//获取项目下的要编译的文件
// 	// console.log('获取'+projectName+'项目下的pug文件');
// 	let files = glob.sync(projectPath+"*.pug");
// 	// files.map(rs=>{
// 	// 	console.log(rs);
// 	// });
// 	console.log('------------------------------------------------------------------------');
//
//
// 	files.map(filePath=>{
// 			//获取文件名 文件名不带后缀
// 		let fileName = filePath.replace(projectPath,"").split('.')[0],
// 			//获取源码,并根据全局参数编译
// 			html = pug.renderFile(
// 				filePath,
// 				{
// 					pretty:true
// 				}
// 			);
//
// 		//提取body中的内容
// 		let $ = cheerio.load(html,{decodeEntities: false}),
// 			titleName = $('title').text();
// 		$('title').remove();
//
// 		//外包项目,不写js 不需要转意jq的东西
// 		// html = $('body').html();
// 		// //正则解析html中含id的标签头
// 		// let ids = html.match(/(?<=\bid\s*=\s*[\'\"]\s*)[a-z0-9_-]+(?=[\s*\'\"])/ig);
// 		// let idss = html.match(/(?<=\bjq\s*=\s*[\'\"]\s*)[a-z0-9_-]+(?=[\s*\'\"])/ig);
// 		// //给带id的元素自动添加变量
// 		// addJQ($,ids);
// 		// addJQS($,idss);
//
//
//
// 		//获取添加变量后的html
// 		html = $('body').html();
//
// 		//闭合input标签
// 		// '<img src="1.jpg">'.replace(/(<img.*?)>/gi ,"$1 />")
// 		html = html.replace(/(<input.*?)>/gi ,"$1 />");
//
// 		//闭合image
// 		html = html.replace(/<img(.*?)>/gi ,"<image $1 />");
//
//
//
// 		//生成目录
// 		let createPath = path.join(wxDir,'/'+projectName+'/pages/'+fileName+'/');
//
// 		if(!fs.existsSync(createPath)){
// 			let pPath = path.join(wxDir,'/'+projectName+'/pages/');
// 			if(!fs.existsSync(pPath)){
// 				fs.mkdirSync(pPath, '0777');
// 			}
// 			fs.mkdirSync(createPath, '0777');
// 		}
//
//
//
// 		//根据微信app结构生成 wxml文件
// 		let wxFilePath = path.join(wxDir,'/'+projectName+'/pages/'+fileName+'/'+'index.wxml');
// 		fs.writeFileSync(wxFilePath,html,function(err){
// 			if(err){
// 				console.log(filePath+'    err!');
// 				console.log(err);
// 			}
// 		});
//
//
// 		//根据ids生成jq需要的附加data文件
// 		// let jqFilePath = path.join(wxDir,'/'+projectName+'/pages/'+fileName+'/'+'jq_data.js'),
// 		// 	jq_data_text = createDataText(ids);
// 		// fs.writeFileSync(jqFilePath,jq_data_text,function(err){
// 		// 	if(err){
// 		// 		console.log(filePath+'    err!');
// 		// 		console.log(err);
// 		// 	}
// 		// });
//
//
// 		//提取title中的标题 生成json文件
// 		let jsonText = {navigationBarTitleText:titleName};
// 		jsonText = JSON.stringify(jsonText);
// 		//json地址路径
// 		let jsonFileName = path.join(wxDir,'/'+projectName+'/pages/'+fileName+'/'+'index.json');
//
// 		fs.writeFileSync(jsonFileName,jsonText,function(err){
// 			if(err){
// 				console.log(filePath+'    err!');
// 				console.log(err);
// 			}
// 		});
//
//
// 		console.log('ok  '+ titleName+'   '+filePath);
//
// 	});
//
// 	console.log('------------------------------------------------------------------------');
// 	console.log('pug compile end');
// };





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



