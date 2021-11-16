import React from "react";
import { Animated, View, StyleSheet, PanResponder, Text, Pressable, ViewProps, LayoutChangeEvent, GestureResponderEvent, PanResponderGestureState, useWindowDimensions } from "react-native";
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

const DragAndDrop = (props: Props) => {
  const { width, height } = useWindowDimensions();
  const { top, right, bottom, left } = useSafeAreaInsets();
  const [draggableOffset, setDraggableOffset] = React.useState<Offset>(initialOffset);
  const [droppableOffset, setDroppableOffset] = React.useState<Offset>(initialOffset);

  const onLayoutDraggable = React.useCallback((e: LayoutChangeEvent) => {
    setDraggableOffset({
      minX: e.nativeEvent.layout.x,
      maxX: e.nativeEvent.layout.width,
      minY: top,
      maxY: top + e.nativeEvent.layout.height,
    })
  }, []);

  const onLayoutDroppable = React.useCallback((e: LayoutChangeEvent) => {
    setDroppableOffset({
      minX: e.nativeEvent.layout.x,
      maxX: e.nativeEvent.layout.width,
      minY: draggableOffset.maxY,
      maxY: draggableOffset.maxY + e.nativeEvent.layout.height,
    })
  }, [draggableOffset]);

  return (
    <View style={styles.container}>
      <View style={styles.dragView} onLayout={onLayoutDraggable}>
        {(draggableOffset.maxY < droppableOffset.maxY) &&
          props.draggables.map((drag, i) => (
            <DragBox
              key={`draggable-${i}`}
              drag={drag}
              count={drag.data.count}
              droppableOffset={droppableOffset}
              onChange={props.onChange}
              onMove={props.onMove}
              onRelease={() => props.onRelease(drag)}
            />
            // <Pressable
            //   key={`draggable-${i}`}
            //   style={{width: 60, height :40, backgroundColor: 'gray'}}
            //   onPress={() => onRelease(drag.id)}
            // >
            //   <Text>{drag.data.count}</Text>
            // </Pressable>
        ))}
      </View>
      <View style={styles.dropView} onLayout={onLayoutDroppable}>
        <Text style={styles.total}>{props.total}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dragView: {
    flex: 2,
    backgroundColor: '#fff',
    position: 'relative',
  },
  dropView: {
    height: '30%',
    backgroundColor: '#777',
    zIndex: 1,
    padding: 24
  },
  total: {
    fontSize: 36,
    color: "#fff",
  }
});

export default DragAndDrop;