import React, {Component} from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  BackHandler,
  Text,
  Platform,
} from 'react-native';
import {deviceWidth, deviceHeight, scaleSize} from '../../tools/adaptation';
import Head from '../../components/Public/Head';
import Bottom from '../../components/Public/TabBottom';

let self;
export default class Index extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }
  componentDidMount() {
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
    }
    console.log('requestApi: ' + global.requestApi);
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
    }
  }

  onBackAndroid = () => {
    self.navigation.goBack();
    return true;
  };

  render() {
    self = this.props;
    return (
      <View style={styles.container}>
      <Head back={false} title='基层治理' />
    
        <View style={styles.mainView}>
          <TouchableOpacity style={styles.btn} activeOpacity={0.8}>
            <Text>个人信息</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} activeOpacity={0.8}>
            <Text>版本信息</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} activeOpacity={0.8}>
            <Text>意见反馈</Text>
          </TouchableOpacity>
        </View>

        {/* <Bottom active="s" navigation={this.props.navigation} /> */}
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
});
