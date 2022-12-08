import React , { Component } from "react";
import { deviceWidth, deviceHeight, scaleSize } from '../../../tools/adaptation';
import styCom from '../../../styles/index'
import { toastShort } from '../../../tools/toastUtil';
import {
    Image, View, StyleSheet, BackHandler,
    Button, Alert, Text, FlatList, TextInput,
    Platform, NativeModules, StatusBar, ScrollView, TouchableOpacity, DeviceEventEmitter, PermissionsAndroid , ImageBackground
} from 'react-native';
import { HttpGet } from "../../../request/index";
import { storageDeleteItem } from "../../../storage/index";
import { CommonActions } from '@react-navigation/native';
import { storageSet, storageGet } from '../../../storage/index'
let n, self, backNum = 0;
export default class Mine extends Component{
    constructor(props){
        super(props);
        this.state = {
          userInfo: {},
        }
    }

    goToPage(page){
        const { navigation } = this.props;
        navigation.navigate(page)
    }

    goWeb(PageName, type) {
        // const h5LocalUrl = `http://10.8.26.79:8080/grassrootsH5/index.html#/pages/auth/index`
        //跳转到H5的界面或者RN原生界面
        if (type != 'app') {
          //参数加密
          let h5Url = global.H5Url + "?url=" + PageName;
        //   let h5Url = h5LocalUrl + "?url=" + PageName;
          console.log('H5界面：' + h5Url)
    
          self.props.navigation.navigate('Web', {
            outCode: 'h5',
            h5Url: h5Url
          })
    
        } else {
          global.navigation.navigate(PageName);
        }
    }
    componentDidMount(){
      this.getUserInfo();
      this.unsubscribe = this.props.navigation.addListener('tabPress', e => {
        this.getUserInfo();
    });
    }
    getUserInfo(){
      storageGet("curUserInfo").then( res => {
        console.log("res" , res);
        const { value: { info = {} } } = res;
        this.setState({
          userInfo: info,
        })  
      })
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
                    console.log('退出成功')
                  } else {
                    toastShort('退出登录异常', 'bottom');
                  }
    
                }).catch((error) => {
                  toastShort(error, 'bottom');//超时会在这里
                })
    
    
                global.requestHeadAuthorization = "";
                storageDeleteItem("requestHeadAuthorization");
                //设置路由返回第一个界面
                global.navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'GMTLogin' },],
                  })
                );
    
              },
            },
          ],
          { cancelable: false },
        );
    
      }

    render(){
        const { userInfo = {} } = this.state; 
        const { fullName , phone } = userInfo;
        n = this.props.navigation;
        self = this;
        return <View style={ styles.container }>
            <View style={[ styCom.Flex , styles.header ]}>
                <View style={[{ paddingHorizontal: scaleSize(25) , width: '100%' } , styCom.FlexBetween ]}>
                    <View style={[ styCom.FlexStartCenter ]}>
                        <View style={[ styles.head , { marginRight: scaleSize(20) }]}>
                            <Image source={require('../../../assets/gmt/head_icon.png')} style={{width: '100%' , height: '100%'}}></Image>
                        </View>
                        <View style={[ styCom.Flex , styCom.Column ]}>
                            <View style={[ styCom.FlexStartCenter , {  marginBottom: scaleSize(5) }]}>
                                <Text style={[ styles.headText , { marginRight: scaleSize(15)} ]}>{fullName}</Text>
                                <View style={[ styCom.FlexCenterCenter , { paddingHorizontal: scaleSize(20) , paddingVertical: scaleSize(0) , borderRadius: scaleSize(20), backgroundColor: '#FFFFFF' } ]}>
                                    <Text style={[ { color: '#108bf4' , fontSize: scaleSize(20) } ]}>光明区</Text>
                                </View>
                            </View>
                            <Text style={[ styles.headText , { fontSize: scaleSize(22) } ]}>{phone}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={()=>{ this.goWeb("/pages/me/components/accountInfo")}} style={[ styles.icon , { backgroundColor: "#FFFFFFF" }] }>
                        <Image source={require('../../../assets/gmt/setting_icon.png')} style={{width: '100%' , height: '100%'}}></Image>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[ styCom.Flex , styCom.FlexWrap ]}>
                <TouchableOpacity onPress={()=>{ this.goWeb("/pages/me/components/bind")}} style={[styCom.FlexStartCenter , styCom.Column , { width: deviceWidth/4 - scaleSize(15) , marginRight: scaleSize(5), paddingHorizontal: scaleSize(20) , paddingVertical: scaleSize(25) , backgroundColor: "#FFFFFF" }]}>
                    <View style={[ styles.icon , { marginBottom: scaleSize(25) , backgroundColor: '#ff7843' }]}>
                        <Image source={require('../../../assets/gmt/zw_icon.png')} style={{width: '100%' , height: '100%'}}></Image>
                    </View>
                    <Text>生物识别</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>{ this.goWeb("/pages/me/components/modify")}} style={[styCom.FlexStartCenter , styCom.Column , { width: deviceWidth/4 - scaleSize(15) , marginRight: scaleSize(5), paddingHorizontal: scaleSize(20) , paddingVertical: scaleSize(25) , backgroundColor: "#FFFFFF" }]}>
                    <View style={[ styles.icon , { marginBottom: scaleSize(25) , backgroundColor: '#369eeb' }]}>
                        <Image source={require('../../../assets/gmt/password_edit.png')} style={{width: '100%' , height: '100%'}}></Image>
                    </View>
                    <Text>修改密码</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>{ this.outLogin() }} style={[styCom.FlexStartCenter , styCom.Column , { width: '25%' , paddingHorizontal: scaleSize(20) , paddingVertical: scaleSize(25) , backgroundColor: "#FFFFFF" }]}>
                    <View style={[ styles.icon , { marginBottom: scaleSize(25) , backgroundColor: '#369eeb' , borderRadius: scaleSize(50) }]}>
                        <Image source={require('../../../assets/gmt/exit_icon.png')} style={{width: '100%' , height: '100%'}}></Image>
                    </View>
                    <Text>退出</Text>
                </TouchableOpacity>
            </View>
        </View>
    }
}
const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        display: 'flex',
    },
    header: {
        width: "100%",
        height: scaleSize(220),
        backgroundColor: '#108bf4',
    },  
    head:{
        width: scaleSize(100),
        height: scaleSize(100),
        paddingHorizontal: scaleSize(15),
        paddingVertical: scaleSize(15),
        borderRadius: scaleSize(45),
        backgroundColor: '#FFFFFF',  
    },
    headText: {
        fontSize: scaleSize(25),
        color: '#FFFFFF',
    },
    icon: {
        width: scaleSize(60),
        height: scaleSize(60),
        backgroundColor: 'transparent',
        borderRadius: 3,
        paddingHorizontal: scaleSize(8),
        paddingVertical: scaleSize(8),
    }
});