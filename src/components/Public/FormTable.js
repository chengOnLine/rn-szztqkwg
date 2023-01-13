/**
 * @file 表格统一格式--左右分布
 * this.props.name 左侧表单名字
 * this.props.must 是否必填
 * this.props.children 右侧内容
 * this.props.tip 详细说明
 * this.props.style 样式
 */
import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

import {scaleSize} from '../../tools/adaptation';//适配屏幕

export  default class FormTable extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={[styles.container,this.props.style]}>
                <View style={[styles.content,this.props.leftstyle && {alignItems:'flex-start'}]}>
                    <View style={[styles.left,this.props.leftstyle && {paddingTop:scaleSize(15)},this.props.left]}>

                        <Text style={[styles.leftTxt,this.props.lefttxtstyle]}>
                            {
                                this.props.must === true ?
                                    <Text style={styles.must}>*</Text>
                                    : null
                            }
                            {this.props.name}</Text>
                    </View>
                    <View style={[styles.right,this.props.right]}>
                        {this.props.children}
                    </View>
                </View>
                {
                    this.props.tip ?
                        <View style={[styles.content]}>
                            <View style={styles.left}>

                            </View>
                            <View style={styles.right}>
                                <Text style={styles.tipTxt}>{this.props.tip}</Text>
                            </View>
                        </View>
                        : null
                }

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container:{
        marginBottom:scaleSize(20)
    },
    content:{
        flexDirection:'row',
        alignItems:'center',
        // height:'100%'
    },
    left:{
        // flex:1,
        width:'20%',
        flexDirection:'row',
        justifyContent:'flex-end',
        // paddingTop:scaleSize(10)
        // height:scaleSize(60),
        // alignItems:'center'
    },
    right:{
        // flex:5,
        width:'80%',
        paddingLeft:scaleSize(10)
    },
    must:{
        color:'#FF0000',
        fontSize:scaleSize(22),
        textAlign:'right',
    },
    leftTxt:{
        color:'#666666',
        lineHeight:scaleSize(30),
        fontSize:scaleSize(24),
        textAlign:'right',
        backgroundColor:'transparent'
    },
    tipTxt:{
        color:'#b1b1b1',
        fontSize:scaleSize(20),
        lineHeight:scaleSize(30),
    }
});