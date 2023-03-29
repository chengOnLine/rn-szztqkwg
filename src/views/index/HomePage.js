import React, { Component } from 'react';
import {
    Image, View, StyleSheet, BackHandler,
    Button, Alert, Text, FlatList, TextInput,
    Platform, NativeModules, StatusBar, ScrollView, TouchableOpacity, DeviceEventEmitter, PermissionsAndroid
} from 'react-native';

import { deviceWidth, deviceHeight, scaleSize } from '../../tools/adaptation';
import Head from '../../components/Public/Head';
import Bottom from '../../components/Public/TabBottom';
import AlertContainer from '../../components/Public/AlertContainer';
import Tabs from '../../components/Public/TabMenu';
import Swiper from 'react-native-swiper';
import styCom from '../../styles/index'
import { post } from "../../request/NetUtility";

import { HttpGet, HttpPost } from '../../request/index'
import { toastShort } from '../../tools/toastUtil';
import SvgUri from 'react-native-svg-uri';
import { Icons } from '../../fonts/fontIcons'
import { storageSet, storageGet } from '../../storage/index'
import UpdateVersion from '../../components/Index/UpdateVersion';
import { getLocation, getLocation2, } from "../../tools/AmapLocation";
import { decryptKeyVal } from '../../tools/comm'


let n, self, backNum = 0;

