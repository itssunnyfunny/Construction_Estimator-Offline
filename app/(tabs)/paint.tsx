import { PaintCalculator } from '@/components/calculators/PaintCalculator';
import { Stack } from 'expo-router';
import { useRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

export default function PaintScreen() {
    const scrollRef = useRef<ScrollView>(null);

    const scrollToResults = () => {
        scrollRef.current?.scrollToEnd({ animated: true });
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView
                ref={scrollRef}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <Stack.Screen options={{ title: 'Paint' }} />
                <PaintCalculator onCalculate={scrollToResults} />
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
