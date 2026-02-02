import { FlooringCalculator } from '@/components/calculators/FlooringCalculator';
import { Stack } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

export default function FlooringScreen() {
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <Stack.Screen options={{ title: 'Flooring' }} />
                <FlooringCalculator />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
});
