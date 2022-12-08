import React , { Component } from "react";
import { deviceWidth, deviceHeight, scaleSize } from '../../../tools/adaptation';
import styCom from '../../../styles/index'
import { toastShort } from '../../../tools/toastUtil';
import { HttpGet, HttpPost } from '../../../request/index'
import {
    Image, View, StyleSheet, BackHandler,
    Button, Alert, Text, FlatList, TextInput,Modal,
    Platform, NativeModules, StatusBar, ScrollView, TouchableOpacity, DeviceEventEmitter, PermissionsAndroid , ImageBackground, RefreshControl,
} from 'react-native';
// import ModalDropdown from 'react-native-modal-dropdown';
import Header from "../../../components/gmt/header";
export default class Inspection extends Component{
    constructor(props){
        super(props);
        this.state = {
            searchText: "",
            listRefreshing:false,
            moreOptionModalVisible: false,
            placeList:[
                // { 
                //     labelList: [],
                // },
                // { 
                //     labelList: [],
                // },
                // { 
                //     labelList: [],
                // },
                // { 
                //     labelList: [],
                // }
            ],
            filterOptions:[
                {
                    title: "场所码状态",
                    selectedValue: undefined,
                    list: [{
                        label:"已上传",
                    },{
                        label:"未上传",
                    },],
                },
                {
                    title: "员工数排序",
                    selectedValue: undefined,
                    list: [{
                        label:"升序",
                    },{
                        label:"降序",
                    },],
                },
                {
                    title: "核酸状态",
                    selectedValue: undefined,
                    list: [{
                        label:"24小时内",
                    },{
                        label:"24-48小时内",
                    },{
                        label:"48-72小时内",
                    },{
                        label:"72小时-7天内",
                    },{
                        label:"24小时以上",
                    },{
                        label:"48小时以上",
                    },{
                        label:"72小时以上",
                    },{
                        label:"7天以上",
                    },{
                        label:"未查询到数据",
                    }]
                },
                {
                    title: "疫苗状态",
                    selectedValue: undefined,
                    list: [{
                        label:"只接种第一针",
                    },{
                        label:"已接种第二针",
                    },{
                        label:"已接种加强针",
                    },{
                        label:"未查询到数据",
                    },]
                },
            ]
        }
    }

    componentDidMount(){
        this.loadData();
    }
    handleLabelRadioChange = (title , value) => {
        const { filterOptions = [] } = this.state;
        let item = filterOptions.find( item => item.title === title );
        if( item ){
            item.selectedValue = value;
            this.setState({
                filterOptions: [...filterOptions],
            })
        }
    }
    handleLabelRadioReset = () => {
        const { filterOptions = [] } = this.state;
        filterOptions.forEach( item => {
            item.selectedValue = undefined;
        })
        this.setState({
            filterOptions: [...filterOptions],
        })
    }
    goToPage = (page) => {
        const { navigation } = this.props;
        navigation.navigate(page)
    }

    pullOrderList = (pageNumber,isFirstLoad) => {
        console.log("pullOrderList" , pageNumber , isFirstLoad);
        const { placeList = [] } = this.state;
        const params = this.getParams();
        HttpPost('qkwg-gmt/gmtPlace/findPage' , Object.assign({
            pageNumber: pageNumber,
            pageSize: 10,
        } , params ), 'json').then( (result)=>{
            const { code , data } = result;
            const { rows = [] , total = 0 } = data;
            if( code == 1 && data ){
                if( Array.isArray( rows) ){
                    this.setState({
                        placeList: pageNumber === 1 ? rows : placeList.concat(rows),
                        hasNextPage: pageNumber === 1 ? rows.length < total : placeList.concat(rows).length < total,
                        listRefreshing: false,
                    } , ()=>{
                        console.log("placeList" , this.state.placeList.length)
                    })
                }else{
                    this.setState({
                        placeList: isFirstLoad ? [] : placeList,
                        hasNextPage: false,
                        pageNumber: pageNumber,
                        listRefreshing: false,
                    })
                }
            }
        }).catch( e=>{
            this.setState({
                placeList: [],
                hasNextPage: true,
                pageNumber: pageNumber > 1 ? (pageNumber - 1) : 1,
                listRefreshing: false,
            })
        })
    }

