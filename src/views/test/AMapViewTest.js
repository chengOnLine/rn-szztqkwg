import React, { Component } from 'react';
import {
    TouchableOpacity,
    StatusBar,
    View,
    StyleSheet, TextInput, findNodeHandle,
    BackHandler, NativeModules,
    Text,
    Platform,
} from 'react-native';
import { deviceWidth, deviceHeight, scaleSize } from '../../tools/adaptation';
import AlertContainer from '../../components/Public/AlertContainer';
import SvgUri from 'react-native-svg-uri';
import { Icons } from '../../fonts/fontIcons'
import SplashScreen from 'react-native-splash-screen';
import { toastShort } from '../../tools/toastUtil';

import LinesMapView from '../../tools/aMapView'
import Tabs from '../../components/Public/TabMenu';

let self;
export default class AMapViewTest extends Component {
    constructor(props) {
        super(props);

        this.state = {
            alertShow: true,
            title: '巡逻',
            isweifa: true,

            activeId: 1,
            tabList: [
                {
                    id: '1',
                    name: '视频'
                },
                {
                    id: '3',
                    name: '动态'
                },
                {
                    id: '2',
                    name: '文件文件'
                },
                {
                    id: '4',
                    name: '小测小测试试'
                },
                {
                    id: '5',
                    name: '小测小测试试'
                },
                {
                    id: '6',
                    name: '小测小测试试'
                },    {
                    id: '6',
                    name: '小测小测试试'
                },    {
                    id: '6',
                    name: '小测小测试试'
                },
            ],

        };
    }


    componentDidMount() {

        SplashScreen.hide();//关闭启动屏幕

        //  this.loadingTest();
    }

    componentWillUnmount() {

    }

    loadingTest() {
        toastShort('正在打开地图');

        setTimeout(function () {

            NativeModules
                .AMapLocationModule
                .startHistoryMapFromJS("com.jicengzhili_gm.AMapLocation.activity.AMapActivity");

        }, 500)

    }

    _tabs = (id) => { }

    render() {
        self = this.props;
        return (

            <View>
                {/* <Tabs style={{ paddingTop: scaleSize(10) }} status={this.state.activeId} tabList={this.state.tabList}
                    tab={this._tabs.bind(this)} borderShow={false} /> */}
            </View>


            // <LinesMapView
            //     style={styles.mapview}
            //     // region={{
            //     //   latitude: (39.902136 + 39.832136) / 2,
            //     //   longitude: (116.44095 + 116.34095) / 2,
            //     //   latitudeDelta: (39.902136 - 39.832136) + 0.1,
            //     //   longitudeDelta: (116.44095 - 116.34095) + 0.1
            //     // }}
            //     // polyline={[
            //     //   { latitude: 39.832136, longitude: 116.34095 },
            //     //   { latitude: 39.832136, longitude: 116.42095 },
            //     //   { latitude: 39.902136, longitude: 116.42095 },
            //     //   { latitude: 39.902136, longitude: 116.44095 },
            //     // ]}
            //     marker={[
            //         { latitude: 39.832136, longitude: 116.34095, title: '装货点' },
            //         { latitude: 22.549791, longitude: 114.030632, title: '终点' },
            //     ]}
            // />

        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
    },
    mapview: {
        height: 300,
        marginTop: 20,
        zIndex: 99
    }

});
