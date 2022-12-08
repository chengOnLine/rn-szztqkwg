import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    Alert,
    TouchableOpacity,
    DeviceEventEmitter,
    View,
    ViewPropTypes as RNViewPropTypes,
    Platform,
} from 'react-native';

// import FingerprintScanner from 'react-native-fingerprint-scanner';
import styles from '../../styles/Fingerprint';
import { toastShort } from '../../tools/toastUtil';

import ShakingText from '../../components/Index/ShakingText';

const ViewPropTypes = RNViewPropTypes || View.propTypes
// - this example component supports both the
//   legacy device-specific (Android < v23) and
//   current (Android >= 23) biometric APIs
// - your lib and implementation may not need both
class BiometricPopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errorMessageLegacy: undefined,
            biometricLegacy: undefined
        };

        this.description = null;
    }
    

    componentDidMount() {

        this.authLegacy();
        //判断Android API是不是<23，高于此版本使用标准指纹解锁api;低于此版本使用兼容适配版本
        // if (this.requiresLegacyAuthentication()) {
        //     this.authLegacy();
        // } else {
        //     this.authCurrent();
        // }
    }

    componentWillUnmount = () => {
        // FingerprintScanner.release();
    }

    requiresLegacyAuthentication() {
        return Platform.Version < 23;
    }
    
    authCurrent() {
        // FingerprintScanner
        //     .authenticate({ title: '指纹-登录' })
        //     .then(() => {
        //         this.props.onAuthenticate().then(e => {
        //             console.log(e)
        //         });
        //     });
    }

    authLegacy() {
        // FingerprintScanner.isSensorAvailable().then((result) => {

        //     FingerprintScanner.authenticate({
        //         title: '验证指纹',
        //         description: '触摸传感器以验证指纹',
        //         cancelButton: '使用账号密码登录'
        //     }).then((result) => {

        //         if (result === true) {
        //             toastShort('指纹验证成功');

        //             //通知登录
        //             DeviceEventEmitter.emit('FingerSettings'); 

        //         } else {
        //             toastShort('指纹验证失败，请重试')
        //         }
        //     }).catch(err => {
        //         this.handleFingerprintDismissed();
        //         console.log(err.message);
        //     });
        // }).catch(err => {
        //     // Alert.alert("您的设备不支持指纹识别，请选择其他方式登录")
        //     toastShort('请确认设备是否开启指纹功能')
        // })
    }

    renderLegacy() {
        const { errorMessageLegacy, biometricLegacy } = this.state;
        const { style, handlePopupDismissedLegacy } = this.props;

        return (
            <View style={styles.container}>
                {/* <View style={[styles.contentContainer, style]}> */}

                {/* <Image
                        style={styles.logo}
                        source={require('../../assets/back.png')}
                    /> */}

                {/* <Text style={styles.heading}>
                        Biometric{'\n'}Authentication
                    </Text> */}

                {/* <ShakingText
                        ref={(instance) => { this.description = instance; }}
                        style={styles.description(!!errorMessageLegacy)}>
                        {errorMessageLegacy || `Scan your ${biometricLegacy} on the\ndevice scanner to continue`}
                    </ShakingText> */}

                {/* <TouchableOpacity
                        style={styles.buttonContainer}
                        onPress={handlePopupDismissedLegacy}
                    >
                        <Text style={styles.buttonText}>
                            BACK TO MAIN
                        </Text>
                    </TouchableOpacity> */}

                {/* </View> */}
            </View>
        );
    }


    render = () => {
        if (this.requiresLegacyAuthentication()) {
            return this.renderLegacy();
        }
        // current API UI provided by native BiometricPrompt
        return null;
    }
}

BiometricPopup.propTypes = {
    onAuthenticate: PropTypes.func.isRequired,
    handlePopupDismissedLegacy: PropTypes.func,
    style: ViewPropTypes.style,
};

export default BiometricPopup;