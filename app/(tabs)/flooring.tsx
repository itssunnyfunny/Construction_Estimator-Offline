import { FlooringCalculator } from '@/components/calculators/FlooringCalculator';
import { Stack } from 'expo-router';
import { useRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

export default function FlooringScreen() {
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
                <Stack.Screen options={{ title: 'Flooring' }} />
                <FlooringCalculator onCalculate={scrollToResults} />
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
