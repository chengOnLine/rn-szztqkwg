import React, { Component } from 'react';
import {
    StyleSheet,
} from 'react-native';

import { scaleSize, deviceHeight } from '../tools/adaptation';//适配屏幕

const styCom = StyleSheet.create({
    Box: { width: '100%', height: '100%', backgroundColor: '#f5f5f5', },
    //布局
    CenterCenter: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', },
    FlexCenterColumn: { flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
    FlexBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', },
    
    FlexBetweenWrap: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center',flexWrap:'wrap' },

    BoxGary: { backgroundColor: '#eee' },
    BoxPadding: { backgroundColor: '#ffffff', paddingLeft: scaleSize(30), paddingRight: scaleSize(30), paddingTop: scaleSize(10), paddingBottom: scaleSize(30) },
    Box30: { padding: scaleSize(30) },
    //背景颜色
    BgGreen: { backgroundColor: '#84DD15' },
    BgYellow: { backgroundColor: '#F1D800' },
    BgBlue: { backgroundColor: '#5CB2FF' },
    BgOrange: { backgroundColor: '#ee0000' },
    //字体
    Font24: { fontSize: scaleSize(24) },
    Font28: { fontSize: scaleSize(28) },
    Font32: { fontSize: scaleSize(32) },
    Font36: { fontSize: scaleSize(36) },
    Font40: { fontSize: scaleSize(40) },
    Font48: { fontSize: scaleSize(48) },
    Font56: { fontSize: scaleSize(56) },
    ColorBlue: { color: '#3B6EFF' },
    ColorRed: { color: '#e22a2a' },
    ColorGreen: { color: '#3db20f' },
    ColorWhite: { color: '#fff' },
    ColorOrange: { color: '#e97300' },
    //margin
    MarginT20: { marginTop: scaleSize(20) },
    MarginL20: { marginLeft: scaleSize(20) },
    MarginB20: { marginBottom: scaleSize(20) },
    MarginR20: { marginRight: scaleSize(20) },
    MarginT30: { marginTop: scaleSize(30) },
    MarginL30: { marginLeft: scaleSize(30) },
    MarginB30: { marginBottom: scaleSize(30) },
    MarginR30: { marginRight: scaleSize(30) },
    //border
    BorderRight: { borderRightWidth: scaleSize(1), borderStyle: 'solid', borderRightColor: '#eee' },
    BorderTop: { borderTopWidth: scaleSize(1), borderStyle: 'solid', borderTopColor: '#eee' },
    BorderLeft: { borderLeftWidth: scaleSize(1), borderStyle: 'solid', borderLeftColor: '#eee' },
    BorderBottom: { borderBottomWidth: scaleSize(1), borderStyle: 'solid', borderBottomColor: '#eee' },
    //heightLine文字
    TextHeight80: { height: scaleSize(80), lineHeight: scaleSize(80) },
    TextHeight100: { height: scaleSize(100), lineHeight: scaleSize(100) },
    TextHeight120: { height: scaleSize(120), lineHeight: scaleSize(120) },
    //按钮
    Btn: { width: '100%', height: scaleSize(100), justifyContent: 'center', alignItems: 'center', borderRadius: scaleSize(5) },
    BtnBlue: { backgroundColor: '#498bbf' },
    BtnGreen: { backgroundColor: '#27b306' },
    BtnGary: { backgroundColor: '#999', color: '#fff', fontSize: scaleSize(32) },
    BtnWhite: { backgroundColor: '#fff', color: '#3B6EFF', fontSize: scaleSize(32) },

    ListUserIcon: { width: scaleSize(48), height: scaleSize(44), marginTop: scaleSize(38), marginLeft: scaleSize(30) },
    ListUserText: { position: 'absolute', top: scaleSize(40), left: scaleSize(100), fontSize: scaleSize(32) },
    //文字列表-flex
    TextList: {
        width: '100%', paddingTop: scaleSize(20), paddingBottom: scaleSize(20), flexDirection: 'row', justifyContent: 'flex-start',
        borderStyle: 'solid', borderBottomColor: '#eee', borderBottomWidth: scaleSize(1),
    },
    TextListLeft: { width: '28%', lineHeight: scaleSize(60) },
    TextListRight: { lineHeight: scaleSize(60) },
    //tab 切换
    TabBox: {
        flexDirection: 'row', justifyContent: 'center', width: '100%', height: scaleSize(100), backgroundColor: '#fff',
        borderBottomWidth: scaleSize(1), borderStyle: 'solid', borderBottomColor: '#eee'
    },
    TabMenu: {
        width: '50%', height: scaleSize(100), justifyContent: 'center', alignItems: 'center',
    },
    TabMenu33: {
        width: '33.33%', height: scaleSize(100), justifyContent: 'center', alignItems: 'center',
    },
    TabMenuOn: {
        width: '80%', height: scaleSize(100), lineHeight: scaleSize(100), textAlign: 'center',
        color: '#2979ff', borderBottomWidth: scaleSize(2), borderStyle: 'solid', borderBottomColor: '#2979ff'
    },
    //标签栏
    BoxTopTitle: {
        width: '100%', height: scaleSize(100), backgroundColor: '#2979ff', flexDirection: 'row',
        justifyContent: 'center', alignItems: 'center', justifyContent: 'space-between'
    },
    BoxTopText: { height: scaleSize(100), justifyContent: 'center', alignItems: 'center', fontSize: scaleSize(46) },
    BoxTopBack: { width: scaleSize(60), height: scaleSize(60), marginLeft: scaleSize(30) },
    BoxTopRight: { minWidth: scaleSize(60), fontSize: scaleSize(32), marginRight: scaleSize(30), color: '#fff' },
    //导航栏
    BoxNav: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', height: scaleSize(120), backgroundColor: '#fff', borderTopWidth: scaleSize(1), borderStyle: 'solid', borderTopColor: '#eee', },
    NavList: { width: '25%', justifyContent: 'center', alignItems: 'center' },
    NavIcon: { width: scaleSize(48), height: scaleSize(44), marginBottom: scaleSize(5) },

    footerTip: {
        paddingTop: scaleSize(20),
        paddingBottom: scaleSize(30),
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyContent: {
        height: deviceHeight-200,
        // backgroundColor: '#ff1493',
        justifyContent: 'center',
        alignItems: 'center'
    },
    empty: {
        fontSize: scaleSize(24),
        color: '#999'
    },
    arrowdown:{
        width:scaleSize(22),
        height:scaleSize(11),
        top:scaleSize(22),
        right:scaleSize(15),
    },
    posAb:{
        position:'absolute',
    },

});

export default styCom;
