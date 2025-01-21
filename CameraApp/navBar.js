import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

export default function NavBar({ applyFilter, originalImage }) {
  const filters = ['digicam', 'sepia', 'invert', 'brightness', 'contrast', 'saturate'];
  const [previews, setPreviews] = useState({});
  const [loading, setLoading] = useState(false);

  // Generate previews whenever the original image changes
  useEffect(() => {
    if (originalImage) {
      generatePreviews(); // Generate previews only when originalImage changes
    }
  }, [originalImage]);

  // Generate previews for all filters
  async function generatePreviews() {
    setLoading(true);
    try {
      const newPreviews = {};
      for (const filter of filters) {
        console.log(`Generating preview for filter: ${filter}`);
        const previewImage = await fetchFilteredPreview(originalImage, filter);
        if (previewImage) {
          console.log(`Preview generated for ${filter}`);
          newPreviews[filter] = previewImage;
        } else {
          console.error(`Failed to generate preview for ${filter}`);
        }
      }
      setPreviews(newPreviews);
    } catch (error) {
      console.error('Error generating previews:', error);
    } finally {
      setLoading(false);
    }
  }

  // Fetch a filtered preview image from the API
  async function fetchFilteredPreview(imageUri, filterType) {
    try {
      // Resize the image to reduce payload size
      const resizedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 50, height: 100 } }], // Thumbnail size
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Convert resized image to Base64
      const base64Data = await uriToBase64(resizedImage.uri);

      const payload = {
        image: base64Data,
        filter: filterType,
      };

      console.log(`Sending payload for ${filterType}`);

      const response = await fetch('https://guqte763s5.execute-api.us-east-1.amazonaws.com/dev/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch preview for ${filterType}, status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log(`Response for ${filterType}:`, responseData);

      if (!responseData.processed_image) {
        throw new Error(`No processed_image found in response for ${filterType}`);
      }

      return `data:image/jpeg;base64,${responseData.processed_image}`;
    } catch (error) {
      console.error(`Error fetching preview for ${filterType}:`, error);
      return null;
    }
  }

  // Convert a URI to Base64
  async function uriToBase64(uri) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        const reader = new FileReader();
        reader.onloadend = function () {
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        };
        reader.readAsDataURL(xhr.response);
      };
      xhr.onerror = function () {
        reject(new Error('Failed to convert URI to Base64'));
      };
      xhr.open('GET', uri);
      xhr.responseType = 'blob';
      xhr.send();
    });
  }

  // Render the navigation bar with previews
  return (
    <View style={styles.sidebar}>
      <ScrollView horizontal={true}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" style={styles.loader} />
        ) : (
          filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={styles.button}
              onPress={() => applyFilter(filter)}
            >
              <View style={styles.filterContainer}>
                {previews[filter] ? (
                  <Image source={{ uri: previews[filter] }} style={styles.preview} />
                ) : (
                  <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>?</Text>
                  </View>
                )}
                <Text style={styles.filterText}>{filter.toUpperCase()}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    position: 'absolute',
    bottom: 20,
    height: 120,
    width: '100%',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  button: {
    margin: 10,
    padding: 5,
    borderRadius: 5,
  },
  filterContainer: {
    alignItems: 'center',
  },
  preview: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  placeholder: {
    width: 50,
    height: 50,
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  placeholderText: {
    color: '#999',
    fontSize: 18,
  },
  filterText: {
    marginTop: 5,
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
  loader: {
    marginHorizontal: 10,
  },
});