const regeneratorRuntime = require('../../wxLib/runtime');

const jq = require('../../wxLib/jq');
const app = require('../../wxLib/app');

// global.jq = jq;



app.run({
	data:{

	},
	onReady(){
		this.setData({aaa:'13'});
		let _this = this;
		jq(_this,'a3').tap(function(e){
			console.log(_this)
		})


	},
	addEvent(){
		let _this = this;
		jq(_this,'open').tap(function(){
			_this.showMenu();
		});
	}
});