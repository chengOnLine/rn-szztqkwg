import React, { Component } from 'react';
import {
    TouchableOpacity,
    View, Text,
    StyleSheet,
    BackHandler,
    Platform, FlatList,
} from 'react-native';
import { deviceWidth, deviceHeight, scaleSize } from '../../tools/adaptation';
import Head from '../../components/Public/Head';
import Bottom from '../../components/Public/TabBottom';
import { HttpGet, HttpPost } from '../../request/index'

let self;

export default class MyAttendanceDetails extends Component {
    constructor(props) {
        super(props);

        this.state = {
            id: this.props.route.params.id,
            taskName: this.props.route.params.taskName,
            taskTime: this.props.route.params.taskTime,
            refreshing: false,

            data: [],
        };
    }
    componentDidMount() {
        this.getDetails();
    }

    componentWillUnmount() {

    }


    getDetails() {
        //获取当前最新考勤记录，是否在签到中
        HttpGet('jczl-system/system/assess/dept/listAssessIndex/' + this.state.id, null).then((res) => {
            if (res.flag) {
                this.setState({
                    data: res.data
                })

            } else {
                toastShort('获取信息失败' + res.msg, 'bottom');
            }
        })
    }

    _renderItem = ({ item },index) => {

        return (
            <View style={styles.zbcon}>
                <View style={{ width: '8%', backgroundColor: '#F1F2F4', alignItems: 'center', justifyContent: 'center', }}><Text>{index}</Text></View>
                <View style={{ width: '45%', flexDirection: 'column', padding: scaleSize(20) }}>
                    <View><Text style={styles.text01}>{item.indexItemName}</Text></View>
                    <View><Text style={styles.text02}>{item.indexName}</Text></View>
                </View>

                <View style={styles.zbcon03}><Text>{item.itemScore}</Text></View>
                <View style={styles.zbcon03}><Text>{item.score}</Text></View>
            </View>
        );
    }

    render() {
        self = this.props;
        let info = this.state.data;

        return (
            <View style={styles.container}>
                <View style={styles.itemCon}>
                    <View><Text style={styles.itemTitle}>考核标题</Text></View>
                    <View><Text>{this.state.taskName}</Text></View>
                </View>

                <View style={[styles.itemCon, { marginTop: scaleSize(20) }]}>
                    <View><Text style={styles.itemTitle}>考核周期</Text></View>
                    <View><Text>{this.state.taskTime}</Text></View>
                </View>

                <View style={[{ marginTop: scaleSize(40) }]}>
                    <View><Text style={styles.itemTitle}>考核期的指标名称及得分</Text></View>

                    <View>
                        <View style={styles.zbtop}>
                            <View style={{ width: '50%', alignItems: 'center' }}><Text>指标名称</Text></View>
                            <View style={styles.zbcon03}><Text>目标分</Text></View>
                            <View style={styles.zbcon03}><Text>得分</Text></View>
                        </View>

                        <FlatList
                            // style={{height:deviceHeight-scaleSize(160)}}
                            ref={(flatList) => this._flatList = flatList}
                            ListFooterComponent={this._footer}
                            ListHeaderComponent={() => { return null }}
                            ListEmptyComponent={this._empty}
                            renderItem={this._renderItem}
                            numColumns={1}
                            refreshing={this.state.refreshing}

                            onRefresh={this._onRefresh}//下拉刷新
                            onEndReachedThreshold={0.05}
                            keyExtractor={this._keyExtractor}
                            onEndReached={(info) => {//上拉加载更多

                            }}
                            data={this.state.data}>
                        </FlatList>

                    </View>

                </View>

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        backgroundColor: '#FFF',
        padding: scaleSize(20)
    },

    itemTitle: {
        color: '#999999',
        fontSize: scaleSize(28),
        fontWeight: '500',
        marginBottom: scaleSize(10)
    },

    itemCon: {
        borderBottomColor: '#EDEDED',
        borderBottomWidth: 1,
        paddingBottom: scaleSize(20)
    },

    zbtop: {
        flexDirection: 'row', backgroundColor: '#E3E4E6',
        paddingTop: scaleSize(20),
        paddingBottom: scaleSize(20),
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center'
    },

    zbcon: {
        flexDirection: 'row', borderBottomColor: '#EDEDED', borderBottomWidth: 0.8,
        borderRightColor: '#EDEDED', borderRightWidth: 0.8,

    },

    text02: {
        color: '#999',
        fontSize: scaleSize(20),
        fontWeight: '500',
    },
    text01: {
        color: '#666666',
        marginBottom: scaleSize(5),
        fontSize: scaleSize(24),
        fontWeight: '500',
    },

    zbcon03: {
        width: '25%', justifyContent: 'center', alignItems: 'center',

        // borderLeftColor: '#999',
        // borderLeftWidth: 1,
        // borderRightWidth: 1,
        // borderRightColor: '#999',
    },

    mainView: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: scaleSize(100),
    },
});
