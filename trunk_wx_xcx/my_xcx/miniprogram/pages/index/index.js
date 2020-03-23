const __jq_data = require('./jq_data.js');
const regeneratorRuntime = require('../../wxLib/runtime');

const jq = require('../../wxLib/jq');
const app = require('../../wxLib/app');

// global.jq = jq;


let PAGE = {
	data:{

	},
	onLoad:function(){
		console.log('')


	},
	addEvent(){
		let _this = this;
		jq(_this,'open').tap(function(){
			_this.showMenu();
		});
	}
};



app.run(PAGE,__jq_data);