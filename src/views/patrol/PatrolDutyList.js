import React, { Component } from 'react';
import {
    TouchableOpacity,
    StatusBar,
    View,
    StyleSheet,
    BackHandler, TextInput,DeviceEventEmitter,
    FlatList, Image,
    Text,
    Platform,
} from 'react-native';
import { deviceWidth, deviceHeight, scaleSize } from '../../tools/adaptation';
// import Picker from "react-native-picker/index";
import styCom from '../../styles/index'
import Tabs from '../../components/Public/TabMenu';
import { HttpGet, HttpPost } from '../../request/index'
import SvgUri from 'react-native-svg-uri';
import { Icons } from '../../fonts/fontIcons'
import { toastShort } from '../../tools/toastUtil';

let self;
export default class PatrolDutyList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeId: '1',
            tabList: [
                {
                    id: '1',
                    name: '待巡逻事件'
                },
                {
                    id: '2',
                    name: '已巡逻事件'
                }
            ],

            taskId: this.props.route.params.id,

            searchText: '',
            searchDay: '',

            refreshing: false,
            offset: 1,
            total: 0,
            noArr: false,
            data: [],

        };
    }

    componentDidMount() {
        let d = new Date();
        let year = d.getFullYear();
        let month = parseInt(d.getMonth() + 1) > 9 ? parseInt(d.getMonth() + 1) : '0' + parseInt(d.getMonth() + 1);

        this.setState({ searchDay: year + '-' + month })

        this.listener = DeviceEventEmitter.addListener('PatrolDutyList', () => {
            this._getList('');
        })


        this._getList('');
    }

    componentWillUnmount() {

        // Picker.hide();
    }

    onBackAndroid = () => {
        self.navigation.goBack();
        return true;
    };

    _empty = () => {
        return <View style={[styCom.emptyContent]}>
            <Image style={[styles.imageStyle, { width: scaleSize(200), height: scaleSize(200) }]} resizeMode="cover" source={require('../../assets/nomsg.png')} />
            <Text style={[styCom.empty, { marginTop: scaleSize(20) }]}>暂无数据</Text>
        </View>;
    }

    _footer = () => {
        return <View style={[styCom.footerTip]}><Text style={styCom.empty}>
            {this.state.data.length == 0 ? '' : this.state.data.length == this.state.total ? '到底了~' : '加载中，请稍等...'}
        </Text>
        </View>;
    }

    _tabs = (id) => {
        console.log(id);

        this.setState({
            refreshing: false,
            noArr: false,
            data: [],
            searchText:''
        });



        this.state.data = [];
        this.state.activeId = id;
        this.state.offset = 1;

        this._getList('');
    }

    _getList(type) {
        if (type == '') {
            this.state.offset = 1;
        }

        let postUrl = 'jczl-flow/flow/patrolEvent/APPEventFindPage'
        if (this.state.activeId == 2) {
            postUrl = 'jczl-flow/flow/patrolEvent/APPEventEndFindPage'
        }

        let params = {
            eventId:this.state.searchText,
            taskId: this.state.taskId,
            pageNumber: this.state.offset,
            pageSize: 10,
        }

        HttpPost(postUrl, params, 'json').then(res => {
            if (res.flag) {

                let resdata = res.data.rows;

                if (resdata == null || resdata.length < 1) {
                    self.setState({ noArr: true })

                    if (res.data.total == 0 && self.state.offset == 1) {
                        self.setState({
                            data: [],
                            total: 0,
                        })
                    }
                    return false;
                }

                let data = type == '2' ? self.state.data : [];
                for (let i = 0; i < resdata.length; i++) {
                    data.push(resdata[i]);
                }
                self.setState({
                    data: data,
                    total: res.data.total
                })

            } else {
                toastShort('获取信息失败')
            }
        })
    }


    _renderItem = ({ item }) => {

        return (
            <TouchableOpacity
                style={[styles.contItem]}
                activeOpacity={1}
                key={item.detailedId}

                onPress={() => {

                    if(this.state.activeId==1){

                        this.props.navigation.navigate('PatrolDutyDetails', {
                            id: item.id,
                            eventStatus:this.state.activeId,
                            pNumber: item.finishNumber,
                            detailedId: item.detailedId,
                            taskId: this.state.taskId
                        })
                    }else{
                        this.props.navigation.navigate('PatrolDutyedList', { id: item.eventId, taskId: this.state.taskId }) 
                    }
                }}
            >
                <View style={[styles.list]}>

                    <View style={styles.listTitle}><Text style={{ color: '#333', fontSize: scaleSize(32), fontWeight: '500' }}>{item.eventName}</Text></View>

                    <View style={styles.listCon}>
                        <View style={styles.listItem}>

                            <View><Text>事件编号：</Text></View>
                            <View><Text>{item.eventId}</Text></View>
                        </View>

                        <View style={styles.listItem}>
                            <View><Text>{this.state.activeId == 1 ? '截止日期：' : '巡查日期：'}</Text></View>
                            <View><Text>{this.state.activeId == 1 ? item.endTime : item.patTime}</Text></View>
                        </View>

                        {/* <View style={[styles.listItem,]}>
                            <View><Text>巡查次数：</Text></View>
                            <View><Text>{item.number}次</Text></View>

                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={() => { this.props.navigation.navigate('PatrolDutyedList', { id: item.eventId, taskId: this.state.taskId }) }}>

                                <Text style={{ color: '#2589FF', marginLeft: scaleSize(10) }}>查看</Text>

                                <SvgUri style={styles.textMeorIcon} width="10" height="10"
                                    svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.youjiantou}" fill="#2589FF"></path></svg>`} />
                            </TouchableOpacity>

                        </View> */}

                        <View style={styles.listItem}>
                            <View><Text>事件地址：</Text></View>
                            <View style={{ flex: 1, }}><Text>{item.address}</Text></View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );

    }

    sltDay() {
        let years = [], days = [];

        let d = new Date();
        let year = d.getFullYear();

        for (let i = year - 2; i < year + 1; i++) {
            years.push(i);
        }

        for (let i = 1; i < 13; i++) {
            days.push(i < 10 ? '0' + i : i);
        }

        let data = [years, days];

        let searchDay = this.state.searchDay.split('-');

        // Picker.init({
        //     pickerData: data,
        //     selectedValue: [searchDay[0], searchDay[1]],
        //     pickerTitleText: '巡查时间',
        //     pickerConfirmBtnText: '确定',
        //     pickerCancelBtnText: '取消',
        //     pickerTextEllipsisLen: 12,
        //     pickerBg: [255, 255, 255, 1],
        //     onPickerConfirm: data => {
        //         this.setState({ searchDay: data[0] + '-' + data[1] });
        //     },
        //     onPickerCancel: data => {
        //         Picker.hide();
        //     },
        // });
        // Picker.show();

    }

    render() {
        self = this;
        return (
            <View style={styles.container}>

                <View style={styles.textView}>

                    <SvgUri style={styles.textSearchIcon} width="20" height="20"
                        svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.search}" fill="#CBCBCB"></path></svg>`} />

                    <TextInput
                        placeholder='请输入编码'
                        style={styles.textInput}
                        value={this.state.searchText}
                        underlineColorAndroid='transparent' //设置下划线背景色透明 达到去掉下划线的效果

                        returnKeyType="search"
                        returnKeyLabel="搜索"

                        onSubmitEditing={e => {
                            this.state.offset=1;
                            this._getList();
                        }}
                        onChangeText={(value) => this.setState({ searchText: value })}
                    />

                    {/* <View style={styles.txt01}>

                        <TouchableOpacity
                            onPress={() => {
                                this.sltDay()
                            }}
                        >
                            <SvgUri style={styles.textXjtIcon} width="12" height="12"
                                svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.xiajiantou}" fill="#000"></path></svg>`} />

                            <Text style={{ color: '#333' }}>{this.state.searchDay}</Text>
                        </TouchableOpacity>
                    </View> */}

                </View>

                <View>
                    <Tabs status={this.state.activeId} tabList={this.state.tabList}
                        width="45%"
                        style={{ width: deviceWidth }}
                        tab={this._tabs.bind(this)} borderShow={false} />
                </View>

                <View style={{ marginBottom: scaleSize(200) }}>

                    <FlatList
                        // style={{height:deviceHeight-scaleSize(160)}}
                        ref={(flatList) => this._flatList = flatList}
                        ListFooterComponent={this._footer}
                        ListHeaderComponent={() => { return null }}
                        ListEmptyComponent={this._empty}
                        renderItem={this._renderItem}
                        numColumns={1}
                        refreshing={this.state.refreshing}
                        // getItemLayout={(data, index) => (
                        //     { length: ITEM_HEIGHT, offset: (ITEM_HEIGHT + 2) * index, index }
                        // ) }
                        onRefresh={this._onRefresh}//下拉刷新
                        onEndReachedThreshold={0.05}
                        keyExtractor={this._keyExtractor}
                        onEndReached={(info) => {//上拉加载更多
                            // alert("滑动到底部了");
                            if (this.state.noArr) { return false; }
                            this.state.offset = this.state.offset + 1;
                            this._getList('2');
                        }}
                        data={this.state.data}>
                    </FlatList>
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
    txt01: {
        padding: scaleSize(15),
        marginLeft: scaleSize(20),
    },

    textInput: {
        paddingLeft: scaleSize(80),
        width: '90%',
        height: scaleSize(75),
        borderRadius: scaleSize(120),
        color: '#666',
        backgroundColor: '#F4F4F4',
        zIndex: 100,
    },

    textView: {
        flexDirection: 'row',
        padding: scaleSize(20),
        backgroundColor: '#fff',
        zIndex: 100,
    },

    textSearchIcon: {
        position: 'absolute',
        top: 18, left: 25,
        zIndex: 110
    },

    textMeorIcon: {
        position: 'absolute',
        top: 5, left: 35,
        zIndex: 110
    },

    textXjtIcon: {
        position: 'absolute',
        top: 5, right: -15,
        zIndex: 110
    },

    contItem: {
        backgroundColor: '#fff',
        margin: scaleSize(20),
        borderRadius: scaleSize(20),

    },

    qxlText: {
        flexDirection: 'row',
    },

    list: {
    },
    listTitle: {
        borderBottomColor: '#EDEDED',
        borderBottomWidth: 1,
        padding: scaleSize(20),
    },

    listCon: {
        padding: scaleSize(20),
    },

    listItem: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        paddingTop: scaleSize(5),
        paddingBottom: scaleSize(5)
    },

});
