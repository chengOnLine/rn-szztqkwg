import React, { Component } from 'react'
import {
    Text,
    View,
    Image,
    StyleSheet,
    Dimensions,
    Platform,
    TouchableOpacity
} from 'react-native'
import {deviceWidth, scaleSize, setSpText} from '../../tools/adaptation';
import CommonStyles from "../../styles/longBan";

export default class LongBanScoreItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            checked:this.props.checked,
        }
    }

    render() {
        return (
            <View>
                <View style={[CommonStyles.flexRow]}>
                    <TouchableOpacity
                        style={[CommonStyles.flexRow,{alignItems:'center'}]}
                        activeOpacity={1}
                        onPress={()=>{
                            // self._setStatus(item2.id,1);
                            this.setState({checked:1});
                            this.props.setTopStatus(this.props.id,1);
                            this.props.setStatus(this.props.id,1);
                        }}
                    >
                        <Image source={this.state.checked=='1'?require('../../assets/checked.png'):require('../../assets/check.png')} resizeMode="contain" style={{ width:scaleSize(48),height:scaleSize(48),marginRight:scaleSize(5)}}></Image>
                        <View style={[CommonStyles.flexRow]}>
                            <Text style={{color:'#0398ff'}}>合格</Text>
                            <Text style={{marginLeft:scaleSize(12)}}>{this.props.unqualifiedScore}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[CommonStyles.flexRow,{alignItems:'center',marginLeft:scaleSize(50)}]}
                        activeOpacity={1}
                        onPress={()=>{
                            // self._setStatus(item2.id,0);
                            this.setState({checked:0});
                            this.props.setTopStatus(this.props.id,0);
                            this.props.setStatus(this.props.id,0);
                        }}
                    >
                        <Image source={this.state.checked=='0'?this.props.isRoutineItem?require('../../assets/checked_red.png'): require('../../assets/checked.png'):require('../../assets/check.png')} resizeMode="contain" style={{ width:scaleSize(48),height:scaleSize(48),marginRight:scaleSize(5)}}></Image>
                        <View style={[CommonStyles.flexRow]}>
                            <Text style={{color:'#a0a0a0'}}>不合格</Text>
                            <Text style={{marginLeft:scaleSize(12)}}>{this.props.qualificationScore}分</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}