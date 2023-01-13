import React, { Component } from 'react';

import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  BackHandler,
  DeviceEventEmitter,
  Alert, NativeModules,
  ScrollView
} from 'react-native';


import { deviceWidth, deviceHeight, scaleSize } from '../../tools/adaptation';
import L_Input from '../../components/Index/L_Input';
import BiometricPopup from '../../components/Index/BiometricPopup'
import styCom from '../../styles/index'
import { HttpGet, HttpPost } from '../../request/index'
import * as jsencrypt from '../../tools/jsencrypt';
import { toastShort } from '../../tools/toastUtil';
import { storageSet, storageGet, storageDeleteItem } from '../../storage/index'

let n, self;

export default class Index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isShowIp: false,
      isHandCode: false,
      isRetHandCode: false,

      codeTxt: '获取验证码',

      logoIconUrl: '',
      verifyCodeImg: '',

      loginType: 1, //登录类型：1内部人员，2群众登录
    };
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
    }

    // this.listener.remove();
  }

  componentDidMount() {

    this.getLogoIcon();
    this.getVerifyCodeImg();

    // this.userInput.state.value = 'admin'
    // this.pwdInput.state.value = 'AAaa##123456';

    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
    }

    //收到监听
    this.listener = DeviceEventEmitter.addListener('FingerSettings', () => {
      if (global.routeName === 'Login') {
        //指纹认证成功
        self.setState({ isRetHandCode: true });
        self._login();
      }
    })

    this._getLoginCache();
  }

  onBackAndroid = () => {

    if (global.routeName === 'Login') {
      Alert.alert(
        '退出提示',
        '是否要退出治理通APP？',
        [
          {
            text: '取消',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {
            text: '确定',
            onPress: () => {
              NativeModules.AMapLocationModule.exitApp();
              // BackHandler.exitApp();
            },
          },
        ],
        { cancelable: false },
      );
      return true;
    }
  };

  _login = () => {

    let userInput = '', pwdInput = '', codeInput = '', ucodeInput = '';

    if (this.state.loginType == 1) {
      pwdInput = this.pwdInput.state.value;
      if (global.verifyCodeSwitch) ucodeInput = this.uCodeInput.state.value;
    } else {
      codeInput = this.codeInput.state.value;
    }

    userInput = this.userInput.state.value;

    console.log('userInput: ' + userInput + ", pwdInput: " + pwdInput + " codeInput: " + codeInput);

    if (this.state.loginType == 1) {

      if (userInput == '') {
        toastShort('用户名不能为空', 'bottom');
        return;

      } else if (pwdInput == '') {
        toastShort('密码不能为空', 'bottom');
        return;
      } else if (ucodeInput == '' && global.verifyCodeSwitch) {
        toastShort('验证码不能为空', 'bottom');
        return;
      }

    } else {
      if (userInput == '') {
        toastShort('手机号不能为空', 'bottom');
        return;

      } else if (codeInput == '') {
        toastShort('验证码不能为空', 'bottom');
        return;
      }
    }

    if (this.state.loginType == 1) {
      this.pwdLogin();
    } else {
      this.telLogin();
    }

  }


  pwdLogin() {

    let userInput = this.userInput.state.value;
    let pwdInput = this.pwdInput.state.value;
    let uCodeInput = global.verifyCodeSwitch ? this.uCodeInput.state.value : '';

    //密码RSA加密
    let encrypt = new jsencrypt.JSEncrypt();
    encrypt.setPublicKey(global.rsaKey);
    let encryptRsaPwd = encrypt.encrypt(pwdInput);

    let postParams = {
      grant_type: 'password',
      client_id: 'qkwg',
      client_secret: 'secret',
      source: 0,
      username: userInput,
      password: encryptRsaPwd,
      verify_code: uCodeInput
    };

    HttpPost('qkwg-oauth-server/oauth/token', postParams).then((res) => {

      if (res.flag) {

        global.requestHeadAuthorization = res.data.accessToken != "" ? "Bearer " + res.data.accessToken : null;
        storageSet('requestHeadAuthorization', global.requestHeadAuthorization);

        //登录成功后，获取用户基本信息
        HttpGet('qkwg-system/system/user/getCurrentUser', null).then((res) => {

          if (res.flag) {

            // let { mainKey, user } = res.data;
            // res.data.user = decryptKeyVal(user, mainKey);
            try {

              let { id, fullName, phone, email, picAddress, roleName, sex, userId, cardId } = res.data;

              global.user.info = { id, fullName, phone, email, picAddress, roleName, sex, userId, cardId };

              // global.user.appRoleList = JSON.parse(appRoleList); //首页菜单

              console.log('pwdLogin', '进入跳转界面')
              global.navigation.navigate('TabIndex');

              //保存当前用户登录
              global.user.info.userPwd = pwdInput;
              global.user.info.userName = userInput;
              global.user.info.FingerSettings = self.state.isHandCode;

              storageSet('qkwg_curUserInfo', global.user);

              this.getZLTOldUser();

            } catch (error) { }
          } else {
            toastShort(res.msg, 'bottom');
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

  telLogin() {

    let telval = this.userInput.state.value;
    let code = this.codeInput.state.value;

    //密码RSA加密
    let encrypt = new jsencrypt.JSEncrypt();
    encrypt.setPublicKey(global.rsaKey);
    let encryptRsaTel = encrypt.encrypt(telval);

    let postParams = {
      phone: encryptRsaTel,
      verifyCode: code
    };

    HttpPost('qkwg-oauth-server/oauth/mobileLogin', postParams, 'json').then((res) => {
      if (res.flag) {

        global.requestHeadAuthorization = res.data.accessToken != "" ? "Bearer " + res.data.accessToken : null;
        storageSet('requestHeadAuthorization', global.requestHeadAuthorization);

        //登录成功后，获取用户基本信息
        HttpGet('qkwg-system/system/user/getCurrentUser', null).then((res) => {

          if (res.flag) {

            // let { mainKey, user } = res.data;
            // res.data.user = decryptKeyVal(user, mainKey);

            let { id, fullName, phone, email, picAddress, roleName, sex, userId, cardId } = res.data;

            global.user.info = {
              id, fullName, phone, email, picAddress, roleName, sex, userId, cardId
            };

            // global.user.appRoleList = JSON.parse(appRoleList); //首页菜单

            console.log('pwdLogin', '进入跳转界面')
            global.navigation.navigate('TabIndex');

            storageSet('qkwg_curUserInfo', global.user);

            this.getZLTOldUser();
          } else {
            toastShort(res.msg, 'bottom');
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

  getZLTOldUser() {

    HttpGet('qkwg-system/system/user/getOldUser', null).then((res) => {
      if (res.flag) {
        global.zltUser.oldUser = res.data

        storageSet('zlt_OldUser', global.zltUser.oldUser);
      } else {
        global.zltUser.oldUser = [];
        storageDeleteItem('zlt_OldUser');
      }
    }).catch((error) => {
      toastShort(error, 'bottom');//超时会在这里
    })
  }


  getVerifyCodeImg() {

    HttpGet('qkwg-oauth-server/oauth/getVerifyCodeImg', null).then((res) => {
      if (res.flag) {
        this.setState({ verifyCodeImg: res.data })

      } else {
        toastShort('获取验证码失败', 'bottom');
      }
    }).catch((error) => {
      toastShort(error, 'bottom');//超时会在这里
    })
  }

  getLogoIcon() {
    HttpGet('jczl-system/configure/getQueryConfigure/1', null).then((res) => {

      if (res.flag && res.data.logoImg.length > 0) {
        this.setState({
          logoIconUrl: res.data.logoImg[0].url
        })
      }

    }).catch((error) => {
      toastShort(error, 'bottom');//超时会在这里
    })

  }

  //获取缓存数据
  _getLoginCache() {

    storageGet("qkwg_curUserInfo").then(res => {

      try {
        console.log('_getLoginCache: ' + JSON.stringify(res))
        let data = res.value.info;

        self.userInput.setState({
          value: data.userName
        });

        self.pwdInput.setState({
          value: data.userPwd
        });

        self.setState({
          isHandCode: data.FingerSettings,
        });

      } catch (error) {
      }
    })
  }

  onBiometricPopup = (e) => {
    console.log(JSON.stringify(e))
  }

  sltUserLoginType(type) {
    this.setState({ loginType: type, })

    if (this.userInput.state.value) {

      this.userInput.setState({ value: '' });
      this.pwdInput && this.pwdInput.setState({ value: '' });

    }

    if (type == 1) this._getLoginCache();

  }

  sendTelCode() {
    let time = 60

    let tel = this.userInput.state.value
    if (!tel) {
      toastShort('手机号不能为空', 'bottom');
      return;
    }

    if (this.state.codeTxt != "获取验证码") {
      return
    }

    //密码RSA加密
    let encrypt = new jsencrypt.JSEncrypt();
    encrypt.setPublicKey(global.rsaKey);
    let encryptRsaTel = encrypt.encrypt(tel);

    HttpPost('qkwg-oauth-server/oauth/sendVerifyCode', { phone: encryptRsaTel }, 'json').then(res => {
      if (res.flag) {

        let tirm = setInterval(function () {
          if (time == 0) {
            clearInterval(tirm);

            self.setState({ codeTxt: "获取验证码" })
          } else {
            time--;
            self.setState({ codeTxt: time + " s" })
          }
        }, 1000)
      } else {
        toastShort('发送失败', 'bottom');
      }
    })

  }

  _loginPwd = () => {
    this.props.navigation.navigate('PwdLogin');
  }

  _restPwd = () => {
    this.props.navigation.navigate('RegisterUser', { registerType: 'resPwd' });
  }

  render() {

    n = this.props.navigation;
    self = this;

    let loginIcon = this.state.logoIconUrl != "" ? { uri: this.state.logoIconUrl } : require('../../assets/loginTop.png');

    return (
      // <ImageBackground source={require('../../assets/login_bg.png')} style={styles.backgroundImage}>

      <View style={styles.container}>

        <View style={{ height: scaleSize(150) }}>
          <View style={styles.logo}>
            <Image source={loginIcon} style={{ height: '100%', width: '100%' }} />
          </View>

          {/* <View style={styles.logoBox}>
            <Text style={styles.logoTitle}>治理通登录</Text>
          </View> */}

        </View>

        <View style={[this.state.loginType === 1 && global.verifyCodeSwitch ? styles.inputBox : styles.inputBox02,]}>

          <View style={[styCom.CenterCenter, { marginTop: scaleSize(10), marginBottom: scaleSize(10) }]}>

            <TouchableOpacity onPress={() => { this.sltUserLoginType(1) }}>
              <View><Text style={[styles.slt_logint, this.state.loginType === 1 ? styles.sltText : '']}>密码登录</Text></View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { this.sltUserLoginType(2) }}>
              <View><Text style={[styles.slt_logint, this.state.loginType === 2 ? styles.sltText : '']}>验证码登录</Text></View>
            </TouchableOpacity>

          </View>

          {
            this.state.loginType == 2 ?
              <L_Input type='tel' keyboardType='numeric' maxLength={11} placeholder='请输入手机号' ref={(c) => { this.userInput = c; }} />
              :
              <L_Input type='user' placeholder='请输入用户名' ref={(c) => { this.userInput = c; }} />
          }

          {
            this.state.loginType == 2 ?
              <View>
                <L_Input type='code' keyboardType='numeric' maxLength={6} placeholder='请输入验证码' ref={(c) => { this.codeInput = c; }} />
                <TouchableOpacity onPress={() => { this.sendTelCode() }} style={styles.codeText}>
                  <Text style={{ marginLeft: scaleSize(20), color: '#2589FF' }}>{this.state.codeTxt}</Text>
                </TouchableOpacity>
              </View>
              :
              <L_Input type='pwd' placeholder='请输入密码' ref={(c) => { this.pwdInput = c; }} />
          }

          {
            this.state.loginType == 1 && global.verifyCodeSwitch ?

              <View>

                <L_Input type='code' keyboardType='numeric' maxLength={6} placeholder='验证码' ref={(c) => { this.uCodeInput = c; }} />

                <TouchableOpacity onPress={() => { this.getVerifyCodeImg() }} style={styles.codeImage}>
                  <Image source={{ uri: this.state.verifyCodeImg }} resizeMode="stretch" style={[{ height: scaleSize(50), width: scaleSize(150) }]}></Image>
                </TouchableOpacity>
              </View>
              :
              null
          }

          <TouchableOpacity
            style={styles.btnLogin}
            activeOpacity={0.8}
            onPress={this._login}
          >
            <Text style={{ color: '#fff' }}>登录</Text>
          </TouchableOpacity>

        </View>

        {this.state.isHandCode ? <BiometricPopup onAuthenticate={this.onBiometricPopup}></BiometricPopup> : null}

      </View>

      // </ImageBackground>
    );
  }
}



const styles = StyleSheet.create({
  container: {
    width: deviceWidth,
    height: deviceHeight,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#1d7ef4'
  },

  codeText: {
    position: 'absolute',
    right: 25,
    top: 10,
    borderLeftColor: '#ccc',
    borderLeftWidth: 1
  },


  codeImage: {
    position: 'absolute',
    right: 25,
    top: 10,
  },

  logo: {
    position: 'absolute', right: 0, left: 0, top: -160, bottom: 0,
    justifyContent: 'center', flexDirection: 'row',

  },


  logoBox: {
    position: 'absolute', right: 0, left: 0, top: '100%', justifyContent: 'center', flexDirection: 'row',
  },

  logoTitle: {
    fontSize: 20, color: '#fff', marginTop: scaleSize(20)
  },
  inputBox: {

    height: scaleSize(680),
    marginTop: scaleSize(70),
    borderRadius: scaleSize(20),
    marginLeft: scaleSize(30),
    marginRight: scaleSize(30),
    backgroundColor: '#fff'
  },

  inputBox02: {

    height: scaleSize(600),
    marginTop: scaleSize(70),
    borderRadius: scaleSize(20),
    marginLeft: scaleSize(30),
    marginRight: scaleSize(30),
    backgroundColor: '#fff'
  },

  slt_logint: {
    // width: scaleSize(190),
    marginRight: scaleSize(40),
    marginLeft: scaleSize(40),
    fontSize: scaleSize(30),
    color: '#000',
    lineHeight: scaleSize(90),
    textAlign: 'center'
  },

  sltText: {
    color: '#2589FF',
    // borderBottomColor: '#2589FF',
    // borderBottomWidth: 1
  },

  textColor: {
    color: '#000',
  },
  thirdView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: scaleSize(60),
    marginRight: scaleSize(60),
    marginBottom: scaleSize(30),
  },
  lastView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  btnLogin: {
    marginLeft: scaleSize(50),
    marginRight: scaleSize(60),
    marginBottom: scaleSize(20),
    marginTop: scaleSize(20),
    borderRadius: scaleSize(120),
    borderColor: '#2589FF',
    backgroundColor: '#2589FF',
    alignItems: 'center',
    justifyContent: 'center',
    height: scaleSize(80),
  },
  backgroundImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: null,
    width: null,
    //不加这句，就是按照屏幕高度自适应
    //加上这几，就是按照屏幕自适应
    //resizeMode:Image.resizeMode.contain,
    //祛除内部元素的白色背景
    backgroundColor: 'rgba(0,0,0,0)',
  },

  container_Ipt: {
    flexDirection: 'row',
    width: deviceWidth - scaleSize(110),
    marginLeft: scaleSize(50),
    marginRight: scaleSize(50),
    height: scaleSize(100),
    borderWidth: scaleSize(1),
    borderRadius: scaleSize(5),
    borderColor: '#a94442',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  textInput_Ipt: {
    width: deviceWidth - scaleSize(260),
    alignSelf: 'stretch',
    marginBottom: scaleSize(5),
    padding: scaleSize(0.5),
    color: '#666',
  },
});