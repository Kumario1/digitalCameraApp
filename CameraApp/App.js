import { StyleSheet, Text, View, Button, TouchableOpacity, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera'; // Removed CameraType import
import * as MediaLibrary from 'expo-media-library';
import React, { useState, useRef } from 'react';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [image, setImage] = useState(null);
  const [facing, setFacing] = useState('back'); // Initialize with 'back'
  const [flash, setFlash] = useState('off');
  const cameraRef = useRef(null);
  const [permissionResponse, requestPermissions] = MediaLibrary.usePermissions();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  if (!permissionResponse) {
    return <View />;
  }

  if (!permissionResponse.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to save photos</Text>
        <Button onPress={requestPermissions} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back')); // Toggle using string literals
  }

  async function takePicture() {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setImage(photo.uri);
      console.log('Photo taken:', photo.uri);
    }
  }

  async function savePicture() {
    if (image) {
      await MediaLibrary.createAssetAsync(image);
      alert('Photo saved to gallery!');
    }
  }

  return (
    <View style={styles.container}>
      {image ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: image }} style={styles.preview} />
          <Button title="Save Photo" onPress={savePicture} />
          <Button title="Retake Photo" onPress={() => setImage(null)} />
        </View>
      ) : (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          type={facing} // Use 'back' or 'front'
          flashMode={flash}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <Text style={styles.text}>Flip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={takePicture}>
              <Text style={styles.text}>Snap</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  button: {
    flex: 0.3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 10,
    borderRadius: 5,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  preview: {
    width: '90%',
    height: '70%',
    borderRadius: 10,
    marginBottom: 20,
  },
});
