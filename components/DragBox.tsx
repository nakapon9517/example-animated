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
  droppableOffset: Offset;
  onChange: (id: string, x: number, y: number) => void;
  onPress?: () => void;
  onMove?: () => void;
  onRelease?: () => void;
} & ViewProps;

const DragBox = (props: Props) => {
  const pan = useRef(new Animated.ValueXY({ x: props.drag.layout.x, y: props.drag.layout.y })).current;
  const [currentDropped, setCurrendDropped] = React.useState<Droppable | undefined>({ id: 'a' });
  const [dragOffset, setDragOffset] = React.useState([0, 0])

  const getDroppableInArea = React.useCallback((x: number, y: number): Droppable | undefined => {
    const _x = x - dragOffset[0];
    const _y = y - dragOffset[1];
    return (_x >= props.droppableOffset.minX &&
        _x <= props.droppableOffset.maxX &&
        _y >= props.droppableOffset.minY &&
        _y <= props.droppableOffset.maxY)
        ? currentDropped
        : undefined;
  }, [dragOffset, currentDropped, props.droppableOffset]);

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
        props.onChange(props.drag.id, pageX, pageY);
        const droppable  = getDroppableInArea(pageX, pageY);
        if (droppable) {
          if (currentDropped?.id === droppable.id) {
            setCurrendDropped(undefined);
            props.onMove && props.onMove();
          }
        }
      },
      onPanResponderRelease: (e, gesture) => {
        const { pageX, pageY } = e.nativeEvent;
        const droppable  = getDroppableInArea(pageX, pageY);
        if (droppable) {
          if (currentDropped?.id === droppable.id) {
            props.onRelease && props.onRelease();
          }
        }
      }
    })
  ).current;

  return (
    <Animated.View
      style={[
        { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
        { zIndex: 99 }
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
    position: 'absolute',
    width: 80,
    height: 50,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  text: {
    color: '#000',
    fontSize: 24,
  }
});

export default DragBox;