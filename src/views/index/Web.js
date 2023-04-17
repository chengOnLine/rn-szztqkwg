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
import { storageSet, storageGet } from '../../storage/index'

import { WebView } from 'react-native-webview';
import DeviceInfo from 'react-native-device-info';
import ScannerCode from '../../components/Public/ScannerCode'; //扫描二维码
import SYImagePicker from 'react-native-syan-image-picker'

import { deviceHeight, deviceWidth, scaleSize } from "../../tools/adaptation";
import { toastShort } from "../../tools/toastUtil";
import { getLocation, getLocation2, getNowLocation } from "../../tools/AmapLocation";
import { post } from "../../request/NetUtility";
import { HttpGet, HttpPost } from '../../request/index'
import { decryptKeyVal } from '../../tools/comm'
import clear from 'react-native-clear-app-cache';
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
            isOldPage: this.props.route.params.isOldPage,

            visiteUrl: '',
            backButtonEnabled: false,
            scanShow: false,

            navStateUrl: '',
            isBack: false,

            // show:true,
            // animation: new Animated.Value(0),
            // showRNCamera: false
        }
    }

    componentDidMount() {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
        }
        if (self.state.isOldPage) {
            // this.getCasParams()
            this.getZLTtoken();
        } else {
            // alert(self.state.h5Url)

            this.setState({
                visiteUrl: self.state.h5Url + (self.state.h5Url.indexOf('?') >= 0 ? '&' : '?') + 'rand=' + Math.round(Math.random()*80)
            })
            console.log('h5-url: ' + self.state.visiteUrl)
        }

        toastShort("正在加载中...", 'center');

        // InteractionManager.runAfterInteractions(()=>{
        //     this.startAnimation()
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

        if (global.routeName != 'HomePage' && global.routeName != 'TabIndex') {
            this.setState({ isBack: true })
        }

        if (this.state.backButtonEnabled) {
            this.refs['webView'].goBack();
            return true;
        } else {
            // DeviceEventEmitter.emit('backHome');
            // n.goBack();
            return true;
        }
    };

    handleMessage = (evt) => {
        try {
            const message = evt.nativeEvent.data
            console.log(message);

            let jsonObj = JSON.parse(message);
            let resultObj = {};
            if (jsonObj.action == 'getLocation') {//定位功能

                getLocation().then((res) => {

                    const { code, data = {}, error } = res;
                    if (code == 0) {
                        const { address, coords = {} } = data;
                        this.postMessageToH5(jsonObj, { code: 0, address, ...coords });
                    } else {
                        this.postMessageToH5(jsonObj, { code: 1, error });
                    }
                }).catch((error) => {
                    this.postMessageToH5(jsonObj, { code: 1, error });
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
                                data: v.base64.replace('data:image/jpeg;base64,', '').replace('data:image/png;base64,', ''),
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
                                data: v.base64.replace('data:image/jpeg;base64,', '').replace('data:image/png;base64,', ''),
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
                let brand = DeviceInfo.getBrand();
                let uniqueID = DeviceInfo.getUniqueID();
                let os = Platform.OS;
                let systemVersion = DeviceInfo.getSystemVersion();

                resultObj = {
                    brand, uniqueID, os, systemVersion
                }

                self.postMessageToH5(jsonObj, resultObj);
            } else if (jsonObj.action == 'getToken') {//获取内部登录Token
                let token = global.requestHeadAuthorization.replace('Bearer ', '');
                resultObj = { token }

                self.postMessageToH5(jsonObj, resultObj);
            } else if (jsonObj.action == 'getZltToken') {//获取治理通内部登录Token
                let token = global.zlt_oauthToken;
                resultObj = { token }

                self.postMessageToH5(jsonObj, resultObj);

            } else if (jsonObj.action == 'getVersion') {//获取内部登录Token
                let curVerNumber = global.version.curNumber;
                resultObj = { curVerNumber }

                self.postMessageToH5(jsonObj, resultObj);
            } else if (jsonObj.action == 'navToPage') {//跳转RN界面
                let nvoTo = jsonObj.params.page;

                if (nvoTo.toLowerCase().indexOf('homepage') >= 0) {
                    DeviceEventEmitter.emit('backHome');
                    n.navigate("TabIndex");

                } else {
                    n.navigate(nvoTo);
                }

                self.postMessageToH5(jsonObj, resultObj);

            } else if (jsonObj.action == "setTitle") {
                global.H5Title = jsonObj.params.title;
                DeviceEventEmitter.emit('updateTitle');
            } else if (jsonObj.action == 'getUserInfo') { //获取治理通的基本用户信息

                let userInfo = global.zltUser.info;
                resultObj = { userInfo }

                self.postMessageToH5(jsonObj, resultObj);
            } else if (jsonObj.action == 'getCache'){ // 获取本地缓存数据大小
                new Promise(( resolve , reject ) => {
                    clear.getAppCacheSize((value, unit) => {
                        resolve({ code: 0 ,  cacheSize: value , cacheUnit: unit });
                    })
                }).then( cache => {
                    self.postMessageToH5(jsonObj , cache );
                }).catch( () => {
                    self.postMessageToH5(jsonObj , { code: 1 } );
                })
            } else if( jsonObj.action === 'clearCache'){ //清除本地缓存
                console.log("a")
                new Promise(( resolve , reject ) => {
                    clear.clearAppCache(() => {
                        resolve({ code: 0 , message: "清除成功"});
                    }) 
                }).then( response => {
                    self.postMessageToH5(jsonObj , response );
                }).catch( () => {
                    self.postMessageToH5(jsonObj , { code: 1 , message: "清除失败" } );
                })
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


    //获取治理通的登录token
    getZLTtoken() {

        HttpGet('qkwg-system/system/user/getToken/' + global.zltUser.userName, null).then((res) => {
            if (res.flag) {
                let data = res.data;

                console.log('getZLTtoken', data);

                global.zlt_oauthToken = "Bearer " + data;
                storageSet('oauthToken', global.zlt_oauthToken);

                this.getZLTUserInfo();

            } else {
                global.zlt_oauthToken = "";
                toastShort("该用户没有权限登录", 'bottom');
                n.goBack();
            }
        }).catch((error) => {
            toastShort(error, 'bottom');//超时会在这里
            n.goBack();
        })
    }

    getZLTUserInfo() {
        let self = this;

        let postLogin = {
            param3: global.zltVersion.curNumber,
            param4: "",
            lat: '',
            lng: '',
            currentRole: '',
        };

        post(global.zlt_requestApi + '/zty-system/sys/sysuser/loginOperate', postLogin, null, function (res) {

            if (res.hasOwnProperty("flag")) {
                if (res.flag) {
                    let { mainKey, user } = res.data;

                    // res.data.appRoleList=decryptKeyVal(appRoleList,mainKey);
                    res.data.user = decryptKeyVal(user, mainKey);
                    // console.log(res);

                    let { communityId, communityName, deptId, deptName, email, fullName, gridId, gridName,
                        identity, password, phone, picAddress, princeArea, roleId, roleKey, roleName, sex,
                        streetId, userId, cardId, appRoleList } = JSON.parse(res.data.user);

                    // let {token,userUid} = res.data.sesMap;
                    // console.log('appLogin result',global.user.info);
                    global.zltUser.info = {
                        //id,userName,password,identity,departmentId,sex,email,phone
                        id: userId,
                        userName: fullName,
                        password,
                        identity,
                        departmentId: deptId == undefined ? 0 : deptId,
                        sex,
                        phone,
                        email,
                        communityId,
                        communityName,
                        deptName,
                        gridId,
                        gridName,
                        picAddress,
                        princeArea,
                        roleId,
                        roleKey,
                        roleName,
                        streetId,
                        cardId
                    };

                    global.user.appRoleList = JSON.parse(appRoleList);

                    storageSet('zlt_curUserInfo', global.zltUser);
                    console.log('zlt_curUserInfo:' + JSON.stringify(global.zltUser.info))

                    self.getCasParams();

                } else {
                    //   toastShort(res.msg, 'bottom');
                    toastShort("该用户没有权限登录", 'bottom');
                    n.goBack();
                }
            } else {

                toastShort("该用户没有权限登录", 'bottom');
                n.goBack();
            }
        })
    }

    //老版本H5登录token
    // getCasParams() {
    //     HttpGet('qkwg-system/system/user/getToken', null).then((res) => {

    //         if (res.flag) {
    //             let data = res.data;
    //             self.setState({
    //                 visiteUrl: self.state.h5Url + (self.state.h5Url.indexOf('?') >= 0 ? '&' : '?') + 'token=' + encodeURIComponent(data)
    //             })
    //             console.log('h5-url: ' + self.state.visiteUrl)
    //         } else {
    //             toastShort(res.msg, 'bottom');
    //         }
    //     }).catch((error) => {
    //         toastShort(error, 'bottom');//超时会在这里
    //     })
    // }

    //老版本H5登录token
    getCasParams() {
        let self = this;
        if (global.zlt_oauthToken == "") {
            toastShort("该用户没有权限登录", 'bottom');
            n.goBack();
            return;
        }

        if (this.outCode == "zlth5") {
            self.setState({
                visiteUrl: self.state.h5Url
            })
        } else {

            post(global.zlt_requestApi + '/zty-system/appLogin/getCasParam',
                { userId: global.zltUser.info.id, outCode: this.state.outCode }, null,
                function (res) {

                    if (res.flag) {
                        let data = res.data;

                        self.setState({
                            visiteUrl: self.state.h5Url + (self.state.h5Url.indexOf('?') >= 0 ? '&' : '?') + 'token=' + encodeURIComponent(data)
                        })

                        console.log('h5-url: ' + self.state.visiteUrl)
                    } else { 
                        toastShort("该用户没有权限登录", 'bottom');
                        n.goBack();
                    }
                }, self).then(() => {
                    // console.log('成功');
                }).catch((error) => {
                    // console.log(error);
                    // toastShort(error, 'bottom');//超时会在这里
                    toastShort("该用户没有权限登录", 'bottom');
                    n.goBack();
                });
        }
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

        if (this.state.isBack) {
            // console.log('----navStateUrl11----',navState.url)
            //防止返回空白页，再次跳转
            if (navState.url.indexOf("about:blank") >= 0) {

                DeviceEventEmitter.emit('backHome');
                DeviceEventEmitter.emit('backMyIndex');
                n.goBack();
                this.setState({ isBack: false })
            }
            return true;
        } else {

            this.setState({
                backButtonEnabled: navState.canGoBack,
                navStateUrl: navState.url
            });
        }
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
                    mixedContentMode={'always'}
                    source={{ uri: this.state.visiteUrl }}
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
