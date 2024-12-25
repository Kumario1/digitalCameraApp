import { StyleSheet, Text, View, Button, TouchableOpacity, Image, Alert} from 'react-native';
import { CameraView, CameraType, useCameraPermissions, Camera}  from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import React, {useState, useEffect, useRef} from 'react';
import FilterBar from './FilterBar';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Grayscale,
  Sepia,
  Brightness,
  Saturate,
  Tint,
  ColorMatrix,
  concatColorMatrices,
  invert,
  contrast,
  saturate
} from 'react-native-color-matrix-image-filters'
import NavBar from './navBar';

export default function App() {
  //getting permission, using a react hook to change the persmissions
  const [permission, requestPermission] = useCameraPermissions();
  //setting up the image to display, and using react hook to change image
  const [image, setImage] = useState(null);
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off')
  const cameraRef = useRef(null);
  const [albums, setAlbums] = useState(null)
  const [permissionResponse, requestPermissions] = MediaLibrary.usePermissions();
  const [selectedFilter, setSelectedFilter] = useState(null);


  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  if (!permissionResponse) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permissionResponse.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermissions} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  function toggleCameraFlash() {
    setFlash(
      flash === 'off'
      ? 'on'
      : 'off'
    );
  }

  async function takePicture() {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality:1.0,
        skipProcessing: true,
      });
      if (photo && photo.uri) {
        setImage(photo.uri); // Update state with valid image URI
        console.log('Photo URI:', photo.uri);
      }
    }
  }

  async function savePicture() {
    if (image) {
      await MediaLibrary.createAssetAsync(image);
      alert('Photo saved to gallery!');
    }
  }

    const confirmActionAlert = () =>
      Alert.alert("Confirm", "Are you sure you want to go back?", [
        {
          text: "Yes",
          onPress: () => setImage(null),
          style: 'default',
        },
        {
          text: "Cancel",
          style: 'cancel',
        }
      ]);

      async function applyFilter(filterType) {
        if (!image) {
          alert('No image available to apply filter!');
          return;
        }
      
        try {
          const formData = new FormData();
          formData.append('image', {
            uri: image,          // Use the image URI from the cache
            name: 'photo.jpg',   // Give it a file name
            type: 'image/jpeg',  // Set the MIME type
          });
          formData.append('filter', filterType); // The filter type (e.g., "grayscale")
      
          const response = await fetch('http://192.168.86.31:5000/apply-filter', {
            method: 'POST',
            body: formData,
          });
      
          if (!response.ok) {
            throw new Error(`Failed to apply filter: ${response.statusText}`);
          }
      
          // Get the processed image from the server
          const blob = await response.blob();
      
          // Convert the blob to a local URI for React Native
          const reader = new FileReader();
          reader.onloadend = () => {
            setImage(reader.result); // Update the state with the filtered image URI
          };
          reader.readAsDataURL(blob);
        } catch (error) {
          console.error('Error applying filter:', error);
          alert('Failed to apply filter. Please try again.');
        }
      }
      
      

  return (
    <View style={styles.container}>
      {image ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: image }} style={styles.preview} />
          <FilterBar 
          onSave={savePicture}
          resetImg={confirmActionAlert}
          />
          <NavBar
            applyFilter={applyFilter}
          />
        </View>
        
      ) : (
        <>
        <View style={styles.flipButtonContainer}>
        <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
          <Ionicons name="camera-reverse" size={32} color="white"/>
        </TouchableOpacity>
        <TouchableOpacity style={styles.flashButton} onPress={toggleCameraFlash}>
          <Ionicons name=
          {flash === 'on'
              ? 'flash-outline'
              : 'flash-off-outline'
          } 
          size={28} color="white"/>
        </TouchableOpacity>
        </View>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          flash={flash}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={takePicture} style={styles.pictureButton}>
              <Ionicons name="radio-button-on-outline" size={95} color="white" />
            </TouchableOpacity>
          </View>
        </CameraView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flipButtonContainer: {
    zIndex: 10,
    backgroundColor: '#000000',
    height: '12%',
    width: '100%',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3333',
  },

  preview: {
    width: '100%',
    height: '70%',
    marginBottom: 20,
    backgroundColor: '#000',
  },

  container: {
      flex: 1,
      backgroundColor: '#000',
  },
  flipButton: {
      position: 'absolute',
      top: 50,
      left: 30,
      borderRadius: 5,
  },
  flashButton: {
    position: 'absolute',
    top: 53,
    left: 73,
    borderRadius: 5,
},
  flipText: {
      fontSize: 16,
      color: '#000',
      fontWeight: 'bold',
  },
  camera: {
      flex: 1,
      borderRadius: 10,
      overflow: 'hidden',
  },
  buttonContainer: {
    position: 'absolute', 
    bottom: '0%',             
    left: '7%',           
    transform: [{ translateX: -35 }], 
    width: '105%',
    height: '20%',
    alignItems: 'center',
    backgroundColor: '#000000'   
  },
  pictureButton: {
    marginTop: 10
  },
  snapButton: {
      backgroundColor: 'white',
      width: 70,
      height: 70,
      borderRadius: 35,
      justifyContent: 'center',
      alignItems: 'center',
  },
  snapText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'black',
  },
});
