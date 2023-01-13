/**
 * 光明查违
 * https://github.com/facebook/react-native
 * @author leo_zhu(563803119@qq.com)
 * @file 拍照或者选择摄像头
 * this.props.cameraClose(params1,params2) 开启关闭事件params1：必填，true or false params2：选填 图片参数
 * this.props.cameraShow 是否启用拍照
 * this.props.set 设置
 * this.props.cameraActive 那个调用的
 * width: 300,height: 400, cropping: true 是否需要剪裁 剪裁长宽
 */
'use strict';
import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    Animated,
    Platform,
    CameraRoll
} from 'react-native';
// import ImagePicker from 'react-native-image-crop-picker';
import SYImagePicker from 'react-native-syan-image-picker'
import {scaleSize} from '../../tools/adaptation';//适配屏幕

let set = {};

export default class CameraSelect extends Component {
    //构造函数
    constructor(props) {
        super(props);
        this.state = {
            info: null,
            bottom: new Animated.Value(scaleSize(-300)),          // 透明度初始值设为0
        };
    }
    _slideShow(){
        let _this = this;
        Animated.timing(                            // 随时间变化而执行的动画类型
            _this.state.bottom,                      // 动画中的变量值
            {
                toValue: 0,  // 透明度最终变为1，即完全不透明
                duration: 400,
            }
        ).start();
    }
    _slideHide(){
        let _this = this;
        Animated.timing(
            _this.state.bottom,
            {
                toValue: scaleSize(-300),
                duration: 200,
            }
        ).start();
    }
    // 打开本地文件
    _openLoacalFile(){
        /*
        * old model
        */
        // let _this = this;
        // // console.log(set)
        // ImagePicker.openPicker({
        //     compressImageQuality:0.3,
        //     includeBase64:true,
        //     ...set,
        // }).then(image => {
        //     _this._cameraClose(false,'',image)
        //     // console.log(image);
        // }).catch(function(error) {
        //     // _this._cameraClose(false)
        // });

        /*
        * new model
        */
        let _this = this;
        SYImagePicker.asyncShowImagePicker({imageCount: this.props.set!=undefined&&this.props.set.multiple?9:1, enableBase64: true,isCrop:false})
            .then(photos => {
                console.log(photos);
                const image = photos.map(v=>{
                    return {
                        data:v.base64.replace('data:image/jpeg;base64,', '').replace('data:image/png;base64,', ''),
                        path:v.uri,
                    }
                });
                // 选择成功
                _this._cameraClose(false,'',this.props.set!=undefined&&this.props.set.multiple?image:image[0])
                    // console.log(image);
            })
            .catch(err => {
                // _this._cameraClose(false)
            })
    }
    // 打开相机
    _openCamera(){
        /*
        * old model
        */

        // let _this = this;
        // ImagePicker.openCamera({
        //     ...set,
        //     includeBase64:true,
        //     compressImageQuality:0.3,
        // }).then(image => {
        //     // console.log(image);
        //     if(set.multiple === true){
        //         if(Array.isArray(image)){
        //             _this.saveImg(image[0].path);
        //         }else{
        //             _this.saveImg(image.path);
        //         }
        //     }else{
        //         _this.saveImg(image.path);
        //     }
        //
        //     _this._cameraClose(false,'',image)
        //
        // }).catch(function(error) {
        //     console.log(error)
        //     // _this._cameraClose(false)
        // });

        /*
        * new model
        */
        let _this = this;
        SYImagePicker.openCamera({isCrop:false, showCropCircle: true, showCropFrame: false, enableBase64: true}, (err, photos) => {
            console.log(err, photos);
            if (!err) {
                // this.setState({
                //     photos: [...this.state.photos, ...photos]
                // })

                // console.log(image);
                if(Array.isArray(photos)){
                    _this.saveImg(photos[0].uri);
                }else{
                    _this.saveImg(photos.uri);
                }

                const image = photos.map(v=>{
                    return {
                        data:v.base64.replace('data:image/jpeg;base64,', '').replace('data:image/png;base64,', ''),
                        path:v.uri,
                    }
                });

                _this._cameraClose(false,'',this.props.set!=undefined&&this.props.set.cropping?image[0]:image)

            }else{
                console.log(err)
                // _this._cameraClose(false)
            }
        })

    }
    saveImg(img) {
        let promise = CameraRoll.saveToCameraRoll(img);
        promise.then(function(result) {
            //toastShort('图片保存成功！','bottom')
        }).catch(function(error) {
            //alert('图片保存失败！\n' + error);
        });
    }
    // 关闭事件
    _cameraClose(val,type,info){
        this.props.cameraClose(val,type,info)
    }
    render() {
        set = this.props.set;
        if(this.props.cameraShow){
            this._slideShow();
        }else{
            this._slideHide()
        }
        return (
            <View style={[{height:0,position:'absolute',bottom:scaleSize(-40),left:0,width:'100%',},this.props.cameraShow && {height:'100%',position:'absolute',bottom:0,top:0,zIndex:100,}]}>
                <TouchableOpacity style={styles.bg}
                                  onPress={() => this._cameraClose(false)}>
                </TouchableOpacity>

                <Animated.View                            // 可动画化的视图组件
                    style={[styles.container,{
                        bottom: this.state.bottom,          // 将透明度指定为动画变量值
                    }]}
                >
                    <View style={styles.content}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.btn,styles.square,{height:scaleSize(80),marginBottom:scaleSize(20)}]}
                            onPress={() => this._openCamera()}
                        >
                            <Text style={[styles.txt,styles.defaultTxt]}>拍照</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.btn,styles.square,{height:scaleSize(80),marginBottom:scaleSize(20)}]}
                            onPress={() => this._openLoacalFile()}
                        >
                            <Text style={[styles.txt,styles.defaultTxt]}>本地相片</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.btn,styles.square,{height:scaleSize(70),backgroundColor:'#fff'}]}
                            onPress={() => this._cameraClose(false)}
                        >
                            <Text style={[styles.txt,styles.defaultTxt,{color:'#488CBF'}]}>取消</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        );
    }

}

const styles = StyleSheet.create({
    bg:{
        position:'absolute',
        top:0,
        left:0,
        bottom:0,
        right:0,
    },
    container: {

        position:'absolute',
        left:0,
        right:0,
        bottom:0,
        backgroundColor:'rgba(0,0,0,0.3)',
        padding:scaleSize(30)
    },
    content:{
        justifyContent:'center',
        alignItems:'center',
        width:'100%'
    },
    btn:{
        width:'100%',
        height:scaleSize(90),
        justifyContent:'center',
        alignItems:'center',
        borderRadius:scaleSize(40),
    },
    txt:{
        fontSize:scaleSize(30),
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
    }
});