    loadData = () => {
        this.pullOrderList(1,true);
    }

    pulldownRefresh = () => {
        this.setState({
            listRefreshing: true,
        })
        this.loadData();
    }

    getParams = () => {
        const { searchText } = this.state;
        return {
            key: searchText,
        }
    }

    handleTextChange = (value) => {
        this.setState({
            searchText: value,
        } , () => {
            this.loadData();
        })
    }

    _renderItem = ({item}) => {
        const { 
            id,
            name,
            employeeCount,
            address,
            createTime,
            updateTime,
            liableUserName,
            liableUserTel,
            placeLabels = [],
        } = item;
        return (
        <View style={[styles.cardItem ]} key={id}>
            <View style={[ styCom.FlexBetween , { marginBottom: scaleSize(15) }]}>
                <Text style={[ styles.title ]}>{name}</Text>
                <Text style={[ { color: '#178bfa' , fontWeight: '500' }]}>67米</Text>
            </View>

            <View style={[ styCom.FlexBetween , { marginBottom: scaleSize(15) }]}>
                <View style={[ styCom.FlexWrap , styCom.FlexCenter ]}>
                    {
                        Array.isArray( placeLabels ) && placeLabels.map( (ele,idx) => {
                            const { name } = ele ;
                            return (
                                <View key={idx} style={[ { borderWidth: scaleSize(1) , borderColor: "#4ba5f8" , paddingHorizontal: scaleSize(5) , marginRight: scaleSize(5) , marginBottom:scaleSize(5) } , styCom.FlexCenterCenter ]}>
                                    <Text style={{ color: '#4ba5f8' , fontSize: scaleSize(24) }}>{name}</Text>
                                </View>
                            )
                        })
                    }
                    {/* <View style={[ { borderWidth: scaleSize(1) , borderColor: "#4ba5f8" , paddingHorizontal: scaleSize(5) , marginRight: scaleSize(5) , marginBottom:scaleSize(5) } , styCom.FlexCenterCenter ]}>
                        <Text style={{ color: '#4ba5f8' , fontSize: scaleSize(24) }}>在经营</Text>
                    </View>
                    <View style={[ { borderWidth: scaleSize(1) , borderColor: "#4ba5f8" , paddingHorizontal: scaleSize(5) , marginRight: scaleSize(5) , marginBottom:scaleSize(5) } , styCom.FlexCenterCenter ]}>
                        <Text style={{ color: '#4ba5f8' , fontSize: scaleSize(24) }}>场所码</Text>
                    </View>
                    <View style={[ { borderWidth: scaleSize(1) , borderColor: "#4ba5f8" , paddingHorizontal: scaleSize(5) , marginRight: scaleSize(5) , marginBottom:scaleSize(5) } , styCom.FlexCenterCenter ]}>
                        <Text style={{ color: '#4ba5f8' , fontSize: scaleSize(24) }}>住宿和餐饮业</Text>
                    </View> */}
                </View>

                <View style={[styles.icon]}>
                    <Image source={require('../../../assets/gmt/no_selected_icon.png')} style={{ width: '100%' , height: '100%' }}></Image>
                </View>
            </View>

            <View style={[ styCom.Flex , { marginBottom: scaleSize(20) }]}>
                <Text style={[ styles.labelText , { marginRight: scaleSize(20) }]}>场所ID:</Text>
                <Text style={[ styles.valueText , styCom.Flex1 ]}>{id}</Text>
            </View>
            <View style={[ styCom.Flex , { marginBottom: scaleSize(20) }]}>
                <Text style={[ styles.labelText , { marginRight: scaleSize(20) }]}>员工数:</Text>
                <Text style={[ styles.valueText , styCom.Flex1 ]}>{`${employeeCount || "--"} 人`}</Text>
            </View>
            <View style={[ styCom.Flex , { marginBottom: scaleSize(20) }]}>
                <Text style={[ styles.labelText , { marginRight: scaleSize(20) }]}>负责人:</Text>
                <View style={[ styCom.Flex , styCom.Flex1 ]}>
                    <Text style={[ styles.valueText , { marginRight: scaleSize(20) }]}>{liableUserName || "--"}</Text>
                    <Text style={[ { color:'#2f9af5' , fontSize: scaleSize(24) , fontWeight: '500' } , { borderBottomWidth: scaleSize(1) , borderBottomColor: '#2f9af5'}]}>{liableUserTel || "--"}</Text>
                </View>
            </View>
            <View style={[ styCom.Flex , { marginBottom: scaleSize(20) }]}>
                <Text style={[ styles.labelText , { marginRight: scaleSize(20) }]}>地址:</Text>
                <Text style={[ styles.valueText , styCom.Flex1 ]}>{address || '--' }</Text>
            </View>
            <View style={[ styCom.Flex , { marginBottom: scaleSize(20) }]}>
                <Text style={[ styles.labelText , { marginRight: scaleSize(20) }]}>采集时间:</Text>
                <Text style={[ styles.valueText , styCom.Flex1 ]}>{ createTime || "--" }</Text>
            </View>
            <View style={[ styCom.Flex , { marginBottom: scaleSize(20) }]}>
                <Text style={[ styles.labelText , { marginRight: scaleSize(20) }]}>更新时间:</Text>
                <Text style={[ styles.valueText , styCom.Flex1 ]}>{ updateTime || '--' }</Text>
            </View>
        </View>   
        )
    }

