import React , { Component } from "react";
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
  
  
  import { deviceWidth, deviceHeight, scaleSize } from '../../../tools/adaptation';
  import L_Input from '../../../components/Index/L_Input';
  // import BiometricPopup from '../../../components/Index/BiometricPopup'
  import styCom from '../../../styles/index'
  import { storageSet, storageGet } from '../../../storage/index'
  import { HttpGet, HttpPost } from '../../../request/index'
  import * as jsencrypt from '../../../tools/jsencrypt';
  import { toastShort } from '../../../tools/toastUtil';
  import { storageDeleteItem } from "../../../storage/index";
export default class GMTLogin extends Component{
    constructor(props){
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

        // this.getLogoIcon();
    
        // this.userInput.state.value = '光明通管理员'
        // this.pwdInput.state.value = 'AAaa##123456';
        console.log("this.userInput" ,this.userInput.state.value )
        if (Platform.OS === 'android') {
          BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
        }
    
        //收到监听
        this.listener = DeviceEventEmitter.addListener('FingerSettings', () => {
          if (global.routeName === 'GMTLogin') {
            //指纹认证成功
            this.setState({ isRetHandCode: true });
            this._login();
          }
        })
    
        this._getLoginCache();
      }
    
      componentWillUnmount() {
    
      }
    
      onBackAndroid = () => {
    
        if (global.routeName === 'GMTLogin') {
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
        const { navigation } = this.props;
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
        console.log("rsaKey" , global.rsaKey);
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
        global.requestHeadAuthorization = "";
        storageDeleteItem("requestHeadAuthorization");
        HttpPost('qkwg-oauth-server/oauth/token', postParams).then((res) => {
          if (res.flag) {
    
            global.requestHeadAuthorization = res.data.accessToken != "" ? "Bearer " + res.data.accessToken : null;
            storageSet('requestHeadAuthorization', global.requestHeadAuthorization);
    
            // 登录成功后，获取用户基本信息
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
                global.user.info.FingerSettings = this.state.isHandCode;
    
                storageSet('curUserInfo', global.user);
    
                // if (!this.state.isHandCode) {
                //   console.log("FingerSettings" , this.state.isHandCode)
                //   //设置指纹登录
                //   navigation.navigate('FingerSettings');
                // } else {
                //   console.log("TabIndex" , this.state.isHandCode)
                //   navigation.navigate('TabIndex');
                // }
                navigation.navigate('TabIndex');
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
    
    // getLogoIcon() {
    //     HttpGet('qkwg-system/configure/getQueryConfigure/1', null).then((res) => {
    
    //       if (res.flag && res.data.logoImg.length > 0) {
    //         this.setState({
    //           logoIconUrl: res.data.logoImg[0].url
    //         })
    //       }
    
    //     }).catch((error) => {
    //       toastShort(error, 'bottom');//超时会在这里
    //     })
    
    // }
    
    //获取缓存数据
    _getLoginCache() {
        storageGet("curUserInfo").then(res => {
            try {
            console.log('_getLoginCache: ' + JSON.stringify(res))
            let data = res.value.info;

            this.userInput.setState({
                value: data.userName
            });

            this.pwdInput.setState({
                value: data.userPwd
            });

            this.setState({
                isHandCode: data.FingerSettings
            });

            } catch (error) {
            }
        })
    }
    
    onBiometricPopup = (e) => {
        console.log(JSON.stringify(e))
    }
    render(){
        return (
            <View style={[ styles.container ]}>
                {/* <StatusBar
                    animated={false} //指定状态栏的变化是否应以动画形式呈现。 
                    translucent={this.state.StatusBarTranslucent}//指定状态栏是否透明。设置为true时:transparent
                    backgroundColor={this.state.StatusBarBgColor} //状态栏的背景色
                    barStyle={this.state.StatusBarFtColor} // 字体样式 enum('default', 'light-content', 'dark-content')  
                /> */}
 
                <View style={{ width: '100%' ,  height: scaleSize(420)  }}>
                    <ImageBackground style={{ flex: 1 , position: 'relative' }}
                    source={require('../../../assets/myIndex/topbg.png')}>
                        <View style={[ { width:'100%' , position:'absolute' , bottom: scaleSize(-90) , zIndex: 10 } , styCom.FlexCenterCenter ]}>
                            <View style={[{ width: scaleSize(200) , height: scaleSize(200) , backgroundColor: "#008de0" , borderRadius: scaleSize(100) },styCom.FlexCenterColumn]}>
                                <Image source={require('../../../assets/gmt/logo.png')}></Image>
                              {/* <ImageBackground style={{ flex: 1 , position: 'relative' }} source={require('../../../assets/gmt/logo.png')}>
                                <Text style={[{ color: "#FFFFFF" , fontSize: scaleSize(50) , fontWeight: '600' }]}>光明通</Text>
                                <Text style={[{ color: "#FFFFFF" , fontSize: scaleSize(25) , fontWeight: '400' }]}>guangmingtong</Text>
                              </ImageBackground> */}
                            </View>
                        </View>
                    </ImageBackground>
                </View>
                <View style={[{ flex: 1 , paddingTop: scaleSize(150) } ]}>
                    <View style={{ marginTop: scaleSize(50) }}>
                        {/* <L_Input type='tel' placeholder='请输入手机号' ref={(c) => { this.telInput = c; }} />
                        <L_Input type='code' placeholder='请输入验证码' ref={(c) => { this.userInput = c; }} /> */}
                        {/* <L_Input type='pwd' placeholder='请输入密码' ref={(c) => { this.pwdInput = c; }} /> */}

                        <L_Input type='user' placeholder='请输入用户名' ref={(c) => { this.userInput = c; }} />
                        <L_Input type='pwd' placeholder='请输入密码' ref={(c) => { this.pwdInput = c; }} />
                    </View>
                    <TouchableOpacity
                        style={styles.btnLogin}
                        activeOpacity={0.8}
                        onPress={this._login}
                    >
                        <Text style={{ color: '#fff' }}>登录</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        display: 'flex',
        backgroundColor: '#FFFFFF'
    },
    card:{
        width: "100%",
        position: 'absolute',
        zIndex: 10,
        bottom: scaleSize(-70),
        backgroundColor: '#FFF',
        borderRadius: 5,
        paddingVertical: scaleSize(25),
        paddingHorizontal: scaleSize(60),
    },  
    listItem: {
        width: '100%',
        backgroundColor: '#FFF',
        marginBottom: scaleSize(25),
        paddingHorizontal: scaleSize(15),
        paddingVertical: scaleSize(25),
    },
    icon: {
        width: scaleSize(60),
        height: scaleSize(60),
        backgroundColor: 'transparent',
        borderRadius: 3,
        paddingHorizontal: scaleSize(8),
        paddingVertical: scaleSize(8),
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
});
