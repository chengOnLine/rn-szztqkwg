import React, { Component } from 'react';
import {
  TouchableOpacity,
  Image,
  View,
  StyleSheet,
  BackHandler,
  Text,
  Platform,
  StatusBar, ScrollView, Alert,
  DeviceEventEmitter
} from 'react-native';
import { CommonActions } from '@react-navigation/native';

import SvgUri from 'react-native-svg-uri';
import { deviceWidth, deviceHeight, scaleSize } from '../../tools/adaptation';
import Head from '../../components/Public/Head';
import Bottom from '../../components/Public/TabBottom';
import { Icons } from '../../fonts/fontIcons'
import { HttpGet, HttpPost } from '../../request/index'
import { storageDeleteItem } from '../../storage/index'

let self, n;
export default class MyIndex extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userInfo: {
        userImg: 'https://mdajtest.szzt.com.cn/upload/image/20220428/1651117755943_eaba8c1e4a564fe6a4c3430bec05ab66.JPG',
        roleName: '',
        fullName: ''
      },
    };
  }
  componentDidMount() {

    global.routeName = 'MyIndex'

    this.unsubscribe = this.props.navigation.addListener('tabPress', e => {
      if (global.routeName == 'MyIndex') return;

      global.routeName = 'MyIndex'

    });

    this.getPersonalInfo();

  }

  componentWillUnmount() {

    this.unsubscribe();
  }

  getPersonalInfo() {

    HttpGet('qkwg-system/system/user/personalCenter', null).then((res) => {

      if (res.flag) {

        if (res.data == null) {
          return false;
        }

        let { fullName, roleName, iconImgs } = res.data;

        let userImg = ''
        if (iconImgs != "" || iconImgs.length > 0) {
          userImg = iconImgs[0].url
        } else {
          //默认图像
          userImg = "https://mdajtest.szzt.com.cn/upload/image/20220428/1651117755943_eaba8c1e4a564fe6a4c3430bec05ab66.JPG";
        }

        self.setState({
          userInfo: {
            fullName, roleName, userImg
          }
        })

      } else {
        toastShort(res.msg, 'bottom');
      }

    }).catch((error) => {
      // console.log(error);
      toastShort(error, 'bottom');//超时会在这里
    })
  }

  goWeb(PageName, type) {

    //跳转到H5的界面或者RN原生界面
    if (type != 'app') {
      //参数加密
      let h5Url = global.H5Url + "?url=" + PageName;
      console.log('H5界面：' + h5Url)

      self.props.navigation.navigate('Web', {
        outCode: 'h5',
        h5Url: h5Url
      })

    } else {
      global.navigation.navigate(PageName);
    }
  }

  _jumpPage(page) {
    // n.navigate(page);
  }

  outLogin() {

    Alert.alert(
      '退出提示',
      '是否要退出登录？',
      [
        {
          text: '取消',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: '确定',
          onPress: () => {

            HttpGet('qkwg-oauth-server/auth/loginOut/0', null).then((res) => {
              if (res.flag) {

                //设置路由返回第一个界面
                global.navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Login' },],
                  })
                );

                global.requestHeadAuthorization = "";
                storageDeleteItem("requestHeadAuthorization");

              } else {
                toastShort('退出登录异常', 'bottom');
              }

            }).catch((error) => {
              toastShort(error, 'bottom');//超时会在这里
            })
          },
        },
      ],
      { cancelable: false },
    );

  }

  render() {
    self = this;
    n = this.props.navigation;
    return (
      <View style={styles.container}>

        <View style={styles.mainView}>

          <View style={styles.topMain}>

            {/* 个人资料 */}
            <View style={styles.userTop}>
              <View>
                <Image source={{ uri: this.state.userInfo.userImg }} style={styles.iconImg} />
              </View>

              <View style={{ flexDirection: 'column', alignContent: 'center', marginLeft: scaleSize(30) }}>
                <View><Text style={{ color: '#fff', fontSize: scaleSize(32), marginBottom: scaleSize(5) }}>{this.state.userInfo.fullName}</Text></View>
                <View><Text style={{ color: '#fff', fontSize: scaleSize(24) }}>角色：{this.state.userInfo.roleName}</Text></View>
              </View>

            </View>
          </View>

          {/* 个人信息，草稿箱--菜单 */}
          <View style={{ backgroundColor: '#fff', width: '100%', paddingTop: scaleSize(130) }}>

            <TouchableOpacity
              onPress={() => { this.goWeb('/pages/me/personalInfo/index') }}
              style={styles.userMeun}>
              <View style={styles.userMeunItem}>

                <SvgUri style={styles.userMeunIcon} svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.userMeun01}" fill="#2589FF"></path></svg>`} />
                <Text style={styles.userMeunFont}>个人信息</Text>
              </View>

              <View>
                <SvgUri style={styles.rightIcon} svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.moree}" fill="#C5C5C5"></path></svg>`} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { this.goWeb('/pages/me/myDrafts/index') }}
              style={styles.userMeun}>
              <View style={styles.userMeunItem}>
                <SvgUri style={styles.userMeunIcon} svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.userMeun02}" fill="#2589FF"/><path d="${Icons.userMeun02_2}" fill="#2589FF"/></svg>`} />

                <Text style={styles.userMeunFont}>草稿箱</Text>
              </View>

              <View>
                <SvgUri style={styles.rightIcon} svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.moree}" fill="#C5C5C5"></path></svg>`} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { this.goWeb('MailList', 'app') }}
              style={styles.userMeun}>
              <View style={styles.userMeunItem}>
                <SvgUri style={styles.userMeunIcon} svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.tongxunlu}" fill="#2589FF"/><path d="${Icons.userMeun02_2}" fill="#2589FF"/></svg>`} />

                <Text style={styles.userMeunFont}>通讯录</Text>
              </View>

              <View>
                <SvgUri style={styles.rightIcon} svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.moree}" fill="#C5C5C5"></path></svg>`} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { this.goWeb('/pages/me/myNews/index') }}

              style={styles.userMeun}>
              <View style={styles.userMeunItem}>

                <SvgUri style={styles.userMeunIcon} svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.userMeun03}" fill="#2589FF"></path></svg>`} />
                <Text style={styles.userMeunFont}>我的消息</Text>
              </View>

              <View style={{ flexDirection: 'row' }}>
                {/* <View style={styles.xiaoxiCont}>
                  <Text style={{ color: '#fff', fontSize: scaleSize(20) }}>5</Text>
                </View> */}

                <SvgUri style={styles.rightIcon} svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.moree}" fill="#C5C5C5"></path></svg>`} />
              </View>
            </TouchableOpacity>

          </View>

          {/* 安全中心，意见反馈 --- 菜单 */}
          <View style={{ backgroundColor: '#fff', width: '100%', marginTop: scaleSize(30) }}>

            <TouchableOpacity
              onPress={() => { this.goWeb('/pages/me/securityCenter/index') }}
              style={styles.userMeun}>
              <View style={styles.userMeunItem}>

                <SvgUri style={styles.userMeunIcon} svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.userMeun04}" fill="#2589FF"/></svg>`} />
                <Text style={styles.userMeunFont}>安全中心</Text>
              </View>

              <View>
                <SvgUri style={styles.rightIcon} svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.moree}" fill="#C5C5C5"></path></svg>`} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity

              onPress={() => { this.goWeb('/pages/me/suggestions/index') }}
              style={styles.userMeun}>
              <View style={styles.userMeunItem}>

                <SvgUri style={styles.userMeunIcon} svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.userMeun05}" fill="#2589FF"/><path d="${Icons.userMeun05_2}" fill="#2589FF"/></svg>`} />
                <Text style={styles.userMeunFont}>意见反馈</Text>
              </View>

              <View>
                <SvgUri style={styles.rightIcon} svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.moree}" fill="#C5C5C5"></path></svg>`} />
              </View>
            </TouchableOpacity>

            {/* <TouchableOpacity style={styles.userMeun}>
              <View style={styles.userMeunItem}>

                <SvgUri style={styles.userMeunIcon} svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.userMeun06}" fill="#2589FF"/></svg>`} />
                <Text style={styles.userMeunFont}>检查更新</Text>
              </View>

              <View>
                <SvgUri style={styles.rightIcon} svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.moree}" fill="#C5C5C5"></path></svg>`} />
              </View>
            </TouchableOpacity> */}

            <TouchableOpacity style={styles.userMeun}
              onPress={() => { this.goWeb('/pages/me/aboutVersion/index') }}
            >
              <View style={styles.userMeunItem}>

                <SvgUri style={styles.userMeunIcon} svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.userMeun07}" fill="#2589FF"></path></svg>`} />
                <Text style={styles.userMeunFont}>关于版本</Text>
              </View>

              <View>
                <SvgUri style={styles.rightIcon} svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.moree}" fill="#C5C5C5"></path></svg>`} />
              </View>
            </TouchableOpacity>

          </View>

          <TouchableOpacity
            style={styles.outlogin}
            onPress={() => { this.outLogin() }}
          >
            <Text style={styles.outloginft}>退出登录</Text>
          </TouchableOpacity>

        </View>

        {/* 积分商城，我的积分，奖励分申请 */}
        <View style={styles.topBanner}>

          <TouchableOpacity
            style={styles.bannerItem}
            activeOpacity={0.8}
            onPress={() => this._jumpPage('MyIndex')}>

            <SvgUri width="30" height="40" svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.userJifenSc}" fill="#2589FF"/><path d="${Icons.userJifenSc_02}" fill="#2589FF"/></svg>`} />

            <Text>
              积分商城
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bannerItem}
            activeOpacity={0.8}
            onPress={() => this._jumpPage('MyIndex')}>
            <SvgUri width="30" height="40" svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.userJifen}" fill="#2589FF"></path></svg>`} />
            <Text>
              我的积分
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bannerItem}
            activeOpacity={0.8}
            onPress={() => this._jumpPage('MyIndex')}>
            <SvgUri width="30" height="40" svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.userJanglifen}" fill="#2589FF"></path></svg>`} />

            <Text>
              奖励分申请
            </Text>
          </TouchableOpacity>
        </View>

        {/* <Bottom active="s" navigation={this.props.navigation} /> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },

  outloginft: {

    color: '#2589FF',
    textAlign: 'center',
    fontWeight: 'bold'
  },

  outlogin: {
    borderRadius: scaleSize(120),
    borderColor: '#EDEDED',
    borderWidth: 1,
    paddingTop: scaleSize(20),
    paddingBottom: scaleSize(20),

    margin: scaleSize(30),

    backgroundColor: '#fff',
    width: '90%',
  },

  rightIcon: {
    width: scaleSize(25),
    height: scaleSize(25)
  },

  userMeunIcon: {
    width: scaleSize(45),
    height: scaleSize(45)
  },

  txPostion: {
    position: 'absolute',
    zIndex: 110,
    top: 10,
    right: 10
  },

  xiaoxiCont: {
    backgroundColor: '#f90e0e', paddingTop: scaleSize(2), paddingBottom: scaleSize(2),
    paddingLeft: scaleSize(10), paddingRight: scaleSize(10),
    marginRight: scaleSize(10),
    borderRadius: scaleSize(20)
  },


  userMeunFont: { color: '#333', fontSize: scaleSize(32), marginLeft: scaleSize(10) },

  topBanner: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderRadius: scaleSize(15),
    position: 'absolute',
    top: scaleSize(230),
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 15,
    marginLeft: 15,
    borderColor: '#EDEDED',
    // borderWidth: 1,
    padding: scaleSize(40),
    elevation: 10, //阴影边框属性
  },

  bannerItem: {
    justifyContent: 'center', alignItems: 'center', width: '33%'
  },

  userMeun: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#EDEDED',
    borderBottomWidth: 0.8,
    marginTop: scaleSize(10),
    marginRight: scaleSize(10),
    marginLeft: scaleSize(10),
  },

  userMeunItem: {
    flexDirection: 'row',
    marginRight: scaleSize(30),
    marginLeft: scaleSize(20),
    paddingTop: scaleSize(25),
    paddingBottom: scaleSize(25),
    alignItems: 'center'
  },

  mainView: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: scaleSize(100),
    // marginTop: scaleSize(20),
  },

  topMain: {
    backgroundColor: '#2589FF', width: '100%', height: scaleSize(300)
  },

  iconImg: {
    height: scaleSize(100), width: scaleSize(100),
    borderRadius: scaleSize(120),
    borderColor: '#fff',
    borderWidth: 1
  },
  userTop: {
    paddingTop: scaleSize(80), paddingLeft: scaleSize(50), flexDirection: 'row', alignContent: 'center'
  },


});
