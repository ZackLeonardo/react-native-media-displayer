import React, { Component } from 'react';
import {
  ActionSheetIOS,
  CameraRoll,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Button,
} from 'react-native';

import { MediaBrowser } from '@zdy/react-native-media-displayer';
import mmm from './media/movie.mp4';

const mediaList = [
  {
    photo: 'https://img3.doubanio.com/img/fmadmin/large/32880.jpg',
      selected: true,
      caption: 'yoyo',
    }, {
      photo: 'https://img3.doubanio.com/img/fmadmin/large/49511.jpg',
      caption: 'hahaha',
    }, {
      video: 'https://raw.githubusercontent.com/react-native-community/react-native-video/master/example/broadchurch.mp4',
      thumb: require('./media/broadchurch_thumbnail.png'),
      selected: false,
      caption: 'gaga',
    },{
    photo: 'https://img1.doubanio.com/img/fmadmin/large/1564259.jpg',
      selected: true,
      caption: 'lala',
    }, {
      video: '../../../../../src/containers/media/movie.mp4', //begin from html path
      thumb: 'https://img3.doubanio.com/img/fmadmin/large/1619383.jpg',
      selected: false,
      caption: 'gagaa',
    } ];

export default class Test extends Component {
  render () {
    return (
      <MediaBrowser
        mediaList={mediaList}
        startOnGrid={false}
        initialIndex={0}
        displayNavArrows={true}
        displaySelectionButtons={true}
        displayActionButton={true}
        alwaysDisplayStatusBar={true}
        displayTopBar={true}
        onBack={() => {console.log('onBack click');}}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
    paddingTop: 54,
    paddingLeft: 16,
  },
  row: {
    flex: 1,
    padding: 8,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    borderBottomWidth: 1,
  },
  rowTitle: {
    fontSize: 14,
  },
  rowDescription: {
    fontSize: 12,
  },
});
