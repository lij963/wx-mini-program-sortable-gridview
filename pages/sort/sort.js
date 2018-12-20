const rpx = getApp().globalData.rpx
const standardPositions = [
  //第一排
  {
    x: 0,
    y: 0
  },
  {
    x: 0 + 190 + 20,
    y: 0
  },
  {
    x: 0 + 190 + 20 + 190 + 20,
    y: 0
  },
  //第二排
  {
    x: 0,
    y: 0 + 190 + 20
  },
  {
    x: 0 + 190 + 20,
    y: 0 + 190 + 20
  },
  {
    x: 0 + 190 + 20 + 190 + 20,
    y: 0 + 190 + 20
  },
  //第三排
  {
    x: 0,
    y: 0 + 190 + 20 + 190 + 20
  },
  {
    x: 0 + 190 + 20,
    y: 0 + 190 + 20 + 190 + 20
  },
  {
    x: 0 + 190 + 20 + 190 + 20,
    y: 0 + 190 + 20 + 190 + 20
  },
  //防止添加按钮报错 ，虽然报错的时候添加按钮是隐藏的 但是还是先保留。
  {
    x: 0,
    y: 0
  },
  {
    x: 0,
    y: 0
  }
];

Page({
  /**
   * 页面的初始数据
   */
  data: {
    imgSrcs: [],
    standardPositions,
    reallyPositons: standardPositions.slice(0, standardPositions.length),
    showAdd: true, // 是否显示添加图片
    currentTouchIndex: -1, //当前拖动的那个坐标
    animation: true, //拖动排序时是否执行动画。现在在松手时不执行动画
  },
  /**
   * onLoad
   */
  onLoad(options) {
    console.log("页面初次onload", options);
  },
  /**
   * 输入文字变化了
   * */
  onTextChange(event) {
    console.log("输入文字变化了", event)
    this.text = event.detail.value;
  },
  /**
   * 点击发布
   * */
  onSendTap(event) {
    wx.showLoading({
      title: '上传中...',
    })
    if (this.data.imgSrcs.length == 0) {
      wx.showToast({
        title: '请至少发布一张图片',
        icon: "none"
      })
      return
    } else {
      //假装在传~
      setTimeout(() => {
        wx.showToast({
          title: '发布成功~ 假的',
          icon: "none"
        })
        wx.hideLoading()
      }, 1000)
    }

  },

  /**
   * 预览图片
   * */
  _previewImage(event) {
    console.log("点击了一张图片", event);
    const index = event.currentTarget.dataset.index;
    const images = event.currentTarget.dataset.images;
    wx.previewImage({
      urls: images,
      current: images[index]
    })
  },
  /** 
   * 点击增加图片按钮
   * */
  _onTappedAddPicture() {
    let that = this;
    let count = 9 - this.data.imgSrcs.length;
    wx.chooseImage({
      count: count,
      success: function(res) {
        let tempFilePaths = res.tempFilePaths.join(",")
        that._addPictures(tempFilePaths)
      },
    })
  },

  /** 
   * 增加图片
   * */
  _addPictures(paths) {
    if (this.data.imgSrcs.length == 0) {
      let temps = paths.split(",");
      this.data.imgSrcs = temps;
    } else {
      let splits = paths.split(",");
      let imgSrcs = this.data.imgSrcs;
      let concats = imgSrcs.concat(splits);
      this.data.imgSrcs = concats;
    }
    this.setData({
      imgSrcs: this.data.imgSrcs,
      showAdd: this.data.imgSrcs.length == 9 ? false : true,
    })
  },

  /**
   * 删除一张图
   * */
  _removeOnePicture(e) {
    let index = e.target.dataset.index
    this.data.imgSrcs.splice(index, 1);
    let showAdd = false;
    if (this.data.imgSrcs.length < 9) {
      showAdd = true;
    }
    console.log(this.data.imgSrcs.length);
    this.setData({
      imgSrcs: this.data.imgSrcs,
      showAdd
    })
  },

  /**
   * 图片正在移动
   * 当图片被拖动的时候需要做的事情：
   * -- 将当前这张图片的zIndex调大，让他始终不会被其他图片挡住；
   * -- 获得当前拖动的图片的index
   * -- 根据当前的坐标计算他移动到哪了 目标的index
   * -- 如果移动到了别人的底盘，让别人给他让位置，并记录目标位置的index
   */
  _onImgMove(event) {

    if (event.detail.source != 'touch') {
      //非用户行为则不处理
      return
    }


    let imgListLength = this.data.imgSrcs.length //当前图片列表的长度
    let touchIndex = event.currentTarget.dataset.index //跟随手指移动的那张图的index
    let detail = event.detail //手指在屏幕上的坐标信息
    this.isMoving = true //将状态修改为正在拖动
    let targetIndex = this._calculateTargetIndex(detail) //当前被拖动到了哪儿
    console.log("目标位置的index = ", touchIndex, ",targetIndex = ", targetIndex, ",length = ", imgListLength)
    //只需要修改我和目标位置之间的坐标（不包含我，包含目标），其他不要动
    if (targetIndex >= 0) { //至少有一个目的地
      if ((!this.currentTargetIndex && this.currentTargetIndex != 0) || this.currentTargetIndex != targetIndex) { //每次进入一个目标 只执行一次动画
        console.log("开始计算，此时的目标位置 currentTargetIndex：", this.currentTargetIndex, ",targetIndex = ", targetIndex)

        this.currentTargetIndex = targetIndex;
        this.setData({
          currentTouchIndex: touchIndex
        })
        let data = {}
        //重新计算每一个图片应该在的位置
        for (let i = 0; i < imgListLength; i++) {
          //默认设置为标准位置
          let position = standardPositions[i]
          if (touchIndex > targetIndex) {
            //向前移动，不需要处理touchIndex之后的数据，不需要处理 targetIndex 之前的数据
            if (i <= touchIndex && i >= targetIndex) {
              //设置为标准位置往后移动一位
              position = standardPositions[i + 1]
            }
          } else {
            //向后移动，不需要处理touchIndex之前的数据，不需要处理 targetIndex 之后的数据
            if (i >= touchIndex && i <= targetIndex) {
              //设置为标准位置往前移动一位
              position = standardPositions[i - 1]
            }
          }
          //不修改当前拖动的这张图的位置，避免发生晃动
          if (i != touchIndex) {
            data[`reallyPositons[${i}]`] = position
          }
        }
        //一顿计算之后 如果发现生成了新的data数据 那么就执行~
        if (data) {
          console.log("执行动画，当前目标位置 currentTargetIndex= ", this.currentTargetIndex, ",targetIndex = ", targetIndex, " 计算完成的data = ", data)
          this.setData(data)
        }
      }
    }

  },

  /**
   * 手指从屏幕上离开了
   * */
  _onTouchEnd(event) {
    // console.log("手指从屏幕上离开了", event)
    if (this.isMoving) {
      this.setData({
        animation: false
      })
      this.isMoving = false
      let index = event.currentTarget.dataset.index
      console.log("这是一次滑动结束的离开事件。 拖动目标 = ", index, "目的地 = ", this.currentTargetIndex)
      if (this.currentTargetIndex >= this.data.imgSrcs.length) {
        console.log("目标位置 超出了图片数组的长度，将以图片数组长度为目标位置")
        this.currentTargetIndex = this.data.imgSrcs.length - 1
      }
      /**
       * 松手后真正修改图片的顺序。
       * 如果开启了动画 会出现奇怪的现象，暂时在松手的时候关闭动画。
       * 
       * 此处待优化，如果移动距离超过两张图，会出现图片闪烁，虽然不影响功能，但是看起来很不友好。
       * 
       */
      this.setData({
        currentTouchIndex: -1,
        reallyPositons: standardPositions.slice(0, standardPositions.length),
        imgSrcs: this._sortArr(this.data.imgSrcs, index, this.currentTargetIndex),
      }, () => {
        //开启动画
        this.setData({
          animation: true
        })

      })

    }
  },
  /**
   * 移动数组的一个条目到另一个位置
   * */
  _sortArr(arr, fromIndex, toIndex) {
    let imgSrcs = arr.slice(0, arr.length)
    let newArr = []
    for (let i = 0; i < imgSrcs.length; i++) {
      if (i == toIndex) {
        //当前拖动的这条
        newArr.push(imgSrcs[fromIndex])
      } else {
        newArr.push("")
      }
    }
    imgSrcs.splice(fromIndex, 1)
    for (let i = 0, j = 0; i < newArr.length, j < imgSrcs.length; i++, j++) {
      //新数组为空 则填入
      if (!newArr[i]) {
        newArr[i] = imgSrcs[j]
      } else {
        j--
      }
    }
    return newArr
  },

  /**
   * 根据坐标计算当前图片移动到了哪个索引应该存在的位置，返回索引值
   * */
  _calculateTargetIndex(detail) {
    /**
     * 80的目的是为了更接近用户手指按下的位置
     */
    let x = detail.x / rpx + 80
    let y = detail.y / rpx + 80

    console.log("图片正在被拖动 除以rpx后的 x = ", x, ",y = ", y, ",detail=", detail)
    let index = -1
    if (y <= 200) {
      //第一行
      if (x <= 200) {
        //第1个
        index = 0
      } else if (x >= 200 && x <= 410) {
        //第2个
        index = 1
      } else if (x >= 410 && x <= 620) {
        //第3个
        index = 2
      }
    } else if (y >= 200 && y <= 410) {
      //第二行
      if (x <= 200) {
        //第4个
        index = 3
      } else if (x >= 200 && x <= 410) {
        //第5个
        index = 4
      } else if (x >= 410 && x <= 620) {
        //第6个
        index = 5
      }
    } else if (y >= 410 && y <= 620) {
      //第三行
      if (x <= 200) {
        //第7个
        index = 6
      } else if (x >= 200 && x <= 410) {
        //第8个
        index = 7
      } else if (x >= 410 && x <= 620) {
        //第9个
        index = 8
      }
    }
    return index
  },
})