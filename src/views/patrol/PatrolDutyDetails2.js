import React, { Component } from 'react';
import {
    TouchableOpacity, Modal,
    StatusBar, TextInput,
    View,
    StyleSheet,
    BackHandler, NativeModules,
    Text,
    Platform,
} from 'react-native';
import { deviceWidth, deviceHeight, scaleSize } from '../../tools/adaptation';
import { HttpGet, HttpPost } from '../../request/index'
import SvgUri from 'react-native-svg-uri';
import { Icons } from '../../fonts/fontIcons'
// import { MapView, Marker, Polyline } from 'react-native-amap3d'
import LinesMapView from '../../tools/aMapView'
import { toastShort } from '../../tools/toastUtil';

let self;

export default class PatrolDutyDetails2 extends Component {
    constructor(props) {
        super(props);

        this.state = {
            id: this.props.route.params.id,

            showInfoFlag: true,
            isXunluo: false, //去巡逻操作

            alertShow: false,
            isweifa: true,
            marks: [],
            data: {},

        };
    }
    componentDidMount() {

        this.getPatrolDetails()
    }

    componentWillUnmount() {

    }

    getPatrolDetails() {

        HttpGet('jczl-flow/flow/patrolDetailed/getDetailById', { id: this.state.id }).then((res) => {
            if (res.flag) {

                let marks = [];
                let info=res.data;
 
                let lat = info.latitude == '' ? 0 : info.latitude
                let lng = info.longitude == '' ? 0 : info.longitude

                if (lat > 0 && lng > 0) {
                    marks.push({ latitude: lat, longitude: lng, title: '巡逻点' })
                }
                this.setState({ data: res.data, marks: marks })


            } else {
                toastShort(res.msg, 'bottom');
            }

        }).catch((error) => {
            // console.log(error);
            toastShort(error, 'bottom');//超时会在这里
        })

    }

    _jumpPage = url => {
        // global.navigation.navigate(url);
    };

    toOpenNavMap = () => {
        let marks=this.state.marks;
        console.log(marks)
        //导航唤起三方地图 //String pkgName, String destLat,String destLng  ,
        if (marks.length > 0) {

            NativeModules
                .AMapLocationModule
                .openNavMap("com.autonavi.minimap", marks[0].latitude.toString(), marks[0].longitude.toString());
        } else {

            toastShort('当前无巡逻点', 'bottom');
        }

    };

    showHideBaseInfo = (type) => {
        if (type == 'open') {
            this.setState({ showInfoFlag: true })
        } else {
            this.setState({ showInfoFlag: false })
        }
    }


    rdowfCheck(isCheck) {
        this.setState({ isweifa: isCheck })
    }


    render() {
        self = this;
        
        let marks=this.state.marks;
        let info=this.state.data;

        return (
            <View style={styles.container}>

                <LinesMapView
                    style={styles.mapview}
                    // region={{
                    //   latitude: (39.902136 + 39.832136) / 2,
                    //   longitude: (116.44095 + 116.34095) / 2,
                    //   latitudeDelta: (39.902136 - 39.832136) + 0.1,
                    //   longitudeDelta: (116.44095 - 116.34095) + 0.1
                    // }}
                    // polyline={[
                    //   { latitude: 39.832136, longitude: 116.34095 },
                    //   { latitude: 39.832136, longitude: 116.42095 },
                    //   { latitude: 39.902136, longitude: 116.42095 },
                    //   { latitude: 39.902136, longitude: 116.44095 },
                    // ]}
                    marker={marks}
                />

                {
                    this.state.showInfoFlag ?
                        <View style={{ width: '100%', height: '100%' }}>
                            <View style={styles.infoCon}>

                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => this.showHideBaseInfo('close')}>

                                    <View style={styles.topHide}></View>
                                </TouchableOpacity>

                                <View style={styles.listTitle}>
                                    <Text style={{ color: '#333', fontSize: scaleSize(32), fontWeight: '500' }}>基本信息</Text>
                                </View>

                                <View style={styles.listCon}>

                                    <View style={styles.listItem}>
                                        <View><Text>事件编号：</Text></View>
                                        <View><Text>{info.id}</Text></View>
                                    </View>
                                    <View style={styles.listItem}>
                                        <View><Text>是否巡逻：</Text></View>
                                        <View><Text>{info.patTime == '' ? '未巡逻' : '已巡逻'}</Text></View>
                                    </View>
                                    <View style={styles.listItem}>
                                        <View><Text>所属部门：</Text></View>
                                        <View>
                                            <Text>{info.uploadDeptName}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.listItem}>
                                        <View><Text>事件地址：</Text></View>
                                        <View style={{ flex: 1, }}><Text numberOfLines={2}>{info.eventAddress}</Text></View>
                                    </View>

                                    {/* <View style={styles.listItem}>
                                        <View><Text>任务备注：</Text></View>
                                        <View style={{ flex: 1, }}><Text numberOfLines={2}>{info.taskRemarks}</Text></View>
                                    </View> */}
                                </View>

                                <View style={[styles.listCon, { borderTopColor: '#EDEDED', borderBottomColor: '#EDEDED', borderBottomWidth: 1, borderTopWidth: 1 }]}>
                                    <View style={styles.listItem}>
                                        <View><Text>巡  查  人：</Text></View>
                                        <View><Text>{info.patUserName}</Text></View>
                                    </View>

                                    <View style={styles.listItem}>
                                        <View><Text>巡查时间：</Text></View>
                                        <View><Text>{info.patTime}</Text></View>
                                    </View>
                                    <View style={styles.listItem}>
                                        <View><Text>是否违法：</Text></View>
                                        <View><Text>{info.flag == 0 ? '否' : '是'}</Text></View>
                                    </View>

                                    <View style={styles.listItem}>
                                        <View><Text>巡逻地点：</Text></View>
                                        <View><Text>{info.address}</Text></View>
                                    </View>

                                    <View style={styles.listItem}>
                                        <View><Text>事件描述：</Text></View>
                                        <View style={{ flex: 1, }}><Text numberOfLines={2}>{info.describe}</Text></View>
                                    </View>
                                </View>
                            </View>

                        </View>
                        :
                        <View style={{ width: '100%', height: '100%' }}>
                            <View style={styles.hideBottom}>

                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => this.showHideBaseInfo('open')}>

