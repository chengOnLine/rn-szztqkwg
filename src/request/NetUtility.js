/*
* 网络请求的实现
 */
import React, { Component } from 'react';
import { getUUID } from "../tools/comm";
import { toastShort } from "../tools/toastUtil";

const delay = timeout => {
    return new Promise((resolve, reject) => {
        // setTimeout(() => reject('请求超时，请稍后再试！'), timeout)
    })
}

//封装的请求  带超时
const _timeout = 45 * 1000  //默认45秒
//GET请求
const get = (url, params, callback) => {

    var getPromise = new Promise((resolve, reject) => {

        let token = '';
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

        // console.log('url:'+url);
        //fetch请求
        fetch(url, {
            method: 'GET',
            headers: {
                // "X-Requested-With": "XMLHttpRequest",
                // // 'token':global.user.token,
                Authorization: global.zlt_oauthToken,
                // 'onceKey': getUUID(),
                'uid': global.user.info.id,
            },
            credentials: "include"//javascript 使用fetch进行跨域请求时默认是不带cookie的，所以会造成 session失效。那所以在登录请求的时候需要加上credentials: ‘include’这个字段
        }).then((response) => {
            // console.log('response:'+response);
            return response.json();
        }).then((response) => {

            // console.log("请求接口：" + url);
            // console.log("请求参数：" + JSON.stringify(params))
            // console.log("返回结果：" + JSON.stringify(response));

            resolve();
            exitApp();
            callback(response);
        }).catch((error) => {
            toastShort('请求超时，请稍后再试！', 'center');
            // callback({code:'119',message:'网络错误，请重试！'});
        }).done();
    })
    // return Promise.race([getPromise,timeoutPromise]);
    return Promise.race([getPromise, delay(_timeout)]);
}

const post = (url, params, headers, callback) => {

    var postPromise = new Promise((resolve, reject) => {

        let formData = new FormData();
        if (params) {
            Object.keys(params).forEach(key => formData.append(key, params[key]));
        }

        let fetchData = {
            method: 'POST',
            credentials: "include",
            /*
             * spring cloud接口頭部
             */
            headers: {
                Authorization: global.zlt_oauthToken,
                'token': getUUID(),
            }
        };

        // /**  application/x-www-form-urlencoded模式
        if (formData._parts.length > 0) {
            fetchData.body = formData;
        }

        // console.log("请求接口：" + url);
        // console.log("请求参数：" + JSON.stringify(params))

        //fetch请求
        fetch(url, fetchData).then((response) => {
            try {
                return response.json();
            } catch (e) {
                console.log('callback', e);
            }
        }).then((responseJSON) => {
            try {
                // console.warn(responseJSON);
                resolve();

                if (responseJSON.hasOwnProperty("code") && responseJSON.code == '1')
                    responseJSON.code = '-1';
                // toastShort('请求接口: ' + url.replace(global.requestApi, '') + '返回：' + responseJSON.code, 'center');

                // console.log("token:" + global.zlt_oauthToken);
                console.log("请求接口：" + url);
                // console.log("请求参数：" + JSON.stringify(params))
                console.log("返回结果：" + JSON.stringify(responseJSON));

                callback(responseJSON);

            } catch (e) {
                console.log("请求接口：" + url);
                console.log('callback', e);
                callback({ code: '119', msg: '网络错误，请重试！' });
            }
        }).catch((error) => {
            // console.log(JSON.stringify(error));

            toastShort('网络错误，请重试:' + error, 'center');
            callback({ code: '119', msg: '网络错误，请重试，' + error });
        }).done();
    })

    // return Promise.race([postPromise,timeoutPromise]);
    return Promise.race([postPromise, delay(_timeout)]);
}

export { get, post };