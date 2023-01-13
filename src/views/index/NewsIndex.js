import React, { Component } from 'react';
import {
    TouchableOpacity,
    View, StatusBar, DeviceEventEmitter,
    StyleSheet,
    Image,
    BackHandler, FlatList,
    Text,
    Platform,
} from 'react-native';
import { deviceWidth, deviceHeight, scaleSize } from '../../tools/adaptation';

import Head from '../../components/Public/Head';
import Bottom from '../../components/Public/TabBottom';
import Tabs from '../../components/Public/TabMenu';
import { HttpGet, HttpPost } from '../../request/index'
import { toastShort } from '../../tools/toastUtil';
import styCom from '../../styles/index'

let self;
export default class NewsIndex extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeId: 1,
            tabList: [],

            refreshing: false,
            offset: 1,
            total: 0,
            noArr: false,
            data: [],
        };
    }
    componentDidMount() {

        this.unsubscribe = this.props.navigation.addListener('tabPress', e => {
            setTimeout(() => {
                global.routeName = 'NewsIndex'
            }, 200);
        });

        this.getNewsTabs();
    }

    componentWillUnmount() {

        this.unsubscribe();
    }

    getNewsTabs() {

        var regex = /(<([^>]+)>)/ig

        let params = { pageNumber: 1, pageSize: 10, status: 0 }
        HttpPost('jczl-system/column/findPage', params, 'json').then(res => {
            if (res.flag) {
                let tabList = [];
                if (res.data.rows.length > 0) {

                    res.data.rows.map(item => {

                        let title = item.name.replace(regex, "");
                        tabList.push({
                            id: item.id,
                            name: title.length > 4 ? title.substring(0, 4) + '..' : title
                        })
                    })

                    this.setState({
                        tabList,
                        activeId: tabList[0].id
                    })

                    this._tabs(tabList[0].id)
                }
            }
        })
    }

    showMoreNews = (h5PageName, id) => {
        //参数加密
        let h5Url = global.H5Url + "?url=" + h5PageName;
        console.log('H5Url: ' + h5Url)

        self.props.navigation.navigate('Web', {
            outCode: 'h5',
            h5Url: h5Url
        })
    };


    _empty = () => {
        return <View style={[styCom.emptyContent]}>
            <Image style={[styles.imageStyle, { width: scaleSize(200), height: scaleSize(200) }]} resizeMode="cover" source={require('../../assets/nomsg.png')} />
            <Text style={[styCom.empty, { marginTop: scaleSize(20) }]}>暂无数据</Text>
        </View>;
    }

    _footer = () => {
        return (
            <View style={[styCom.footerTip, { paddingBottom: scaleSize(250) }]}>
                <Text>
                    {this.state.data.length == 0 ? '' : this.state.data.length == this.state.total ? '到底了~' : '查看更多'}
                </Text>
            </View>);
    }


    _renderNews = ({ item }) => {

        var regex = /(<([^>]+)>)/ig
        let content = item.content.replace(regex, "");
        let imgUrl = item.img.length > 0 ? item.img[0].url : '';
        let imgsource = { uri: imgUrl };

        return (

            <TouchableOpacity
                key={item.id}
                style={[styCom.CenterCenter, styles.newsItemCom]}
                activeOpacity={0.8}
                onPress={() => this.showMoreNews('/pages/partyActivities/partyDetail/index?id=' + item.id)}>

                <View style={{ flex: 2, height: scaleSize(190) }}>
                    <Text style={{ fontSize: scaleSize(32), fontWeight: 'bold' }} numberOfLines={1}>{item.title}</Text>
                    <Text style={{ marginTop: scaleSize(15), marginBottom: scaleSize(15), color: '#999' }} numberOfLines={2}>{content}</Text>
                    <Text style={{ color: '#999' }}>{item.updateTime}</Text>
                </View>

                {
                    imgUrl != '' ?
                        <View style={{ flex: 1, alignItems: 'center', marginLeft: scaleSize(10) }}>
                            <Image style={{ width: scaleSize(230), height: scaleSize(180), borderRadius: scaleSize(15) }} resizeMode="cover" source={imgsource}></Image>
                        </View>
                        : null
                }

            </TouchableOpacity>
        )
    }

    _getList(type) {

        let params = {
            columnId: this.state.activeId,
            pageNumber: this.state.offset,
            pageSize: 10,
            status: 1
        }

        HttpPost('jczl-system/article/findPage', params, 'json').then(res => {
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

    _tabs = (id) => {
        console.log(id);

        this.setState({
            refreshing: false,
            noArr: false,
            data: [],
        });

        this.state.activeId = id;
        this.state.offset = 1;

        this._getList('');
    }

    _onRefresh = (type) => {

        // this.setState({
        //     noArr: false,
        //     data: [],
        // });

        // this.state.offset = 1;
        // this._getList(type == '1' ? '' : '3');
    }

    render() {
        self = this;

        return (
            <View style={styles.container}>

                <View style={styles.newsCom}>

                    <Head back={false} title='党建活动' />

                    <View style={{ padding: scaleSize(15), }}>
                        <Tabs style={{
                            borderBottomWidth: scaleSize(2),
                            borderBottomColor: '#f0f0f0',
                        }}
                            status={this.state.activeId}
                            tabList={this.state.tabList} tab={this._tabs.bind(this)} borderShow={false} />
                    </View>

                    <View>
                        <FlatList
                            // style={{height:deviceHeight-scaleSize(160)}}
                            ref={(flatList) => this._flatList = flatList}
                            ListFooterComponent={this._footer}
                            ListHeaderComponent={() => { return null }}
                            ListEmptyComponent={this._empty}
                            renderItem={this._renderNews}
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


                {/* <Bottom active="d" navigation={this.props.navigation} /> */}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
    },
    mainView: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: scaleSize(100),
    },
    newsCom: {
        backgroundColor: '#fff',
        height: '100%',
        // marginTop: scaleSize(55)
    },

    newsItemCom: {
        padding: scaleSize(20),
        borderBottomColor: '#EDEDED',
        borderBottomWidth: 1,
    },


});
