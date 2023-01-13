// import React, { Component } from 'react';
// import {  View, Text} from 'react-native';

// import { RootSiblingParent } from 'react-native-root-siblings';
// import AppNavigator from './src/navigation/index.js';

// import './src/tools/global'

// //export  default routers;
// export default class index extends Component {
//   constructor(props) {
//     super(props);
//   }

//   render() {
//     return (
//       <RootSiblingParent>
//       <AppNavigator />
//     </RootSiblingParent>
//     )
//   }
// }



import 'react-native-gesture-handler'
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { RootSiblingParent } from 'react-native-root-siblings';
import StackNavigator from "./src/navigation/StackNavigator"
import global  from './src/tools/global'


import {LocaleConfig} from 'react-native-calendars';

LocaleConfig.locales['fr'] = {
  monthNames: ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
  monthNamesShort: ['1','2','3','4','5','6','7','8','9','10','11','12'],
  dayNames: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
  dayNamesShort: ['日','一','二','三','四','五','六']
};


LocaleConfig.defaultLocale = 'fr';

const App = () => {
  return (
    <RootSiblingParent>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </RootSiblingParent>
  );
}

export default App;
