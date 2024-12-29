import React from 'react';
import {View, StyleSheet, Text, ScrollView, TouchableOpacity} from 'react-native';

export default function navBar({applyFilter}) {
    const filters = ['digicam', 'sepia', 'invert', 'brightness', 'contrast', 'saturate'];
    
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