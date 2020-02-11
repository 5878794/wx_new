// lessc --modify-var="isWxApp=true"  ./src/less/index.less ./index.css

// lessc --functions --modify-var="isWxApp=false"   ./src/less/index.less ./index.css



let path = require('path'),
	glob = require("glob"),
	fn = Symbol(),
	ss = require('./fn.es6'),
	less = require("less");


let src = path.join(__dirname,'../src/'),
	xcxDir = path.join(__dirname,'../trunk_wx_xcx'),
	zfbDir = path.join(__dirname,'../trunk_zfb'),
	h5Dir = path.join(__dirname,'../trunk_h5');


let renderFn = {
	[fn](projectName,runFn){
		src = path.join(src,'/'+projectName+'/less/');

		//获取路径下的pug文件列表
		let files = glob.sync(src+"*.less");

		files.map(filePath=>{
			let fileName = filePath.replace(src,"").split('.')[0];
			runFn(fileName,filePath);
		});
	},


	wx(projectName){
		let xcxOutDir = path.join(xcxDir,'/'+projectName+'/miniprogram/pages/');

		//单个文件编译
		let runFn = function(fileName,filePath){
			let outPath = path.join(xcxOutDir,'/'+fileName+'/'+fileName+'.wxss'),
				html = ss.readLessFileAndCompile(filePath);
			html = html.replace(/rem/ig,'rpx');
			ss.writeFile(outPath,html);
		};

		//公共文件编译
		let allFn = function(){
			let allCssFilePath = path.join(src,'/lib/common.less'),
				allCssOutPath = path.join(xcxOutDir,'../app.wxss');

			let text = ss.readLessFileAndCompile(allCssFilePath);
			text = text.replace(/rem/ig,'rpx');
			ss.writeFile(allCssOutPath,text);
		};


		this[fn](projectName,runFn);
		allFn();

	},
	zfb(projectName){

	},
	h5(projectName){

	}
};


//
//

//
//
// let renderFn = function(projectName){
//
// 	console.log('编译 '+projectName+' 下的less');
// 	let projectPath = lib.getProjectDirPath(lessDir,projectName);
// 	console.log('------------------------------------------------------------------------');
//
//
// 	let entryFiles = glob.sync(projectPath+"*.less");
//
// 	entryFiles.map(filePath=>{
// 		let fileName = filePath.replace(projectPath,"").split('.')[0],
// 			outPath = path.join(wxDir,'/'+projectName+'/pages/'+fileName+'/'+'index'+'.wxss'),
// 			//压缩css
// 			// cmdText = 'lessc -x '+filePath+' ' +outPath;
// 			//不压缩
// 			cmdText = 'lessc -x '+filePath+' ' +outPath;
//
// 		runExec(cmdText);
//
// 		console.log('ok  ' +filePath);
// 	});
//
//
// };
//
// let renderPublish = async function(projectName){
// 	let projectPath = lib.getProjectDirPath(lessDir,projectName);
//
// 	let include = path.join(projectPath,'./include/');
// 	let entryFiles = glob.sync(include+"*.less");
//
// 	let outPath = path.join(wxDir,'/'+projectName+'/app.wxss'),
// 		readText = [];
//
// 	console.log(' ');
//
// 	for(let i=0,l=entryFiles.length;i<l;i++){
// 		let file = entryFiles[i],
// 			text = await readFile(file),
// 			css = await lessRender(text,file);
//
// 		console.log(file);
//
// 		readText.push(css);
// 	}
//
//
// 	let readText1 = readText.join('');
// 	await writeFile(readText1,outPath);
//
// 	console.log('------------------------------------------------------------------------');
//
// };
//
//
// let readFile = function(file){
// 	return new Promise((success,error)=>{
// 		fs.readFile(file,'utf-8',(err,data)=>{
// 			if(err){
// 				error(err);
// 				throw err;
// 			}
// 			success(data);
//
// 		});
// 	})
// };
// let lessRender = function(text,file){
// 	file = file.substr(0,file.lastIndexOf('/'));
// 	text = text.replace(/(?<=import\s*[\'\"]\s*)[a-z0-9_\-\.\\\/]+(?=[\s*\'\"])/ig,function(tt){
// 		console.log(tt,file)
// 		return path.join(file,tt);
// 	});
//
// 	return new Promise((success,error)=>{
// 		less.render(text,{
// 			compress:true
// 		},(err,css)=>{
// 			if(err){
// 				error(err);
// 				throw err;
// 			}
// 			success(css.css);
// 		})
// 	})
// };
// let writeFile = function(text,path){
// 	return new Promise((success,error)=>{
// 		fs.writeFile(path,text,(err)=>{
// 			if(err){
// 				error(err);
// 				throw err;
// 			}
// 			success();
// 		})
// 	})
// };



let arguments = process.argv.splice(2);
let projectName = arguments[0],
	type = arguments[1];

if(renderFn[type]){
	console.log('开始编译'+projectName+'项目');
	console.log('开始编译'+type+'下的less');
	renderFn[type](projectName);
}else{
	throw('没有找到："'+type+'"的编译程序！');
}
