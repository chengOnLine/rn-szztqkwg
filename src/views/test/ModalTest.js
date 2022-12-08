import React, { Component } from 'react';
import {
    TouchableOpacity,
    StatusBar,
    View,
    StyleSheet, TextInput, findNodeHandle,
    BackHandler,
    Text,
    Platform,
} from 'react-native';
import { deviceWidth, deviceHeight, scaleSize } from '../../tools/adaptation';
import AlertContainer from '../../components/Public/AlertContainer';
import SvgUri from 'react-native-svg-uri';
import { Icons } from '../../fonts/fontIcons'
import SplashScreen from 'react-native-splash-screen';

let self;
export default class ModalTest extends Component {
    constructor(props) {
        super(props);

        this.state = {
            alertShow: true,
            title: '巡逻',
            isweifa: true,

        };
    }
    componentDidMount() {

        SplashScreen.hide();//关闭启动屏幕
    }

    componentWillUnmount() {

    }

    // 弹框确定
    _alertOk = () => {
        this.props.navigation.navigate('AMapViewTest', { paramsId: 2222 });
    }

    // 弹出框显示隐藏
    _close(val) {
        this.setState({
            alertShow: val
        })
    }

    rdowfCheck(isCheck) {
        this.setState({ isweifa: isCheck })
    }

    render() {
        self = this.props;
        return (
            <View style={styles.container}>
                <AlertContainer
                    alertShow={this.state.alertShow}
                    isOkShow={true}
                    submit={this._alertOk}
                    isCancelShow={true}
                    isScrolling={false}
                    close={
                        this._close.bind(this)
                    }
                    btnTxt="确定"
                    title={this.state.title}
                    style={{
                        width: '100%',
                        borderTopRightRadius: scaleSize(10),
                        borderTopLeftRadius: scaleSize(10),
                        position: 'absolute',
                        bottom: 0
                    }}>

                    <View style={styles.listCon}>

                        <View style={styles.listItem}>
                            <View><Text>巡逻地点：</Text></View>
                            <View style={{ flex: 1, }}><Text numberOfLines={2}>广东省深圳市光明区同观大道9号靠证通电子产业园广东省深圳市光明区同观大道9号靠证通电子产业园</Text></View>

                            <TouchableOpacity
                                style={styles.closeContetn}
                                activeOpacity={1}
                                onPress={() => this.rdowfCheck(true)}>

                                <SvgUri style={styles.textSearchIcon} width="20" height="20"
                                    svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.shuaxin01}" fill="#2589FF"/>
                                    <path d="${Icons.shuaxin02}" fill="#2589FF"/>
                                    <path d="${Icons.shuaxin03}" fill="#2589FF"/>
                                    <path d="${Icons.shuaxin04}" fill="#2589FF"/></svg>`} />
                            </TouchableOpacity>

                        </View>

                        <View style={styles.listItem}>
                            <View><Text>是否违法：</Text></View>

                            <TouchableOpacity
                                style={{ width: 80, flexDirection: 'row' }}
                                activeOpacity={1}
                                onPress={() => this.rdowfCheck(true)}>

                                {
                                    this.state.isweifa ? <SvgUri style={styles.textSearchIcon} width="20" height="20"
                                        svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.rdoChecked}" fill="#2589FF"/></svg>`} />
                                        :
                                        <SvgUri style={styles.textSearchIcon} width="20" height="20"
                                            svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.rdoNoCheck}" fill="#2589FF"/></svg>`} />
                                }

                                <Text style={{ marginLeft: scaleSize(5) }}>是</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{ width: 80, flexDirection: 'row' }}
                                activeOpacity={1}
                                onPress={() => this.rdowfCheck(false)}>

                                {
                                    this.state.isweifa ?
                                        <SvgUri style={styles.textSearchIcon} width="20" height="20"
                                            svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.rdoNoCheck}" fill="#2589FF"/></svg>`} />
                                        :
                                        <SvgUri style={styles.textSearchIcon} width="20" height="20"
                                            svgXmlData={`<svg  viewBox="0 0 1024 1024"><path d="${Icons.rdoChecked}" fill="#2589FF"/></svg>`} />
                                }

                                <Text style={{ marginLeft: scaleSize(5) }}>否</Text>
                            </TouchableOpacity>

                        </View>
                        <View style={[styles.listItem, { alignItems: 'center' }]}>
                            <View><Text>事件描述：</Text></View>
                            <View><TextInput
                                onChangeText={(val) => this.setState({ title: val })}
                                value={this.state.title}
                                keyboardType={"default"}
                                underlineColorAndroid="transparent"
                                placeholderTextColor="#cccccc"
                                placeholder="请输入事件描述"
                                multiline={true}
                                blurOnSubmit={true}
                            /></View>
                        </View>

                    </View>

                </AlertContainer>

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
    },

    listCon: {
        padding: scaleSize(20),
    },

    listItem: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        // borderBottomColor:'#ccc',
        // borderBottomWidth:1,
        paddingTop: scaleSize(8),
        paddingBottom: scaleSize(8)
    },

});
