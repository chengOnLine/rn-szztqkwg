import React from "react";
import { TransitionPresets } from "@react-navigation/stack";

const getCurrentScreenIndex = ({ navigation, route }) => {

    return navigation.getState().routes.findIndex(item => {
        return item.key === route.key
    });
}

export const NavigatorConfig = {

    StackNavigatorDefaultConfig: {
        screenOptions: ({ navigation, route }) => {
            // console.log('navigation:'+JSON.stringify(navigation))
            // console.log("route:"+route.name)

            global.routeName = route.name
            console.log("global.routeName" , global.routeName)

            const screenIndex = getCurrentScreenIndex({ navigation, route })
            const screenCount = navigation.getState().index;

            // false不从内存中释放页面
            // 配置为堆栈最顶部的两个页面不释放
            const detachPreviousScreen =false;// screenCount - screenIndex > 2;

            return {
                headerShown: false, // 关闭默认导航
                gestureEnabled: false, // true:手势可操作
                ...TransitionPresets.SlideFromRightIOS, // 这里使用的是传统的右边滑入
                detachPreviousScreen,
            }
        }
    },
}

