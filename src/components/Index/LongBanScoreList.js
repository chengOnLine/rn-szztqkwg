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
import LongBanScoreItem from './LongBanScoreItem';
import CommonStyles from "../../styles/longBan";
//适配屏幕

export default class LongBanScoreList extends Component {
    constructor(props) {
        super(props);
        this.state={
            firstStatus:this.props.firstOpen,
            openStatus:[],
            isFirstLoad:true,
            data:[],
            data1:[],
        }
    }

    render() {
        let item = this.props.item;
        let self=this;
        if(this.state.isFirstLoad){
            this.state.isFirstLoad=false;
            for(let idx=0;idx<item.children.length;idx++){
                this.state.openStatus.push(item.children[idx].open);
                for(let idx2=0;idx2<item.children[idx].children.length;idx2++) {
                    this.state.data.push({
                        id:item.children[idx].children[idx2].id,
                        checkState:item.children[idx].children[idx2].checkState,
                    })
                }
            }
            this.state.data1=Object.assign([],this.state.data);
        }
        return (
            <View style={{marginBottom:scaleSize(20)}}>
                {/*<View style={[{flexDirection:'row',justifyContent:'space-between',backgroundColor:'#fff',padding:scaleSize(20),paddingRight:scaleSize(60),borderBottomColor:'#ececec',borderBottomWidth:scaleSize(1)}]}>*/}
                    {/*<Text style={{color:'#5a5a5a',fontWeight:'bold'}}>{item.text}</Text>*/}
                    {/*<Text style={{color:'#5a5a5a',fontWeight:'bold'}}>{item.qualificationScore}分</Text>*/}
                    {/*<TouchableOpacity*/}
                        {/*style={{position:'absolute',*/}
                            {/*top:0,*/}
                            {/*right:scaleSize(20),*/}
                            {/*bottom:0,*/}
                            {/*justifyContent:'center'}}*/}
                        {/*activeOpacity={1}*/}
                        {/*onPress={()=>{*/}
                            {/*self.props._updateCheckItemsOpen(item.id,!this.state.firstStatus);*/}
                            {/*this.setState({firstStatus:!this.state.firstStatus})*/}
                        {/*}}*/}
                    {/*>*/}
                        {/*<Image source={this.state.firstStatus?require('../../assets/cw03.png'):require('../../assets/cw04.png')} style={{width:scaleSize(26),height:scaleSize(16)}}/>*/}
                    {/*</TouchableOpacity>*/}
                {/*</View>*/}
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={()=>{
                        // self.props._updateCheckItemsOpen(item.id,!this.state.firstStatus);
                        this.setState({firstStatus:!this.state.firstStatus,data:self.state.data1})
                    }}
                    style={[{flexDirection:'row',justifyContent:'space-between',backgroundColor:'#fff',padding:scaleSize(20),paddingRight:scaleSize(60),borderBottomColor:'#ececec',borderBottomWidth:scaleSize(1)}]}>
                    <Text style={{color:'#5a5a5a',fontWeight:'bold'}}>{item.text}</Text>
                    <Text style={{color:'#5a5a5a',fontWeight:'bold'}}>{item.qualificationScore}分</Text>
                    <View
                        style={{position:'absolute',
                            top:0,
                            right:scaleSize(20),
                            bottom:0,
                            justifyContent:'center'}}
                    >
                        <Image source={this.state.firstStatus?require('../../assets/cw03.png'):require('../../assets/cw04.png')} style={{width:scaleSize(26),height:scaleSize(16)}}/>
                    </View>
                </TouchableOpacity>
                {
                    this.state.firstStatus?
                    item.children.map(function(item1,seq){
                        return (
                            <View key={item1.id} >
                        {/*<View key={item1.id+Math.floor(Math.random()*40)+6000} >*/}
                            {/*<View style={{backgroundColor:'#fff'}}>*/}
                                {/*<View style={[{flexDirection:'row',justifyContent:'space-between',padding:scaleSize(20),paddingLeft:scaleSize(0),paddingRight:scaleSize(40),*/}
                                    {/*borderBottomColor:'#ececec',borderBottomWidth:scaleSize(1),marginLeft:scaleSize(20),marginRight:scaleSize(20)}]}>*/}
                                    {/*<Text style={{color:'#5a5a5a'}}>{item1.text}</Text>*/}
                                    {/*<Text style={{color:'#5a5a5a'}}>{item1.qualificationScore}分</Text>*/}
                                    {/*<TouchableOpacity*/}
                                        {/*style={{position:'absolute',*/}
                                            {/*top:0,*/}
                                            {/*right:scaleSize(0),*/}
                                            {/*bottom:0,*/}
                                            {/*justifyContent:'center'}}*/}
                                        {/*activeOpacity={1}*/}
                                        {/*onPress={()=>{*/}
                                            {/*let status=self.state.openStatus[seq];*/}
                                            {/*let oStatus=Object.assign([],self.state.openStatus);*/}
                                            {/*oStatus[seq]=!status;*/}
                                            {/*self.props._updateCheckItemsOpen(item1.id,!status);*/}
                                            {/*self.setState({openStatus:oStatus})*/}
                                        {/*}}*/}
                                    {/*>*/}
                                        {/*<Image source={self.state.openStatus[seq]?require('../../assets/cw03.png'):require('../../assets/cw04.png')} style={{width:scaleSize(26),height:scaleSize(16)}}/>*/}
                                    {/*</TouchableOpacity>*/}
                                {/*</View>*/}
                            {/*</View>*/}
                            <TouchableOpacity
                                onPress={()=>{
                                    let status=self.state.openStatus[seq];
                                    let oStatus=Object.assign([],self.state.openStatus);
                                    oStatus[seq]=!status;
                                    // self.props._updateCheckItemsOpen(item1.id,!status);

                                    self.setState({openStatus:oStatus,data:self.state.data1})
                                }}
                                activeOpacity={1}
                                style={{backgroundColor:'#fff'}}>
                                <View style={[{flexDirection:'row',justifyContent:'space-between',padding:scaleSize(20),paddingLeft:scaleSize(0),paddingRight:scaleSize(40),
                                    borderBottomColor:'#ececec',borderBottomWidth:scaleSize(1),marginLeft:scaleSize(20),marginRight:scaleSize(20)}]}>
                                    <Text style={{color:'#5a5a5a'}}>{item1.text}</Text>
                                    <Text style={{color:'#5a5a5a'}}>{item1.qualificationScore}分</Text>
                                    <View
                                        style={{position:'absolute',
                                            top:0,
                                            right:scaleSize(0),
                                            bottom:0,
                                            justifyContent:'center'}}

                                    >
                                        <Image source={self.state.openStatus[seq]?require('../../assets/cw03.png'):require('../../assets/cw04.png')} style={{width:scaleSize(26),height:scaleSize(16)}}/>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            {
                                self.state.openStatus[seq]?
                                item1.children.map(function(item2,index){
                                    if(index==item1.children.length-1){
                                        return (
                                            <View key={item2.id} style={{backgroundColor:'#fff',borderBottomColor:'#ececec',borderBottomWidth:scaleSize(1)}}>
                                        {/*<View key={item2.id+Math.floor(Math.random()*40)+90} style={{backgroundColor:'#fff',borderBottomColor:'#ececec',borderBottomWidth:scaleSize(1)}}>*/}
                                            <View style={[{padding:scaleSize(20),marginLeft:scaleSize(20),marginRight:scaleSize(20)}]}>
                                                <Text style={{color:'#000',lineHeight:scaleSize(60),marginBottom:scaleSize(10)}}>{item2.text}</Text>
                                                <LongBanScoreItem checked={self._getStatus(item2.id)}
                                                                  id={item2.id}
                                                                  isRoutineItem={item.text!='加分项'}
                                                                  unqualifiedScore={item2.unqualifiedScore}
                                                                  qualificationScore={item2.qualificationScore}
                                                                  setStatus={self.props.modifyCheck}
                                                                  setTopStatus={(id,val)=>{
                                                                      let data1=self.state.data;
                                                                      for(let i=0;i<data1.length;i++){
                                                                          if(data1[i].id==id){
                                                                              data1[i].checkState=val;
                                                                          }
                                                                      }
                                                                      // this.props.switchCheck(id,val);
                                                                      // this.setState({data:data1});
                                                                      self.state.data1=data1;
                                                                  }}
                                                    />
                                                {/*<View style={[CommonStyles.flexRow]}>*/}
                                                    {/*<TouchableOpacity*/}
                                                        {/*style={[CommonStyles.flexRow,{alignItems:'center'}]}*/}
                                                        {/*activeOpacity={1}*/}
                                                        {/*onPress={()=>{*/}
                                                            {/*self._setStatus(item2.id,1);*/}
                                                        {/*}}*/}
                                                    {/*>*/}
                                                        {/*<Image source={self._getStatus(item2.id)=='1'?require('../../assets/checked.png'):require('../../assets/check.png')} resizeMode="contain" style={{ width:scaleSize(48),height:scaleSize(48),marginRight:scaleSize(5)}}></Image>*/}
                                                        {/*<View style={[CommonStyles.flexRow]}>*/}
                                                            {/*<Text style={{color:'#0398ff'}}>合格</Text>*/}
                                                            {/*<Text style={{marginLeft:scaleSize(12)}}>{item2.unqualifiedScore}</Text>*/}
                                                        {/*</View>*/}
                                                    {/*</TouchableOpacity>*/}
                                                    {/*<TouchableOpacity*/}
                                                        {/*style={[CommonStyles.flexRow,{alignItems:'center',marginLeft:scaleSize(50)}]}*/}
                                                        {/*activeOpacity={1}*/}
                                                        {/*onPress={()=>{*/}
                                                            {/*self._setStatus(item2.id,0);*/}
                                                        {/*}}*/}
                                                    {/*>*/}
                                                        {/*<Image source={self._getStatus(item2.id)=='0'?require('../../assets/checked.png'):require('../../assets/check.png')} resizeMode="contain" style={{ width:scaleSize(48),height:scaleSize(48),marginRight:scaleSize(5)}}></Image>*/}
                                                        {/*<View style={[CommonStyles.flexRow]}>*/}
                                                            {/*<Text style={{color:'#a0a0a0'}}>不合格</Text>*/}
                                                            {/*<Text style={{marginLeft:scaleSize(12)}}>{item2.qualificationScore}分</Text>*/}
                                                        {/*</View>*/}
                                                    {/*</TouchableOpacity>*/}
                                                {/*</View>*/}

                                            </View>
                                        </View>
                                        )
                                    }else{
                                        return (
                                        <View key={item2.id} style={{backgroundColor:'#fff'}}>
                                            <View style={[{padding:scaleSize(20), borderBottomColor:'#ececec',borderBottomWidth:scaleSize(1),marginLeft:scaleSize(20),marginRight:scaleSize(20)}]}>
                                                {/*<View style={[{padding:scaleSize(20),marginLeft:scaleSize(20),marginRight:scaleSize(20)}]}>*/}
                                                <Text style={{color:'#000',lineHeight:scaleSize(60),marginBottom:scaleSize(10)}}>{item2.text}</Text>
                                                <LongBanScoreItem checked={self._getStatus(item2.id)}
                                                                  id={item2.id}
                                                                  isRoutineItem={item.text!='加分项'}
                                                                  unqualifiedScore={item2.unqualifiedScore}
                                                                  qualificationScore={item2.qualificationScore}
                                                                  setStatus={self.props.modifyCheck}
                                                                  setTopStatus={(id,val)=>{
                                                                      let data1=self.state.data;
                                                                      for(let i=0;i<data1.length;i++){
                                                                          if(data1[i].id==id){
                                                                              data1[i].checkState=val;
                                                                          }
                                                                      }
                                                                      // this.props.switchCheck(id,val);
                                                                      // this.setState({data:data1});
                                                                      self.state.data1=data1;
                                                                  }}
                                                                  />
                                                {/*<View style={[CommonStyles.flexRow]}>*/}
                                                    {/*<TouchableOpacity*/}
                                                        {/*style={[CommonStyles.flexRow,{alignItems:'center'}]}*/}
                                                        {/*activeOpacity={1}*/}
                                                        {/*onPress={()=>{*/}
                                                            {/*self._setStatus(item2.id,1);*/}
                                                        {/*}}*/}
                                                    {/*>*/}
                                                        {/*<Image source={self._getStatus(item2.id)=='1'?require('../../assets/checked.png'):require('../../assets/check.png')} resizeMode="contain" style={{ width:scaleSize(48),height:scaleSize(48),marginRight:scaleSize(5)}}></Image>*/}
                                                        {/*<View style={[CommonStyles.flexRow]}>*/}
                                                            {/*<Text style={{color:'#0398ff'}}>合格</Text>*/}
                                                            {/*<Text style={{marginLeft:scaleSize(12)}}>{item2.unqualifiedScore}分</Text>*/}
                                                        {/*</View>*/}
                                                    {/*</TouchableOpacity>*/}
                                                    {/*<TouchableOpacity*/}
                                                        {/*style={[CommonStyles.flexRow,{alignItems:'center',marginLeft:scaleSize(50)}]}*/}
                                                        {/*activeOpacity={1}*/}
                                                        {/*onPress={()=>{*/}
                                                            {/*self._setStatus(item2.id,0);*/}
                                                        {/*}}*/}
                                                    {/*>*/}
                                                        {/*<Image source={self._getStatus(item2.id)=='0'?require('../../assets/checked.png'):require('../../assets/check.png')} resizeMode="contain" style={{ width:scaleSize(48),height:scaleSize(48),marginRight:scaleSize(5)}}></Image>*/}
                                                        {/*<View style={[CommonStyles.flexRow]}>*/}
                                                            {/*<Text style={{color:'#a0a0a0'}}>不合格</Text>*/}
                                                            {/*<Text style={{marginLeft:scaleSize(12)}}>{item2.qualificationScore}分</Text>*/}
                                                        {/*</View>*/}
                                                    {/*</TouchableOpacity>*/}
                                                {/*</View>*/}
                                            </View>
                                        </View>
                                        )
                                    }
                                })
                                    :
                                    null
                            }
                        </View>
                        )
                    })
                        :
                        null
                }
            </View>
        )
    }

    _getStatus(id){
        let data=this.state.data;
        let ret=-1;
        for(let i=0;i<data.length;i++){
            if(data[i].id==id){
                ret=data[i].checkState;
                break;
            }
        }

        return ret;
    }

    _setStatus(id,val){
        let data1=self.state.data;
        for(let i=0;i<data1.length;i++){
            if(data1[i].id==id){
                data1[i].checkState=val;
            }
        }
        // this.props.switchCheck(id,val);
        // this.setState({data:data1});
        self.state.data1=data1;
    }

    _setStatusV2(id,val){
        // let data1=this.state.data;
        // for(let i=0;i<data1.length;i++){
        //     if(data1[i].id==id){
        //         data1[i].checkState=val;
        //     }
        // }
        this.props.modifyCheck(id,val);
    }
}
