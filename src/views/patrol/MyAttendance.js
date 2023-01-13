import React, { Component } from 'react';
import {
  TouchableOpacity,
  StatusBar,
  View,
  StyleSheet,
  BackHandler, TextInput,
  FlatList, Image,
  Text,
  Platform, DeviceEventEmitter,
} from 'react-native';
import { deviceWidth, deviceHeight, scaleSize } from '../../tools/adaptation';
// import Picker from "react-native-picker/index";
import styCom from '../../styles/index'
import Tabs from '../../components/Public/TabMenu';
import { HttpGet, HttpPost } from '../../request/index'
import SvgUri from 'react-native-svg-uri';
import { Icons } from '../../fonts/fontIcons'

let self;
export default class MyAttendance extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeId: '1',
      tabList: [
        {
          id: '1',
          name: '进行中'
        },
        {
          id: '2',
          name: '已完成'
        }
      ],

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

    this.setState({ searchDay: year });

    this._getList('');

  }

  componentWillUnmount() {

    // Picker.hide();

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


  _getList(type) {

    let params = {
      pageNumber: this.state.offset,
      pageSize: 10,
      status: this.state.activeId,
      year: this.state.searchDay
    }

    HttpPost('jczl-system/system/assess/dept/findPage/myDeptTasks', params, 'json').then(res => {
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

        onPress={() => {
          this.props.navigation.navigate('MyAttendanceDetails', { id: item.id, taskName: item.taskName, taskTime: item.name })
        }}
      >
        <View style={[styles.list]}>

          <View style={styles.listTitle}><Text style={{ color: '#333', fontSize: scaleSize(32), fontWeight: '500' }}>{item.taskName}</Text></View>

          <View style={styles.listCon}>
            <View style={styles.listItem}>

              <View style={{ marginLeft: scaleSize(25) }}><Text>目标分：</Text></View>
              <View><Text>{item.targetScore}</Text></View>
            </View>

            <View style={styles.listItem}>
              <View style={{ marginLeft: scaleSize(25) }}><Text>&nbsp;&nbsp;&nbsp;&nbsp;得分：</Text></View>
              <View><Text>{item.score}</Text></View>
            </View>

            <View style={styles.listItem}>
              <View><Text>考核周期：</Text></View>
              <View><Text>{item.name}</Text></View>
            </View>

            <View style={styles.listItem}>
              <View><Text>生成时间：</Text></View>
              <View><Text>{item.createTime}</Text></View>
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

    let data = [years];

    // Picker.init({
    //   pickerData: data,
    //   selectedValue: [this.state.searchDay],
    //   pickerTitleText: '巡查时间',
    //   pickerConfirmBtnText: '确定',
    //   pickerCancelBtnText: '取消',
    //   pickerTextEllipsisLen: 12,
    //   pickerBg: [255, 255, 255, 1],
    //   onPickerConfirm: data => {
    //     this.setState({ searchDay: data[0] });

    //     this.state.offset = 1;
    //     this._getList('')
    //   },
    //   onPickerCancel: data => {
    //     Picker.hide();
    //   },
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
              this._getList();
            }}
            onChangeText={(value) => this.setState({ searchText: value })}
          />

          <View style={styles.txt01}>

            <TouchableOpacity
              onPress={() => {
                this.sltDay()
              }}
            >
              <SvgUri style={styles.textXjtIcon} width="12" height="12"
                svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.xiajiantou}" fill="#000"></path></svg>`} />

              <Text style={{ color: '#333' }}>{this.state.searchDay}</Text>
            </TouchableOpacity>
          </View>

        </View>


        <View>
          <Tabs status={this.state.activeId} tabList={this.state.tabList}
            width="45%"
            style={{ width: deviceWidth }}
            tab={this._tabs.bind(this)} borderShow={false} />
        </View>

        <View style={{marginBottom:scaleSize(170)}}>

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
    marginLeft: scaleSize(50),
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
    margin: scaleSize(10),
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
