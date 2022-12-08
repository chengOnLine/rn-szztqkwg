/**
 * type: default 默认蓝底白字，hollow白底蓝字蓝边，disabled灰底白字，hollowGray白底灰字灰边
 * this.props.style  按钮样式
 * this.props.styleFs 按钮字体样式
 * this.props.onPress 点击事件
 * this.props.title 按钮文字
 */
 import React, { Component } from 'react';
 import {
     StyleSheet,
     Text,
     View,
     TouchableOpacity
 } from 'react-native';
 
 import {scaleSize,setSpText} from '../../tools/adaptation';//适配屏幕
 
 export  default class Button extends Component {
     constructor(props) {
         super(props);
 
     }
 
     componentDidMount() {
 
     }
     
     componentWillUnmount() {
 
     }
     render() {
         return (
             <TouchableOpacity
                 activeOpacity={0.8}
                 style={[
                     styles.btn,
                     this.props.type == 'default' && styles.default,
                     this.props.style,
                 ]}
                 onPress={this.props.onPress}
             >
                 <Text style={[
                     styles.txt,this.props.type == 'default' && styles.defaultTxt,
                     this.props.type == 'square' && styles.defaultTxt,
                     this.props.styleFs
                 ]}>{this.props.title}</Text>
             </TouchableOpacity>
         );
     }
 }
 
 const styles = StyleSheet.create({
     btn:{
         width:'100%',
         height:scaleSize(70),
         justifyContent:'center',
         alignItems:'center',
         borderRadius:scaleSize(40),
     },
     txt:{
         fontSize:scaleSize(26),
     },
     default:{
         backgroundColor:'#488CBF'
     },
     square:{
         backgroundColor:'#488CBF',
         borderRadius:scaleSize(5),
     },
     defaultTxt:{
         color:'#fff'
     },
     hollow:{
         borderRadius:scaleSize(10),
         backgroundColor:'#fff'
     },
     hollowTxt:{
         color:'#488CBF'
     },
     disabled:{
         backgroundColor:'#ccc',
         borderRadius:scaleSize(5),
     },
     disabledTxt:{
         color:'#fff'
     },
     hollowGray:{
         borderWidth:scaleSize(1),
         borderColor:'#ccc',
         borderRadius:scaleSize(5),
     },
     hollowGrayTxt:{
         color:'#666'
     },

     qxiaoBtn:{
         borderColor:'#ccc',
         backgroundColor:'#fff',
         borderWidth:0.8,
         borderRadius:scaleSize(12)
     }
 });