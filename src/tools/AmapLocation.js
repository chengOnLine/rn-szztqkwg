/**
 * https://github.com/facebook/react-native
 * @author leo_zhu(563803119@qq.com)
 * @file 获取定位
 */
import {
    Platform,
    NativeModules,
    ToastAndroid,
    NetInfo,
    PermissionsAndroid,
    Alert,
    Linking,
} from 'react-native';
const amaplocation = NativeModules.AMapLocationModule;


import GeolocationService from 'react-native-geolocation-service';
import Geolocation from '@react-native-community/geolocation';
import { GPSChange } from './comm';
import { toastShort } from '../tools/toastUtil';
import { exp } from 'react-native/Libraries/Animated/Easing';
import { add } from 'react-native-reanimated';

export async function getLocationInfo(){
    return new Promise( async function( resolve , reject ) {
        const hasPermission = await hasLocationPermission();
        console.log("hasPermission" , hasPermission)
        if( hasPermission ){
            Promise.race([ getLocation2() , getLocation3() ]).then( async coords => {
                const { longitude , latitude , speed } = coords;
                const wgs84 = GPSChange.gcj_encrypt(latitude , longitude);
                const { lon , lat } = wgs84;
                const lonlat = lon + ',' + lat;
                let address = "";
                address = await lonAndLatToAddress(lonlat);
                const location = {
                    address: address,
                    coords: {
                        longitude: longitude,
                        latitude: latitude,
                        lonwgs84: lon,
                        latwgs84: lat,
                        speed: speed
                    },
                }
                // console.log("location" , location);
                resolve({ code: 0 , data: location });
            }).catch( (error) => {
                console.log("error" , error)
                const { code } = error;
                switch(code){
                    case 1 :
                        ToastAndroid.show("获取定位权限失败:" , ToastAndroid.LONG);
                        break;
                    case 2 :
                        ToastAndroid.show("请检查gps定位服务是否已开启:" , ToastAndroid.LONG);
                        break;
                    case 3 :
                        ToastAndroid.show("请求定位超时,请移步至空旷区: " , ToastAndroid.LONG);
                        break;
                    default:
                        ToastAndroid.show("请求定位服务发生错误", ToastAndroid.LONG);
                }
                reject({ code: 1 , error });
            })
        }else{
            reject({ code: 1 , msg: "请重新授权定位权限" });
        }
    })
}

/**
 * 获取用户地理位置
 * 返回对象
 */
export async function getLocation2() {
    return new Promise( async function (resolve, reject) {
        console.log("GeolocationService: 正在获取到定位信息...")
        GeolocationService.getCurrentPosition(
            (res) => {
                console.log('GeolocationService: 获取到的定位信息 ' + JSON.parse(JSON.stringify(res)) );
                if (res) {
                    const { coords = {} } = res;
                    resolve(coords);
                }
            },
            (error) => {
                console.log("GeolocationService: error",error.code, error.message);
                reject(error);
                // ToastAndroid.show("获取定位失败：" + error.message , ToastAndroid.LONG);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000
            }
        )
    });
}

export function getLocation3(){
    return new Promise( async function( resolve , reject ) {
        console.log("Geolocation: 正在获取到定位信息...")
        Geolocation.getCurrentPosition(
            (res) => { 
                console.log('Geolocation: 获取到的定位信息 ' + JSON.parse(JSON.stringify(res)) );
                if (res) {
                    const { coords = {} } = res;
                    resolve(coords);
                }
            },
            (error) => {
                console.log("Geolocation: error",error.code, error.message);
                reject(error);
            },
            {
              accuracy: {
                android: "high",
                ios: "best",
              },
              enableHighAccuracy: false,
              timeout: 15000,
              maximumAge: 0,
              distanceFilter: 0,
              // forceRequestLocation: this.state.forceLocation,
              // showLocationDialog: this.state.showLocationDialog,
            }
        );
    })
}


export async function getLocation() {
    return new Promise(function (resolve, reject) {
        console.log('正在获取定位信息...');
        amaplocation.initLoaction();

        amaplocation.startLocation(
            (msg) => {
                let res = JSON.parse(msg);
                console.log('获取到定位信息1：' + JSON.stringify(res));

                let obj;
                if (res.data.longitude != undefined) {
                    // let wgs84 = GPSChange.gcj_encrypt(res.data.latitude, res.data.longitude);

                    let location = {
                        coords: {
                            longitude: res.data.latitude,
                            latitude: res.data.longitude,
                            
                            lonwgs84: res.data.longitude,
                            latwgs84: res.data.latitude,
                            speed: res.data.speed
                        },
                        address: res.data.address,
                    }
                    console.log('解析到定位信息：' + JSON.stringify(obj));
                    obj = { code: 0, data: location }
                } else {
                    obj = { code: 1, data: '失败' }
                }
                resolve(obj);
            }
        )

    });
}

// 根据地址获取坐标
export function addresstolocal(name) {
    return new Promise(function (resolve, reject) {
        fetch('http://restapi.amap.com/v3/geocode/geo?key=' + global.amapwebservicekey + '&address=' + name + '&city=深圳', {
            method: 'GET',
            headers: {},
        }).then((response) => response.json())
            .then((responseJSON) => {
                resolve(responseJSON);
            }).catch((error) => {
                reject({ status: 0, info: '定位失败' })
            })
    })
}

// 根据经纬度获取坐标
export function latlngToaddress(latlng) {
    //restapi.amap.com/v3/geocode/regeo?key=您的key&location=116.481488,39.990464&poitype=商务写字楼&radius=0&extensions=all&batch=false&roadlevel=0

    return new Promise(function (resolve, reject) {
        fetch('https://restapi.amap.com/v3/geocode/regeo?key=' + global.amapwebservicekey + '&location=' + latlng + '&radius=0&extensions=base&batch=false&roadlevel=0', {
            method: 'GET',
            headers: {},
        }).then((response) => response.json())
            .then((responseJSON) => {
                resolve(responseJSON);
            }).catch((error) => {
                reject({ status: 0, info: '定位失败' })
            })
    })
}


export function amapgetDistance(startLat, startLng, endLat, endLng) {
    return new Promise(function (resolve, reject) {
        NativeModules.MapIntentModule.getDistance(parseFloat(startLat), parseFloat(startLng), parseFloat(endLat), parseFloat(endLng), (res) => {
            resolve(res);
        }, (err) => {
            console.log(res);
            reject(0);
        })
    });
}


export async function hasLocationPermission(){
    const openSetting = () => {
        Linking.openSettings().catch(() => {
            Alert.alert("Unable to open settings");
        });
    };
    const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    // console.log("ACCESS_FINE_LOCATION--permission", hasPermission);
    if (hasPermission) {
        return true;
    }
    const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    // console.log("ACCESS_FINE_LOCATION--permission", status);
    if (status === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
    }

    if (status === PermissionsAndroid.RESULTS.DENIED || status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ) {
        Alert.alert(`请帮助 "光明通" 开启您的定位权限`, "", [
            {
              text: "去设置",
              onPress: openSetting ,
            },
            { text: "取消", onPress: () => {} },
        ]);
        // ToastAndroid.show("请重新授权定位权限", ToastAndroid.LONG);
    }
    return false;
}

export function lonAndLatToAddress(lonlat){
    return latlngToaddress(lonlat).then((loc) => {
        console.log("loc" , JSON.parse(JSON.stringify(loc)))
        const { status , regeocode: { formatted_address } } = loc;
        let address = "";
        if ( status === "1" ) {  
            address = formatted_address;
        } 
        return address;
    })
}