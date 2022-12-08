/**
 * https://github.com/facebook/react-native
 * @file 二维码扫描
 * this.props.goBack(parmas1,parmas2) 返回方法 参数：parmas1 必填 true or false，parmas2：选填 二维码获取的信息
 * this.props.scanShow 显示隐藏
 */
 import React, { Component } from 'react';
 import {
     AppRegistry,
     StyleSheet,
     ScrollView,
     Text,
     View,
     Platform,
     Image,
     TouchableOpacity
 } from 'react-native';
 
//  import { RNCamera } from 'react-native-camera'
 import {scaleSize,deviceWidth,deviceHeight} from '../../tools/adaptation';//适配屏幕
 
 export default class ScannerCode extends Component {
     constructor(props) {
         super(props);
         this.state = {
             info:''
         }
     }
     //解析数据
     parseData(pdata){
         let ptype = pdata.type;
         let data = pdata.data;
         this.setState({
             info:pdata
         })
         this.props.goBack(false,pdata);
     }
     _scanClose(val,info){
         this.props.goBack(val,info);
     }
     render() {
         let scanArea = null
 
         if(this.props.scanShow){
             scanArea = (
                 <View style={styles.rectangleContainer}>
                     <View style={styles.top}></View>
                     <View style={styles.cneter}>
                         <View style={styles.centerLeft}></View>
                         <View style={styles.rectangle} />
                         <View style={styles.centerLeft}></View>
                     </View>
                     <View style={styles.top}>
                         <Text style={styles.txt}>将二维码聚焦到方框内</Text>
                     </View>
                     <TouchableOpacity
                         style={styles.closeImage}
                         activeOpacity={0.8}
                         onPress={this._scanClose.bind(this)}
                     >
                         <Image style={[styles.closeSize]} resizeMode="cover" source={require('../../assets/close2.png')}></Image>
                     </TouchableOpacity>
                 </View>
             )
             return (
                 <View style={[styles.container,this.props.style]}>
                     {/* <RNCamera
                         onBarCodeRead={this.parseData.bind(this)}
                         onCameraReady={() => {
                             console.log('ready')
                         }}
                         permissionDialogTitle={'Permission to use camera'}
                         permissionDialogMessage={'We need your permission to use your camera phone'}
                         style={styles.camera}
                     >
                         {scanArea}
                     </RNCamera> */}
                 </View>
             );
         }else{
             return null;
         }
 
     }
 }
 
 const styles = StyleSheet.create({
     container:{
         position:'absolute',
         top:0,
         left:0,
         right:0,
         bottom:0,
         zIndex:5
     },
     camera: {
         height: deviceHeight-scaleSize(110),
         width:'100%',
 
     },
     top:{
         width:'100%',
         // height:Platform.OS == 'ios' ? (height-scaleSize(110)-scaleSize(398))/2 : (height-scaleSize(110)-scaleSize(398))/2,
         // backgroundColor:'rgba(0,0,0,0.35)',
         alignItems:'center'
     },
     closeImage:{
         width:'100%',
         marginTop:scaleSize(20),
         // backgroundColor:'rgba(0,0,0,0.35)',
         alignItems:'center'
     },
     closeSize:{
         width:scaleSize(64),
         height:scaleSize(64)
     },
     txt:{
         fontSize:scaleSize(30),
         color:'#999',
         lineHeight:scaleSize(50),
     },
     cneter:{
         width:'100%',
         flexDirection:'row',
         height:scaleSize(400),
     },
     centerLeft:{
         width:(deviceWidth-scaleSize(400))/2,
         // backgroundColor:'rgba(0,0,0,0.35)'
     },
     rectangleContainer: {
         height:'100%',
         width:'100%',
         alignItems: 'center',
         justifyContent: 'center',
         backgroundColor: 'transparent'
     },
     rectangle: {
         height: scaleSize(400),
         width: scaleSize(400),
         borderWidth: 2,
         borderColor: '#ffffff',
         backgroundColor: 'transparent'
     }
 });