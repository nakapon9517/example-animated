import * as React from 'react';
import { useWindowDimensions, LayoutChangeEvent, StyleSheet, LogBox, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DragBox, { Draggable, Offset } from '../components/DragBox';
import { Text, View } from '../components/Themed';
import { RootTabScreenProps } from '../types';

LogBox.ignoreLogs([
  'Animated.event now requires a second argument for options',
])

const initialOffset = { minX: 0, maxX: 0, minY: 0, maxY: 0 }

export default function AnimatedScreen({ navigation }: RootTabScreenProps<'Animated'>) {
  const { width, height } = useWindowDimensions();
  const { top, right, bottom, left } = useSafeAreaInsets();
  const [count, setCount] = React.useState(0)
  const [total, setTotal] = React.useState(0);
  const [droppableOffset, setDroppableOffset] = React.useState<Offset>(initialOffset);
  const [buttonGroupOffset, setButtonGroupOffset] = React.useState<Offset>(initialOffset);
  const [draggables, setDraggables] = React.useState<Draggable[]>([]);

  React.useEffect(() => {
    const a = Array(10).fill(undefined).map((_,i) => createDraggableData(i));
    setDraggables(a);
  }, [])

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

  const onDropped = React.useCallback((id: string) => {
    console.debug('aaaa')
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const drag = draggables.find((drag) => drag.id === id);
    if (drag) {
      setTotal(drag.data.count);
      // const arr: Draggable[] = JSON.parse(JSON.stringify(draggables));
      // console.debug(arr.filter((drag) => drag.id !== id))
      // setDraggables(arr.filter((drag) => drag.id !== id));
      setDraggables(draggables.filter((v) => v.id !== drag.id));
    }
  }, [draggables]);

  const createDraggableData = (i?: number):Draggable =>  {
    return {
      id: `draggable-${i ?? draggables.length + 1}`,
      layout: { x: 0, y: 0, width: 80, height: 60 },
      dragging: false,
      onDragStart: () => console.debug('onDragStart'),
      onDragEnd: () => console.debug('onDragStart'),
      data: { count: i ?? draggables.length + 1 },
    }
  };

  const onPress = (id: string) => {
    setDraggables(draggables.filter((v) => v.id !== id));
  }

  return (
    <View style={[styles.container, { marginTop: top }]}>
      <View style={styles.buttonGroup} onLayout={onLayoutButtonGroup}>
        <Pressable style={styles.button} onPress={() => setDraggables(draggables.concat(createDraggableData()))}>
          <Text style={styles.buttonText}>追加</Text>
        </Pressable>
      </View>
      <View style={styles.dragView}>
        {/* {React.useMemo(() => (
          droppableOffset &&
            draggables.map((drag, i) => (
              <DragBox
                key={`draggable-${i}`}
                drag={drag}
                count={drag.data.count}
                offset={droppableOffset}
                onDropped={() => onDropped(drag.id)}
              />
              // <Pressable
              //   key={`draggable-${i}`}
              //   onPress={() => onPress(drag.id)} style={{width: 60, height :40, backgroundColor: 'gray'}}>
              //   <Text>{i}</Text>
              // </Pressable>
          )))
          ,[droppableOffset, draggables, onDropped]
        )} */}
        {(droppableOffset.maxX > 0 && droppableOffset.maxY > 0) &&
          draggables.map((drag, i) => (
            <DragBox
              key={`draggable-${i}`}
              drag={drag}
              count={drag.data.count}
              offset={droppableOffset}
              onDropped={() => onDropped(drag.id)}
            />
            // <Pressable
            //   key={`draggable-${i}`}
            //   onPress={() => onPress(drag.id)} style={{width: 60, height :40, backgroundColor: 'gray'}}>
            //   <Text>{i}</Text>
            // </Pressable>
        ))}
      </View>
      {React.useMemo(() =>
        <View style={styles.dropView} onLayout={onLayoutDroppable}>
          <Text style={styles.total}>{total}</Text>
        </View>
      , [droppableOffset, total])}
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
