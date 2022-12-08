import React, { Component } from 'react';
import {
  TouchableOpacity,
  StatusBar,
  View,
  StyleSheet,
  BackHandler,
  Text, ScrollView, NativeModules, DeviceEventEmitter,
  Platform,
} from 'react-native';
import { deviceWidth, deviceHeight, scaleSize } from '../../tools/adaptation';
import { HttpGet, HttpPost } from '../../request/index'
import Head from '../../components/Public/Head';
import Bottom from '../../components/Public/TabBottom';
import { Calendar, CalendarList, LocaleConfig } from 'react-native-calendars';
import SvgUri from 'react-native-svg-uri';
import { Icons } from '../../fonts/fontIcons'
import { toastShort } from '../../tools/toastUtil';
import { GPSChange } from "../../tools/comm";

let self;
export default class PatrolDaily extends Component {
  constructor(props) {
    super(props);

    this.state = {

      sltDay: '2022-05-30',
      currentDay: '',

      markedDates: {},
      markedDates01: {},

      topStatis: {
        avgMileage: 0,
        totalMileage: 0,
        time: 0
      },

      dailyAttendances: [],
      dailyAttendancesInfo: { dayMileage: 0, dayCount: 0, deptName: '' },
      dailyDatas: []

    };
  }
  componentDidMount() {

    this.unsubscribe = this.props.navigation.addListener('tabPress', e => {
      setTimeout(() => {
        global.routeName = 'PatrolDaily'
      }, 200);
      
    });

    let d = new Date();
    let year = d.getFullYear();
    let month = parseInt(d.getMonth() + 1) > 9 ? parseInt(d.getMonth() + 1) : '0' + parseInt(d.getMonth() + 1);
    let day = parseInt(d.getDate()) > 9 ? parseInt(d.getDate()) : '0' + parseInt(d.getDate());

    let sltMonth = year + '-' + month;
    let sltDay = year + '-' + month + '-' + day;

    this.setState({
      currentDay: sltDay,
      sltDay: sltDay
    })

    //加载当月的考勤
    this.getOwnDailyAttendanceByMonth(sltMonth)
  }

  componentWillUnmount() {

    this.unsubscribe();
  }


  getOwnDailyAttendanceByMonth(val) {

    let params = {
      month: val,
    }

    HttpPost('qkwg-flow/flow/dailyAttendance/getOwnDailyAttendanceByMonth', params, 'json').then(res => {
      if (res.flag) {

        let resdata = res.data;

        let { totalMileage, avgMileage, time } = resdata;
        this.setState({ topStatis: Object.assign({}, this.state.topStatis, { totalMileage, avgMileage, time }) });

        //选中已巡查日期
        let markedDates = {};

        resdata.dailyAttendancesWithDate.forEach(items => {
          if (items.dailyAttendances.length > 0) {
            markedDates[items.mileageDate] = { selected: true };
          }
        });

        //获取当月所有的天数巡查记录
        this.setState({
          dailyDatas: resdata.dailyAttendancesWithDate,
          markedDates,
          markedDates01: Object.assign({}, markedDates)
        })

        this.getDailyAttendancesInfo(this.state.sltDay)

      } else {
        toastShort('获取信息失败')
      }
    })
  }

  getDailyAttendancesInfo(sltDay) {

    let dailyDatas = this.state.dailyDatas;

    for (let i = 0; i < dailyDatas.length; i++) {
      //获取当天考勤记录
      if (sltDay == dailyDatas[i].mileageDate) {
        this.setState({ dailyAttendances: dailyDatas[i].dailyAttendances });

        this.setState({
          dailyAttendancesInfo: Object.assign({}, this.state.dailyAttendancesInfo,
            {
              dayMileage: dailyDatas[i].mileage,
              dayCount: dailyDatas[i].dailyAttendances.length,
              // deptName: dailyDatas[i].deptName
            })
        });

        break;
      }
    }
  }


  toAndroidTrack(id) {

    //获取当前最新考勤记录，是否在签到中
    HttpGet('qkwg-flow/flow/dailyAttendance/lastDailySign', null).then((res) => {
      if (res.flag) {

        let signId = '', isSign = false;

        let { id, signOutTime, signTime } = res.data;

        if (signOutTime == "" && signTime != "") {
          // 已签到跳转到地图巡逻页面
          signId = res.data.id;
          isSign = true;
        }

        //startActivityFormJS(String name,String token,boolean isSign,String signId,String signTime)

        let token = global.requestHeadAuthorization;

        NativeModules
          .AMapLocationModule
          .startActivityFormJS(token, isSign, signId, signTime);

      } else {
        toastShort('获取签到信息失败：' + res.msg, 'bottom');
      }

    }).catch((error) => {
      toastShort(error, 'bottom');//超时会在这里
    })

  }

