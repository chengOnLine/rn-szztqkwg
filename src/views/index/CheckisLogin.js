import React, { Component } from 'react';
import {
  StyleSheet,
  ToastAndroid,
  BackHandler,
  Button,
  View,
  Text,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';

import { HttpGet, HttpPost } from '../../request/index'
import { scaleSize } from '../../tools/adaptation';
import { storageGet, storageSet } from '../../storage/index'
import { toastShort } from '../../tools/toastUtil';

export default class Checkislogin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title: 'AAA',
    };
  }

  componentDidMount() {
    global.navigation = this.props.navigation;

    this.getversion();

  }

  //检测是否已经登录
  checkUserIsLogin() {

    //判断token是否过期，返回登录界面
    this.timer = setInterval(() => {

      SplashScreen.hide();//关闭启动屏幕
      this.timer && clearInterval(this.timer);

      storageGet("requestHeadAuthorization").then(res => {

        try {
          let token = res.value;
          if (token) {
            global.requestHeadAuthorization = token;

            //设置路由返回第一个界面
            global.navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  { name: 'TabIndex' },
                ],
              })
            );

            // global.navigation.navigate('HomePage');

          } else {
            this.rLogin()
          }
        } catch (error) {
          this.rLogin()
        }
      });
    }, 500);
  }

  rLogin() {

    SplashScreen.hide();//关闭启动屏幕
    toastShort('会话已过期，请您重新登录！', 'bottom');

    //设置路由返回第一个界面
    global.navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          { name: 'GMTLogin' },
        ],
      })
    );
  }

  //检测版本
  getversion() {

    console.log('----------系统当前配置信息--------------------');

    HttpGet('qkwg-system/sysConfig/getSystemCurrConfig', null).then((res) => {

      if (res.flag) {

        if (res.data == null) {
          return false;
        }

        let { bk, ak, ck, configKey, configValue } = res.data;

        global.rsaKey = bk;
        // global.rsaDecKey = operatePri;

        // _this.setState({
        //     versioninfo:{
        //         versionNum,updateContent,createTime,apkName,
        //         isForce:isForce!=undefined||isForce!=null?isForce:false,
        //     }
        // })
        
        this.checkUserIsLogin();

        //检测到版本变化提示下载
        // let serNumber = "2.0.33";
        // if (global.version.curNumber != serNumber) {
        //   this.rLogin()
        // } else {
        //   this.checkUserIsLogin();
        // }

      } else {
        toastShort(res.msg, 'bottom');
      }

    }).catch((error) => {
      // console.log(error);
      toastShort(error, 'bottom');//超时会在这里
    })

  }

  goHome() {
    this.props.navigation.navigate('HomePage', { paramsId: 2222 });
  }

  goLogin() {
    // this.props.navigation.navigate('Login', { paramsId: 2222 });
  }

  render() {

    return (

      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', }}>

        {/* <Button
          title="Go Home"
          style={{
            fontSize: scaleSize(92),
          }}
          onPress={() => {
            this.goHome();
          }}
        />

        <Button
          title="goLogin"
          style={{
            fontSize: scaleSize(92),
          }}
          onPress={() => {
            this.goLogin();
          }}
        /> */}

      </View>

    );
  }
}
