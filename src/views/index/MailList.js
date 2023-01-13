import React, { Component } from 'react';
import { View, StyleSheet, SectionList, Text, StatusBar, Linking, 
  TouchableOpacity, Image,DeviceEventEmitter } from 'react-native';
  
import { deviceWidth, deviceHeight, scaleSize } from '../../tools/adaptation';
import Head from '../../components/Public/Head';
import Bottom from '../../components/Public/TabBottom';
import CommonStyles from '../../styles/index'
import { HttpGet, HttpPost } from '../../request/index'
import { toastShort } from '../../tools/toastUtil';

let self;
let total = 0, pageSize = 15;
let imgsrc = 'https://mdajtest.szzt.com.cn/upload//image/20220428/1651117755943_eaba8c1e4a564fe6a4c3430bec05ab66.JPG';

export default class MailList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      refreshing: false,//上拉刷新
      offset: 1,
      searchShow: false,
      searchName: '',
      data: [],
    }
  }

  componentDidMount() {
    // global.routeName = 'MailList'

    this._getAddressBook()

  }

  componentWillUnmount() {
  }


  _onRefresh = () => {

  }

  _getAddressBook = () => {

    HttpGet('jczl-system/system/user/getContactBook', null).then(res => {

      if (res.flag) {

        // title: "Main dishes",
        // data: [{ name: "Pizza1", tel: '1330505' }, { name: "Pizza2", tel: '1330505' }]

        let bookData = [];

        let resData = res.data;
        resData.forEach(item => {
          if (item.contactUserList.length > 0) {
            bookData.push({ title: item.key, tel: '13360503791', data: item.contactUserList.filter(users => { return users.fullName.length > 0 }) });
          }
        })

        self.setState({ data: bookData })

      } else {
        toastShort('获取功能菜单失败');
      }
    })
  }

  _groupBy(array, f) {
    let groups = {};
    array.forEach(function (o) {
      //let group = JSON.stringify( f(o) );
      let group = f(o);
      groups[group] = groups[group] || [];
      groups[group].push(o);
    });
    return Object.keys(groups).map(function (group) {
      return { roleType: group, data: groups[group] };
    });
  }

  _empty = () => {
    return <View style={[CommonStyles.emptyContent]}>
      <Image style={[styles.imageStyle, { width: scaleSize(200), height: scaleSize(200) }]} resizeMode="cover" source={require('../../assets/nomsg.png')} />
      <Text style={[CommonStyles.empty, { marginTop: scaleSize(20) }]}>暂无数据</Text>
    </View>;
  }

  _footer = () => {
    if (this.state.offset >= total) {
      return <View style={[CommonStyles.footerTip]}><Text style={CommonStyles.empty}>{total > 1 ? '到底了~' : ''}</Text></View>;
    } else {
      return <View style={[CommonStyles.footerTip]}>
        <Image source={require('../../assets/loading.gif')}
          style={{ width: scaleSize(36), height: scaleSize(36) }}>
        </Image></View>;
    }
  }


  //打电话
  _call = (phone) => () => {
    return Linking.openURL('tel:' + phone);
  };

  _extraUniqueKey = (item, index) => {
    return "index" + index + item;
  }


  _renderItem = ({ item, index, section }) => (

    <View style={styles.itemView}>

      <TouchableOpacity
        style={{ width: '100%' }}
        activeOpacity={0.8}
        onPress={this._call(item.phone)}
      >
        <View style={styles.itemCon}>
          <View style={styles.itemImg}>
            <Text style={{ color: '#fff', lineHeight: scaleSize(90), textAlign: 'center', }}>
              {item.fullName.length > 2 ? item.fullName.substring(item.fullName.length - 2) : item.fullName}
            </Text>
          </View>


          <View>
            <Text style={{ color: '#333', fontSize: scaleSize(36), marginLeft: scaleSize(25) }}>
              {item.fullName.length > 8 ? item.fullName.substring(0, 8) : item.fullName}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  render() {
    self = this;

    return (
      <View style={styles.container}>
        {/* <StatusBar
          animated={false} //指定状态栏的变化是否应以动画形式呈现。 
          translucent={false}//指定状态栏是否透明。设置为true时
          backgroundColor={'#fff'} //状态栏的背景色
          barStyle={'dark-content'} // 字体样式 enum('default', 'light-content', 'dark-content')  
        /> */}

        {/* <Head back={true} style={{ backgroundColor: '#fff', color: '#000' }} title='通讯录' /> */}


        <SectionList style={{ width: '100%' }} /*contentContainerStyle={[!this.state.searchShow&&{paddingTop:scaleSize(80)}]}*/
          renderItem={this._renderItem}

          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.headerTitle}>{title}</Text>
          )}
          sections={this.state.data}
          ListEmptyComponent={this._empty}
          ListFooterComponent={this._footer}
          keyExtractor={this._extraUniqueKey}
          refreshing={this.state.refreshing}
          onRefresh={this._onRefresh}//下拉刷新
          onEndReachedThreshold={0.05}
          onEndReached={(info) => {//上拉加载更多
            if (this.state.offset >= total) { return false; }
            this.state.offset = this.state.offset + 1;
            this._getData()
          }}
        >
        </SectionList>
        {/* <Bottom active="m" navigation={this.props.navigation} /> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F7F7F7'
  },

  itemCon: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },

  itemImg: {
    backgroundColor: '#2589FF',
    borderRadius: scaleSize(10),
    height: scaleSize(90),
    width: scaleSize(90),

    alignContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    width: '100%',
    color: '#333333',
    fontWeight: '500',
    padding: scaleSize(20),
    fontSize: scaleSize(30),
  },
  itemView: {
    flexDirection: 'row',
    padding: scaleSize(15),
    width: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  iconImg: {
    height: scaleSize(80), width: scaleSize(80), borderRadius: scaleSize(120)
  },

});
