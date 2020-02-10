const pageFn = require('./pagePublish');


module.exports = {
    ready(obj){
        obj = Object.assign(obj,pageFn);
        Page(obj);
    },


    //ajax promise
    // opt={
    //     url:'',  //@param:str
    //     data:''  //@param:json2str
    // }
    ajax(opt) {
        return new Promise((success, error) => {
            wx.request({
                url: opt.url,
                dataType: 'json',
                data: JSON.stringify(opt.data),
                method: "post",
                success: function (rs) {
                    success(rs);
                },
                error: function (rs) {
                    console.log(rs);
                    error(rs);
                }
            })
        });
    },


    //alert promise
    //@param:msg     str
    //@param:title   str
    alert(msg, title) {
        msg = (typeof msg == 'string') ? msg : JSON.stringify(msg);

        return new Promise(success => {
            title = title || "系统提示";
            wx.showModal({
                title: title,
                content: msg,
                showCancel: false,
                confirmText: "确定",
                success: function () {
                    success();
                }
            })
        });
    },
    confirm(msg, title) {
        msg = (typeof msg == 'string') ? msg : JSON.stringify(msg);
        return new Promise((success, error) => {
            title = title || "系统提示";
            wx.showModal({
                title: title,
                content: msg,
                success: function (res) {
                    if (res.confirm) {
                        success();
                    } else if (res.cancel) {
                        error();
                    }
                }
            })
        })

    },

    //显示提示
    //info.show(text);
    //info.hide()
    info: {
        show(msg) {
            if (typeof msg != 'string') {
                msg = JSON.stringify(msg);
            }
            wx.showToast({
                title: msg,
                icon: 'none',
                duration: 2000
            })
        },
        hide() {
            wx.hideToast()
        }
    },


    //loading
    //loading.show(text)
    //loading.hide();
    loading: {
        show: function (text = '极速加载中') {
            wx.showLoading({
                title: text,
                mask: true
            });
        },
        hide: function () {
            wx.hideLoading();
        }
    },



    //设置标题
    //#param:title  str
    setTitle(title) {
        wx.setNavigationBarTitle({
            title: title,
        })
    },


    //设置顶部系统条颜色
    //@param  fontColor:str   '#ffffff'
    //@param  bgColor:str     '#ffffff'
    //注意其中fontColor 只能是#ffffff 或  #000000
    setNavigationBarColor(fontColor, bgColor) {
        wx.setNavigationBarColor({
            frontColor: fontColor,
            backgroundColor: bgColor,
            animation: {
                duration: 0,
                timingFunc: 'easeIn'
            }
        })
    },


    //打开新页面
    //@param:url   str
    openUrl(url) {
        wx.redirectTo({ url: url });
    },
    closeAndOpenUrl(url){
        wx.redirectTo({url:url});
    },

    //返回前几页
    //@param  number:number
    goBack(number = 1) {
        wx.navigateBack({
            delta: number
        })
    },


    //打电话
    //@param:tel   number
    tel(tel) {
        wx.makePhoneCall({
            phoneNumber: tel
        })
    },



    //本地数据缓存  promise 一堆
    //10M空间
    //@param   key:str
    //@param   val:str/obj
    setLocalData(key, val) {
        return new Promise((success, error) => {
            wx.setStorage({
                key: key,
                data: val,
                success: function () {
                    success();
                },
                error: function (msg) {
                    error(msg);
                }
            })
        });
    },
    //@param   key:str
    getLocalData(key) {
        return new Promise(success => {
            wx.getStorage({
                key: key,
                complete: function (obj) {
                    obj = obj || {};
                    obj = obj.data || '';
                    success(obj)
                }
            })
        });
    },
    //@param   key:str
    delLocalData(key) {
        return new Promise(success => {
            wx.removeStorage({
                key: key,
                success: function (res) {
                    success();
                }
            })
        })
    },
    //清除所有缓存
    clearLocalData() {
        wx.clearStorageSync();
    },




    //滚动页面到指定位置
    scrollTo(top = 0, duration = 300) {
        wx.pageScrollTo({
            scrollTop: top,
            duration: duration
        })
    },



    //获取指定元素的实际属性
    //如果传入的是class获取的是第一个找到的class的dom的属性
    //@param:id    .class/#id
    getDomParam(id) {
        return new Promise(success=>{
            console.log('in 1')
            let query = wx.createSelectorQuery();
            console.log('in 2')
            query.select(id).boundingClientRect();
            console.log('in 3')
            query.exec(function (res) {
                console.log('re '+JSON.stringify(res))
                if(res[0]){
                    let backData = res[0] || {
                            top:0,
                            bottom:0,
                            left:0,
                            right:0,
                            width:0,
                            height:0
                        };
                    success(backData);
                }
            })
        })
    },


    //获取视窗滚动的距离
    getScrollState() {
        return new Promise(success => {
            wx.createSelectorQuery().selectViewport().scrollOffset(function (res) {
                //res.scrollLeft
                //res.scrollTop
                //res.id
                //res.dataset
                success({
                    left: res.scrollLeft,
                    top: res.scrollTop
                });
            }).exec();
        })
    },


    device(){
        return wx.getSystemInfoSync();
    },


    sleep(ms){
        return new Promise(success=>{
            setTimeout(function(){
                success();
            },ms)
        })
    }
};