import React, { Component } from 'react';
import {
  Image, View, StyleSheet, BackHandler,
  Button, Alert, Text, FlatList, Modal,
  Platform, NativeModules, StatusBar, ScrollView, TouchableOpacity, DeviceEventEmitter, PermissionsAndroid
} from 'react-native';

import { deviceWidth, deviceHeight, scaleSize } from '../../tools/adaptation';
import Head from '../../components/Public/Head';
import Bottom from '../../components/Public/TabBottom';
import Tabs from '../../components/Public/TabMenu';
import Swiper from 'react-native-swiper';
import styCom from '../../styles/index'

import { HttpGet, HttpPost } from '../../request/index'
import { toastShort } from '../../tools/toastUtil';
import SvgUri from 'react-native-svg-uri';
import { Icons } from '../../fonts/fontIcons'

import DeviceInfo from 'react-native-device-info';
import { getLocation } from "../../tools/AmapLocation";
import ScannerCode from '../../components/Public/ScannerCode'; //扫描二维码
import SYImagePicker from 'react-native-syan-image-picker'
import { storageGet } from '../../storage/index'


let n, self;

export default class HomePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isPermis: false,
      isHide: false,
      scanShow: false,

      StatusBarFtColor: 'light-content',
      StatusBarBgColor: 'transparent',
      StatusBarTranslucent: true,  //状态栏是否隐藏

      addressModalFlag: false,
      modalTitle: '基层治理',
      modalMenuList: [],
      modalIsOpen: false, //记录模式窗口是否打开

      userMeunList: [],
      meunId: 0,

      bannerIndex: 0,
      bannerList: [],
      msgCount: 0,

      activeId: 1,
      tabList: [
        // {
        //   id: '1',
        //   name: '视频'
        // },
        // {
        //   id: '3',
        //   name: '动态'
        // },
        // {
        //   id: '2',
        //   name: '文件文件'
        // },
        // {
        //   id: '4',
        //   name: '小测小测试试'
        // },
      ],

      falvColor: '#2ab2df',

      refreshing: false,
      offset: 1,
      total: 0,
      noArr: false,
      data: [],

    };
  }

  componentDidMount() {

    //收到监听
    this.listener = DeviceEventEmitter.addListener('backHome', () => {

      this.setState({
        StatusBarTranslucent: true,
        StatusBarFtColor: 'light-content',
        StatusBarBgColor: 'transparent'
      })

      if (this.state.modalIsOpen) {
        this.setState({ addressModalFlag: true })
      }

    })


    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
    }

    this.getBannerList();

    this.getMenuList();

    this.getNewsTabs();

    this.getMessage();

    storageGet("userInfo").then(res => {
      console.log(JSON.stringify(res))
    })

    global.navigation = this.props.navigation;
    console.log('requestApi: ' + global.requestApi);

  }


  componentWillUnmount() {

    if (Platform.OS === 'android') {
      BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
    }
  }

  //动态申请系统权限
  async requestMultiplePermission() {
    let perCount = 0;
    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.CAMERA
      ]

      //返回得是对象类型
      const granteds = await PermissionsAndroid.requestMultiple(permissions)
      var data = "是否同意地址权限: "
      if (granteds["android.permission.ACCESS_FINE_LOCATION"] === "granted") {
        data = data + "是\n"
        perCount++
      } else {
        data = data + "否\n"
      }

      data = data + "是否同意相机权限: "
      if (granteds["android.permission.CAMERA"] === "granted") {
        data = data + "是\n"
        perCount++
      } else {
        data = data + "否\n"
      }

      data = data + "是否同意存储权限: "
      if (granteds["android.permission.WRITE_EXTERNAL_STORAGE"] === "granted") {
        data = data + "是\n"
        perCount++
      } else {
        data = data + "否\n"
      }
      console.log(data);

      if (perCount == permissions.length) {
        this.state.isPermis = true;
      }

    } catch (err) {
      toastShort(err.toString())
    }
  }



  onBackAndroid = () => {
    if (global.routeName === 'HomePage') {
      Alert.alert(
        '退出提示',
        '是否要退出基层治理APP？',
        [
          {
            text: '取消',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {
            text: '确定',
            onPress: () => {
              BackHandler.exitApp();
            },
          },
        ],
        { cancelable: false },
      );
      return true;
    }
  };

  loadingTest() {
    toastShort('正在打开地图');

    setTimeout(function () {

      NativeModules
        .AMapLocationModule
        .startHistoryMapFromJS("com.jicengzhili_gm.AMapLocation.activity.AMapActivity");

    }, 500)

  }

  TestRNModel() {
    //获取地址信息

    // getLocation().then((res) => {
    //   alert(JSON.stringify(res))
    //   console.log(res)
    // }).catch((err) => {
    //   console.log(err)
    // });

    //扫码
    // this.setState({scanShow:true});

    //相机功能
    // SYImagePicker.asyncShowImagePicker({
    //   imageCount: 6,
    //   enableBase64: true,
    //   isCrop: false
    // }).then(photos => {
    //   alert(photos.length);

    // }).catch(err => {
    //   resultObj = {
    //     code: 1,
    //     message: '获取相机功能失败'
    //   }
    // })

    //拍照功能
    // SYImagePicker.openCamera({ isCrop: false, showCropCircle: true, showCropFrame: false, enableBase64: true },
    //   (err, photos) => {
    //     console.log(err, photos);
    //     if (!err) {
    //       alert(photos.length);
    //     }
    //   })

  }

  // 扫描二维码开启关闭
  _scanClose(val, info) {
    if (info != undefined) {

      let resultObj = {
        code: 0,
        message: '二维码扫码成功',
        info: info.data
      }
      console.log(resultObj)
    }
    this.setState({
      scanShow: false
    })
  }

  renderSwiper() {

    var itemArr = [];
    let bannerList = this.state.bannerList;
    if (bannerList.length > 0) {

      for (let i = 0; i < bannerList.length; i++) {
        itemArr.push(
          <View style={styles.slide} key='bar01'>
            <Image style={[styles.imageStyle, { width: '100%' }]} resizeMode="cover" source={{ uri: bannerList[i].img[0].url }} />
          </View>
        );
      }

    } else {
      itemArr.push(
        <View style={styles.slide} key='bar01'>
          <Image style={[styles.imageStyle, { width: '100%' }]} resizeMode="cover" source={require('../../assets/topBanner.png')} />
        </View>
      );
      itemArr.push(
        <View style={styles.slide} key='bar02'>
          <Image style={[styles.imageStyle, { width: '100%' }]} resizeMode="cover" source={require('../../assets/topBanner01.png')} />
        </View>
      );
    }

    return itemArr;
  }

  _tabs = (id) => {
    console.log(id);

    this.setState({
      refreshing: false,
      noArr: false,
      data: [],
    });

    this.state.activeId = id;
    this.state.offset = 1;

    this._getList('');
  }

  _onRefresh = (type) => {

    // this.setState({
    //     noArr: false,
    //     data: [],
    // });

    // this.state.offset = 1;
    // this._getList(type == '1' ? '' : '3');
  }

  getMessage() {
    HttpGet('qkwg-system/message/findMessage', { isRead: 0 }).then(res => {
      if (res.flag) {
        this.setState({ msgCount: res.data.length })
      }
    })
  }

  getBannerList() {
    let params = { pageNumber: 1, pageSize: 10 }
    HttpPost('qkwg-system/appBanner/findPage', params, 'json').then(res => {
      if (res.flag) {
        this.setState({ bannerList: res.data.rows })
      }
    })
  }

  //加载首页菜单列表
  getMenuList() {

    HttpGet('qkwg-system/system/menu/queryMenuByUser/172567943237996544', null).then(res => {
      if (res.flag) {

        let defualUrl = 'https://mdajtest.szzt.com.cn/upload/image/20220428/1651117755943_eaba8c1e4a564fe6a4c3430bec05ab66.JPG'
        let meunList = [];
        res.data.map((item, index) => {
          let item1Url = item.iconImgs === '' ? defualUrl : item.iconImgs[0].url;

          meunList.push({
            name: item.name,
            id: item.id,
            menuImageUrl: item1Url,
            outCode: item.description, //后端web配置值：app跳转原生，H5
            subList: []
          })

          item.menuVOS.map(item2 => {
            let item2Url = item2.iconImgs === '' ? defualUrl : item2.iconImgs[0].url;

            meunList[index].subList.push({
              menuName: item2.name,
              pid: item2.pid,
              menuUrl: item2.dataUrl,
              menuImageUrl: item2Url,
              outCode: item2.description, //后端web配置值：app跳转原生，H5
            })
          })
        })

        // global.user.appRoleList = meunList;
        self.setState({ userMeunList: meunList })
      } else {
        toastShort('获取功能菜单失败');
      }
    })
  }

  _appRoleList(type) {

    let meunList = [];

    if (type == 0) {
      this.state.userMeunList.forEach(item => {
        meunList.push({
          menuName: item.name,
          outCode: item.outCode,
          menuImageUrl: item.menuImageUrl,
          id: item.id
        });
      })

    } else {
      //加载子菜单
      let pid = this.state.meunId;

      this.state.userMeunList.forEach(item => {
        if (item.id == pid) {
          item.subList.forEach(item2 => {
            meunList.push({
              menuName: item2.menuName,
              menuImageUrl: item2.menuImageUrl,
              outCode: item2.outCode,
              menuUrl: item2.menuUrl
            });
          })
        }
      })

    }

    // console.log('meunList: ' + JSON.stringify(meunList));
    // let imageUrl = global.imageUrl;

    return (
      meunList.length > 0 ?
        <View style={[type === 0 ? styles.imgView : styles.imgView2]} >
          {
            meunList.map((item, index) => {
              return this._renderMenu({ item }, type)
            })
          }
        </View>
        :
        null
    );
  }

  //加载模式窗体-功能子菜单列表
  _renderMenu(props, menuType) {
    //console.log(props);

    props = props.item;

    let id = props.id;
    let type = props.menuCode;
    let typeName = props.menuName;

    let imgsource = { uri: props.menuImageUrl };
    //outcode后端配置
    let outCode = props.outCode.toLowerCase(), h5Url = props.menuUrl;

    return (
      <TouchableOpacity
        style={[styles.imgMenu]}
        activeOpacity={0.9}
        onPress={this._navOpen(menuType, id, outCode, h5Url, typeName)}
      >

        <Image source={imgsource} style={styles.iconImg} />
        <View>
          <Text style={styles.iconText}>{typeName}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  _navOpen = (type, id, outCode, PageName, typeName) => () => {

    if (!this.state.isPermis) this.requestMultiplePermission();

    if (type == 0) {
      this._appRoleList(type);
      this.setState({ meunId: id })

      this.scrollview.scrollTo({ x: 0, y: 0, animated: false });
      this.setState({ addressModalFlag: true, modalIsOpen: true, modalTitle: typeName })

    } else {

      this.setState({ StatusBarBgColor: '#FFF', StatusBarFtColor: 'dark-content', StatusBarTranslucent: false })

      setTimeout(() => {
        //跳转到H5的界面或者RN原生界面
        this.setState({ addressModalFlag: false })

        if (outCode != 'app') {
          //参数加密
          let h5Url = global.H5Url + "?url=" + PageName;

          self.props.navigation.navigate('Web', {
            outCode: outCode,
            h5Url: h5Url
          })

        } else {
          if (typeof (PageName) != "undefined" && PageName != '')
            global.navigation.navigate(PageName);
        }

      }, 20);

    }
  }

  _renderNews = ({ item }) => {

    var regex = /(<([^>]+)>)/ig
    let content = item.content.replace(regex, "");
    let imgUrl = item.img.length > 0 ? item.img[0].url : '';
    let imgsource = { uri: imgUrl };

    return (

      <TouchableOpacity
        key={item.id}
        style={[styCom.CenterCenter, styles.newsItemCom]}
        activeOpacity={0.8}
        onPress={() => this.showMoreNews('/pages/home/partyActivities/partyDetail/index?id=' + item.id)}>

        <View style={{ flex: 2, height: scaleSize(190) }}>
          <Text style={{ fontSize: scaleSize(32), fontWeight: 'bold' }} numberOfLines={1}>{item.title}</Text>
          <Text style={{ marginTop: scaleSize(15), marginBottom: scaleSize(15), color: '#999' }} numberOfLines={2}>{content}</Text>
          <Text style={{ color: '#999' }}>{item.updateTime}</Text>
        </View>

        {
          imgUrl != '' ?
            <View style={{ flex: 1, alignItems: 'center', marginLeft: scaleSize(10) }}>
              <Image style={{ width: scaleSize(230), height: scaleSize(180), borderRadius: scaleSize(15) }} resizeMode="cover" source={imgsource}></Image>
            </View>
            : null
        }

      </TouchableOpacity>
    )
  }

  getNewsTabs() {

    var regex = /(<([^>]+)>)/ig

    let params = { pageNumber: 1, pageSize: 10, status: 0 }
    HttpPost('qkwg-system/column/findPage', params, 'json').then(res => {
      if (res.flag) {
        let tabList = [];
        if (res.data.rows.length > 0) {

          res.data.rows.map(item => {

            let title = item.name.replace(regex, "");
            tabList.push({
              id: item.id,
              name: title.length > 4 ? title.substring(0, 4) + '..' : title
            })
          })

          this.setState({
            tabList,
            activeId: tabList[0].id
          })

          this._tabs(tabList[0].id)
        }
      }
    })
  }

  _getList(type) {

    let params = {
      columnId: this.state.activeId,
      pageNumber: this.state.offset,
      pageSize: 3,
      status: 1
    }

    HttpPost('qkwg-system/article/findPage', params, 'json').then(res => {
      if (res.flag) {

        let resdata = res.data.rows;

        if (resdata == null || resdata.length < 1) {
          self.setState({ noArr: true })

          if (res.data.total == 0 && self.state.offset == 1) {
            self.setState({
              data: [],
              total: 0,
            })
          }
          return false;
        }

        let data = type == '2' ? self.state.data : [];
        for (let i = 0; i < resdata.length; i++) {
          data.push(resdata[i]);
        }
        self.setState({
          data: data,
          total: res.data.total
        })

      } else {
        toastShort('获取信息失败')
      }
    })
  }

  showMoreNews = (h5PageName, id) => {
    // global.navigation.navigate(url);

    // this.scrollview.scrollTo({ x: 0, y: 0, animated: true });
    this.setState({ StatusBarBgColor: '#FFF', StatusBarFtColor: 'dark-content', StatusBarTranslucent: false })

    //参数加密
    let h5Url = global.H5Url + "?url=" + h5PageName;
    console.log('H5Url: ' + h5Url)

    self.props.navigation.navigate('Web', {
      outCode: 'h5',
      h5Url: h5Url
    })
  };

  _empty = () => {
    return <View style={[styCom.emptyContent]}>
      <Text style={[styCom.empty, { marginTop: scaleSize(20) }]}>暂无数据</Text>
    </View>;
  }

  _footer = () => {
    return (
      <View style={[styCom.footerTip]}>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => this.showMoreNews('/pages/home/partyActivities/partyList/index')}>
          <Text>
            {this.state.data.length == 0 ? '' : this.state.data.length == this.state.total ? '到底了~' : '查看更多'}
          </Text>
        </TouchableOpacity>

      </View>);
  }

  _onScroll(event) {

    if (global.routeName === 'HomePage') {

      let y = event.nativeEvent.contentOffset.y;
      console.log(y)
      if (y > 210) {
        this.setState({ StatusBarBgColor: '#2589FF', })
      } else {
        this.setState({ StatusBarBgColor: 'transparent', })
      }
    }

  }


  render() {
    n = this.props.navigation;
    self = this;

    return (
      <View style={styles.container}>
        {/* <Head back={false} title='基层治理' /> */}

        <StatusBar
          animated={false} //指定状态栏的变化是否应以动画形式呈现。 
          translucent={this.state.StatusBarTranslucent}//指定状态栏是否透明。设置为true时:transparent
          backgroundColor={this.state.StatusBarBgColor} //状态栏的背景色
          barStyle={this.state.StatusBarFtColor} // 字体样式 enum('default', 'light-content', 'dark-content')  
        />

        <ScrollView style={{ width: '100%' }} ref={(r) => this.scrollview = r}
          onScroll={this._onScroll.bind(this)}
          contentContainerStyle={{ paddingBottom: scaleSize(100) }}>

          <View style={styles.titlePostion}><Text style={styles.titleText}>基层治理首页</Text></View>

          {
            this.state.msgCount > 0 ? 
            <TouchableOpacity
              style={styles.txPostion}
              activeOpacity={0.8}
              onPress={() => this.showMoreNews('/pages/me/myNews/index')}>

              <SvgUri width="30" height="40" svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.homeXiaoxi}" fill="#fff"></path></svg>`} />
              <View style={styles.xiaoxiCont}>
                <Text style={{ color: '#fff', fontSize: scaleSize(20) }}>{this.state.msgCount > 99 ? '99+' : this.state.msgCount}</Text>
              </View>
            </TouchableOpacity>
              : null
          }

          <View
            style={styles.swiperContainer}>

            <Swiper
              // autoplay={true}
              // autoplayTimeout={10}

              style={styles.swiperStyle}
              height={scaleSize(500)}
              // index={this.state.bannerIndex}
              // horizontal={true}
              // loop={true}
              // showsButtons={true}
              // paginationStyle={{ bottom: scaleSize(10) }}

              // onMomentumScrollEnd={(e, state, context) => { this.state.bannerIndex = state.index;console.log(state.index) }}
              dot={<View style={{ backgroundColor: 'rgba(0,0,0,.2)', width: 5, height: 5, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 0 }} />}
              activeDot={<View style={{ backgroundColor: '#000', width: 8, height: 8, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 0 }} />}
            >
              {this.renderSwiper()}
            </Swiper>

          </View>

          <View>

            {/* icon加载区域 */}
            <View style={styles.iconCom}>
              {this._appRoleList(0)}
            </View>

            {/* 新闻内容区域 */}
            <View style={styles.newsCom}>

              <View>
                <Tabs style={{ paddingTop: scaleSize(10) }} status={this.state.activeId} tabList={this.state.tabList} tab={this._tabs.bind(this)} borderShow={false} />
              </View>

              <View>

                <FlatList
                  // style={{height:deviceHeight-scaleSize(160)}}
                  ref={(flatList) => this._flatList = flatList}
                  ListFooterComponent={this._footer}
                  ListHeaderComponent={() => { return null }}
                  ListEmptyComponent={this._empty}
                  renderItem={this._renderNews}
                  numColumns={1}
                  refreshing={this.state.refreshing}
                  // getItemLayout={(data, index) => (
                  //     { length: ITEM_HEIGHT, offset: (ITEM_HEIGHT + 2) * index, index }
                  // ) }
                  onRefresh={this._onRefresh}//下拉刷新
                  onEndReachedThreshold={0.05}
                  keyExtractor={this._keyExtractor}
                  onEndReached={(info) => {//上拉加载更多
                    // alert("滑动到底部了");
                    if (this.state.noArr) { return false; }
                    this.state.offset = this.state.offset + 1;
                    // this._getList('2');
                  }}
                  data={this.state.data}>
                </FlatList>
              </View>

            </View>
          </View>

        </ScrollView>


        <Modal
          visible={this.state.addressModalFlag}
          animationType='slide'
          transparent={true}
          onRequestClose={() => { this.setState({ addressModalFlag: false, modalIsOpen: false }) }}
        >
          <View style={{ flex: 1, backgroundColor: '#F4F4F4' }}>
            <View style={[styles.modalHeader]}>
              <Text style={styles.modalHeaderTitle}>{this.state.modalTitle}</Text>

              <TouchableOpacity
                onPress={() => { this.setState({ addressModalFlag: false, modalIsOpen: false }) }}
                activeOpacity={.8}
                style={styles.modalCloseBtn}
              >
                <SvgUri width="20" height="20" svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.close}" fill="#A4A4A4"></path></svg>`} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalCom}>

              {this.state.addressModalFlag ? this._appRoleList(1) : null}
            </View>
          </View>

        </Modal>

        {/* <Bottom active="h" navigation={this.props.navigation} /> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    display: 'flex'
  },

  slide: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },

  iconText: {
    color: '#333', fontSize: scaleSize(24), fontWeight: '500', marginTop: scaleSize(10), marginBottom: scaleSize(10)
  },

  iconImg: {
    height: scaleSize(110), width: scaleSize(110), zIndex: 10, borderRadius: scaleSize(120)
  },

  imgView: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    padding: scaleSize(20)
  },

  imgView2: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    backgroundColor: '#F4F4F4',
  },

  imgMenu: {
    width: '25%',
    // height:scaleSize(135),
    paddingLeft: scaleSize(10),
    paddingRight: scaleSize(10),
    marginBottom: scaleSize(20),
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },

  titlePostion: {
    position: 'absolute',
    zIndex: 110,
    top: 40,
    left: 15
  },

  txPostion: {
    position: 'absolute',
    zIndex: 110,
    top: 30,
    right: 25
  },

  titleText: {
    color: '#fff',
    fontSize: scaleSize(36),
  },

  xiaoxiCont: {
    position: 'absolute', top: 5, right: -5, backgroundColor: '#f90e0e', paddingTop: scaleSize(2), paddingBottom: scaleSize(2),
    paddingLeft: scaleSize(10), paddingRight: scaleSize(10),
    borderRadius: scaleSize(20)
  },

  swiperContainer: {
    height: scaleSize(500),
    marginBottom: 0,
    zIndex: 100,
    padding: 0
  },

  swiperStyle: { marginTop: scaleSize(-2) },
  swiperItem: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  imageStyle: {
    flex: 1,
  },

  iconCom: {
    backgroundColor: '#fff',
    paddingTop: scaleSize(30),
  },

  newsCom: {
    backgroundColor: '#fff',
    height: '100%',
    marginBottom: scaleSize(30),
    marginTop: scaleSize(20),
  },

  newsItemCom: {
    padding: scaleSize(20),
    borderBottomColor: '#EDEDED',
    borderBottomWidth: 1,
  },

  modalHeader: {
    position: 'relative',
    paddingTop: scaleSize(50),
    paddingLeft: scaleSize(20),
    paddingRight: scaleSize(20),
    paddingBottom: scaleSize(0)
  },
  modalHeaderTitle: {
    fontSize: scaleSize(40),
    color: '#333',
    fontWeight: '400'
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalCom: {
    padding: scaleSize(40),
    backgroundColor: '#F4F4F4'
  },

});
