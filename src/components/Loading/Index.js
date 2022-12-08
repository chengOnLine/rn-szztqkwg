import React, { Component, } from 'react';
import {
    View,
    StyleSheet,
    Text
} from 'react-native';
import RootSiblings from 'react-native-root-siblings';
import LoadContainer from './LoadContainer';

let loadingList = [];

class Load extends Component {
    static displayName = 'Load';
    _load = null;

    static show = () => {
        let loading = null;

        loading = new RootSiblings(<LoadContainer />);
        loadingList.push(loading);

        return loading;
    };

    static hideAll = () => {

        loadingList.forEach((item, index) => {
            if (item instanceof RootSiblings) {
                let lastSibling = loadingList.pop();
                lastSibling && lastSibling.destroy();

                // item.destroy();
                // loadingList.splice(0, index);
            }
        })
    };

    componentDidMount = () => {
        // this._load = new RootSiblings(<LoadContainer />);
    };


    // componentWillReceiveProps = nextProps => {
    //     this._load.update(<LoadContainer />);
    // };

    componentWillUnmount = () => {
        // this._load.destroy();
    };


    render() {
        return null;
    }
}
const styles = StyleSheet.create({
    center: {
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: '#000',
        zIndex: 20,
    },
});
export {
    RootSiblings as Manager
};
export default Load;