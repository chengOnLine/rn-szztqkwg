// global.requestApi ='https://mdajtest.szzt.com.cn/';
// global.requestApi ='http://10.255.18.130:7051/';
global.requestApi = 'http://10.255.33.30:7050/';
global.imageUrl = 'https://mdajtest.szzt.com.cn/upload/',

global.requestHeadAuthorization = '';

global.version = {
    curNumber: 'V1.0.2',
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


global.local = '';
global.ismap = false;
global.issign = false;//android是否签到 0未签到，1已签到
global.amapwebservicekey = 'dff11e8054c63bfab4119e09020f3015'  //高德appkey


//当前路由实例
global.navigation = null;
global.routeName = "";
global.H5Title = "综合网格";
// global.H5Url="https://mdajtest.szzt.com.cn/grassrootsH5/index.html#/pages/auth/index";

// global.H5Url="http://10.255.18.130:7051/grassrootsH5/index.html#/pages/auth/index";
// global.H5Url="http://10.8.24.126:8080/grassrootsH5/index.html#/pages/auth/index"; //内网测试
// global.H5Url="http://10.8.26.81:8080/grassrootsH5/index.html#/pages/auth/index"; //内网测试
global.H5Url="http://10.255.33.30:7050/gmtH5/index.html#/pages/auth/index"