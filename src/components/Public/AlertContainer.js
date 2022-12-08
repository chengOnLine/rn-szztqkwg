/**
 * this.props.children 中间内容
 * this.props.title 顶部title
 * this.props.style 设置弹出框样式
 * this.props.btnTxt 设置确定按钮
 * this.props.status 确定按钮样式
 * this.props.submit() 确定方法
 * this.props.close() 弹出框显示隐藏 参数：1 打开 ， 0 关闭
 * this.props.alertShow 弹出框显示隐藏
 */
import React, { Component } from 'react';
import ReactNative from 'react-native';
import {
    StyleSheet,
    Text,
    ScrollView,
    View,
    Image,
    TouchableOpacity,
    Modal
} from 'react-native';
import SvgUri from 'react-native-svg-uri';
import { Icons } from '../../fonts/fontIcons'
import Button from './Button';//Button模块

import { scaleSize } from '../../tools/adaptation';//适配屏幕



export default class AlertContainer extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {

    }
    componentWillUnmount() {

    }
    _onSubmit() {

        this.props.submit();
    }
    _close(val) {
        this.props.close(val);
    }
    render() {
        return (
            <Modal
                animationType={"fade"}
                transparent={true}
                visible={this.props.alertShow}
                onRequestClose={() => { console.log("Modal has been closed.") }}
            >
                <View style={styles.container}>
                    <View style={[styles.content, this.props.style]}>
                        <View style={styles.top}>
                            <Text style={styles.topTxt}>{this.props.title}</Text>

                            {this.props.iscolse == false ?
                                null :
                                <TouchableOpacity
                                    style={styles.closeContetn}
                                    activeOpacity={1}
                                    onPress={() => this._close(false)}>
                                    {/* 关闭 */}
                                    <SvgUri style={styles.textSearchIcon} width="15" height="15"
                                        svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.close}" fill="#BEBEBE"></path></svg>`} />

                                </TouchableOpacity>
                            }
                        </View>
                        {
                            this.props.isScrolling === false ?
                                <View style={[styles.center,]}>
                                    {this.props.children}
                                </View>
                                :
                                <ScrollView style={[styles.center, { maxHeight: scaleSize(700) }]}>
                                    {this.props.children}
                                </ScrollView>
                        }
                        {/*<View style={styles.bottom}>*/}
                        <View style={[styles.bottom,]}>

                            {
                                this.props.isCancelShow === false ?
                                    null
                                    :
                                    <Button
                                        title={this.props.cancelTxt}
                                        style={{
                                            borderColor: '#E5E5E5',
                                            backgroundColor: '#fff',
                                            borderWidth: 0.8,
                                            width: '45%',
                                            marginRight:scaleSize(50)
                                        }}
                                        onPress={() => this._close(false)} />
                            }

                            {
                                this.props.isOkShow === false ?
                                    null
                                    :
                                    <Button
                                        type={'square'}
                                        style={{ height: scaleSize(60), backgroundColor: '#2589FF', width: '45%' }}
                                        title={this.props.btnTxt}
                                        onPress={() => this._onSubmit()} />
                            }

                            {
                                this.props.isOtherShow === true ?
                                    <Button
                                        style={{ height: scaleSize(60), backgroundColor: '#ffa200', marginTop: scaleSize(5), width: '40%' }}
                                        title={this.props.otherTitle}
                                        onPress={() => this.props.otherAction()} />
                                    :
                                    null
                            }
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },

    bottom: {
        flexDirection: 'row',
        alignItems: 'center',
        
        justifyContent: 'center',
        borderTopWidth: 1,
        borderTopColor: '#EDEDED',
        paddingTop:scaleSize(40),
        padding: scaleSize(20),
        
    },


    content: {
        width: '60%',
        backgroundColor: '#fff',
        padding: scaleSize(20),
        // borderRadius: scaleSize(10),
    },
    top: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: scaleSize(20),
        borderBottomColor: '#ccc',
        borderBottomWidth: scaleSize(1),
    },
    topTxt: {
        color: '#666',
        //fontSize:scaleSize(24),
        fontSize: scaleSize(30),
        flex: 1
    },
    closeContetn: {
        flex: 1,
        alignItems: 'flex-end'
    },
    close: {
        width: scaleSize(30),
        height: scaleSize(30),
    },
    center: {
        marginTop: scaleSize(20),
        marginBottom: scaleSize(20),
    }
});