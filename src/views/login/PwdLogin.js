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
  Alert, NativeModules
} from 'react-native';


import { deviceWidth, deviceHeight, scaleSize } from '../../tools/adaptation';
import L_Input from '../../components/Index/L_Input';
// import BiometricPopup from '../../components/Index/BiometricPopup'
import styCom from '../../styles/index'
import { storageSet, storageGet } from '../../storage/index'
import { HttpGet, HttpPost } from '../../request/index'
import * as jsencrypt from '../../tools/jsencrypt';
import { toastShort } from '../../tools/toastUtil';

let n, self;

export default class PwdLogin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isShowIp: false,
      isHandCode: false,

      isHandCode: false,
      isRetHandCode: false,

      logoIconUrl: '',
    };
  }


  componentDidMount() {

    this.getLogoIcon();

    this.userInput.state.value = 'admin'
    this.pwdInput.state.value = 'AAaa##123456';

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

  componentWillUnmount() {

  }

  onBackAndroid = () => {

    if (global.routeName === 'Login') {
      Alert.alert(
        '退出提示',
        '是否要退出光明通APP？',
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


  _login = () => {

    let userInput = '', pwdInput = '', codeInput = '';

    pwdInput = this.pwdInput.state.value;
    userInput = this.userInput.state.value;

    console.log('userInput: ' + userInput + ", pwdInput: " + pwdInput + " codeInput: " + codeInput);


    if (userInput == '') {
      toastShort('用户名不能为空', 'bottom');
      return;

    } else if (pwdInput == '') {
      toastShort('密码不能为空', 'bottom');
      return;
    }


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
      password: encryptRsaPwd
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

            let { id, fullName, phone, email, picAddress, roleName, sex, userId, cardId } = res.data;

            global.user.info = {
              id, fullName, phone, email, picAddress, roleName, sex, userId, cardId
            };

            // global.user.appRoleList = JSON.parse(appRoleList); //首页菜单

            //保存当前用户登录
            global.user.info.userPwd = pwdInput;
            global.user.info.userName = userInput;
            global.user.info.FingerSettings = self.state.isHandCode;

            storageSet('curUserInfo', global.user);

            if (!self.state.isHandCode) {
              //设置指纹登录
              n.navigate('FingerSettings');
            } else {
              n.navigate('TabIndex');
            }
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

  getLogoIcon() {
    HttpGet('qkwg-system/configure/getQueryConfigure/1', null).then((res) => {

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

    storageGet("curUserInfo").then(res => {

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
          isHandCode: data.FingerSettings
        });

      } catch (error) {
      }
    })
  }

  onBiometricPopup = (e) => {
    console.log(JSON.stringify(e))
  }



  registerUser(type) {

    // this.props.navigation.navigate('RegisterUser', { registerType: type });
  }

  render() {
    n = this.props.navigation;
    self = this;

    let loginIcon = this.state.logoIconUrl != "" ? { uri: this.state.logoIconUrl } : require('../../assets/loginIcon.png');
    // let loginIcon = require('../../assets/loginIcon.png');

    return (

      <ImageBackground source={require('../../assets/login_bg.png')} style={styles.backgroundImage}>

        <View style={styles.container}>

          <View style={{ height: '30%' }}>
            <View style={styles.logo}>
              <Image source={loginIcon} style={{ width: scaleSize(450), height: scaleSize(250), }} />
            </View>
          </View>

          <View style={{ height: '70%' }}>

            <View style={styCom.CenterCenter}>
              <Text style={styles.logoTitle}>密码登录</Text>
            </View>

            <View style={{ marginTop: scaleSize(50) }}>
              <L_Input type='user' placeholder='请输入用户名' ref={(c) => { this.userInput = c; }} />
              <L_Input type='pwd' placeholder='请输入密码' ref={(c) => { this.pwdInput = c; }} />
            </View>


            <View style={styles.thirdView}>
              <View style={styles.lastView}>
                <TouchableOpacity
                  onPress={() => { this.registerUser('regUser') }}
                >
                  <Text style={{ color: '#666' }}>注册用户</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => { this.registerUser('restPwd') }}
              >
                <Text style={{ color: '#666' }}>忘记密码？</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.btnLogin}
              activeOpacity={0.8}
              onPress={this._login}
            >
              <Text style={{ color: '#fff' }}>登录</Text>
            </TouchableOpacity>

          </View>

          {/* {this.state.isHandCode ? <BiometricPopup onAuthenticate={this.onBiometricPopup}></BiometricPopup> : null} */}
        </View>
      </ImageBackground>


    );
  }
}



const styles = StyleSheet.create({
  container: {
    width: deviceWidth,
    height: deviceHeight,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch'
  },
  logo: {
    position: 'absolute', right: 0, left: 0, top: 20, bottom: 0,
    justifyContent: 'center', flexDirection: 'row',

  },

  logoTitle: {
    fontSize: 20, fontWeight: 'bold', color: '#000'
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
    borderBottomColor: '#2589FF',
    borderBottomWidth: 2
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
    marginBottom: scaleSize(50),
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