let path = require('path'),
	glob = require("glob"),
	cheerio = require("cheerio"),
	fs = require('fs'),
	ss = require('./fn.es6'),
	fn = Symbol();

let src = path.join(__dirname,'../src/'),
	xcxDir = path.join(__dirname,'../trunk_wx_xcx'),
	zfbDir = path.join(__dirname,'../trunk_zfb'),
	h5Dir = path.join(__dirname,'../trunk_h5');


//添加jq需要的变量
let addJQ = function($,ids){
	if(ids){
		ids.map(id=>{
			let obj = $('#'+id),
				_class = obj.attr('class') || '',
				_style = obj.attr('style') || '';

			if(obj.length != 0){
				//判断是否是input 自动加处理事件
				if(obj[0].name == 'input'){
					obj.attr({
						value:'{{'+id+'}}',
						bindinput:'inputChange'
					})
				}

				obj.attr({
					class:_class+' {{__jq.'+id+'.class}}',
					style:_style+' {{__jq.'+id+'.style}}',
					data:'{{__jq.'+id+'.data}}',
					animation:'{{__jq.'+id+'.animation}}',
					catchtap:'{{__jq.'+id+'.catch_tap}}'
				});
			}
		});
	}
};

//生成jq需要的变量的model
let createDataText = function(ids){
	let data = {};
	ids.map(id=>{
		data[id] = {
			animation:'',
			class:'',
			style:'',
			data:'',
		};
	});
	let tt = {__jq:data};
	let text = 'module.exports='+JSON.stringify(tt)+'';

	return text;
};

//生成app.json
let createWxAppJson = function(projectName){
	//获取路径下的pug文件列表
	let src1 = path.join(src,'/'+projectName+'/pug/'),
		files = glob.sync(src1+"*.pug"),
		appJsonSrc = path.join(xcxDir,'/'+projectName+'/miniprogram/app.json'),
		oldAppJsonText = (fs.existsSync(appJsonSrc)) ? ss.readFile(appJsonSrc) : '{"pages":[]}';

	oldAppJsonText = JSON.parse(oldAppJsonText);


	//判断页面数是否有变化,无变化不处理
	if(oldAppJsonText.pages.length == files.length){
		return;
	}

	oldAppJsonText.pages = [];
	files.map(rs=>{
		let fileName = rs.substr(rs.lastIndexOf('\/')+1).split('.')[0];
		if(fileName != 'index'){
			oldAppJsonText.pages.push('pages/'+fileName+'/'+fileName);
		}
	});
	//把index放到数组第一个
	oldAppJsonText.pages.unshift('pages/index/index');



	ss.writeFile(appJsonSrc,JSON.stringify(oldAppJsonText));
};

//处理自定义标签
let createWxComponent = function(projectName){
	//获取使用的组件列表
	let jsonPath = path.join(src,projectName+'/es6/components/list.json'),
		list = ss.readFile(jsonPath);
	list = JSON.parse(list);

	//按页面获取使用的组件(处理数据)
	let files = {},
		components = [];
	for(let [component,pages] of Object.entries(list)){
		components.push(component);
		pages.map(page=>{
			if(!files[page]){
				files[page] = [];
			}
			files[page].push(component)
		})
	}


	//拷贝组件到wx项目目录
	let componentDir = path.join(src,projectName+'/es6/components/wx/'),
		wxComponentDir = path.join(xcxDir,projectName+'/miniprogram/components/');

	//删除wx组件文件夹
	ss.delDir(wxComponentDir);
	//创建wx组件文件夹
	ss.dirIsExistOrCreate(wxComponentDir);

	//开始拷贝
	components.map(rs=>{
		let thisComponentDir = path.join(componentDir,rs);
		ss.copyDir(thisComponentDir,wxComponentDir);

		//删除里面的read.me文件
		let readMePath = path.join(wxComponentDir,rs+'/read.me');
		ss.delFile(readMePath);
	});

	//处理应用组件的页面的json文件
	let parentPath = path.join(xcxDir,projectName+'/miniprogram/pages/');

	for(let [pageName,componentNames] of Object.entries(files)){
		let thisPagePath = path.join(parentPath,pageName+'/'+pageName+'.json'),
			jsonText = ss.readFile(thisPagePath);
		jsonText = JSON.parse(jsonText);

		let obj = {};
		componentNames.map(rs=>{
			obj[rs] = '/components/'+rs+'/'+rs;
		});

		jsonText.usingComponents = obj;
		jsonText = JSON.stringify(jsonText);

		//写入
		ss.writeFile(thisPagePath,jsonText);
	}

};



let renderFn = {
	[fn](projectName,writeFileFn){
		let src1 = path.join(src,'/'+projectName+'/pug/');

		//获取路径下的pug文件列表
		let files = glob.sync(src1+"*.pug");

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


			let fileName = pugFile.replace(src1,'').split('.')[0];

			writeFileFn(fileName,html,titleName,$);
		});
	},


	wx(projectName){
		let xcxOutDir = path.join(xcxDir,'/'+projectName+'/miniprogram/pages/',);
		let writeFileFn = function(fileName,html,titleName,$){
			//判断写入文件路径是否存在
			let fileDir = path.join(xcxOutDir,'/'+fileName+'/');
			ss.dirIsExistOrCreate(fileDir);


			//处理jq需要的
			//正则解析html中含id的标签头
			//带id的input添加data的赋值对象
			//input标签需要特殊处理事件 不要赋值id
			let ids = html.match(/(?<=\bid\s*=\s*[\'\"]\s*)[a-z0-9_-]+(?=[\s*\'\"])/ig);
			if(ids){
				addJQ($,ids);

				//生成数据data用的js文件 (同时js编译的时候判断是否有文件 要require, app类里面要设置setData)
				//根据ids生成jq需要的附加data文件
				// let jqFilePath = path.join(xcxDir,'/'+projectName+'/miniprogram/pages/'+fileName+'/'+'jq_data.js'),
				// 	jq_data_text = createDataText(ids);
				//
				// ss.writeFile(jqFilePath,jq_data_text);
				html = $('body').html();
			}

			//闭合标签
			html = html.replace(/(<input.*?)>/gi ,"$1 />");
			html = html.replace(/<img(.*?)>/gi ,"<image $1></image>");

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


		//还需要生成外面的 app.json文件
		createWxAppJson(projectName);
		//处理自定义标签
		createWxComponent(projectName);


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



