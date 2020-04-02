Component({
  properties: {
    useDirection:{
      type: String,
      value: 'x'
    },
    slideMaxTime:{
      type: Number,
      value: 500
    }

  },
  data: {
    isTouched:false,
    touchTime:'',
    points:[]
    // 这里是一些组件内部数据
    // someData: {}
  },
  methods: {
    // 这里是一个自定义方法
    touchstart:function(e){
      this.data.isTouched = true;
      this.clearPoint();
      this.savePoint(e);
      this.data.touchTime = new Date().getTime();
    },
    touchmove:function(e){
      if(!this.data.isTouched){return;}


      this.savePoint(e);

      if(this.data.points.length<2){return;}

      var points = this.getStartAndEndPoint(),
          move_x = Math.abs(points.move.x),
          move_y = Math.abs(points.move.y);

      if(this.data.useDirection == "x"){
        if(move_x > move_y){
        }
      }else{
        if(move_y > move_x){
        }
      }
    },
    touchend:function(e){
      if(!this.data.isTouched){return;}
      this.data.isTouched = false;
      var time = new Date().getTime(),
          points = this.getStartAndEndPoint(),
          notSlide = (time - this.data.touchTime > this.data.slideMaxTime);

      //超时不触发滑动
      if(notSlide){return;}

      var m_x = points.move.x,
          m_y = points.move.y,
          is_x_long = (Math.abs(m_x) >= Math.abs(m_y));

      //右滑
      if(m_x>0 && is_x_long){
        if(this.data.useDirection != "y"){
          this.slideRightFn(e);
        }
      }
      //左滑
      if(m_x<0 && is_x_long){
        if(this.data.useDirection != "y") {
          this.slideLeftFn(e);
        }
      }
      //上滑
      if(m_y<0 && !is_x_long){
        if(this.data.useDirection != "x") {
          this.slideUpFn(e);
        }
      }
      //下滑
      if(m_y>0 && !is_x_long){
        if(this.data.useDirection != "x") {
          this.slideDownFn(e);
        }
      }
    },
    savePoint:function(e){
      var touch = (e.touches)? e.touches[0] : e;
      this.data.points.push({x:touch.clientX,y:touch.clientY});
    },
    clearPoint:function(){
      this.data.points = [];
    },
    getStartAndEndPoint:function(){
      var sPoint = this.data.points[0],
          len = this.data.points.length,
          ePoint = this.data.points[len-1],
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

    slideRightFn(e){
      var myEventDetail = {}; // detail对象，提供给事件监听函数
      var myEventOption = {}; // 触发事件的选项
      this.triggerEvent('slideright', myEventDetail, myEventOption)
    },
    slideLeftFn(e){
      var myEventDetail = {}; // detail对象，提供给事件监听函数
      var myEventOption = {}; // 触发事件的选项
      this.triggerEvent('slideleft', myEventDetail, myEventOption)
    },
    slideUpFn(e){
      var myEventDetail = {}; // detail对象，提供给事件监听函数
      var myEventOption = {}; // 触发事件的选项
      this.triggerEvent('slideup', myEventDetail, myEventOption)
    },
    slideDownFn(e){
      var myEventDetail = {}; // detail对象，提供给事件监听函数
      var myEventOption = {}; // 触发事件的选项
      this.triggerEvent('slidedown', myEventDetail, myEventOption)
    }
  }
});