export default class HomePage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isPermis: false,
            isHide: false,
            scanShow: false,
            sltUserShow: false,
            sltUserName: '',

            searchText: '',
            StatusBarFtColor: 'dark-content',
            StatusBarBgColor: '#FFF',
            StatusBarTranslucent: false,  //状态栏是否隐藏

            oldUserList: [],
            userMeunList: [],
            meunId: 0,

            myTaskMeunList: [],
            otherMuenList: [],
            eventMuenList: [],


            bannerIndex: 0,
            bannerList: [],
            msgCount: 0,
            myTaskCount: 0,
            findMsgList: [{}],
            address: "",

            activeId: 1,
            tabList: [],
            data: [],

            processTasksCount: 0,
            formTasksCount: 0,
        };
    }

    componentDidMount() {
        global.routeName = 'HomePage'
        this.getAddress();

        //收到监听
        this.listener = DeviceEventEmitter.addListener('backHome', () => {
            console.log('backHome', global.routeName);
            global.routeName = 'HomePage';

            this.getMessage();
            this.getMessageCount();
            this.getOneClickSearchCount();
        })

        this.unsubscribe = this.props.navigation.addListener('tabPress', e => {
            global.routeName = 'HomePage';
            console.log('tabPress--1', global.routeName);

            this.getMessage();
            this.getMessageCount();
            this.getOneClickSearchCount();
        });


        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
        }

        this.getBannerList();

        this.getMenuList();

        this.getMessage();
        this.getMessageCount();

        this.getOneClickSearchCount();
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
            // toastShort(err.toString())
        }
    }

    onBackAndroid = () => {
        console.log('onBackAndroid', global.routeName)

        if (global.routeName == 'HomePage' || global.routeName == 'TabIndex') {
            Alert.alert(
                '退出提示',
                '是否要退出治理通APP？',
                [
                    {
                        text: '取消',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                    },
                    {
                        text: '确定',
                        onPress: () => {
                            NativeModules.AMapLocationModule.exitApp();

                            // BackHandler.exitApp();
                        },
                    },
                ],
                { cancelable: false },
            );
            return true;
        }
    };



    getAddress() {

        getLocation().then((res) => {

            const { code, data = {}, error } = res;
            if (code == 0) {
                const { address, coords = {} } = data;
                this.setState({ address: address })

                this.toAndroidTrack();
            }
        }).catch((error) => { })
    }


    toAndroidTrack(id) {
        console.log('------获取考勤打卡------')

        //获取当前最新考勤记录，是否在签到中
        HttpGet('qkwg-jcwg/flow/dailyAttendance/lastDailySign', null).then((res) => {


            if (res.flag) {
                try {
                    let signId = '', isSign = false;
                    let signOutTime = '', signTime = '';

                    if (res.data.length > 0) {

                        res.data.forEach(item => {
                            signId += item.id + ","
                        })

                        signId = signId.slice(0, signId.length - 1);
                        signOutTime = res.data[0].signOutTime;
                        signTime = res.data[0].signTime;

                        if (signOutTime == "" && signTime != "") {
                            // 已签到跳转到地图巡逻页面
                            isSign = true;
                        }
                    }

                    let token = global.requestHeadAuthorization;
                    let address = this.state.address;

                    //如果已经签到，则自动跳转考勤轨迹
                    if (isSign) {

                        NativeModules
                            .AMapLocationModule
                            .startActivityFormJS(token, isSign, signId, signTime, address);
                    }

                } catch (error) {
                    console.log(error)
                }

            } else {
                // toastShort('获取签到信息失败：' + res.msg, 'bottom');
            }

        }).catch((error) => {
            toastShort(error, 'bottom');//超时会在这里
        })

    }


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
                try {
                    this.setState({ bannerList: res.data.rows })
                } catch (error) { }
            }
        })
    }

    getMessage() {
        let params = {}
        HttpPost('qkwg-system/system/messageList/messageApp', params, 'json').then(res => {
            const { flag , data } = res;
            if (flag && data ) {
                const { content , createTime , businessName } = data;
                this.setState({ findMsgList: [{ createTime , content: content?.length > 18 ? content?.substring(0, 18) + "..." : content , businessName }] });
            }else{
                this.setState({ findMsgList: [] });
            }
        })
    }

    getMessageCount() {


        HttpPost('qkwg-flow/businessEvent/my/listPage/todo/allBusiness', { pageNumber: 1, pageSize: 1 }, 'json').then(res => {
            if (res.flag) {
                try {
                    this.setState({ myTaskCount: res.data.total })
                } catch (error) { }
            }
        })

    }

    getOneClickSearchCount(){
        // 流程任务
        HttpPost('qkwg-flow/oneClickReportTask/listPage/todo', { pageNumber: 1, pageSize: 1 , taskType: 2 }, 'json').then(res => {
            if (res.flag) {
                try {
                    this.setState({ processTasksCount: res.data.total } , () => {
                        this.loadTypeMeunList(this.state.activeId);
                    })
                } catch (error) { }
            }
        })

        // 表单任务
        HttpPost('qkwg-flow/oneClickReportTask/listPage/progress', { pageNumber: 1, pageSize: 1 , taskType: 1 }, 'json').then(res => {
            if (res.flag) {
                try {
                    this.setState({ formTasksCount: res.data.total } , () => {
                        this.loadTypeMeunList(this.state.activeId);
                    })
                } catch (error) { }
            }
        })
    }

    //加载首页菜单列表
    getMenuList() {
        toastShort('正在加载菜单...');

        HttpGet('qkwg-system/system/menu/queryMenuByUser/3', null).then(res => {
            if (res.flag) {
                try {

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

                        if (item.menuVOS) {
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
                        }
                    })

                    // global.user.appRoleList = meunList;
                    self.setState({ userMeunList: meunList })

                    this.loadTypeMeunList();

                } catch (error) { }
            } else {
                toastShort('获取功能菜单失败');
            }
        })
    }

    loadTypeMeunList(activeId) {
        //接口端约定对应ID的模块 头部4个菜单入口
        // 197129981511524352	巡查上报
        // 197130580873371648   所有事件
        // 200044624811487232   我的巡查

        // 199681612074106880	我的任务
        // 197128711874732032	基层治理

        try {
            console.log('userMeunList', this.state.userMeunList.length);

            let eventMuenList = this.state.userMeunList.filter(item => { return item.id == '197128711874732032' })
            let myTaskMeunList = this.state.userMeunList.filter(item => { return item.id == '199681612074106880' })
            let otherMuenList = this.state.userMeunList.filter(item => { return item.id != '197128711874732032' && item.id != '199681612074106880' })

            // console.log('eventMuenList', eventMuenList)
            // console.log('myTaskMeunList', myTaskMeunList)
            // console.log('otherMuenList', otherMuenList)

            this.setState({ eventMuenList, myTaskMeunList, otherMuenList })

            //加载父菜单
            let tabList = [];
            if (otherMuenList.length > 0) {
                otherMuenList.map(item => {
                    let title = item.name;

                    tabList.push({
                        id: item.id,
                        name: title.length > 4 ? title.substring(0, 6) + '..' : title,
                        count: item.name === '一键报' ? this.state.processTasksCount + this.state.formTasksCount : undefined,
                    })
                })

                this.setState({
                    tabList,
                    activeId: activeId || tabList[0].id
                })

                this._tabs( activeId || tabList[0].id)
            }

        } catch (error) { }
    }

    getOldUserList() {

        let oldUserList = global.zltUser.oldUser;

        if (oldUserList && oldUserList.length == 1) {
            global.zltUser.userName = oldUserList[0];
            return true
        } else if (oldUserList && oldUserList.length > 0) {
            this.setState({ sltUserShow: true, oldUserList })
            return false
        } else {
            toastShort('没有权限登录')
            return false
        }
    }



    //获取治理通的登录token
    getZLTtoken() {

        HttpGet('qkwg-system/system/user/getToken/' + global.zltUser.userName, null).then((res) => {
            if (res.flag) {
                let data = res.data;

                console.log('getZLTtoken', data);

                global.zlt_oauthToken = "Bearer " + data;
                storageSet('oauthToken', global.zlt_oauthToken);

                this.getZLTUserInfo();

            } else {
                global.zlt_oauthToken = "";
                toastShort("该用户没有权限登录3", 'bottom');
            }
        }).catch((error) => {
            toastShort(error, 'bottom');//超时会在这里
        })
    }

    getZLTUserInfo() {
        let self = this;

        let postLogin = {
            param3: global.zltVersion.curNumber,
            param4: "",
            lat: '',
            lng: '',
            currentRole: '',
        };

        post(global.zlt_requestApi + '/zty-system/sys/sysuser/loginOperate', postLogin, null, function (res) {

            if (res.hasOwnProperty("flag")) {
                if (res.flag) {
                    let { mainKey, user } = res.data;

                    // res.data.appRoleList=decryptKeyVal(appRoleList,mainKey);
                    res.data.user = decryptKeyVal(user, mainKey);

                    let { communityId, communityName, deptId, deptName, email, fullName, gridId, gridName,
                        identity, password, phone, picAddress, princeArea, roleId, roleKey, roleName, sex,
                        streetId, userId, cardId, appRoleList } = JSON.parse(res.data.user);

                    // let {token,userUid} = res.data.sesMap;
                    // console.log('appLogin result',global.user.info);
                    global.zltUser.info = {
                        //id,userName,password,identity,departmentId,sex,email,phone
                        id: userId,
                        userName: fullName,
                        password,
                        identity,
                        departmentId: deptId == undefined ? 0 : deptId,
                        sex,
                        phone,
                        email,
                        communityId,
                        communityName,
                        deptName,
                        gridId,
                        gridName,
                        picAddress,
                        princeArea,
                        roleId,
                        roleKey,
                        roleName,
                        streetId,
                        cardId
                    };

                    global.user.appRoleList = JSON.parse(appRoleList);

                    storageSet('zlt_curUserInfo', global.zltUser);
                    console.log('zlt_curUserInfo:' + JSON.stringify(global.zltUser.info))

                    global.navigation.navigate('LongBanManage');

                } else {
                    toastShort("该用户没有权限登录1", 'bottom');
                }
            } else {
                toastShort("该用户没有权限登录2", 'bottom');
            }
        })
    }


    //加对应的子菜单
    laodAppMenuList(pid, meunList, meunType) {
        // console.log("meunList",meunList);
        // console.log("meunType",meunType);
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

            if (meunType == 'other') {

                return (
                    curMeunList.length > 0 ?
                        <View>
                            {
                                curMeunList.map((item, index) => {
                                    return this._renderMenu({ item }, meunType)
                                })
                            }
                        </View>
                        :
                        <View style={{ minHeight: scaleSize(100) }}></View>
                );

            } else {

                return (
                    curMeunList.length > 0 ?

                        <View style={[styCom.FlexBetweenWrap, meunType == 'myMenu' ? styles.meunCom : styles.meunCom01,]} >
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
    }

    //加载模式窗体-功能子菜单列表
    _renderMenu(props, menuType) {
        // console.log("props" , props , menuType);

        props = props.item;

        let id = props.id;
        let type = props.menuCode;
        let typeName = props.menuName;
        let strKey = menuType + "_" + id;


        let imgsource = { uri: props.menuImageUrl };
        //outcode后端配置
        let outCode = props.outCode.toLowerCase(), h5Url = props.menuUrl;
        let menuName = props.menuName;
        if (menuType == 'other') {

            return (
                <TouchableOpacity
                    activeOpacity={0.5}
                    key={strKey}
                    style={[styCom.FlexBetween, styles.otherView]}
                    onPress={this._navOpen(menuType, id, outCode, h5Url, typeName)}
                >
                    {
                         menuName === "流程任务" && this.state.processTasksCount > 0 ? <View style={{
                            backgroundColor: '#f90e0e', paddingTop: scaleSize(2), paddingBottom: scaleSize(2),
                            paddingLeft: scaleSize(5), paddingRight: scaleSize(10),
                            borderRadius: scaleSize(20), position: 'absolute', top: -5, left: 20, zIndex: 15,
                        }}>
                            <Text style={{ color: '#fff', fontSize: scaleSize(20) }}> {this.state.processTasksCount > 99 ? '99+' : this.state.processTasksCount}</Text>
                        </View> : null
                    }
                    {
                         menuName === "表单任务" && this.state.formTasksCount > 0 ? <View style={{
                            backgroundColor: '#f90e0e', paddingTop: scaleSize(2), paddingBottom: scaleSize(2),
                            paddingLeft: scaleSize(5), paddingRight: scaleSize(10),
                            borderRadius: scaleSize(20), position: 'absolute', top: -5, left: 20, zIndex: 15,
                        }}>
                            <Text style={{ color: '#fff', fontSize: scaleSize(20) }}> {this.state.formTasksCount > 99 ? '99+' : this.state.formTasksCount}</Text>
                        </View> : null
                    }
                    <View style={[styCom.FlexBetween,]}>
                        <Image source={imgsource} style={[styles.iconImgTop03,]} />
                        <Text style={styles.iconText}>{typeName}</Text>
                    </View>

                    <View>
                        <SvgUri style={styles.rightIcon} svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.moree}" fill="#C5C5C5"></path></svg>`} />
                    </View>
                </TouchableOpacity>
            )
        } else {

            return (
                <TouchableOpacity
                    style={styles.imgMenu}
                    key={strKey}
                    activeOpacity={0.5}
                    onPress={this._navOpen(menuType, id, outCode, h5Url, typeName)}
                >

                    {
                        //加入我的待办--数量提醒
                        outCode == "mytask" && this.state.myTaskCount > 0 ? <View style={{
                            backgroundColor: '#f90e0e', paddingTop: scaleSize(2), paddingBottom: scaleSize(2),
                            paddingLeft: scaleSize(5), paddingRight: scaleSize(10),
                            borderRadius: scaleSize(20), position: 'absolute', top: -5, right: 0, zIndex: 15,
                        }}>
                            <Text style={{ color: '#fff', fontSize: scaleSize(20) }}> {this.state.myTaskCount > 99 ? '99+' : this.state.myTaskCount}</Text>
                        </View> : null
                    }

                    <Image source={imgsource} style={[menuType == 'myMenu' ? styles.iconImgTop01 : styles.iconImgTop,]} />
                    <View>
                        <Text style={styles.iconText}>{typeName}</Text>
                    </View>
                </TouchableOpacity>
            )
        }
    }

    _navOpen = (type, id, outCode, PageName, typeName) => () => {
        // console.log("outCode"  ,outCode);
        // console.log("PageName"  ,PageName);
        if (!this.state.isPermis) this.requestMultiplePermission();
        let isShowSltUser;
        //跳转到H5的界面或者RN原生界面
        if (outCode != 'app') {
            isShowSltUser = true;

            //参数加密
            let h5Url = PageName.indexOf('http') >= 0 ? PageName : global.H5Url + "?url=" + PageName;

            if (outCode.toLowerCase() == "zlth5") {
                h5Url = global.zltH5Url + "?url=" + PageName;
            }

            if (PageName.indexOf('http') >= 0 || outCode.toLowerCase() == "zlth5") {
                //老系统（全科，群众），zltH5有多用户需要手动选择
                this.setState({ toH5PageUrl: h5Url, toH5PageName: PageName, toH5OutCode: outCode })
                isShowSltUser = this.getOldUserList();
            }

            //判断是否有老系统的用户选择，默认都是新系统
            if (isShowSltUser) {
                let isOldPage = false;

                if (PageName.indexOf('http') >= 0 || outCode.toLowerCase() == "zlth5") {
                    isOldPage = true
                }

                self.props.navigation.navigate('Web', {
                    outCode: outCode,
                    h5Url: h5Url,
                    isOldPage: isOldPage  //老版本H5只能url获取token
                })
            }

        } else {
            //LongBanManage todo:需要选择用户- this.getOldUserList();
            if (PageName == "LongBanManage") {
                this.setState({ toH5PageUrl: 'LongBanManage', })

                isShowSltUser = this.getOldUserList();
                if (isShowSltUser) this.getZLTtoken()

            } else {
                if (typeof (PageName) != "undefined" && PageName != '') global.navigation.navigate(PageName);
            }

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

    toPatrolDailyTrack(id) {
        this.props.navigation.navigate('PatrolDaily');
    }

    _tabs = (id) => {
        console.log(id);
        this.setState({ activeId: id })

        this.laodAppMenuList(id, this.state.otherMuenList, 'other')
    }

    _close(val) {
        this.setState({ sltUserShow: false })
    }

    sltOldUser(userName, index) {

        global.zltUser.userName = userName
        this.setState({ sltUserName: userName })
    }

    navSltUserToH5Url() {

        if (this.state.sltUserName == "") {
            alert('请选择用户')
            return
        }

        this.setState({ sltUserShow: false })

        let h5Url = this.state.toH5PageUrl;
        let PageName = this.state.toH5PageName;
        let outCode = this.state.toH5OutCode;

        if (this.state.toH5PageUrl == "LongBanManage") {
            this.getZLTtoken();
        } else {

            self.props.navigation.navigate('Web', {
                outCode: outCode,
                h5Url: h5Url,
                isOldPage: true  //老版本H5只能url获取token
            })

        }
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

                <ScrollView style={{
                    width: '100%',
                }} ref={(r) => this.scrollview = r}
                    onScroll={this._onScroll.bind(this)}
                    contentContainerStyle={{ paddingBottom: scaleSize(10) }}>

                    <View style={styles.swiperContainer}>

                        <View>

                            <View style={styles.titlePostion}>
                                <View style={styCom.FlexBetween}>
                                    <View><Text style={styles.titleText}>首页</Text></View>

                                    {/* <TouchableOpacity style={{ marginLeft: '73%' }}
                                        onPress={() => { this.toPatrolDailyTrack('11') }}
                                    >
                                        <SvgUri width="26" height="26"
                                            svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.kaoqing}" fill="#fff"></path></svg>`} />

                                    </TouchableOpacity> */}
                                </View>
                            </View>

                            <Swiper
                                // autoplay={true}
                                // autoplayTimeout={10}

                                style={styles.swiperStyle}
                                height={scaleSize(540)}
                                // index={this.state.bannerIndex}
                                // horizontal={true}
                                // loop={true}
                                // showsButtons={true}
                                // paginationStyle={{ bottom: scaleSize(10) }}

                                // onMomentumScrollEnd={(e, state, context) => { this.state.bannerIndex = state.index;console.log(state.index) }}
                                dot={<View style={{ backgroundColor: 'rgba(0,0,0,.2)', width: 5, height: 5, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 0, marginBottom: 20 }} />}
                                activeDot={<View style={{ backgroundColor: '#fff', width: 8, height: 8, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 0, marginBottom: 20 }} />}
                            >
                                {this.renderSwiper()}
                            </Swiper>
                        </View>

                        <View style={[styles.topMuen, styles.borderBan]}>

                            {
                                this.state.findMsgList.length > 0 && this.state.findMsgList[0].content ?
                                    <TouchableOpacity
                                        activeOpacity={0.6}
                                        style={[styles.msgCon, styCom.FlexBetween]}
                                        onPress={() => this.navToH5Url('/pages/me/myNews/index')}
                                    >
                                        <View style={styCom.FlexBetween}>
                                            <SvgUri width="20" height="20"
                                                svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.laba}" fill="#F40603"></path></svg>`} />

                                            <Text style={{ marginLeft: scaleSize(10) }}>{this.state.findMsgList[0].content}</Text>
                                        </View>

                                        <View>
                                            <Text style={{ color: '#999', fontSize: scaleSize(28), marginLeft: scaleSize(30) }}>更多</Text>
                                        </View>
                                    </TouchableOpacity>
                                    : null
                            }

                            {
                                // 巡查上报，所有事件
                                this.state.eventMuenList.length > 0 ?
                                    <View style={[styles.topCom, styles.borderBan]}>
                                        {this.laodAppMenuList(0, this.state.eventMuenList, 'eventMenu')}
                                    </View> : null
                            }
                        </View>
                    </View>

                    <View>
                        {
                            //我的任务
                            this.state.myTaskMeunList.length > 0 ?
                                <View style={styles.iconCom}>
                                    <View style={styles.borderBottom}><Text style={styles.muenTitle01}>任务管理</Text></View>

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
                                        <Tabs style={{ paddingTop: scaleSize(25) }} status={this.state.activeId} tabList={this.state.tabList} tab={this._tabs.bind(this)} borderShow={false} />
                                    </View>

                                    {this.laodAppMenuList(this.state.activeId, this.state.otherMuenList, 'other')}
                                </View> : null
                        }
                    </View>

                </ScrollView>

                {/* <Bottom active="h" navigation={this.props.navigation} /> */}
                <UpdateVersion />

                {/* 选择多用户的功能*/}
                <AlertContainer
                    alertShow={this.state.sltUserShow}
                    iscolse={true}
                    submit={
                        this.navSltUserToH5Url.bind(this)
                    }
                    close={
                        this._close.bind(this)
                    }
                    title={'提示'}
                    btnTxt={'确定'}
                    cancelTxt={'取消'}
                    isOkShow={true}
                    isCancelShow={this.state.isForce ? false : true}
                    style={{
                        width: '90%',
                    }}>

                    <View style={{ marginBottom: scaleSize(20) }}>
                        <Text>该用户在旧统一分拨系统存在多个账号，请确认登录账号!</Text>
                    </View>

                    <View style={styles.userBox}>
                        {
                            this.state.oldUserList.map((item, index) => {
                                return <TouchableOpacity
                                    style={[item == this.state.sltUserName ? styles.userItemON : styles.userItem,]}
                                    onPress={() => this.sltOldUser(item, index)}
                                    key={index}
                                >
                                    <Text style={{ color: '#fff', }}>{item}</Text>
                                </TouchableOpacity>
                            })
                        }
                    </View>

                </AlertContainer>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        display: 'flex',
    },

    userBox: {
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: scaleSize(20),
    },

    userItem: {
        padding: scaleSize(15),
        marginRight: scaleSize(20),
        borderRadius: scaleSize(5),
        backgroundColor: '#ccc'
    },

    userItemON: {
        padding: scaleSize(15),
        marginRight: scaleSize(20),
        borderRadius: scaleSize(5),
        backgroundColor: '#3c9cff'
    },

    userMeunIcon: {
        width: scaleSize(50),
        height: scaleSize(50)
    },

    topMuen: {
        marginTop: scaleSize(-70)
    },

    borderBan: {
        borderRadius: scaleSize(20),
        marginLeft: scaleSize(20),
        marginRight: scaleSize(20),

        backgroundColor: '#fff',
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

    otherView: {
        paddingBottom: scaleSize(20),
        margin: scaleSize(20),
        borderBottomColor: '#EDEDED',
        borderBottomWidth: 1,

    },

    rightIcon: {
        width: scaleSize(25),
        height: scaleSize(25)
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
        borderBottomColor: '#F2F2F2', borderBottomWidth: 1, padding: scaleSize(30),
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
        color: '#333', fontSize: scaleSize(28), fontWeight: '500', marginTop: scaleSize(10), marginBottom: scaleSize(10)
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
        display: 'flex',
        position: 'relative',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },

    iconImgTop: {
        height: scaleSize(95), width: scaleSize(95),
    },
    iconImgTop01: {
        height: scaleSize(90), width: scaleSize(90),
    },

    iconImgTop03: {
        height: scaleSize(66), width: scaleSize(66), marginRight: scaleSize(30),
    },


    titlePostion: {
        position: 'absolute',
        zIndex: 110,
        top: 30,
        left: 15,
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
        // backgroundColor: '#fff',
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
        // borderRadius: scaleSize(20)
    },

    iconCom: {
        backgroundColor: '#fff',
        // padding: scaleSize(20),
        marginLeft: scaleSize(20),
        marginRight: scaleSize(20),
        marginBottom: scaleSize(20),
        borderRadius: scaleSize(20),
    },

    topCom: {
        backgroundColor: '#fff',
        padding: scaleSize(30),
        paddingBottom: scaleSize(10),
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
        paddingTop: scaleSize(0),
        fontWeight: 'bold',
    },

});
