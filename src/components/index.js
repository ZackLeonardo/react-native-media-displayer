import React from 'react';
import PropTypes from 'prop-types';
import {
  Animated,
  Dimensions,
  View,
  StyleSheet,
} from 'react-native';

import CONSTANTS from '../utils/constants';
import { TopToolBar } from '@zdy/react-native-toolbar';
import GridContainer from './GridContainer';
import FullScreenContainer from './FullScreenContainer';

import { isJson, json2Array } from '../utils/utils';

const TOOLBAR_HEIGHT = CONSTANTS.TOOLBAR_HEIGHT;

export default class MediaBrowser extends React.Component {

  constructor(props, context) {
    super(props, context);

    this._onGridPhotoTap = this._onGridPhotoTap.bind(this);
    this._onGridButtonTap = this._onGridButtonTap.bind(this);
    this._onMediaSelection = this._onMediaSelection.bind(this);
    this._updateTitle = this._updateTitle.bind(this);
    this._toggleTopBar = this._toggleTopBar.bind(this);

    const { mediaList, startOnGrid, initialIndex } = props;

    this.state = {
      dataSource: this._createDataSource(mediaList),
      mediaList,
      isFullScreen: !startOnGrid,
      fullScreenAnim: new Animated.Value(startOnGrid ? 0 : 1),
      currentIndex: initialIndex,
      displayTopBar: props.displayTopBar,
    };
  }

  componentWillReceiveProps(nextProps) {
    const mediaList = nextProps.mediaList;
    this.setState({
      dataSource: this._createDataSource(mediaList),
      mediaList,
    });
  }

  _createDataSource(list) {
    return isJson(list) ? json2Array(list) : list;
  }

  _onGridPhotoTap(index) {
    this.refs.fullScreenContainer.openPage(index, false);
    this._toggleFullScreen(true);
  }

  _onGridButtonTap() {
    this._toggleFullScreen(false);
  }

  _onMediaSelection(index, isSelected) {
    const {
      mediaList: oldMediaList,
      dataSource,
    } = this.state;
    const newMediaList = oldMediaList.slice();
    const selectedMedia = {
      ...oldMediaList[index],
      selected: isSelected,
    };
    newMediaList[index] = selectedMedia;

    this.setState({
      dataSource: newMediaList,
      mediaList: newMediaList,
    });
    this.props.onSelectionChanged(selectedMedia, index, isSelected);
  }

  _updateTitle(title) {
    this.setState({ title });
  }

  _toggleTopBar(displayed: boolean) {
    if (this.props.displayTopBar) {
      this.setState({
        displayTopBar: displayed,
      });
    }
  }

  _toggleFullScreen(display: boolean) {
    this.setState({
      isFullScreen: display,
    });
    Animated.timing(
      this.state.fullScreenAnim,
      {
        toValue: display ? 1 : 0,
        duration: 300,
      }
    ).start();
  }

