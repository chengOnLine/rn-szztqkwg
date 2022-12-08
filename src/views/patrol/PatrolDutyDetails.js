import React, { Component } from 'react';
import {
    TouchableOpacity, Modal,
    StatusBar, TextInput,
    View, NativeModules, DeviceEventEmitter,
    StyleSheet,
    BackHandler,
    Text,
    Platform,
} from 'react-native';
import { deviceWidth, deviceHeight, scaleSize } from '../../tools/adaptation';
import { HttpGet, HttpPost } from '../../request/index'
import SvgUri from 'react-native-svg-uri';
import { Icons } from '../../fonts/fontIcons'
import AlertContainer from '../../components/Public/AlertContainer';
// import { MapView, Marker, Polyline } from 'react-native-amap3d'
import LinesMapView from '../../tools/aMapView'
import { toastShort } from '../../tools/toastUtil';
import { getLocation } from "../../tools/AmapLocation";

let self;
export default class PatrolDutyDetails extends Component {
    constructor(props) {
        super(props);

        this.state = {
            id: this.props.route.params.id,
            detailedId: this.props.route.params.detailedId, //巡逻
            taskId: this.props.route.params.taskId,
            eventStatus: this.props.route.params.eventStatus,

            pNumber: this.props.route.params.pNumber,

            showInfoFlag: true,
            isXunluo: false, //去巡逻操作

            alertShow: false,
            isweifa: true,
            patrolAddress: '',
            describe: '',
            latitude: 0,
            longitude: 0,

            marks: [],
            data: {},
            patrolMarkLat:25.123456,
            patrolMarkLng:113.123456,

        };
    }
    componentDidMount() {
        this.getPatrolDetails()
    }

    componentWillUnmount() {

    }

    getPatrolDetails() {

        HttpGet('qkwg-flow/flow/patrolEvent/getDetailById', { id: this.state.id }).then((res) => {
            if (res.flag) {

                let marks = [];

                let data = res.data;
                marks.push({ latitude: data.lat, longitude: data.lng })

                this.setState({ data: res.data, marks,patrolMarkLat:data.lat,patrolMarkLng:data.lng });

            } else {
                toastShort(res.msg, 'bottom');
            }

        }).catch((error) => {
            // console.log(error);
            toastShort(error, 'bottom');//超时会在这里
        })

    }

    setPatrolStatus() {
        let params = {
            address: this.state.patrolAddress,
            id: this.state.detailedId,
            flag: this.state.isweifa ? 1 : 0,
            describe: this.state.describe,
            latitude: this.state.latitude,
            longitude: this.state.longitude,
        }

        HttpPost('qkwg-flow/flow/patrolDetailed/update', params, 'json').then(res => {
            if (res.flag) {

                toastShort('操作成功');
                self._close(false);

                DeviceEventEmitter.emit('PatrolDutyList');

                this.props.navigation.goBack();

            } else {
                toastShort('操作失败')
            }
        })
    }


    toOpenNavMap = () => {
        let marks = this.state.marks;

        //导航唤起三方地图 //String pkgName, String destLat,String destLng  ,
        if (marks.length > 0) {

            NativeModules
                .AMapLocationModule
                .openNavMap("com.autonavi.minimap", marks[0].latitude.toString(), marks[0].longitude.toString());
        } else {

            toastShort('当前无巡逻点', 'bottom');
        }
    };

    _jumpPage = url => {
        // global.navigation.navigate(url);
    };

    showHideBaseInfo = (type) => {
        if (type == 'open') {
            this.setState({ showInfoFlag: true })
        } else {
            this.setState({ showInfoFlag: false })
        }
    }

    // 弹框确定
    _alertOk = () => {
        this.setPatrolStatus();
    }

    // 弹出框显示隐藏
    _close(val) {
        this.setState({
            alertShow: val
        })
    }

    open() {
        this.refAddress();

        this.setState({
            alertShow: true
        })
    }
    rdowfCheck(isCheck) {
        this.setState({ isweifa: isCheck })
    }

    refAddress() {

        toastShort('正在获取位置信息...');
        getLocation().then((res) => {
            if (res.code == 0) {

                self.setState({
                    patrolAddress: res.data.address,
                    latitude: res.data.coords.latwgs84,
                    longitude: res.data.coords.lonwgs84,
                })
            }
        }).catch((e) => {
            toastShort('获取位置信息失败');
        })
    }


