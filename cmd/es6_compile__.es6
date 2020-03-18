let lib = require('./fn.es6'),
	webpack = require('webpack'),
	path = require('path'),
	glob = require("glob"),
	fs = require("fs"),
	es6Dir = path.join(__dirname,'../src/es6/'),
	jsDir = path.join(__dirname,'../trunk/');







//获取es6文件列表
// let getEs6FileList = function(projectName){
// 	let projectPath = lib.getProjectDirPath(es6Dir,projectName);
//
//
// 	let files = glob.sync(projectPath+"*.es6"),
// 		obj = {};
//
// 	files.map(filePath=>{
// 		let fileName = filePath.replace(projectPath,"").split('.')[0],
// 			key = 'trunk/'+projectName+'/pages/'+fileName+'/'+'index';
//
// 		obj[key] = filePath;
// 	});
//
//
// 	return obj;
// };




let param = {
	//页面入口文件配置
	//下面自动生成
	// entry:getEs6FileList(),
	// entry: {
	// 	// "coachesAndVenues/js/index":"./src/es6/coachesAndVenues/index.es6",
	// 	// "coachesAndVenues/js/coachList":"./src/es6/coachesAndVenues/coachList.es6",
	// 	// "coachesAndVenues/js/venuesInfo":"./src/es6/coachesAndVenues/venuesInfo.es6",
	// 	// "coachesAndVenues/js/coachInfo":"./src/es6/coachesAndVenues/coachInfo.es6",
	// 	// "appType/js/index":"./src/es6/appType/index.es6",
	// 	// "appType/js/more":"./src/es6/appType/more.es6",
	// 	// "handlingGuideline/js/index":"./src/es6/handlingGuideline/index.es6",
	// 	// "handlingGuideline/js/info":"./src/es6/handlingGuideline/info.es6",
	// 	// "news/js/index":"./src/es6/news/index.es6",
	// 	// "news/js/info":"./src/es6/news/info.es6",
	// 	// "healthTest/js/index":"./src/es6/healthTest/index.es6"
	// },
	devtool:false,
	//wx不支持调试模式  缺少eval函数
	// devtool:'eval-source-map',
	//入口文件输出配置
	output: {
		path: path.join(__dirname,'../'),
		filename: "[name].js"
	},
	// watch:true,
	module: {
		//加载器配置
		loaders: [
			{
				test: /\.es6?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				query: {
					presets: ['env','stage-3'],
					plugins: ["transform-decorators-legacy"]
				}
			}
		]
	},
	//其它解决方案配置
	resolve: {
		//自动扩展文件后缀名，意味着我们require模块可以省略不写后缀名
		extensions: ['.es6','.js'],
			//自己的库地址
			modules: [
			path.resolve(__dirname,"../src/es6/lib"),
			path.resolve(__dirname,'../src/js/include'),
			"../node_modules"
		]
		//模块别名定义，方便后续直接引用别名，无须多写长长的地址
		// alias: {
		// 	//后续直接 require('mod1') 即可
		// 	mod1 : __dirname+'/js/mod1.es6',
		// 	mod2 : __dirname+'/js/mod2.js',
		// 	mod3 : __dirname+'/js/mod3.es6'
		// }
	},
	//插件
	plugins:[
		// //全局变量
		// new webpack.DefinePlugin({
		// 	isWxApp:false
		// }),

		//去除注释 压缩代码
		new webpack.optimize.UglifyJsPlugin({
			compress: true,
			output: {
				comments: false
			},
			except: ['$super', '$', 'App','Page','exports','require','super','window','wx']    //排除关键字
		})
		//合并公共部分生成单独的文件,需要单独引用  pub.bundle.js
		// new webpack.optimize.CommonsChunkPlugin('pub'),
		//文件头部注释
		// new webpack.BannerPlugin("######5878794@qq.com######"),

		//提取公共代码放到指定位置
		// new webpack.optimize.CommonsChunkPlugin({
		// 	name: 'common', // 这公共代码的chunk名为'commons'
		// 	filename: 'js/[name].min.js', // 生成后的文件名，虽说用了[name]，但实际上就是'commons.bundle.js'了
		// 	minChunks: 3 // 设定要有4个chunk（即4个页面）加载的js模块才会被纳入公共代码。这数目自己考虑吧，我认为3-5比较合适。
		// })
	]

};


// let renderFn = function(projectName){
// 	console.log('编译 '+projectName+' 下的es6');
// 	console.log('------------------------------------------------------------------------');

// 	//生成不同的文件编译对象
// 	param.entry = getEs6FileList(projectName);
//
// 	for(let values of Object.values(param.entry)){
// 		console.log(values);
// 	}
// 	console.log('------------------------------------------------------------------------');
//
//
// 	let compiler = webpack(param);
// 	compiler.run((err, stats) => {
// 		if(err){
// 			console.log(err);
// 		}
// 		// console.log('----------');
// 		// console.log(stats);
//
//
// 		console.log('es6 compile end');
// 	});
// };






let renderFn = function(projectName){
	console.log('编译 '+projectName+' 下的es6');
	console.log('------------------------------------------------------------------------');

	//拷贝页面文件
	let projectPath = lib.getProjectDirPath(es6Dir,projectName),
		files = glob.sync(projectPath+"*.es6");

	//简单拷贝es6文件到指定位置，并修改文件后缀名
	files.map(rs=>{
		console.log(rs);
		let filename = rs.replace(projectPath,'').split('.')[0],
			descPath = path.join(jsDir,projectName,'pages',filename,'index.js');

		let text = fs.readFileSync(rs,'utf-8');
		text = text.replace(/[\.\/]*include/ig,'./../include');
		fs.writeFileSync(descPath,text);
	});


	//拷贝公共类文件
	let libPath = path.join(projectPath,'include'),
		libFiles = glob.sync(libPath+"/*.es6"),
		descLib = path.join(jsDir,projectName,'pages','include');

	if(!fs.existsSync(descLib)){
		fs.mkdirSync(descLib);
	}

	//拷贝到pages下面
	libFiles.map(rs=>{
		let filename = rs.replace(libPath,'').split('.')[0],
			descPath = path.join(descLib,filename+'.js');
		fs.copyFileSync(rs,descPath);
	});




	console.log('------------------------------------------------------------------------');

};



var arguments = process.argv.splice(2);
arguments.map(pp=>{
	renderFn(pp);
});


