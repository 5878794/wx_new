let getParam = Symbol(),
    setParam = Symbol(),
    getDomParam = Symbol(),
    createRadomNumber = Symbol(),
    nu = 0;

const regeneratorRuntime = require('./runtime.js');    

class jq{
    constructor(id,obj){
        this.id = id;
        this.obj = obj;

        this.cssAnimateCallback = null;
        this.cssAnimateTimeout = null;
        return this;
    }

    //获取参数
    [getParam](type){
        let oldData = this.obj.data || {};
        oldData = oldData.__jq || {};
        oldData = oldData[this.id] || {};
        oldData = oldData[type] || ''; 

        if(type == 'data' && !oldData){
            oldData = {};
        }
        return oldData;
    }

    //设置参数
    [setParam](type,val){
        let oldData = this.obj.data || {};
        oldData = oldData.__jq || {};
        if(!oldData[this.id]){
            oldData[this.id] = {};
        }

        oldData[this.id][type] = val;
        // console.log(oldData)
        this.obj.setData({ __jq:oldData});
    }

    //添加class
    addClass(text){
        let className = this[getParam]('class'),
            classArray = className.split('');

        if (classArray.indexOf(text)==-1){
            className += ' '+text;
        }else{
            return this;
        }

        this[setParam]('class',className);

        return this;
    }

    //删除class
    //不能删除在html中已设置的class
    removeClass(text){
        let className = this[getParam]('class'),
            classArray = className.split(' ');

        let newClass = [];
        classArray.map(rs=>{
            if(rs!=text){
                newClass.push(rs);
            }
        });
        newClass = newClass.join(' ');


        this[setParam]('class', newClass);

        return this;
    }

    hasClass(text){
        let className = this[getParam]('class'),
            classArray = className.split(' ');

        return (classArray.indexOf(text) > -1)
    }

    //设置css
    css(obj){
        //获取原来设置的值
        let style = this[getParam]('style'),
            styles = style.split(';');

        //转对象
        let styleObj = {};
        styles.map(rs=>{
            if(rs.indexOf(':')>-1){
                rs = rs.split(':');
                let key = rs[0].replace(/\s/ig, ''),
                    val = rs[1];
                styleObj[key] = val;
            }
        });

        
        if(typeof obj == 'string'){
            //判断是否是获取设置的css
            console.log('TODO 从系统获取');
            return '';
        }


        //合并现在设置的值
        let newObj = Object.assign(styleObj,obj);  

        //转字符串
        let str ='';
        for (let [key, value] of Object.entries(newObj)){
            str += key+':'+value+';'
        }

        //写入
        this[setParam]('style', str);

        return this;
    }

    //设置data
    data(obj){
        //获取参数
        let data = this[getParam]('data');

        if(typeof obj == 'string'){
            //获取设置的data的key的值
            return data[obj];
        }else{
            //写入新设置的data对象
            let newData = Object.assign(data, obj);

            this[setParam]('data', newData);
        }
    }


    //动画 wx提供
    animate(obj, time = '1000', type = 'linear', callback){
        callback = callback || function(){};

        //创建wx动画对象
        var animation = wx.createAnimation({
            duration: time,
            timingFunction: type,
        });

        //处理obj
        let newObj = [];
        for (let [key, val] of Object.entries(obj)){
            if(key == 'transform'){
                let _val = val.split('(');
                key = _val[0];
                val = parseInt(_val[1]);
            }
 
            newObj.push({
                key:key,
                val:val
            });
        }

        //生成wx的动画方式
        for(let i =0,l=newObj.length;i<l;i++){
            let _obj = newObj[i],
                key = _obj.key,
                val = _obj.val;
            animation[key](val);
        }
        animation.step();

        this[setParam]('animation', animation.export());

        setTimeout(function(){
            callback();
        },time);

        return this;

    }

    //css动画
    cssAnimate(obj,time='1000',type='linear',callback){
        callback = callback || function(){};
        this.cssAnimateCallback = callback;
        let animateObj = {
            '-webkit-transition': 'all ' + time+'ms '+type,
            'transition': 'all ' + time + 'ms ' + type,
            'transform-origin':'center center',
            '-webkit-transform-origin':'center center'
        };

        this.css(animateObj);
        // let newObj = Object.assign(obj,animateObj);

        this.css(obj);

        this.cssAnimateTimeout = setTimeout(function(){
            callback();
        },time);

        return this;
    }
    // cssAnimateStopToEnd(){
    //     let animateObj = {
    //         '-webkit-transition': '',
    //         'transition': '',
    //     };
    //     this.css(animateObj);
    //
    //     clearTimeout(this.cssAnimateTimeout);
    //     if(this.cssAnimateCallback){
    //         this.cssAnimateCallback();
    //     }
    // }


    //获取id元素的属性
    //获取class元素的属性
    [getDomParam](id){
        return new Promise(success=>{
            let query = wx.createSelectorQuery();
            query.select(id).boundingClientRect();
            query.exec(function (res) {
                if (res[0]) {
                    success(res[0]);
                }else{
                    console.log('获取失败！');
                    error('获取失败')
                }
            })
        })
    }

    //获取id元素的宽度,获取class元素的属性(class为第一个元素)
    //#ID 或 .class
    async width(){
        let domParam = await this[getDomParam]('#' + this.id);
        return domParam.width;
    }
    async height(){
        let domParam = await this[getDomParam]('#' + this.id);
        return domParam.height;
    }
    async offset(){
        let domParam = await this[getDomParam]('#' + this.id),
            win = wx.getSystemInfoSync(),
            winWidth = win.windowWidth,
            winHeight = win.windowHeight;

        return {
            top: domParam.top,
            left: domParam.left,
            right: winWidth-domParam.right,
            bottom:winHeight-domParam.bottom
        }
    }

    //生成随机数
    [createRadomNumber](){
        let time = new Date().getTime(),
            fn = 'fn'+time;
        if(this.obj[fn]){
            nu++;
            fn = fn+""+nu;
        }

        return fn;    
    }

    //不冒泡的事件
    tap(fn){
        let fnName = this[createRadomNumber]();
        this.obj[fnName] = function(e){
            fn(e);
        };

        let tapName = this[getParam]('catch_tap');
        if(tapName){
            this.obj[tapName] = null;
        }

        this[setParam]('catch_tap',fnName);
        return this;
    }
   
    
}


// let jqCatch = {};


//obj指到传入page的对象，一般this
module.exports = function(obj,id){
    // if(jqCatch[id]){
    //     return jqCatch[id];
    // }else{
    //     let aa = new jq(id,obj);
    //     jqCatch[id] = aa;
    //     return aa;
    // }

    return new jq(id,obj);
};