import React, { Component, PureComponent } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Platform
} from 'react-native';
import { scaleSize } from "../../tools/adaptation";

export default class Head extends PureComponent {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={styles.container}>
                {this.props.back ?
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={this.props.backAction}
                        style={styles.back}>
                        <Image source={require('../../assets/back.png')} style={styles.img} /></TouchableOpacity>
                    : null}
                <Text style={{ color: '#fff' }}>{this.props.title ? this.props.title : '治理通'}</Text>
                {this.props.switch ?
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={this.props.switchAction}
                        style={styles.switch}>
                        <Image source={this.props.type == 1 ? require('../../assets/mapHead.png') : require('../../assets/listHead.png')} style={{ height: scaleSize(48), width: scaleSize(48) }} /></TouchableOpacity>
                    : null
                }
                {this.props.search ?
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={this.props.searchAction}
                        style={styles.search}>
                        <Image source={require('../../assets/search.png')} style={{ height: scaleSize(48), width: scaleSize(48) }} /></TouchableOpacity>
                    : null}
                {this.props.right ?
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={this.props.rightAction}
                        style={styles.search}>
                        {this.props.children}
                    </TouchableOpacity>
                    : null}
               
            </View>
        );
    }
}

const styles = StyleSheet.create({
    /*main:{
        backgroundColor:'#0072bb',
        height:scaleSize(80),
        alignItems:'center',
        justifyContent:'center',
        position:'absolute',
        zIndex:2,
        width:'100%',
        top:0,
        left:0,
        flexDirection: 'row'
    },*/
    container: {
        height: Platform.OS == 'ios' ? scaleSize(120) : scaleSize(80),
        flexDirection: 'row',
        backgroundColor: '#0072bb',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: Platform.OS == 'ios' ? scaleSize(40) : scaleSize(0)
    },
    back: {
        position: 'absolute',
        left: 0
    },
    search: {
        position: 'absolute',
        right: scaleSize(20),
    },
    switch: {
        position: 'absolute',
        right: scaleSize(88),
    },
    img: {
        height: scaleSize(64),
        width: scaleSize(64),
    }
})