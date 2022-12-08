import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, DeviceEventEmitter } from 'react-native';
import { scaleSize } from '../../tools/adaptation';

let n;
let active;
export default class Bottom extends Component {
  constructor(props) {
    super(props);

    this.state = {

      StatusBarFtColor: 'light-content',
      StatusBarBgColor: 'transparent',
      StatusBarTranslucent: true,  //状态栏是否隐藏
    }
  }

  _jumpPage = url => {

    // if (url == 'HomePage') {
    //   DeviceEventEmitter.emit('backHome');
    // }
    n.navigate(url);

  };

  render() {
    n = this.props.navigation;
    active = this.props.active;
    return (
      <View style={styles.bottomMenu}>

        <TouchableOpacity
          style={[styles.footList]}
          activeOpacity={0.8}
          onPress={() => this._jumpPage('HomePage2')}>
          <Image
            source={
              active === 'h'
                ? require('../../assets/home_activity.png')
                : require('../../assets/home.png')
            }
            resizeMode="contain"
            style={styles.leftImg}
          />
          <Text style={[styles.menutxt, active === 'h' ? styles.active : '']}>
            首页
          </Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={[styles.footList]}
          activeOpacity={0.8}
          onPress={() => this._jumpPage('PatrolDaily')}>
          <Image
            source={
              active === 'x'
                ? require('../../assets/xunluo_activity.png')
                : require('../../assets/xunluo.png')
            }
            resizeMode="contain"
            style={styles.leftImg}
          />
          <Text style={[styles.menutxt, active === 'x' ? styles.active : '']}>
            巡查
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footList]}
          activeOpacity={0.8}
          onPress={() => this._jumpPage('NewsIndex')}>
          <Image
            source={
              active === 'd'
                ? require('../../assets/dangjian_activity.png')
                : require('../../assets/dangjian.png')
            }
            resizeMode="contain"
            style={styles.leftImg}
          />
          <Text style={[styles.menutxt, active === 'd' ? styles.active : '']}>
            党建
          </Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={[styles.footList]}
          activeOpacity={0.8}
          onPress={() => this._jumpPage('MailList')}>
          <Image
            source={
              active === 'm'
                ? require('../../assets/maillist_activity.png')
                : require('../../assets/maillist.png')
            }
            resizeMode="contain"
            style={styles.leftImg}
          />
          <Text style={[styles.menutxt, active === 'm' ? styles.active : '']}>
            通讯录
          </Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          style={[styles.footList]}
          activeOpacity={0.8}
          onPress={() => this._jumpPage('MyIndex')}>
          <Image
            source={
              active === 's'
                ? require('../../assets/myIndex_activity.png')
                : require('../../assets/myIndex.png')
            }
            resizeMode="contain"
            style={styles.leftImg}
          />
          <Text style={[styles.menutxt, active === 's' ? styles.active : '']}>
            个人中心
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bottomMenu: {
    alignItems: 'center',
    height: scaleSize(100),
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    borderTopColor: '#eee',
    borderTopWidth: 1,
    backgroundColor: '#fff',
    elevation: 10, //阴影边框属性
    padding: 0,
  },
  footList: {
    padding: 0,
    margin: 0,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  leftImg: {
    width: scaleSize(50),
    height: scaleSize(50),
  },
  menutxt: {
    color: '#999999',
    fontSize: scaleSize(26),
    lineHeight: scaleSize(40),
  },
  active: {
    color: '#4e8cee',
  },
});
