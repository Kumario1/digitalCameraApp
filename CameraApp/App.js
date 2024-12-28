import { StyleSheet, Text, View, Button, TouchableOpacity, Image, Alert} from 'react-native';
import { CameraView, CameraType, useCameraPermissions}  from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import React, {useState, useEffect, useRef, Component, forwardRef, useImperativeHandle } from 'react';
import FilterBar from './FilterBar';
import Ionicons from '@expo/vector-icons/Ionicons';
import NavBar from './navBar';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons2 from 'react-native-vector-icons/MaterialIcons';



export default function App() {
  //getting permission, using a react hook to change the persmissions
  const [permission, requestPermission] = useCameraPermissions();
  //setting up the image to display, and using react hook to change image
  const [originalImage, setOriginalImage] = useState(null);
  const [image, setImage] = useState(null);
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off')
  const [raw, setRaw] = useState(false)
  const [live, setLive] = useState('off')
  const cameraRef = useRef(null);
  const [albums, setAlbums] = useState(null)
  const [permissionResponse, requestPermissions] = MediaLibrary.usePermissions();
  const [previewThumnail, setPreviewThumbnail] = useState(null);
  const [isVideoMode, setIsVideoMode] = useState(false);
const [isRecording, setIsRecording] = useState(false);


  useEffect(() => {
    if(permission && permission.granted && permissionResponse && permissionResponse.granted){
      getLastSavedImage();
    }
  }, [permission, permissionResponse]);

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
      const asset = await MediaLibrary.createAssetAsync(fileUri);
  
      // Check for the "DigiCam" album
      let album = await MediaLibrary.getAlbumAsync('DigiCam');
  
      if (!album) {
        // Create the album if it doesn't exist
        album = await MediaLibrary.createAlbumAsync('DigiCam', asset, false);
        console.log('Album "DigiCam" created.');
      } else {
        // Add the asset to the existing album
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


  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        console.log('Starting recording...');
        setIsRecording(true); // Update the recording state
        const video = await cameraRef.current.recordAsync({
          quality: '1080p', // Set video quality
          mute: false, // Ensure audio is captured
        });
  
        console.log('Video recorded at:', video.uri); // Log the video URI
        await saveVideo(video.uri); // Save video after recording
      } catch (error) {
        console.error('Error while recording video:', error); // Log any errors
        setIsRecording(false); // Reset the recording state in case of error
      }
    } else {
      console.error('Camera reference is not set.');
    }
  };
  
  const stopRecording = async () => {
    if (cameraRef.current && isRecording) {
      try {
        console.log('Stopping recording...');
        await cameraRef.current.stopRecording(); // Stop the recording manually
        console.log('Recording stopped');
        setIsRecording(false); // Update the recording state
      } catch (error) {
        console.error('Error while stopping recording:', error); // Log any errors
      }
    } else {
      console.warn('No active recording to stop.');
    }
  };
  
  

  const saveVideo = async (videoUri) => {
    try {
      if (!videoUri) {
        console.error('No video URI to save');
        return;
      }
  
      console.log('Saving video...');
      const asset = await MediaLibrary.createAssetAsync(videoUri);
      console.log('Video asset created:', asset.uri);
  
      const album = await MediaLibrary.getAlbumAsync('DigiCam');
  
      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album.id, false);
        console.log('Video added to DigiCam album');
      } else {
        await MediaLibrary.createAlbumAsync('DigiCam', asset, false);
        console.log('DigiCam album created and video added');
      }
  
      alert('Video saved to DigiCam album!');
    } catch (error) {
      console.error('Error saving video to album:', error);
      alert('Failed to save video. Please try again.');
    }
  };
  
  

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

      //function to get the previous image
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
          // Get the original dimensions of the image
          const { width: originalWidth, height: originalHeight } = await getImageSize(originalImage);
      
          // Define the new width while keeping the aspect ratio
          const newWidth = 1280; // Desired width
          const aspectRatio = originalHeight / originalWidth;
          const newHeight = Math.round(newWidth * aspectRatio);
      
          // Resize the image while maintaining aspect ratio
          const resizedImage = await ImageManipulator.manipulateAsync(
            originalImage, // URI of the original image
            [{ resize: { width: newWidth, height: newHeight } }], // Resize with calculated height
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG } // Compression and format options
          );
      
          // Convert the resized image to Base64
          const base64Data = await uriToBase64(resizedImage.uri);
      
          // Build the JSON payload
          const payload = {
            image: base64Data,
            filter: filterType,
          };
      
          // Send to your Lambda endpoint
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

      
          // Convert the returned base64 to a data URI
          const base64String = responseData.processed_image;
          const dataUri = `data:image/jpeg;base64,${base64String}`;
      
          // Update state to display the filtered image
          setImage(dataUri);
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
          <Ionicons name="camera-reverse" size={30} color="white"/>
        </TouchableOpacity>
        <TouchableOpacity style={styles.flashButton} onPress={toggleCameraFlash}>
          <Ionicons name=
          {flash === 'on'
              ? 'flash-outline'
              : 'flash-off-outline'
          } 
          size={25} color="white"/>
        </TouchableOpacity>
        {/*<TouchableOpacity style={styles.liveButton} onPress={toggleLive}>
          <Ionicons name={
            live == 'on'
            ? 'at-circle-sharp'
            : 'at-circle-outline'
          } size={30} color="white"/>
        </TouchableOpacity>
        */}
        <TouchableOpacity style={styles.rawButton} onPress={toggleRaw}>
          <MaterialIcons2 name=
          {
            raw === false
            ? 'raw-on'
            : 'raw-off'
          } size={32} color="white"/>
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
                style= {styles.previewThumnailView}
              />
            </TouchableOpacity>

            <TouchableOpacity 
                onPress={() => {
                  if (isVideoMode) {
                    // If in video mode
                    if (isRecording) {
                      stopRecording(); // Stop the video if currently recording
                    } else {
                      startRecording(); // Start recording if not recording
                    }
                  } else {
                    // If in photo mode
                    takePicture();
                  }
                }}
                style={styles.pictureButton}
              >
                <Ionicons 
                  name={isVideoMode 
                    ? (isRecording ? 'stop-circle' : 'videocam') 
                    : 'radio-button-on-sharp'} 
                  size={100} 
                  color="white" 
                />
              </TouchableOpacity>
            
          </View>
          <View style={styles.topToolbar}>
          <TouchableOpacity 
              style={styles.sideButton} 
              onPress={() => {
                setIsVideoMode(false); // Switch to photo mode
                if (isRecording) stopRecording(); // Ensure recording stops
              }}
            >
              <Text style={styles.buttonText}>PHOTO</Text>
          </TouchableOpacity>
            <TouchableOpacity style={styles.zoomOpt}>
              <Text style={styles.zoomText}>1</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomOpt}>
              <Text style={styles.zoomText}>1.5</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomOpt}>
              <Text style={styles.zoomText}>2</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.sideButton} 
              onPress={() => {
                setIsVideoMode(true); // Switch to video mode
                setIsRecording(false); // Reset recording state
              }}
            >
              <Text style={styles.buttonText}>VIDEO</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  previewThumnailView: {
    width: 60,
    height: 55,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'gray',
    marginRight: '10%',
    marginTop: '20%',
  },
  pictureButton: {
    width: 95,
    height: 95,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000', // Transparent to match background
    marginTop: '5%',
    marginRight: '33%',
  },
  sideButton: {
    width: 90,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // White button background
    borderRadius: 20, // Rounded corners
    marginLeft: -10,
    marginRight: -10,
  },
  button: {
    width: 100,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // White button background
    borderRadius: 20, // Rounded corners
  },
  buttonText: {
    color: '#000', // Black text color
    fontWeight: 'bold',
    fontSize: 15,
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
  liveButton: {
    position: 'absolute',
    top: "50%",
    left: "87%",
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

  container: {
      flex: 1,
      backgroundColor: '#000',
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
  topToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    bottom: '-75%'
  },
  zoomText: {
    color: 'white',
    marginRight: 15,
    marginLeft: 15,
  },
  zoomOpt: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Align items in a row
    justifyContent: 'space-evenly', // Space buttons evenly
    position: 'absolute',
    bottom: '0%', // Place container near the bottom
    width: '100%', // Adjust container width
    alignSelf: 'center', // Center container horizontally
    backgroundColor: '#000', // Black background
    paddingVertical: 10,
    height: '25%'
  },
});
