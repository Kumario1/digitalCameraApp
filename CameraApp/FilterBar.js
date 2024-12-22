import { StyleSheet, Text, View,TouchableOpacity} from 'react-native';


export default function FilterBar({onSave}) {
    return (
        <View style={styles.sidebar}>
            <TouchableOpacity style={styles.button} onPress={onSave}>
                <Text style={styles.text}>Save Button</Text>
            </TouchableOpacity>
        </View>
    );
}
    

const styles = StyleSheet.create({
    sidebar: {
        position: 'absolute', // Place the sidebar relative to the parent container
        bottom: 0,            // Stick it to the bottom of the screen
        width: '100%',        // Make it span the entire width
        backgroundColor: '#333', // Background color for the bar
        padding: 10,          // Add padding for better spacing
        flexDirection: 'row', // Arrange buttons horizontally
        justifyContent: 'space-around', // Space out buttons evenly
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#555', // Button background color
        borderRadius: 5,         // Rounded corners for buttons
    },
    text: {
        color: 'white',          // Text color
        fontSize: 16,            // Font size
        fontWeight: 'bold',      // Bold text
        textAlign: 'center',     // Center-align text
    },
});

