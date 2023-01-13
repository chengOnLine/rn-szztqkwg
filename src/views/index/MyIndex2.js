import React, { Component } from 'react';
import {
  TouchableOpacity,
  Image,
  View,
  StyleSheet,
  BackHandler,
  Text,
  Platform,
  StatusBar, ScrollView, Alert, ImageBackground,
  DeviceEventEmitter,
  ViewBase
} from 'react-native';
import { CommonActions } from '@react-navigation/native';

import SvgUri from 'react-native-svg-uri';
import { deviceWidth, deviceHeight, scaleSize } from '../../tools/adaptation';
import Head from '../../components/Public/Head';
import Bottom from '../../components/Public/TabBottom';
import { toastShort } from '../../tools/toastUtil';
import { Icons } from '../../fonts/fontIcons'
import { HttpGet, HttpPost } from '../../request/index'
import { storageDeleteItem } from '../../storage/index'

let self, n;
export default class MyIndex2 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userInfo: {
        userImg: 'https://mdajtest.szzt.com.cn/upload/image/20220428/1651117755943_eaba8c1e4a564fe6a4c3430bec05ab66.JPG',
        roleName: '',
        fullName: '',
      },

      version: '',
      msgCount: 0
    };
  }
  componentDidMount() {


    this.getPersonalInfo();

    this.getMessageCount();

    //收到监听
    this.listener = DeviceEventEmitter.addListener('backMyIndex', () => {
      console.log('backMyIndex', global.routeName);

      this.getMessageCount();
    })


    this.unsubscribe = this.props.navigation.addListener('tabPress', e => {

      this.getMessageCount();

      setTimeout(() => {
        global.routeName = 'MyIndex'
      }, 200);

    });

    this.setState({
      version: global.version.curNumber
    })

  }

  componentWillUnmount() {

    this.unsubscribe();
  }


  getMessageCount() {

    let params = {}
    HttpPost('qkwg-system/system/messageList/allMessageIsReadNumber', params, 'json').then(res => {
      if (res.flag) {

        try {
          this.setState({ msgCount: res.data })

        } catch (error) { }
      }
    })

  }

  getPersonalInfo() {

    HttpGet('jczl-system/system/user/personalCenter', null).then((res) => {

      try {

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
              fullName, roleName, userImg,
            },
          })

        } else {
          toastShort(res.msg, 'bottom');
        }

      } catch (error) { }

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

            HttpGet('jczl-oauth-server/auth/loginOut/0', null).then((res) => {
              if (res.flag) {
                console.log('退出成功')
              } else {
                toastShort('退出登录异常', 'bottom');
              }

            }).catch((error) => {
              toastShort(error, 'bottom');//超时会在这里
            })

            try {

              global.requestHeadAuthorization = "";
              storageDeleteItem("requestHeadAuthorization");

              if (global.navigation.dispatch) {
                //设置路由返回第一个界面
                global.navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Login' },],
                  })
                );
              }
            } catch (error) { }

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
        <Head back={false} title='个人中心' />

        <View style={styles.mainView}>

          <View style={styles.topMain}>

            <ImageBackground style={{ flex: 1, height: scaleSize(350) }}
              source={require('../../assets/myIndex/topbg.png')}>

              {/* 个人资料 */}
              <View style={styles.userTop}>
                <View>
                  <Image source={{ uri: this.state.userInfo.userImg }} style={styles.iconImg} />
                </View>

                <View>
                  <View><Text style={{ color: '#fff', fontSize: scaleSize(32), marginTop: scaleSize(15) }}>{this.state.userInfo.fullName}</Text></View>
                </View>

              </View>

            </ImageBackground>

          </View>

          <View style={{ paddingLeft: scaleSize(30), paddingRight: scaleSize(30), width: '100%' }}>

            {/* 个人信息，草稿箱--菜单 */}
            <View style={styles.menuCon}>

              <TouchableOpacity
                onPress={() => { this.goWeb('/pages/me/personalInfo/index') }}
                style={styles.userMeun}>
                <View style={styles.userMeunItem}>

                  <Image style={styles.userMeunIcon} source={require('../../assets/myIndex/usIcon09.png')} />
                  <Text style={styles.userMeunFont}>个人信息</Text>
                </View>

                <View>
                  <SvgUri style={styles.rightIcon} svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.moree}" fill="#C5C5C5"></path></svg>`} />
                </View>
              </TouchableOpacity>
              {/* 
              <TouchableOpacity
                onPress={() => { this.goWeb('/pages/me/myDrafts/index') }}
                style={styles.userMeun}>
                <View style={styles.userMeunItem}>

                  <Image style={styles.userMeunIcon} source={require('../../assets/myIndex/usIcon07.png')} />
                  <Text style={styles.userMeunFont}>草稿箱</Text>
                </View>

                <View>
                  <SvgUri style={styles.rightIcon} svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.moree}" fill="#C5C5C5"></path></svg>`} />
                </View>
              </TouchableOpacity> */}



              <TouchableOpacity
                onPress={() => { this.goWeb('/pages/me/myNews/index') }}
                style={styles.userMeun}>
                <View style={styles.userMeunItem}>

                  <Image style={styles.userMeunIcon} source={require('../../assets/myIndex/usIcon07.png')} />
                  <Text style={styles.userMeunFont}>我的消息</Text>
                </View>

                <View>
                  <SvgUri style={styles.rightIcon} svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.moree}" fill="#C5C5C5"></path></svg>`} />
                </View>

                {
                  this.state.msgCount > 0 ? <View style={{
                    backgroundColor: '#f90e0e', paddingTop: scaleSize(2), paddingBottom: scaleSize(2),
                    paddingLeft: scaleSize(5), paddingRight: scaleSize(10),
                    borderRadius: scaleSize(20), position: 'absolute', top: 5, left: 100, zIndex: 15,
                  }}>
                    <Text style={{ color: '#fff', fontSize: scaleSize(20) }}> {this.state.msgCount > 99 ? '99+' : this.state.msgCount}</Text>
                  </View> : null
                }

              </TouchableOpacity>

              {/* <TouchableOpacity
                onPress={() => { this.goWeb('MailList', 'app') }}
                style={styles.userMeun}>
                <View style={styles.userMeunItem}>

                  <Image style={styles.userMeunIcon} source={require('../../assets/myIndex/usIcon04.png')} />
                  <Text style={styles.userMeunFont}>通讯录</Text>
                </View>

                <View>
                  <SvgUri style={styles.rightIcon} svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.moree}" fill="#C5C5C5"></path></svg>`} />
                </View>
              </TouchableOpacity> */}

            </View>

            {/* 安全中心，意见反馈 --- 菜单 */}
            <View style={styles.menuCon02}>

              <TouchableOpacity
                onPress={() => { this.goWeb('/pages/me/securityCenter/index') }}
                style={styles.userMeun}>
                <View style={styles.userMeunItem}>

                  <Image style={styles.userMeunIcon} source={require('../../assets/myIndex/usIcon01.png')} />
                  <Text style={styles.userMeunFont}>安全中心</Text>
                </View>

                <View>
                  <SvgUri style={styles.rightIcon} svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.moree}" fill="#C5C5C5"></path></svg>`} />
                </View>
              </TouchableOpacity>
              {/* 
              <TouchableOpacity

                onPress={() => { this.goWeb('/pages/me/suggestions/index') }}
                style={styles.userMeun}>
                <View style={styles.userMeunItem}>
                  <Image style={styles.userMeunIcon} source={require('../../assets/myIndex/usIcon08.png')} />
                  <Text style={styles.userMeunFont}>意见反馈</Text>
                </View>

                <View>
                  <SvgUri style={styles.rightIcon} svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.moree}" fill="#C5C5C5"></path></svg>`} />
                </View>
              </TouchableOpacity> */}

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

                  <Image style={styles.userMeunIcon} source={require('../../assets/myIndex/usIcon02.png')} />
                  <Text style={styles.userMeunFont}>关于版本</Text>
                </View>

                <View>
                  <SvgUri style={styles.rightIcon} svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.moree}" fill="#C5C5C5"></path></svg>`} />
                </View>
              </TouchableOpacity>

            </View>

          </View>
          <TouchableOpacity
            style={styles.outlogin}
            onPress={() => { this.outLogin() }}
          >
            <Text style={styles.outloginft}>退出登录</Text>
          </TouchableOpacity>

          <View style={{ marginTop: scaleSize(100) }}><Text style={{ color: "#999" }}>{this.state.version}</Text></View>

        </View>

        {/* 积分商城，我的积分，奖励分申请 */}
        {/* <View style={styles.topBanner}>

          <TouchableOpacity
            style={styles.bannerItem}
            activeOpacity={1}
            onPress={() => this._jumpPage('MyIndex')}>

            <View>

              <Image style={styles.userMeunIcon02} source={require('../../assets/myIndex/usIcon06.png')} />
            </View>

            <View style={{ marginLeft: scaleSize(20) }}>
              <Text style={styles.bannerTitle}>
                我的积分
              </Text>

              <Text style={{ color: '#999' }}>
                100
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bannerItem}
            activeOpacity={1}
            onPress={() => this.goWeb('/pages/me/myNews/index')}>

            <View>

              <Image style={styles.userMeunIcon02} source={require('../../assets/myIndex/usIcon05.png')} />
            </View>

            <View style={{ marginLeft: scaleSize(20) }}>
              <Text style={styles.bannerTitle}>
                我的消息
              </Text>

              <Text style={{ color: '#999' }}>
                {this.state.msgCount}
              </Text>
            </View>
          </TouchableOpacity>

        </View> */}

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

  bannerTitle: {
    // fontSize: scaleSize(30),
    color: '#333',
    fontWeight: 'bold'
  },

  menuCon: {
    backgroundColor: '#fff', width: '100%',
    // marginTop: scaleSize(50),
    borderRadius: scaleSize(20),
  },


  menuCon02: {
    backgroundColor: '#fff', width: '100%', marginTop: scaleSize(20),
    borderRadius: scaleSize(20),
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
    width: scaleSize(42),
    height: scaleSize(42)
  },

  userMeunIcon02: {
    width: scaleSize(60),
    height: scaleSize(60)
  },

  txPostion: {
    position: 'absolute',
    zIndex: 110,
    top: 10,
    right: 10
  },

  xiaoxiCont: {
    backgroundColor: '#f90e0e',
    paddingTop: scaleSize(2),
    paddingBottom: scaleSize(2),
    paddingLeft: scaleSize(10),
    paddingRight: scaleSize(10),
    marginRight: scaleSize(10),
    borderRadius: scaleSize(20)
  },


  userMeunFont: { color: '#333', fontSize: scaleSize(32), marginLeft: scaleSize(10) },

  topBanner: {
    flexDirection: 'row',
    borderRadius: scaleSize(15),
    position: 'absolute',
    top: scaleSize(410),
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: scaleSize(30),
    paddingRight: scaleSize(30),
    width: '100%',

    // borderColor: '#EDEDED',
    // borderWidth: 1,
    // padding: scaleSize(40),
    // elevation: 10, //阴影边框属性
  },

  bannerItem: {
    padding: scaleSize(25),
    flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', width: '48%', backgroundColor: '#fff',
    borderRadius: scaleSize(20)
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
    width: '100%',
    height: scaleSize(420),
  },

  iconImg: {
    height: scaleSize(100), width: scaleSize(100),
    borderRadius: scaleSize(120),
    borderColor: '#fff',
    borderWidth: 1
  },
  userTop: {
    paddingTop: scaleSize(100),
    justifyContent: 'center',
    alignItems: 'center',

  },


});