    render(){
        const { searchText , placeList = [] , moreOptionModalVisible , filterOptions = [] , listRefreshing , hasNextPage , pageNumber = 1 } = this.state;
        const { navigation } = this.props;
        const renderRightTitle = () => {
            return (
                <View style={[ styCom.FlexCenterCenter , { width: scaleSize(60) , height: scaleSize(60)} ]}>
                    <Image source={require('../../../assets/gmt/add_icon.png')} style={{ width: '100%' , height: '100%' }}></Image>
                </View>
            )
        }
        return <View style={ styles.container }>
            <Header title="场所列表" navigation={navigation} leftTitle={false} rightTitle={ renderRightTitle } onRightTitlePress={ () => { console.log("onRightTitlePress")}} ></Header>
            <View style={[ styles.subHeader ]}>
                <View style={[{ marginBottom: scaleSize(15) }]}>
                    <TextInput
                        clearButtonMode="always"
                        placeholder='请输入搜素关键词'
                        style={styles.textInput}
                        value={searchText}
                        underlineColorAndroid='transparent' //设置下划线背景色透明 达到去掉下划线的效果
                        returnKeyType="search"
                        returnKeyLabel="搜索"
                        // onSubmitEditing={e => {
                        //     // this._getList();
                        //     console.log("onSubmitEditing")
                        // }}
                        onChangeText={this.handleTextChange}
                    />
                </View>
                <View style={[{ width: '100%' , paddingVertical:scaleSize(5) } , styCom.FlexAroundCenter ]}>
                    
                    {/* <ModalDropdown options={['option 1', 'option 2']}>
                        <View>
                            <Text>行政区划</Text>
                        </View>
                    </ModalDropdown>
                    <ModalDropdown options={['option 1', 'option 2']} style={{ }}>
                        <View>
                            <Text style={[ { fontSize: scaleSize(24) , fontWeight: '500' } ]}>行业类型</Text>
                        </View>
                    </ModalDropdown>
                    <ModalDropdown options={['option 1', 'option 2']} style={{ }}>
                        <View>
                            <Text style={[ { fontSize: scaleSize(24) , fontWeight: '500' } ]}>场所标签</Text>
                        </View>
                    </ModalDropdown>
                    <ModalDropdown options={['option 1', 'option 2']} style={{ }}>
                        <View>
                            <Text style={[ { fontSize: scaleSize(24) , fontWeight: '500' } ]}>经营状态</Text>
                        </View>
                    </ModalDropdown> */}
                    <TouchableOpacity onPress={()=> ( this.setState({ moreOptionModalVisible: !moreOptionModalVisible }))}>
                        <Text>更多</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[{ paddingHorizontal: scaleSize(25) } , styCom.Flex1 , styCom.Flex , styCom.Column ]}>
                <View style={[ styCom.FlexEnd , { marginVertical: scaleSize(25) }]}>
                    <Text style={[{ color: '#178bfa' , fontWeight: '500'}]}>{`合计: ${placeList.length}`}</Text>
                </View>

