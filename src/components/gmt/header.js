import React , { useState } from "react";
import styCom from '../../styles/index';
import {
    Image, View, StyleSheet, BackHandler,
    Button, Alert, Text, FlatList, TextInput,
    Platform, NativeModules, StatusBar, ScrollView, TouchableOpacity, DeviceEventEmitter, PermissionsAndroid , ImageBackground
} from 'react-native';
import { scaleSize } from "../../tools/adaptation";

export default function( props ){
    const { 
        headerStyle = {} , 
        title = '主标题' , 
        titleStyle = {} , 
        onTitlePress,
        leftTitle =  () => { return renderDefaultLeftitle() }, 
        leftTitleStyle = {}, 
        onLeftTitlePress,
        rightTitle = '' , 
        rightTitleStyle = {} ,
        onRightTitlePress,
        navigation
    } = props;

    const handleLeftTitlePress = () => {
        if( !leftTitle ) return;
        const handlePress =  typeof onLeftTitlePress === 'function' ? onLeftTitlePress : () => {
            navigation && navigation.goBack();
        };
        handlePress();
    }

    const handleTitlePress = () => {
        typeof onTitlePress === 'function' && onTitlePress();
    }

    const handleRightTitlePress = () => {
        if( !rightTitle ) return;
        typeof onRightTitlePress === 'function' && onRightTitlePress();
    }

    const renderDefaultLeftitle = () => {
        console.log("renderDefaultLeftitle")
        return (
            <View style={[ styCom.FlexCenterCenter , styles.icon]}>
                <Image source={require('../../assets/back.png')} style={{ width: '100%' , height: '100%'}}></Image>
            </View>
        )
    }

    const left = typeof leftTitle === 'function' ? leftTitle() : ( typeof leftTitle === 'string' ? <Text style={[ styles.subHeaderTitle ]}>{ leftTitle }</Text> : null );
    const middle = typeof title === 'function' ? title() : ( typeof title === 'string' ? <Text style={[styles.headerTitle ]}>{ title }</Text> : null );
    const right = typeof rightTitle === 'function' ? rightTitle() : ( typeof rightTitle === 'string' ? <Text  style={[ styles.subHeaderTitle ]}>{ rightTitle }</Text> : null );

    console.log("left" , left , typeof leftTitle);
    return (
        <View style={[ styles.header , styCom.FlexBetween , headerStyle ]}>
            <TouchableOpacity onPress={ ()=>{ handleLeftTitlePress() } } style={[ styles.headerLeft , styCom.FlexStartCenter, leftTitleStyle ]}>
                { left } 
            </TouchableOpacity>
            <TouchableOpacity onPress={ ()=>{ handleTitlePress() } } style={[ styles.headerTitle , styCom.FlexCenterCenter , titleStyle ]}>
                { middle }
            </TouchableOpacity>
            <TouchableOpacity onPress={ ()=>{ handleRightTitlePress() } } style={[ styles.headerRight , styCom.FlexEndCenter , rightTitleStyle ]}>
                { right }
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    header:{
        minHeight: scaleSize(90),
        paddingVertical: scaleSize(15),
        paddingHorizontal: scaleSize(20),
        backgroundColor: '#108bf4',
    },

    headerLeft:{
        width: scaleSize(100),
        height: '100%',
        textAlign: 'left',
    },
    headerRight:{
        width: scaleSize(100),
        height: '100%',
        textAlign: 'left',
    },
    headerTitle:{
        color: "#FFFFFF",
        fontWeight: "500",
        fontSize: scaleSize(30)
    },

    subHeaderTitle: {
        color: "#FFFFFF",
        fontSize: scaleSize(24),
    },
    icon: {
        width: scaleSize(50),
        height: scaleSize(50),
        backgroundColor: 'transparent',
        borderRadius: 3,
        paddingHorizontal: scaleSize(8),
        paddingVertical: scaleSize(8),
        // backgroundColor: 'red',
    }
})