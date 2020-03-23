let lib = require('./fn.es6'),
	path = require('path'),
	fs = require("fs");


let src = path.join(__dirname,'../src/'),
	xcxDir = path.join(__dirname,'../trunk_wx_xcx'),
	zfbDir = path.join(__dirname,'../trunk_zfb'),
	h5Dir = path.join(__dirname,'../trunk_h5');

let renderFn = {
	wx(projectName){
		let xcxOutDir = path.join(xcxDir,'/'+projectName+'/miniprogram/'),
			xcxOutLibDir = path.join(xcxOutDir+'/wxLib'),
			xcxInLibDir = path.join(src,projectName+'/es6/wxLib'),
			xcxInDir = path.join(src,projectName+'/es6/');


	//拷贝公共库到 pages 同层
		//判断文件夹是否存在
		lib.dirIsExistOrCreate(xcxOutLibDir);

		//开始拷贝文件
		let cmdText = 'cp -f -r '+xcxInLibDir+'/ '+xcxOutLibDir+'/';
		lib.runExec(cmdText);

	//拷贝页面文件到相应文件夹
		let files = lib.getDirFile(xcxInDir);
		files.map(rs=>{
			let filePath = path.join(xcxInDir,rs),
				states = fs.statSync(filePath);
			if(!states.isDirectory()){
				//判断是否是隐藏文件
				if(rs.substr(0,1) != '.'){
					//拷贝文件到微信对应目录
					let fileName = rs.split('.')[0],
						cpToPath = path.join(xcxOutDir,'pages/'+fileName+'/'+fileName+'.js');

					let fileText = lib.readFile(filePath);

					//替换引用包的位置
					fileText = fileText.replace(/wxLib\//ig,'../../wxLib/');


					//加兼容es6的库
					fileText = "const regeneratorRuntime = require('../../wxLib/runtime');\r\n"+fileText;


					//判断是否有jq的数据包
					let jqFilePath = path.join(xcxOutDir,'pages/'+fileName+'/jq_data.js');
					if(fs.existsSync(jqFilePath)){
						fileText = "const __jq_data = require('./jq_data.js');\r\n" + fileText;

						//将参数传入app.run
						//app.run必须是代码最后一行
						fileText = fileText.substr(0,fileText.lastIndexOf(')'))+',__jq_data);';
					}


					lib.writeFile(cpToPath,fileText);
				}
			}

		});

		console.log('complate');

	},
	zfb(projectName){

	},
	h5(projectName){

	}
};




let arguments = process.argv.splice(2);
let projectName = arguments[0],
	type = arguments[1];

if(renderFn[type]){
	console.log('开始编译'+projectName+'项目');
	console.log('开始编译'+type+'下的es6');
	renderFn[type](projectName);
}else{
	throw('没有找到："'+type+'"的编译程序！');
}

