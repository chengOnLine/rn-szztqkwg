import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, StyleSheet } from "react-native"
import { scaleSize } from '../tools/adaptation';


const Tab = createBottomTabNavigator();
const tabbar = [
    {
        name: "首页",
        component: require("../views/index/HomePage3").default,
        icon: require("../assets/home.png"),
        selectIcon: require("../assets/home_activity.png")
    },
    {
        name: "日常巡查",
        component: require("../views/patrol/PatrolDaily").default,
        icon: require("../assets/xunluo.png"),
        selectIcon: require("../assets/xunluo_activity.png")
    },
    {
        name: "党建活动",
        component: require("../views/index/NewsIndex").default,
        icon: require("../assets/dangjian.png"),
        selectIcon: require("../assets/dangjian_activity.png")
    },
    {
        name: "个人中心",
        component: require("../views/index/MyIndex2").default,
        icon: require("../assets/myIndex.png"),
        selectIcon: require("../assets/myIndex_activity.png")
    },
]

const GMT_tabbar = [
    {
        name: "首页",
        component: require("../views/gmt/index/HomePage").default,
        icon: require("../assets/home.png"),
        selectIcon: require("../assets/home_activity.png")
    },
    {
        name: "巡查",
        component: require("../views/gmt/index/InspectionH5").default,
        icon: require("../assets/gmt/inspection.png"),
        selectIcon: require("../assets/gmt/inspection_active.png")
    },
    {
        name: "待办",
        component: require("../views/gmt/index/ToDoTask").default,
        icon: require("../assets/gmt/doing.png"),
        selectIcon: require("../assets/gmt/doing_activity.png")
    },
    {
        name: "我的",
        component: require("../views/gmt/index/Mine").default,
        icon: require("../assets/myIndex.png"),
        selectIcon: require("../assets/myIndex_activity.png")
    },
]

const TabNavigator = () => {
    return (
        <Tab.Navigator
            tabBarOptions={{
                //文字的样式
                labelStyle: {
                    // fontSize: 14,
                    marginBottom: 6,
                },
            }}>

            {
                GMT_tabbar.map((item, index) => {
                    return (
                        <Tab.Screen key={index} name={item.name} component={item.component}

                            options={{
                                headerShown: item.headerShown ? true : false,
                                // tabBarBadge: 3,  //气泡数量
                                headerTitleAlign: 'center',

                                tabBarIcon: ({ focused }) => (
                                    <Image source={focused ? item.selectIcon : item.icon} style={[styles.image]} />
                                ),
                            }}
                        />
                    )
                })
            }
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    image: {
        width: scaleSize(55),
        height: scaleSize(55),
    },
});

export default TabNavigator;