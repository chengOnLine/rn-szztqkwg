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
    ScrollView
} from 'react-native';
import Load from '../../components/Loading/Index';
import CommonStyles from "../../styles/longBan";
import { deviceWidth, scaleSize } from "../../tools/adaptation";
import Picker from 'react-native-picker';
import { toastShort } from "../../tools/toastUtil";
import { get, post } from '../../request/NetUtility';
import FormTable from '../../components/Public/FormTable';
import { Decrypt, removeArr } from '../../tools/comm';
import CameraSelect from '../../components/Public/CameraSelect';
import Button from '../../components/Public/Button';

let self, load, n;
// let url=global.isEnc?Decrypt(global.longBan.url):global.longBan.url;
let url = "";

export default class LongBanEdit extends Component {
    constructor(props) {
        super(props);
        if (global.longBan.info == null) {
            this.props.navigation.navigation('LongBanManage');
        }
        this.state = {
            form: {
                userid: global.longBan.info.Id,
                name: '',//姓名
                sex: 1,//性别（1：男，2：女）
                birthday: '',//出生年月
                mz: '',//民族
                zjlx: '',//证件类型
                zjhm: '',//证件号码
                hyzk: '',//婚姻状态
                whcd: '',//文化程度
                zzmm: '',//整治面貌
                lxsj: '',//手机号码
                gh: '',//固话
                jd: null,
                jdtxt: '',
                sq: null,
                sqtxt: '',
                wg: null,
                wgtxt: '',
                ldbm: '',//楼栋编码
                banAddress: '',//楼栋地址
                ldxz: '',//楼栋性质
                propertyManage: '',//是否物业管理
                banFloor: '',//楼层数
                roomCount: '',//间/套数
                updateBy: '',//楼长资料最后修改人
                updateTime: '',//楼长修改时间
                zx: '',//注销
                lzxz: '',//楼长性质
                certificate: '',//上岗证
                hjszd: '',//户籍所在地
                hjdz: '',//户籍地址
                xjzdz: '',//现居住地址
                longBanPhoto: "",//楼栋长相片
                photoUrl: "",//历史照片url
                imageBase64: "",//
                operType: this.props.route.params.operType,//add-update两个值
                longban_id: this.props.route.params.banId,//（当update有值）
                ban_id: this.props.route.params.lonId
            },
            nform: {
                ldxzName: '==请选择==',
                propertyManageName: '==请选择==',
                zjlxName: '==请选择==',
                mzName: '==请选择==',//民族
                hyzkName: '==请选择==',//婚姻状态
                whcdName: '==请选择==',//文化程度
                zzmmName: '==请选择==',//政治面貌
                lzxzName: '==请选择==',//楼长性质
            },
            picInfo: [],
            cameraShow: false,
            cameraActive: '',
            baseInfo: [],//民族,
            baseInfo2: [],//文化程度
            baseInfo3: [],//政治面貌
            baseInfo4: [],//婚姻状况
            baseInfo5: [],//证件类型
            baseInfo6: [],//楼栋性质
            baseInfo7: [],//楼长性质,
            baseInfo8: [],//是否物业管理
        }
    }

    componentDidMount() {

        url = global.longBan.url;
        this._getLongbanBaseInfo();
        if (self.state.form.operType == 'add') {
            this._getUserPartInfo();
        }
    }

