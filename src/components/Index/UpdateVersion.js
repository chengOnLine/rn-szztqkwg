import React, { Component } from 'react';
import ReactNative from 'react-native';
import {
    StyleSheet,
    Text,
    ScrollView,
    View,
    Image,
    TouchableOpacity,
    BackHandler,
    NativeModules,
    Platform,
    Linking,
    Modal
} from 'react-native';
import SvgUri from 'react-native-svg-uri';
import { Icons } from '../../fonts/fontIcons'
import AlertContainer from '../Public/AlertContainer';
import { HttpGet, HttpPost } from '../../request/index'

import { scaleSize } from '../../tools/adaptation';//适配屏幕

export default class UpdateVersion extends Component {
    constructor(props) {
        super(props);

        this.state = {

            alertShow: false,

            isForce: true, apkUrl: '', marke: ''
        }
    }

    componentDidMount() {
        console.log('检查版本信息...')
        this.getVersionInfo();

    }
    componentWillUnmount() {

    }

    getVersionInfo() {
        let params = { name: '基层治理' }
        HttpPost('qkwg-system/edition/findPage', params, 'json').then(res => {
            if (res.flag) {
                let rows = res.data.rows;
                if (rows.length > 0) {
                    let verdata = res.data.rows[0];

                    let versionNumber = verdata.versionNumber
                    let prompt = verdata.prompt

                    let type = verdata.type == 0 ? true : false //类型 0-强制更新 1-提示升级
                    let updateUrl = verdata.fileinfo[0].url

                    if (versionNumber != global.version.curNumber) {
                        this.setState({
                            alertShow: true,
                            isForce: type,
                            apkUrl: updateUrl,
                            marke: prompt
                        })
                    }
                }
            }
        })
    }

    _close(val) {
        if (this.state.isForce) {
            BackHandler.exitApp();
        } else {
            this.setState({
                alertShow: val
            })
        }
    }

    _reset() {
        this._close(false);
    }

    _update() {
        let url = this.state.apkUrl;
        Linking.canOpenURL(url).then(supported => {
            console.log(supported);
            Linking.openURL(url);
            BackHandler.exitApp();

            // if (!supported) {
            //     alert('未检测到浏览器！请装好浏览器再来下载app！');
            // } else {
            //     Linking.openURL(url);
            //     BackHandler.exitApp();
            // }
        }).catch(err => {
            console.error('An error occurred', err);
            alert('未检测到浏览器！请装好浏览器再来下载app！');
        });
    }

    render() {

        return (

            <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', }}>

                <AlertContainer
                    alertShow={this.state.alertShow}
                    iscolse={false}
                    submit={
                        this._update.bind(this)
                    }
                    close={
                        this._close.bind(this)
                    }
                    reset={this._reset.bind(this)}
                    title={'版本更新'}
                    btnTxt={'现在更新'}
                    cancelTxt={'暂不更新'}
                    isOkShow={true} 
                    isCancelShow={this.state.isForce ? false : true}
                    style={{
                        width: '90%',
                    }}>

                    <View style={{ marginBottom: scaleSize(30) }}>
                        <Text>{this.state.marke}</Text>
                    </View>
                </AlertContainer>

            </View>

        );
    }
}
