import React , { Component , createRef } from "react";
import { deviceWidth, deviceHeight, scaleSize } from '../../../tools/adaptation';
import styCom from '../../../styles/index'
import { toastShort } from '../../../tools/toastUtil';
import { HttpGet, HttpPost } from '../../../request/index'
import {
    Image, View, StyleSheet, BackHandler,
    Button, Alert, Text, FlatList, TextInput,Modal,
    Platform, NativeModules, StatusBar, ScrollView, TouchableOpacity, DeviceEventEmitter, PermissionsAndroid , ImageBackground, RefreshControl,
} from 'react-native';
import {WebView} from 'react-native-webview';
import { getLocation , getLocation2 , getLocation3 , getLocationInfo  } from "../../../tools/AmapLocation";
import Header from "../../../components/gmt/header";
const patchPostMessageJsCode = `(function() {
    window.postMessage = function(data) {
        window.ReactNativeWebView.postMessage(data)
    } })();`
export default class Inspection extends Component{
    constructor(props){
        super(props);
        this.state = {  
            h5Url: `${global.H5Url}?url=/pages/rounds/index`,
        }
    }

    componentDidMount(){
        this.unsubscribe = this.props.navigation.addListener('tabPress', e => {
            console.log('tabPress' , this.webView);
            this.setState({
                h5Url: undefined,
            })

            setTimeout(() => {
                this.setState({
                    h5Url: `${global.H5Url}?url=/pages/rounds/index`
                })
            })
            
            // this.setState({
            //     h5Url: this.state.h5Url + "&num=" + Math.random(),
            // })
        });
    }
    componentWillUnmount() {
        this.unsubscribe();
    }

    onNavigationStateChange = navState => {
        this.setState({
            backButtonEnabled: navState.canGoBack
        });
    };

    saveImg(img) {
        // let promise = CameraRoll.saveToCameraRoll(img);
        // promise.then(function(result) {
        //     //toastShort('图片保存成功！','bottom')
        // }).catch(function(error) {
        //     //alert('图片保存失败！\n' + error);
        // });
    }