    //新增时获取街道  http://112.74.180.158:8084/ComLongBanInfo/GetUserPartInfo?userId=809
    _getUserPartInfo() {
        post(url + '/ComLongBanInfo/GetUserPartInfo', { userId: global.longBan.info.Id }, null, function (res) {
            if (res.result == '1' && res.rows.length > 0) {
                console.log(res.rows[0]);
                let { communityId, communityName, gridId, gridName, streetId, streetName } = res.rows[0];
                self.setState({
                    form: Object.assign({}, self.state.form, {
                        jd: streetId,
                        jdtxt: streetName,
                        sq: communityId,
                        sqtxt: communityName,
                        wg: gridId,
                        wgtxt: gridName,
                    })
                });
            }
        })
            .then(() => {
                // console.log('成功');
            }).catch((error) => {
                // console.log(error);
                toastShort(error, 'bottom');//超时会在这里
            });
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
    //获取基础信息列表
    _getLongbanBaseInfo() {
        self._loading(true);
        post(url + '/ComLongBanInfo/GetLongbanBaseInfo', null, null, function (res) {
            let { baseInfo, baseInfo2, baseInfo3, baseInfo4, baseInfo5, baseInfo6, baseInfo7 } = res;
            baseInfo.unshift({ id: '', name: '==请选择==' });
            baseInfo2.unshift({ id: '', name: '==请选择==' });
            baseInfo3.unshift({ id: '', name: '==请选择==' });
            baseInfo4.unshift({ id: '', name: '==请选择==' });
            baseInfo5.unshift({ id: '', name: '==请选择==' });
            baseInfo6.unshift({ id: '', name: '==请选择==' });
            baseInfo7.unshift({ id: '', name: '==请选择==' });

            let baseInfo8 = [];
            baseInfo8.unshift({ id: '', name: '==请选择==' });
            baseInfo8.push({ id: '1', name: '是' });
            baseInfo8.push({ id: '2', name: '否' });
            self.state.baseInfo = baseInfo;
            self.state.baseInfo2 = baseInfo2;
            self.state.baseInfo3 = baseInfo3;
            self.state.baseInfo4 = baseInfo4;
            self.state.baseInfo5 = baseInfo5;
            self.state.baseInfo6 = baseInfo6;
            self.state.baseInfo7 = baseInfo7;
            self.state.baseInfo8 = baseInfo8;
            self.setState({
                baseInfo, baseInfo2, baseInfo3, baseInfo4, baseInfo5, baseInfo6, baseInfo7, baseInfo8
            });
            if (self.state.form.operType == 'update') {
                self._getLongBanDetails();
            } else {
                self._loading(false);
            }
        }, self).then(() => {
            // console.log('成功');
        }).catch((error) => {
            // console.log(error);
            toastShort(error, 'bottom');//超时会在这里
        })
    }

    //获取楼栋长详细信息，包括当前楼栋信息
    _getLongBanDetails = () => {
        let longban_id = this.props.route.params.banId
        let ban_id = this.props.route.params.ongbanId

        post(url + '/ComLongBanInfo/GetLongBanDetails', { longbanId: longban_id, banId: ban_id }, null, function (res) {
            console.log(res);
            if (res.result == '1') {
                if (res.tables[0].rows.length > 0) {
                    let { name, mobile, sex, birthday, nation, maritalStatus, educationDegree, politicalOutlook, longbanProperty,
                        certificate, householdRegister, permanentAddress, residencePlace, photoUrl, tel, photo,
                        comunityId, comunityName, gridId, gridName, streetId, streetName, lastUpdateUser, lastUpdateTime,
                        documentType, identificationNumber, state,
                        longbanPropertyName, maritalStatusName, nationName, politicalOutlookName, educationDegreeName

                    } = res.tables[0].rows[0];

                    let {
                        banCode,//: "4403060010010010023"
                        banaddress,//: "研祥智谷0426测试"
                        banfloor,//: "1"
                        buildingProperty,//: 1
                        buildingPropertyName,//: "城中村自建房"
                        id,//: 157312
                        longbanId,//: 34865
                        propertymanage,//: "1"
                        propertymanageName,//: "是"
                        roomcount,//: "12"
                    } = res.tables[1].rows[0];


                    if (birthday != null) {
                        let birthArray = birthday.split('T');
                        if (birthArray.length == 2)
                            birthday = birthArray[0];
                    }
                    if (lastUpdateTime != null) {
                        let lastUpdateTimeArray = lastUpdateTime.split('T');
                        if (lastUpdateTimeArray.length == 2)
                            lastUpdateTime = lastUpdateTimeArray[0];
                    }



                    let zjlxName = '';
                    for (let i = 0; i < self.state.baseInfo5.length; i++) {
                        if (self.state.baseInfo5[i].id == documentType) {
                            zjlxName = self.state.baseInfo5[i].name;
                        }
                    }

                    self.setState({
                        form: Object.assign({}, self.state.form, {
                            ldbm: banCode,//楼栋编码
                            banAddress: banaddress,//楼栋地址
                            ldxz: buildingProperty,//楼栋性质
                            propertyManage: propertymanage,//是否物业管理
                            banFloor: banfloor,//楼层数
                            roomCount: roomcount,//间/套数
                            zx: state == null || state == '' ? '1' : state,
                            jd: streetId,
                            jdtxt: streetName,
                            sq: comunityId,
                            sqtxt: comunityName,
                            wg: gridId,
                            wgtxt: gridName,
                            updateBy: lastUpdateUser,//楼长资料最后修改人
                            updateTime: lastUpdateTime,//楼长修改时间
                            zjlx: documentType,//证件类型
                            zjhm: identificationNumber,//证件号码

                            name: name,//姓名
                            sex: sex,//性别（1：男，2：女）
                            birthday: birthday,//出生年月
                            mz: nation,//民族
                            hyzk: maritalStatus,//婚姻状态
                            whcd: educationDegree,//文化程度
                            zzmm: politicalOutlook,//整治面貌
                            lxsj: mobile,//手机号码
                            gh: tel,//固话
                            lzxz: longbanProperty,//楼长性质
                            certificate: certificate,//上岗证
                            hjszd: householdRegister,//户籍所在地
                            hjdz: permanentAddress,//户籍地址
                            xjzdz: residencePlace,//现居住地址
                            photoUrl: photoUrl == null ? '' : photoUrl.startsWith('/') ? photoUrl : photo,//历史照片url
                            longBanPhoto: photo,
                        }),
                        nform: Object.assign({}, self.state.nform, {
                            ldxzName: buildingPropertyName,
                            propertyManageName: propertymanageName,
                            zjlxName: zjlxName,
                            mzName: nationName,//民族
                            hyzkName: maritalStatusName,//婚姻状态
                            whcdName: educationDegreeName,//文化程度
                            zzmmName: politicalOutlookName,//政治面貌
                            lzxzName: longbanPropertyName,//楼长性质
                        })
                    })
                }
            }

            self._loading(false);
        }).then(() => {
            // console.log('成功');
        }).catch((error) => {
            // console.log(error);
            toastShort(error, 'bottom');//超时会在这里
        })
    }

    //根据证件编号查询楼栋长信息
    _getLongBanInfoByCardid(cardId) {
        if (cardId == '' || cardId.length == 0) {
            toastShort('请填写证件号码！', 'bottom');
            return false;
        }
        self._loading(true);
        post(url + '/ComLongBanInfo/GetLongBanInfoByCardid', { cardId: cardId }, null, function (res) {
            self._loading(false);
            if (res.result == '1' && res.rows.length > 0) {
                let { name, mobile, sex, birthday, nation, maritalStatus, educationDegree, politicalOutlook, longbanProperty,
                    certificate, householdRegister, permanentAddress, residencePlace, photoUrl, tel, photo } = res.rows[0];

                if (birthday != null) {
                    let birthArray = birthday.split('T');
                    if (birthArray.length == 2)
                        birthday = birthArray[0];
                }

                let mzName = '==请选择==',//民族
                    hyzkName = '==请选择==',//婚姻状态
                    whcdName = '==请选择==',//文化程度
                    zzmmName = '==请选择==',//政治面貌
                    lzxzName = '==请选择==';//楼长性质

                if (nation != null || nation != undefined) {//民族
                    for (let i = 0; i < self.state.baseInfo.length; i++) {
                        if (self.state.baseInfo[i].id == nation) {
                            mzName = self.state.baseInfo[i].name;
                            break;
                        }
                    }
                }
                if (maritalStatus != null || maritalStatus != undefined) {//婚姻状况
                    for (let i = 0; i < self.state.baseInfo4.length; i++) {
                        if (self.state.baseInfo4[i].id == maritalStatus) {
                            hyzkName = self.state.baseInfo4[i].name;
                            break;
                        }
                    }
                }
                if (educationDegree != null || educationDegree != undefined) {//文化程度
                    for (let i = 0; i < self.state.baseInfo2.length; i++) {
                        if (self.state.baseInfo2[i].id == educationDegree) {
                            whcdName = self.state.baseInfo2[i].name;
                            break;
                        }
                    }
                }
                if (politicalOutlook != null || politicalOutlook != undefined) {//政治面貌
                    for (let i = 0; i < self.state.baseInfo3.length; i++) {
                        if (self.state.baseInfo3[i].id == politicalOutlook) {
                            zzmmName = self.state.baseInfo3[i].name;
                            break;
                        }
                    }
                }
                if (longbanProperty != null || longbanProperty != undefined) {//楼长性质
                    for (let i = 0; i < self.state.baseInfo7.length; i++) {
                        if (self.state.baseInfo7[i].id == longbanProperty) {
                            lzxzName = self.state.baseInfo7[i].name;
                            break;
                        }
                    }
                }

                self.setState({
                    form: Object.assign({}, self.state.form, {
                        longBanPhoto: photo,
                        name: name,//姓名
                        sex: sex,//性别（1：男，2：女）
                        birthday: birthday,//出生年月
                        mz: nation,//民族
                        zjlx: -1,//证件类型（-1：请选择，1、身份证，2、港澳台证，3、护照，4、军官证）
                        hyzk: maritalStatus,//婚姻状态
                        whcd: educationDegree,//文化程度
                        zzmm: politicalOutlook,//整治面貌
                        lxsj: mobile,//手机号码
                        gh: tel,//固话
                        lzxz: longbanProperty,//楼长性质
                        certificate: certificate,//上岗证
                        hjszd: householdRegister,//户籍所在地
                        hjdz: permanentAddress,//户籍地址
                        xjzdz: residencePlace,//现居住地址
                        photoUrl: photoUrl == null ? '' : photoUrl,//历史照片url
                    }),
                    nform: Object.assign({}, self.state.nform, {
                        mzName: mzName,//民族
                        hyzkName: hyzkName,//婚姻状态
                        whcdName: whcdName,//文化程度
                        zzmmName: zzmmName,//政治面貌
                        lzxzName: lzxzName//楼长性质
                    })
                })
            }
        }, self).then(() => {
            // console.log('成功');
        }).catch((error) => {
            // console.log(error);
            toastShort(error, 'bottom');//超时会在这里
        })
    }

    onBackAndroid = () => {
        n.goBack();
        return true;
    };

    // 开启关闭摄像头
    _cameraClose(val, type, info) {
        this.setState({
            cameraShow: val,
        })
        this.setState({
            set: { cropping: false, multiple: false }
        })
        if (type != '') {
            this.state.cameraActive = type;
        }
        if (info != undefined) {
            let picInfo = this.state.picInfo;
            if (Array.isArray(info)) {
                for (let i = 0; i < info.length; i++) {
                    picInfo.push(info[i]);
                }
            } else {
                // picInfo.push(info);
                picInfo = [];
                picInfo.push(info);
            }
            this.setState({
                picInfo: picInfo,
            })
        }

    }

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
        for (let i = year - 120; i < year - 1; i++) {
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
        let year=d.getFullYear()-20,month=d.getMonth()+1,date=d.getDate();
        let _this = this;
        if (type == 'birthday') {
            if(this.state.form.birthday!=''){
                d=this.state.form.birthday.split("-")
                if(d.length==3){
                    year=d[0];month=d[1];date=d[2];
                    if(month[0]=='0')
                        month=month[1];
                    if(date[0]=='0')
                        date=date[1];
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
                    this.setState({form:Object.assign({},this.state.form,{birthday:data[0]+'-'+data[1]+'-'+data[2]})});
                },
                onPickerCancel: data => {
                    Picker.hide();
                },
            });
            Picker.show();
        }else if(type=='ldxz'){
            if(_this.state.baseInfo6.length < 1){
                toastShort('暂无列表！','bottom');
                return false;
            }
            let data = [];
            for(let i=0;i<_this.state.baseInfo6.length;i++){
                data.push(_this.state.baseInfo6[i].name);
            }
            Picker.init({
                pickerData: data,
                selectedValue: [_this.state.nform.ldxzName],
                pickerTitleText:'选择楼栋性质',
                pickerConfirmBtnText:'确定',
                pickerCancelBtnText:'取消',
                pickerTextEllipsisLen:12,
                pickerBg:[255,255,255,1],
                onPickerConfirm: data => {
                    for(let i=0;i<_this.state.baseInfo6.length;i++){
                        if(_this.state.baseInfo6[i].name == data[0]){
                            _this.setState({
                                form:Object.assign({},_this.state.form,{ldxz:_this.state.baseInfo6[i].id}),
                                nform:Object.assign({},_this.state.nform,{ldxzName:data[0]})
                            })
                        };
                    }
                },
                onPickerCancel: data => {
                    Picker.hide();
                },
            });
            Picker.show();
        }else if(type=='propertyManage'){
            if(_this.state.baseInfo8.length < 1){
                toastShort('暂无列表！','bottom');
                return false;
            }
            let data = [];
            for(let i=0;i<_this.state.baseInfo8.length;i++){
                data.push(_this.state.baseInfo8[i].name);
            }
            Picker.init({
                pickerData: data,
                selectedValue: [_this.state.nform.propertyManageName],
                pickerTitleText:'选择是否物业管理',
                pickerConfirmBtnText:'确定',
                pickerCancelBtnText:'取消',
                pickerTextEllipsisLen:12,
                pickerBg:[255,255,255,1],
                onPickerConfirm: data => {
                    for(let i=0;i<_this.state.baseInfo8.length;i++){
                        if(_this.state.baseInfo8[i].name == data[0]){
                            _this.setState({
                                form:Object.assign({},_this.state.form,{propertyManage:_this.state.baseInfo8[i].id}),
                                nform:Object.assign({},_this.state.nform,{propertyManageName:data[0]})
                            })
                        };
                    }
                },
                onPickerCancel: data => {
                    Picker.hide();
                },
            });
            Picker.show();
        }else if(type=='zjlx'){
            if(_this.state.baseInfo5.length < 1){
                toastShort('暂无列表！','bottom');
                return false;
            }
            let data = [];
            for(let i=0;i<_this.state.baseInfo5.length;i++){
                data.push(_this.state.baseInfo5[i].name);
            }
            Picker.init({
                pickerData: data,
                selectedValue: [_this.state.nform.zjlxName],
                pickerTitleText:'选择证件类型',
                pickerConfirmBtnText:'确定',
                pickerCancelBtnText:'取消',
                pickerTextEllipsisLen:12,
                pickerBg:[255,255,255,1],
                onPickerConfirm: data => {
                    for(let i=0;i<_this.state.baseInfo5.length;i++){
                        if(_this.state.baseInfo5[i].name == data[0]){
                            _this.setState({
                                form:Object.assign({},_this.state.form,{zjlx:_this.state.baseInfo5[i].id}),
                                nform:Object.assign({},_this.state.nform,{zjlxName:data[0]})
                            })
                        };
                    }
                },
                onPickerCancel: data => {
                    Picker.hide();
                },
            });
            Picker.show();
        }else if(type=='mz'){
            if(_this.state.baseInfo.length < 1){
                toastShort('暂无列表！','bottom');
                return false;
            }
            let data = [];
            for(let i=0;i<_this.state.baseInfo.length;i++){
                data.push(_this.state.baseInfo[i].name);
            }
            Picker.init({
                pickerData: data,
                selectedValue: [_this.state.nform.mzName],
                pickerTitleText:'选择民族',
                pickerConfirmBtnText:'确定',
                pickerCancelBtnText:'取消',
                pickerTextEllipsisLen:12,
                pickerBg:[255,255,255,1],
                onPickerConfirm: data => {
                    for(let i=0;i<_this.state.baseInfo.length;i++){
                        if(_this.state.baseInfo[i].name == data[0]){
                            _this.setState({
                                form:Object.assign({},_this.state.form,{mz:_this.state.baseInfo[i].id}),
                                nform:Object.assign({},_this.state.nform,{mzName:data[0]})
                            })
                        };
                    }
                },
                onPickerCancel: data => {
                    Picker.hide();
                },
            });
            Picker.show();
        }else if(type=='hyzk'){
            if(_this.state.baseInfo4.length < 1){
                toastShort('暂无列表！','bottom');
                return false;
            }
            let data = [];
            for(let i=0;i<_this.state.baseInfo4.length;i++){
                data.push(_this.state.baseInfo4[i].name);
            }
            Picker.init({
                pickerData: data,
                selectedValue: [_this.state.nform.hyzkName],
                pickerTitleText:'选择婚姻状况',
                pickerConfirmBtnText:'确定',
                pickerCancelBtnText:'取消',
                pickerTextEllipsisLen:12,
                pickerBg:[255,255,255,1],
                onPickerConfirm: data => {
                    for(let i=0;i<_this.state.baseInfo4.length;i++){
                        if(_this.state.baseInfo4[i].name == data[0]){
                            _this.setState({
                                form:Object.assign({},_this.state.form,{hyzk:_this.state.baseInfo4[i].id}),
                                nform:Object.assign({},_this.state.nform,{hyzkName:data[0]})
                            })
                        };
                    }
                },
                onPickerCancel: data => {
                    Picker.hide();
                },
            });
            Picker.show();
        }else if(type=='whcd'){
            if(_this.state.baseInfo2.length < 1){
                toastShort('暂无列表！','bottom');
                return false;
            }
            let data = [];
            for(let i=0;i<_this.state.baseInfo2.length;i++){
                data.push(_this.state.baseInfo2[i].name);
            }
            Picker.init({
                pickerData: data,
                selectedValue: [_this.state.nform.whcdName],
                pickerTitleText:'选择文化程度',
                pickerConfirmBtnText:'确定',
                pickerCancelBtnText:'取消',
                pickerTextEllipsisLen:12,
                pickerBg:[255,255,255,1],
                onPickerConfirm: data => {
                    for(let i=0;i<_this.state.baseInfo2.length;i++){
                        if(_this.state.baseInfo2[i].name == data[0]){
                            _this.setState({
                                form:Object.assign({},_this.state.form,{whcd:_this.state.baseInfo2[i].id}),
                                nform:Object.assign({},_this.state.nform,{whcdName:data[0]})
                            })
                        };
                    }
                },
                onPickerCancel: data => {
                    Picker.hide();
                },
            });
            Picker.show();
        }else if(type=='zzmm'){
            if(_this.state.baseInfo3.length < 1){
                toastShort('暂无列表！','bottom');
                return false;
            }
            let data = [];
            for(let i=0;i<_this.state.baseInfo3.length;i++){
                data.push(_this.state.baseInfo3[i].name);
            }
            Picker.init({
                pickerData: data,
                selectedValue: [_this.state.nform.zzmmName],
                pickerTitleText:'选择政治面貌',
                pickerConfirmBtnText:'确定',
                pickerCancelBtnText:'取消',
                pickerTextEllipsisLen:12,
                pickerBg:[255,255,255,1],
                onPickerConfirm: data => {
                    for(let i=0;i<_this.state.baseInfo3.length;i++){
                        if(_this.state.baseInfo3[i].name == data[0]){
                            _this.setState({
                                form:Object.assign({},_this.state.form,{zzmm:_this.state.baseInfo3[i].id}),
                                nform:Object.assign({},_this.state.nform,{zzmmName:data[0]})
                            })
                        };
                    }
                },
                onPickerCancel: data => {
                    Picker.hide();
                },
            });
            Picker.show();
        }else if(type=='lzxz'){
            if(_this.state.baseInfo7.length < 1){
                toastShort('暂无列表！','bottom');
                return false;
            }
            let data = [];
            for(let i=0;i<_this.state.baseInfo7.length;i++){
                data.push(_this.state.baseInfo7[i].name);
            }
            Picker.init({
                pickerData: data,
                selectedValue: [_this.state.nform.lzxzName],
                pickerTitleText:'选择楼长性质',
                pickerConfirmBtnText:'确定',
                pickerCancelBtnText:'取消',
                pickerTextEllipsisLen:12,
                pickerBg:[255,255,255,1],
                onPickerConfirm: data => {
                    for(let i=0;i<_this.state.baseInfo7.length;i++){
                        if(_this.state.baseInfo7[i].name == data[0]){
                            _this.setState({
                                form:Object.assign({},_this.state.form,{lzxz:_this.state.baseInfo7[i].id}),
                                nform:Object.assign({},_this.state.nform,{lzxzName:data[0]})
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

    // 删除图片
    _delImg(index, type) {
        let arr = removeArr(this.state.picInfo, index);
        this.setState({
            picInfo: arr,
        })
    }

    _saveInfo = () => {
        //检查数据项
        if (this.state.form.ldbm.length == 0) {
            toastShort('请填写楼栋编码！', 'bottom');
            return false;
        }
        if (this.state.form.banAddress.length == 0) {
            toastShort('请填写楼栋地址！', 'bottom');
            return false;
        }
        if (this.state.form.ldxz.length == 0) {
            toastShort('请选择楼栋性质！', 'bottom');
            return false;
        }
        if (this.state.form.propertyManage.length == 0) {
            toastShort('请选择是否物业管理！', 'bottom');
            return false;
        }
        if (this.state.form.zjlx.length == 0) {
            toastShort('请选择证件类型！', 'bottom');
            return false;
        }
        if (this.state.form.zjhm.length == 0) {
            toastShort('请填写证件号码！', 'bottom');
            return false;
        }
        if (this.state.form.name.length == 0) {
            toastShort('请填写证件姓名！', 'bottom');
            return false;
        }
        if (this.state.form.lxsj.length == 0) {
            toastShort('请填写联系电话！', 'bottom');
            return false;
        }
        if (this.state.form.birthday.length == 0) {
            toastShort('请选择出生年月！', 'bottom');
            return false;
        }
        if (this.state.form.mz.length == 0) {
            toastShort('请选择民族！', 'bottom');
            return false;
        }
        if (this.state.form.hyzk.length == 0) {
            toastShort('请选择婚姻状况！', 'bottom');
            return false;
        }
        if (this.state.form.whcd.length == 0) {
            toastShort('请选择文化程度！', 'bottom');
            return false;
        }
        if (this.state.form.zzmm.length == 0) {
            toastShort('请选择政治面貌！', 'bottom');
            return false;
        }
        if (this.state.form.lzxz.length == 0) {
            toastShort('请选择楼长性质！', 'bottom');
            return false;
        }
        if (this.state.form.hjszd.length == 0) {
            toastShort('请填写户籍所在地！', 'bottom');
            return false;
        }
        if (this.state.form.hjdz.length == 0) {
            toastShort('请填写户籍地址！', 'bottom');
            return false;
        }
        if (this.state.form.xjzdz.length == 0) {
            toastShort('请填写现居住地址！', 'bottom');
            return false;
        }

        let imageBase64, imageBase64Array = [];
        for (let i = 0; i < this.state.picInfo.length; i++) {
            imageBase64Array.push(this.state.picInfo[i].data);
        }

        imageBase64 = imageBase64Array.join('@@');

        this.state.form.imageBase64 = imageBase64;
        console.log(JSON.stringify(this.state.form))

        //http://112.74.180.158:8084/ComLongBanInfo/AddLongBan
        self._loading(true);
        post(url + '/ComLongBanInfo/AddLongBan', this.state.form, null, function (res) {
            // console.log(res);
            self._loading(false);
            if (res.result == '1') {
                toastShort('楼栋长信息保存成功！', 'bottom');
                n.navigate('LongBanManage');
            } else {
                toastShort(res.message, 'bottom');
            }
        }, self).then(() => {
            // console.log('成功');
        }).catch((error) => {
            // console.log(error);
            toastShort(error, 'bottom');//超时会在这里
        })
    }

    _delPhotoImg(url) {
        let photoUrl = this.state.form.photoUrl;
        let photoArray = photoUrl.split(','), array = [];
        for (let i = 0; i < photoArray.length; i++) {
            if (photoArray[i] != url) {
                array.push(photoArray[i]);
            }
        }

        this.setState({ form: Object.assign({}, this.state.form, { photoUrl: array.join(',') }) });
    }

    render() {
        n = this.props.navigation;
        self = this;
        return (
            <View style={{ height: '100%' }}>

                <ScrollView keyboardShouldPersistTaps="always">
                    {/*<View style={[CommonStyles.padT20,CommonStyles.resContent,{paddingBottom:scaleSize(160)}]}>*/}
                    <View style={{ backgroundColor: '#fff', marginBottom: scaleSize(20) }}>
                        <View style={[CommonStyles.padT20, CommonStyles.resContent]}>
                            <FormTable name={'所属街道:'}>
                                <View style={[CommonStyles.contentInputNoLeft, { backgroundColor: '#ededed' }]}>
                                    <TextInput
                                        style={[CommonStyles.Input, CommonStyles.fs24]}
                                        keyboardType={"default"}
                                        underlineColorAndroid="transparent"
                                        placeholderTextColor="#cccccc"
                                        value={this.state.form.jdtxt}
                                        blurOnSubmit={true}
                                        editable={false}
                                    />
                                </View>
                            </FormTable>
                            <FormTable name={'所属社区:'}>
                                <View style={[CommonStyles.contentInputNoLeft, { backgroundColor: '#ededed' }]}>
                                    <TextInput
                                        style={[CommonStyles.Input, CommonStyles.fs24]}
                                        keyboardType={"default"}
                                        underlineColorAndroid="transparent"
                                        placeholderTextColor="#cccccc"
                                        value={this.state.form.sqtxt}
                                        blurOnSubmit={true}
                                        editable={false}
                                    />
                                </View>
                            </FormTable>
                            <FormTable name={'所属网格:'}>
                                <View style={[CommonStyles.contentInputNoLeft, { backgroundColor: '#ededed' }]}>
                                    <TextInput
                                        style={[CommonStyles.Input, CommonStyles.fs24]}
                                        keyboardType={"default"}
                                        underlineColorAndroid="transparent"
                                        placeholderTextColor="#cccccc"
                                        value={this.state.form.wgtxt}
                                        blurOnSubmit={true}
                                        editable={false}
                                    />
                                </View>
                            </FormTable>
                            <FormTable name={'楼栋编码:'} must={true}>
                                <View style={[CommonStyles.contentInputNoLeft, { backgroundColor: self.state.form.operType != 'update' ? '#fff' : '#ededed' }]}>
                                    <TextInput
                                        style={[CommonStyles.Input, CommonStyles.fs24]}
                                        keyboardType={"default"}
                                        underlineColorAndroid="transparent"
                                        placeholderTextColor="#cccccc"
                                        value={this.state.form.ldbm}
                                        blurOnSubmit={true}
                                        onChangeText={(value) => this.setState({ form: Object.assign({}, this.state.form, { ldbm: value }) })}
                                        editable={self.state.form.operType != 'update'}
                                    />
                                </View>
                            </FormTable>
                            <FormTable name={'楼栋地址:'} must={true}>
                                <View style={[CommonStyles.contentInputNoLeft]}>
                                    <TextInput
                                        style={[CommonStyles.Input, CommonStyles.fs24]}
                                        keyboardType={"default"}
                                        underlineColorAndroid="transparent"
                                        placeholderTextColor="#cccccc"
                                        value={this.state.form.banAddress}
                                        blurOnSubmit={true}
                                        onChangeText={(value) => this.setState({ form: Object.assign({}, this.state.form, { banAddress: value }) })}
                                    />
                                </View>
                            </FormTable>
                            <FormTable name={'楼栋性质:'} must={true}>
                                <TouchableOpacity
                                    style={[CommonStyles.contentInputNoLeft]}
                                    activeOpacity={1}
                                    onPress={this._selectPicker('ldxz')}
                                >
                                    <Text style={[CommonStyles.Input, CommonStyles.fs24, CommonStyles.lineHeight48]}>{this.state.nform.ldxzName}</Text>
                                    <Image source={require('../../assets/arrowdown.png')} resizeMode="contain" style={[CommonStyles.posAb, CommonStyles.arrowdown]}></Image>
                                </TouchableOpacity>
                            </FormTable>
                            <FormTable name={'是否物业管理:'} must={true}>
                                <TouchableOpacity
                                    style={[CommonStyles.contentInputNoLeft]}
                                    activeOpacity={1}
                                    onPress={this._selectPicker('propertyManage')}
                                >
                                    <Text style={[CommonStyles.Input, CommonStyles.fs24, CommonStyles.lineHeight48]}>{this.state.nform.propertyManageName}</Text>
                                    <Image source={require('../../assets/arrowdown.png')} resizeMode="contain" style={[CommonStyles.posAb, CommonStyles.arrowdown]}></Image>
                                </TouchableOpacity>
                            </FormTable>
                            <FormTable name={'楼层数:'}>
                                <View style={[CommonStyles.contentInputNoLeft]}>
                                    <TextInput
                                        style={[CommonStyles.Input, CommonStyles.fs24]}
                                        keyboardType={"default"}
                                        underlineColorAndroid="transparent"
                                        placeholderTextColor="#cccccc"
                                        value={this.state.form.banFloor}
                                        blurOnSubmit={true}
                                        onChangeText={(value) => this.setState({ form: Object.assign({}, this.state.form, { banFloor: value }) })}
                                    />
                                </View>
                            </FormTable>
                            <FormTable name={'间/套数:'}>
                                <View style={[CommonStyles.contentInputNoLeft]}>
                                    <TextInput
                                        style={[CommonStyles.Input, CommonStyles.fs24]}
                                        keyboardType={"default"}
                                        underlineColorAndroid="transparent"
                                        placeholderTextColor="#cccccc"
                                        value={this.state.form.roomCount}
                                        blurOnSubmit={true}
                                        onChangeText={(value) => this.setState({ form: Object.assign({}, this.state.form, { roomCount: value }) })}
                                    />
                                </View>
                            </FormTable>
                            <FormTable name={'楼长资料最后修改人:'}>
                                <View style={[CommonStyles.contentInputNoLeft, { backgroundColor: '#ededed' }]}>
                                    <TextInput
                                        style={[CommonStyles.Input, CommonStyles.fs24]}
                                        keyboardType={"default"}
                                        underlineColorAndroid="transparent"
                                        placeholderTextColor="#cccccc"
                                        value={this.state.form.updateBy}
                                        blurOnSubmit={true}
                                        editable={false}
                                    />
                                </View>
                            </FormTable>
                            <FormTable name={'楼长修改时间:'}>
                                <View style={[CommonStyles.contentInputNoLeft, { backgroundColor: '#ededed' }]}>
                                    <TextInput
                                        style={[CommonStyles.Input, CommonStyles.fs24]}
                                        keyboardType={"default"}
                                        underlineColorAndroid="transparent"
                                        placeholderTextColor="#cccccc"
                                        value={this.state.form.updateTime}
                                        blurOnSubmit={true}
                                        editable={false}
                                    />
                                </View>
                            </FormTable>
                        </View>
                    </View>

                    <View style={{ backgroundColor: '#fff', marginBottom: scaleSize(20) }}>
                        <View style={[CommonStyles.padT20, CommonStyles.resContent, { paddingBottom: scaleSize(160) }, { backgroundColor: self.state.form.operType != 'update' ? '#fff' : '#ededed' }]}>
                            <FormTable name={'证件类型:'} must={true}>
                                <TouchableOpacity
                                    style={[CommonStyles.contentInputNoLeft]}
                                    activeOpacity={1}
                                    onPress={self.state.form.operType != 'update' ? this._selectPicker('zjlx') : () => { }}
                                >
                                    <Text style={[CommonStyles.Input, CommonStyles.fs24, CommonStyles.lineHeight48]}>{this.state.nform.zjlxName}</Text>
                                    <Image source={require('../../assets/arrowdown.png')} resizeMode="contain" style={[CommonStyles.posAb, CommonStyles.arrowdown]}></Image>
                                </TouchableOpacity>
                            </FormTable>
                            <FormTable name={'证件号码:'} must={true}>
                                <View style={[CommonStyles.contentInputNoLeft, { paddingRight: scaleSize(110) }, { backgroundColor: self.state.form.operType != 'update' ? '#fff' : '#ededed' }]}>
                                    <TextInput
                                        style={[CommonStyles.Input, CommonStyles.fs24]}
                                        keyboardType={"default"}
                                        underlineColorAndroid="transparent"
                                        placeholderTextColor="#cccccc"
                                        value={this.state.form.zjhm}
                                        blurOnSubmit={true}
                                        onChangeText={(value) => this.setState({ form: Object.assign({}, this.state.form, { zjhm: value }) })}
                                        editable={self.state.form.operType != 'update'}
                                    />
                                    <View style={[CommonStyles.phoneCodeGet, { width: scaleSize(100) }]}>
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            style={[{
                                                width: '100%', height: scaleSize(70), justifyContent: 'center',
                                                alignItems: 'center', borderRadius: scaleSize(40), backgroundColor: '#279de3', borderColor: '#1c90d5', borderRadius: scaleSize(5), height: scaleSize(60), borderTopLeftRadius: 0, borderBottomLeftRadius: 0
                                            }]}
                                            onPress={() => { this._getLongBanInfoByCardid(this.state.form.zjhm); }}

                                        >
                                            <Text style={[{ color: '#fff', fontSize: scaleSize(22) }]}>关联</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </FormTable>
                            <FormTable name={'姓名:'} must={true}>
                                <View style={[CommonStyles.contentInputNoLeft]}>
                                    <TextInput
                                        style={[CommonStyles.Input, CommonStyles.fs24]}
                                        keyboardType={"default"}
                                        underlineColorAndroid="transparent"
                                        placeholderTextColor="#cccccc"
                                        value={this.state.form.name}
                                        blurOnSubmit={true}
                                        onChangeText={(value) => this.setState({ form: Object.assign({}, this.state.form, { name: value }) })}
                                    />
                                </View>
                            </FormTable>
                            <FormTable name={'联系手机:'} must={true}>
                                <View style={[CommonStyles.contentInputNoLeft]}>
                                    <TextInput
                                        style={[CommonStyles.Input, CommonStyles.fs24]}
                                        keyboardType={"default"}
                                        underlineColorAndroid="transparent"
                                        placeholderTextColor="#cccccc"
                                        value={this.state.form.lxsj}
                                        blurOnSubmit={true}
                                        onChangeText={(value) => this.setState({ form: Object.assign({}, this.state.form, { lxsj: value }) })}
                                    />
                                </View>
                            </FormTable>
                            <FormTable name={'固定电话:'}>
                                <View style={[CommonStyles.contentInputNoLeft]}>
                                    <TextInput
                                        style={[CommonStyles.Input, CommonStyles.fs24]}
                                        keyboardType={"default"}
                                        underlineColorAndroid="transparent"
                                        placeholderTextColor="#cccccc"
                                        value={this.state.form.gh}
                                        blurOnSubmit={true}
                                        onChangeText={(value) => this.setState({ form: Object.assign({}, this.state.form, { gh: value }) })}
                                    />
                                </View>
                            </FormTable>
                            <FormTable name={'性别'}>
                                <View style={[CommonStyles.flexRow, CommonStyles.radioscontent]}>
                                    <TouchableOpacity
                                        style={[CommonStyles.flexRow, { alignItems: 'center' }]}
                                        activeOpacity={1}
                                        onPress={() => {
                                            this.setState({ form: Object.assign({}, this.state.form, { sex: 1 }) })
                                        }}
                                    >
                                        <Image source={this.state.form.sex == 1 ? require('../../assets/ok.png') : require('../../assets/no.png')} resizeMode="contain" style={[CommonStyles.radios]}></Image>
                                        <Text style={[CommonStyles.fs24, CommonStyles.color333, CommonStyles.marl10]}>男</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[CommonStyles.flexRow, { alignItems: 'center', marginLeft: scaleSize(50) }]}
                                        activeOpacity={1}
                                        onPress={() => {
                                            this.setState({ form: Object.assign({}, this.state.form, { sex: 2 }) })
                                        }}
                                    >
                                        <Image source={this.state.form.sex == 2 ? require('../../assets/ok.png') : require('../../assets/no.png')} resizeMode="contain" style={[CommonStyles.radios]}></Image>
                                        <Text style={[CommonStyles.fs24, CommonStyles.color333, CommonStyles.marl10]}>女</Text>
                                    </TouchableOpacity>
                                </View>
                            </FormTable>
                            <FormTable name={'出生年月:'} must={true}>
                                <TouchableOpacity
                                    style={[CommonStyles.contentInputNoLeft]}
                                    activeOpacity={1}
                                    onPress={this._selectPicker('birthday')}
                                >
                                    <TextInput
                                        style={[CommonStyles.Input, CommonStyles.fs24]}
                                        keyboardType={"default"}
                                        underlineColorAndroid="transparent"
                                        placeholderTextColor="#cccccc"
                                        value={this.state.form.birthday}
                                        blurOnSubmit={true}
                                        editable={false}
                                    />
                                </TouchableOpacity>
                            </FormTable>
                            <FormTable name={'民族:'} must={true}>
                                <TouchableOpacity
                                    style={[CommonStyles.contentInputNoLeft]}
                                    activeOpacity={1}
                                    onPress={this._selectPicker('mz')}
                                >
                                    <Text style={[CommonStyles.Input, CommonStyles.fs24, CommonStyles.lineHeight48]}>{this.state.nform.mzName}</Text>
                                    <Image source={require('../../assets/arrowdown.png')} resizeMode="contain" style={[CommonStyles.posAb, CommonStyles.arrowdown]}></Image>
                                </TouchableOpacity>
                            </FormTable>
                            <FormTable name={'婚姻状况:'} must={true}>
                                <TouchableOpacity
                                    style={[CommonStyles.contentInputNoLeft]}
                                    activeOpacity={1}
                                    onPress={this._selectPicker('hyzk')}
                                >
                                    <Text style={[CommonStyles.Input, CommonStyles.fs24, CommonStyles.lineHeight48]}>{this.state.nform.hyzkName}</Text>
                                    <Image source={require('../../assets/arrowdown.png')} resizeMode="contain" style={[CommonStyles.posAb, CommonStyles.arrowdown]}></Image>
                                </TouchableOpacity>
                            </FormTable>
                            <FormTable name={'文化程度:'} must={true}>
                                <TouchableOpacity
                                    style={[CommonStyles.contentInputNoLeft]}
                                    activeOpacity={1}
                                    onPress={this._selectPicker('whcd')}
                                >
                                    <Text style={[CommonStyles.Input, CommonStyles.fs24, CommonStyles.lineHeight48]}>{this.state.nform.whcdName}</Text>
                                    <Image source={require('../../assets/arrowdown.png')} resizeMode="contain" style={[CommonStyles.posAb, CommonStyles.arrowdown]}></Image>
                                </TouchableOpacity>
                            </FormTable>
                            <FormTable name={'政治面貌:'} must={true}>
                                <TouchableOpacity
                                    style={[CommonStyles.contentInputNoLeft]}
                                    activeOpacity={1}
                                    onPress={this._selectPicker('zzmm')}
                                >
                                    <Text style={[CommonStyles.Input, CommonStyles.fs24, CommonStyles.lineHeight48]}>{this.state.nform.zzmmName}</Text>
                                    <Image source={require('../../assets/arrowdown.png')} resizeMode="contain" style={[CommonStyles.posAb, CommonStyles.arrowdown]}></Image>
                                </TouchableOpacity>
                            </FormTable>
                            <FormTable name={'楼长性质:'} must={true}>
                                <TouchableOpacity
                                    style={[CommonStyles.contentInputNoLeft]}
                                    activeOpacity={1}
                                    onPress={this._selectPicker('lzxz')}
                                >
                                    <Text style={[CommonStyles.Input, CommonStyles.fs24, CommonStyles.lineHeight48]}>{this.state.nform.lzxzName}</Text>
                                    <Image source={require('../../assets/arrowdown.png')} resizeMode="contain" style={[CommonStyles.posAb, CommonStyles.arrowdown]}></Image>
                                </TouchableOpacity>
                            </FormTable>
                            <FormTable name={'上岗证:'}>
                                <View style={[CommonStyles.contentInputNoLeft]}>
                                    <TextInput
                                        style={[CommonStyles.Input, CommonStyles.fs24]}
                                        keyboardType={"default"}
                                        underlineColorAndroid="transparent"
                                        placeholderTextColor="#cccccc"
                                        value={this.state.form.certificate}
                                        blurOnSubmit={true}
                                        onChangeText={(value) => this.setState({ form: Object.assign({}, this.state.form, { certificate: value }) })}
                                    />
                                </View>
                            </FormTable>
                            <FormTable name={'户籍所在地:'} must={true}>
                                <View style={[CommonStyles.contentInputNoLeft]}>
                                    <TextInput
                                        style={[CommonStyles.Input, CommonStyles.fs24]}
                                        keyboardType={"default"}
                                        underlineColorAndroid="transparent"
                                        placeholderTextColor="#cccccc"
                                        value={this.state.form.hjszd}
                                        blurOnSubmit={true}
                                        onChangeText={(value) => this.setState({ form: Object.assign({}, this.state.form, { hjszd: value }) })}
                                    />
                                </View>
                            </FormTable>
                            <FormTable name={'户籍地址:'} must={true}>
                                <View style={[CommonStyles.contentInputNoLeft]}>
                                    <TextInput
                                        style={[CommonStyles.Input, CommonStyles.fs24]}
                                        keyboardType={"default"}
                                        underlineColorAndroid="transparent"
                                        placeholderTextColor="#cccccc"
                                        value={this.state.form.hjdz}
                                        blurOnSubmit={true}
                                        onChangeText={(value) => this.setState({ form: Object.assign({}, this.state.form, { hjdz: value }) })}
                                    />
                                </View>
                            </FormTable>
                            <FormTable name={'现居住地址:'} must={true}>
                                <View style={[CommonStyles.contentInputNoLeft]}>
                                    <TextInput
                                        style={[CommonStyles.Input, CommonStyles.fs24]}
                                        keyboardType={"default"}
                                        underlineColorAndroid="transparent"
                                        placeholderTextColor="#cccccc"
                                        value={this.state.form.xjzdz}
                                        blurOnSubmit={true}
                                        onChangeText={(value) => this.setState({ form: Object.assign({}, this.state.form, { xjzdz: value }) })}
                                    />
                                </View>
                            </FormTable>
                            <FormTable name={'楼栋长相片'} leftstyle={true}>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                    {
                                        this.state.form.photoUrl.split(',').map((item, index) => {
                                            if (item.length != '')
                                                return <View style={[CommonStyles.picView]} key={index}>
                                                    <View style={[CommonStyles.picImg, CommonStyles.border]}>
                                                        <Image source={{ uri: (global.isEnc ? Decrypt(global.longBan.url) : global.longBan.url) + item }} resizeMode="stretch" style={[CommonStyles.personRightImg, { height: scaleSize(200) }]}></Image>
                                                    </View>
                                                    <TouchableOpacity
                                                        style={[CommonStyles.close2Content, CommonStyles.right0]}
                                                        activeOpacity={0.8}
                                                        onPress={() => this._delPhotoImg(item)}>
                                                        <Image source={require('../../assets/close2.png')} resizeMode="cover" style={[CommonStyles.personRightImg]}></Image>
                                                    </TouchableOpacity>
                                                </View>

                                        })
                                    }

                                    {
                                        this.state.picInfo.map((item, index) => {
                                            return <View style={[CommonStyles.picView]} key={index}>
                                                <View style={[CommonStyles.picImg, CommonStyles.border]}>
                                                    <Image source={{ uri: item.path }} resizeMode="stretch" style={[CommonStyles.personRightImg, { height: scaleSize(200) }]}></Image>
                                                </View>
                                                <TouchableOpacity
                                                    style={[CommonStyles.close2Content, CommonStyles.right0]}
                                                    activeOpacity={0.8}
                                                    onPress={() => this._delImg(index)}>
                                                    <Image source={require('../../assets/close2.png')} resizeMode="cover" style={[CommonStyles.personRightImg]}></Image>
                                                </TouchableOpacity>
                                            </View>
                                        })
                                    }
                                    <TouchableOpacity
                                        style={[CommonStyles.picView]}
                                        activeOpacity={1}
                                        onPress={() => {
                                            if (this.state.picInfo.length > 10) {
                                                toastShort('最多只能上传10张图片', 'bottom');
                                                return false;
                                            }
                                            this._cameraClose(true, 'other')
                                        }}>
                                        <Image source={require('../../assets/add.png')} resizeMode="stretch" style={[CommonStyles.picImg, { height: scaleSize(200) }]}></Image>
                                    </TouchableOpacity>
                                </View>
                            </FormTable>
                        </View>
                    </View>
                    {/*</View>*/}
                </ScrollView>
                <View style={[CommonStyles.bottombtnContent]}>
                    <View style={[CommonStyles.bottombtnContentlist, { flexDirection: 'row', justifyContent: 'space-around' }]}>
                        <Button
                            type={'square'}
                            title={"新增/保存"}
                            style={{ width: '35%', backgroundColor: '#028eef' }}
                            onPress={this._saveInfo}
                        />
                        <Button
                            type={'square'}
                            title={"取消"}
                            styleFs={{ color: '#000' }}
                            style={{ width: '35%', backgroundColor: '#fff', }}
                            onPress={() => {
                                n.navigate('LongBanManage');
                            }}
                        />
                    </View>
                </View>
                <CameraSelect
                    cameraShow={this.state.cameraShow}
                    cameraClose={this._cameraClose.bind(this)}
                    set={this.state.set}
                    cameraActive={this.state.cameraActive} />
            </View>
        )
    }
}