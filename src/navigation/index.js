import React from 'react';
import {
  Image, View, StyleSheet, BackHandler,
  Button, Alert, Text, FlatList, TextInput,
  Platform, NativeModules, StatusBar, ScrollView, TouchableOpacity, DeviceEventEmitter, PermissionsAndroid , ImageBackground
} from 'react-native';
import { deviceWidth, deviceHeight, scaleSize } from '../tools/adaptation';
// import Web from '../views/index/web';//外链其他网页
// import Checkislogin from '../views/index/CheckisLogin'; //启动页校验
// import HomePage from '../views/index/HomePage'; //首页
// import MailList from '../views/index/MailList';
// import Settings from '../views/setings/Index';
// import Login from '../views/login/Index';

//路由列表
// const Stack = createNativeStackNavigator();
// const routers = () => {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator
//         screenOptions={{
//           headerShown: false,

//           headerTitleAlign: 'center',
//           headerStyle: {
//             backgroundColor: '#f4511e',
//           },
//           headerTitleStyle: {
//             fontWeight: 'bold',
//             color: '#fff',
//           },
//         }}
//         initialRouteName="Checkislogin">
//         <Stack.Screen name="Checkislogin" component={Checkislogin} />

//         <Stack.Screen name="Web" component={Web} />
//         <Stack.Screen name="HomePage" component={HomePage} />
//         <Stack.Screen name="MailList" component={MailList} />
//         <Stack.Screen name="Settings" component={Settings} />
//         <Stack.Screen name="Login" component={Login} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// };

// module.exports = routers;


const router = [
  
  // {
  //   name: "AMapViewTest", //跳转路径,默认加载当前页
  //   headerShown: false,
  //   title: "授权页", //头部展示标题
  //   component: require("../views/test/AMapViewTest").default,
  // },

  {
    name: "Checkislogin", //跳转路径,默认加载当前页
    headerShown: false,
    title: "授权页", //头部展示标题
    component: require("../views/index/CheckisLogin").default,
  },

  {
    name: "TabIndex", //跳转路径
    title: "tabIndex", //头部展示标题
    headerShown: false,
    component: require("./TabNavigator").default,
  },

  //下面只需要配置非tabbar页面路径

  {
    name: "HomePage3",
    headerShown: false,
    title: "首页",
    component: require("../views/index/HomePage3").default
  },


  {
    name: "NewsIndex",
    title: "党建活动",
    headerBgColor: '#FFF',
    headerFtColor: '#000',
    component: require("../views/index/NewsIndex").default
  },

  {
    name: "MailList",
    // headerShown: false,
    headerBgColor: '#FFF',
    headerFtColor: '#000',
    title: "通讯录",
    component: require("../views/index/MailList").default
  },
  {
    name: "Settings",
    headerShown: false,
    title: "个人设置",
    component: require("../views/setings/Index").default
  },
  {
    name: "Login",
    headerShown: false,
    title: "治理通",
    component: require("../views/login/PwdLogin").default
  },

  {
    name: "MyIndex",
    headerShown: false,
    title: "我的主页",
    component: require("../views/index/MyIndex2").default
  },


  {
    name: "Web",
    headerShown: false,
    title: "H5登录",
    component: require("../views/index/Web").default
  },

  {
    name: "PwdLogin",
    headerShown: false,
    title: "密码登录",
    component: require("../views/login/PwdLogin").default
  },

  {
    name: "RegisterUser",
    headerShown: false,
    title: "注册用户",
    component: require("../views/login/RegisterUser").default
  },

  {
    name: "FingerSettings",
    headerShown: false,
    title: "指纹设置",
    component: require("../views/login/FingerSettings").default
  },

  {
    name: "PatrolDuty",
    title: "巡逻执勤",
    headerBgColor: '#FFF',
    headerFtColor: '#000',
    component: require("../views/patrol/PatrolDuty").default
  },
  {
    name: "PatrolDutyList",
    title: "巡逻列表",
    headerBgColor: '#FFF',
    headerFtColor: '#000',
    component: require("../views/patrol/PatrolDutyList").default
  },

  {
    name: "PatrolDutyedList",
    title: "巡逻记录",
    headerBgColor: '#FFF',
    headerFtColor: '#000',
    component: require("../views/patrol/PatrolDutyedList").default
  },

  {
    name: "PatrolDutyDetails",
    title: "巡逻详情",
    headerBgColor: '#FFF',
    headerFtColor: '#000',
    component: require("../views/patrol/PatrolDutyDetails").default
  },

  {
    name: "PatrolDutyDetails2",
    title: "巡逻详情",
    headerBgColor: '#FFF',
    headerFtColor: '#000',
    component: require("../views/patrol/PatrolDutyDetails2").default
  },

  {
    name: "PatrolDaily",
    headerBgColor: '#FFF',
    headerFtColor: '#000',
    title: "日常巡逻",
    component: require("../views/patrol/PatrolDaily").default
  },
  {
    name: "PatrolDailyDetails",
    headerBgColor: '#FFF',
    headerFtColor: '#000',
    title: "巡逻列表",
    component: require("../views/patrol/PatrolDailyDetails").default
  },

  {
    name: "MyAttendance",
    headerBgColor: '#FFF',
    headerFtColor: '#000',
    title: "我的考核",
    component: require("../views/patrol/MyAttendance").default
  },
  {
    name: "MyAttendanceDetails",
    headerBgColor: '#FFF',
    headerFtColor: '#000',
    title: "考核详情",
    component: require("../views/patrol/MyAttendanceDetails").default
  },

  // 光明通
  {
    name: "GMTHomePage",
    headerShown: false,
    title: "首页",
    component: require("../views/gmt/index/HomePage").default
  },
  {
    name: "GMTMine",
    headerShown: false,
    title: "我的",
    component: require("../views/gmt/index/Mine").default
  },
  {
    name: "GMTFingerprint",
    headerShown: false,
    headerBgColor: "#108bf4",
    headerFtColor: "#FFFFFF",
    title: "指纹设置",
    component: require("../views/gmt/fingerprint/Setting").default
  },
  {
    name: "GMTInspection",
    headerShown: false,
    title: "巡查",
    component: require("../views/gmt/index/InspectionH5").default
  },
  {
    name: "GMTToDoTask",
    headerShown: false,
    title: "巡查",
    component: require("../views/gmt/index/ToDoTask").default
  },
  {
    name: "GMTLogin",
    headerShown: false,
    title: "密码登录",
    component: require("../views/gmt/login/Login").default
  },
]

export default router
