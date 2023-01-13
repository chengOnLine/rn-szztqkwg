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
    ScrollView,
    FlatList,
    StatusBar
} from 'react-native';
import Head from '../../components/Public/Head';
import Load from '../../components/Loading/Index';
import CommonStyles from "../../styles/longBan";
import { deviceWidth, scaleSize } from "../../tools/adaptation";
import { toastShort, toastLong } from "../../tools/toastUtil";
import CameraSelect from '../../components/Public/CameraSelect';
import { Decrypt, removeArr } from "../../tools/comm";
import Button from '../../components/Public/Button';
import { post } from "../../request/NetUtility";
import List from '../../components/Index/LongBanScoreList';
import { storageSet, storageGet } from '../../storage/index'
// import {AlbumView, Overlay} from 'teaset';

let self, load, n;
let ITEM_HEIGHT = 100;
let pageSize = 10;
let checkItemsData;
// let url=global.isEnc?Decrypt(global.longBan.url):global.longBan.url;
let url = ""
export default class LongBanScore extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isHistory: this.props.route.params.history,
            picInfo1: [],
            picInfo2: [],
            picInfo3: [],
            picInfo4: [],
            mustPicArray: [],
            cameraShow: false,
            cameraActive: '',
            addPointsRemark: '',
            changesRemark: '',
            data: [],
            score: 0,
            isUpdate: false,
            step: 1,

            seq: this.props.route.params.seq,
        }
    }

    componentDidMount() {
        url = global.longBan.url;
        this._getList('');
        if (this.state.isHistory) {
            this._getCheckItemsInfo();
        }
    }

    onImagePress(type, index) {
        let images = [], thumbs = [];
        let pressView = null;
        if (type == '1') {
            this.state.picInfo3.map(function (item, index) {
                images.push({
                    uri: item
                });
                thumbs.push({
                    uri: item
                });
            })
            pressView = this.refs['fit' + index];
        } else if (type == '2') {
            this.state.picInfo4.map(function (item, index) {
                images.push({
                    uri: item
                });
                thumbs.push({
                    uri: item
                });
            })
            pressView = this.refs['sit' + index];
        } else if (type == '3') {
            this.state.picInfo1.map(function (item, index) {
                images.push({
                    uri: item.path
                });
                thumbs.push({
                    uri: item.path
                });
            })
            pressView = this.refs['tit' + index];
        } else if (type == '4') {
            this.state.picInfo2.map(function (item, index) {
                images.push({
                    uri: item.path
                });
                thumbs.push({
                    uri: item.path
                });
            })
            pressView = this.refs['wit' + index];
        }

        // pressView.measure((x, y, width, height, pageX, pageY) => {
        //     let overlayView = (
        //         <Overlay.PopView
        //             style={{}}
        //             containerStyle={{flex: 1}}
        //             overlayOpacity={1}
        //             type='custom'
        //             customBounds={{x: pageX, y: pageY, width, height}}
        //             ref={v => this.fullImageView = v}
        //         >
        //             {/* <AlbumView
        //                 style={{flex: 1}}
        //                 control={true}
        //                 images={images}
        //                 thumbs={thumbs}
        //                 defaultIndex={index}
        //                 onPress={() => this.fullImageView && this.fullImageView.close()}
        //             /> */}
        //             <StatusBar animated={false} hidden={false}/>
        //         </Overlay.PopView>
        //     );
        //     Overlay.show(overlayView);
        // });
    }

    //获取评分详情
    _getCheckItemsInfo() {
        let id = this.props.route.params.ckrId

        post(url + '/ComLongBanInfo/GetCheckItemsInfo', { id: id }, null, function (res) {
            if (res.result == '1' && res.rows.length > 0) {
                let { addPointsRemark, addScoreImgs, changesRemark, checkimglist, imgs } = res.rows[0];
                imgs = imgs == null ? '' : imgs;
                checkimglist = checkimglist == null ? '' : checkimglist;
                addScoreImgs = addScoreImgs == null ? '' : addScoreImgs;

                let his1 = imgs.split(','), his2 = checkimglist.split(','), his3 = addScoreImgs.split(',');
                let pic1Array = [], pic2Array = [];
                for (let i = 0; i < his1.length; i++) {
                    if (his1[i] != '') {
                        pic1Array.push((global.isEnc ? Decrypt(global.longBan.url) : global.longBan.url) + '/Upload/' + his1[i]);
                    }
                }
                for (let i = 0; i < his2.length; i++) {
                    if (his2[i] != '') {
                        pic1Array.push((global.isEnc ? Decrypt(global.longBan.url) : global.longBan.url) + '/Upload/' + his2[i]);
                    }
                }

                for (let i = 0; i < his3.length; i++) {
                    if (his3[i] != '') {
                        pic2Array.push((global.isEnc ? Decrypt(global.longBan.url) : global.longBan.url) + '/Upload/' + his3[i]);
                    }
                }

                self.setState({
                    picInfo3: pic1Array,
                    picInfo4: pic2Array,
                    addPointsRemark: addPointsRemark,
                    changesRemark: changesRemark,
                })
                // self.setState({
                //     history:{
                //         addPointsRemark,
                //         addScoreImgs,
                //         changesRemark,
                //         checkimglist,
                //         imgs
                //     }
                // })
            }
        }).then(() => {
            // console.log('成功');
        }).catch((error) => {
            // console.log(error);
            toastShort(error, 'bottom');//超时会在这里
        })
    }

    // 获取数据
    _getList(type) {
        self._loading(true);

        let postData = {
            banId: this.props.route.params.banId,
            ckrId: this.props.route.params.ckrId
        };


        toastLong('正在获取检查项...')

        post(url + '/ComLongBanInfo/GetCheckItems', postData, null, function (res) {
            console.log(res);
            self._loading(false);
            checkItemsData = Object.assign([], res.data);
            let total = 0;
            let array = [];
            for (let idx1 = 0; idx1 < checkItemsData.length; idx1++) {
                checkItemsData[idx1].open = !self.state.isHistory;
                for (let idx2 = 0; idx2 < checkItemsData[idx1].children.length; idx2++) {
                    checkItemsData[idx1].children[idx2].open = true;
                    for (let idx3 = 0; idx3 < checkItemsData[idx1].children[idx2].children.length; idx3++) {

                        if (self.state.isHistory) {//历史
                            if (checkItemsData[idx1].children[idx2].children[idx3].lastScore == null) {
                                checkItemsData[idx1].children[idx2].children[idx3].checkState = 1;
                                total += checkItemsData[idx1].children[idx2].children[idx3].unqualifiedScore;
                            } else {
                                checkItemsData[idx1].children[idx2].children[idx3].checkState = 0;
                                total += checkItemsData[idx1].children[idx2].children[idx3].qualificationScore;
                            }
                        } else {//新评分
                            if (checkItemsData[idx1].text == '加分项') {
                                // checkItemsData[idx1].children[idx2].children[idx3].checkState=0;
                                // total+=checkItemsData[idx1].children[idx2].children[idx3].qualificationScore;

                                checkItemsData[idx1].children[idx2].children[idx3].checkState = 1;
                                total += checkItemsData[idx1].children[idx2].children[idx3].unqualifiedScore;

                                // array.push({
                                //     id:checkItemsData[idx1].children[idx2].children[idx3].id.replace('item_',''),
                                //     name:checkItemsData[idx1].children[idx2].children[idx3].text,
                                //     picInfo:null
                                // });

                                // checkItemsData[idx1].children[idx2].children[idx3].checkState=-1;
                                // total+=checkItemsData[idx1].children[idx2].children[idx3].qualificationScore;
                            } else {
                                if (checkItemsData[idx1].children[idx2].children[idx3].lastScore == null) {
                                    checkItemsData[idx1].children[idx2].children[idx3].checkState = 1;
                                    total += checkItemsData[idx1].children[idx2].children[idx3].unqualifiedScore;
                                } else {
                                    checkItemsData[idx1].children[idx2].children[idx3].checkState = 0;
                                    total += checkItemsData[idx1].children[idx2].children[idx3].qualificationScore;
                                    if (checkItemsData[idx1].children[idx2].children[idx3].isAddimage == '1') {
                                        array.push({
                                            id: checkItemsData[idx1].children[idx2].children[idx3].id.replace('item_', ''),
                                            name: checkItemsData[idx1].children[idx2].children[idx3].text,
                                            picInfo: null
                                        });
                                    }
                                }
                                // checkItemsData[idx1].children[idx2].children[idx3].checkState=-1;
                                // total+=checkItemsData[idx1].children[idx2].children[idx3].qualificationScore;
                            }
                        }
                    }
                }
            }

            self.setState({
                score: total,
                mustPicArray: array,
            });

            if (self.state.seq != '') {//如果是缓存
                let arr = [];

                storageGet(global.zltUser.info.id.toString() + 'LongBanScore').then(ret => {
                    arr = ret;
                    let picInfo1 = [], picInfo2 = [], picInfo3 = [], picInfo4 = [], mustPicArray = [];
                    let addPointsRemark = '', changesRemark = '';
                    for (let index = 0; index < arr.length; index++) {
                        if (arr[index].seq == self.state.seq) {
                            let formData = Object.assign({}, arr[index]);
                            total = formData.totalScore;
                            changesRemark = formData.changesRemark;
                            addPointsRemark = formData.addPointsRemark;
                            let { imageBase64, base64Images2, check_itme_images, check_item_namecid, json } = formData;
                            let imageBase64Array = imageBase64 ? imageBase64.split('@@') : [];
                            for (let image of imageBase64Array) {
                                picInfo1.push({
                                    data: image,
                                    path: `data:image/png;base64,${image}`
                                });
                            }
                            let base64Images2Array = base64Images2 ? base64Images2.split('@@') : [];
                            for (let image of base64Images2Array) {
                                picInfo2.push({
                                    data: image,
                                    path: `data:image/png;base64,${image}`
                                });
                            }
                            let check_itme_images_Array = check_itme_images ? check_itme_images.split('@@') : [],
                                check_item_namecid_Array = check_item_namecid ? check_item_namecid.split('@@') : [];
                            for (let i = 0; i < check_item_namecid_Array.length; i++) {
                                mustPicArray.push({
                                    id: check_item_namecid_Array[i].split('$')[0],
                                    name: check_item_namecid_Array[i].split('$')[1],
                                    picInfo: {
                                        data: check_itme_images_Array[i],
                                        path: `data:image/png;base64,${check_itme_images_Array[i]}`
                                    }
                                })
                            }

                            let jsonObj = JSON.parse(json);
                            for (let idx1 = 0; idx1 < checkItemsData.length; idx1++) {
                                for (let idx2 = 0; idx2 < checkItemsData[idx1].children.length; idx2++) {
                                    for (let idx3 = 0; idx3 < checkItemsData[idx1].children[idx2].children.length; idx3++) {
                                        let id = checkItemsData[idx1].children[idx2].children[idx3].id.replace('item_', '');
                                        for (let item of jsonObj) {
                                            if (item.id == id) {
                                                checkItemsData[idx1].children[idx2].children[idx3].checkState = 0;
                                            }
                                        }
                                    }
                                }
                            }

                            break;
                        }
                    }

                    let checkItemsData2 = JSON.parse(JSON.stringify(checkItemsData));
                    self.setState({
                        changesRemark: changesRemark,
                        addPointsRemark: addPointsRemark,
                        data: checkItemsData2,
                        score: total,
                        mustPicArray: mustPicArray,
                        picInfo1: picInfo1,
                        picInfo2: picInfo2
                    })
                }).catch(err => {
                    self.setState({
                        seq: '',
                        data: checkItemsData,
                    })
                });
            } else {
                self.setState({
                    data: checkItemsData,
                });
            }

        }, self).then(() => {
            // console.log('成功');
        }).catch((error) => {
            // console.log(error);
            toastShort(error, 'bottom');//超时会在这里
        });
    }

    _updateCheckItemsOpen = (id, isOpen) => {
        for (let idx1 = 0; idx1 < checkItemsData.length; idx1++) {
            if (checkItemsData[idx1].id == id) {
                checkItemsData[idx1].open = isOpen;
                break;
            }
            let isBreak = false;
            for (let idx2 = 0; idx2 < checkItemsData[idx1].children.length; idx2++) {
                if (checkItemsData[idx1].children[idx2].id == id) {
                    checkItemsData[idx1].children[idx2].open = isOpen;
                    isBreak = true;
                    break;
                }
            }
            if (isBreak)
                break;
        }
    }

    _modifyCheck = (id, val) => {
        for (let idx1 = 0; idx1 < checkItemsData.length; idx1++) {
            for (let idx2 = 0; idx2 < checkItemsData[idx1].children.length; idx2++) {
                for (let idx3 = 0; idx3 < checkItemsData[idx1].children[idx2].children.length; idx3++) {
                    if (checkItemsData[idx1].children[idx2].children[idx3].id == id) {
                        checkItemsData[idx1].children[idx2].children[idx3].checkState = val;
                        break;
                    }
                }
            }
        }

        this.state.isUpdate = true;
    }

    _switchCheck = (id, val) => {
        let score = 0;
        let array = [];

        for (let idx1 = 0; idx1 < checkItemsData.length; idx1++) {
            for (let idx2 = 0; idx2 < checkItemsData[idx1].children.length; idx2++) {
                for (let idx3 = 0; idx3 < checkItemsData[idx1].children[idx2].children.length; idx3++) {
                    if (checkItemsData[idx1].children[idx2].children[idx3].id == id) {
                        checkItemsData[idx1].children[idx2].children[idx3].checkState = val;
                    }

                    let checkState = checkItemsData[idx1].children[idx2].children[idx3].checkState;
                    if (checkState == '1') {
                        score += checkItemsData[idx1].children[idx2].children[idx3].unqualifiedScore;

                    } else if (checkState == '0') {
                        score += checkItemsData[idx1].children[idx2].children[idx3].qualificationScore;
                        //不合格，加载必填图片

                        if (checkItemsData[idx1].text != '加分项') {
                            if (checkItemsData[idx1].children[idx2].children[idx3].isAddimage == '1') {
                                let result = false;
                                for (let i = 0; i < this.state.mustPicArray.length; i++) {
                                    if (this.state.mustPicArray[i].id == checkItemsData[idx1].children[idx2].children[idx3].id) {
                                        result = true;
                                        array.push({
                                            id: this.state.mustPicArray[i].id,
                                            name: this.state.mustPicArray[i].name,
                                            picInfo: this.state.mustPicArray[i].picInfo
                                        });
                                        break;
                                    }
                                }
                                if (!result) {
                                    array.push({
                                        id: checkItemsData[idx1].children[idx2].children[idx3].id.replace('item_', ''),
                                        name: checkItemsData[idx1].children[idx2].children[idx3].text,
                                        picInfo: null
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }

        this.setState({
            data: Object.assign([], checkItemsData),
            score: score,
            mustPicArray: array,
        });
    }

    _renderItem() {

        toastShort('正在加载...')
        if (this.state.data.length > 0) {
            let hlist = [];

            this.state.data.forEach(item => {

                hlist.push(<View>
                    <List item={item} navigation={n} firstOpen={this.state.isHistory ? false : item.open}
                        modifyCheck={this._modifyCheck}
                        switchCheck={this._switchCheck}
                        _updateCheckItemsOpen={this._updateCheckItemsOpen} />
                </View>)
            })

            return hlist
        }
    }
    // _keyExtractor = (item, index) => item.id+Math.floor(Math.random()*40)+60+index.toString();
    _keyExtractor = (item, index) => item.id + index.toString();

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
        if (Platform.OS === 'android') {
            BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
        }
    }

    onBackAndroid = () => {
        n.goBack();
        return true;
    };

    // 开启关闭摄像头
    _cameraClose(val, type, info) {
        self.setState({
            cameraShow: val,
        })
        if (type == 'other1' || type == 'other2') {
            self.setState({
                set: { cropping: false, multiple: true }
            })
        } else {
            self.setState({
                set: { cropping: false, multiple: false }
            })
        }

        if (type != '') {
            self.state.cameraActive = type;
        }
        if (info != undefined) {
            if (self.state.cameraActive == 'other1') {
                let picInfo = self.state.picInfo1;
                if (Array.isArray(info)) {
                    for (let i = 0; i < info.length; i++) {
                        picInfo.push(info[i]);
                    }
                } else {
                    picInfo.push(info);
                }
                self.setState({
                    picInfo1: picInfo,
                })
            } else if (self.state.cameraActive == 'other2') {
                let picInfo = self.state.picInfo2;
                if (Array.isArray(info)) {
                    for (let i = 0; i < info.length; i++) {
                        picInfo.push(info[i]);
                    }
                } else {
                    picInfo.push(info);
                }
                self.setState({
                    picInfo2: picInfo,
                })
            } else {//不合格必填图片
                let array = Object.assign([], this.state.mustPicArray);
                for (let i = 0; i < array.length; i++) {
                    if (array[i].id == this.state.cameraActive) {
                        array[i].picInfo = info;
                        break;
                    }
                }

                this.setState({
                    mustPicArray: array,
                })

                // this.refs.scoreCheckPic._cameraClose(val,this.state.cameraActive,info);
            }

        }

    }

    // 删除图片
    _delImg(index, type) {
        if (type == 'other1') {
            let arr = removeArr(this.state.picInfo1, index);
            this.setState({
                picInfo1: arr,
            })
        } else {
            let arr = removeArr(this.state.picInfo2, index);
            this.setState({
                picInfo2: arr,
            })
        }
    }

    //保存信息
    _saveInfo = () => {
        self._loading(true);
        //是否需要重新计算
        if (this.state.isUpdate) {
            toastShort('请点击统计，获取总评分！', 'bottom');
            self._loading(false);
            return false;
        }
        //检查项
        //1.检查是否所有都被勾选
        let isBreak = false;
        for (let idx1 = 0; idx1 < checkItemsData.length; idx1++) {
            for (let idx2 = 0; idx2 < checkItemsData[idx1].children.length; idx2++) {
                for (let idx3 = 0; idx3 < checkItemsData[idx1].children[idx2].children.length; idx3++) {
                    let checkState = checkItemsData[idx1].children[idx2].children[idx3].checkState;
                    if (checkState == '-1') {
                        toastShort('【' + checkItemsData[idx1].children[idx2].children[idx3].text + '】 尚未评分！', 'bottom');
                        isBreak = true;
                        break;
                        // self._loading(false);
                        // return false;
                    }

                    if (checkItemsData[idx1].text == '加分项' && checkState == '1' && this.state.changesRemark == '') {
                        toastShort('加分情况说明不可为空！', 'bottom');
                        isBreak = true;
                        break;

                    } else if (checkItemsData[idx1].text != '加分项' && checkState == '0' && this.state.addPointsRemark == '') {
                        toastShort('检查分数变动项情况说明不可为空！', 'bottom');
                        isBreak = true;
                        break;
                    }
                }
                if (isBreak)
                    break;
            }
            if (isBreak)
                break;
        }
        if (isBreak) {
            self._loading(false);
            //return false;
        } else {
            //2检查项图片必须上传
            for (let i = 0; i < this.state.mustPicArray.length; i++) {
                if (this.state.mustPicArray[i].picInfo == null) {
                    toastShort('【' + this.state.mustPicArray[i].name + '】 评分不合格，请上传不合格图片！', 'bottom');
                    isBreak = true;
                    break;
                    // self._loading(false);
                    // return false;
                }
            }
            if (isBreak) {
                self._loading(false);
                // return false;
            } else {
                let imageBase64, imageBase64Array = [];
                for (let i = 0; i < this.state.picInfo1.length; i++) {
                    imageBase64Array.push(this.state.picInfo1[i].data);
                }

                imageBase64 = imageBase64Array.join('@@');

                let base64Images2, base64Images2Array = [];
                for (let i = 0; i < this.state.picInfo2.length; i++) {
                    base64Images2Array.push(this.state.picInfo2[i].data);
                }

                base64Images2 = base64Images2Array.join('@@');

                let check_itme_images, check_itme_images_Array = [],
                    check_item_namecid, check_item_namecid_Array = [];
                for (let i = 0; i < this.state.mustPicArray.length; i++) {
                    check_itme_images_Array.push(this.state.mustPicArray[i].picInfo.data);
                    check_item_namecid_Array.push(this.state.mustPicArray[i].id + '$' + this.state.mustPicArray[i].name);
                }

                check_itme_images = check_itme_images_Array.join('@@');
                check_item_namecid = check_item_namecid_Array.join('@@');

                let opterType = 1;

                if (global.longBan.info.DutyName != '网格员')
                    opterType = 2;

                let jsonArray = [];

                for (let idx1 = 0; idx1 < checkItemsData.length; idx1++) {
                    for (let idx2 = 0; idx2 < checkItemsData[idx1].children.length; idx2++) {
                        for (let idx3 = 0; idx3 < checkItemsData[idx1].children[idx2].children.length; idx3++) {
                            let checkState = checkItemsData[idx1].children[idx2].children[idx3].checkState;
                            if (checkState == '0') {
                                jsonArray.push({
                                    id: checkItemsData[idx1].children[idx2].children[idx3].id.replace('item_', ''),
                                    score: checkItemsData[idx1].children[idx2].children[idx3].qualificationScore,
                                    quantity: -1,
                                });
                            }
                        }
                    }
                }

                //拼接参数
                let postData = {
                    addPointsRemark: this.state.addPointsRemark,
                    changesRemark: this.state.changesRemark,
                    imageBase64: imageBase64,
                    longbanId: this.props.route.params.banId,
                    totalScore: this.state.score,
                    lonId: this.props.route.params.lonId,
                    json: JSON.stringify(jsonArray),
                    opterType: opterType,
                    base64Images2: base64Images2,
                    check_itme_images: check_itme_images,
                    check_item_namecid: check_item_namecid == '' || check_item_namecid.length == 0 ? null : check_item_namecid,
                    banCode: this.props.route.params.banCode,
                    userId: global.longBan.info.Id,

                };

                console.log('UploadData params', postData);
                post(url + '/ComLongBanInfo/UploadData', postData, null, function (res) {
                    console.log('UploadData res', res);
                    self._loading(false);
                    if (res.result == '1') {
                        toastShort('楼栋长评分成功！', 'bottom');
                        if (self.state.seq != '') {//如果是缓存
                            let arr = [];
                            let idx = -1;

                            storageGet(global.zltUser.info.id.toString() + 'LongBanScore').then(ret => {
                                arr = ret;
                                for (let i = 0; i < arr.length; i++) {
                                    if (arr[i].seq == self.state.seq) {
                                        idx = i;
                                        break;
                                    }
                                }
                                arr = removeArr(arr, idx);
                                self._cache(arr, true);

                                // if (n.getParam('action', null))   n.getParam('action')();
                                n.navigate('drafts');
                            }).catch(err => {
                            });
                        } else {
                            // if (n.getParam('action', null))  n.getParam('action')();
                            n.navigate('LongBanManage');
                        }
                    } else {
                        toastShort('楼栋长评分失败！', 'bottom');
                    }
                }, self).then(() => {
                    // console.log('成功');
                }).catch((error) => {
                    // console.log(error);
                    toastShort(error, 'bottom');//超时会在这里
                })
            }
        }
    }

    _statistics = () => {
        let score = 0;
        let array = [];

        // self._loading(true);
        for (let idx1 = 0; idx1 < checkItemsData.length; idx1++) {
            for (let idx2 = 0; idx2 < checkItemsData[idx1].children.length; idx2++) {
                for (let idx3 = 0; idx3 < checkItemsData[idx1].children[idx2].children.length; idx3++) {

                    let checkState = checkItemsData[idx1].children[idx2].children[idx3].checkState;
                    if (checkState == '1') {
                        score += checkItemsData[idx1].children[idx2].children[idx3].unqualifiedScore;

                    } else if (checkState == '0') {
                        score += checkItemsData[idx1].children[idx2].children[idx3].qualificationScore;
                        //不合格，加载必填图片

                        if (checkItemsData[idx1].text != '加分项') {
                            if (checkItemsData[idx1].children[idx2].children[idx3].isAddimage == '1') {
                                let result = false;
                                for (let i = 0; i < this.state.mustPicArray.length; i++) {
                                    if (this.state.mustPicArray[i].id == checkItemsData[idx1].children[idx2].children[idx3].id.replace('item_', '')) {
                                        result = true;
                                        array.push({
                                            id: this.state.mustPicArray[i].id,
                                            name: this.state.mustPicArray[i].name,
                                            picInfo: this.state.mustPicArray[i].picInfo
                                        });
                                        break;
                                    }
                                }
                                if (!result) {
                                    array.push({
                                        id: checkItemsData[idx1].children[idx2].children[idx3].id.replace('item_', ''),
                                        name: checkItemsData[idx1].children[idx2].children[idx3].text,
                                        picInfo: null
                                    });
                                }
                            }
                        }
                    }
                    else {//没选择
                        toastShort('【' + checkItemsData[idx1].children[idx2].children[idx3].text + '】尚未评分！', 'bottom');
                        // self._loading(false);
                        return false;
                    }
                }
            }
        }

        // this.setState({
        //     score:score,
        //     mustPicArray:array,
        // });

        this.refs.scroll.scrollTo({ y: 0, x: 0, animated: true })
        this.state.score = score;
        this.state.mustPicArray = array;

        this.state.isUpdate = false;
        // self._loading(false);
    }

    // 缓存
    _cache(arr, deleted) {
        let _this = this;

        storageSet.save(global.zltUser.info.id.toString() + 'LongBanScore', arr);
        _this._loading(false);

        if (deleted) {

        } else {
            toastShort('缓存成功！', 'bottom');
        }
    }
    // 获取缓存
    _getCache(postData) {
        let _this = this;
        let arr = [];

        storageGet(global.zltUser.info.id.toString() + 'LongBanScore').then(ret => {
            try {
                arr = ret;
                if (this.state.seq == '') {
                    arr.push(Object.assign({}, postData, { createTime: _this._getDateFormat(), seq: new Date().getTime() }));
                } else {
                    let idx = -1;
                    for (let i = 0; i < arr.length; i++) {
                        if (arr[i].seq == this.state.seq) {
                            idx = i;
                            break;
                        }
                    }
                    arr = removeArr(arr, idx);
                    arr.push(Object.assign({}, postData, { createTime: _this._getDateFormat(), seq: this.state.seq }));
                }
                _this._cache(arr);

            } catch (error) {
                arr.push(Object.assign({}, postData, { createTime: _this._getDateFormat(), seq: new Date().getTime() }));
                _this._cache(arr);
            }
        });

        self.state.isAjaxLoading = false;
    }

    _getDateFormat(options) {
        options = options || {};
        options.sign = options.sign || 'yyyy-MM-dd HH:mm:ss';
        var _complete = function (n) {
            return (n > 9) ? n : '0' + n;
        }
        var d = new Date();
        var year = d.getFullYear();
        var month = _complete(d.getMonth() + 1);
        var day = _complete(d.getDate());
        var hours = _complete(d.getHours());
        var minutes = _complete(d.getMinutes());
        var second = _complete(d.getSeconds());
        var result = options.sign;
        result = result.replace('yyyy', year);
        result = result.replace('MM', month);
        result = result.replace('dd', day);
        result = result.replace('HH', hours);
        result = result.replace('mm', minutes);
        result = result.replace('ss', second);
        return result;
    }

    _saveDrafts = () => {
        self._loading(true);
        //是否需要重新计算
        if (this.state.isUpdate) {
            toastShort('请点击统计，获取总评分！', 'bottom');
            self._loading(false);
            return false;
        }
        //检查项
        //1.检查是否所有都被勾选
        let isBreak = false;
        for (let idx1 = 0; idx1 < checkItemsData.length; idx1++) {
            for (let idx2 = 0; idx2 < checkItemsData[idx1].children.length; idx2++) {
                for (let idx3 = 0; idx3 < checkItemsData[idx1].children[idx2].children.length; idx3++) {
                    let checkState = checkItemsData[idx1].children[idx2].children[idx3].checkState;
                    if (checkState == '-1') {
                        toastShort('【' + checkItemsData[idx1].children[idx2].children[idx3].text + '】 尚未评分！', 'bottom');
                        isBreak = true;
                        break;
                        // self._loading(false);
                        // return false;
                    }

                    if (checkItemsData[idx1].text == '加分项' && checkState == '1' && this.state.changesRemark == '') {
                        toastShort('加分情况说明不可为空！', 'bottom');
                        isBreak = true;
                        break;

                    } else if (checkItemsData[idx1].text != '加分项' && checkState == '0' && this.state.addPointsRemark == '') {
                        toastShort('检查分数变动项情况说明不可为空！', 'bottom');
                        isBreak = true;
                        break;
                    }
                }
                if (isBreak)
                    break;
            }
            if (isBreak)
                break;
        }
        if (isBreak) {
            self._loading(false);
            //return false;
        } else {
            //2检查项图片必须上传
            for (let i = 0; i < this.state.mustPicArray.length; i++) {
                if (this.state.mustPicArray[i].picInfo == null) {
                    toastShort('【' + this.state.mustPicArray[i].name + '】 评分不合格，请上传不合格图片！', 'bottom');
                    isBreak = true;
                    break;
                    // self._loading(false);
                    // return false;
                }
            }
            if (isBreak) {
                self._loading(false);
                // return false;
            } else {
                if (self.state.isAjaxLoading) {
                    toastShort('正在操作，请稍后...')
                    return false;
                }
                self.state.isAjaxLoading = true;
                let imageBase64, imageBase64Array = [];
                for (let i = 0; i < this.state.picInfo1.length; i++) {
                    imageBase64Array.push(this.state.picInfo1[i].data);
                }

                imageBase64 = imageBase64Array.join('@@');

                let base64Images2, base64Images2Array = [];
                for (let i = 0; i < this.state.picInfo2.length; i++) {
                    base64Images2Array.push(this.state.picInfo2[i].data);
                }

                base64Images2 = base64Images2Array.join('@@');

                let check_itme_images, check_itme_images_Array = [],
                    check_item_namecid, check_item_namecid_Array = [];
                for (let i = 0; i < this.state.mustPicArray.length; i++) {
                    check_itme_images_Array.push(this.state.mustPicArray[i].picInfo.data);
                    check_item_namecid_Array.push(this.state.mustPicArray[i].id + '$' + this.state.mustPicArray[i].name);
                }

                check_itme_images = check_itme_images_Array.join('@@');
                check_item_namecid = check_item_namecid_Array.join('@@');

                let opterType = 1;
                // if(global.user!=null&&global.user.info!=null&&(global.user.info.identity==9||global.user.info.identity==11))
                if (global.longBan.info.DutyName != '网格员')
                    opterType = 2;

                let jsonArray = [];

                for (let idx1 = 0; idx1 < checkItemsData.length; idx1++) {
                    for (let idx2 = 0; idx2 < checkItemsData[idx1].children.length; idx2++) {
                        for (let idx3 = 0; idx3 < checkItemsData[idx1].children[idx2].children.length; idx3++) {
                            let checkState = checkItemsData[idx1].children[idx2].children[idx3].checkState;
                            if (checkState == '0') {
                                jsonArray.push({
                                    id: checkItemsData[idx1].children[idx2].children[idx3].id.replace('item_', ''),
                                    score: checkItemsData[idx1].children[idx2].children[idx3].qualificationScore,
                                    quantity: -1,
                                });
                            }
                        }
                    }
                }

                //拼接参数
                let postData = {
                    addPointsRemark: this.state.addPointsRemark,
                    changesRemark: this.state.changesRemark,
                    imageBase64: imageBase64,
                    longbanId: this.props.route.params.banId,
                    totalScore: this.state.score,
                    lonId: this.props.route.params.lonId,
                    json: JSON.stringify(jsonArray),
                    opterType: opterType,
                    base64Images2: base64Images2,
                    check_itme_images: check_itme_images,
                    check_item_namecid: check_item_namecid == '' || check_item_namecid.length == 0 ? null : check_item_namecid,
                    banCode: this.props.route.params.banCode,
                    ckrId: this.props.route.params.ckrId,
                    userId: global.longBan.info.Id,
                    banName: this.props.route.params.banName
                };

                this._getCache(postData);
            }
        }
    }

    render() {
        n = this.props.navigation;
        self = this;
        return (
            <View style={{ height: '100%' }}>

                <ScrollView ref="scroll" keyboardShouldPersistTaps="always" contentContainerStyle={{ paddingBottom: scaleSize(160) }}>
                    {
                        this.state.isHistory || this.state.step == '1' ?
                            // <FlatList
                            //     style={{}}
                            //     ref={(flatList) => this._flatList = flatList}
                            //     renderItem={this._renderItem}
                            //     numColumns={1}
                            //     keyExtractor={this._keyExtractor}
                            //     data={this.state.data}>
                            // </FlatList>
                            this._renderItem()
                            :
                            null
                    }

                    {
                        this.state.data.length > 0 && (this.state.isHistory || this.state.step == '2') ?
                            <View style={{
                                height: scaleSize(60),
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center'
                            }}>
                                {/*{*/}
                                {/*this.state.isHistory?*/}
                                {/*null*/}
                                {/*:*/}
                                {/*<Button style={[{*/}
                                {/*marginTop: scaleSize(30),*/}
                                {/*marginBottom: scaleSize(10),*/}
                                {/*borderRadius: scaleSize(10),*/}
                                {/*marginRight: scaleSize(30),*/}
                                {/*}, {backgroundColor: '#ffa200', width: scaleSize(200)}]} type={'square'}*/}
                                {/*title={'统计'} onPress={this._statistics}/>*/}
                                {/*}*/}
                                <Text style={{ color: '#ff0000' }}>合计：{this.state.score}分</Text>
                            </View>
                            :
                            null
                    }

                    {
                        this.state.isHistory || this.state.step == '2' ?
                            <View>
                                <Text style={styles.txt}>检查分数变动项情况说明：（如本次检查有调整分数值时必填且逐步说明）</Text>
                                < TextInput
                                    placeholder='请输入情况说明'
                                    style={[styles.textInput, { height: scaleSize(150), textAlignVertical: 'top' }, this.state.isHistory ? { backgroundColor: '#ededed' } : '']}
                                    value={this.state.addPointsRemark}
                                    multiline={true}
                                    underlineColorAndroid='transparent' //设置下划线背景色透明 达到去掉下划线的效果
                                    onChangeText={(value) => this.setState({ addPointsRemark: value })}
                                />
                            </View>
                            :
                            null
                    }

                    {
                        this.state.isHistory ?
                            <View>
                                <View style={[styles.title]}><Text style={[styles.titleText]}>历史照片1查看</Text></View>
                                {
                                    this.state.picInfo3.length == 0 ?
                                        <View style={[styles.title]}><Text
                                            style={[styles.titleText, CommonStyles.color444]}>暂无</Text></View>
                                        :
                                        <View style={styles.picOuter}>
                                            {
                                                this.state.picInfo3.map((item, index) => {
                                                    return <View style={[CommonStyles.picView]} key={index}>
                                                        <TouchableOpacity
                                                            style={[CommonStyles.picImg, CommonStyles.border]}
                                                            ref={'fit' + index}
                                                            onPress={() => self.onImagePress(1, index)}>
                                                            <Image source={{ uri: item }} resizeMode="stretch"
                                                                style={[CommonStyles.personRightImg, { height: (deviceWidth - scaleSize(60)) / 3 }]}></Image>
                                                        </TouchableOpacity>
                                                    </View>
                                                })
                                            }
                                        </View>
                                }


                                <View style={[styles.title]}><Text style={[styles.titleText]}>历史照片2查看</Text></View>
                                {
                                    this.state.picInfo4.length == 0 ?
                                        <View style={[styles.title]}><Text
                                            style={[styles.titleText, CommonStyles.color444]}>暂无</Text></View>
                                        :
                                        <View style={styles.picOuter}>
                                            {
                                                this.state.picInfo4.map((item, index) => {
                                                    return <View style={[CommonStyles.picView]} key={index}>
                                                        <TouchableOpacity
                                                            style={[CommonStyles.picImg, CommonStyles.border]}
                                                            ref={'sit' + index}
                                                            onPress={() => self.onImagePress(2, index)}>
                                                            <Image source={{ uri: item }} resizeMode="stretch"
                                                                style={[CommonStyles.personRightImg, { height: (deviceWidth - scaleSize(60)) / 3 }]}></Image>
                                                        </TouchableOpacity>
                                                    </View>
                                                })
                                            }
                                        </View>
                                }

                            </View>
                            :
                            this.state.step == '2' ?
                                <View>
                                    <View style={[styles.title]}><Text
                                        style={[styles.titleText]}>检查照片上传逐项拍照</Text></View>
                                    <View style={styles.picOuter}>
                                        {
                                            this.state.picInfo1.map((item, index) => {
                                                return <View style={[CommonStyles.picView]} key={index}>
                                                    <TouchableOpacity style={[CommonStyles.picImg, CommonStyles.border]}
                                                        ref={'tit' + index}
                                                        onPress={() => self.onImagePress(3, index)}>
                                                        <Image source={{ uri: item.path }} resizeMode="stretch"
                                                            style={[CommonStyles.personRightImg, { height: (deviceWidth - scaleSize(60)) / 3 }]}></Image>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={[CommonStyles.close2Content, CommonStyles.right0]}
                                                        activeOpacity={0.8}
                                                        onPress={() => this._delImg(index, 'other1')}>
                                                        <Image source={require('../../assets/close2.png')}
                                                            resizeMode="cover"
                                                            style={[CommonStyles.personRightImg]}></Image>
                                                    </TouchableOpacity>
                                                </View>
                                            })
                                        }
                                        <TouchableOpacity
                                            style={[CommonStyles.picView]}
                                            activeOpacity={1}
                                            onPress={() => {
                                                if (this.state.picInfo1.length > 10) {
                                                    toastShort('最多只能上传10张图片', 'bottom');
                                                    return false;
                                                }
                                                this._cameraClose(true, 'other1')
                                            }}>
                                            <Image source={require('../../assets/add.png')} resizeMode="stretch"
                                                style={[CommonStyles.picImg, { height: (deviceWidth - scaleSize(60)) / 3 }]}></Image>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={[styles.title]}><Text
                                        style={[styles.titleText]}>检查项图片必须上传</Text></View>
                                    <View style={styles.picOuter}>
                                        {
                                            this.state.mustPicArray.map((item, index) => {
                                                return <TouchableOpacity
                                                    key={item.id}
                                                    style={[CommonStyles.picView]}
                                                    activeOpacity={1}
                                                    onPress={() => {
                                                        this._cameraClose(true, item.id);
                                                    }}>
                                                    <Image
                                                        source={item.picInfo == null ? require('../../assets/add.png') : { uri: item.picInfo.path }}
                                                        resizeMode="stretch"
                                                        style={[CommonStyles.picImg, { height: (deviceWidth - scaleSize(60)) / 3 }]}></Image>
                                                    <Text
                                                        style={{ alignSelf: 'center', color: 'red' }}>{item.name}*</Text>
                                                </TouchableOpacity>
                                            })
                                        }
                                    </View>
                                    {/*<LongBanScoreCheckPic*/}
                                    {/*ref='scoreCheckPic' _cameraClose={this._cameraClose} mustPicArray={this.state.mustPicArray} setMustPicArray={(mustPicArray)=>{this.state.mustPicArray=mustPicArray;}}*/}
                                    {/*/>*/}

                                    <View style={[styles.title]}><Text style={[styles.titleText]}>加分项拍照</Text></View>
                                    <View style={styles.picOuter}>
                                        {
                                            this.state.picInfo2.map((item, index) => {
                                                return <View style={[CommonStyles.picView]} key={index}>
                                                    <TouchableOpacity style={[CommonStyles.picImg, CommonStyles.border]}
                                                        ref={'wit' + index}
                                                        onPress={() => self.onImagePress(4, index)}>
                                                        <Image source={{ uri: item.path }} resizeMode="stretch"
                                                            style={[CommonStyles.personRightImg, { height: (deviceWidth - scaleSize(60)) / 3 }]}></Image>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={[CommonStyles.close2Content, CommonStyles.right0]}
                                                        activeOpacity={0.8}
                                                        onPress={() => this._delImg(index, 'other1')}>
                                                        <Image source={require('../../assets/close2.png')}
                                                            resizeMode="cover"
                                                            style={[CommonStyles.personRightImg]}></Image>
                                                    </TouchableOpacity>
                                                </View>
                                            })
                                        }
                                        <TouchableOpacity
                                            style={[CommonStyles.picView]}
                                            activeOpacity={1}
                                            onPress={() => {
                                                if (this.state.picInfo2.length > 10) {
                                                    toastShort('最多只能上传10张图片', 'bottom');
                                                    return false;
                                                }
                                                this._cameraClose(true, 'other2')
                                            }}>
                                            <Image source={require('../../assets/add.png')} resizeMode="stretch"
                                                style={[CommonStyles.picImg, { height: (deviceWidth - scaleSize(60)) / 3 }]}></Image>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                :
                                null
                    }


                    {
                        this.state.isHistory || this.state.step == '2' ?
                            <View>
                                <Text style={styles.txt}>加分情况说明:(如本次检查有加分项时必填)</Text>
                                <TextInput
                                    placeholder='请输入情况说明'
                                    style={[styles.textInput, {
                                        height: scaleSize(150),
                                        textAlignVertical: 'top'
                                    }, this.state.isHistory ? { backgroundColor: '#ededed' } : '']}
                                    value={this.state.changesRemark}
                                    multiline={true}
                                    underlineColorAndroid='transparent' //设置下划线背景色透明 达到去掉下划线的效果
                                    onChangeText={(value) => this.setState({ changesRemark: value })}
                                />
                            </View>
                            :
                            null
                    }
                </ScrollView>
                {
                    this.state.isHistory ?
                        null
                        :
                        <View style={[CommonStyles.bottombtnContent]}>
                            {
                                this.state.step == '1' ?
                                    <View style={[CommonStyles.bottombtnContentlist, { flexDirection: 'row', justifyContent: 'space-around' }]}>
                                        <Button
                                            type={'square'}
                                            title={"下一步"}
                                            style={{ width: '30%', backgroundColor: '#ffa200' }}
                                            onPress={() => {
                                                //是否需要重新计算
                                                if (this.state.isUpdate) {
                                                    // toastShort('请点击统计，获取总评分！','bottom');
                                                    // return false;
                                                    this._statistics();
                                                } else {
                                                    this.refs.scroll.scrollTo({ y: 0, x: 0, animated: true })
                                                }
                                                this.refs.scroll.scrollTo({ y: 0, x: 0, animated: true })
                                                this.setState({ step: 2 });
                                            }}
                                        />
                                    </View>
                                    :
                                    <View style={[CommonStyles.bottombtnContentlist, { flexDirection: 'row', justifyContent: 'space-around' }]}>
                                        <Button
                                            type={'square'}
                                            title={"上一步"}
                                            style={{ width: '20%', backgroundColor: '#ffa200' }}
                                            onPress={() => { this.setState({ step: 1 }) }}
                                        />
                                        <Button
                                            type={'square'}
                                            title={"草稿箱"}
                                            style={{ width: '20%', backgroundColor: '#498bbf' }}
                                            onPress={this._saveDrafts}
                                        />
                                        <Button
                                            type={'square'}
                                            title={"提交"}
                                            style={{ width: '20%', backgroundColor: '#11bffe' }}
                                            onPress={this._saveInfo}
                                        />
                                        <Button
                                            type={'square'}
                                            title={"取消"}
                                            styleFs={{ color: '#000' }}
                                            style={{ width: '20%', backgroundColor: '#5689fe', }}
                                            onPress={() => {
                                                n.navigate('LongBanManage');
                                            }}
                                        />
                                    </View>

                            }
                        </View>
                }
                <CameraSelect
                    cameraShow={this.state.cameraShow}
                    cameraClose={this._cameraClose.bind(this)}
                    set={this.state.set}
                    cameraActive={this.state.cameraActive} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    txt: {
        fontSize: scaleSize(30),
        color: '#333',
        marginTop: scaleSize(20),
        marginBottom: scaleSize(15),
        paddingLeft: scaleSize(20),
        paddingRight: scaleSize(20),
    },
    textInput: {
        borderWidth: scaleSize(1),
        borderRadius: scaleSize(5),
        borderColor: '#d8d8d8',
        backgroundColor: '#fff',
        height: scaleSize(80),
        padding: scaleSize(10),
        marginBottom: scaleSize(30),
    },
    title: {
        padding: scaleSize(10),
        paddingLeft: scaleSize(20),
    },
    titleText: {
        color: '#333',
        textAlignVertical: 'center',
        textAlign: 'right',
        paddingRight: scaleSize(30),
        backgroundColor: 'transparent',
        textAlign: 'left'
    },
    picOuter: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        //marginTop:scaleSize(8),
        padding: scaleSize(20),
    },
})