    render() {
        self = this;

        let info = this.state.data;

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
                    marker={[
                        { latitude: this.state.patrolMarkLat, longitude: this.state.patrolMarkLng, title: '巡查点' },
                    ]}
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

                                    <View style={[styles.listItem,]}>
                                        <View><Text>巡查次数：</Text></View>
                                        <View><Text>{this.state.pNumber}次</Text></View>

                                        <TouchableOpacity
                                            activeOpacity={1}
                                            onPress={() => { this.props.navigation.navigate('PatrolDutyedList', { id: info.eventId, taskId: this.state.taskId }) }}>

                                            <Text style={{ color: '#2589FF', marginLeft: scaleSize(10) }}>查看</Text>

                                            <SvgUri style={styles.textMeorIcon} width="10" height="10"
                                                svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.youjiantou}" fill="#2589FF"></path></svg>`} />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.listItem}>
                                        <View><Text>所属部门：</Text></View>
                                        <View>
                                            <Text>{info.uploadDeptName}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.listItem}>
                                        <View><Text>事件地址：</Text></View>
                                        <View style={{ flex: 1, }}><Text numberOfLines={2}>{info.address}</Text></View>
                                    </View>

                                    {/* <View style={styles.listItem}>
                                        <View><Text>任务备注：</Text></View>
                                        <View style={{ flex: 1, }}><Text numberOfLines={2}>{info.taskRemarks}</Text></View>
                                    </View> */}
                                </View>

                                {
                                    this.state.eventStatus == 1 ?
                                        <TouchableOpacity
                                            style={styles.qxlText}
                                            activeOpacity={1}
                                            onPress={() => { this.open() }}>

                                            <Text style={{ color: '#2589FF', fontSize: scaleSize(32), marginRight: scaleSize(10) }}>去巡逻</Text>

                                            <SvgUri style={styles.textSearchIcon} width="15" height="15"
                                                svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.youjiantou}" fill="#2589FF"></path></svg>`} />
                                        </TouchableOpacity> : null
                                }

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

                <AlertContainer
                    alertShow={this.state.alertShow}
                    isOkShow={true}
                    submit={this._alertOk}
                    isCancelShow={true}
                    isScrolling={false}
                    close={
                        this._close.bind(this)
                    }
                    cancelTxt="取消"
                    btnTxt="确定"
                    title={this.state.title}
                    style={{
                        width: '100%',
                        borderTopRightRadius: scaleSize(10),
                        borderTopLeftRadius: scaleSize(10),
                        position: 'absolute',
                        bottom: 0
                    }}>

                    <View style={styles.listCon}>

                        <View style={styles.listItem}>
                            <View><Text>巡逻地点：</Text></View>
                            <View style={{ flex: 1, }}><Text numberOfLines={2}>{this.state.patrolAddress}</Text></View>

                            <TouchableOpacity
                                style={styles.closeContetn}
                                activeOpacity={1}
                                onPress={() => this.refAddress()}>

                                <SvgUri style={styles.textSearchIcon} width="20" height="20"
                                    svgXmlData={`<svg  viewBox="0 0 1024 1024">
                                            <path d="${Icons.shuaxin01}" fill="#2589FF"/>
                                            <path d="${Icons.shuaxin02}" fill="#2589FF"/>
                                            <path d="${Icons.shuaxin03}" fill="#2589FF"/>
                                            <path d="${Icons.shuaxin04}" fill="#2589FF"/></svg>`} />
                            </TouchableOpacity>

                        </View>

                        <View style={styles.listItem}>
                            <View><Text>是否违法：</Text></View>

                            <TouchableOpacity
                                style={{ width: 80, flexDirection: 'row' }}
                                activeOpacity={1}
                                onPress={() => this.rdowfCheck(true)}>

                                {
                                    this.state.isweifa ? <SvgUri style={styles.textSearchIcon} width="20" height="20"
                                        svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.rdoChecked}" fill="#2589FF"/></svg>`} />
                                        :
                                        <SvgUri style={styles.textSearchIcon} width="20" height="20"
                                            svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.rdoNoCheck}" fill="#2589FF"/></svg>`} />
                                }

                                <Text style={{ marginLeft: scaleSize(5) }}>是</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{ width: 80, flexDirection: 'row' }}
                                activeOpacity={1}
                                onPress={() => this.rdowfCheck(false)}>

                                {
                                    this.state.isweifa ?
                                        <SvgUri style={styles.textSearchIcon} width="20" height="20"
                                            svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.rdoNoCheck}" fill="#2589FF"/></svg>`} />
                                        :
                                        <SvgUri style={styles.textSearchIcon} width="20" height="20"
                                            svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.rdoChecked}" fill="#2589FF"/></svg>`} />
                                }

                                <Text style={{ marginLeft: scaleSize(5) }}>否</Text>
                            </TouchableOpacity>

                        </View>
                        <View style={[styles.listItem, { alignItems: 'center' }]}>
                            <View><Text>事件描述：</Text></View>
                            <View><TextInput
                                onChangeText={(val) => this.setState({ describe: val })}
                                keyboardType={"default"}
                                underlineColorAndroid="transparent"
                                placeholderTextColor="#cccccc"
                                placeholder="请输入事件描述"
                                multiline={true}
                                blurOnSubmit={true}
                            /></View>
                        </View>

                    </View>

                </AlertContainer>

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
        left: '45%',
        borderRadius: scaleSize(4),
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
        top: 280,
        height: '100%',
        width: '100%',
        zIndex: 110,
        backgroundColor: '#fff',
        borderRadius: scaleSize(20),
    },
    textMeorIcon: {
        position: 'absolute',
        top: 5, left: 35,
        zIndex: 110
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
