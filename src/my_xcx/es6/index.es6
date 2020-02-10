const regeneratorRuntime = require('./include/runtime');
const jq = require('./include/jq');
const wxApp = require('./include/wxApp');
const data = require('./include/art_space_data');
const all = require('./include/art_space_all');

global.jq = jq;

wxApp.ready({
	data:{

	},
	loadedOk:function(){
		this.addEvent();
	},
	onLoad:function(){
		Object.assign(this,all);
		this.allInit('index');


	},
	addEvent(){
		let _this = this;
		jq(_this,'open').tap(function(){
			_this.showMenu();
		});
	}
});