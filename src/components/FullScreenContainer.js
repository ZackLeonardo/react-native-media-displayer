import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  DeviceEventEmitter,
  Dimensions,
  FlatList,
  View,
  ViewPagerAndroid,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';

import CONSTANTS from '../utils/constants';
import { BottomToolBar } from '@zdy/react-native-toolbar';
import { Photo, Video } from '@zdy/react-native-media';

const TOOLBAR_HEIGHT = CONSTANTS.TOOLBAR_HEIGHT;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default class FullScreenContainer extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      currentIndex: props.initialIndex,
      currentMedia: props.mediaList[props.initialIndex],
      controlsDisplayed: props.displayTopBar,
    };

    this.mediaRefs = [];

    this._renderItem = this._renderItem.bind(this);
    this._toggleControls = this._toggleControls.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._onPageSelected = this._onPageSelected.bind(this);
    this._onNextButtonTapped = this._onNextButtonTapped.bind(this);
    this._onPreviousButtonTapped = this._onPreviousButtonTapped.bind(this);
    this._onActionButtonTapped = this._onActionButtonTapped.bind(this);
    this.getItemLayout = this.getItemLayout.bind(this);
  }

  componentDidMount() {
    DeviceEventEmitter.addListener('didUpdateDimensions', () => {
      this.mediaRefs.map(p => p && p.forceUpdate());
      this.openPage(this.state.currentIndex, false);
    });

    this.openPage(this.state.currentIndex, false);
  }

  getItemLayout(data, index) {
  //  let listItemRef = eval('this.listItemRef' + index);
  //  let ITEM_HEIGHT = listItemRef.measure((ox, oy, width, height, px, py) => { height});
  //  let ITEM_OFFSET = listItemRef.measure((ox, oy, width, height, px, py) => { oy});
    const screenWidth = Dimensions.get('window').width;
    return {length: screenWidth, offset: screenWidth * index, index};
  }

  openPage(index, animated) {
    if (!this.flatListRef) {
      return;
    }

    this.flatListRef.scrollToIndex({animated: false, index: index});

    this._updatePageIndex(index);
  }

  scrollToIndex(options) {
    this.flatListRef.scrollToOffset(options);
  }

  _updatePageIndex(index) {
    this.setState({
      currentIndex: index,
      currentMedia: this.props.mediaList[index],
    }, () => {
      this._triggerPhotoLoad(index);

      const newTitle = `${index + 1} of ${this.props.dataSource.length}`;
      this.props.updateTitle(newTitle);
    });
  }

  _triggerPhotoLoad(index) {
    const photo = this.mediaRefs[index];
    if (photo) {
      photo.load();
    } else {
      // HACK: photo might be undefined when user taps a photo from gridview
      // that hasn't been rendered yet.
      // photo is rendered after listView's scrollTo method call
      // and i'm deferring photo load method for that.
      setTimeout(this._triggerPhotoLoad.bind(this, index), 200);
    }
  }

  _toggleControls() {
    const { alwaysShowControls, toggleTopBar } = this.props;

    if (!alwaysShowControls) {
      const controlsDisplayed = !this.state.controlsDisplayed;
      this.setState({
        controlsDisplayed,
      });
      toggleTopBar(controlsDisplayed);
    }
  }

  _onNextButtonTapped() {
    let nextIndex = this.state.currentIndex + 1;
    // go back to the first item when there is no more next item
    if (nextIndex > this.props.dataSource.length - 1) {
      nextIndex = 0;
    }
    this.openPage(nextIndex, false);
  }

  _onPreviousButtonTapped() {
    let prevIndex = this.state.currentIndex - 1;
    // go to the last item when there is no more previous item
    if (prevIndex < 0) {
      prevIndex = this.props.dataSource.length - 1;
    }
    this.openPage(prevIndex, false);
  }

  _onActionButtonTapped() {
    const onActionButton = this.props.onActionButton;

    // action behaviour must be implemented by the client
    // so, call the client method or simply ignore this event
    if (onActionButton) {
      const { currentMedia, currentIndex } = this.state;
      onActionButton(currentMedia, currentIndex);
    }
  }

  _onScroll(e) {
    const event = e.nativeEvent;
    const layoutWidth = event.layoutMeasurement.width || Dimensions.get('window').width;
    const newIndex = Math.floor((event.contentOffset.x + 0.5 * layoutWidth) / layoutWidth);

    this._onPageSelected(newIndex);
  }

  _onPageSelected(page) {
    const { currentIndex } = this.state;
    let newIndex = page;
    console.log('newIndex0:' + newIndex);
    // handle ViewPagerAndroid argument
    if (typeof newIndex === 'object') {
      newIndex = newIndex.nativeEvent.position;
      console.log('newIndex1:' + newIndex);
    }

    if (currentIndex !== newIndex) {
      this._updatePageIndex(newIndex);

      if (this.state.controlsDisplayed && !this.props.displayTopBar) {
        this._toggleControls();
      }
      this.flatListRef.scrollToIndex({animated: true, index: newIndex});
    }else{

    }
  }
