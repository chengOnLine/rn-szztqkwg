/*
* 小工具
 */
import CryptoJS from 'crypto-js';


/**
 * 字符串MD5加密
 * 参数
 * str：需要加密的字符串
 * 返回对象
 * 加密后参数
 */
export function addMD5(str: string) {
    return CryptoJS.MD5(str).toString();
}
/**
 * 字符串base64加密
 * 参数
 * str：需要加密的字符串
 * 返回对象
 * 加密后参数
 */
export function addbase64(str: string) {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(str));
}
/**
 * 字符串esc加密
 * 参数
 * str：需要加密的字符串
 * 返回对象
 * 加密后参数
 */
export function encryptesc(val) {
    let word = val;
    let key = CryptoJS.enc.Utf8.parse(global.keys);
    let srcs = CryptoJS.enc.Utf8.parse(word);
    let encrypted = CryptoJS.AES.encrypt(srcs, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
    let str = CryptoJS.enc.Utf8.parse(encrypted.toString());
    let base64 = CryptoJS.enc.Base64.stringify(str);
    // return encrypted.toString();
    return base64;
}

export function encrypKeyVal(val, keyVal) {
    let word = val;
    let key = CryptoJS.enc.Utf8.parse(keyVal);
    let srcs = CryptoJS.enc.Utf8.parse(word);
    let encrypted = CryptoJS.AES.encrypt(srcs, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
    let str = CryptoJS.enc.Utf8.parse(encrypted.toString());
    let base64 = CryptoJS.enc.Base64.stringify(str);
    // return encrypted.toString();
    return base64;
}

export function decryptKeyVal(word, keyVal) {
    let keyDecrypt = CryptoJS.enc.Utf8.parse(keyVal);
    var decrypt = CryptoJS.AES.decrypt(word, keyDecrypt, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });

    return CryptoJS.enc.Utf8.stringify(decrypt).toString();
}

const key = CryptoJS.enc.Utf8.parse("1234123412ABCDEF");  //十六位十六进制数作为密钥
const iv = CryptoJS.enc.Utf8.parse('ABCDEF1234123412');   //十六位十六进制数作为密钥偏移量
/**
 * 解密
 * @param word
 * @returns {*}
 */

//解密方法
export function Decrypt(word) {
    let encryptedHexStr = CryptoJS.enc.Hex.parse(word);
    let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    let decrypt = CryptoJS.AES.decrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedStr.toString();
}

//加密方法
export function Encrypt(word) {
    let srcs = CryptoJS.enc.Utf8.parse(word);
    let encrypted = CryptoJS.AES.encrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.ciphertext.toString().toUpperCase();
}



//aes加密
export function aesEn(word, key) {
    let keys = CryptoJS.enc.Utf8.parse(key)
    var srcs = CryptoJS.enc.Utf8.parse(word)
    var encrypted = CryptoJS.AES.encrypt(srcs, keys, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    })
    return encrypted.toString()
}
//aes解密
export function aesDe(word, key) {
    let keys = CryptoJS.enc.Utf8.parse(key)
    var decrypt = CryptoJS.AES.decrypt(word, keys, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    })
    return CryptoJS.enc.Utf8.stringify(decrypt).toString()
}

/**
 * 手机号码
 * 参数
 * size：手机号码（必填）
 * 返回对象
 * tip:提示文字
 * status: true or false
 * 例：phone('13456434564')
 */

export function phone(size: number) {
    let rule = /^1[3456789]\d{9}$/;
    let res = {
        status: true,
        tip: '输入正确'
    }
    if (size == '') {
        res.status = false;
        res.tip = '手机号码不能为空！'
        return res;
    }
    if (size.length < 11) {
        res.status = false;
        res.tip = '手机号码格式错误！'
        return res;
    }
    if (!rule.test(size)) {
        res.status = false;
        res.tip = '手机号码格式错误！'
        return res;
    }
    return res;
}

/*
 *邮箱格式验证
 */
