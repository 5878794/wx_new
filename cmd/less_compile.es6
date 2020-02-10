// lessc --modify-var="isWxApp=true"  ./src/less/index.less ./index.css

// lessc --functions --modify-var="isWxApp=false"   ./src/less/index.less ./index.css



let lib = require('./fn.es6'),
	fs = require('fs'),
	path = require('path'),
	glob = require("glob"),
	less = require("less"),
	exec = require('child_process').exec;


let lessDir = path.join(__dirname,'../src/less/'),
	wxDir = path.join(__dirname,'../trunk/');


let runExec = function(cmdText){
	exec(cmdText,function(err,stdout,stderr){
		if(err) {
			console.log(err.toString())
		} else {

		}
	})
};


let renderFn = function(projectName){

	console.log('编译 '+projectName+' 下的less');
	let projectPath = lib.getProjectDirPath(lessDir,projectName);
	console.log('------------------------------------------------------------------------');


	let entryFiles = glob.sync(projectPath+"*.less");

	entryFiles.map(filePath=>{
		let fileName = filePath.replace(projectPath,"").split('.')[0],
			outPath = path.join(wxDir,'/'+projectName+'/pages/'+fileName+'/'+'index'+'.wxss'),
			//压缩css
			// cmdText = 'lessc -x '+filePath+' ' +outPath;
			//不压缩
			cmdText = 'lessc -x '+filePath+' ' +outPath;

		runExec(cmdText);

		console.log('ok  ' +filePath);
	});


};

let renderPublish = async function(projectName){
	let projectPath = lib.getProjectDirPath(lessDir,projectName);

	let include = path.join(projectPath,'./include/');
	let entryFiles = glob.sync(include+"*.less");

	let outPath = path.join(wxDir,'/'+projectName+'/app.wxss'),
		readText = [];

	console.log(' ');

	for(let i=0,l=entryFiles.length;i<l;i++){
		let file = entryFiles[i],
			text = await readFile(file),
			css = await lessRender(text,file);

		console.log(file);

		readText.push(css);
	}


	let readText1 = readText.join('');
	await writeFile(readText1,outPath);

	console.log('------------------------------------------------------------------------');

};


let readFile = function(file){
	return new Promise((success,error)=>{
		fs.readFile(file,'utf-8',(err,data)=>{
			if(err){
				error(err);
				throw err;
			}
			success(data);

		});
	})
};
let lessRender = function(text,file){
	file = file.substr(0,file.lastIndexOf('/'));
	text = text.replace(/(?<=import\s*[\'\"]\s*)[a-z0-9_\-\.\\\/]+(?=[\s*\'\"])/ig,function(tt){
		console.log(tt,file)
		return path.join(file,tt);
	});

	return new Promise((success,error)=>{
		less.render(text,{
			compress:true
		},(err,css)=>{
			if(err){
				error(err);
				throw err;
			}
			success(css.css);
		})
	})
};
let writeFile = function(text,path){
	return new Promise((success,error)=>{
		fs.writeFile(path,text,(err)=>{
			if(err){
				error(err);
				throw err;
			}
			success();
		})
	})
};


var arguments = process.argv.splice(2);
arguments.map(pp=>{
	renderFn(pp);
	renderPublish(pp).then(rs=>{console.log('all ok')}).catch(rs=>console.log(rs));
});

