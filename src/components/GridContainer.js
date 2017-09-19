import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Dimensions,
  FlatList,
  TouchableHighlight,
  View,
  StyleSheet,
} from 'react-native';

import CONSTANTS from '../utils/constants';
import { Photo } from '@zdy/react-native-media';

// 1 margin and 1 border width
const ITEM_MARGIN = 2;
const TOOLBAR_HEIGHT = CONSTANTS.TOOLBAR_HEIGHT;

export default class GridContainer extends Component {

  constructor(props, context) {
    super(props, context);

    this._renderItem = this._renderItem.bind(this);
    this._keyExtractor = this._keyExtractor.bind(this);

    this.state = {};
  }

  _renderItem(item, index) {
    const {
      displaySelectionButtons,
      onPhotoTap,
      onMediaSelection,
      itemPerRow,
      square,
      offset,
    } = this.props;
    const screenWidth = Dimensions.get('window').width - offset;
    const photoWidth = (screenWidth / itemPerRow) - (ITEM_MARGIN * 2);

    return (
      <TouchableHighlight onPress={() => onPhotoTap(index)}>
        <View style={styles.row}>
          <Photo
            width={photoWidth}
            height={square ? photoWidth : 100}
            resizeMode={'cover'}
            thumbnail={true}
            displaySelectionButtons={displaySelectionButtons}
            uri={item.thumb || item.photo}
            showVideoIcon={item.video ? true : false}
            selected={item.selected}
            onSelection={(isSelected) => {
              onMediaSelection(index, isSelected);
            }}
          />
        </View>
      </TouchableHighlight>
    );
  }

  _keyExtractor(item, index){
    return index;
  }

  render() {
    const { dataSource, itemPerRow } = this.props;

    return (
      <View style={styles.container}>
        <FlatList
          data={dataSource}
          initialNumToRender={21}
          renderItem={({item, index}) => this._renderItem(item, index)}
          numColumns={itemPerRow}
          keyExtractor={({item, index}) => this._keyExtractor(item, index)}
        />
      </View>
    );
  }
}

GridContainer.defaultProps = {
  displaySelectionButtons: false,
  onPhotoTap: () => {},
  itemPerRow: 3,
};

GridContainer.propTypes = {
  style: View.propTypes.style,
  square: PropTypes.bool,
  dataSource: PropTypes.array.isRequired,
  displaySelectionButtons: PropTypes.bool,
  onPhotoTap: PropTypes.func,
  itemPerRow: PropTypes.number,
  onMediaSelection: PropTypes.func,   //refresh the list to apply selection change
  offset: PropTypes.number, //offsets the width of the grid
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: TOOLBAR_HEIGHT,
  },
  row: {
    justifyContent: 'center',
    margin: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 1,
  },
});
