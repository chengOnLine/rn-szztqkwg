import React, { Component } from 'react';
import {
    TouchableOpacity,
    StatusBar,
    View,
    StyleSheet,
    BackHandler, TextInput,Image,
    FlatList,
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
Picker = {} // picker有问题 不用
let self;
export default class PatrolDutyedList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            eventId: this.props.route.params.id,
            taskId:this.props.route.params.taskId,

            rwState: 0,
            searchText: '',
            searchDay: '',

            sltSearchText: '筛选',
            sltSearchVal: '',

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

        this._getList('');

    }

    componentWillUnmount() {

        Picker.hide();
    }

    onBackAndroid = () => {
        self.navigation.goBack();
        return true;
    };

    _empty = () => {
        return <View style={[styCom.emptyContent]}>
        <Image style={[styles.imageStyle, { width: scaleSize(200),height:scaleSize(200) }]} resizeMode="cover" source={require('../../assets/nomsg.png')} />
        <Text style={[styCom.empty, { marginTop: scaleSize(20) }]}>暂无数据</Text>
      </View>;
    }

    _footer = () => {
        return <View style={[styCom.footerTip]}><Text style={styCom.empty}>
            {this.state.data.length == 0 ? '' : this.state.data.length == this.state.total ? '到底了~' : '加载中，请稍等...'}
        </Text>
        </View>;
    }

    _getList(type) {

        let params = {
            eventId:this.state.eventId,
            taskId:this.state.taskId,
            status:this.state.selectedValue,
            pageNumber: this.state.offset,
            pageSize: 10,
        }

        HttpPost('qkwg-flow/flow/patrolDetailed/findPage', params, 'json').then(res => {
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

            // onPress={() => {
            //     this.props.navigation.navigate('PatrolDutyDetails', { id: '1111' })
            // }}
            >
                <View style={[styles.list]}>

                    <View style={styles.listCon}>
                        <View style={styles.listItem}>

                            <View><Text>周期开始时间：</Text></View>
                            <View><Text>{item.startTime}</Text></View>
                        </View>
                        <View style={styles.listItem}>

                            <View><Text>周期结束时间：</Text></View>
                            <View><Text>{item.endTime}</Text></View>
                        </View>

                        <View style={styles.listItem}>
                            <View><Text>巡查状态：</Text></View>
                            <View style={[styles.xlStatebd, item.patTime === '' ? styles.xlState : styles.xlState01]} >
                                <Text style={[item.patTime === '' ? { color: '#0DB600' } : { color: '#F56C6C' }]} >
                                    {item.patTime === '' ? '待巡逻' : '已巡逻'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.listItem}>
                            <View><Text>是否违法：</Text></View>
                            <View><Text>{item.flag == 0 ? '否' : '是'}</Text></View>
                        </View>

                        <View style={styles.listItem}>
                            <View><Text>事件描述：</Text></View>
                            <View style={{ flex: 1, }}><Text>{item.describe}</Text></View>
                        </View>

                        <View>
                            <TouchableOpacity
                                activeOpacity={1}
                                style={styles.xlcon}
                                onPress={() => { this.props.navigation.navigate('PatrolDutyDetails2', { id: item.id }) }}>

                                <Text style={{ color: '#2589FF', marginLeft: scaleSize(10) }}>巡逻详情</Text>

                                <SvgUri width="10" height="10" style={{ marginTop: scaleSize(10) }}
                                    svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.youjiantou}" fill="#2589FF"></path></svg>`} />
                            </TouchableOpacity>
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

        Picker.init({
            pickerData: data,
            selectedValue: [searchDay[0], searchDay[1]],
            pickerTitleText: '巡查时间',
            pickerConfirmBtnText: '确定',
            pickerCancelBtnText: '取消',
            pickerTextEllipsisLen: 12,
            pickerBg: [255, 255, 255, 1],
            onPickerConfirm: data => {
                this.setState({ searchDay: data[0] + '-' + data[1] });
            },
            onPickerCancel: data => {
                Picker.hide();
            },
        });
        Picker.show();

    }

    sltPatrolType() {
        let typeVals = ['未巡查', '已巡查', '全部']

        Picker.init({
            pickerData: typeVals,
            selectedValue: [this.state.sltSearchText],
            pickerTitleText: '巡查状态',
            pickerConfirmBtnText: '确定',
            pickerCancelBtnText: '取消',
            pickerTextEllipsisLen: 12,
            pickerBg: [255, 255, 255, 1],
            onPickerConfirm: data => {

                let sltVal = "-1";
                if (data[0] == '未巡查') {
                    sltVal = "0"
                } else if (data[0] == '已巡查') {
                    sltVal = "1"
                }

                this.setState({ sltSearchText: data[0], sltSearchVal: sltVal });

                this._getList('')
            },
            onPickerCancel: data => {
                Picker.hide();
            },
        });
        Picker.show();
    }

    render() {
        self = this;
        return (
            <View style={styles.container}>

                <View style={styles.textView}>

                    {/* <SvgUri style={styles.textSearchIcon} width="20" height="20"
                        svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.search}" fill="#CBCBCB"></path></svg>`} />

                    <TextInput
                        placeholder='请输入编码'
                        style={styles.textInput}
                        value={this.state.searchText}
                        underlineColorAndroid='transparent' //设置下划线背景色透明 达到去掉下划线的效果

                        returnKeyType="search"
                        returnKeyLabel="搜索"

                        onSubmitEditing={e => {
                            this._getList();
                        }}
                        onChangeText={(value) => this.setState({ searchText: value })}
                    /> */}

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

                    {/* <View style={styles.txt01}>

                        <TouchableOpacity
                            onPress={() => {
                                this.sltPatrolType()
                            }}
                        >
                            <SvgUri style={styles.textXjtIcon} width="12" height="12"
                                svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.xiajiantou}" fill="#000"></path></svg>`} />

                            <Text style={{ color: '#333' }}>{this.state.sltSearchText}</Text>
                        </TouchableOpacity>
                    </View> */}


                </View>

                <View style={{ marginBottom: scaleSize(100) }}>

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

    xlcon: {
        flexDirection: 'row',
        justifyContent: 'center',
        borderTopColor: '#EDEDED',
        borderTopWidth: 1, margin: scaleSize(20),
        paddingTop: scaleSize(30),

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

    textInput: {
        paddingLeft: scaleSize(80),
        width: '76%',
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


    textMeorIcon: {
        position: 'absolute',
        top: 5, left: 35,
        zIndex: 110
    },

    textSearchIcon: {
        position: 'absolute',
        top: 18, left: 25,
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
        width: scaleSize(180),
    },

    list: {
    },
    listTitle: {
        borderBottomColor: '#EDEDED',
        borderBottomWidth: 1,
        paddingTop: scaleSize(20),
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
        paddingTop: scaleSize(5),
        paddingBottom: scaleSize(5)
    },

});
