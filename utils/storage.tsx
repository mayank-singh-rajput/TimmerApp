import AsyncStorage from '@react-native-async-storage/async-storage';

const TIMER_STORAGE_KEY = '@timers';

export const saveTimersToStorage = async (timers: any) => {
  try {
    await AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timers));
  } catch (error) {
    console.error('Error saving timers', error);
  }
};

export const loadTimersFromStorage = async () => {
  try {
    const timers = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
    return timers ? JSON.parse(timers) : [];
  } catch (error) {
    console.error('Error loading timers', error);
    return [];
  }
};