export function email(str: string) {
    let rule = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$"); //正则表达式
    let res = {
        status: true,
        tip: '输入正确'
    }
    if (str == '') { //输入不能为空
        res.status = false;
        res.tip = '邮箱输入不能为空！'
        return res;
    }
    if (!rule.test(str)) { //正则验证不通过，格式不对
        res.status = false;
        res.tip = '邮箱格式错误！'
        return res;
    }

    return res;
}

/**
 * 数字长度
 * 参数
 * size：验证的值（必填）
 * tip：提示的文字（必填）
 * min 默认最短6，（选填）
 * max默认30（选填）
 * 返回对象
 * tip:提示文字
 * status: true or false
 * 例：VauleLength('123456','验证码)
 */
export function VauleLength(size: number, tip: string, min = 6, max = 30) {
    let res = {
        status: true,
        tip: '输入正确'
    }
    if (size == '') {
        res.status = false;
        res.tip = tip;
        return res;
    }
    if (size.length < min || size.length > max) {
        res.status = false;
        res.tip = tip
        return res;
    }
    return res;
}
/**
 * 手机号码截取字符串并替换
 * 参数
 * str：需要修改的字符串（必填）
 * 返回
 * 格式：134****9090
 */
export function repleaceStr(str: string) {
    let str1 = str.substr(3, 4);
    str = str.replace(str1, '****');
    return str;
}
/**
 * 对比版本
 * 参数
 * str：目前版本（必填）
 * str1：最新版本（必填）
 * 返回
 * true or false
 *  例：versionContrast('1.1.1','1.1.2')
 */
export function versionContrast(str: string, str1: string) {
    // console.log(str+'.'+str1)
    let strArr = str.split('.');
    let strArr1 = str1.split('.');
    if (parseInt(strArr[0]) < parseInt(strArr1[0])) {
        return true;
    }
    if (parseInt(strArr[0]) > parseInt(strArr1[0])) {
        return false;
    }
    if (parseInt(strArr[1]) < parseInt(strArr1[1])) {
        return true;
    }
    if (parseInt(strArr[1]) > parseInt(strArr1[1])) {
        return false;
    }
    if (parseInt(strArr[2]) < parseInt(strArr1[2])) {
        return true;
    }
    if (parseInt(strArr[2]) >= parseInt(strArr1[2])) {
        return false;
    }
    return false;

}

/**
 * 截取字符串后n位
 * 参数
 * str：需要修改的字符串（必填）
 * len：截取的位数，默认4 （选填）
 * 返回
 * 截取的字符串
 * 例：getStrlast('12345678')；返回：5678
 * 例：getStrlast('12345678',5)；返回：45678
 */
export function getStrlast(str: string, len = 4) {
    if (str.length <= len) {
        return str;
    }
    let str1 = str.substr(str.length - len);
    return str1;
}

/**
 * 时间戳生成日期
 * 参数
 * timestamp：时间戳 （必填）
 * pattern：时间间隔 默认‘.’（选填）
 * 返回
 * 时间
 * 例：getStrlast('12345678')；返回：2017.09.09
 * 例：getStrlast('12345678','-')；返回：2017-09-09
 */
export function TransferData(timestamp, pattern = '.') {
    var timestamp = timestamp;
    var d = new Date(timestamp * 1000);    //根据时间戳生成的时间对象
    var yy = d.getFullYear();      //年
    var mm = d.getMonth() + 1;     //月
    var dd = d.getDate();          //日
    // var hh = d.getHours();         //时
    // var ii = d.getMinutes();       //分
    // var ss = d.getSeconds();       //秒
    // if(pattern == '-'){
    //     var clock = yy + "-";
    //     if(mm < 10) clock += "0";
    //     clock += mm + "-";
    // }else{
    var clock = yy + pattern;
    if (mm < 10) clock += "0";
    clock += mm + pattern;
    // }
    if (dd < 10) clock += "0";
    clock += dd + " ";
    // if(hh < 10) clock += "0";
    // clock += hh + ":";
    // if (ii < 10) clock += "0";
    // clock += ii + ":";
    // if (ss < 10) clock += "0";
    // clock += ss;

    return clock.toString();
}

