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
export default class ToDoTask extends Component{
    constructor(props){
        super(props);
        this.state = {

        }
    }

    render(){
        const { navigation } = this.props;
        return <View style={ styles.container }>
             <Header title="待办事项" navigation={navigation}/>
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