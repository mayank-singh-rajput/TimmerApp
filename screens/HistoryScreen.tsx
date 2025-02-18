import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {loadTimersFromStorage, saveTimersToStorage} from '../utils/storage';

const HistoryScreen = () => {
  const [timers, setTimers] = useState<any[]>([]);
  const [completedTimer, setCompletedTimer] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTimersFromStorage().then(timers => {
      setTimers(timers);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prevTimers =>
        prevTimers.map(timer =>
          timer.status === 'Running'
            ? {...timer, elapsedTime: timer.elapsedTime + 1}
            : timer,
        ),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const startTimer = (id: string) => {
    setTimers(prevTimers => {
      const updatedTimers = prevTimers.map(timer =>
        timer.id === id
          ? {
              ...timer,
              status: 'Running',
              elapsedTime: timer.elapsedTime || 0,
            }
          : timer,
      );
      saveTimersToStorage(updatedTimers);
      return updatedTimers;
    });
  };

  const pauseTimer = (id: string) => {
    setTimers(prevTimers => {
      const updatedTimers = prevTimers.map(timer =>
        timer.id === id
          ? {
              ...timer,
              status: 'Paused',
              remainingTime: timer.duration - timer.elapsedTime,
              elapsedTime: timer.elapsedTime || 0,
            }
          : timer,
      );
      saveTimersToStorage(updatedTimers);
      return updatedTimers;
    });
  };

  const resetTimer = (id: string) => {
    setTimers(prevTimers => {
      const updatedTimers = prevTimers.map(timer =>
        timer.id === id
          ? {
              ...timer,
              remainingTime: timer.duration,
              elapsedTime: 0,
              status: 'Pending',
            }
          : timer,
      );
      saveTimersToStorage(updatedTimers);
      return updatedTimers;
    });
  };

  const markCompleted = (id: string) => {
    setTimers(prevTimers => {
      const updatedTimers = prevTimers.map(timer =>
        timer.id === id ? {...timer, status: 'Completed'} : timer,
      );
      saveTimersToStorage(updatedTimers);
      const completed = updatedTimers.find(timer => timer.id === id);
      setCompletedTimer(completed?.name || '');
      setModalVisible(true);
      return updatedTimers;
    });
  };

  const groupTimers = (timers: any[]) => {
    return timers.reduce((acc: any, timer: any) => {
      acc[timer.category] = acc[timer.category] || [];
      acc[timer.category].push(timer);
      return acc;
    }, {});
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={Object.keys(groupTimers(timers))}
          keyExtractor={item => item}
          renderItem={({item}) => (
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryHeader}>{item}</Text>
              {groupTimers(timers)[item].map((timer: any) => (
                <View key={timer.id} style={styles.timerCard}>
                  <View style={styles.textContainer}>
                    <Text style={styles.timerName}>{timer.name}</Text>
                    <Text style={styles.timerStatus}>{timer.status}</Text>
                  </View>

                  <View style={styles.timeContainer}>
                    <Text style={styles.timerTime}>
                      {formatTime(timer.duration)}
                    </Text>
                    <Text style={styles.timerTime}>
                      {timer.status === 'Running' &&
                        formatTime(timer.elapsedTime)}
                    </Text>
                    <Text style={styles.timerTime}>
                      {formatTime(timer.remainingTime)}
                    </Text>
                  </View>

                  <View style={styles.buttonContainer}>
                    {timer.status === 'Running' ? (
                      <TouchableOpacity
                        style={[styles.button, {backgroundColor: '#FF6347'}]}
                        onPress={() => pauseTimer(timer.id)}>
                        <Text style={styles.buttonText}>Pause</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.button, {backgroundColor: '#28a745'}]}
                        onPress={() => startTimer(timer.id)}>
                        <Text style={styles.buttonText}>Start</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => resetTimer(timer.id)}>
                      <Text style={styles.buttonText}>Reset</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => markCompleted(timer.id)}>
                      <Text style={styles.buttonText}>Complete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>
            Timer {completedTimer} Completed!
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setModalVisible(false)}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  categoryContainer: {
    marginBottom: 15,
  },
  categoryHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#444',
  },
  timerCard: {
    marginBottom: 10,
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timerStatus: {
    fontSize: 16,
    fontWeight: 'semibold',
    color: '#444',
  },
  timerTime: {
    fontSize: 14,
    color: '#555',
    marginVertical: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    width: '25%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default HistoryScreen;