  _onDayPress = (day) => {
    console.log(day);

    let sltDay = day.dateString;

    let markedDates = this.state.markedDates;
    let markedDates01 = this.state.markedDates01;
    // console.log(markedDates);

    let daymak = markedDates01[this.state.sltDay];
    if (daymak && daymak.selected) {
      markedDates[this.state.sltDay] = { selected: true }
    } else {
      markedDates[this.state.sltDay] = { selected: false }
    }

    markedDates[sltDay] = { selected: true, selectedColor: '#f1b504' }

    this.setState({ sltDay: day.dateString });

    this.getDailyAttendancesInfo(sltDay)

  }

  _onMonthPress = (day) => {

    let sltMonth = day.dateString.substring(0, 7);
    this.getOwnDailyAttendanceByMonth(sltMonth)
  }

  //加载当前巡逻记录
  _renderAttendanceItems = () => {

    let AttendanceItems = [];

    let dailyAttendances = this.state.dailyAttendances;
    for (let i = 0; i < dailyAttendances.length; i++) {

      AttendanceItems.push(
        <View key={i} style={{ marginBottom: scaleSize(40) }}>
          <View style={{ flexDirection: 'row' }}>
            <View style={styles.sPtion}></View>
            <View style={styles.line}>
              <View style={styles.qtitle}>
                <Text style={styles.text03}>签到</Text>
                <Text style={styles.text06}>{dailyAttendances[i].signTime}</Text>
              </View>

              <View style={{ flexDirection: 'row' }}>

                <SvgUri style={styles.textSearchIcon} width="15" height="15"
                  svgXmlData={`<svg  viewBox="0 0 1024 1024">
                                  <path d="${Icons.location}" fill="#999999"/>
                                  <path d="${Icons.location1}" fill="#999999"/></svg>`} />
                <Text style={styles.text06}>{dailyAttendances[i].signAddress}</Text>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: 'row', }}>
            <View style={styles.ePtion}></View>
            <View style={{ paddingLeft: scaleSize(25), marginTop: scaleSize(20), marginLeft: scaleSize(-12) }}>
              <View style={styles.qtitle}>
                <Text style={styles.text03}>签退</Text>
                <Text style={styles.text06}>{dailyAttendances[i].signOutTime}</Text>
              </View>

              <View style={{ flexDirection: 'row' }}>

                <SvgUri style={styles.textSearchIcon} width="15" height="15"
                  svgXmlData={`<svg  viewBox="0 0 1024 1024">
                                  <path d="${Icons.location}" fill="#999999"/>
                                  <path d="${Icons.location1}" fill="#999999"/></svg>`} />

                <Text style={styles.text06}>{dailyAttendances[i].signOutAddress}</Text>
              </View>
            </View>
          </View>

        </View>);
    }

    return AttendanceItems;
  }

  showPatrols() {
    if (this.state.dailyAttendancesInfo.dayCount > 0) {

      this.props.navigation.navigate('PatrolDailyDetails', { date: this.state.sltDay })
    } else {
      toastShort('无考勤记录');
    }
  }

  render() {
    self = this;

    return (
      <View style={styles.container}>

        <View style={styles.mainCom}>
          <Head back={false} title='日常巡查' />

          <ScrollView style={{ width: '100%' }} ref={(r) => this.scrollview = r}
            // onScroll={this._onScroll.bind(this)}
            contentContainerStyle={{ paddingBottom: scaleSize(250) }}>

            <View style={styles.topMain}>

              <View style={styles.topItem}>
                <Text style={styles.text01}>{this.state.topStatis.totalMileage}</Text>
                <Text style={styles.text02}>本月总里程(km)</Text>
              </View>

              <View style={styles.topItem}>
                <Text style={styles.text01}>{this.state.topStatis.avgMileage}</Text>
                <Text style={styles.text02}>本月平均里程(km)</Text>
              </View>


              <View style={styles.topItem}>
                <Text style={styles.text01}>{this.state.topStatis.time}</Text>
                <Text style={styles.text02}>巡查次数</Text>
              </View>

            </View>

            <View style={{ margin: scaleSize(20) }}>
              <Calendar
                style={{ width: deviceWidth - 20, borderTopRightRadius: scaleSize(20), borderTopLeftRadius: scaleSize(20) }}
                current={this.state.currentDay}
                minDate={'2022-01-01'}
                maxDate={this.state.currentDay}

                markedDates={this.state.markedDates}

                onDayPress={this._onDayPress}
                onDayLongPress={this._onDayPress}
                onMonthChange={this._onMonthPress}

              // markedDates={{
              //   '2022-05-21': { selected: true },
              //   '2022-05-23': { selected: true },
              //   [this.state.sltDay]: { selected: true, selectedColor: '#f1b504' },
              // }}，
              />


              <View style={styles.xlCon}>
                {/* <View><Text style={styles.text03}>{this.state.dailyAttendancesInfo.deptName}</Text></View> */}
                <View style={styles.xlChakan}>
                  <Text style={styles.text05}>共签到{this.state.dailyAttendancesInfo.dayCount}次，总里程{this.state.dailyAttendancesInfo.dayMileage}km</Text>

                  {
                    this.state.dailyAttendancesInfo.dayCount > 0 ?
                      <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                        onPress={() => {
                          this.showPatrols()
                        }}
                      >
                        <Text style={styles.text04}>查看详情&nbsp;</Text>

                        <SvgUri width="12" height="12" svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.youjiantou}" fill="#2589FF"></path></svg>`} />
                      </TouchableOpacity>
                      : null
                  }

                </View>
              </View>

              <View style={styles.xljlCon}>

                {this._renderAttendanceItems()}

              </View>

            </View>
          </ScrollView>

          <View style={styles.xlBtnCon}>
            <TouchableOpacity
              style={styles.xlBtn}
              activeOpacity={1}
              onPress={() => { this.toAndroidTrack('11') }}>

              <Text style={{ color: '#fff', fontSize: scaleSize(32), fontWeight: 'bold', lineHeight: scaleSize(85) }}>去巡逻</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* <Bottom active="x" navigation={this.props.navigation} /> */}
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

  // 进度线
  sPtion: { borderRadius: scaleSize(120), width: 10, height: 10, backgroundColor: '#ccc', marginTop: scaleSize(10) },
  ePtion: { borderRadius: scaleSize(120), width: 10, height: 10, backgroundColor: '#ccc', marginTop: scaleSize(0) },
  line: { paddingLeft: scaleSize(25), marginTop: scaleSize(30), height: scaleSize(80), borderLeftColor: '#ccc', borderLeftWidth: 1, marginLeft: scaleSize(-12) },

  qtitle: {
    flexDirection: 'row', alignItems: 'center', marginTop: scaleSize(-30), marginBottom: scaleSize(10),
  },

  xlBtnCon: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#fff',
    marginBottom: scaleSize(80),
    padding: scaleSize(20),
  },

  xlBtn: {
    backgroundColor: '#2589FF',
    borderRadius: scaleSize(120),
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },

  xlCon: {
    backgroundColor: '#fff',
    padding: scaleSize(30),
    borderTopColor: '#EDEDED',
    borderTopWidth: 1,
  },

  xljlCon: {
    backgroundColor: '#fff',
    padding: scaleSize(20),

    borderBottomRightRadius: scaleSize(20),
    borderBottomLeftRadius: scaleSize(20),

  },

  xlChakan: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: scaleSize(10),
    paddingTop: scaleSize(10),
  },

  mainView: {
    alignItems: 'center',
  },

  topMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: scaleSize(40),
    marginTop: scaleSize(20),
    marginRight: scaleSize(20),
    marginLeft: scaleSize(20),
    borderRadius: scaleSize(20),
  },

  topItem: {
    flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
  },

  text01: {
    color: '#333333',
    fontSize: scaleSize(40),
    fontWeight: 'bold',
    marginBottom: scaleSize(5),

  },
  text02: {
    color: '#999999',
    fontSize: scaleSize(24),
    fontWeight: 'bold'
  },
  text03: {
    color: '#333333',
    fontSize: scaleSize(28),
    fontWeight: '400',
    marginRight: scaleSize(20),
  },
  text04: {
    color: '#2589FF',
  },
  text05: {
    color: '#999999'
  },
  text06: {
    fontSize: scaleSize(20),
    color: '#999999'
  },

});
