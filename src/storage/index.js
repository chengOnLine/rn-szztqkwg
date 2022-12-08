import AsyncStorage from '@react-native-async-storage/async-storage';

export async function storageGet(key) {
    if (!key) {
        return null;
    }
    key = key.toString();
    return await AsyncStorage.getItem(key)
        .then((value) => {
            if (value) {
                return JSON.parse(value);
            }
            return null;
        })
        .catch(() => {
            return null;
        });
}

export async function storageSet(key, value) {
    if (!key) {
        return;
    }
    key = key.toString();
    await AsyncStorage.setItem(
        key,
        JSON.stringify({
            value,
        }),
    );
}
/**
 * 删除key对应json数值
 * @param key
 * @returns {Promise<string>}
 */
export async function storageDeleteItem(key) {
    if (!key) {
        return;
    }
    return await AsyncStorage.removeItem(key);
}

/**
 * 删除所有配置数据
 * @returns {Promise<string>}
 */
export async function storageClear() {
    return await AsyncStorage.clear();
}