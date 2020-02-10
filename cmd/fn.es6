const   fs = require('fs'),
		path = require('path');


module.exports = {
	//获取指定路径下的项目名称
	//@param:dirPath:str            需要获取的跟路径
	//@param:projectName:str        需要编译的目录名
	getProjectDirPath(dirPath,projectName){
		//获取目录下的文件和文件夹
		let files = fs.readdirSync(dirPath),
			backData = null;

		files.map(all=>{
				//实际地址
			let thisPath = path.join(dirPath,all,'/'),
				//改文件或目录状态
				fileState = fs.statSync(thisPath);

				//判断是否是目录
			if(fileState.isDirectory()){
				//判断是否需要的文件夹名
				if(all == projectName){
					backData = thisPath;
				}
			}

		});

		return backData;
	}

};