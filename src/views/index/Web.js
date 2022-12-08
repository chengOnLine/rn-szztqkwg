import React, { Component } from 'react';
import {
    View,
    Text,
    Platform,
    BackHandler,
    TextInput,
    TouchableOpacity,
    Image,
    InteractionManager,
    StyleSheet,
    NativeModules,
    FlatList,
    DeviceEventEmitter,
    Button
} from 'react-native';
import Head from '../../components/Public/Head';

import { WebView } from 'react-native-webview';
// import DeviceInfo from 'react-native-device-info';
import ScannerCode from '../../components/Public/ScannerCode'; //扫描二维码
import SYImagePicker from 'react-native-syan-image-picker'

import { deviceHeight, deviceWidth, scaleSize } from "../../tools/adaptation";
import { toastShort } from "../../tools/ToastUtil";
import { HttpPost } from '../../tools/request';
import { getLocation, getLocation2 , getLocationInfo} from "../../tools/AmapLocation";

const patchPostMessageJsCode = `(function() {
    window.postMessage = function(data) {
        window.ReactNativeWebView.postMessage(data)
    } })();`

let n, self;
let messageObj = null;

let title = 'eee';

export default class Web extends Component {

    constructor(props) {
        super(props);
        this.state = {
            outCode: this.props.route.params.outCode,
            h5Url: this.props.route.params.h5Url,

            visiteUrl: '',
            backButtonEnabled: false,
            scanShow: false

            // show:true,
            // animation: new Animated.Value(0),
            // showRNCamera: false
        }
    }

    componentDidMount() {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
        }

        // InteractionManager.runAfterInteractions(()=>{
        //     this.startAnimation()
        // });

        //登录获取token
        // let params = { userId: global.user.info.id, outCode: this.props.navigation.getParam('outCode', '') }

        // HttpPost('/appLogin/getCasParam', params, function (res) {
        //     if (res.hasOwnProperty("code") && res.code == '1') {
        //         toastShort(res.msg, 'bottom');
        //         n.navigate('login');
        //         return false;
        //     }

        //     if (res.flag) {
        //         let data = res.data;