    handleMessage = async (evt) => {
        const { navigation } = this.props;
        try {
            const message = evt.nativeEvent.data
            console.log("message",message);
            let jsonObj = JSON.parse(message);
            let resultObj = {};
            if (jsonObj.action == 'getLocation') {//定位功能
                getLocationInfo().then((res) => {
                    const { code , data = {} , error } = res;
                    if (code == 0) {
                        const { address , coords = {} } = data;
                        this.postMessageToH5(jsonObj, { code: 0 , address , ...coords });
                    } else {
                        this.postMessageToH5(jsonObj, { code: 1 , error });
                    }
                }).catch((error) => {
                    this.postMessageToH5(jsonObj, { code: 1 , error });
                })   
            } else if (jsonObj.action == 'getScan') {//扫码
                this.setState({
                    scanShow: true
                })
                messageObj = jsonObj;
            } else if (jsonObj.action == 'getCamera') {//相机功能
                SYImagePicker.asyncShowImagePicker({
                    imageCount: jsonObj.params.multiple ? 9 : 1,
                    enableBase64: true,
                    isCrop: false
                })
                    .then(photos => {
                        console.log(photos);
                        const image = photos.map(v => {
                            return {
                                data: v.base64,
                                path: v.uri,
                            }
                        });
                        resultObj = {
                            code: 0,
                            message: '获取相机功能成功',
                            info: image
                        }
                        this.postMessageToH5(jsonObj, resultObj);
                    })
                    .catch(err => {
                        resultObj = {
                            code: 1,
                            message: '获取相机功能失败'
                        }
                        this.postMessageToH5(jsonObj, resultObj);
                    })
            } else if (jsonObj.action == 'getPhotograph') {//拍照功能
                SYImagePicker.openCamera({ isCrop: false, showCropCircle: true, showCropFrame: false, enableBase64: true }, (err, photos) => {
                    console.log(err, photos);
                    if (!err) {

                        // console.log(image);
                        if (Array.isArray(photos)) {
                            this.saveImg(photos[0].uri);
                        } else {
                            this.saveImg(photos.uri);
                        }

                        const image = photos.map(v => {
                            return {
                                data: v.base64,
                                path: v.uri,
                            }
                        });
                        resultObj = {
                            code: 0,
                            message: '获取拍照功能成功',
                            info: image
                        }
                        this.postMessageToH5(jsonObj, resultObj);

                    } else {
                        resultObj = {
                            code: 1,
                            message: '获取拍照功能失败'
                        }
                        this.postMessageToH5(jsonObj, resultObj);
                    }
                })
            } else if (jsonObj.action == 'getSystemInfo') {//系统信息
                debugger
                // let brand = DeviceInfo.getBrand();
                // let uniqueID = DeviceInfo.getUniqueID();
                let os = Platform.OS;
                // let systemVersion = DeviceInfo.getSystemVersion();

                resultObj = {
                    os
                }

                this.postMessageToH5(jsonObj, resultObj);
            } else if (jsonObj.action == 'getToken') {//获取内部登录Token
                let token = global.requestHeadAuthorization.replace('Bearer ', '');
                resultObj = { token }

                this.postMessageToH5(jsonObj, resultObj);
            } else if (jsonObj.action == 'getVersion') {//获取内部登录Token
                let curVerNumber = global.version.curNumber;
                resultObj = { curVerNumber }

                this.postMessageToH5(jsonObj, resultObj);
            } else if (jsonObj.action == 'navToPage') {//跳转RN界面
                let nvoTo = jsonObj.params.page;

                if (nvoTo == 'HomePage2') {
                    DeviceEventEmitter.emit('backHome');
                    navigation.navigate("TabIndex");

                } else {
                    navigation.navigate(nvoTo);
                }

                this.postMessageToH5(jsonObj, resultObj);

            } else if (jsonObj.action == "setTitle") {
                global.H5Title = jsonObj.params.title;
                DeviceEventEmitter.emit('updateTitle');
            }
        } catch (error) {
        }
    }

    postMessageToH5(jsonObj, resultObj) {
        // if(jsonObj.backApply){
        let backObject = {
            backApply: jsonObj.backApply,
            result: resultObj
        }
        console.log("返回H5数据：" + JSON.stringify(backObject));
        // this.refs['webView'].postMessage(JSON.stringify(backObject));
        this.webView && this.webView.postMessage(JSON.stringify( backObject ));
        // }
    }

