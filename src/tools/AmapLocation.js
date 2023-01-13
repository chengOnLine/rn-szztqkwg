/**
 * https://github.com/facebook/react-native
 * @author leo_zhu(563803119@qq.com)
 * @file 获取定位
 */
import {
    Platform,
    NativeModules,
    ToastAndroid,
    NetInfo
} from 'react-native';
const amaplocation = NativeModules.AMapLocationModule;

import GeolocationService from 'react-native-geolocation-service';
import { GPSChange } from './comm';
import { toastShort } from '../tools/toastUtil';


/**
 * 获取用户地理位置
 * 返回对象
 */
export async function getLocation2() {
    let obj = '';
    return new Promise(function (resolve, reject) {
        console.log('正在获取定位信息...');

        GeolocationService.getCurrentPosition(
            (res) => {
                let obj;
                console.log('获取到定位信息2：' + JSON.stringify(res));

                if (res.coords.longitude) {

                    let wgs84 = GPSChange.gcj_encrypt(res.coords.latitude, res.coords.longitude);

                    let latlng = wgs84.lon + ',' + wgs84.lat;

                    latlngToaddress(latlng).then((loc) => {
                        if (loc.status === "1") {
                            let address = loc.regeocode.formatted_address

                            let location = {
                                coords: {
                                    longitude: res.coords.longitude,
                                    latitude: res.coords.latitude,
                                    lonwgs84: wgs84.lon,
                                    latwgs84: wgs84.lat,
                                    speed: res.coords.speed,

                                    lng: wgs84.lon,
                                    lat: wgs84.lat,
                                },
                                address: address,
                            }
                            obj = { code: 0, data: location }
                        } else {
                            obj = { code: 1, data: '失败' }
                        }
                        console.log('解析到定位信息：' + JSON.stringify(obj));
                        resolve(obj);
                    });
                }
            }
        )
    }, (error) => {
        // See error code charts below.
        toastShort(error.message);
        console.log(error.code, error.message);
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 });
}


export async function getLocation() {
    return new Promise(function (resolve, reject) {
        console.log('正在获取定位信息...');
        // amaplocation.initLoaction();

        amaplocation.startLocation(
            (msg) => {
                let res = JSON.parse(msg);
                console.log('获取到定位信息1：' + JSON.stringify(res));

                let obj;
                if (res.data.longitude != undefined) {
                    
                    let wgs84 = GPSChange.gcj_decrypt_exact(res.data.latitude, res.data.longitude);

                    let location = {
                        coords:{
                            longitude:res.data.longitude,
                            latitude:res.data.latitude,
                            longitudewgs84:wgs84.lon,
                            latitudewgs84:wgs84.lat,
                            speed:res.data.speed,

                            lng: wgs84.lon,
                            lat: wgs84.lat,
                        },
                        address:res.data.address,
                    }
                    obj = {
                        code:0,
                        data:location
                    }

                    let latlng = res.data.longitude + ',' + res.data.latitude;
                    latlngToaddress(latlng).then((loc) => {
                        if (loc.status === "1") {
                            let address = loc.regeocode.formatted_address

                            let location = {
                                coords: {
                                    longitude: res.data.longitude,
                                    latitude: res.data.latitude,
                                    lonwgs84: wgs84.lon,
                                    latwgs84: wgs84.lat,
                                    speed: res.data.speed,

                                    lng: wgs84.lon,
                                    lat: wgs84.lat,
                                },
                                address: address,
                            }
                            obj = { code: 0, data: location }
                        } else {
                            obj = { code: 1, data: '失败' }
                        }
                        console.log('解析到定位信息：' + JSON.stringify(obj));
                        resolve(obj);
                    });
                    
                } else {
                    obj = { code: 1, data: '失败' }
                }
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