        //         self.setState({
        //             visiteUrl: self.state.h5Url + (self.state.h5Url.indexOf('?') >= 0 ? '&' : '?') + 'token=' + encodeURIComponent(data)
        //         })
        //         console.log('h5-url: ' + self.state.visiteUrl)
        //     } else {
        //         toastShort(res.msg, 'bottom');
        //     }
        // }, self).then(() => {
        //     // console.log('成功');
        // }).catch((error) => {
        //     // console.log(error);
        //     toastShort(error, 'bottom');//超时会在这里
        // });
    }

    componentWillUnmount() {
        //移除监听
        if (this.listener) {
            this.listener.remove();
        }
        BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
    }

    onBackAndroid = () => {
        if (this.state.backButtonEnabled) {
            this.refs['webView'].goBack();
            return true;
        } else {
            DeviceEventEmitter.emit('backHome');
            n.goBack();
            return true;
        }
    };

    handleMessage = async (evt: any) => {
        try {
            const message = evt.nativeEvent.data
            console.log("message" ,message);
            // alert(JSON.stringify(message))

            // debugger
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
                self.setState({
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
                        self.postMessageToH5(jsonObj, resultObj);
                    })
                    .catch(err => {
                        resultObj = {
                            code: 1,
                            message: '获取相机功能失败'
                        }
                        self.postMessageToH5(jsonObj, resultObj);
                    })
            } else if (jsonObj.action == 'getPhotograph') {//拍照功能
                SYImagePicker.openCamera({ isCrop: false, showCropCircle: true, showCropFrame: false, enableBase64: true }, (err, photos) => {
                    console.log(err, photos);
                    if (!err) {

                        // console.log(image);
                        if (Array.isArray(photos)) {
                            self.saveImg(photos[0].uri);
                        } else {
                            self.saveImg(photos.uri);
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
                        self.postMessageToH5(jsonObj, resultObj);

                    } else {
                        resultObj = {
                            code: 1,
                            message: '获取拍照功能失败'
                        }
                        self.postMessageToH5(jsonObj, resultObj);
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

                self.postMessageToH5(jsonObj, resultObj);
            } else if (jsonObj.action == 'getToken') {//获取内部登录Token
                let token = global.requestHeadAuthorization.replace('Bearer ', '');
                resultObj = { token }

                self.postMessageToH5(jsonObj, resultObj);
            } else if (jsonObj.action == 'getVersion') {//获取内部登录Token
                let curVerNumber = global.version.curNumber;
                resultObj = { curVerNumber }

                self.postMessageToH5(jsonObj, resultObj);
            } else if (jsonObj.action == 'navToPage') {//跳转RN界面
                let nvoTo = jsonObj.params.page;

                if (nvoTo == 'HomePage2') {
                    DeviceEventEmitter.emit('backHome');
                    n.navigate("TabIndex");

                } else {
                    n.navigate(nvoTo);
                }

                self.postMessageToH5(jsonObj, resultObj);

            } else if (jsonObj.action == "setTitle") {
                global.H5Title = jsonObj.params.title;
                DeviceEventEmitter.emit('updateTitle');
            }
        } catch (error) {
        }
    }

    saveImg(img) {
        // let promise = CameraRoll.saveToCameraRoll(img);
        // promise.then(function(result) {
        //     //toastShort('图片保存成功！','bottom')
        // }).catch(function(error) {
        //     //alert('图片保存失败！\n' + error);
        // });
    }

    postMessageToH5(jsonObj, resultObj) {
        // if(jsonObj.backApply){
        let backObject = {
            backApply: jsonObj.backApply,
            result: resultObj
        }
        console.log("返回H5数据：" + JSON.stringify(backObject));
        this.refs['webView'].postMessage(JSON.stringify(backObject));
        // }
    }

    onNavigationStateChange = navState => {
        this.setState({
            backButtonEnabled: navState.canGoBack
        });
    };

    // 扫描二维码开启关闭
    _scanClose(val, info) {
        if (info != undefined) {
            console.log(info.data)

            let resultObj = {
                code: 0,
                message: '二维码扫码成功',
                info: info.data
            }
            self.postMessageToH5(messageObj, resultObj);
        }
        this.setState({
            scanShow: false
        })
    }

    barcodeReceived(e) {
        // if (self.state.show) {
        //     self.state.show = false;
        //     self.setState({
        //         showRNCamera: fasle,
        //     })
        //     if (e) {
        //         Vibration.vibrate([0, 500], false);
        //         let result = e.data;
        //         if(messageObj){
        //
        //             let resultObj={
        //                 code:0,
        //                 message:'获取扫码功能成功',
        //                 info: result
        //             }
        //             self.postMessageToH5(jsonObj,resultObj);
        //         }
        //     } else {
        //         let resultObj={
        //             code:1,
        //             message:'获取扫码功能失败'
        //         }
        //         self.postMessageToH5(jsonObj,resultObj);
        //     }
        // }
    }

    onLoadEnd = (e) => {
        // let data = {
        //     source:'from rn',
        // };
        // this.web && this.web.postMessage(JSON.stringify(data));//发送消息到H5
    };

    render() {

        n = this.props.navigation;
        self = this;
        return (
            <View style={{ width: '100%', height: '100%' }}>
                {/* <Head back={true} title='基层治理' backAction={() => n.goBack()} /> */}

                {/* <Button onPress={() => { this.postMessageToH5({ backApply: '111' }, 'aa') }} title="Send Message to H5" /> */}

                <WebView
                    ref='webView'
                    // source={{ uri: 'file:///android_asset/test.html' }}
                    source={{ uri: this.state.h5Url }}
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

                <ScannerCode scanShow={this.state.scanShow} goBack={this._scanClose.bind(this)} ref="ScannerCode" />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black'
    },
    preview: {
        flex: 1,
    },
    itemStyle: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: (deviceWidth - 200) / 2,
        height: 200
    },
    textStyle: {
        color: '#fff',
        marginTop: 20,
        fontWeight: 'bold',
        fontSize: 18
    },
    animatedStyle: {
        height: 2,
        backgroundColor: '#00c050'
    },
    rectangle: {
        height: 200,
        width: 200,
    }
});