/**
 * 时间戳生成日期
 * 参数
 * timestamp：时间戳 （必填）
 * pattern：时间间隔 默认‘.’（选填）
 * 返回
 * 时间
 * 例：getStrlast('12345678')；返回：2017.09.09
 * 例：getStrlast('12345678','-')；返回：2017-09-09
 */
export function TransferDataAll(timestamp, pattern = '-') {
    var timestamp = timestamp;
    var d = new Date(timestamp * 1000);    //根据时间戳生成的时间对象
    var yy = d.getFullYear();      //年
    var mm = d.getMonth() + 1;     //月
    var dd = d.getDate();          //日
    var hh = d.getHours();         //时
    var ii = d.getMinutes();       //分
    var ss = d.getSeconds();       //秒
    if (pattern == '-') {
        var clock = yy + "-";
        if (mm < 10) clock += "0";
        clock += mm + "-";
    } else {
        var clock = yy + pattern;
        if (mm < 10) clock += "0";
        clock += mm + pattern;
    }
    if (dd < 10) clock += "0";
    clock += dd + " ";
    if (hh < 10) clock += "0";
    clock += hh + ":";
    if (ii < 10) clock += "0";
    clock += ii + ":";
    if (ss < 10) clock += "0";
    clock += ss;

    return clock.toString();
}

/**
 * 时间戳生成时分秒
 * 参数
 * s：时间戳 （必填）
 * p: 分隔符 （选填） 默认：04:09:34 p="ch" 为中文 07时09分09秒
 * 返回
 * 时间
 * 例：
 */
export function TransferTime(s, p = ":", iss = true) {

    let t = '';
    if (s > -1) {
        var hour = Math.floor(s / 3600);
        var min = Math.floor(s / 60) % 60;
        var sec = s % 60;
        if (iss) {
            if (hour < 10) {
                t = '0' + hour;
            } else {
                t = hour;
            }
            if (p == 'ch') {
                t += "时"
            } else {
                t += p
            }
        }
        if (min < 10) { t += "0"; }
        t += min;
        if (p == 'ch') {
            t += "分"
        } else {
            t += p
        }

        if (sec < 10) { t += "0"; }
        t += sec;
        if (p == 'ch') {
            t += "秒"
        } else {
            // t += p
        }
    }
    return t;
}

/**
 * 金额千分位生成
 * 参数
 * str：金额带小数（必填）
 * 返回格式：
 * 1,890.00
 *
 */
export function sliceStr(str: string) {
    let arr = str.split(".");
    let l = arr[0].split("").reverse();
    t = "";
    for (i = 0; i < l.length; i++) {
        t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
    }
    arr[0] = t.split("").reverse().join("");
    return arr;
}

/**
 * 金额截取小数点
 * 参数
 * str：金额带小数（必填）
 * 返回格式：
 * 数组
 * 例：sliceStrPrice('1,890.00')；返回：['1,890','00']
 */
export function sliceStrPrice(str: string) {
    let arr = str.split(".");
    return arr;
}

/**
 * 判断字符串中是否有某个字符
 * 参数
 * str：原始字符串（必填）
 * res：判断的字符（必填）
 * 返回
 * true or false
 */
export function hasSomeStr(str: string, res: string) {
    if (str.indexOf(res) >= 0) {
        return true;
    }
    return false;
}

/**
 * 去掉字符串某个字符
 * 参数
 * str：原始字符串（必填）
 * res：需要去掉的字符串（必填）
 * 返回
 * 去掉res后的str
 * 例：delLastStr('10天','天')；返回：'10'
 */
export function delLastStr(str: string, res: string) {
    let str1 = str.replace(res, '');
    return str1;
}

/**
 * 数组删除指定位置元素
 * 参数
 * array：目标数组（必填）
 * index：删除位置（必填）
 * 返回格式：
 * 参数对象
 * 例
 *
 */
export function removeArr(array, index) {
    if (index <= (array.length - 1)) {
        for (var i = index; i < array.length; i++) {
            array[i] = array[i + 1];
        }
    }
    else {
        throw new Error('超出最大索引！');
    }
    array.length = array.length - 1;
    return array;
}

