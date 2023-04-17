global.requestApi ='https://mdajtest.szzt.com.cn/' //http://10.255.33.30:7050/;

//治理通请求url
global.zlt_requestApi ='https://mdajtest.szzt.com.cn';

global.imageUrl = 'https://mdajtest.szzt.com.cn/upload/',

global.requestHeadAuthorization = '';
global.zlt_oauthToken=""

global.version = {
    curNumber: 'V2.0.40',
    onLineDate: '2021-2-7',
    updateRemark: ['1、微服务改造；', '2、楼栋平安功能升级。']
};

global.user = {
    appRoleList: [
        { menuName: '我的任务', menuImageUrl: '/image/20220428/1651117755943_eaba8c1e4a564fe6a4c3430bec05ab66.JPG' },
        { menuName: '我的任务2', menuImageUrl: '/image/20220428/1651117755943_eaba8c1e4a564fe6a4c3430bec05ab66.JPG' },
        { menuName: '我的任务2', menuImageUrl: '/image/20220428/1651117755943_eaba8c1e4a564fe6a4c3430bec05ab66.JPG' },
        { menuName: '我的任务2', menuImageUrl: '/image/20220428/1651117755943_eaba8c1e4a564fe6a4c3430bec05ab66.JPG' },
        { menuName: '我的任务3', menuImageUrl: '/image/20220428/1651117755943_eaba8c1e4a564fe6a4c3430bec05ab66.JPG' }
    ],

    token: '',
    userUid: '',
    locationTime: 1000,

    msgCount:0,
    info: {}
}


global.zltVersion = {
    curNumber: '2.0.32',
};

global.zltUser={
    info: {},
    oldUser:[],
    userName:''
}


//楼栋长模块
global.longBan = {
    url:'http://218.17.84.2:8092',
    info: {},
}

global.rsaKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDC35n5N6pBwqIp5HprtG+ZT5HvZJEBUB/IZ2hjU17WQaffBWF1Ux1lReI2ryzVzFDvZ+ziZupDenLqq1PN6Vdaae1BJXUxmdz+TUEB57oh1g02isoZw/dHK8dgOxnQ0Af0v252FeNryB0kGQ/VY6xuJCUFedvbdGPa+0ncNTJTqQIDAQAB';
global.rsaDecKey = 'MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAMLfmfk3qkHCoinkemu0b5lPke9kkQFQH8hnaGNTXtZBp98FYXVTHWVF4javLNXMUO9n7OJm6kN6cuqrU83pV1pp7UEldTGZ3P5NQQHnuiHWDTaKyhnD90crx2A7GdDQB/S/bnYV42vIHSQZD9VjrG4kJQV529t0Y9r7Sdw1MlOpAgMBAAECgYAt4wkWrgzhPzuAMdTB19MPfrUWcc/TR1K0leT2voLuYLduxI2WWuPpHPOPfOBJ17qXJRmaljFDgmnc6Erria6PqneWCpM/MbD8vZfq+bTLimYsv4QhGDd/m0tGNRQvapMx6RIMmHiLRLR/XH6yg24jmEFX0xV/TtVbrZz/YUH4AQJBAOV8L6+c2P2g6q4NwOhiEGqmOpiv/PSlWjqR9wUHC5IZjn5BT7166NxI42puU3Y3MjNZ42oxRHbn0mW1YkdThMkCQQDZY6frRe+vvX8CQhutuvvNDJ84BroAJd5MM2U5WfY7ocApfPKtyf39e8ytEhAooucqLPCeghK86NCp36QHECfhAkEA0tiVH67ml7GfraepVFm1Z6evMtaPfV/nVOUDprTgZq3ghBQR5a/l/29gs0sGmBkCoLe4ALufgfhhEV3kHFCaMQJASp+kB+aFBd3V2I+a8sNKJrRbf58HgH9/VMcby1kvZn76+QL0R2Ycc0RpGUwnEdwB4H92xeK+zexZnMaxht8r4QJBALVokM+oVAq8Ywd6yowjRh7+L1a4QM72k12oB+Cer++WT75NTWnDRQScAjDGYR5Z8Un9Brt5AZYfUwgMNlDZNO0=';
global.verifyCodeSwitch=false


global.local = '';
global.ismap = false;
global.issign = false;//android是否签到 0未签到，1已签到
global.amapwebservicekey = 'dff11e8054c63bfab4119e09020f3015'  //高德appkey


//当前路由实例
global.navigation = null;
global.routeName = "";
global.H5Title = "";

global.H5Url="https://mdajtest.szzt.com.cn/zhwg-app-h5/index.html#/pages/auth/index";

//治理通h5
global.zltH5Url="https://mdajtest.szzt.com.cn/zltH5/index.html#/auth";