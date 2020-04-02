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
			console.log(e)
			jq(_this,'a3').cssAnimate({
				background:'green'
			},1000)
		})


	},
	addEvent(){
		let _this = this;
		jq(_this,'open').tap(function(){
			_this.showMenu();
		});
	},
	myevent(e){
		console.log(e)
	}
});