/**
 * 获取URL中的参数
 * 参数
 * url：解码url（必填）
 * 返回格式：
 * 参数对象
 * 例
 * GetUrlPara('a.html?code=123&h=345') 返回 {code:'123',h:'345'}
 */
export function GetUrlPara(url: string) {
    let arrUrl = url.split("?");
    let para = arrUrl[1];
    let paraArr = para.split("&");
    let obj = {};
    for (let i = 0; i < paraArr.length; i++) {
        let p = paraArr[i].split("=");
        obj[p[0]] = p[1];
    }
    return obj;
}

/**
 * 获取角色列表中的角色
 * 参数
 * id：角色id（必填）
 * 返回格式：
 * 角色名
 */
export function GetUserName(id: string) {
    let s = '';
    for (let i = 0; i < global.user.identityData.length; i++) {
        if (id == global.user.identityData[i].id) {
            s = global.user.identityData[i].name
        }
    }
    return s;
}
/**
 * 获取某个字符在字符串中出现的次数
 *参数：
 *str：字符串（必填）
 *substr：查找的字符（必填）
 *isIgnore:是否忽略大小写 默认忽略
 *返回 次数
 */
export function countSubstr(str, substr, isIgnore = true) {
    var count;
    var reg = "";
    if (isIgnore == true) {
        reg = "/" + substr + "/gi";
    } else {
        reg = "/" + substr + "/g";
    }
    reg = eval(reg);
    if (str.match(reg) == null) {
        count = 0;
    } else {
        count = str.match(reg).length;
    }
    return count;
}

export function getFormatDate(date) {
    var seperator1 = "-";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    var hour = date.getHours();
    var min = date.getMinutes();
    var second = date.getSeconds();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate;
    return currentdate;
}

export function getFormatDate2(date) {
    var seperator1 = "-";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    var hour = date.getHours();
    var min = date.getMinutes();
    var second = date.getSeconds();
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate;
    return currentdate;
}

// 获取当前时间 格式yyyy-MM-dd HH:MM:SS
export function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    var hour = date.getHours();
    var min = date.getMinutes();
    var second = date.getSeconds();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    if (hour >= 0 && hour <= 9) {
        hour = "0" + hour;
    }
    if (min >= 0 && min <= 9) {
        min = "0" + min;
    }
    if (second >= 0 && second <= 9) {
        second = "0" + second;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
        + " " + hour + seperator2 + min
        + seperator2 + second;
    return currentdate;
}

// 通过时间返回 20170908
export function returnTime(date) {

    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + '' + month + '' + strDate;
    return currentdate;
}

// 获取当前时间 返回 2017-09-08
export function getTimedate(params = '-') {
    var date = new Date();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + params + month + params + strDate;
    return currentdate;
}


/**
 * 上传图片专用
 *参数：
 *imgs：图片数组（必填）
 *split：中间分隔符 默认：@@
 *返回
 *base64 拼接字符串
 */
export function splitImgs(imgs, split = '@@', islong = false) {
    var str = '';
    if (imgs.length < 1) {
        return str;
    }

    // if(imgs.length = 1){
    //     if(imgs.data){
    //         str = 'data:'+imgs[0].mime+';base64,' + imgs[0].data;
    //     }
    // }else{
    for (let i = 0; i < imgs.length; i++) {
        if (imgs[i].data) {
            if (i == imgs.length - 1) {
                // if(islong){
                //     str += 'data:'+imgs[i].mime+';base64,' + imgs[i].data
                // }else{
                str += imgs[i].data
                // }
                //

            } else {
                // if(islong){
                //     str += 'data:'+imgs[i].mime+';base64,' + imgs[i].data + split
                // }else{
                str += imgs[i].data + split
                // }
                // str += 'data:'+imgs[i].mime+';base64,' + imgs[i].data + split
                // str += imgs[i].data + split
            }
        }

    }
    // }
    // console.log(str);
    return str;
}

/**
 * 切割字符串维数组
 *参数：
 *str：字符串（必填）
 *split：中间分隔符 默认：@@
 *返回
 *数组
 */
