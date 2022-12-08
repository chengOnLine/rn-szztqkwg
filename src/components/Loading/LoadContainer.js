import React, { Component } from 'react';
import ReactNative from 'react-native';
import {
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
} from 'react-native';

import {scaleSize,setSpText} from '../../tools/adaptation';//适配屏幕

export  default class LoadContainer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={styles.center}>
                <ActivityIndicator
                    animating={true}
                    color="#4f83be"
                    style={[styles.centering, {height: 80}]}
                    size="large" />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    center:{
        position:'absolute',
        top:0,
        // marginTop:scaleSize(-100),
        left:0,
        justifyContent: 'center',
        width:'100%',
        height:'100%',
        // zIndex:1
        zIndex:20
    },
    centering: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,

    },
});