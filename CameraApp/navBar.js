import React from 'react';
import {View, FlatList, StyleSheet, Text, StatusBar, ScrollView, Touchable, TouchableOpacity} from 'react-native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function navBar({onApplyFilter}) {
    const filters = [
        {name: 'Grayscale', effect: 'grayscale'},
        {name: 'Sepia', effect: 'sepia'},
        {name: 'Saturate', effect: 'saturate'},
        {name: 'Brightness', effect: 'brightness'},
    ];

    return (
        <View style={styles.sidebar}>
            {filters.map((filter, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.button}
                    onPress={() => onApplyFilter(filter.effect)}
                >
                    <Text style={styles.text}>{filter.name}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    sidebar: {
      position: 'absolute',
      bottom: 20,
      height: 100,
      width: '100%',
      backgroundColor: '#333',
      padding: 10,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    button: {
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