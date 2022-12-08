import React , { Component } from "react";
import { deviceWidth, deviceHeight, scaleSize } from '../../../tools/adaptation';
import styCom from '../../../styles/index'
import { toastShort } from '../../../tools/toastUtil';
import Header from "../../../components/gmt/header";
import {
    Image, View, StyleSheet, BackHandler,
    Button, Alert, Text, FlatList, TextInput, Switch,
    Platform, NativeModules, StatusBar, ScrollView, TouchableOpacity, DeviceEventEmitter, PermissionsAndroid , ImageBackground
} from 'react-native';
export default class Mine extends Component{
    constructor(props){
        super(props);
        this.state = {
            isLoginByFingerprint: false,
        }
    }

    handleSwitchChange = (value)=>{
        this.setState({
            isLoginByFingerprint: value,
        })
    }

    render(){
        const { isLoginByFingerprint } = this.state;
        const { navigation } = this.props;
        return <View style={ styles.container }>
            <Header title="指纹设置" navigation={navigation}/>
            <View style={[{ paddingHorizontal: scaleSize(25) , paddingVertical: scaleSize(20) , backgroundColor: '#FFFFFF'} , styCom.FlexBetween ]}>
                <Text>指纹登录</Text>
                <Switch value={ isLoginByFingerprint } onValueChange={ this.handleSwitchChange }></Switch>
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
});