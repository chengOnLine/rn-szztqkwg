import React, { Component } from 'react';
import {
    Image, View, StyleSheet, BackHandler,
    Button, Alert, Text, FlatList, TextInput,
    Platform, NativeModules, StatusBar, ScrollView, TouchableOpacity, DeviceEventEmitter, PermissionsAndroid , ImageBackground
} from 'react-native';
import { HttpGet, HttpPost } from '../../../request/index'
import { deviceWidth, deviceHeight, scaleSize } from '../../../tools/adaptation';
import styCom from '../../../styles/index'
import { toastShort } from '../../../tools/toastUtil';
import { storageGet } from '../../../storage/index'
import UpdateVersion from '../../../components/Index/UpdateVersion';
import moment from "moment"


let n, self, backNum = 0;

export default class HomePage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isPermis: false,
            isHide: false,
            scanShow: false,

            searchText: '',
            StatusBarFtColor: 'dark-content',
            StatusBarBgColor: '#FFF',
            StatusBarTranslucent: false,  //状态栏是否隐藏

            userMeunList: [],
            meunId: 0,

            myTaskMeunList: [],
            otherMuenList: [],
            eventMuenList: [],


            bannerIndex: 0,
            bannerList: [],
            msgCount: 0,
            findMsgList: [],

            activeId: 1,
            tabList: [],
            data: [],

        };
    }

    componentDidMount() {
        global.routeName = 'GMTHomePage'

        //收到监听
        this.listener = DeviceEventEmitter.addListener('backHome', () => {
            global.routeName = 'GMTHomePage';
        })

        this.unsubscribe = this.props.navigation.addListener('tabPress', e => {
            global.routeName = 'GMTHomePage';
        });


        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
        }

        this.getMenuList();
        global.navigation = this.props.navigation;
        console.log('requestApi: ' + global.requestApi);

        this.requestMultiplePermission();
    }


    componentWillUnmount() {

        if (Platform.OS === 'android') {
            BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
        }
        this.unsubscribe();
    }
        //加载首页菜单列表
    getMenuList() {
        HttpGet('qkwg-system/system/menu/queryMenuByUser/6', null).then(res => {
            if (res.flag) {
                const defualUrl = 'https://mdajtest.szzt.com.cn/upload/image/20220428/1651117755943_eaba8c1e4a564fe6a4c3430bec05ab66.JPG'
                const { data = [] } = res;
                let gmtMenu = data.find( item => item.id === '258811482005082112' ) || {};
                const { menuVOS = [] } = gmtMenu;  
                // 
                let gmtMenuList1 = menuVOS.filter( item => item.menuVOS == '' );
                let gmtMenuList2 = menuVOS.filter( item => item.menuVOS != '' );

                this.setState({ gmtMenuList1 , gmtMenuList2 })
            } else {
                toastShort('获取功能菜单失败');
            }
        })
    }

    //动态申请系统权限
    async requestMultiplePermission() {
        let perCount = 0;
        try {
            const permissions = [
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                PermissionsAndroid.PERMISSIONS.CAMERA
            ]

            //返回得是对象类型
            const granteds = await PermissionsAndroid.requestMultiple(permissions)
            var data = "是否同意地址权限: "
            if (granteds["android.permission.ACCESS_FINE_LOCATION"] === "granted" || granteds["android.permission.ACCESS_COARSE_LOCATION"] === "granted") {
                data = data + "是\n"
                perCount++
            } else {
                data = data + "否\n"
            }

            data = data + "是否同意相机权限: "
            if (granteds["android.permission.CAMERA"] === "granted") {
                data = data + "是\n"
                perCount++
            } else {
                data = data + "否\n"
            }

            data = data + "是否同意存储权限: "
            if (granteds["android.permission.WRITE_EXTERNAL_STORAGE"] === "granted") {
                data = data + "是\n"
                perCount++
            } else {
                data = data + "否\n"
            }
            console.log(data);

            if (perCount == permissions.length) {
                this.state.isPermis = true;
            }

        } catch (err) {
            toastShort(err.toString())
        }
    }

    onBackAndroid = () => {
        console.log('onBackAndroid', global.routeName)

        if (global.routeName == 'GMTHomePage' || global.routeName == 'TabIndex') {
            Alert.alert(
                '退出提示',
                '是否要退出光明通APP？',
                [
                    {
                        text: '取消',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                    },
                    {
                        text: '确定',
                        onPress: () => {
                            BackHandler.exitApp();
                        },
                    },
                ],
                { cancelable: false },
            );
            return true;
        }
    };


    _navOpen = (type, id, outCode, PageName, typeName) => () => {

        if (!this.state.isPermis) this.requestMultiplePermission();

        //跳转到H5的界面或者RN原生界面
        if (outCode != 'app') {
            //参数加密
            let h5Url = global.H5Url + "?url=" + PageName;
            console.log('H5Url: ' + h5Url)

            self.props.navigation.navigate('Web', {
                outCode: 'h5',
                h5Url: h5Url
            })

        } else {
            if (typeof (PageName) != "undefined" && PageName != '') global.navigation.navigate(PageName);
        }
    }

    navToH5Url = (h5PageName) => {

        let h5Url = global.H5Url + "?url=" + h5PageName;
        console.log('H5Url: ' + h5Url)

        self.props.navigation.navigate('Web', {
            outCode: 'h5',
            h5Url: h5Url
        })
    };

    _onScroll(event) {

        // if (global.routeName === 'HomePage2') {

        //     let y = event.nativeEvent.contentOffset.y;
        //     console.log(y)
        //     if (y > 210) {
        //         this.setState({ StatusBarBgColor: '#2589FF', })
        //     } else {
        //         this.setState({ StatusBarBgColor: 'transparent', })
        //     }
        // }

    };

    handleTouch(e){
        console.log("handleTouch" , e);
    }

    goWeb(PageName, type) {
        // const h5LocalUrl = `http://10.8.26.79:8080/grassrootsH5/index.html#/pages/auth/index`
        //跳转到H5的界面或者RN原生界面
        if (type != 'app') {
          //参数加密
          let h5Url = global.H5Url + "?url=" + PageName;
        //   let h5Url = h5LocalUrl + "?url=" + PageName;
          console.log('H5界面：' + h5Url)
    
          self.props.navigation.navigate('Web', {
            outCode: 'h5',
            h5Url: h5Url
          })
    
        } else {
          global.navigation.navigate(PageName);
        }
    }

    render() {
        n = this.props.navigation;
        self = this;
        const { gmtMenuList1 = [] , gmtMenuList2 = [] } = this.state;
        const weekMap = ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"]
        const week = moment().day();
        const date = moment().format("YYYY-MM-DD");
        console.log("gmtMenuList1", gmtMenuList1);
        return (
            <View style={styles.container}>

                <StatusBar
                    animated={false} //指定状态栏的变化是否应以动画形式呈现。 
                    translucent={this.state.StatusBarTranslucent}//指定状态栏是否透明。设置为true时:transparent
                    backgroundColor={this.state.StatusBarBgColor} //状态栏的背景色
                    barStyle={this.state.StatusBarFtColor} // 字体样式 enum('default', 'light-content', 'dark-content')  
                />
 
                <View style={{ width: '100%' ,  height: scaleSize(420)  }}>
                    <ImageBackground style={{ flex: 1 , position: 'relative' }}
                    source={require('../../../assets/myIndex/topbg.png')}>
                        <View style={{ marginHorizontal: scaleSize(25) , paddingTop: scaleSize(20) , height: '100%' , position: 'relative' }}>
                            <View style={[ { height: scaleSize(50) , flexDirection: 'row' , justifyContent: "space-between" , alignItems: "center"} ]}>
                                <Text style={{ color: '#FFF' }}>光明通</Text>
                                <TouchableOpacity  onPress={()=> this.goWeb("/pages/notify/index") } style={[ styles.icon , { width: scaleSize(40) , height: scaleSize(40)} ]}>
                                    <Image
                                        source={require('../../../assets/gmt/bell_icon.png')}
                                        resizeMode="contain"
                                        style={{ width: "100%" , height: "100%"}}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={[ styCom.FlexBetween ]}>
                                <Text style={{ color: '#FFF' , fontSize: scaleSize(40) ,  marginBottom: scaleSize(20) , marginTop: scaleSize(60) }}>{weekMap[week % 7]}</Text>
                            </View>

                            <View style={[ styCom.FlexBetween ]}>
                                <Text style={{ color: '#FFF' }}>{date}</Text>
                            </View>

                            {
                                gmtMenuList1 && gmtMenuList1.length > 0 
                                ?   <View style={[ styles.card , styCom.Flex , styCom.FlexWrap ]}>
                                    {
                                        Array.isArray(gmtMenuList1) && gmtMenuList1.map( (menu,idx) => {
                                            // const defualUrl = 'https://mdajtest.szzt.com.cn/upload/image/20220428/1651117755943_eaba8c1e4a564fe6a4c3430bec05ab66.JPG'
                                            const { id , name , dataUrl , iconImgs = [] } = menu;
                                            const iconUrl = iconImgs && iconImgs.length>0 ? iconImgs[0].url : "";
                                            return (
                                                <TouchableOpacity key={id} onPress={()=> this.goWeb(dataUrl) } style={[ styCom.FlexCenterColumn , { width: "33.3%"}]}>
                                                    <View style={[ styles.icon , { marginBottom: scaleSize(15) }]}>
                                                        <Image
                                                            source={{ uri: iconUrl }}
                                                            resizeMode="contain"
                                                            style={{ width: "100%" , height: "100%"}}
                                                        />
                                                    </View>
                                                    <Text style={[{ color: '#777777' , fontSize: scaleSize(20) }]}>{name}</Text>
                                                </TouchableOpacity>
                                            )
                                        })
                                    }
                                </View>
                                : null
                            }
                        </View>
                    </ImageBackground>
                </View>

                <ScrollView style={{ width: '100%' }} ref={(r) => this.scrollview = r}
                    onScroll={this._onScroll.bind(this)}
                    contentContainerStyle={{ paddingBottom: scaleSize(10) }}>
                        
                        {
                            Array.isArray(gmtMenuList2) && gmtMenuList2.map( (menu,idx) => {
                                const { id , name , menuVOS = [] } = menu;
                                return (
                                    <View key={id} style={{ paddingTop: scaleSize(100) , paddingHorizontal: scaleSize(25) }}>
                                        <Text style={{ color: "#5d5d5d" , fontWeight: "500" , fontSize: scaleSize(30) , marginBottom: scaleSize(25) }}>{name}</Text>
                                        {
                                            menuVOS && menuVOS.length>0 
                                            ?   <View style={[ styCom.Flex , styCom.Column ]}>
                                                    {
                                                        Array.isArray(menuVOS) && menuVOS.map( (item) => {
                                                            const { id , name , dataUrl , iconImgs = [] , description } = item;
                                                            const iconUrl = iconImgs && iconImgs.length>0 ? iconImgs[0].url : "";
                                                            return (
                                                                <TouchableOpacity key={id} onPress={()=> this.goWeb(dataUrl) } style={[ styCom.FlexStartCenter , styles.listItem ]}>
                                                                    <View style={[ styles.icon , { marginRight: scaleSize(15) } ]}>
                                                                        <Image
                                                                            source={{ uri: iconUrl }}
                                                                            resizeMode="contain"
                                                                            style={{ width: "100%" , height: "100%"}}
                                                                        />
                                                                    </View>
                                
                                                                    <View style={[ styCom.Flex , styCom.Column ]}>
                                                                        <Text style={{ color: "#5b5b5b" , fontWeight: '500' , fontSize: scaleSize(30) }}>{name}</Text>
                                                                        <Text style={{ color: "#b6b6b6" ,  fontSize: scaleSize(20) }}>{description}</Text>
                                                                    </View>
                                                                </TouchableOpacity>
                                                            )
                                                        })
                                                    }
                                                </View>
                                            :   null
                                        }   
                                    </View>
                                )
                            })
                        }
                </ScrollView>
  
                {/* <Bottom active="h" navigation={this.props.navigation} /> */}
                <UpdateVersion />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        display: 'flex',
    },
    card:{
        width: "100%",
        position: 'absolute',
        zIndex: 10,
        bottom: scaleSize(-70),
        backgroundColor: '#FFF',
        borderRadius: 5,
        paddingVertical: scaleSize(25),
        paddingHorizontal: scaleSize(20),
    },  
    listItem: {
        width: '100%',
        backgroundColor: '#FFF',
        marginBottom: scaleSize(25),
        paddingHorizontal: scaleSize(15),
        paddingVertical: scaleSize(25),
    },
    icon: {
        width: scaleSize(80),
        height: scaleSize(80),
        backgroundColor: 'transparent',
        borderRadius: 3,
        // backgroundColor: 'red',
        // paddingHorizontal: scaleSize(8),
        // paddingVertical: scaleSize(8),
    }

});