// media: Object, sectionID: number, rowID: number
  _renderItem(item, index) {
    const {
      displaySelectionButtons,
      onMediaSelection,
      useCircleProgress,
    } = this.props;

    return (
      <View style={styles.flex}>
        <TouchableWithoutFeedback
          onPress={this._toggleControls}
          onLongPress={this.props.onPhotoLongPress}
          delayLongPress={this.props.delayLongPress}>
          { item.photo
            ?
            <Photo
              ref={ref => this.mediaRefs[index] = ref}
              useCircleProgress={useCircleProgress}
              uri={item.photo}
              displaySelectionButtons={displaySelectionButtons}
              selected={item.selected}
              onSelection={(isSelected) => {
                onMediaSelection(index, isSelected);
              }}
              />
            :
            <Video
              ref={ref => this.mediaRefs[index] = ref}
              useCircleProgress={useCircleProgress}
              uri={item.video}
              displaySelectionButtons={displaySelectionButtons}
              selected={item.selected}
              onSelection={(isSelected) => {
                onMediaSelection(index, isSelected);
              }}
            />
          }

        </TouchableWithoutFeedback>
      </View>
    );
  }

  _renderScrollableContent() {
    const { dataSource, mediaList } = this.props;

    if (Platform.OS === 'android') {
      return (
        <ViewPagerAndroid
          style={styles.flex}
          ref={flatList => this.flatListRef = flatList}
          onPageSelected={this._onPageSelected}
        >
          {mediaList.map((child, idx) => this._renderItem(child, 0, idx))}
        </ViewPagerAndroid>
      );
    }

    return (
      <FlatList
        ref={(ref) => { this.flatListRef = ref; }}
        data={dataSource}
        renderItem = {({item, index}) => this._renderItem(item, index)}
        keyExtractor={item => item.caption}
        initialNumToRender = {20}
        getItemLayout={this.getItemLayout}
        onScroll={this._onScroll}
        horizontal={true}
        onEndReached={false}
        scrollEventThrottle={16}
      />
    );
  }

  render() {
    const {
      displayNavArrows,
      alwaysDisplayStatusBar,
      displayActionButton,
      onGridButtonTap,
      enableGrid,
    } = this.props;
    const { controlsDisplayed, currentMedia } = this.state;
    const BottomBarComponent = this.props.bottomBarComponent || BottomToolBar;

    return (
      <View style={styles.flex}>
        <StatusBar
          hidden={alwaysDisplayStatusBar ? false : !controlsDisplayed}
          showHideTransition={'slide'}
          barStyle={'light-content'}
          animated
          translucent
        />
        {this._renderScrollableContent()}
        <BottomBarComponent
          displayed={controlsDisplayed}
          height={TOOLBAR_HEIGHT}
          displayNavArrows={displayNavArrows}
          displayGridButton={enableGrid}
          displayActionButton={displayActionButton}
          caption={currentMedia.caption}
          media={currentMedia}
          onPrev={this._onPreviousButtonTapped}
          onNext={this._onNextButtonTapped}
          onGrid={onGridButtonTap}
          onAction={this._onActionButtonTapped}
        />
      </View>
    );
  }
}

FullScreenContainer.defaultProps = {
  initialIndex: 0,
  displayTopBar: true,
  displayNavArrows: false,
  alwaysDisplayStatusBar: false,
  displaySelectionButtons: false,
  enableGrid: false,//true,
  onGridButtonTap: () => {},
  onPhotoLongPress: () => {},
  delayLongPress: 1000,
};

FullScreenContainer.propTypes = {
  style: View.propTypes.style,
  dataSource: PropTypes.array.isRequired,
  mediaList: PropTypes.array.isRequired,
  onGridButtonTap: PropTypes.func,    //opens grid view
  displayTopBar: PropTypes.bool,    //Display top bar
  updateTitle: PropTypes.func,    //updates top bar title
  toggleTopBar: PropTypes.func,   //displays/hides top bar
  onMediaSelection: PropTypes.func,   //refresh the list to apply selection change
  initialIndex: PropTypes.number,   //those props are inherited from main PhotoBrowser component i.e. index.js
  alwaysShowControls: PropTypes.bool,
  displayActionButton: PropTypes.bool,
  displayNavArrows: PropTypes.bool,
  alwaysDisplayStatusBar: PropTypes.bool,
  displaySelectionButtons: PropTypes.bool,
  enableGrid: PropTypes.bool,
  useCircleProgress: PropTypes.bool,
  onActionButton: PropTypes.func,
  onPhotoLongPress: PropTypes.func,
  delayLongPress: PropTypes.number
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
