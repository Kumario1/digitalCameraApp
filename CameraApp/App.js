import { StyleSheet, Text, View, Button, TouchableOpacity, Image, Alert} from 'react-native';
import { CameraView, useCameraPermissions}  from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import React, {useState, useEffect, useRef} from 'react';
import FilterBar from './FilterBar';
import Ionicons from '@expo/vector-icons/Ionicons';
import NavBar from './navBar';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import MaterialIcons2 from 'react-native-vector-icons/MaterialIcons';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [originalImage, setOriginalImage] = useState(null);
  const [image, setImage] = useState(null);
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off')
  const [raw, setRaw] = useState(false)
  const [live, setLive] = useState('off')
  const cameraRef = useRef(null);
  const [permissionResponse, requestPermissions] = MediaLibrary.usePermissions();
  const [previewThumnail, setPreviewThumbnail] = useState(null);
  const [imgLoading, setimgLoading] = useState(false);

  useEffect(() => {
    if(permission && permission.granted && permissionResponse && permissionResponse.granted){
      getLastSavedImage();
    }
  }, [permission, permissionResponse]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Hello! We need your Camera permissions to allow you to take pictures in the App. Without thse permissions the app won't function properly.</Text>
        <Button onPress={requestPermission} title="Allow Access to Camera" />
      </View>
    );
  }

  if (!permissionResponse) {
    return <View />;
  }

  if (!permissionResponse.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your Library permissions to access your photo libraries to allow the app to save the pictures you take, and view the photos you have taken in the app so far.</Text>
        <Button onPress={requestPermissions} title="Allow Acess to Photo Library" />
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

  function toggleRaw() {
    setRaw(
      raw === false
      ? true
      : false
    );
  }

  function toggleLive() {
    setLive(
      live === 'off'
      ? 'on'
      : 'off'
    );
  }
  
  async function takePicture() {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality:1.0,
        skipProcessing: !raw,
      });
      if (photo && photo.uri) {
        setOriginalImage(photo.uri)
        setImage(photo.uri);
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
  
      if (!image.startsWith('file://')) {
        console.log('Saving Base64 image to file system...');
  
        const base64Data = image.split(',')[1];
  
        fileUri = `${FileSystem.cacheDirectory}filtered-image.jpg`;
  
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
  
        console.log('Image saved to file system at:', fileUri);
      }
      
      const asset = await MediaLibrary.createAssetAsync(fileUri);
  
      let album = await MediaLibrary.getAlbumAsync('DigiCam');
  
      if (!album) {
        album = await MediaLibrary.createAlbumAsync('DigiCam', asset, false);
        console.log('Album "DigiCam" created.');
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album.id, false);
        console.log('Asset added to existing "DigiCam" album.');
        getLastSavedImage();
      }
  
      alert('Photo saved to DigiCam album!');
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

  const getLastSavedImage = async () => {
    try {
      if (permissionResponse && permissionResponse.granted) {
        const cameraAlbum = await MediaLibrary.getAlbumAsync('DigiCam');

        if (cameraAlbum) {
          const { assets } = await MediaLibrary.getAssetsAsync({
            album: cameraAlbum,
            sortBy: [MediaLibrary.SortBy.creationTime],
            mediaType: MediaLibrary.MediaType.photo,
            first: 1,
          });

          if (assets.length > 0) {
            const assetInfo = await MediaLibrary.getAssetInfoAsync(assets[0].id);
            setPreviewThumbnail(assetInfo.localUri || assetInfo.uri);
          } else {
            console.log("No assets found");
            setPreviewThumbnail(null);
          }
        } else {
          console.log("No album found");
          setPreviewThumbnail(null);
        }
      }
    } catch (error) {
      console.error("Error fetching last saved image:", error);
    }
  };

  async function uriToBase64(uri) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        const reader = new FileReader();
        reader.onloadend = function() {
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
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

  async function getImageSize(uri) {
    return new Promise((resolve, reject) => {
      Image.getSize(
        uri,
        (width, height) => resolve({ width, height }),
        (error) => reject(error)
      );
    });
  }

  async function applyFilter(filterType) {
    if (!originalImage) {
      alert('No image available to apply filter!');
      return;
    }
  
    try {
      setimgLoading(true);

      const { width: originalWidth, height: originalHeight } = await getImageSize(originalImage);
      const newWidth = 1280;
      const aspectRatio = originalHeight / originalWidth;
      const newHeight = Math.round(newWidth * aspectRatio);
  
      const resizedImage = await ImageManipulator.manipulateAsync(
        originalImage,
        [{ resize: { width: newWidth, height: newHeight } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
  
      const base64Data = await uriToBase64(resizedImage.uri);
  
      const payload = {
        image: base64Data,
        filter: filterType,
      };
  
      const response = await fetch(
        'https://guqte763s5.execute-api.us-east-1.amazonaws.com/dev/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
  
      if (!response.ok) {
        throw new Error(`Failed to apply filter: ${response.status}`);
      }
  
      const responseData = await response.json();
  
      if (!responseData.processed_image) {
        throw new Error('No processed_image found in response.');
      }

      const base64String = responseData.processed_image;
      const dataUri = `data:image/jpeg;base64,${base64String}`;
  
      setImage(dataUri);
    } catch (error) {
      console.error('Error applying filter:', error);
      alert('Failed to apply filter. Please try again.');
    } finally {
      setimgLoading(false);
    }
  }

  return (
    <View style={styles.containerCam}>
      {image ? (
        <View style={styles.previewContainer}>
          {imgLoading && <Text style={styles.loadingText}>Loading... Please wait!</Text>}
          <Image source={{ uri: image }} style={styles.preview} />
          <FilterBar 
            onSave={savePicture}
            resetImg={confirmActionAlert}
          />
          <NavBar
            applyFilter={applyFilter}
            originalImage={originalImage}
          />  
        </View>
      ) : (
        <>
          <View style={styles.flipButtonContainer}>
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
              <Ionicons name="camera-reverse" size={30} color="white"/>
            </TouchableOpacity>
            <TouchableOpacity style={styles.flashButton} onPress={toggleCameraFlash}>
              <Ionicons name={flash === 'on' ? 'flash-outline' : 'flash-off-outline'} 
                size={25} color="white"/>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rawButton} onPress={toggleRaw}>
              <MaterialIcons2 name={raw === false ? 'raw-on' : 'raw-off'} 
                size={32} color="white"/>
            </TouchableOpacity>
            <TouchableOpacity style={styles.upArrowButton}>
              <Ionicons name="chevron-up-outline" size={22} color="white"/>
            </TouchableOpacity>
          </View>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            flash={flash}
          >
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => setImage(previewThumnail)} >
                <Image
                  source={{uri: previewThumnail}}
                  style={styles.previewThumnailView}
                />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={takePicture}
                style={styles.pictureButton}
              >
                <Ionicons 
                  name="radio-button-on-sharp"
                  size={100} 
                  color="white" 
                />
              </TouchableOpacity>
            </View>
          </CameraView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingText:{
    position: 'absolute',
    top: '50%',
    left: '22%',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
    color: 'gray',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    pointerEvents: 'none',
    zIndex: 10,
  },
  message: {
    padding: 10,
  },
  previewThumnailView: {
    width: 60,
    height: 55,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'gray',
    marginRight: '10%',
    marginTop: '-15%',
  },
  pictureButton: {
    width: 95,
    height: 95,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    marginTop: '-5%',
    marginRight: '32%',
  },
  upArrowButton: {
    position: 'absolute',
    top: "65%",
    left: "48%",
  },
  rawButton: {
    position: 'absolute',
    top: "50%",
    left: "80%",
  },
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
  containerCam: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipButton: {
    position: 'absolute',
    top: "50%",
    left: "3%",
    borderRadius: 5,
  },
  flashButton: {
    position: 'absolute',
    top: "52%",
    left: "15%",
    borderRadius: 5,
  },
  camera: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    position: 'absolute',
    bottom: '-2%',
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#000',
    paddingVertical: 10,
    height: '25%',
  },
});