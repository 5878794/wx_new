
var touch = function(opt){
	opt = opt || {};
	this.dom = opt.dom || $("body");

	this.startFn = opt.startFn || function(){};
	this.moveFn = opt.moveFn || function(){};
	this.endFn = opt.endFn || function(){};
	this.bodyNotScroll = $.isBoolean(opt.bodyNotScroll)? opt.bodyNotScroll : false;
	this.slideLeftFn = opt.slideLeftFn || function(){};
	this.slideRightFn = opt.slideRightFn || function(){};
	this.slideUpFn = opt.slideUpFn || function(){};
	this.slideDownFn = opt.slideDownFn || function(){};

	this.slideMaxTime = opt.slideMaxTime || 500;
	this.useDirection = opt.useDirection || "x";   // x,y,xy


	this.touchStartFn = null;
	this.touchMoveFn = null;
	this.touchEndFn = null;
	this.points = [];
	this.isTouched = false;
	this.touchTime = 0;

	this.init();
};
touch.prototype = {
	init:function(){
		this.addEvent();
	},
	addEvent:function(){
		var obj = this.dom.get(0),
			_this = this;

		obj.addEventListener(DEVICE.START_EV,this.touchStartFn = function(e){
			_this.start(e);
		},DEVICE.eventParam);
		document.addEventListener(DEVICE.MOVE_EV,this.touchMoveFn = function(e){
			_this.move(e);
		},DEVICE.eventParam);
		document.addEventListener(DEVICE.END_EV,this.touchEndFn = function(e){
			_this.end(e)
		},false);
	},
	start:function(e){
		this.isTouched = true;
		this.clearPoint();
		this.savePoint(e);
		this.touchTime = new Date().getTime();
		this.startFn(e);
	},
	move:function(e){
		if(!this.isTouched){return;}

		if(this.bodyNotScroll){
			e.preventDefault();
		}
		//e.stopPropagation();

		this.savePoint(e);

		if(this.points.length<2){return;}

		var points = this.getStartAndEndPoint(),
			move_x = Math.abs(points.move.x),
			move_y = Math.abs(points.move.y);

		if(this.useDirection == "x"){
			if(move_x > move_y){
				e.preventDefault();
				this.moveFn(points);
			}
		}else if(this.useDirection == "y"){
			if(move_y > move_x){
				e.preventDefault();
				this.moveFn(points);
			}
		}else{
			e.preventDefault();
			this.moveFn(points);
		}
	},
	end:function(){
		if(!this.isTouched){return;}
		this.isTouched = false;
		var time = new Date().getTime(),
			points = this.getStartAndEndPoint(),
			notSlide = (time - this.touchTime > this.slideMaxTime);
		this.endFn(points,!notSlide);

		//超时不触发滑动
		if(notSlide){return;}

		var m_x = points.move.x,
			m_y = points.move.y,
			is_x_long = (Math.abs(m_x) >= Math.abs(m_y));

		//右滑
		if(m_x>0 && is_x_long){
			if(this.useDirection != "y"){
				this.slideRightFn();
			}
		}
		//左滑
		if(m_x<0 && is_x_long){
			if(this.useDirection != "y") {
				this.slideLeftFn();
			}
		}
		//上滑
		if(m_y<0 && !is_x_long){
			if(this.useDirection != "x") {
				this.slideUpFn();
			}
		}
		//下滑
		if(m_y>0 && !is_x_long){
			if(this.useDirection != "x") {
				this.slideDownFn();
			}
		}


	},
	savePoint:function(e){
		var touch = (e.touches)? e.touches[0] : e;
		this.points.push({x:touch.clientX,y:touch.clientY});
	},
	clearPoint:function(){
		this.points = [];
	},
	getStartAndEndPoint:function(){
		var sPoint = this.points[0],
			len = this.points.length,
			ePoint = this.points[len-1],
			moveX = ePoint.x - sPoint.x,
			moveY = ePoint.y - sPoint.y;

		return {
			start:sPoint,
			end:ePoint,
			move:{
				x:moveX,
				y:moveY
			}
		}
	},
	destroy:function(){
		this.dom.get(0).removeEventListener(DEVICE.START_EV,this.touchStartFn,false);
		document.removeEventListener(DEVICE.MOVE_EV,this.touchMoveFn,false);
		document.removeEventListener(DEVICE.END_EV,this.touchEndFn,false);
	}
};


module.exports = touch;