export function strToArray(str, substr = '@@') {
    let arr = [];
    if (str == '') { return arr };
    if (str.indexOf(substr) < 1) {
        arr.push(str);
        return arr;
    }
    arr = str.split(substr);
    return arr;
}
/**
 * 身份证认证
 *参数：
 *card：字身份证号码（必填）
 *返回
 *true or false
 */
export function isCardNo(card) {
    // 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
    var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if (reg.test(card) === false) {
        // alert("身份证输入不合法");
        return false;
    }
    return true;
}

/**
 * 数组拼接成字符串
 *参数：
 *arr：数组（必填）
 *parmas：要拼接的字段（必填）
 *split:分隔的字符，（选填）默认:','
 *返回
 *true or false
 */
export function arrToStr(arr, parmas, split = ",") {
    if (arr.length < 1) {
        return '';
    }
    let s = '';
    for (let i = 0; i < arr.length; i++) {
        s += arr[i][parmas];
        if (i != arr.length - 1) {
            s += split;
        }
    }
    return s;
}


/**
 * 当前年月日时分秒数组
 *返回
 *数组 [2017,10,9,10,00,00]
 */
export function _getDataArr() {
    var date = new Date();
    let y = date.getFullYear();
    var month = parseInt(date.getMonth() + 1);
    var strDate = parseInt(date.getDate());
    var hour = parseInt(date.getHours());
    var min = parseInt(date.getMinutes());
    var second = parseInt(date.getSeconds());
    let arr = [y, month, strDate, hour, min, second];
    return arr;
}

/**
 * 字符串生成年月日字符串
 * str 分解的字符串
 *返回
 *2017/10/25
 */
export function getDataStr(str) {
    let s = '';
    let d = str.split('-');
    s += d[0] + '/' + d[1] + '/' + d[2].substr(0, 2);
    return s;
}

/**
 * 经纬度字符串集合转成数组
 * str 经纬度字符串 必填
 *返回
 *[{longitude:123,latitude:123}]
 */
export function mappoint(str) {
    let arr = [];
    let data1 = [];
    let d = str.split(',');
    let data2 = [];
    for (let i = 0; i < d.length; i++) {
        if (i % 2 == 0) {
            data1.push(d[i])
        } else {
            data2.push(d[i])
        }
    }
    for (let i = 0; i < data1.length; i++) {
        arr.push({ longitude: parseFloat(data1[i]), latitude: parseFloat(data2[i]) });
    }
    return arr;
}

/**
 * 字节转换 b=>m
 * bytes 字节 必填 1234
 *返回
 *1.2MB
 */