  render() {
    const {
      alwaysShowControls,
      displayNavArrows,
      alwaysDisplayStatusBar,
      displaySelectionButtons,
      displayActionButton,
      enableGrid,
      useCircleProgress,
      onActionButton,
      onBack,
      itemPerRow,
      style,
      square,
      gridOffset,
    } = this.props;
    const {
      dataSource,
      mediaList,
      isFullScreen,
      fullScreenAnim,
      currentIndex,
      title,
      displayTopBar,
    } = this.state;
    const screenHeight = Dimensions.get('window').height;

    let gridContainer;
    let fullScreenContainer;
    if (mediaList.length > 0) {
      if (enableGrid) {
        gridContainer = (
          <Animated.View
            style={{
              height: screenHeight,
              marginTop: fullScreenAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, screenHeight * -1 - TOOLBAR_HEIGHT],
              }),
            }}
          >
            <GridContainer
              square={square}
              offset={gridOffset}
              dataSource={dataSource}
              displaySelectionButtons={displaySelectionButtons}
              onPhotoTap={this._onGridPhotoTap}
              onMediaSelection={this._onMediaSelection}
              itemPerRow={itemPerRow}
            />
          </Animated.View>
        );
      }

      fullScreenContainer = (
        <FullScreenContainer
          ref="fullScreenContainer"
          dataSource={dataSource}
          mediaList={mediaList}
          initialIndex={currentIndex}
          alwaysShowControls={alwaysShowControls}
          displayNavArrows={displayNavArrows}
          alwaysDisplayStatusBar={alwaysDisplayStatusBar}
          displaySelectionButtons={displaySelectionButtons}
          displayActionButton={displayActionButton}
          enableGrid={enableGrid}
          useCircleProgress={useCircleProgress}
          onActionButton={onActionButton}
          onMediaSelection={this._onMediaSelection}
          onGridButtonTap={this._onGridButtonTap}
          updateTitle={this._updateTitle}
          toggleTopBar={this._toggleTopBar}
          bottomBarComponent={this.props.bottomBarComponent}
          onPhotoLongPress={this.props.onPhotoLongPress}
          delayLongPress={this.props.delayPhotoLongPress}
        />
      );
    }

    const TopBarComponent = this.props.topBarComponent || TopToolBar;

    return (
      <View style={[styles.container, {
        paddingTop: gridContainer ? TOOLBAR_HEIGHT : 0,
      }, style]}>
        {gridContainer}
        {fullScreenContainer}
        <TopBarComponent
          height={TOOLBAR_HEIGHT}
          displayed={displayTopBar}
          title={isFullScreen ? title : `${mediaList.length} photos`}
          onBack={onBack}
        />
      </View>
    );
  }
}

MediaBrowser.defaultProps = {
  mediaList: [],
  initialIndex: 0,
  square: false,
  alwaysShowControls: false,
  displayActionButton: false,
  displayNavArrows: false,
  alwaysDisplayStatusBar: false,
  enableGrid: true,
  startOnGrid: false,
  displaySelectionButtons: false,
  useCircleProgress: false,
  onSelectionChanged: () => {},
  displayTopBar: true,
  onPhotoLongPress: () => {},
  delayPhotoLongPress: 1000,
  gridOffset: 0,
};

MediaBrowser.propTypes = {
  style: View.propTypes.style,
  mediaList: PropTypes.array.isRequired,
  square: PropTypes.bool,   //thumbnails height === width
  gridOffset: PropTypes.number,   //offsets the width of the grid
  initialIndex: PropTypes.number,   //set the current visible photo before displaying
  alwaysShowControls: PropTypes.bool,
  displayActionButton: PropTypes.bool,    //Show action button to allow sharing, downloading, etc
  displayNavArrows: PropTypes.bool,   //Whether to display left and right nav arrows on bottom toolbar
  alwaysDisplayStatusBar: PropTypes.bool,   // Whether to keeep status bar visible even when controls are hidden in full screen mode
  enableGrid: PropTypes.bool,   //Whether to allow the viewing of all the photo thumbnails on a grid
  startOnGrid: PropTypes.bool,    //Whether to start on the grid of thumbnails instead of the first photo
  displaySelectionButtons: PropTypes.bool,    //Whether selection buttons are shown on each image
  onSelectionChanged: PropTypes.func,   //Called when a media item is selected or unselected
  onActionButton: PropTypes.func,   //Called when action button is pressed for a media,If you don't provide this props, ActionSheetIOS will be opened as default
  useCircleProgress: PropTypes.bool,    //not yet
  onBack: PropTypes.func,   //Called when done or back button is tapped.Back button will not be displayed if this is null.
  itemPerRow: PropTypes.number,   //Sets images amount in grid row, default - 3 (defined in GridContainer)
  displayTopBar: PropTypes.bool,    //Display top bar
  onPhotoLongPress: PropTypes.func,   //Applied on Photo components' parent TouchableOpacity
  delayPhotoLongPress: PropTypes.number,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});
