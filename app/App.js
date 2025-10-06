import React, {useState} from 'react';
import {Button, StyleSheet, Text, TextInput, View} from 'react-native';


type ExerciseSetProp = {
  reps: int;
  weight: int;
  collapsed: boolean;
  complete: boolean;
};


type CatProps = {
  name: string;
};

const ExerciseSetComponent = (props: ExerciseSetProp) => {
  const [isComplete, setComplete] = useState(false);
  const [isCollapsed, setCollapsed] = useState(false);

  return (
    <View style={[
        styles.container,
        {
          flexDirection: 'row',
          maxHeight: '80px',
          justifyContent: 'center',
          
        },
      ]}>
      <Text style={{flex: 1}} >Weight: </Text>
      <TextInput value={props.weight} keyboardType="number-pad" style={{flex: 1}} />
      {!isComplete && (
      <Button 
        onPress={() => {
          setComplete(!isComplete)
        }}
        title='Finished?'
      />
      )}
    </View>
  )
}

const Cat = (props: CatProps) => {
  const [isHungry, setIsHungry] = useState(true);

  return (
    <View>
      <Text>
        I am {props.name}, and I am {isHungry ? 'hungry' : 'full'}!
      </Text>
      <Button
        onPress={() => {
          setIsHungry(false);
        }}
        disabled={!isHungry}
        title={isHungry ? 'Give me some food, please!' : 'Thank you!'}
      />
    </View>
  );
};

const Workout = () => {
  return (
    <>
      <ExerciseSetComponent reps="5" weight="45" collapsed="false" complete="false" />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});

export default Workout;