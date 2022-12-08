import React, { Component } from 'react';

import {
    View,
    StyleSheet,
    TextInput,
    Text,
    TouchableOpacity,
    ImageBackground,
    Image,
    CheckBox,
    BackHandler,
    DeviceEventEmitter,
    Alert, NativeModules
} from 'react-native';


import { deviceWidth, deviceHeight, scaleSize } from '../../tools/adaptation';
import L_Input from '../../components/Index/L_Input';
import styCom from '../../styles/index'

export default class RegisterUser extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isShowIp: false,
            isHandCode: false,
            regType: this.props.route.params.registerType,
        };
    }

    componentDidMount() {
        if (Platform.OS === 'android') {
            BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
        }
    }

    componentWillUnmount() {
     
    }

    toLogin() {
        this.props.navigation.navigate('Login');
    }
    render() {
        return (

            <ImageBackground source={require('../../assets/login_bg.png')} style={styles.backgroundImage}>

                <View style={styles.container}>
                    <View style={{ height: '30%' }}>
                        <View style={styles.logo}>
                            <Image source={require('../../assets/loginIcon.png')} style={{ height: scaleSize(200), width: scaleSize(430) }} />
                        </View>
                    </View>

                    <View style={{ height: '70%' }}>
                        <View style={styCom.CenterCenter}>
                            <Text style={styles.logoTitle}>
                                {this.state.regType == 'restPwd' ? '忘记密码' : '注册用户'}
                            </Text>
                        </View>

                        <View style={{ marginTop: scaleSize(50) }}>
                            <L_Input type='user' placeholder='请输入用户名' ref={(c) => { this.userInput = c; }} />
                            <L_Input type='code' placeholder='请输入验证码' ref={(c) => { this.userInput = c; }} />
                            <L_Input type='pwd' placeholder='请输入密码' ref={(c) => { this.pwdInput = c; }} />
                        </View>

                        <TouchableOpacity
                            style={styles.btnLogin}
                            activeOpacity={0.8}
                            onPress={this._login}
                        >
                            <Text style={{ color: '#fff' }}>登录</Text>
                        </TouchableOpacity>


                        <View style={styCom.CenterCenter}>
                            <Text style={{ color: '#999' }}>若没有注册，登录后将自动注册成功。</Text>
                        </View>

                        <View style={[styCom.CenterCenter, { marginTop: scaleSize(60) }]}>
                            <Text style={{ color: '#666' }}>已有账号，</Text>

                            <TouchableOpacity
                                onPress={() => { this.toLogin() }}>
                                    <Text style={{ color: '#2589FF' }}>去登录</Text>
                                    </TouchableOpacity>

                        </View>

                    </View>
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
        position: 'absolute', right: 0, left: 0, top: 20, bottom: 0, justifyContent: 'center', flexDirection: 'row'
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