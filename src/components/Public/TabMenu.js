import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image, ScrollView
} from 'react-native';

import { scaleSize, deviceWidth, deviceHeight, } from '../../tools/adaptation';//适配屏幕

export default class Tabs extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        // console.log(Platform.OS);
        
    }

    componentWillUnmount() {

    }
    _tabs(id) {
        if (this.props.status == id) { return false; }
        this.props.tab(id);
    }
    render() {
        return (
            <ScrollView horizontal={true}>
                <View style={[styles.content, this.props.style]}>
                    {
                        this.props.tabList.map((item, index) => {
                            return <TouchableOpacity
                                style={[
                                    styles.list,
                                    this.props.width && { width: this.props.width },
                                    // this.props.direction == 'left' && { alignItems: 'flex-start', paddingLeft: scaleSize(20) },
                                    // this.props.direction == 'right' && { alignItems: 'flex-end', paddingRight: scaleSize(20) },
                                ]}
                                activeOpacity={0.8}
                                onPress={() => this._tabs(item.id)}
                                key={index}>
                                <View
                                    style={[
                                        this.props.status == item.id && styles.ActiveList,
                                        this.props.borderShow === true && styles.border,
                                    ]}
                                >
                                   {
                                        item.count !== undefined && item.count > 0 ? <View style={{
                                            backgroundColor: 'rgba(255,0,0,0.8)', paddingTop: scaleSize(2), paddingBottom: scaleSize(2),
                                            paddingLeft: scaleSize(5), paddingRight: scaleSize(10),
                                            borderRadius: scaleSize(20), position: 'absolute', top: -5, right: -10, zIndex: 99999,
                                        }}>
                                            <Text style={{ color: '#fff', fontSize: scaleSize(20) }}> { item.count > 99 ? '99+' : item.count }</Text>
                                        </View> : null
                                    }
                                    <Text style={[styles.txt, this.props.status == item.id && styles.ActiveTxt]}>
                                        {item.name}
                                        {
                                            item.num ?
                                                '(' + item.num + ')'
                                                : null
                                        }
                                    </Text>
                                </View>

                            </TouchableOpacity>
                        })
                    }
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    content: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        // alignItems: 'center',

        justifyContent: 'center',
        // marginBottom:scaleSize(30),
        // width: deviceWidth,

        // borderBottomWidth: scaleSize(2),
        // borderBottomColor: '#f0f0f0',
    },
    list: {
        // justifyContent: 'center', 
        // paddingLeft: scaleSize(30),
        // paddingRight: scaleSize(30),

        marginRight: scaleSize(30),
        alignItems: 'center',
    },
    border: {
        borderRightWidth: scaleSize(1),
        borderRightColor: '#eeeeee',
        paddingLeft: scaleSize(5),
        paddingRight: scaleSize(5),
    },
    ActiveList: {
        borderBottomColor: '#2F83FF',
        borderBottomWidth: 2,
    },
    txt: {
        fontSize: scaleSize(32),
        color: '#81839A'
    },
    ActiveTxt: {
        color: '#333',
        fontWeight: 'bold',
        fontSize: scaleSize(32),
        marginBottom:scaleSize(10)
    }
});