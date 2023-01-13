import React, { Component } from 'react';
import {
    Image,
    TextInput,
    Text,
    View,
    TouchableOpacity,
    StyleSheet
} from 'react-native';

import { deviceWidth, scaleSize } from '../../tools/adaptation';
let p;
export default class L_Input extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            secureTextEntry: true,
        }
    }

    setVal() {
        this.setState({
            value: '',
        })
    }

    render() {
        p = this.props;

        let imageUrl = require('../../assets/login_icon1.png');

        if (p.type == 'user') {
            imageUrl = require('../../assets/login_icon1.png');
        } else if (p.type == 'pwd') {
            imageUrl = require('../../assets/login_icon2.png');
        } else if (p.type == 'tel') {
            imageUrl = require('../../assets/login_icon4.png');
        } else {
            imageUrl = require('../../assets/login_icon3.png');
        }

        return (
            <View style={styles.container}>
                {/*user:用户名输入框，pwd:密码输入框*/}
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                        if (p.type === 'user')
                            return false;
                        else

                            this.setState({
                                secureTextEntry: !this.state.secureTextEntry
                            })
                    }}
                >
                    <Image source={imageUrl}

                        style={{
                            height: scaleSize(p.type === 'user' ? 35 : 33),
                            width: scaleSize(p.type === 'user' ? 33 : 32),
                            margin: 10,
                        }} />
                </TouchableOpacity>

                {
                    p.type === 'user' || p.type == 'tel' || p.type == 'code' ?
                        <TextInput
                            placeholder={p.placeholder}
                            maxLength={p.maxLength}
                            keyboardType={p.keyboardType}

                            style={styles.textInput}
                            value={this.state.value}
                            underlineColorAndroid='transparent' //设置下划线背景色透明 达到去掉下划线的效果
                            onChangeText={(value) => this.setState({ value })}
                        />
                        :
                        <TextInput
                            placeholder={p.placeholder}
                            style={styles.textInput}//密文
                            value={this.state.value}
                            secureTextEntry={this.state.secureTextEntry}
                            underlineColorAndroid='transparent' //设置下划线背景色透明 达到去掉下划线的效果
                            onChangeText={(value) => this.setState({ value })}
                        />
                }

                {
                    p.type == 'pwd' ?
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => {
                                this.setState({ secureTextEntry: !this.state.secureTextEntry })
                            }}
                        >
                            <Image source={require('../../assets/showPwd.png')}
                                style={{
                                    height: scaleSize(30),
                                    width: scaleSize(35),
                                    margin: 10,
                                }} />
                        </TouchableOpacity>
                        : null
                }

                {/* <Image source={
                    this.state.value === '' ? require('../../assets/error.png') :
                        require('../../assets/lright.png')}
                    style={{ height: scaleSize(32), width: scaleSize(32), margin: 10 }} /> */}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        width: deviceWidth - scaleSize(110),
        marginLeft: scaleSize(20),
        // marginRight: scaleSize(50),
        height: scaleSize(100),
        borderWidth: scaleSize(1),
        // borderRadius: scaleSize(125),
        borderColor: '#fff',
        borderBottomColor: '#D3E6FF',
        alignItems: 'center',
        // backgroundColor: '#F4F4F4',
        marginBottom: scaleSize(30)

    },
    textInput: {
        width: deviceWidth - scaleSize(260),
        alignSelf: 'stretch',
        marginBottom: scaleSize(5),
        padding: scaleSize(0.5),
        color: '#666',
        // backgroundColor: '#F4F4F4'
    },

});