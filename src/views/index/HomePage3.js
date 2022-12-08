import React, { Component } from 'react';
import {
    Image, View, StyleSheet, BackHandler,
    Button, Alert, Text, FlatList, TextInput,
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
import UpdateVersion from '../../components/Index/UpdateVersion';


let n, self, backNum = 0;

export default class HomePage3 extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isPermis: false,
            isHide: false,
            scanShow: false,

            searchText: '',
            StatusBarFtColor: 'dark-content',
            StatusBarBgColor: '#FFF',
            StatusBarTranslucent: false,  //状态栏是否隐藏

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
            tabList: [],
            data: [],

        };
    }

    componentDidMount() {
        global.routeName = 'HomePage3'

        //收到监听
        this.listener = DeviceEventEmitter.addListener('backHome', () => {
            console.log('backHome', global.routeName);
            global.routeName = 'HomePage3';

            this.getMessage();
        })

        this.unsubscribe = this.props.navigation.addListener('tabPress', e => {
            global.routeName = 'HomePage3';
            console.log('tabPress--1', global.routeName);

            this.getMessage();
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

        if (global.routeName == 'HomePage3' || global.routeName == 'TabIndex') {
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
                global.user.msgCount = res.data.total;
                this.setState({ findMsgList: res.data.rows, msgCount: res.data.total })
            }
        })
    }

    //加载首页菜单列表
    getMenuList() {

        HttpGet('qkwg-system/system/menu/queryMenuByUser/3', null).then(res => {
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
                            id: item2.id,
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
        //接口端约定对应ID的模块 头部4个菜单入口
        // 197129981511524352	巡查上报
        // 197130580873371648   所有事件
        // 200044624811487232   我的巡查
        // 217433254954803200   一键查

        // 199681612074106880	我的任务
        // 197128711874732032	基层治理

        let eventMuenList = this.state.userMeunList.filter(item => { return item.id == '197128711874732032' })
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
                            id: item2.id,
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
                    <View style={[styCom.FlexBetweenWrap, meunType == 'myMenu' ? styles.meunCom01 : styles.meunCom,]} >
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

        if (menuType == 'myMenu') {

            // 199682520333860864 我的待办  bg:#EFF9E7 ft:#47AA00
            // 199685314918924288 我的协助  bg:#E2F6FF ft:#0083C0
            // 199684873816555520 我的已办  bg:#E8ECFF ft:#4462DA
            // 199685451355439104 延期审核  bg:#EFF6FF ft:#006CD8
            // 199685653613166592 漏报审核  bg:#FFEAEA ft:#F55959
            // 199685149898227712 我的预警  bg:#FFF6E7 ft:#ED9801

            let bgcolor = styles.bgcolor01;
            let ftcolor = styles.ftcolor01;
            console.log(id);

            switch (id) {
                case '199682520333860864':
                    bgcolor = styles.bgcolor01;
                    ftcolor = styles.ftcolor01;
                    break;
                case '199685314918924288':
                    bgcolor = styles.bgcolor02;
                    ftcolor = styles.ftcolor02;
                    break;
                case '199684873816555520':
                    bgcolor = styles.bgcolor03;
                    ftcolor = styles.ftcolor03;
                    break;
                case '199685451355439104':
                    bgcolor = styles.bgcolor04;
                    ftcolor = styles.ftcolor04;
                    break;
                case '199685653613166592':
                    bgcolor = styles.bgcolor05;
                    ftcolor = styles.ftcolor05;
                    break;
                case '199685149898227712':
                    bgcolor = styles.bgcolor06;
                    ftcolor = styles.ftcolor06;
                    break;
            }

            return (
                <TouchableOpacity
                    onPress={this._navOpen(menuType, id, outCode, h5Url, typeName)}
                    activeOpacity={0.5}
                    style={[styles.rwIcon, bgcolor]}>

                    <Image source={imgsource} style={[styles.iconImg, { marginLeft: scaleSize(40), marginRight: scaleSize(17) }]} />
                    <View>
                        <Text style={[{ fontSize: scaleSize(28), }, ftcolor]} >{typeName}</Text>
                    </View>

                </TouchableOpacity>
            )
        } else {

            return (
                <TouchableOpacity
                    style={styles.imgMenu}
                    activeOpacity={0.5}
                    onPress={this._navOpen(menuType, id, outCode, h5Url, typeName)}
                >

                    <Image source={imgsource} style={[menuType === 'eventMenu' ? styles.iconImgTop : styles.iconImg]} />
                    <View>
                        <Text style={styles.iconText}>{typeName}</Text>
                    </View>
                </TouchableOpacity>
            )
        }
    }

    _navOpen = (type, id, outCode, PageName, typeName) => () => {

        if (!this.state.isPermis) this.requestMultiplePermission();

        //跳转到H5的界面或者RN原生界面
        if (outCode != 'app') {
            //参数加密
            let h5Url = global.H5Url + "?url=" + PageName;
            console.log('H5Url: ' + h5Url)

            self.props.navigation.navigate('Web', {
                outCode: 'h5',
                h5Url: h5Url
            })

        } else {
            if (typeof (PageName) != "undefined" && PageName != '') global.navigation.navigate(PageName);
        }
    }

    navToH5Url = (h5PageName) => {

        let h5Url = global.H5Url + "?url=" + h5PageName;
        console.log('H5Url: ' + h5Url)

        self.props.navigation.navigate('Web', {
            outCode: 'h5',
            h5Url: h5Url
        })
    };

    _onScroll(event) {

        // if (global.routeName === 'HomePage2') {

        //     let y = event.nativeEvent.contentOffset.y;
        //     console.log(y)
        //     if (y > 210) {
        //         this.setState({ StatusBarBgColor: '#2589FF', })
        //     } else {
        //         this.setState({ StatusBarBgColor: 'transparent', })
        //     }
        // }

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

                <StatusBar
                    animated={false} //指定状态栏的变化是否应以动画形式呈现。 
                    translucent={this.state.StatusBarTranslucent}//指定状态栏是否透明。设置为true时:transparent
                    backgroundColor={this.state.StatusBarBgColor} //状态栏的背景色
                    barStyle={this.state.StatusBarFtColor} // 字体样式 enum('default', 'light-content', 'dark-content')  
                />

                <ScrollView style={{ width: '100%' }} ref={(r) => this.scrollview = r}
                    onScroll={this._onScroll.bind(this)}
                    contentContainerStyle={{ paddingBottom: scaleSize(10) }}>

                    {/* 头部搜索部分 */}
                    <View style={styles.topSearch}>
                        <View style={{ flex: 4 }}>

                            <SvgUri style={styles.textSearchIcon} width="15" height="15"
                                svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.search}" fill="#CBCBCB"></path></svg>`} />
                            <TextInput
                                placeholder='请输入搜索文字'
                                style={styles.textInput}
                                value={this.state.searchText}

                                returnKeyType="search"
                                returnKeyLabel="搜索"
                                onFocus={e => {
                                    this.navToH5Url('/pages/subPages/dataManagement/aKeyCheck/index')
                                }}

                                onSubmitEditing={e => {
                                    // this._getList('');
                                }}
                                onChangeText={(value) => this.setState({ searchText: value })}
                            />
                        </View>

                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => this.props.navigation.navigate('MailList')}>

                                <SvgUri style={[styles.userMeunIcon, { marginRight: scaleSize(15) }]} svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.dianhuaben}" fill="#ACACAC"></path></svg>`} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => this.navToH5Url('/pages/me/myNews/index')}>

                                <SvgUri style={styles.userMeunIcon} svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.homeXiaoxi}" fill="#ACACAC"></path></svg>`} />

                                {this.state.msgCount > 0 ? <View style={[this.state.msgCount > 99 ? styles.xiaoxiCont : styles.xiaoxiCont01]}>
                                    <Text style={{ color: '#fff', fontSize: scaleSize(18) }}>{this.state.msgCount > 99 ? '99+' : this.state.msgCount}</Text>
                                </View> : null}

                            </TouchableOpacity>

                        </View>

                    </View>
                    {/* end头部搜索部分 */}

                    <View style={styles.swiperContainer}>

                        <View style={{ padding: scaleSize(30), }}>

                            <Swiper
                                // autoplay={true}
                                // autoplayTimeout={10}

                                style={styles.swiperStyle}
                                height={scaleSize(350)}
                                // index={this.state.bannerIndex}
                                // horizontal={true}
                                // loop={true}
                                // showsButtons={true}
                                // paginationStyle={{ bottom: scaleSize(10) }}

                                // onMomentumScrollEnd={(e, state, context) => { this.state.bannerIndex = state.index;console.log(state.index) }}
                                dot={<View style={{ backgroundColor: 'rgba(0,0,0,.2)', width: 5, height: 5, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 0, marginBottom: -20 }} />}
                                activeDot={<View style={{ backgroundColor: '#fff', width: 8, height: 8, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 0, marginBottom: -20 }} />}
                            >
                                {this.renderSwiper()}
                            </Swiper>
                        </View>


                        <View>

                            {
                                // 巡查上报，所有事件
                                this.state.eventMuenList.length > 0 ?
                                    <View style={[styles.topCom]}>
                                        {this.laodAppMenuList(0, this.state.eventMuenList, 'eventMenu')}
                                    </View> : null
                            }
                        </View>

                        <View>
                            {
                                this.state.findMsgList.length > 0 ?
                                    <TouchableOpacity
                                        activeOpacity={0.6}
                                        style={[styles.msgCon, styCom.FlexBetween]}
                                        onPress={() => this.navToH5Url('/pages/me/myNews/index')}
                                    >
                                        <View style={styCom.FlexBetween}>
                                            <SvgUri width="20" height="20"
                                                svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.laba}" fill="#F40603"></path></svg>`} />

                                            <Text style={{ marginLeft: scaleSize(10) }}>您刚收到一条待办预警消息提示</Text>
                                        </View>

                                        <View>
                                            <Text style={{ color: '#999', fontSize: scaleSize(28), marginLeft: scaleSize(30) }}>更多</Text>
                                        </View>
                                    </TouchableOpacity>
                                    : null
                            }
                        </View>
                    </View>

                    <View>
                        {
                            //我的任务
                            this.state.myTaskMeunList.length > 0 ?
                                <View style={styles.iconCom}>
                                    <View style={styles.borderBottom}><Text style={styles.muenTitle01}>我的任务</Text></View>

                                    {this.laodAppMenuList(0, this.state.myTaskMeunList, 'myMenu')}
                                </View> : null
                        }
                    </View>


                    <View>
                        {
                            //其他菜单功能加载（督查督办，考勤）
                            this.state.otherMuenList.length > 0 ?

                                <View style={styles.iconCom}>
                                    <View style={[styles.muenTitle, styles.borderBottom]}>
                                        <Tabs status={this.state.activeId} tabList={this.state.tabList} tab={this._tabs.bind(this)} borderShow={false} />
                                    </View>

                                    {this.laodAppMenuList(this.state.activeId, this.state.otherMuenList, 'other')}
                                </View> : null
                        }
                    </View>

                </ScrollView>

                {/* <Bottom active="h" navigation={this.props.navigation} /> */}
                <UpdateVersion />
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

    userMeunIcon: {
        width: scaleSize(50),
        height: scaleSize(50)
    },

    meunCom: {
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: scaleSize(20),
        paddingBottom: scaleSize(20),
    },
    meunCom01: {
        padding: scaleSize(20),
        flexWrap: 'wrap',
        justifyContent: 'space-between'
    },

    bgcolor01: {
        backgroundColor: '#EFF9E7',
    },
    bgcolor02: {
        backgroundColor: '#E2F6FF',
    },
    bgcolor03: {
        backgroundColor: '#E8ECFF',
    },
    bgcolor04: {
        backgroundColor: '#EFF6FF',
    },
    bgcolor05: {
        backgroundColor: '#FFEAEA',
    },
    bgcolor06: {
        backgroundColor: '#FFF6E7',
    },

    ftcolor01: {
        color: '#47AA00'
    },
    ftcolor02: {
        color: '#0083C0'
    },

    ftcolor03: {
        color: '#4462DA'
    },
    ftcolor04: {
        color: '#006CD8'
    },
    ftcolor05: {
        color: '#F55959'
    },
    ftcolor06: {
        color: '#ED9801'
    },


    rwIcon: {
        // justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EFF9E7',
        width: '48%',
        height: scaleSize(110),
        flexDirection: 'row',
        borderRadius: scaleSize(10),
        marginBottom: scaleSize(20)
    },

    msgCon: {
        borderTopColor: '#F2F2F2', borderTopWidth: 1, padding: scaleSize(30),
    },

    borderBottom: {
        borderBottomColor: '#F2F2F2', borderBottomWidth: 1,
    },

    textSearchIcon: {
        position: 'absolute',
        top: 8, left: 10,
        zIndex: 110
    },

    textInput: {
        paddingLeft: scaleSize(60),

        width: '95%',
        height: scaleSize(70),
        borderRadius: scaleSize(120),
        fontSize: scaleSize(24),
        backgroundColor: '#EDEDED',
        borderColor: '#E5E5E5',
        borderWidth: scaleSize(1),
        zIndex: 100,
    },

    topSearch: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        paddingBottom: scaleSize(5),
        padding: scaleSize(20),
    },

    slide: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'transparent'
    },

    iconText: {
        color: '#333', fontSize: scaleSize(24), fontWeight: '500', marginTop: scaleSize(10), marginBottom: scaleSize(10)
    },

    iconImg: {
        height: scaleSize(65), width: scaleSize(65),
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

    iconImgTop: {
        height: scaleSize(90), width: scaleSize(90), borderRadius: scaleSize(20)
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
        position: 'absolute', top: -3, right: -5, backgroundColor: '#f90e0e', paddingTop: scaleSize(2), paddingBottom: scaleSize(2),
        paddingLeft: scaleSize(5), paddingRight: scaleSize(5),
        borderRadius: scaleSize(20),
    },

    xiaoxiCont01: {
        position: 'absolute', top: -3, right: -5, backgroundColor: '#f90e0e', paddingTop: scaleSize(2), paddingBottom: scaleSize(2),
        paddingLeft: scaleSize(10), paddingRight: scaleSize(10),
        borderRadius: scaleSize(20),
    },

    swiperContainer: {
        // height: scaleSize(350),
        backgroundColor: '#fff',
        marginBottom: 0,
        zIndex: 100,
        // padding: scaleSize(20),
        marginBottom: scaleSize(20),
    },

    swiperStyle: { zIndex: 100, },
    swiperItem: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    imageStyle: {
        flex: 1,
        borderRadius: scaleSize(20)
    },

    iconCom: {
        backgroundColor: '#fff',
        // padding: scaleSize(20),
        marginBottom: scaleSize(20),
    },

    topCom: {
        backgroundColor: '#fff',
        padding: scaleSize(30),
        paddingTop: scaleSize(10),
    },

    muenTitle01: {
        color: '#333',
        fontSize: scaleSize(30),
        padding: scaleSize(26),
        paddingLeft: scaleSize(30),
        fontWeight: 'bold',

    },

    muenTitle: {
        color: '#333',
        fontSize: scaleSize(28),
        paddingLeft: scaleSize(30),
        paddingTop: scaleSize(40),
        fontWeight: 'bold',

    },

});
