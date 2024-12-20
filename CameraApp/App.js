import { StyleSheet, Text, View } from 'react-native';
import { Camera, CameraType }  from 'expo-camera';
import * as MediaLibrary from 'expo-media-library'

export default function App() {
  return (
    <View style={styles.container}>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
