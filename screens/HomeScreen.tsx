import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {saveTimersToStorage} from '../utils/storage';
import {Picker} from '@react-native-picker/picker';

const HomeScreen = ({navigation}: any) => {
  const [timers, setTimers] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('Study');

  const validateInputs = () => {
    if (
      !name ||
      !duration ||
      isNaN(Number(duration)) ||
      Number(duration) <= 0
    ) {
      Alert.alert('Invalid Input', 'Please provide a valid name and duration.');
      return false;
    }
    return true;
  };

  const addTimer = () => {
    if (!validateInputs()) return;

    const newTimer = {
      id: new Date().toISOString(),
      name,
      duration: parseInt(duration),
      category,
      remainingTime: parseInt(duration),
      elapsedTime: 0,
      status: 'Pending',
    };
    const updatedTimers = [...timers, newTimer];
    setTimers(updatedTimers);
    saveTimersToStorage(updatedTimers);
    setName('');
    setDuration('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Timers</Text>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Timer Name"
          style={styles.input}
        />
        <TextInput
          value={duration}
          onChangeText={setDuration}
          placeholder="Duration (seconds)"
          keyboardType="numeric"
          style={styles.input}
        />
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={setCategory}
            style={styles.picker}>
            <Picker.Item label="Workout" value="Workout" />
            <Picker.Item label="Study" value="Study" />
            <Picker.Item label="Break" value="Break" />
          </Picker>
        </View>
      </ScrollView>

      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={addTimer}>
          <Text style={styles.addButtonText}>Add Timer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addButton, {backgroundColor: '#007BFF'}]}
          onPress={() => navigation.navigate('History')}>
          <Text style={styles.addButtonText}>View History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
  },
  pickerContainer: {
    marginBottom: 15,
  },
  picker: {
    height: 40,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default HomeScreen;
