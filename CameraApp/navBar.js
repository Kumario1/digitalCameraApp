import React from 'react';
import {View, FlatList, StyleSheet, Text, StatusBar, ScrollView} from 'react-native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function navBar({}) {
    return (
        <View style={styles.sidebar}>
            <SafeAreaProvider>
                <SafeAreaView>
                    <ScrollView horizontal={true}>
                        <Ionicons></Ionicons>
                    </ScrollView>
                </SafeAreaView>
            </SafeAreaProvider>
        </View>
    );
}