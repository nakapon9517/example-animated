import React, { useRef } from "react";
import { Animated, View, StyleSheet, PanResponder, Text, Pressable, ViewProps, LayoutChangeEvent, GestureResponderEvent, PanResponderGestureState } from "react-native";

export type Offset = {
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
}

export type Draggable = {
  id: string,
  layout: { x: number, y: number, width: number, height: number },
  dragging: boolean,
  onDragStart: () => void,
  onDragEnd: () => void,
  data: { count: number },
}

type Droppable = {
  id: string;
}

type Props = {
  drag: Draggable;
  count: number;
  offset: Offset;
  onPress?: () => void;
  onDropped?: () => void;
} & ViewProps;

const DragBox = (props: Props) => {
  const [currentDropped, setCurrendDropped] = React.useState<Droppable | undefined>({ id: 'a' });
  const [dragOffset, setDragOffset] = React.useState([0, 0])
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const getDroppableInArea = React.useCallback((x: number, y: number): Droppable | undefined => {
    const _x = x - dragOffset[0];
    const _y = y - dragOffset[1];
    return (_x >= props.offset.minX &&
        _x <= props.offset.maxX &&
        _y >= props.offset.minY &&
        _y <= props.offset.maxY)
        ? currentDropped
        : undefined;
  }, [dragOffset, currentDropped, props.offset]);

  const moveEvent = Animated.event([null, { dx: pan.x, dy: pan.y }]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
      },
      onPanResponderStart: (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        const { pageX, pageY } = e.nativeEvent;
        const { layout } = props.drag;
        const dragOffset = [
          pageX - (layout.x + Math.round(layout.width / 2)),
          pageY - (layout.y + Math.round(layout.height / 2))
        ];
        setDragOffset(dragOffset);
        if (props.drag.onDragStart) props.drag.onDragStart();
      },
      onPanResponderMove: (e, gesture) => {
        moveEvent(e, gesture);
        const { pageX, pageY } = e.nativeEvent;
        console.debug(props.offset)
        const droppable  = getDroppableInArea(pageX, pageY);
        if (droppable) {
          if (currentDropped?.id === droppable.id) {
            setCurrendDropped(undefined);
            props.onDropped && props.onDropped();
          }
        }
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
      }
    })
  ).current;

  return (
    <Animated.View
      style={[
        { transform: [{ translateX: pan.x }, { translateY: pan.y }] }
      ]}
      {...panResponder.panHandlers}
    >
      <Pressable style={styles.box} onPress={props.onPress}>
        <Text style={styles.text}>{props.count}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 80,
    height: 60,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ccc',
    marginVertical: 12,
    marginHorizontal: 12,
  },
  text: {
    color: '#000',
    fontSize: 24,
  }
});

export default DragBox;