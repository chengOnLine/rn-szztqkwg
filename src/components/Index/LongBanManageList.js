import React, { Component } from 'react'
import {
    Text,
    View,
    Image,
    StyleSheet,
    Dimensions,
    Platform,
    TouchableOpacity
} from 'react-native'
import { deviceWidth, scaleSize, setSpText } from '../../tools/adaptation';//适配屏幕


export default class LongBanManageList extends Component {
    render() {
        let item = this.props.item;
        return (
            <View style={{ marginBottom: scaleSize(20), backgroundColor: '#f3f3f3' }}>
                <TouchableOpacity style={[styles.container1]}
                    activeOpacity={0.9}
                    onPress={() => {
                        this.props.navigation.navigate('LongBanScore', {
                            banId: item.id,
                            ckrId: global.user.info.identity == 9 || global.user.info.identity == 11 ? item.lastckrId : item.ckrId,
                            banCode: item.banCode,
                            lonId: item.lonId,
                            action: item.action,
                            banName: item.name
                        });
                    }}
                >
                    {
                        global.user.info.identity == 9 || global.user.info.identity == 11 ?
                            <View>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ flex: 1, flexDirection: 'row' }}><Text style={[styles.txttitle]}>街道:</Text><Text
                                        style={[styles.txtcontent]}>{item.streetName}</Text></View>
                                    <View style={{ flex: 1, flexDirection: 'row' }}><Text style={[styles.txttitle]}>社区:</Text><Text
                                        style={[styles.txtcontent]}>{item.communityName}</Text></View>
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={[styles.txttitle]}>网格:</Text>
                                    <Text style={[styles.txtcontent]} numberOfLines={1}>{item.gridName}</Text>
                                </View>
                            </View>
                            :
                            null
                    }

                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1, flexDirection: 'row' }}><Text style={[styles.txttitle]}>楼栋长姓名:</Text><Text
                            style={[styles.txtcontent]}>{item.name}</Text></View>
                        <View style={{ flex: 1, flexDirection: 'row' }}><Text style={[styles.txttitle]}>性别:</Text><Text
                            style={[styles.txtcontent]}>{item.sexName}</Text></View>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.txttitle]}>{item.documentTypeName == null || item.documentTypeName == '' ? '身份证' : item.documentTypeName}:</Text><Text style={[styles.txtcontent]}
                            numberOfLines={1}>{item.identificationNumber}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.txttitle]}>联系电话:</Text><Text
                            style={[styles.txtcontent, { color: '#428bca' }]} numberOfLines={1}>{item.tel}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.txttitle]}>户籍地址:</Text><Text
                            style={[styles.txtcontent, { width: deviceWidth - scaleSize(240) }]}
                            numberOfLines={1}>{item.permanentAddress}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.txttitle]}>楼栋编码:</Text><Text style={[styles.txtcontent]}
                            numberOfLines={1}>{item.banCode}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.txttitle]}>楼栋地址:</Text><Text
                            style={[styles.txtcontent, { width: deviceWidth - scaleSize(240) }]} numberOfLines={1}>{item.banaddress}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1, flexDirection: 'row' }}><Text style={[styles.txttitle]}>当前得分:</Text><Text
                            style={[styles.txtcontent, { color: '#428bca' }]}>{item.totalScore}</Text></View>
                        <View style={{ flex: 1, flexDirection: 'row' }}><Text style={[styles.txttitle]}>评分人:</Text><Text
                            style={[styles.txtcontent]}>{item.userName}</Text></View>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.txttitle]}>最后评分时间:</Text><Text style={[styles.txtcontent]}
                            numberOfLines={1}>{item.createTime}</Text>
                    </View>
                    {
                        global.user.info.identity == 9 || global.user.info.identity == 11 ?
                            <View>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ flex: 1, flexDirection: 'row' }}><Text
                                        style={[styles.txttitle]}>督查得分:</Text><Text
                                            style={[styles.txtcontent]}>{item.lastScore}</Text></View>
                                    <View style={{ flex: 1, flexDirection: 'row' }}><Text
                                        style={[styles.txttitle]}>督查员:</Text><Text
                                            style={[styles.txtcontent]}>{item.lastUsername}</Text></View>
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={[styles.txttitle]}>最后督查时间:</Text>
                                    <Text style={[styles.txtcontent]} numberOfLines={1}>{item.lastUpdateTime}</Text>
                                </View>
                            </View>
                            :
                            null
                    }

                    <View style={styles.right}>
                        <Image source={require('../../assets/right.png')} resizeMode="contain"
                            style={[styles.pos]}></Image>
                    </View>
                    {
                        item.isBlacklist == '1' ?
                            <View style={styles.left}>
                                <Image source={require('../../assets/jb2.png')} resizeMode="contain"
                                    style={[styles.pos]}></Image>
                            </View>
                            :
                            item.isEmphasize == "0" ?
                                <View style={styles.left}>
                                    <Image source={require('../../assets/jb3.png')} resizeMode="contain"
                                        style={[styles.pos]}></Image>
                                </View>
                                :
                                item.isEmphasize == "2" ?
                                    null
                                    :
                                    <View style={styles.left}>
                                        <Image source={require('../../assets/jb.png')} resizeMode="contain"
                                            style={[styles.pos]}></Image>
                                    </View>
                    }

                </TouchableOpacity>
                {
                    global.user.info.identity == 9 || global.user.info.identity == 11
                        ?
                        null :
                        <TouchableOpacity style={[styles.container1, { padding: scaleSize(10), paddingLeft: scaleSize(20) }]}
                            activeOpacity={0.9}
                            onPress={() => {
                                this.props.navigation.navigate('LongBanEdit', {
                                    banId: item.id,
                                    ongbanId: item.lonId,
                                    operType: "update",
                                    lonId: item.lonId
                                });
                            }}
                        >
                            <Text>修改资料</Text>
                            <View style={styles.right}>
                                <Image source={require('../../assets/right.png')} resizeMode="contain"
                                    style={[styles.pos]}></Image>
                            </View>
                        </TouchableOpacity>
                }

                {
                    (global.user.info.identity == 9 || global.user.info.identity == 11) && item.lastckrId != null ?
                        <TouchableOpacity
                            style={[styles.container1, {
                                marginTop: scaleSize(5),
                                padding: scaleSize(10),
                                paddingLeft: scaleSize(20)
                            }]}
                            activeOpacity={0.9}
                            onPress={() => {
                                this.props.navigation.navigate('longBanScore', {
                                    banId: item.id,
                                    ckrId: item.lastckrId,
                                    banCode: item.banCode,
                                    lonId: item.lonId,
                                    history: true,
                                });
                            }}
                        >
                            <Text>查看历史得分</Text>
                            <View style={styles.right}>
                                <Image source={require('../../assets/right.png')} resizeMode="contain"
                                    style={[styles.pos]}></Image>
                            </View>
                        </TouchableOpacity>
                        :
                        (global.user.info.identity == 9 || global.user.info.identity == 11) && item.ckrId != null ?
                            <TouchableOpacity
                                style={[styles.container1, {
                                    marginTop: scaleSize(5),
                                    padding: scaleSize(10),
                                    paddingLeft: scaleSize(20)
                                }]}
                                activeOpacity={0.9}
                                onPress={() => {
                                    this.props.navigation.navigate('longBanScore', {
                                        banId: item.id,
                                        ckrId: item.ckrId,
                                        banCode: item.banCode,
                                        lonId: item.lonId,
                                        history: true,
                                    });
                                }}
                            >
                                <Text>查看历史得分</Text>
                                <View style={styles.right}>
                                    <Image source={require('../../assets/right.png')} resizeMode="contain"
                                        style={[styles.pos]}></Image>
                                </View>
                            </TouchableOpacity>
                            :
                            null
                }

            </View>
        )
    }
}

const styles = StyleSheet.create({
    container1: {
        padding: scaleSize(20),
        paddingRight: scaleSize(50),
        backgroundColor: '#fff',
        borderBottomWidth: scaleSize(1),
        borderColor: '#eee'
    },
    txttitle: {
        color: '#5a5a5a',
        lineHeight: scaleSize(48),
        marginRight: scaleSize(5)
    },
    txtcontent: {
        color: '#888',
        lineHeight: scaleSize(48),
        marginRight: scaleSize(20)
    },
    pos: {
        // marginTop:scaleSize(-15),
        width: scaleSize(40),
        height: scaleSize(40)
    },
    right: {
        position: 'absolute',
        top: 0,
        right: scaleSize(20),
        bottom: 0,
        justifyContent: 'center'
    },
    left: {
        position: 'absolute',
        top: scaleSize(20),
        right: scaleSize(20),
        justifyContent: 'center'
    },
    txt: {
        fontSize: scaleSize(30),
        color: '#333',
        marginTop: scaleSize(20),
        marginBottom: scaleSize(15)
    },
})