export function bytesToSize(bytes) {
    if (bytes === 0) return '0 B';

    var k = 1024;

    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    i = Math.floor(Math.log(bytes) / Math.log(k));

    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
    //toPrecision(3) 后面保留一位小数，如1.0GB                                                                                                                  //return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}
/**
 * 日期年月日分秒对比
 * y,m,d,s,f,n y,m,d,s,f选中的年月日时分 n现在的时间数组【2017，11，3，10，10】（必填）
 *返回
 *如果时间小于现在的时间 返回 false，反之true
 */
export function dateContrast(y, m, d, s, f, n) {
    if (y < n[0]) {
        return false;
    }
    if (y > n[0]) { return true }
    if (m < n[1]) {
        return false;
    }
    if (m > n[1]) { return true }
    if (d < n[2]) {
        return false;
    }
    if (d > n[2]) { return true }
    if (s < n[3]) {
        return false;
    }
    if (s > n[3]) { return true }
    if (f <= n[4]) {
        return false;
    }
    if (f > n[4]) { return true }
}
/**
 * gps 转高德系坐标
 * GPSChange.gcj_encrypt(纬度,经度)；参数为数字类型
 *返回
 *{lon:'',lat:''}
 */
export const GPSChange = {
    PI: 3.14159265358979324,
    x_pi: 3.14159265358979324 * 3000.0 / 180.0,
    delta: function (lat, lon) {
        // Krasovsky 1940
        //
        // a = 6378245.0, 1/f = 298.3
        // b = a * (1 - f)
        // ee = (a^2 - b^2) / a^2;
        var a = 6378245.0; //  a: 卫星椭球坐标投影到平面地图坐标系的投影因子。
        var ee = 0.00669342162296594323; //  ee: 椭球的偏心率。
        var dLat = this.transformLat(lon - 105.0, lat - 35.0);
        var dLon = this.transformLon(lon - 105.0, lat - 35.0);
        var radLat = lat / 180.0 * this.PI;
        var magic = Math.sin(radLat);
        magic = 1 - ee * magic * magic;
        var sqrtMagic = Math.sqrt(magic);
        dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * this.PI);
        dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * this.PI);
        return { 'lat': dLat, 'lon': dLon };
    },
    //GCJ-02 to WGS-84 exactly
    gcj_decrypt_exact: function (gcjLat, gcjLon) {
        var initDelta = 0.01;
        var threshold = 0.000000001;
        var dLat = initDelta, dLon = initDelta;
        var mLat = gcjLat - dLat, mLon = gcjLon - dLon;
        var pLat = gcjLat + dLat, pLon = gcjLon + dLon;
        var wgsLat, wgsLon, i = 0;
        while (1) {
            wgsLat = (mLat + pLat) / 2;
            wgsLon = (mLon + pLon) / 2;
            var tmp = this.gcj_encrypt(wgsLat, wgsLon)
            dLat = tmp.lat - gcjLat;
            dLon = tmp.lon - gcjLon;
            if ((Math.abs(dLat) < threshold) && (Math.abs(dLon) < threshold))
                break;

            if (dLat > 0) pLat = wgsLat; else mLat = wgsLat;
            if (dLon > 0) pLon = wgsLon; else mLon = wgsLon;

            if (++i > 10000) break;
        }
        //console.log(i);
        return { 'lat': wgsLat, 'lon': wgsLon };
    },
    //GPS---高德  WGS-84 to GCJ-02
    gcj_encrypt: function (wgsLat, wgsLon) {
        if (this.outOfChina(wgsLat, wgsLon))
            return { 'lat': wgsLat, 'lon': wgsLon };

        var d = this.delta(wgsLat, wgsLon);
        return { 'lat': wgsLat + d.lat, 'lon': wgsLon + d.lon };
    },
    outOfChina: function (lat, lon) {
        if (lon < 72.004 || lon > 137.8347)
            return true;
        if (lat < 0.8293 || lat > 55.8271)
            return true;
        return false;
    },
    transformLat: function (x, y) {
        var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x * this.PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(y * this.PI) + 40.0 * Math.sin(y / 3.0 * this.PI)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(y / 12.0 * this.PI) + 320 * Math.sin(y * this.PI / 30.0)) * 2.0 / 3.0;
        return ret;
    },
    transformLon: function (x, y) {
        var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x * this.PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(x * this.PI) + 40.0 * Math.sin(x / 3.0 * this.PI)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(x / 12.0 * this.PI) + 300.0 * Math.sin(x / 30.0 * this.PI)) * 2.0 / 3.0;
        return ret;
    }
};

/**
 * 判断经纬度是否在区域内
 * ALon：经度
 * ALat：纬度
 * APoints：区域坐标系
 *返回
 *true or false
 */

export function IsPtInPoly(ALon, ALat, APoints) {
    var iSum = 0,
        iCount;
    var dLon1, dLon2, dLat1, dLat2, dLon;
    if (APoints.length < 3) return false;
    iCount = APoints.length;
    for (var i = 0; i < iCount; i++) {
        if (i == iCount - 1) {
            dLon1 = APoints[i].longitude;
            dLat1 = APoints[i].latitude;
            dLon2 = APoints[0].longitude;
            dLat2 = APoints[0].latitude;
        } else {
            dLon1 = APoints[i].longitude;
            dLat1 = APoints[i].latitude;
            dLon2 = APoints[i + 1].longitude;
            dLat2 = APoints[i + 1].latitude;
        }
        //以下语句判断A点是否在边的两端点的水平平行线之间，在则可能有交点，开始判断交点是否在左射线上
        if (((ALat >= dLat1) && (ALat < dLat2)) || ((ALat >= dLat2) && (ALat < dLat1))) {
            if (Math.abs(dLat1 - dLat2) > 0) {
                //得到 A点向左射线与边的交点的x坐标：
                dLon = dLon1 - ((dLon1 - dLon2) * (dLat1 - ALat)) / (dLat1 - dLat2);
                if (dLon < ALon)
                    iSum++;
            }
        }
    }
    if (iSum % 2 != 0)
        return true;
    return false;
}

