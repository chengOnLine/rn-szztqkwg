/*
* 网络请求的实现
 */
import React, { Component } from 'react';
import { toastShort } from '../tools/toastUtil';
import { CommonActions } from '@react-navigation/native';
import Load from '../components/Loading/Index';

//先定义延时函数
const delay = (timeOut = 8 * 1000) => {

    return new Promise((resolve, reject) => {
        // Load.hide();
        setTimeout(() => {
            toastShort('网络超时', 'bottom');

            resolve({ code: '500', message: '接口异常' });
        }, timeOut);
    })
}

const goLogin = () => {
    Load.hideAll();
    
    //接口请求返回401，重新登录
    global.navigation.dispatch(
        CommonActions.reset({
            index: 0,
            routes: [
                { name: 'GMTLogin' },
            ],
        })
    );
}


//fetch网络请求
const fetchPromise = (method, url, formData, contentType) => {

    let contentVal = ''

    if (contentType == 'json') {
        let jsonData = {}
        // jsonData['imei'] = global.uuid;
        if (formData) {
            formData._parts.forEach(item => {
                jsonData[item[0]] = item[1]
            })
        }
        formData = JSON.stringify(jsonData);

        contentVal = 'application/json'
    } else {
        contentType = "formdata"

        contentVal = method == 'POST' ? 'multipart/form-data' : 'application/x-www-form-urlencoded'
    }

    return new Promise((resolve, reject) => {

        if (global.routeName != 'HomePage3') Load.show();

        let fetchUrl = global.requestApi + url;

        fetch(fetchUrl, {
            method: method,
            credentials: "include",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                'Content-Type': contentVal,
                'Authorization': global.requestHeadAuthorization,
            },
            body: formData
        }).then((response) => {
            return response.json();

        }).then((responseJSON) => {

            Load.hideAll();

            // console.log("token:" + global.requestHeadAuthorization);
            console.log("请求URL:" + global.requestApi + url)
            console.log("请求参数:" + JSON.stringify(formData))
            console.log("返回结果:" + JSON.stringify(responseJSON))

            if (responseJSON.hasOwnProperty("code") && (responseJSON.code == '401')) {
                toastShort('会话已过期，请您重新登录！', 'bottom');
                goLogin();

            } else if (responseJSON.hasOwnProperty("code") && (responseJSON.code == '500')) {
                toastShort('接口异常', 'bottom');
                reject({ code: '500', message: '接口异常' });

            } else {
                resolve(responseJSON);
            }

        }).catch((err) => {
            Load.hideAll()
            reject(err);
        }).done();
    })
}

//race任务
const _fetch = (fetchPromise, url) => {
    //没有token
    if (global.requestHeadAuthorization == "" &&
        (url.indexOf('getSystemCurrConfig') < 0
            && url.indexOf('getQueryConfigure') < 0
            && url.indexOf('oauth/token') < 0)) {

        toastShort('会话已过期，请您重新登录！', 'bottom');

        goLogin();
        return false;
    }

    // return Promise.race([fetchPromise, delay(10 * 1000)]);
    return Promise.race([fetchPromise]);
}

//post
const HttpPost = (url, params, contentType) => {
    console.log("params" , params)
    let formData = new FormData();
    if (params) {
        Object.keys(params).forEach(key => formData.append(key, params[key]));
    }
    // console.log("HttpPost" ,formData )
    return _fetch(fetchPromise('POST', url, formData, contentType), url);
};

//get
const HttpGet = (url, params) => {

    if (params) {
        let paramsArray = [];
        //拼接参数
        if (Object.keys(params).length !== 0) {//Object.keys()：返回对象自身的所有可枚举的属性的键名
            for (const key in params) {
                paramsArray.push(`${key}=${params[key]}`);//字符串模板相对简单易懂些。ES6中允许使用反引号 ` 来创建字符串，此种方法创建的字符串里面可以包含由美元符号加花括号包裹的变量${vraible}
            }
        }
        if (url.search(/\?/) === -1) {
            url = `${url}?${paramsArray.join('&')}`;
        } else {
            url = `${url}&${paramsArray.join('&')}`;
        }
    }

    return _fetch(fetchPromise('Get', url,), url);
};
export { HttpPost, HttpGet }