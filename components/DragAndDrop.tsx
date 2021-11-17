import React, { useCallback, useMemo } from "react";
import { Animated, View, StyleSheet, PanResponder, Text, Pressable, ViewProps, LayoutChangeEvent, Dimensions } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Layout from "../constants/Layout";

import DragBox, { Draggable, Offset } from './DragBox';

type Props = {
  total: number;
  draggables: Draggable[],
  onChange: (id: string, x: number, y: number) => void;
  onMove: () => void;
  onRelease: (drag: Draggable) => void;
} & ViewProps;
const initialOffset = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
const DRAG_HEIGHT = Dimensions.get('screen').height * .5

const DragAndDrop = (props: Props) => {
  const { top, right, bottom, left } = useSafeAreaInsets();
  const [draggableOffset, setDraggableOffset] = React.useState<Offset>(initialOffset);
  const [droppableOffset, setDroppableOffset] = React.useState<Offset>(initialOffset);

  const onLayoutDraggable = useCallback((e: LayoutChangeEvent) => {
    setDraggableOffset({
      minX: e.nativeEvent.layout.x,
      maxX: e.nativeEvent.layout.width,
      minY: top,
      maxY: top + DRAG_HEIGHT,
    })
  }, []);

  const onLayoutDroppable = useCallback((e: LayoutChangeEvent) => {
    setDroppableOffset({
      minX: e.nativeEvent.layout.x,
      maxX: e.nativeEvent.layout.width,
      minY: top + DRAG_HEIGHT,
      maxY: top + DRAG_HEIGHT + e.nativeEvent.layout.height,
    })
  }, [draggableOffset]);

  return (
    <View style={styles.container}>
      <View style={styles.dragView} onLayout={onLayoutDraggable}>
        {useMemo(() => {
          return (
            draggableOffset.maxY < droppableOffset.maxY && props.draggables.map((drag, i) => (
              <DragBox
                key={`draggable-${i}`}
                drag={drag}
                count={drag.data.count}
                droppableOffset={droppableOffset}
                onChange={props.onChange}
                onMove={props.onMove}
                onRelease={() => props.onRelease(drag)}
              />
            ))
          )
        }, [draggableOffset, droppableOffset])}
      </View>
      {React.useMemo(() =>
        <View style={styles.dropView} onLayout={onLayoutDroppable}>
          <Text style={styles.total}>{props.total}</Text>
        </View>
      , [droppableOffset, props.total])}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dragView: {
    height: DRAG_HEIGHT,
    backgroundColor: '#eee',
  },
  dropView: {
    flex: 1,
    backgroundColor: '#777',
    zIndex: 1,
    padding: 24,
    opacity: .7
  },
  total: {
    fontSize: 36,
    color: "#fff",
  }
});

export default DragAndDrop;