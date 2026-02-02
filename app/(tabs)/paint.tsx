import { PaintCalculator } from '@/components/calculators/PaintCalculator';
import { Stack } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

export default function PaintScreen() {
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <Stack.Screen options={{ title: 'Paint' }} />
                <PaintCalculator />
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
