import React, { Component } from 'react';
import {
    Image, View, StyleSheet, BackHandler,
    Button, Alert, Text, FlatList, Modal,
    Platform, NativeModules, StatusBar, ScrollView, TouchableOpacity, DeviceEventEmitter, PermissionsAndroid
} from 'react-native';

import { deviceWidth, deviceHeight, scaleSize } from '../../tools/adaptation';
import Head from '../../components/Public/Head';
import Bottom from '../../components/Public/TabBottom';
import Tabs from '../../components/Public/TabMenu';
import Swiper from 'react-native-swiper';
import styCom from '../../styles/index'

import { HttpGet, HttpPost } from '../../request/index'
import { toastShort } from '../../tools/toastUtil';
import SvgUri from 'react-native-svg-uri';
import { Icons } from '../../fonts/fontIcons'
import { storageGet } from '../../storage/index'


let n, self, backNum = 0;

export default class HomePage2 extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isPermis: false,
            isHide: false,
            scanShow: false,

            staFlage: true,
            StatusBarFtColor: 'light-content',
            StatusBarBgColor: 'transparent',
            StatusBarTranslucent: true,  //状态栏是否隐藏

            userMeunList: [],
            meunId: 0,

            myTaskMeunList: [],
            otherMuenList: [],
            eventMuenList: [],


            bannerIndex: 0,
            bannerList: [],
            msgCount: 0,
            findMsgList: [],

            activeId: 1,
            tabList: [
                {
                    id: '1',
                    name: '视频'
                },
                {
                    id: '3',
                    name: '动态'
                },
                {
                    id: '2',
                    name: '文件文件'
                },
                {
                    id: '4',
                    name: '小测小测试试'
                },
            ],
            data: [],

        };
    }

    componentDidMount() {
        global.routeName = 'HomePage2'

        //收到监听
        this.listener = DeviceEventEmitter.addListener('backHome', () => {
            console.log('backHome', global.routeName);
            this.setTopBarStatus();
        })

        this.unsubscribe = this.props.navigation.addListener('tabPress', e => {

            if (global.routeName == 'HomePage2') { return; }
            global.routeName = 'HomePage2';

            console.log('tabPress--1', global.routeName);
            this.setTopBarStatus();

        });


        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
        }

        this.getBannerList();

        this.getMenuList();

        this.getMessage();

        storageGet("userInfo").then(res => {
            console.log(JSON.stringify(res))
        })

        global.navigation = this.props.navigation;
        console.log('requestApi: ' + global.requestApi);

    }


    componentWillUnmount() {

        if (Platform.OS === 'android') {
            BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
        }
        this.unsubscribe();
    }


    setTopBarStatus() {

        this.setState({ staFlage: false })

        setTimeout(() => {
            let BarBgColor = "", BarBgFont = ""

            if (global.routeName == "MyIndex") {
                BarBgColor = '#2589FF'
                BarBgFont = 'light-content'

            } else if (global.routeName == "NewsIndex" || global.routeName == "PatrolDaily") {
                BarBgColor = '#FFF'
                BarBgFont = 'dark-content'

            } else {
                BarBgFont = 'light-content'
                BarBgColor = 'transparent'
            }

            this.setState({
                StatusBarTranslucent: true,
                StatusBarBgColor: BarBgColor,
                StatusBarFtColor: BarBgFont,
                staFlage: true
            })
        }, 10);
    }


    //动态申请系统权限
    async requestMultiplePermission() {
        let perCount = 0;
        try {
            const permissions = [
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                PermissionsAndroid.PERMISSIONS.CAMERA
            ]

            //返回得是对象类型
            const granteds = await PermissionsAndroid.requestMultiple(permissions)
            var data = "是否同意地址权限: "
            if (granteds["android.permission.ACCESS_FINE_LOCATION"] === "granted" || granteds["android.permission.ACCESS_COARSE_LOCATION"] === "granted") {
                data = data + "是\n"
                perCount++
            } else {
                data = data + "否\n"
            }
   
            data = data + "是否同意相机权限: "
            if (granteds["android.permission.CAMERA"] === "granted") {
                data = data + "是\n"
                perCount++
            } else {
                data = data + "否\n"
            }

            data = data + "是否同意存储权限: "
            if (granteds["android.permission.WRITE_EXTERNAL_STORAGE"] === "granted") {
                data = data + "是\n"
                perCount++
            } else {
                data = data + "否\n"
            }
            console.log(data);

            if (perCount == permissions.length) {
                this.state.isPermis = true;
            }

        } catch (err) {
            toastShort(err.toString())
        }
    }

    onBackAndroid = () => {
        console.log('onBackAndroid', global.routeName)

        if (global.routeName == 'HomePage2') {
            Alert.alert(
                '退出提示',
                '是否要退出基层治理APP？',
                [
                    {
                        text: '取消',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                    },
                    {
                        text: '确定',
                        onPress: () => {
                            BackHandler.exitApp();
                        },
                    },
                ],
                { cancelable: false },
            );
            return true;
        }
    };

    renderSwiper() {

        var itemArr = [];
        let bannerList = this.state.bannerList;
        if (bannerList.length > 0) {

            for (let i = 0; i < bannerList.length; i++) {
                itemArr.push(
                    <View style={styles.slide}>
                        <Image style={[styles.imageStyle, { width: '100%' }]} resizeMode="cover" source={{ uri: bannerList[i].img[0].url }} />
                    </View>
                );
            }

        } else {
            itemArr.push(
                <View style={styles.slide} key='bar01'>
                    <Image style={[styles.imageStyle, { width: '100%' }]} resizeMode="cover" source={require('../../assets/topBanner.png')} />
                </View>
            );
            itemArr.push(
                <View style={styles.slide} key='bar02'>
                    <Image style={[styles.imageStyle, { width: '100%' }]} resizeMode="cover" source={require('../../assets/topBanner01.png')} />
                </View>
            );
        }

        return itemArr;
    }

    getBannerList() {
        let params = { pageNumber: 1, pageSize: 10 }
        HttpPost('qkwg-system/appBanner/findPage', params, 'json').then(res => {
            if (res.flag) {
                this.setState({ bannerList: res.data.rows })
            }
        })
    }

    getMessage() {
        let params = { pageNumber: 1, pageSize: 3, isRead: 0 }
        HttpPost('qkwg-system/message/findMessage', params, 'json').then(res => {
            if (res.flag) {
                this.setState({ findMsgList: res.data.rows, msgCount: res.data.total })
            }
        })
    }

    //加载首页菜单列表
    getMenuList() {

        HttpGet('qkwg-system/system/menu/queryMenuByUser/172567943237996544', null).then(res => {
            if (res.flag) {

                let defualUrl = 'https://mdajtest.szzt.com.cn/upload/image/20220428/1651117755943_eaba8c1e4a564fe6a4c3430bec05ab66.JPG'
                let meunList = [];
                res.data.map((item, index) => {
                    let item1Url = item.iconImgs === '' ? defualUrl : item.iconImgs[0].url;

                    meunList.push({
                        name: item.name,
                        id: item.id,
                        menuImageUrl: item1Url,
                        outCode: item.description, //后端web配置值：app跳转原生，H5
                        subList: []
                    })

                    item.menuVOS.map(item2 => {
                        let item2Url = item2.iconImgs === '' ? defualUrl : item2.iconImgs[0].url;

                        meunList[index].subList.push({
                            menuName: item2.name,
                            pid: item2.pid,
                            menuUrl: item2.dataUrl,
                            menuImageUrl: item2Url,
                            outCode: item2.description, //后端web配置值：app跳转原生，H5
                        })
                    })
                })

                // global.user.appRoleList = meunList;
                self.setState({ userMeunList: meunList })

                this.loadTypeMeunList();
            } else {
                toastShort('获取功能菜单失败');
            }
        })
    }

    loadTypeMeunList() {
        //接口端约定对应ID的模块
        // 197128711874732032	基层治理
        // 199681612074106880	我的任务

        let eventMuenList = this.state.userMeunList.filter(item => { return item.id == '197128711874732032' });
        let myTaskMeunList = this.state.userMeunList.filter(item => { return item.id == '199681612074106880' })
        let otherMuenList = this.state.userMeunList.filter(item => { return item.id != '197128711874732032' && item.id != '199681612074106880' })

        console.log('eventMuenList', eventMuenList)
        console.log('myTaskMeunList', myTaskMeunList)
        console.log('otherMuenList', otherMuenList)

        this.setState({ eventMuenList, myTaskMeunList, otherMuenList })

        //加载父菜单
        let tabList = [];
        if (otherMuenList.length > 0) {
            otherMuenList.map(item => {
                let title = item.name;

                tabList.push({
                    id: item.id,
                    name: title.length > 4 ? title.substring(0, 6) + '..' : title
                })
            })

            this.setState({
                tabList,
                activeId: tabList[0].id
            })

            this._tabs(tabList[0].id)
        }

    }

    //加对应的子菜单
    laodAppMenuList(pid, meunList, meunType) {

        if (meunList) {

            let curMeunList = [];
            meunList.forEach(item => {
                if (item.id == pid || meunType != 'other') {
                    item.subList.forEach(item2 => {
                        curMeunList.push({
                            menuName: item2.menuName,
                            menuImageUrl: item2.menuImageUrl,
                            outCode: item2.outCode,
                            menuUrl: item2.menuUrl
                        });
                    })
                }
            })
            // console.log('meunList: ' + JSON.stringify(meunList));
            // let imageUrl = global.imageUrl;

            return (
                curMeunList.length > 0 ?
                    <View style={[meunType === 'eventMenu' ? styCom.FlexBetween : styCom.FlexBetweenWrap]} >
                        {
                            curMeunList.map((item, index) => {
                                return this._renderMenu({ item }, meunType)
                            })
                        }
                    </View>
                    :
                    null
            );
        }
    }

    //加载模式窗体-功能子菜单列表
    _renderMenu(props, menuType) {
        //console.log(props);

        props = props.item;

        let id = props.id;
        let type = props.menuCode;
        let typeName = props.menuName;

        let imgsource = { uri: props.menuImageUrl };
        //outcode后端配置
        let outCode = props.outCode.toLowerCase(), h5Url = props.menuUrl;

        if (menuType == 'eventMenu') {

            return (
                <TouchableOpacity
                    onPress={this._navOpen(menuType, id, outCode, h5Url, typeName)}
                    activeOpacity={0.5}
                    style={[styCom.FlexBetween,]}>

                    <Image source={imgsource} style={[styles.iconImg, { marginRight: scaleSize(5) }]} />
                    <View>
                        <Text style={{ fontSize: scaleSize(36), fontWeight: 'bold' }}> {h5Url.indexOf('rootsInspection') > 0 ? '巡查上报' : '所有事件'} </Text>
                        <Text style={{ color: '#999', fontSize: scaleSize(24), }}> {h5Url.indexOf('rootsInspection') > 0 ? '事件查看快捷入口' : '巡查走访问题上报'} </Text>
                    </View>

                </TouchableOpacity>
            )
        } else {

            return (
                <TouchableOpacity
                    style={[styles.imgMenu]}
                    activeOpacity={0.5}
                    onPress={this._navOpen(menuType, id, outCode, h5Url, typeName)}
                >

                    <Image source={imgsource} style={styles.iconImg} />
                    <View>
                        <Text style={styles.iconText}>{typeName}</Text>
                    </View>
                </TouchableOpacity>
            )
        }
    }

    _navOpen = (type, id, outCode, PageName, typeName) => () => {

        if (!this.state.isPermis) this.requestMultiplePermission();

        this.setState({ staFlage: false })

        setTimeout(() => {

            this.setState({
                StatusBarBgColor: '#FFF',
                StatusBarFtColor: 'dark-content',
                StatusBarTranslucent: false,
                staFlage: true
            })

            //跳转到H5的界面或者RN原生界面
            if (outCode != 'app') {
                //参数加密
                let h5Url = global.H5Url + '?token=' + global.requestHeadAuthorization.replace('Bearer ', '') + "&url=" + PageName;
                console.log('H5Url: ' + h5Url)

                self.props.navigation.navigate('Web', {
                    outCode: 'h5',
                    h5Url: h5Url
                })

            } else {
                if (typeof (PageName) != "undefined" && PageName != '') global.navigation.navigate(PageName);
            }

        }, 100);

    }

    navToH5Url = (h5PageName) => {

        setTimeout(() => {

            this.setState({
                StatusBarBgColor: '#FFF',
                StatusBarFtColor: 'dark-content',
                StatusBarTranslucent: false,
                staFlage: true
            })

            let h5Url = global.H5Url + '?token=' + global.requestHeadAuthorization.replace('Bearer ', '') + "&url=" + h5PageName;
            console.log('H5Url: ' + h5Url)

            self.props.navigation.navigate('Web', {
                outCode: 'h5',
                h5Url: h5Url
            })
        }, 100);
    };

    _onScroll(event) {

        if (global.routeName === 'HomePage2') {

            let y = event.nativeEvent.contentOffset.y;
            console.log(y)
            if (y > 210) {
                this.setState({ StatusBarBgColor: '#2589FF', })
            } else {
                this.setState({ StatusBarBgColor: 'transparent', })
            }
        }

    }

    _tabs = (id) => {
        console.log(id);
        this.setState({ activeId: id })

        this.laodAppMenuList(id, this.state.otherMuenList, 'other')
    }


    render() {
        n = this.props.navigation;
        self = this;

        return (
            <View style={styles.container}>
                {/* <Head back={false} title='基层治理' /> */}

                {this.state.staFlage ?
                    <StatusBar
                        animated={false} //指定状态栏的变化是否应以动画形式呈现。 
                        translucent={this.state.StatusBarTranslucent}//指定状态栏是否透明。设置为true时:transparent
                        backgroundColor={this.state.StatusBarBgColor} //状态栏的背景色
                        barStyle={this.state.StatusBarFtColor} // 字体样式 enum('default', 'light-content', 'dark-content')  
                    /> : null
                }


                <ScrollView style={{ width: '100%' }} ref={(r) => this.scrollview = r}
                    onScroll={this._onScroll.bind(this)}
                    contentContainerStyle={{ paddingBottom: scaleSize(100) }}>

                    <View style={styles.titlePostion}><Text style={styles.titleText}>基层治理首页</Text></View>

                    {
                        this.state.msgCount > 0 ?
                            <TouchableOpacity
                                style={styles.txPostion}
                                activeOpacity={0.8}
                                onPress={() => this.navToH5Url('/pages/me/myNews/index')}>

                                <SvgUri width="30" height="40" svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.homeXiaoxi}" fill="#fff"></path></svg>`} />
                                <View style={styles.xiaoxiCont}>
                                    <Text style={{ color: '#fff', fontSize: scaleSize(20) }}>{this.state.msgCount > 99 ? '99+' : this.state.msgCount}</Text>
                                </View>
                            </TouchableOpacity>
                            : null
                    }

                    <View style={styles.swiperContainer}>

                        <Swiper
                            // autoplay={true}
                            // autoplayTimeout={10}

                            style={styles.swiperStyle}
                            height={scaleSize(500)}
                            // index={this.state.bannerIndex}
                            // horizontal={true}
                            // loop={true}
                            // showsButtons={true}
                            // paginationStyle={{ bottom: scaleSize(10) }}

                            // onMomentumScrollEnd={(e, state, context) => { this.state.bannerIndex = state.index;console.log(state.index) }}
                            dot={<View style={{ backgroundColor: 'rgba(0,0,0,.2)', width: 5, height: 5, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 0 }} />}
                            activeDot={<View style={{ backgroundColor: '#fff', width: 8, height: 8, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 0 }} />}
                        >
                            {this.renderSwiper()}
                        </Swiper>
                    </View>

                    <View style={{ marginTop: scaleSize(-50), padding: scaleSize(20), zIndex: 101 }}>

                        {
                            // 巡查上报，所有事件
                            this.state.eventMuenList.length > 0 ?
                                <View style={[styles.topCom]}>
                                    {this.laodAppMenuList(0, this.state.eventMuenList, 'eventMenu')}
                                </View> : null
                        }

                        {
                            //我的任务
                            this.state.myTaskMeunList.length > 0 ?
                                <View style={styles.iconCom}>
                                    <View><Text style={styles.muenTitle}>我的任务</Text></View>

                                    {this.laodAppMenuList(0, this.state.myTaskMeunList, 'myMenu')}
                                </View> : null
                        }

                        {
                            //其他菜单功能加载（督查督办，考勤）
                            this.state.otherMuenList.length > 0 ?

                                <View style={styles.iconCom}>
                                    <View style={styles.muenTitle}>
                                        <Tabs status={this.state.activeId} tabList={this.state.tabList} tab={this._tabs.bind(this)} borderShow={false} />
                                    </View>

                                    {this.laodAppMenuList(this.state.activeId, this.state.otherMuenList, 'other')}
                                </View> : null
                        }

                        {
                            this.state.findMsgList.length > 0 ?
                                <TouchableOpacity
                                    activeOpacity={0.6}
                                    style={[styles.iconCom, styCom.FlexBetween]}
                                    onPress={() => this.navToH5Url('/pages/me/myNews/index')}
                                >
                                    <View style={styCom.FlexBetween}>
                                        <Image source={require('../../assets/msg.png')} style={styles.iconMsg} />

                                        <View>
                                            <Text style={{ fontSize: scaleSize(28), fontWeight: 'bold' }}>{this.state.findMsgList[0].title}</Text>
                                            <Text style={{ color: '#999' }}>{this.state.findMsgList[0].createTime}</Text>
                                        </View>
                                    </View>

                                    <View style={{ borderLeftColor: '#e2e2e2', borderLeftWidth: 1 }}>
                                        <Text style={{ color: '#999', fontSize: scaleSize(28), marginLeft: scaleSize(30) }}>更多</Text>
                                    </View>
                                </TouchableOpacity>
                                : null
                        }


                    </View>

                </ScrollView>

                {/* <Bottom active="h" navigation={this.props.navigation} /> */}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        display: 'flex'
    },

    slide: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'transparent'
    },

    iconText: {
        color: '#333', fontSize: scaleSize(24), fontWeight: '500', marginTop: scaleSize(10), marginBottom: scaleSize(10)
    },

    iconMsg: {
        height: scaleSize(68), width: scaleSize(75), marginRight: scaleSize(20),
    },

    iconImg: {
        height: scaleSize(60), width: scaleSize(60)
    },

    imgMenu: {
        width: '25%',
        // height:scaleSize(135),
        // paddingLeft: scaleSize(10),
        // paddingRight: scaleSize(10),
        marginBottom: scaleSize(30),
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },

    titlePostion: {
        position: 'absolute',
        zIndex: 110,
        top: 40,
        left: 15
    },

    txPostion: {
        position: 'absolute',
        zIndex: 110,
        top: 30,
        right: 25
    },

    titleText: {
        color: '#fff',
        fontSize: scaleSize(36),
    },

    xiaoxiCont: {
        position: 'absolute', top: 5, right: -5, backgroundColor: '#f90e0e', paddingTop: scaleSize(2), paddingBottom: scaleSize(2),
        paddingLeft: scaleSize(10), paddingRight: scaleSize(10),
        borderRadius: scaleSize(20)
    },

    swiperContainer: {
        height: scaleSize(500),
        marginBottom: 0,
        zIndex: 100,
        padding: 0
    },

    swiperStyle: { marginTop: scaleSize(-2), zIndex: 100 },
    swiperItem: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    imageStyle: {
        flex: 1,
    },

    iconCom: {
        backgroundColor: '#fff',
        marginBottom: scaleSize(20),
        paddingLeft: scaleSize(15),
        paddingRight: scaleSize(15),
        paddingBottom: scaleSize(30),
        paddingTop: scaleSize(30),
        borderRadius: scaleSize(15),

    },

    topCom: {
        backgroundColor: '#fff',
        marginBottom: scaleSize(20),
        paddingRight: scaleSize(40),
        paddingLeft: scaleSize(40),
        paddingTop: scaleSize(50),
        paddingBottom: scaleSize(50),
        borderRadius: scaleSize(15),

    },

    muenTitle: {
        color: '#333',
        fontSize: scaleSize(30),
        paddingLeft: scaleSize(20),
        paddingBottom: scaleSize(20)
        // fontWeight:'bold'
    },

});