                <FlatList 
                    style={{ width: '100%' , flex: 1 }}
                    horizontal={false}
                    data={placeList}
                    renderItem={ this._renderItem }
                    keyExtractor={(item , index)=> `${item.id}` }
                    // ItemSeparatorComponent={this._separatorLineView}
                    // ListHeaderComponent={this._headerView}
                    refreshControl={
                        <RefreshControl refreshing={listRefreshing} onRefresh={this.pulldownRefresh}>
                        </RefreshControl>
                    }
                    ListEmptyComponent={() =>
                        !listRefreshing && <View style={[styCom.FlexCenterCenter , { flex: 1 , backgroundColor: "#FFFFFF"}]}>
                            <Text>暂无场所信息</Text>        
                        </View>
                    }
                    // ListFooterComponent={footerView}
                    onEndReached={() => {
                        // console.log("aaa")
                        if (hasNextPage) {
                            this.pullOrderList(pageNumber + 1)
                        }
                    }}>
                </FlatList> 

                {/* <ScrollView style={{ width: '100%' , flex: 1 }} ref={(r) => this.scrollview = r}
                    contentContainerStyle={{ paddingBottom: scaleSize(5) }}>
                        {
                            Array.isArray( placeList ) && placeList.map( (item,idx) => {
                                const { labelList = [] } = item;
                                return (
                                <View style={[styles.cardItem]} key={idx}>
                                    <View style={[ styCom.FlexBetween , { marginBottom: scaleSize(15) }]}>
                                        <Text style={[ styles.title ]}>深圳市光明区瑞湘所餐厅</Text>
                                        <Text style={[ { color: '#178bfa' , fontWeight: '500' }]}>67米</Text>
                                    </View>
        
                                    <View style={[ styCom.FlexBetween , { marginBottom: scaleSize(15) }]}>
                                        <View style={[ styCom.FlexWrap , styCom.FlexCenter ]}>
                                            <View style={[ { borderWidth: scaleSize(1) , borderColor: "#4ba5f8" , paddingHorizontal: scaleSize(5) , marginRight: scaleSize(5) , marginBottom:scaleSize(5) } , styCom.FlexCenterCenter ]}>
                                                <Text style={{ color: '#4ba5f8' , fontSize: scaleSize(24) }}>在经营</Text>
                                            </View>
                                            <View style={[ { borderWidth: scaleSize(1) , borderColor: "#4ba5f8" , paddingHorizontal: scaleSize(5) , marginRight: scaleSize(5) , marginBottom:scaleSize(5) } , styCom.FlexCenterCenter ]}>
                                                <Text style={{ color: '#4ba5f8' , fontSize: scaleSize(24) }}>场所码</Text>
                                            </View>
                                            <View style={[ { borderWidth: scaleSize(1) , borderColor: "#4ba5f8" , paddingHorizontal: scaleSize(5) , marginRight: scaleSize(5) , marginBottom:scaleSize(5) } , styCom.FlexCenterCenter ]}>
                                                <Text style={{ color: '#4ba5f8' , fontSize: scaleSize(24) }}>住宿和餐饮业</Text>
                                            </View>
                                        </View>
        
                                        <View style={[styles.icon]}>
                                            <Image source={require('../../../assets/gmt/no_selected_icon.png')} style={{ width: '100%' , height: '100%' }}></Image>
                                        </View>
                                    </View>
            
                                    <View style={[ styCom.Flex , { marginBottom: scaleSize(20) }]}>
                                        <Text style={[ styles.labelText , { marginRight: scaleSize(20) }]}>场所ID:</Text>
                                        <Text style={[ styles.valueText , styCom.Flex1 ]}>35153</Text>
                                    </View>
                                    <View style={[ styCom.Flex , { marginBottom: scaleSize(20) }]}>
                                        <Text style={[ styles.labelText , { marginRight: scaleSize(20) }]}>员工数:</Text>
                                        <Text style={[ styles.valueText , styCom.Flex1 ]}>15人</Text>
                                    </View>
                                    <View style={[ styCom.Flex , { marginBottom: scaleSize(20) }]}>
                                        <Text style={[ styles.labelText , { marginRight: scaleSize(20) }]}>员工数:</Text>
                                        <View style={[ styCom.Flex , styCom.Flex1 ]}>
                                            <Text style={[ styles.valueText , { marginRight: scaleSize(20) }]}>吕现宁</Text>
                                            <Text style={[ { color:'#2f9af5' , fontSize: scaleSize(24) , fontWeight: '500' } , { borderBottomWidth: scaleSize(1) , borderBottomColor: '#2f9af5'}]}>19129932787</Text>
                                        </View>
                                    </View>
                                    <View style={[ styCom.Flex , { marginBottom: scaleSize(20) }]}>
                                        <Text style={[ styles.labelText , { marginRight: scaleSize(20) }]}>地址:</Text>
                                        <Text style={[ styles.valueText , styCom.Flex1 ]}>深圳市光明区凤凰街道塘家社区光明高新产业园观光路以南、邦凯路以西邦凯科技工业园3#办公1层1008A、1009A、1012A、1013A</Text>
                                    </View>
                                    <View style={[ styCom.Flex , { marginBottom: scaleSize(20) }]}>
                                        <Text style={[ styles.labelText , { marginRight: scaleSize(20) }]}>采集时间:</Text>
                                        <Text style={[ styles.valueText , styCom.Flex1 ]}>2022-05-31 16:12:35</Text>
                                    </View>
                                    <View style={[ styCom.Flex , { marginBottom: scaleSize(20) }]}>
                                        <Text style={[ styles.labelText , { marginRight: scaleSize(20) }]}>更新时间:</Text>
                                        <Text style={[ styles.valueText , styCom.Flex1 ]}>2022-09-07 15:39:59</Text>
                                    </View>
                                </View>
                                )
                            })
                        }
                </ScrollView> */}
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={ moreOptionModalVisible }
                onRequestClose={() => {
                    this.setState({
                        moreOptionModalVisible: false,
                    })
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={[ styCom.FlexBetween , { marginBottom: scaleSize(25) } ]}>
                            <View style={{ width: scaleSize(35) , height: scaleSize(35) }}></View>
                            <View style={[ styCom.FlexCenterCenter ]}><Text style={styles.modalText}>更多筛选</Text></View>
                            <TouchableOpacity onPress={()=>{ this.setState({ moreOptionModalVisible : false })}} style={{ width: scaleSize(35) , height: scaleSize(35) }}>
                                <Image source={require("../../../assets/gmt/fork_icon.png")} style={{ width: '100%' , height: '100%' }}></Image>
                            </TouchableOpacity>
                        </View>
                        <View style={[{ flex: 1 }]}>
                            {
                                Array.isArray( filterOptions ) && filterOptions.map( (item,idx) => {
                                    const { title , list = [] , selectedValue } = item;
                                    return (
                                        <View key={idx}>
                                            <Text style={{ fontSize: scaleSize(26) , color: '#1c1c1c' , fontWeight: '500' , marginBottom: scaleSize(15)}}>场所码状态</Text>
                                            <View style={[ styCom.FlexWrap]}>
                                                {
                                                    Array.isArray(list) && list.map( (ele , index) => {
                                                        const { label } = ele;
                                                        return (
                                                            <TouchableOpacity activeOpacity={1} onPress={ ()=>this.handleLabelRadioChange(title , label) } style={[ styCom.FlexCenterCenter , selectedValue === label ? styles.activeLabel : styles.label , { marginRight: (index+1) %3 == 0 ? 0 : scaleSize(15) } ]}>
                                                                <Text style={{ color: selectedValue === label ? "#fe7704" :  "#1c1c1c" , fontWeight: '400'}}>{ label }</Text>
                                                            </TouchableOpacity>
                                                        )
                                                    })
                                                }
                                            </View>
                                        </View>
                                    )
                                })
                            }
                        </View>
                        <View style={[ styCom.FlexStartCenter , { width: '100%' }]}>
                            <TouchableOpacity onPress={()=>{ this.handleLabelRadioReset() }} style={[ styCom.FlexCenterCenter , { width: '50%' , paddingVertical: scaleSize(30) , backgroundColor: '#fea003' , borderTopLeftRadius: scaleSize(50) , borderBottomLeftRadius: scaleSize(50) }]}>
                                <Text style={{ color: '#FFFFFF' }}>重置</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=>{ this.setState({ moreOptionModalVisible: false })}} style={[ styCom.FlexCenterCenter , { width: '50%' , paddingVertical: scaleSize(30) , backgroundColor: '#fe7704' , borderTopRightRadius: scaleSize(50) , borderBottomRightRadius: scaleSize(50)}]}>
                                <Text style={{ color: '#FFFFFF' }}>确定</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    }
}
const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        display: 'flex',
    },

    header:{
        paddingVertical: scaleSize(15),
        paddingHorizontal: scaleSize(20),
        backgroundColor: '#108bf4',
    },

    headerLeft:{
        width: scaleSize(100),
        height: '100%',
        textAlign: 'left'
    },

    headerTitle:{
        color: "#FFFFFF",
    },

    headerRight:{
        width: scaleSize(100),
        height: '100%',
        textAlign: 'left'
    },

    subHeader:{
        width: '100%',
        paddingHorizontal: scaleSize(20),
        paddingVertical: scaleSize(15),
        backgroundColor: '#FFFFFF',
    },

    icon: {
        width: scaleSize(50),
        height: scaleSize(50),
        backgroundColor: 'transparent',
        borderRadius: 3,
        paddingHorizontal: scaleSize(8),
        paddingVertical: scaleSize(8),
    },
    textInput: {
        width: '100%',
        height: scaleSize(75),
        borderRadius: scaleSize(10),
        color: '#666',
        backgroundColor: '#F4F4F4',
        zIndex: 100,
    },
    title:{
        color: '#191919',
        fontWeight: '500',
        fontSize: scaleSize(28),
    },
    labelText:{
        color: '#8e8e8e',
        fontWeight: '500',
        fontSize: scaleSize(24),
        minWidth: scaleSize(100),
        textAlign: 'right',
    },
    valueText:{
        color: '#8e8e8e',
        fontSize: scaleSize(24),
    },
    cardItem: {
        width: '100%',
        marginBottom: scaleSize(20),
        // minHeight: scaleSize(250),
        paddingHorizontal: scaleSize(20),
        paddingVertical: scaleSize(15),
        backgroundColor: 'white',
        borderRadius: scaleSize(10),
    },
    centeredView: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '100%',
        height: deviceHeight*0.8,
        display: 'flex',
        backgroundColor: "white",
        borderTopLeftRadius: scaleSize(50),
        borderTopRightRadius: scaleSize(50),
        paddingHorizontal: scaleSize(25),
        paddingVertical: scaleSize(20),
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    openButton: {
        backgroundColor: "#F194FF",
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        fontWeight: '500',
        textAlign: "center",
        fontSize: scaleSize(30),
        color: '#1c1c1c'
    },
    label: { 
        width: deviceWidth/3 - 2*scaleSize(15) ,
        marginBottom: scaleSize(15) , 
        paddingVertical: scaleSize(20) , 
        backgroundColor: "#f6f6f6" , 
        borderRadius: scaleSize(50)
    },
    activeLabel: {
        width: deviceWidth/3 - 2*scaleSize(15) ,
        marginBottom: scaleSize(15) , 
        paddingVertical: scaleSize(20) , 
        backgroundColor: "rgba(254,119,4,0.2)" , 
        borderRadius: scaleSize(50)
    }
});