/**
 * 将时间字符串转为时间戳
 * str：时间字符串
 *返回
 *时间戳
 */

export function strTostamp(str) {
    return Date.parse(new Date(str.replace(new RegExp(/-/gm), "/"))) / 1000;
}

/**
 * 计算经纬度之间的距离
 * str：时间字符串
 *返回
 *时间戳
 */
// function toRad(d) {  return d * Math.PI / 180; }
export function getDisance(lat1, lng1, lat2, lng2) { //lat为纬度, lng为经度, 一定不要弄错
    var dis = 0;
    var radLat1 = lat1 * Math.PI / 180;
    var radLat2 = lat2 * Math.PI / 180;
    var deltaLat = radLat1 - radLat2;
    var deltaLng = lng1 * Math.PI / 180 - lng2 * Math.PI / 180;
    var dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)));
    return dis * 6378137;
}

/**
 * 将字符串中 _ 替换为'-'
 * str：字符串
 *返回
 *字符串
 */
export function changestring(str) {
    if (str.indexOf('_') > 0) {
        return str.replace(/_/g, '-');
    } else {
        return str;
    }
}

/**
 * 判断字符串是否在数组里
 * str：字符串 arr:数组 params：匹配得字段
 *返回
 *true false
 */
export function strInArr(str, arr, params) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][params] == str) {
            return true;
        }
    }
    return false;
}

/**
 * 房屋编码切割
 * 参数
 * val：扫码房屋信息
 * 返回
 * 数组 【地址，编码，电话，网址】
 * 数组 【楼栋编码，房屋编码】
 */
export function roomsplit(val: string) {
    let arr = [];
    if (val.indexOf('4403') < 0) {
        return arr;
    }
    arr.push(val.substring(val.indexOf('4403'), val.indexOf('4403') + 19));
    arr.push(val.substring(val.indexOf('4403'), val.indexOf('4403') + 25));
    // if(val.indexOf('房屋编码') < 1 && val.indexOf('联系电话') < 1 && val.indexOf('网上办事') < 1){
    //     return arr;
    // }
    // arr.push(val.substring(5,val.indexOf('房屋编码')));
    // arr.push(val.substring(val.indexOf('房屋编码')+5,val.indexOf('联系电话')));
    // arr.push(val.substring(val.indexOf('联系电话')+5,val.indexOf('网上办事')));
    // arr.push(val.substring(val.indexOf('网上办事')+5));
    return arr;
}


/**
 * 切割字符串为数组
 * @param {*} str 字符串
 * @param {*} parmas 中间切割字符
 */
export function newImgSplit(str: string, parmas = ",") {
    let arr = [];
    if (str == null || str == '') {
        return arr;
    }
    if (str.indexOf(parmas) < 0) {
        arr.push(str);
        return arr;
    }
    arr = str.split(parmas);
    console.log(arr);
    return arr;
}

/**
 * 将对象里面的大写字母转换成小写
 * @param {*} obj 需要转换的对象
 */
export function keyToLow(obj) {
    let o = {};
    Object.keys(obj).forEach(function (key) {
        o[key.toLowerCase()] = obj[key];
    });

    return o;
}
/**
 * 将对象中的数值转换成字符串
 * @param {*} obj
 */
export function intToString(obj) {
    for (let key in obj) {
        obj[key] = obj[key].toString();
    }
    return obj;
}

export function getUUID() {
    var d = new Date().getTime();
    if (window.performance && typeof window.performance.now === "function") {
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    // console.log('uuid: '+uuid);
    return uuid;
}