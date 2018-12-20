//app.js


App({

  onLaunch: function(options) {
    console.log("app第一次启动", options)


    // 用于测试。。。
    this._test();

    let that = this;

    wx.getSystemInfo({
      success: function(res) {
        console.log("获取系统信息 ", res)
        //获取rpx的比例
        var width = res.windowWidth;
        if (res.windowWidth > res.windowHeight) {
          width = res.windowHeight;
        }
        let rpx = width / 750;
        that.globalData.rpx = rpx;
      },
    })
  },
  _test() {

  },

  // 启动或进入前台
  onShow() {
    console.log("app启动或进入前台")
  },

  // 进入后台
  onHide() {
    console.log("app进入后台")
  },

  globalData: {
    rpx: 1
  }
})