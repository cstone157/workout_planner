import React, {useState} from 'react';
import {Button, Text, View} from 'react-native';


type ExerciseProps = {
  name: string;
  description: string;
  sets: int;
  reps: int;
  weight: int;
  seconds: int;
  cardio: boolean;
};


const Exercise = (props: ExerciseProps) => {
  
  if (props.cardio){
    return (
      <View>
        <Text>{props.name}</Text>
        <Text>{props.description}</Text>
        <Text>Reps: {props.reps}</Text>
        <Text>Sets: {props.sets}</Text> 
      </View>
    )
  } else {
    return (
      <View>
        <Text>{props.name}</Text>
        <Text>{props.description}</Text>
        <Text>Reps: {props.reps}</Text>
        <Text>Time: {props.seconds}</Text> 
      </View>
    )
  }
}


type CatProps = {
  name: string;
};

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
      <Cat name="Munkustrap" />
      <Cat name="Spot" />
      <Exercise name="Pullups" description="Using pullup bar pull yourself up" sets="4" reps="4" cardio="false" />
    </>
  );
};

export default Cafe;