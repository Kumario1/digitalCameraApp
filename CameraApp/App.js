import { StyleSheet, Text, View, Button, TouchableOpacity, Image, Alert} from 'react-native';
import { CameraView, CameraType, useCameraPermissions, Camera}  from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import React, {useState, useEffect, useRef} from 'react';
import FilterBar from './FilterBar';
import Ionicons from '@expo/vector-icons/Ionicons';
import NavBar from './navBar';
import * as FileSystem from 'expo-file-system';

export default function App() {
  //getting permission, using a react hook to change the persmissions
  const [permission, requestPermission] = useCameraPermissions();
  //setting up the image to display, and using react hook to change image
  const [originalImage, setOriginalImage] = useState(null);
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
        setOriginalImage(photo.uri)
        setImage(photo.uri); // Update state with valid image URI
        console.log('Photo URI:', photo.uri);
      }
    }
  }

  async function savePicture() {
    if (!image) {
      alert('No image available to save.');
      return;
    }
  
    try {
      let fileUri = image;
  
      // Check if the image is Base64
      if (!image.startsWith('file://')) {
        console.log('Saving Base64 image to file system...');
  
        // Extract the Base64 data from the URI
        const base64Data = image.split(',')[1]; // Remove "data:image/jpeg;base64,"
  
        // Generate a file path
        fileUri = `${FileSystem.cacheDirectory}filtered-image.jpg`;
  
        // Write the Base64 data to the file system
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
  
        console.log('Image saved to file system at:', fileUri);
      }
  
      // Save the file to the media library
      await MediaLibrary.createAssetAsync(fileUri);
      alert('Photo saved to gallery!');
    } catch (error) {
      console.error('Error saving picture:', error);
      alert('Failed to save picture. Please try again.');
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

      function uriToBase64(uri) {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = function() {
            const reader = new FileReader();
            reader.onloadend = function() {
              resolve(reader.result.split(',')[1]); 
              // split(',')[1] to remove the 'data:image/jpeg;base64,' prefix
            };
            reader.readAsDataURL(xhr.response);
          };
          xhr.onerror = function() {
            reject(new Error('uriToBase64 failed'));
          };
          xhr.open('GET', uri);
          xhr.responseType = 'blob';
          xhr.send();
        });
      }
      

      async function applyFilter(filterType) {
        if (!originalImage) {
          alert('No image available to apply filter!');
          return;
        }
      
        try {
          // 1) Convert image URI to base64
          const base64ImageData = await uriToBase64(originalImage);
      
          // 2) Build the JSON object
          const payload = {
            image: base64ImageData,
            filter: filterType
          };
      
          // 3) Send as JSON to your Lambda endpoint
          const response = await fetch('https://guqte763s5.execute-api.us-east-1.amazonaws.com/dev/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
          });
      
          if (!response.ok) {
            throw new Error(`Failed to apply filter: ${response.statusText}`);
          }
      
          // 4) The Lambda returns a JSON body with "processed_image" (base64)
          const responseData = await response.json();
          if (!responseData.processed_image) {
            throw new Error('No processed_image found in response.');
          }
      
          // 5) Convert the base64 string back to a data URI for React Native to display
          const base64String = responseData.processed_image;
          // You can do something like:
          //   data:image/jpeg;base64,<base64String>
          // in order to display it in an <Image> component
      
          const dataUri = `data:image/jpeg;base64,${base64String}`;
          setImage(dataUri); 
          // setImage is your state setter that puts this data in an <Image> component source
          // e.g. <Image source={{ uri: dataUri }} />
      
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
