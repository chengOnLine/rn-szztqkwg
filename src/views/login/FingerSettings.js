import React, { Component } from 'react';
import {
    TouchableOpacity,
    View,
    StyleSheet,
    Image, StatusBar,
    Text,
    DeviceEventEmitter,
    Platform,
} from 'react-native';
import BiometricPopup from '../../components/Index/BiometricPopup'
import { deviceWidth, deviceHeight, scaleSize } from '../../tools/adaptation';
import { storageGet, storageSet } from '../../storage/index'
import { CommonActions } from '@react-navigation/native';

let self, n;
export default class FingerSettings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isHandCode: false,
        };
    }
    componentDidMount() {

        //收到监听
        this.listener = DeviceEventEmitter.addListener('FingerSettings', () => {
            if (global.routeName === 'FingerSettings') {

                //指纹认证成功
                global.user.info.FingerSettings = true;

                storageSet('qkwg_curUserInfo', global.user);
                // n.navigate('HomePage');
                //跳转首页
                this.cancelSettings();
            }
        })

    }

    componentWillUnmount() {
        // this.listener.remove();
    }

    onBiometricPopup = (e) => {
        console.log(JSON.stringify(e))
    }

    zhiwenSettings() {
        this.setState({ isHandCode: true })
    }

    cancelSettings() {
        // this.props.navigation.navigate('HomePage');

        //设置路由返回第一个界面
        global.navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [
                    { name: 'TabIndex' },
                ],
            })
        );
    }


    render() {
        self = this.props;
        n = this.props.navigation;

        return (
            <View style={styles.container}>

                {/* <StatusBar
                    animated={false} //指定状态栏的变化是否应以动画形式呈现。 
                    translucent={false}//指定状态栏是否透明。设置为true时
                    backgroundColor={'#fff'} //状态栏的背景色
                    barStyle={'dark-content'} // 字体样式 enum('default', 'light-content', 'dark-content')  
                /> */}

                <View style={styles.retGo}>
                    <TouchableOpacity
                        onPress={() => {
                            this.cancelSettings();
                        }}
                        style={styles.btn} activeOpacity={0.8}>

                        <Text style={{ fontSize: scaleSize(28), color: '#666' }}>跳过</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.mainView}>
                    <View activeOpacity={0.8}>
                        <Image source={require('../../assets/zhiwen.png')} style={{ height: scaleSize(180), width: scaleSize(120) }} />
                    </View>

                    <View activeOpacity={0.8}>
                        <Text style={styles.stfont} >设置指纹登录便捷又安全</Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => {
                            this.zhiwenSettings();
                        }}
                        style={styles.stBtn} activeOpacity={0.8}>
                        <Text style={{ color: '#fff' }}>点击设置指纹登录</Text>
                    </TouchableOpacity>
                </View>

                {this.state.isHandCode ? <BiometricPopup onAuthenticate={this.onBiometricPopup}></BiometricPopup> : null}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        backgroundColor: '#fff'
    },

    mainView: {
        height: deviceHeight,
        width: deviceWidth,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
    },

    retGo: {
        marginTop: scaleSize(50), marginRight: scaleSize(30), flexDirection: 'row', justifyContent: 'flex-end'
    },

    stfont: {
        color: '#666',
        fontWeight: '500',
        fontSize: scaleSize(28),
        marginBottom: scaleSize(80),
        marginTop: scaleSize(50)
    },
    stBtn: {
        backgroundColor: '#1E7DFF',
        borderRadius: scaleSize(120),
        paddingTop: scaleSize(30),
        paddingBottom: scaleSize(30),
        paddingRight: scaleSize(80),
        paddingLeft: scaleSize(80),
    }

});
