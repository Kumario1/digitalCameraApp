import React from 'react';
import {View, FlatList, StyleSheet, Text, StatusBar, ScrollView, Touchable, TouchableOpacity, SafeAreaView, SafeAreaProvider} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function navBar({applyFilter}) {
    const filters = ['grayscale', 'sepia', 'invert', 'brightness', 'contrast', 'saturate'];
    
    return (
        <View style={styles.sidebar}>
            <ScrollView horizontal={true}>
            {filters.map((filter) => (
    <TouchableOpacity
       key={filter}
       style={styles.button}
        onPress={() => applyFilter(filter)}
    >
        <Text style={styles.text}>{filter.toUpperCase()}</Text>
    </TouchableOpacity>
))}
            </ScrollView>
        </View>
                
    );
}

const styles = StyleSheet.create({
    sidebar: {
      position: 'absolute',
      bottom: 20,
      height: 100,
      width: '100%',
      padding: 10,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    button: {
        margin: 10,
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: '#555',
      borderRadius: 5,
    },
    text: {
      color: 'white',
      fontSize: 14,
      textAlign: 'center',
    },
  });