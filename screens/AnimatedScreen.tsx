import * as React from 'react';
import { useWindowDimensions, LayoutChangeEvent, StyleSheet, LogBox, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DragBox, { Draggable, Offset } from '../components/DragBox';
import DragAndDrop from '../components/DragAndDrop';
import { Text, View } from '../components/Themed';
import { RootTabScreenProps } from '../types';

LogBox.ignoreLogs([
  'Animated.event now requires a second argument for options',
])

const initialOffset = { minX: 0, maxX: 0, minY: 0, maxY: 0 };

const createDraggableData = (i: number):Draggable =>  ({
  id: `draggable-${i}`,
  layout: { x: (i * 60), y: (i * 60), width: 80, height: 60 },
  dragging: false,
  onDragStart: () => console.debug('onDragStart'),
  onDragEnd: () => console.debug('onDragEnd'),
  data: { count: i },
});

export default function AnimatedScreen({ navigation }: RootTabScreenProps<'Animated'>) {
  const { top, right, bottom, left } = useSafeAreaInsets();
  const [total, setTotal] = React.useState(0);
  const [drag, setDrag] = React.useState(createDraggableData(0));
  const [droppableOffset, setDroppableOffset] = React.useState<Offset>(initialOffset);
  const [buttonGroupOffset, setButtonGroupOffset] = React.useState<Offset>(initialOffset);
  const [draggables, setDraggables] = React.useState<Draggable[]>(Array(4).fill(undefined).map((_,i) => createDraggableData(i)));

  React.useEffect(() => {
    setDraggables(Array(4).fill(undefined).map((_,i) => createDraggableData(i)));
  }, []);

  const onLayoutButtonGroup = React.useCallback((e: LayoutChangeEvent) => {
    setButtonGroupOffset({
      minX: e.nativeEvent.layout.x,
      maxX: e.nativeEvent.layout.x + e.nativeEvent.layout.width,
      minY: e.nativeEvent.layout.y,
      maxY: e.nativeEvent.layout.y + e.nativeEvent.layout.height,
    })
  }, []);

  const onLayoutDroppable = React.useCallback((e: LayoutChangeEvent) => {
    setDroppableOffset({
      minX: e.nativeEvent.layout.x,
      maxX: e.nativeEvent.layout.x + e.nativeEvent.layout.width,
      minY: e.nativeEvent.layout.y + buttonGroupOffset.maxY + top,
      maxY: e.nativeEvent.layout.y + buttonGroupOffset.maxY + top + e.nativeEvent.layout.height,
    })
  }, [buttonGroupOffset]);

  const onMove = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, []);

  const onRelease = (id: string) => {
    const drag = draggables.find((drag) => drag.id === id);
    if (drag) {
      setTotal(drag.data.count);
      const newArr = draggables.filter((v) => v != drag);
      setDraggables(newArr);
      console.debug(newArr.map((v) => v.id));

      // setTimeout(() => {
      //   setDraggables(newArr);
      // }, 1000);
    }
  }

  const onChange = (id: string, x: number, y: number) => {
    setDraggables(draggables.map((drag) => drag.id === id ? {...drag, layout: { ...drag.layout, x, y }} : drag));
  }

  const onChangeDrag = (id: string, x: number, y: number) => {
    setDrag({ ...drag, layout: { ...drag.layout, x, y } });
  }

  const onReleaseDrag = () => {
    setDraggables([...draggables, drag]);
    setDrag(createDraggableData(0))
  }

  const onPressNewDrag = () => {
    setDrag({ ...drag, data: { count: drag.data.count + 1 } })
  }

  return (
    <View style={[styles.container, { marginTop: top }]}>
      <DragAndDrop
        total={total}
        draggables={draggables}
        onChange={onChange}
        onMove={onMove}
        onRelease={(drag) => onRelease(drag.id)}
      />
      {/* <View style={styles.dragView}>
        {React.useMemo(() => (droppableOffset.maxX > 0 && droppableOffset.maxY > 0) &&
          draggables.map((drag, i) => (
            <DragBox
              key={`draggable-${i}`}
              drag={drag}
              count={drag.data.count}
              droppableOffset={droppableOffset}
              onChange={onChange}
              onMove={onMove}
              onRelease={() => onRelease(drag.id)}
            />
        )), [draggables])}
      </View>
      {React.useMemo(() =>
        <View style={styles.dropView} onLayout={onLayoutDroppable}>
          <Text style={styles.total}>{total}</Text>
        </View>
      , [droppableOffset, total])} */}
      <View style={styles.buttonGroup} onLayout={onLayoutButtonGroup}>
        <Pressable style={styles.button} onPress={onPressNewDrag}>
        {/* <Pressable style={styles.button} onPress={() => setDraggables(draggables)}> */}
          <Text style={styles.buttonText}>リセット</Text>
        </Pressable>
        {Array(10 - draggables.length).fill(undefined).map((_, i) => 
          <DragBox
            key={`new-draggables-${i}`}
            drag={drag}
            count={drag.data.count}
            droppableOffset={initialOffset}
            onChange={onChangeDrag}
            onMove={onMove}
            onRelease={onReleaseDrag}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonGroup: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#eee',
    zIndex: 1,
  },
  button: {
    width: 80,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'blue',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  dragView: {
    flex: 1,
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
    color: '#fff',
    fontSize: 48
  }
});
