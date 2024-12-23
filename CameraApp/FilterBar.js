import { StyleSheet, Text, View,TouchableOpacity, Button} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function FilterBar({onSave, resetImg}) {
    return (
        <View style={styles.sidebar}>
            <TouchableOpacity style={styles.button} onPress={onSave}>
                <Ionicons name="save-outline" size={32} color="white"/>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reload} onPress={resetImg}>
                <Ionicons name="chevron-back-outline" size={34} color="white"/>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    sidebar: {
        position: 'absolute', // Place the sidebar relative to the parent container
        bottom: "88%",            // Stick it to the bottom of the screen
        height: 110,
        width: '100%',        // Make it span the entire width
        backgroundColor: '#3333', // Background color for the bar
        padding: 10,          // Add padding for better spacing
        flexDirection: 'row', // Arrange buttons horizontally
        justifyContent: 'space-around', // Space out buttons evenly
    },
    button: {
        left: "63%",
        top: "54%",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,         // Rounded corners for buttons
        height: 60,
        opacity: .9,
    },
    reload: {
        left: "-70%",
        top: "60%",
        opacity: .9,
    },
    text: {
        color: 'white',          // Text color
        fontSize: 16,            // Font size
        fontWeight: 'bold',      // Bold text
        textAlign: 'center',     // Center-align text
    },
});

