import React, { Component } from 'react';
import {
    View,
    Text,
    Platform,
    BackHandler,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    NativeModules,
    FlatList,
} from 'react-native';
import Load from '../../components/Loading/Index';
import CommonStyles from "../../styles";
import { deviceWidth, deviceHeight, scaleSize } from '../../tools/adaptation';
import AlertContainer from '../../components/Public/AlertContainer';
import { toastShort } from "../../tools/toastUtil";
import { post } from "../../request/NetUtility";

import { storageGet, storageSet } from '../../storage/index'
import List from '../../components/Index/LongBanManageList';
import Button from '../../components/Public/Button';
import { Decrypt, addbase64, addMD5 } from "../../tools/comm";
import FormTable from '../../components/Public/FormTable';

let n, load, back, self;
let ITEM_HEIGHT = 100;
let pageSize = 10;

// let url="http://10.143.3.4:8092" ;
let url = "http://218.17.84.2:8092"

export default class LongBanManage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            idType: global.zltUser.info.identity == 9 || global.zltUser.info.identity == 11 ? 1 : 2,//身份（1：督查员，2：网格员）

            roleName: (global.zltUser != null && global.zltUser.info != null && (global.zltUser.info.identity == 9 || global.zltUser.info.identity == 11)) ? '督查员' : '网格员',

            alertShow: false,
            btnTxt: '搜索',
            title: '更多查询条件',
            searchType: 0,//搜索类型（0：外部搜索，1：更多搜索）
            searchForm: {
                name: '',
                mobile: '',
                startDate: '',
                endDate: '',
                streetId: 0,
                streetName: '街道',
                communityId: 0,
                communityName: '社区',
                gridId: 0,
                gridName: '网格',
                inspector_sear: 1,
            },
            refreshing: false,
            flatSHow: false,
            offset: 1,
            noArr: false,//判断是否还有数据
            data: [],
            total: 0,
            streets: [],//街道
            communitys: [],//社区
            grids: [],//网格
            // isMustSelect: global.zltUser.info.princeArea != null && global.zltUser.info.princeArea.length > 1,
            isMustSelect: false,
            pStreetName: '',
            pGridName: '',
            form: {
                streetId: null,
                communityId: null,
                gridId: null,
                streetName: null,
                communityName: null,
                gridName: null,
            },
            newstreets: [],
            newcommunitys: [],
            newgrids: [],
        }
    }

    componentDidMount() {

        let pStreetName = '', pGridName = '';
        if ((global.zltUser.info.princeArea != null && global.zltUser.info.princeArea.length == 1) || (global.zltUser.info.identity == 9 || global.zltUser.info.identity == 11)) {
            let { streetId, communityId, gridId, streetName, communityName, gridName } = global.zltUser.info.princeArea[0];
            pStreetName = streetName; pGridName = gridName;
            this.state.pStreetName = pStreetName;
            this.state.pGridName = pGridName;
            // self._loading(true);

            NativeModules.AMapLocationModule.generateToken().then(
                (data) => {

                    // alert(data.token)

                    let secret = '7f63ff244577c2eb1716ef6685bedd8e';
                    let params = {
                        roleName: this.state.roleName,
                        streetName: pStreetName == '' ? '光明区' : pStreetName,
                        gridName: pGridName,
                        userName: global.zltUser.info.userName
                    };
                    let sortedKeyArray = Object.keys(params).sort();
                    let paramStr = '';
                    for (let sortedKey of sortedKeyArray) {
                        paramStr += `${sortedKey}=${params[sortedKey]}&`;
                    }
                    paramStr += secret;
                    let base64Data = addbase64(paramStr);
                    let baseMd5 = addMD5(base64Data);

                    post(url + '/ZLTCommon/APPLogin', {
                        // token:data.token,
                        // roleName:"网格员",
                        // streetName:"",
                        // gridName:"光明01",
                        // userName:"testxc2"

                        token: data.token,
                        accToken: baseMd5,
                        roleName: this.state.roleName,
                        streetName: pStreetName == '' ? '光明区' : pStreetName,
                        gridName: pGridName,
                        userName: global.zltUser.info.userName,
                    }, null, function (res) {
                        self._loading(false);
                        if (res.error == '0') {
                            global.longBan.info = res.userInfo;

                            storageSet('curLongBanUserInfo', global.longBan.info);
                            self._getList('');

                        } else {
                            toastShort('楼栋长管理登录失败！', 'bottom');
                        }
                    }, self).then(() => {
                        // console.log('成功');
                    }).catch((error) => {
                        // console.log(error);
                    });
                }
            ).catch(
                (err) => {
                    toastShort('获取token失败', 'bottom');
                    self._loading(false);
                }
            );
        } else if (global.zltUser.info.princeArea != null && global.zltUser.info.princeArea.length > 1) {
            // this._getNewStreet();
            //街道社区网格回显
            // if(global.user.info.princeArea!=null && global.user.info.princeArea.length>0){
            //
            //     let {streetId,communityId,gridId,streetName,communityName,gridName}=global.user.info.princeArea[0];
            //
            //     this.setState({
            //         form:Object.assign({},this.state.form,{
            //             streetId:streetId,
            //             communityId:communityId,
            //             gridId:gridId,
            //             streetName:streetName,
            //             communityName:communityName,
            //             gridName:gridName,
            //         })
            //     })
            //     if(streetId!=null){
            //         this._getNewCommit(streetId);
            //     }
            //     if(communityId!=null){
            //         this._getNewGrid(communityId);
            //     }
            // }
            let newGrids = [];
            this.setState({
                form: Object.assign({}, this.state.form, {
                    gridName: global.zltUser.info.princeArea[0].gridName,
                })
            })
            for (let i = 0; i < global.zltUser.info.princeArea.length; i++) {
                newGrids.push(global.zltUser.info.princeArea[i].gridName);
            }
            this.setState({
                newgrids: newGrids,
            })
        } else if (global.zltUser.info.princeArea == null || global.zltUser.info.princeArea.length == 0) {
            self._loading(true);
            let secret = '7f63ff244577c2eb1716ef6685bedd8e';
            let params = {
                roleName: this.roleName,
                streetName: '光明区',
                gridName: '',
                userName: global.zltUser.info.userName,
            };
            let sortedKeyArray = Object.keys(params).sort();
            let paramStr = '';
            for (let sortedKey of sortedKeyArray) {
                paramStr += `${sortedKey}=${params[sortedKey]}&`;
            }
            paramStr += secret;
            let base64Data = addbase64(paramStr);
            let baseMd5 = addMD5(base64Data);

            NativeModules.AMapLocationModule.generateToken().then(
                (data) => {
                    post(url + '/ZLTCommon/APPLogin', {

                        token: data.token,
                        accToken: baseMd5,
                        roleName: this.roleName,
                        streetName: '光明区',
                        gridName: '',
                        userName: global.zltUser.info.userName,
                    }, null, function (res) {
                        self._loading(false);
                        if (res.error == '0') {
                            global.longBan.info = res.userInfo;
                            storageSet('curLongBanUserInfo', global.longBan.info);

                            self._getList('');

                        } else {
                            toastShort('楼栋长管理登录失败！', 'bottom');
                        }
                    }, self).then(() => {
                        // console.log('成功');
                    }).catch((error) => {
                        // console.log(error);
                    });
                }
            ).catch(
                (err) => {
                    toastShort('获取token失败', 'bottom');
                    self._loading(false);
                }
            );
        }


        if (this.state.idType == '1') {//督察员
            this._getStreet();
        }
    }

    //获取街道
    _getNewStreet() {
        let _this = this;
        post(global.requestApi + '/eventUpload/getStreetSelect', null, null, function (res) {
            if (res.hasOwnProperty("code") && res.code == '1') {
                toastShort(res.msg, 'bottom');
                n.navigate('login');
                return false;
            }

            if (res.flag) {
                if (global.zltUser.info.princeArea == null || global.zltUser.info.princeArea.length == 0) {
                    _this.setState({
                        newstreets: res.data,
                    });
                } else {
                    var map = {},
                        dest = [];
                    for (let i = 0; i < global.zltUser.info.princeArea.length; i++) {
                        var ai = global.zltUser.info.princeArea[i];
                        if (!map[ai.streetId]) {
                            dest.push(ai.streetId);
                            map[ai.streetId] = ai;
                        }
                    }
                    let streetList = [];
                    for (let i = 0; i < res.data.length; i++) {
                        for (let j = 0; j < dest.length; j++) {
                            if (res.data[i].id == dest[j]) {
                                streetList.push(Object.assign({}, res.data[i]));
                            }
                        }
                    }

                    _this.setState({
                        newstreets: streetList,
                    });
                }
            } else {
                toastShort(res.msg, 'bottom');
            }
        }).then(() => {
            // console.log('成功');
        }).catch((error) => {
            // console.log(error);
            toastShort("请求失败", 'bottom');//超时会在这里
        });
    }

    // 获取社区
    _getNewCommit(id) {
        let _this = this;
        post(global.requestApi + '/eventUpload/getCommunitySelect', { sessionId: global.zltUser.sessionId, streetId: id }, null, function (res) {
            if (res.hasOwnProperty("code") && res.code == '1') {
                toastShort(res.msg, 'bottom');
                n.navigate('login');
                return false;
            }

            if (res.flag) {
                if (global.zltUser.info.princeArea == null || global.zltUser.info.princeArea.length == 0) {
                    _this.setState({
                        newcommunitys: res.data,
                    });
                } else {
                    var map = {},
                        dest = [];
                    for (let i = 0; i < global.zltUser.info.princeArea.length; i++) {
                        var ai = global.zltUser.info.princeArea[i];
                        if (!map[ai.communityId]) {
                            dest.push(ai.communityId);
                            map[ai.communityId] = ai;
                        }
                    }

                    let communityList = [];
                    for (let i = 0; i < res.data.length; i++) {
                        for (let j = 0; j < dest.length; j++) {
                            if (res.data[i].id == dest[j]) {
                                communityList.push(Object.assign({}, res.data[i]));
                            }
                        }
                    }

                    _this.setState({
                        newcommunitys: communityList,
                    });

                }
            } else {
                toastShort(res.msg, 'bottom');
            }
        }).then(() => {
            // console.log('成功');
        }).catch((error) => {
            // console.log(error);
        });
    }

    //获取网格
    _getNewGrid(id) {
        let _this = this;
        post(global.requestApi + '/eventUpload/getGridSelect', { sessionId: global.zltUser.sessionId, communityId: id }, null, function (res) {
            if (res.hasOwnProperty("code") && res.code == '1') {
                toastShort(res.msg, 'bottom');
                n.navigate('login');
                return false;
            }

            if (res.flag) {
                if (global.zltUser.info.princeArea == null || global.zltUser.info.princeArea.length == 0) {
                    _this.setState({
                        newgrids: res.data,
                    });
                } else {
                    var map = {},
                        dest = [];
                    for (let i = 0; i < global.zltUser.info.princeArea.length; i++) {
                        var ai = global.zltUser.info.princeArea[i];
                        if (!map[ai.gridId]) {
                            dest.push(ai.gridId);
                            map[ai.gridId] = ai;
                        }
                    }

                    let gridList = [];
                    for (let i = 0; i < res.data.length; i++) {
                        for (let j = 0; j < dest.length; j++) {
                            if (res.data[i].id == dest[j]) {
                                gridList.push(Object.assign({}, res.data[i]));
                            }
                        }
                    }

                    _this.setState({
                        newgrids: gridList,
                    });
                }
            } else {
                toastShort(res.msg, 'bottom');
            }
        }).then(() => {
            // console.log('成功');
        }).catch((error) => {
            // console.log(error);
        });
    }

    //获取街道
    _getStreet() {
        let _this = this;
        post(url + '/ComLongBanInfo/Sel_GetCurrentStreet?DepartmentId=1', null, null, function (res) {
            if (res.result == '1') {
                // _this.setState({
                //     streets:res.rows,
                // });
                if (global.zltUser.info.princeArea == null || global.zltUser.info.princeArea.length == 0) {
                    _this.setState({
                        streets: res.rows,
                    });
                } else {
                    var map = {},
                        dest = [];
                    for (let i = 0; i < global.zltUser.info.princeArea.length; i++) {
                        var ai = global.zltUser.info.princeArea[i];
                        if (!map[ai.streetName]) {
                            dest.push(ai.streetName);
                            map[ai.streetName] = ai;
                        }
                    }
                    let streetList = [];
                    if (dest.length != 0) {
                        for (let i = 0; i < res.rows.length; i++) {
                            for (let j = 0; j < dest.length; j++) {
                                if (res.rows[i].name == dest[j]) {
                                    streetList.push(Object.assign({}, res.rows[i]));
                                }
                            }
                        }
                    } else {
                        streetList = res.rows;
                    }

                    _this.setState({
                        streets: streetList,
                    });
                }
            } else {
                toastShort(res.message, 'bottom');
            }
        }).then(() => {
            // console.log('成功');
        }).catch((error) => {
            // console.log(error);
        });
    }

    // 获取社区
    _getCommit(id) {
        let _this = this;
        post(url + '/ComLongBanInfo/Sel_GetCommonity?streetId=' + id, null, null, function (res) {
            if (res.result == '1') {
                // _this.setState({
                //     communitys:res.rows,
                // });

                if (global.zltUser.info.princeArea == null || global.zltUser.info.princeArea.length == 0) {
                    _this.setState({
                        communitys: res.rows,
                    });
                } else {
                    var map = {},
                        dest = [];
                    for (let i = 0; i < global.zltUser.info.princeArea.length; i++) {
                        var ai = global.zltUser.info.princeArea[i];
                        let communityName = ai.communityName;
                        if (communityName.indexOf('社区') == -1)
                            communityName = communityName + '社区';

                        if (!map[communityName]) {
                            dest.push(communityName);
                            map[communityName] = ai;
                        }
                    }

                    let communityList = [];
                    for (let i = 0; i < res.rows.length; i++) {
                        for (let j = 0; j < dest.length; j++) {
                            if (res.rows[i].name == dest[j]) {
                                communityList.push(Object.assign({}, res.rows[i]));
                            }
                        }
                    }

                    if (communityList.length == 0)
                        communityList = res.rows;

                    _this.setState({
                        communitys: communityList,
                    });
                }
            } else {
                toastShort(res.message, 'bottom');
            }
        }).then(() => {
            // console.log('成功');
        }).catch((error) => {
            // console.log(error);
        });
    }

    //获取网格
    _getGrid(id) {
        let _this = this;
        post(url + '/ComLongBanInfo/Sel_GetCommonityGrid?commonityId=' + id, null, null, function (res) {
            if (res.result == '1') {
                // _this.setState({
                //     grids:res.rows,
                // });

                if (global.zltUser.info.princeArea == null || global.zltUser.info.princeArea.length == 0) {
                    _this.setState({
                        grids: res.rows,
                    });
                } else {
                    var map = {},
                        dest = [];
                    for (let i = 0; i < global.zltUser.info.princeArea.length; i++) {
                        var ai = global.zltUser.info.princeArea[i];
                        if (!map[ai.gridName]) {
                            dest.push(ai.gridName);
                            map[ai.gridName] = ai;
                        }
                    }

                    let gridList = [];
                    for (let i = 0; i < res.rows.length; i++) {
                        for (let j = 0; j < dest.length; j++) {
                            if (res.rows[i].name == dest[j]) {
                                gridList.push(Object.assign({}, res.rows[i]));
                            }
                        }
                    }

                    if (gridList.length == 0)
                        gridList = res.rows;

                    _this.setState({
                        grids: gridList,
                    });
                }
            } else {
                toastShort(res.message, 'bottom');
            }
        }).then(() => {
            // console.log('成功');
        }).catch((error) => {
            // console.log(error);
        });
    }

    // 获取数据
    _getList(type) {
        if (type == '') {
            self._loading(true);
        }

        let postData = {};
        if (self.state.idType == '1') {//督查员
            if (this.state.searchType == 0) {
                postData = {
                    name: self.state.searchForm.name,
                    DepartmentId: global.longBan.info.DepartmentId,
                    mobile: '',
                    startDate: '',
                    endDate: '',
                    search_type: 'inspector',
                    street_id: 0,
                    comunity_id: 0,
                    grid_id: 0,
                    inspector_sear: 3,
                    pageIndex: self.state.offset,
                    pageSize: pageSize
                };
            } else {
                postData = {
                    name: self.state.searchForm.name,
                    DepartmentId: global.longBan.info.DepartmentId,
                    mobile: self.state.searchForm.mobile,
                    startDate: self.state.searchForm.startDate,
                    endDate: self.state.searchForm.endDate,
                    search_type: 'inspector',
                    street_id: self.state.searchForm.streetId,
                    comunity_id: self.state.searchForm.communityId,
                    grid_id: self.state.searchForm.gridId,
                    inspector_sear: self.state.searchForm.inspector_sear,
                    pageIndex: self.state.offset,
                    pageSize: pageSize
                };
            }
        } else {//网格员
            postData = {
                name: self.state.searchForm.name,
                DepartmentId: global.longBan.info.DepartmentId,
                mobile: self.state.searchForm.mobile,
                startDate: self.state.searchForm.startDate,
                endDate: self.state.searchForm.endDate,
                pageIndex: self.state.offset,
                pageSize: pageSize
            };
        }

        post(url + '/ComLongBanInfo/GetLongbanInfoDataByPage', postData, null, function (res) {
            console.log(res);
            if (type == '') {
                self._loading(false);
            }
            self.setState({
                refreshing: false,
                flatSHow: true
            })

            if (res.result != '1') {
                toastShort('获取楼栋长信息失败！', 'bottom');
                return false;
            }

            let resdata = res.rows;
            if (resdata == null || resdata.length < 1) {
                self.setState({
                    noArr: true
                })
                if (type != '2') {
                    self.setState({
                        data: resdata,
                        total: 0,
                    })
                }
                return false;
            }
            if (type == '2') {
                let data = self.state.data;
                for (let i = 0; i < resdata.length; i++) {
                    data.push(resdata[i]);
                }
                self.setState({
                    data: data,
                    total: res.total,
                })

            } else {
                let data1 = [];
                for (let i = 0; i < resdata.length; i++) {
                    data1.push(resdata[i]);
                }
                console.log(data1);
                self.setState({
                    data: data1,
                    total: res.total
                })
            }
        }, self).then(() => {
            // console.log('成功');
        }).catch((error) => {
            // console.log(error);
        });
    }

    _onRefresh = (type) => {
        this.setState({
            refreshing: type == '1' ? false : true,
            noArr: false,
            data: [],
            offset: 1,
            total: 0,
        });

        this.state.offset = 1;
        this._getList(type == '1' ? '' : '3');
    }

    _empty = () => {
        return <View style={[CommonStyles.emptyContent]}>
            <Text style={[CommonStyles.empty, { marginTop: scaleSize(20) }]}>暂无数据</Text>
        </View>;
    }
    _renderItem = ({ item }) => {
        return (
            <View>
                <List item={{
                    banCode: item.banCode,
                    banaddress: item.banaddress,
                    ckrId: item.ckrId,
                    createTime: item.createTime,
                    createUserId: item.createUserId,
                    documentTypeName: item.documentTypeName,
                    id: item.id,
                    identificationNumber: item.identificationNumber,
                    isBlacklist: item.isBlacklist,
                    isEmphasize: item.isEmphasize,
                    lonId: item.lonId,
                    name: item.name,
                    permanentAddress: item.permanentAddress,
                    prevResultId: item.prevResultId,
                    residencePlace: item.residencePlace,
                    rowIndex: item.rowIndex,
                    sexName: item.sexName,
                    tel: item.tel,
                    totalScore: item.totalScore,
                    userName: item.userName,
                    action: () => { this._onRefresh('1'); },
                    streetName: item.streetName,
                    communityName: item.communityName,
                    gridName: item.gridName,
                    lastScore: item.lastScore,
                    lastUsername: item.lastUsername,
                    lastUpdateTime: item.lastUpdateTime,
                    lastckrId: item.lastckrId
                }} navigation={n} />
            </View>
        );
    }
    _header = () => {
        return null;
    }
    // _footer = () => {
    //     return <View style={[CommonStyles.footerTip]}><Text style={CommonStyles.empty}>{this.state.data.length > pageSize ? '到底了~' : ''}</Text></View>;
    // }
    _footer = () => {
        if (!this.state.flatSHow || this.state.noArr) {
            // return <View style={[CommonStyles.footerTip]}><Text style={CommonStyles.empty}>{this.state.data.length > pageSize ? '到底了~' : ''}</Text></View>;
            return <View style={[CommonStyles.footerTip]}><Text style={CommonStyles.empty}>{this.state.data.length > pageSize ? '到底了~' : ''}</Text></View>;
        } else {
            return <View style={[CommonStyles.footerTip]}><Image source={require('../../assets/loading.gif')} style={{ width: scaleSize(36), height: scaleSize(36) }}></Image></View>;
        }
    }
    _keyExtractor = (item, index) => index.toString();

    isLeapYear(year) {
        let cond1 = year % 4 == 0;  //条件1：年份必须要能被4整除
        let cond2 = year % 100 != 0;  //条件2：年份不能是整百数
        let cond3 = year % 400 == 0;  //条件3：年份是400的倍数
        //当条件1和条件2同时成立时，就肯定是闰年，所以条件1和条件2之间为“与”的关系。
        //如果条件1和条件2不能同时成立，但如果条件3能成立，则仍然是闰年。所以条件3与前2项为“或”的关系。
        //所以得出判断闰年的表达式：
        let cond = cond1 && cond2 || cond3;
        if (cond) {
            return true;
        } else {
            return false;
        }
    }

    //日期生成
    _createDateData = () => {
        let d = new Date();
        let year = d.getFullYear(), month = d.getMonth() + 1, date = d.getDate();
        let dataArray = [];
        for (let i = year - 50; i < year; i++) {
            let secondArray = [];
            let num = 0;
            for (let j = 1; j <= 12; j++) {
                let threeArray = [];
                if (j == 1 || j == 3 || j == 5 || j == 7 || j == 8 || j == 10 || j == 12) {
                    num = 31;
                } else if (j == 4 || j == 6 || j == 9 || j == 11) {
                    num = 30;
                } else {
                    num = this.isLeapYear(i) ? 29 : 28;
                }
                for (let k = 1; k <= num; k++) {
                    threeArray.push(k);
                }

                let three = {};
                three[j] = threeArray;
                secondArray.push(three)
            }

            let second = {};
            second[i] = secondArray
            dataArray.push(second)
        }

        let secondArray = [];
        let num = 0;
        for (let j = 1; j <= month; j++) {
            let threeArray = [];
            if (j == 1 || j == 3 || j == 5 || j == 7 || j == 8 || j == 10 || j == 12) {
                num = 31;
            } else if (j == 4 || j == 6 || j == 9 || j == 11) {
                num = 30;
            } else {
                num = this.isLeapYear(year) ? 29 : 28;
            }

            if (j == month) {
                num = date;
            }
            for (let k = 1; k <= num; k++) {
                threeArray.push(k);
            }

            let three = {};
            three[j] = threeArray;
            secondArray.push(three)
        }

        let second = {};
        second[year] = secondArray
        dataArray.push(second)

        return dataArray;
    }

    // 下拉选项
    _selectPicker = (type) => () => {

            let d=new Date();
            let year=d.getFullYear(),month=d.getMonth()+1,date=d.getDate();
            let _this = this;
            if(type == 'nstreet'){
                if(_this.state.newstreets.length < 1){
                    toastShort('暂无列表！','bottom');
                    return false;
                }
                let data = [];
                for(let i=0;i<_this.state.newstreets.length;i++){
                    data.push(_this.state.newstreets[i].name);
                }
                Picker.init({
                    pickerData: data,
                    selectedValue: [_this.state.form.streetName],
                    pickerTitleText:'选择街道',
                    pickerConfirmBtnText:'确定',
                    pickerCancelBtnText:'取消',
                    pickerTextEllipsisLen:12,
                    pickerBg:[255,255,255,1],
                    onPickerConfirm: data => {
                        for(let i=0;i<_this.state.newstreets.length;i++){
                            if(_this.state.newstreets[i].name == data[0]){
                                _this.setState({
                                    form:Object.assign({},_this.state.form,{streetId: _this.state.newstreets[i].id.toString(),streetName:data[0]}),
                                })
                                _this._getNewCommit(_this.state.newstreets[i].id);
                            };
                        }
                    },
                    onPickerCancel: data => {
                        Picker.hide();
                    },
                });
                Picker.show();
            }else if(type == 'ncommunity'){
                if(_this.state.form.streetId == ''){
                    toastShort('请先选择街道！','bottom');
                    return false
                }
                if(_this.state.newcommunitys.length < 1){
                    toastShort('暂无列表！','bottom');
                    return false;
                }
                let data = [];
                for(let i=0;i<_this.state.newcommunitys.length;i++){
                    data.push(_this.state.newcommunitys[i].name);
                }
                Picker.init({
                    pickerData: data,
                    selectedValue: [_this.state.form.communityName],
                    pickerTitleText:'选择社区',
                    pickerConfirmBtnText:'确定',
                    pickerCancelBtnText:'取消',
                    pickerTextEllipsisLen:12,
                    pickerBg:[255,255,255,1],
                    onPickerConfirm: data => {
                        if(data[0] == '全部'){return false}
                        for(let i=0;i<_this.state.newcommunitys.length;i++){
                            if(_this.state.newcommunitys[i].name == data[0]){
                                _this.setState({
                                    form:Object.assign({},_this.state.form,{communityId:_this.state.newcommunitys[i].id,communityName:data[0]})
                                })
                                _this._getNewGrid(_this.state.newcommunitys[i].id);
                            };
                        }
                    },
                    onPickerCancel: data => {
                        Picker.hide();
                    },
                });
                Picker.show();
            }else if(type =='ngrid'){
                // if(_this.state.form.communityId == ''){
                //     toastShort('请先选择社区！','bottom');
                //     return false
                // }
                if(_this.state.newgrids.length < 1){
                    toastShort('暂无列表！','bottom');
                    return false;
                }
                // let data = [];
                // for(let i=0;i<_this.state.newgrids.length;i++){
                //     data.push(_this.state.newgrids[i].gridName);
                // }
                Picker.init({
                    pickerData: _this.state.newgrids,
                    selectedValue: [_this.state.form.gridName],
                    pickerTitleText:'选择网格',
                    pickerConfirmBtnText:'确定',
                    pickerCancelBtnText:'取消',
                    pickerTextEllipsisLen:12,
                    pickerBg:[255,255,255,1],
                    onPickerConfirm: data => {
                        if(data[0] == '全部'){return false}
                        _this.setState({
                            form:Object.assign({},_this.state.form,{gridName:data[0]})
                        })
                        // for(let i=0;i<_this.state.newgrids.length;i++){
                        //     if(_this.state.newgrids[i].gridName == data[0]){
                        //         _this.setState({
                        //             form:Object.assign({},_this.state.form,{gridId:_this.state.newgrids[i].id,gridName:data[0]})
                        //         })
                        //     };
                        // }
                    },
                    onPickerCancel: data => {
                        Picker.hide();
                    },
                });
                Picker.show();
            }else if (type == 'beginDate') {
                if(this.state.searchForm.startDate!=''){
                    d=this.state.searchForm.startDate.split("-")
                    if(d.length==3){
                        year=d[0];month=d[1];date=d[2];
                    }
                }
                Picker.init({
                    pickerData: this._createDateData(),
                    selectedValue: [year,month,date],
                    pickerTitleText: '选择日期',
                    pickerConfirmBtnText: '确定',
                    pickerCancelBtnText: '取消',
                    pickerTextEllipsisLen: 12,
                    pickerBg: [255, 255, 255, 1],
                    onPickerConfirm: data => {
                        this.setState({searchForm:Object.assign({},this.state.searchForm,{startDate:data[0]+'-'+data[1]+'-'+data[2]})});
                    },
                    onPickerCancel: data => {
                        Picker.hide();
                    },
                });
                Picker.show();
            } else if (type == 'endDate') {
                if(this.state.searchForm.endDate!=''){
                    d=this.state.searchForm.endDate.split("-")
                    if(d.length==3){
                        year=d[0];month=d[1];date=d[2];
                    }
                }
                Picker.init({
                    pickerData: this._createDateData(),
                    selectedValue: [year,month,date],
                    pickerTitleText: '选择日期',
                    pickerConfirmBtnText: '确定',
                    pickerCancelBtnText: '取消',
                    pickerTextEllipsisLen: 12,
                    pickerBg: [255, 255, 255, 1],
                    onPickerConfirm: data => {
                        this.setState({searchForm:Object.assign({},this.state.searchForm,{endDate:data[0]+'-'+data[1]+'-'+data[2]})});
                    },
                    onPickerCancel: data => {
                        Picker.hide();
                    },
                });
                Picker.show();
            }else if(type == 'street'){
                if(_this.state.streets.length < 1){
                    toastShort('暂无列表！','bottom');
                    return false;
                }
                let data = [];
                for(let i=0;i<_this.state.streets.length;i++){
                    data.push(_this.state.streets[i].name);
                }
                Picker.init({
                    pickerData: data,
                    selectedValue: [_this.state.searchForm.streetName],
                    pickerTitleText:'选择街道',
                    pickerConfirmBtnText:'确定',
                    pickerCancelBtnText:'取消',
                    pickerTextEllipsisLen:12,
                    pickerBg:[255,255,255,1],
                    onPickerConfirm: data => {
                        for(let i=0;i<_this.state.streets.length;i++){
                            if(_this.state.streets[i].name == data[0]){
                                _this.setState({
                                    searchForm:Object.assign({},_this.state.searchForm,{streetId: _this.state.streets[i].id.toString(),streetName:data[0]}),
                                })
                                _this._getCommit(_this.state.streets[i].id);
                            };
                        }
                    },
                    onPickerCancel: data => {
                        Picker.hide();
                    },
                });
                Picker.show();
            }else if(type == 'community'){
                if(_this.state.searchForm.streetId == ''){
                    toastShort('请先选择街道！','bottom');
                    return false
                }
                if(_this.state.communitys.length < 1){
                    toastShort('暂无列表！','bottom');
                    return false;
                }
                let data = [];
                for(let i=0;i<_this.state.communitys.length;i++){
                    data.push(_this.state.communitys[i].name);
                }
                Picker.init({
                    pickerData: data,
                    selectedValue: [_this.state.searchForm.communityName],
                    pickerTitleText:'选择社区',
                    pickerConfirmBtnText:'确定',
                    pickerCancelBtnText:'取消',
                    pickerTextEllipsisLen:12,
                    pickerBg:[255,255,255,1],
                    onPickerConfirm: data => {
                        if(data[0] == '全部'){return false}
                        for(let i=0;i<_this.state.communitys.length;i++){
                            if(_this.state.communitys[i].name == data[0]){
                                _this.setState({
                                    searchForm:Object.assign({},_this.state.searchForm,{communityId:_this.state.communitys[i].id,communityName:data[0]})
                                })
                                _this._getGrid(_this.state.communitys[i].id);
                            };
                        }
                    },
                    onPickerCancel: data => {
                        Picker.hide();
                    },
                });
                Picker.show();
            }else if(type =='grid'){
                if(_this.state.searchForm.communityId == ''){
                    toastShort('请先选择社区！','bottom');
                    return false
                }
                if(_this.state.grids.length < 1){
                    toastShort('暂无列表！','bottom');
                    return false;
                }
                let data = [];
                for(let i=0;i<_this.state.grids.length;i++){
                    data.push(_this.state.grids[i].name);
                }
                Picker.init({
                    pickerData: data,
                    selectedValue: [_this.state.searchForm.gridName],
                    pickerTitleText:'选择网格',
                    pickerConfirmBtnText:'确定',
                    pickerCancelBtnText:'取消',
                    pickerTextEllipsisLen:12,
                    pickerBg:[255,255,255,1],
                    onPickerConfirm: data => {
                        if(data[0] == '全部'){return false}
                        for(let i=0;i<_this.state.grids.length;i++){
                            if(_this.state.grids[i].name == data[0]){
                                _this.setState({
                                    searchForm:Object.assign({},_this.state.searchForm,{gridId:_this.state.grids[i].id,gridName:data[0]})
                                })
                            };
                        }
                    },
                    onPickerCancel: data => {
                        Picker.hide();
                    },
                });
                Picker.show();
            }
    }

    // 正在加载中
    _loading(val) {
        if (val) {
            load = Load.show();
        } else {
            Load.hide(load)
        }
    }

    componentWillUnmount() {
        if (load) {
            this._loading(false);
        }
        this.setState = (state, callback) => {
            return;
        };
        if (Platform.OS === 'android') {
            BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
        }
    }

    onBackAndroid = () => {
        back();
        return true;
    };

    // 弹出框显示隐藏
    _close(val) {
        this.setState({
            alertShow: val
        })
    }

    _setGrid = () => {
        // for(let i=0;i<this.state.newstreets.length;i++){
        //     if(this.state.newstreets[i].id == this.state.form.streetId){
        //        this.state.pStreetName=this.state.newstreets[i].name;
        //         break;
        //     }
        // }
        //
        // for(let i=0;i<this.state.newgrids.length;i++){
        //     if(this.state.newgrids[i].id == this.state.form.gridId){
        //         this.state.pGridName=this.state.newgrids[i].gridName;
        //         break;
        //     }
        // }

        //streetId,communityId,gridId,streetName,communityName,gridName
        for (let i = 0; i < global.zltUser.info.princeArea.length; i++) {
            if (global.zltUser.info.princeArea[i].gridName == this.state.form.gridName) {
                this.state.pStreetName = global.zltUser.info.princeArea[i].streetName;
                this.state.pGridName = global.zltUser.info.princeArea[i].gridName;
            }
        }

        this.setState({ isMustSelect: false });

        // self._loading(true);
        let secret = '7f63ff244577c2eb1716ef6685bedd8e';
        let params = {
            roleName: this.roleName,
            streetName: self.state.pStreetName == '' ? '光明区' : self.state.pStreetName,
            gridName: self.state.pGridName,
            userName: global.zltUser.info.userName,
        };
        let sortedKeyArray = Object.keys(params).sort();
        let paramStr = '';
        for (let sortedKey of sortedKeyArray) {
            paramStr += `${sortedKey}=${params[sortedKey]}&`;
        }
        paramStr += secret;
        let base64Data = addbase64(paramStr);
        let baseMd5 = addMD5(base64Data);

        NativeModules.AMapLocationModule.generateToken().then(
            (data) => {
                post(url + '/ZLTCommon/APPLogin', {
                    // token:data.token,
                    // roleName:"网格员",
                    // streetName:"",
                    // gridName:"光明01",
                    // userName:"testxc2"

                    token: data.token,
                    accToken: baseMd5,
                    roleName: this.roleName,
                    streetName: self.state.pStreetName == '' ? '光明区' : self.state.pStreetName,
                    gridName: self.state.pGridName,
                    userName: global.zltUser.info.userName,
                }, null, function (res) {
                    self._loading(false);
                    if (res.error == '0') {
                        global.longBan.info = res.userInfo;


                        storageSet('curLongBanUserInfo', global.longBan.info);

                        self.state.offset = 1;
                        self._getList('');

                    } else {
                        toastShort('楼栋长管理登录失败！', 'bottom');
                    }
                }, self).then(() => {
                    // console.log('成功');
                }).catch((error) => {
                    // console.log(error);
                });
            }
        ).catch(
            (err) => {
                toastShort.show('获取token失败', 'bottom');
                self._loading(false);
            }
        );
    }

    render() {
        n = this.props.navigation;

        back = this.props.navigation.goBack;
        self = this;
        return (
            <View style={CommonStyles.containerFull}>

                {
                    //&& !(global.zltUser.info.identity == 9 || global.zltUser.info.identity == 11) 
                    this.state.isMustSelect ?
                        <View style={[CommonStyles.padT20, CommonStyles.resContent, { paddingBottom: scaleSize(160) }]}>
                            <View style={[styles.title]}><Text style={[styles.lefttxtstyle, { fontSize: scaleSize(28), textAlign: 'left', color: '#ffa200' }]}>请选择</Text></View>
                            {/*<FormTable name={'街道'}>*/}
                            {/*<TouchableOpacity*/}
                            {/*style={[CommonStyles.contentInputNoLeft]}*/}
                            {/*activeOpacity={1}*/}
                            {/*onPress={this._selectPicker('nstreet')}*/}
                            {/*>*/}
                            {/*<Text style={[CommonStyles.Input,CommonStyles.fs24,CommonStyles.lineHeight48]}>{this.state.form.streetId==null?'请选择街道':this.state.form.streetName}</Text>*/}
                            {/*<Image source={require('../../assets/arrowdown.png')} resizeMode="contain" style={[CommonStyles.posAb,CommonStyles.arrowdown]}></Image>*/}
                            {/*</TouchableOpacity>*/}
                            {/*</FormTable>*/}
                            {/*<FormTable name={'社区'}>*/}
                            {/*<TouchableOpacity*/}
                            {/*style={[CommonStyles.contentInputNoLeft]}*/}
                            {/*activeOpacity={1}*/}
                            {/*onPress={this._selectPicker('ncommunity')}*/}
                            {/*>*/}
                            {/*<Text style={[CommonStyles.Input,CommonStyles.fs24,CommonStyles.lineHeight48]}>{this.state.form.communityId==null?'请选择社区':this.state.form.communityName}</Text>*/}
                            {/*<Image source={require('../../assets/arrowdown.png')} resizeMode="contain" style={[CommonStyles.posAb,CommonStyles.arrowdown]}></Image>*/}
                            {/*</TouchableOpacity>*/}
                            {/*</FormTable>*/}
                            <FormTable name={'网格'}>
                                <TouchableOpacity
                                    style={[CommonStyles.contentInputNoLeft]}
                                    activeOpacity={1}
                                    onPress={this._selectPicker('ngrid')}
                                >
                                    <Text style={[CommonStyles.Input, CommonStyles.fs24, CommonStyles.lineHeight48]}>{this.state.form.gridName}</Text>
                                    <Image source={require('../../assets/arrowdown.png')} resizeMode="contain" style={[CommonStyles.posAb, CommonStyles.arrowdown]}></Image>
                                </TouchableOpacity>
                            </FormTable>

                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                flexWrap: 'wrap',
                                marginTop: scaleSize(30), /*paddingLeft:scaleSize(30),paddingRight:scaleSize(30)*/
                            }}>
                                <Button style={[{
                                    marginBottom: scaleSize(10),
                                    borderRadius: scaleSize(0)
                                }, { backgroundColor: '#ffa200' }]} type={'square'}
                                    title={'进入楼栋长管理主界面'} onPress={this._setGrid} />
                            </View>
                        </View>
                        :
                        <View>
                            <View style={{ backgroundColor: '#fff', borderColor: '#f0f3f8', borderBottomWidth: scaleSize(5) }}>
                                <View style={{ margin: scaleSize(20), flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ flex: 1, color: '#5a5a5a' }}>{this.state.idType == '1' ? '关键字' : '楼栋长姓名'}</Text>
                                    <View style={[styles.container, { flex: 3 }]}>
                                        <TextInput
                                            placeholder={this.state.idType == '1' ? '楼栋长姓名/楼栋编码' : ''}
                                            value={this.state.searchForm.name}
                                            style={styles.textInput}
                                            underlineColorAndroid='transparent' //设置下划线背景色透明 达到去掉下划线的效果
                                            onChangeText={(value) => this.setState({ searchForm: Object.assign({}, this.state.searchForm, { name: value }) })}
                                        />
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            style={{
                                                position: 'absolute',
                                                right: scaleSize(10)
                                            }}
                                            onPress={() => { this.state.searchType = 0; this._onRefresh('1') }}
                                        >
                                            <Image source={require('../../assets/search_l.png')} style={{
                                                height: scaleSize(32),
                                                width: scaleSize(32),
                                            }} />
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => {
                                            this.setState({ alertShow: true })
                                        }}
                                    >
                                        <Image source={require('../../assets/more_l.png')} resizeMode="cover" style={{
                                            height: scaleSize(64),
                                            width: scaleSize(64),
                                        }} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {
                                this.state.idType == 2 ?
                                    <TouchableOpacity
                                        style={styles.btn}
                                        activeOpacity={0.8}
                                        onPress={() => {
                                            n.navigate('LongBanEdit', {
                                                operType: "add"
                                            });
                                        }}
                                    >
                                        <Text style={{ color: '#5a5a5a' }}>新增楼栋长</Text>
                                    </TouchableOpacity>
                                    :
                                    null
                            }

                            <FlatList
                                style={[this.state.idType == 2 ? CommonStyles.containerHeight360 : CommonStyles.containerHeight180, { marginBottom: scaleSize(30), backgroundColor: '#f3f3f3' }]}
                                ref={(flatList) => this._flatList = flatList}
                                ListFooterComponent={this._footer}
                                ListHeaderComponent={this._header}
                                ListEmptyComponent={this._empty}
                                renderItem={this._renderItem}
                                numColumns={1}
                                refreshing={this.state.refreshing}
                                getItemLayout={(data, index) => (
                                    { length: ITEM_HEIGHT, offset: (ITEM_HEIGHT + 2) * index, index }
                                )}
                                onRefresh={this._onRefresh}//下拉刷新
                                onEndReachedThreshold={0.05}
                                keyExtractor={this._keyExtractor}
                                onEndReached={(info) => {//上拉加载更多
                                    // alert("滑动到底部了");
                                    if (!this.state.flatSHow) { return false }
                                    if (this.state.noArr) { return false; }
                                    this.state.offset = this.state.offset + 1;
                                    this._getList('2');
                                }}
                                data={this.state.data}>
                            </FlatList>

                            <AlertContainer
                                alertShow={this.state.alertShow}
                                submit={() => { this._close(false); this.state.searchType = 1; this._onRefresh('1') }}
                                close={
                                    this._close.bind(this)
                                }
                                cancelTxt={this.state.cancelTxt}
                                btnTxt={this.state.btnTxt}
                                title={this.state.title}
                                style={{ width: '90%' }}>
                                {
                                    this.state.idType == 2 ?
                                        <TextInput
                                            placeholder='手机号码'
                                            style={[styles.textInput]}
                                            value={this.state.searchForm.mobile}
                                            underlineColorAndroid='transparent' //设置下划线背景色透明 达到去掉下划线的效果
                                            onChangeText={(value) => this.setState({ searchForm: Object.assign({}, this.state.searchForm, { mobile: value }) })}
                                        />
                                        :
                                        null
                                }
                                <Text style={[styles.txt, { color: '#5a5a5a', }]}>上次巡查时间</Text>

                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        style={{ width: '80%' }}
                                        onPress={this._selectPicker('beginDate')}
                                    >
                                        <Text style={[styles.textInput]}>{this.state.searchForm.startDate == '' ? '开始时间' : this.state.searchForm.startDate}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        style={{ width: '20%' }}
                                        onPress={() => {
                                            this.setState({ searchForm: Object.assign({}, this.state.searchForm, { startDate: '' }) })
                                        }}
                                    >
                                        <Text style={{ color: '#5a5a5a', textAlign: 'center' }}>清空</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flexDirection: 'row', marginTop: scaleSize(10), alignItems: 'center' }}>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        style={{ width: '80%' }}
                                        onPress={this._selectPicker('endDate')}
                                    >
                                        <Text style={[styles.textInput]}>{this.state.searchForm.endDate == '' ? '结束时间' : this.state.searchForm.endDate}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        style={{ width: '20%' }}
                                        onPress={() => {
                                            this.setState({ searchForm: Object.assign({}, this.state.searchForm, { endDate: '' }) })
                                        }}
                                    >
                                        <Text style={{ color: '#5a5a5a', textAlign: 'center' }}>清空</Text>
                                    </TouchableOpacity>
                                </View>
                                {
                                    this.state.idType == '1' ?
                                        <View>
                                            <View style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                marginBottom: scaleSize(10),
                                            }}>
                                                <TouchableOpacity
                                                    style={[CommonStyles.contentInputNoLeft, { width: '33%', }]}
                                                    activeOpacity={1}
                                                    onPress={this._selectPicker('street')}
                                                >
                                                    <Text style={[CommonStyles.Input, CommonStyles.fs24, CommonStyles.lineHeight48]}>{this.state.searchForm.streetName}</Text>
                                                    <Image source={require('../../assets/arrowdown.png')} resizeMode="contain" style={[CommonStyles.posAb, CommonStyles.arrowdown]}></Image>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[CommonStyles.contentInputNoLeft, { width: '33%', }]}
                                                    activeOpacity={1}
                                                    onPress={this._selectPicker('community')}
                                                >
                                                    <Text style={[CommonStyles.Input, CommonStyles.fs24, CommonStyles.lineHeight48]}>{this.state.searchForm.communityName}</Text>
                                                    <Image source={require('../../assets/arrowdown.png')} resizeMode="contain" style={[CommonStyles.posAb, CommonStyles.arrowdown]}></Image>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[CommonStyles.contentInputNoLeft, { width: '33%', }]}
                                                    activeOpacity={1}
                                                    onPress={this._selectPicker('grid')}
                                                >
                                                    <Text style={[CommonStyles.Input, CommonStyles.fs24, CommonStyles.lineHeight48]}>{this.state.searchForm.gridName}</Text>
                                                    <Image source={require('../../assets/arrowdown.png')} resizeMode="contain" style={[CommonStyles.posAb, CommonStyles.arrowdown]}></Image>
                                                </TouchableOpacity>
                                            </View>
                                            <View style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                marginBottom: scaleSize(10)
                                            }}>
                                                <Button
                                                    type={'square'}
                                                    title={"未评分"}
                                                    style={[{ width: '33%', borderWidth: scaleSize(1), borderColor: '#0c7ece' }, { backgroundColor: this.state.searchForm.inspector_sear == '0' ? '#0c7ece' : '#fff' }]}
                                                    styleFs={{ color: '#3d4145' }}
                                                    onPress={() => this._changeInspector(0)}
                                                />
                                                <Button
                                                    type={'square'}
                                                    title={"待督察"}
                                                    style={[{ width: '33%', borderWidth: scaleSize(1), borderColor: '#0c7ece' }, { backgroundColor: this.state.searchForm.inspector_sear == '1' ? '#0c7ece' : '#fff' }]}
                                                    styleFs={{ color: '#3d4145' }}
                                                    onPress={() => this._changeInspector(1)}
                                                />
                                                <Button
                                                    type={'square'}
                                                    title={"超月察"}
                                                    style={[{ width: '33%', borderWidth: scaleSize(1), borderColor: '#0c7ece' }, { backgroundColor: this.state.searchForm.inspector_sear == '2' ? '#0c7ece' : '#fff' }]}
                                                    styleFs={{ color: '#3d4145' }}
                                                    onPress={() => this._changeInspector(2)}
                                                />
                                            </View>
                                        </View>
                                        :
                                        null
                                }
                            </AlertContainer>
                        </View>
                }


            </View>
        )
    }

    _changeInspector(type) {
        this.setState({
            searchForm: Object.assign({}, this.state.searchForm, { inspector_sear: type })
        })
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        //width:deviceWidth-scaleSize(220),
        // marginLeft:scaleSize(20),
        // marginRight:scaleSize(20),
        height: scaleSize(60),
        borderWidth: scaleSize(1),
        borderRadius: scaleSize(5),
        borderColor: '#f3f3f3',
        alignItems: 'center',
        backgroundColor: '#f3f3f3',
    },
    textInput: {
        borderWidth: scaleSize(1),
        borderRadius: scaleSize(5),
        borderColor: '#d8d8d8',
        backgroundColor: '#fff',
        width: '100%',
        height: scaleSize(60),
        padding: scaleSize(10),
    },
    btn: {
        marginTop: scaleSize(20),
        marginBottom: scaleSize(20),
        borderColor: '#ecebeb',
        borderWidth: scaleSize(1),
        borderRadius: scaleSize(5),
        marginLeft: scaleSize(20),
        marginRight: scaleSize(20),
        paddingTop: scaleSize(10),
        paddingBottom: scaleSize(10),
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        paddingLeft: scaleSize(20),
        paddingBottom: scaleSize(20)
    },
    lefttxtstyle: {
        // color:'#666666',
        color: '#4A4A4A',
        textAlignVertical: 'center',
        fontSize: scaleSize(24),
        textAlign: 'right',
        paddingRight: scaleSize(30),
        backgroundColor: 'transparent'
    }
});