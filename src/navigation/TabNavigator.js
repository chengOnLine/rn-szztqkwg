import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, StyleSheet } from "react-native"
import { scaleSize } from '../tools/adaptation';


const Tab = createBottomTabNavigator();
const tabbar = [
    {
        name: "首页",
        component: require("../views/index/HomePage").default,
        icon: require("../assets/home.png"),
        selectIcon: require("../assets/home_activity.png")
    },
    {
        name: "考勤",
        component: require("../views/patrol/PatrolDaily").default,
        icon: require("../assets/xunluo.png"),
        selectIcon: require("../assets/xunluo_activity.png")
    },

    {
        name: "个人中心",
        component: require("../views/index/MyIndex2").default,
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
                tabbar.map((item, index) => {
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