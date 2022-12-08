
// 获取社区ID集合
export function getcommit() {
    let arr = '';
    for (let i = 0; i < global.user.userInfo.personCommintities.length; i++) {
        arr = arr + global.user.userInfo.personCommintities[i].communityId + ',';
    }
    return arr;
}

//获取区域坐标集合
export function getArea() {
    let _this = this;
    NetUitl.get(global.REQUEST_URL + '/gm/caculatePoint/getStreetBorder', '', function (res) {
        // console.log(res);
        if (res.length < 1) {
            return false;
        }
        global.streetarea = res;
    })
}

// 获取社区
export function _getStreet() {
    let _this = this;

    NetUitl.get(global.REQUEST_URL + '/app/commonFile/download/getCommunity', {}, function (res) {
        console.log(res);
        if (res.code != '0') {
            toastShort('网络错误，请重试！', 'bottom');
            return false;
        }
        global.user.street = res.data.childrenList;
        // _this.setState({
        //     streetList:res.data.childrenList
        // })
    })
}


function isLeapYear(year) {
    let cond1 = year % 4 == 0;  //条件1：年份必须要能被4整除
    let cond2 = year % 100 != 0;  //条件2：年份不能是整百数
    let cond3 = year % 400 == 0;  //条件3：年份是400的倍数
    //当条件1和条件2同时成立时，就肯定是闰年，所以条件1和条件2之间为“与”的关系。
    //如果条件1和条件2不能同时成立，但如果条件3能成立，则仍然是闰年。所以条件3与前2项为“或”的关系。
    //所以得出判断闰年的表达式：
    let cond = cond1 && cond2 || cond3;
    if (cond) {
        return true;
    } else {
        return false;
    }
}

export function getDateData() {
    let d = new Date();
    let year = d.getFullYear();
    let dataArray = [];
    for (let i = year - 1; i < year + 1; i++) {
        let num = 0;
        for (let j = 1; j <= 12; j++) {
            let threeArray = [];
            if (j == 1 || j == 3 || j == 5 || j == 7 || j == 8 || j == 10 || j == 12) {
                num = 31;
            } else if (j == 4 || j == 6 || j == 9 || j == 11) {
                num = 30;
            } else {
                num = isLeapYear(i) ? 29 : 28;
            }
            for (let k = 1; k <= num; k++) {
                threeArray.push(k);
                dataArray.push(year + '-' + j + '-' + k);
            }
        }
    }

    return dataArray;
}