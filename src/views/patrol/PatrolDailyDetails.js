import React, { Component } from 'react';
import {
  TouchableOpacity, FlatList, NativeModules,
  View,DeviceEventEmitter,
  StyleSheet,
  BackHandler,
  Text,
  Platform, Image,
} from 'react-native';
import { deviceWidth, deviceHeight, scaleSize } from '../../tools/adaptation';
import Head from '../../components/Public/Head';
import SvgUri from 'react-native-svg-uri';
import { Icons } from '../../fonts/fontIcons'
import styCom from '../../styles/index'
import { HttpGet, HttpPost } from '../../request/index'
import { toastShort } from '../../tools/toastUtil';
import { GPSChange } from '../../tools/comm'

let self;
export default class PatrolDailyDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {

      date: this.props.route.params.date,
      refreshing: false,
      offset: 1,
      total: 0,
      noArr: false,
      data: [],
    };
  }
  componentDidMount() {
    this._getList('')

  }

  componentWillUnmount() {

  }

  toAndroidHistory(siginId) {

    toastShort('正在打开巡逻界面，请稍等...', 'bottom');

    //获取历史轨迹数据
    HttpGet('qkwg-jcwg/flow/userGis/getTrackList/' + siginId, null).then((res) => {
      if (res.flag) {

        if (res.data.length == 0) {
          toastShort('无巡逻签到轨迹！', 'bottom');
          return false;
        }

        let d = [];
        for (let i = 0; i < res.data[0].length; i++) {
          let arr = res.data[0][i];
          let obj = GPSChange.gcj_encrypt(parseFloat(arr.lat), parseFloat(arr.lng));
          d.push({ lat: obj.lat, lng: obj.lon });
        }

        // console.log(JSON.stringify(d))

        NativeModules
          .AMapLocationModule
          .startHistoryMapFromJS(JSON.stringify(d));


      } else {
        toastShort('无巡逻签到轨迹！', 'bottom');
      }

    }).catch((error) => {
      toastShort(error, 'bottom');//超时会在这里
    })
  }



  _renderItem = ({ item }) => {

    return (
      <View style={[styles.list]}>

        {/* <View style={styles.listTitle}><Text style={{ color: '#333', fontSize: scaleSize(32), fontWeight: '500' }}>网格名称：田寮107</Text></View> */}

        <View style={styles.listCon}>
          <View style={styles.listItem}>
            <Text style={[styles.qdstate, { backgroundColor: '#0cc' }]}>签到</Text><Text style={styles.txt03}>{item.signTime}</Text>
          </View>
          <View style={[styles.listItem, styles.addrbtm]}>
            <Text style={styles.txt02}>{item.signAddress}</Text>
          </View>

          <View style={styles.listItem}>
            <Text style={[styles.qdstate, { backgroundColor: '#ffa200' }]}>签退</Text><Text style={styles.txt03}>{item.signOutTime}</Text>
          </View>

          <View style={[styles.listItem, styles.addrbtm]}>
            <Text style={styles.txt02}>{item.signOutAddress}</Text>
          </View>

          <View style={styles.listItem}>
            <Text>巡查时长：</Text><Text>{item.patrolTime}h</Text>
          </View>

          <View style={styles.listItem}>
            <Text>是否有效：</Text><Text>{item.isEffective == 1 ? '有效' : '无效'}</Text>
          </View>

          <View style={styles.listItem}>
            <View><Text>备注：</Text></View>
            <View style={{ flex: 1, }}><Text>{item.describe}</Text></View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.xlbottom}
          activeOpacity={1}
          onPress={() => { this.toAndroidHistory(item.id) }}>

          <Text style={{ color: '#2589FF', fontWeight: '500', fontSize: scaleSize(28), marginRight: scaleSize(5) }}>巡逻轨迹</Text>
          <SvgUri width="15" height="15" style={{ marginTop: scaleSize(5) }} svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.youjiantou}" fill="#2589FF"></path></svg>`} />
        </TouchableOpacity>

      </View>
    );

  }

  _getList(type) {

    this.setState({ data: [] })

    HttpGet('qkwg-jcwg/flow/dailyAttendance/getOwnDailyAttendanceByDate/' + this.state.date, null).then((res) => {
      if (res.flag) {
        let resdata = res.data;

        let data = type == '2' ? self.state.data : [];
        for (let i = 0; i < resdata.length; i++) {
          data.push(resdata[i]);
        }
        self.setState({
          data: data,
          total: data.length
        })

      } else {
        toastShort('获取信息失败')
      }

    }).catch((error) => {
      // console.log(error);
      toastShort(error, 'bottom');//超时会在这里
    })
  }

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

  render() {
    self = this;
    return (
      <View style={styles.container}>

      
        <View style={styles.mainCom}>
        {/* <Head back={true} title='巡查列表' /> */}

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
              // this._getList('2');
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

  mainCom: {
    // marginTop: scaleSize(55)
  },

  qdstate: {

    paddingLeft: scaleSize(12),
    paddingRight: scaleSize(12),
    borderRadius: scaleSize(5),
    marginRight: scaleSize(10),
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff'
  },


  txt01: {
    padding: scaleSize(15),
    marginLeft: scaleSize(20),
  },
  txt02: {
    fontSize: scaleSize(28),
    color: '#666'
  },
  txt03: {
    fontSize: scaleSize(30),
    color: '#666'
  },

  addrbtm: { marginBottom: scaleSize(10) },

  xlbottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scaleSize(30),
    borderTopColor: '#EDEDED',
    borderTopWidth: 1
  },

  textInput: {
    paddingLeft: scaleSize(80),
    width: '75%',
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

    backgroundColor: '#fff',
    margin: scaleSize(20),
    borderRadius: scaleSize(20),
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

    paddingTop: scaleSize(5),
    paddingBottom: scaleSize(5)
  },

});