    onLoadEnd = (e) => {
        console.log("onLoadEnd" , e)
    }
    render(){
        const { navigation } = this.props;
        const { h5Url } = this.state;
        const renderRightTitle = () => {
            return (
                <View style={[ styCom.FlexCenterCenter , { width: scaleSize(60) , height: scaleSize(60)} ]}>
                    <Image source={require('../../../assets/gmt/add_icon.png')} style={{ width: '100%' , height: '100%' }}></Image>
                </View>
            )
        }
        // const h5Url = `${global.H5Url}?url=/pages/rounds/index`;
        // const h5LocalUrl = `http://10.8.20.111:8081/grassrootsH5/index.html#/pages/auth/index?url=/pages/rounds/index`
        // console.log("h5LocalUrl" , h5LocalUrl , "h5Url" , h5Url);
        return <View style={ styles.container }>
            {/* <Header title="场所列表" navigation={navigation} leftTitle={false} rightTitle={ renderRightTitle } onRightTitlePress={ () => { console.log("onRightTitlePress")}} ></Header> */}
            {/* <WebView
                ref="webview"
                style={{flex: 1}}
                source={{uri: h5LocalUrl }}
                injectedJavaScript="
                    window.receiveMessage = (msg) => {
                        alert(msg)
                    }
                    window.ReactNativeWebView.postMessage('H5向RN方式数据')
                "
                onMessage={(e) => {
                    console.log("h5发送过来的消息--->",e.nativeEvent.data)
                }}
            /> */}
            {
                h5Url 
                ?  <WebView
                        ref={(webview) => this.webView = webview }
                        // ref='webView'
                        style={{flex: 1}}
                        // source={{ uri: 'file:///android_asset/test.html' }}
                        source={{ uri: h5Url }}
                        scalesPageToFit={true}
                        startInLoadingState={true}
                        javaScriptEnabled={true}//指定WebView中是否启用JavaScript
                        onNavigationStateChange={this.onNavigationStateChange}
                        injectedJavaScript={patchPostMessageJsCode}
                        onMessage={this.handleMessage}
                        onLoadStart={() => {
                            console.log("当WebView刚开始加载时调用的函数")
                        }}
                        onLoadEnd={this.onLoadEnd}//加载成功或者失败都会回调
                    />
                : null
            }
        </View>
    }
}
const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        display: 'flex',
    },

    header:{
        paddingVertical: scaleSize(15),
        paddingHorizontal: scaleSize(20),
        backgroundColor: '#108bf4',
    },

    headerLeft:{
        width: scaleSize(100),
        height: '100%',
        textAlign: 'left'
    },

    headerTitle:{
        color: "#FFFFFF",
    },

    headerRight:{
        width: scaleSize(100),
        height: '100%',
        textAlign: 'left'
    },

    subHeader:{
        width: '100%',
        paddingHorizontal: scaleSize(20),
        paddingVertical: scaleSize(15),
        backgroundColor: '#FFFFFF',
    },

    icon: {
        width: scaleSize(50),
        height: scaleSize(50),
        backgroundColor: 'transparent',
        borderRadius: 3,
        paddingHorizontal: scaleSize(8),
        paddingVertical: scaleSize(8),
    },
    textInput: {
        width: '100%',
        height: scaleSize(75),
        borderRadius: scaleSize(10),
        color: '#666',
        backgroundColor: '#F4F4F4',
        zIndex: 100,
    },
    title:{
        color: '#191919',
        fontWeight: '500',
        fontSize: scaleSize(28),
    },
    labelText:{
        color: '#8e8e8e',
        fontWeight: '500',
        fontSize: scaleSize(24),
        minWidth: scaleSize(100),
        textAlign: 'right',
    },
    valueText:{
        color: '#8e8e8e',
        fontSize: scaleSize(24),
    },
    cardItem: {
        width: '100%',
        marginBottom: scaleSize(20),
        // minHeight: scaleSize(250),
        paddingHorizontal: scaleSize(20),
        paddingVertical: scaleSize(15),
        backgroundColor: 'white',
        borderRadius: scaleSize(10),
    },
    centeredView: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '100%',
        height: deviceHeight*0.8,
        display: 'flex',
        backgroundColor: "white",
        borderTopLeftRadius: scaleSize(50),
        borderTopRightRadius: scaleSize(50),
        paddingHorizontal: scaleSize(25),
        paddingVertical: scaleSize(20),
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    openButton: {
        backgroundColor: "#F194FF",
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        fontWeight: '500',
        textAlign: "center",
        fontSize: scaleSize(30),
        color: '#1c1c1c'
    },
    label: { 
        width: deviceWidth/3 - 2*scaleSize(15) ,
        marginBottom: scaleSize(15) , 
        paddingVertical: scaleSize(20) , 
        backgroundColor: "#f6f6f6" , 
        borderRadius: scaleSize(50)
    },
    activeLabel: {
        width: deviceWidth/3 - 2*scaleSize(15) ,
        marginBottom: scaleSize(15) , 
        paddingVertical: scaleSize(20) , 
        backgroundColor: "rgba(254,119,4,0.2)" , 
        borderRadius: scaleSize(50)
    }
});