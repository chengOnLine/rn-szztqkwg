import React from 'react';
import {
    StyleSheet,
    ToastAndroid,
    BackHandler,
    Button,
    View,
    Text,
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import router from "./index"
import { NavigatorConfig } from "./navigatorConfig"; // 每个页面通用的配置

import { deviceWidth, deviceHeight, scaleSize } from '../tools/adaptation';

const Stack = createStackNavigator();
const StackNavigator = () => {
    //从子导航器获取路由名称
    const getChildTitle = (route) => {
        const routeName = getFocusedRouteNameFromRoute(route);
        return routeName
    }

    return (
        <Stack.Navigator {...NavigatorConfig.StackNavigatorDefaultConfig} >
            {
                router.map((item, index) => {
                    return (
                        <Stack.Screen key={index} name={item.name} component={item.component}
                            options={({ route }) => ({
                                title: getChildTitle(route) || item.title,
                                headerStyle: {
                                    backgroundColor: item.headerBgColor == undefined ? '#0072bb' : item.headerBgColor,
                                    height: 40
                                },
                                headerTitleStyle: {
                                    color: item.headerFtColor == undefined ? '#0072bb' : item.headerFtColor,
                                    fontSize: 15
                                },
                                headerTitleAlign: 'center',
                                headerTintColor: item.headerBgColor == undefined ? '#fff' : '#000', //返回

                                // headerBackVisible:false,    //此参数IOS才生效?
                                // headerBackTitle:'G0',

                                headerShown: item.headerShown == undefined ? true : item.headerShown, //不显示头部标题

                                // headerRight: () => (
                                //     <Button
                                //         onPress={() => alert('This is a button!')}
                                //         title="Info"
                                //         color="#fff"
                                //     />
                                // ),
                                // headerShown: false, //不显示头部标题
                            })} />
                    )
                })
            }
        </Stack.Navigator>
    );
}

export default StackNavigator;