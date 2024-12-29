import { StyleSheet, View,TouchableOpacity} from 'react-native';
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
        position: 'absolute',
        bottom: "88%",            
        height: 110,
        width: '100%',        
        backgroundColor: '#3333', 
        padding: 10,          
        flexDirection: 'row',
        justifyContent: 'space-around', 
    },
    button: {
        left: "63%",
        top: "54%",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,         
        height: 60,
        opacity: .9,
    },
    reload: {
        left: "-70%",
        top: "60%",
        opacity: .9,
    },
    text: {
        color: 'white',          
        fontSize: 16,            
        fontWeight: 'bold',      
        textAlign: 'center',     
    },
});