                                    <View style={styles.topHide}></View>
                                </TouchableOpacity>

                                <View style={styles.listTitle}>
                                    <Text style={{ color: '#333', fontSize: scaleSize(32), fontWeight: '500' }}>基本信息</Text>
                                </View>
                            </View>
                        </View>
                }

                <View style={styles.bottomMenu}>
                    <TouchableOpacity
                        style={[styles.footList]}
                        activeOpacity={0.8}
                        onPress={() => this._jumpPage('HomePage2')}>

                        <SvgUri style={styles.textSearchIcon} width="25" height="25"
                            svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.jibenxinxi}" fill="#2589FF"></path></svg>`} />

                        <Text style={[styles.menutxt, styles.active]}>
                            基本信息
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.footList]}
                        activeOpacity={0.8}
                        onPress={() => this.toOpenNavMap()}>

                        <SvgUri style={styles.textSearchIcon} width="25" height="25"
                            svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.daohang}" fill="#333"></path></svg>`} />
                        <Text style={[styles.menutxt]}>
                            导航
                        </Text>
                    </TouchableOpacity>
                </View>


            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
    },
    mapview: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        zIndex: 80,
        top: 0,
    },

    mainView: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: scaleSize(100),
    },
    bottomMenu: {
        alignItems: 'center',
        height: scaleSize(120),
        justifyContent: 'center',
        flexDirection: 'row',
        width: '100%',
        position: 'absolute',
        bottom: 0,
        left: 0,
        zIndex: 112,
        borderTopColor: '#eee',
        borderTopWidth: 1,
        backgroundColor: '#fff',
        elevation: 10, //阴影边框属性
        padding: 0,
    },

    footList: {
        padding: 0,
        margin: 0,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },

    menutxt: {
        color: '#333',
        fontSize: scaleSize(30),
        lineHeight: scaleSize(40),
    },
    active: {
        color: '#4e8cee',
    },


    topHide: {
        // position: 'absolute',
        // top: 0,
        // zIndex: 110,
        borderRadius: scaleSize(4),
        left: '45%',
        marginTop: scaleSize(15),
        marginBottom: scaleSize(15),
        width: scaleSize(80),
        height: scaleSize(10),
        backgroundColor: '#ddd'
    },
    qxlText: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: scaleSize(30),
        paddingBottom: scaleSize(10),
    },

    xlStatebd: {
        borderWidth: 0.8,
        borderRadius: scaleSize(10),
        paddingTop: scaleSize(2),
        paddingBottom: scaleSize(2),
        paddingLeft: scaleSize(10),
        paddingRight: scaleSize(10),
    },
    xlState: {
        backgroundColor: '#F6FFED',
        borderColor: '#B7EB8F',

    },
    xlState01: {
        backgroundColor: '#FFF1F0',
        borderColor: '#FFA39E',
    },

    infoCon: {
        position: 'absolute',
        top: 150,
        height: '100%',
        width: '100%',
        zIndex: 99,
        backgroundColor: '#fff',
        borderRadius: scaleSize(20),
    },


    hideBottom: {
        position: 'absolute',
        bottom: 50,
        zIndex: 110,
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: scaleSize(20),
    },

    listTitle: {
        borderBottomColor: '#EDEDED',
        borderBottomWidth: 1,
        paddingLeft: scaleSize(20),
        // paddingTop: scaleSize(50),
        paddingBottom: scaleSize(20),
    },

    listCon: {
        padding: scaleSize(20),
    },

    listItem: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        paddingTop: scaleSize(8),
        paddingBottom: scaleSize(8)
    },

    fontText: {
        color: '#666',
        fontSize: scaleSize(23),
        fontWeight: '500'
    }



});
