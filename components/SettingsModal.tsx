import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSettings } from '@/context/SettingsContext';
import { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Modal, Platform, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

type SettingsModalProps = {
    visible: boolean;
    onClose: () => void;
};

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
    const { settings, updateSettings } = useSettings();
    const [waste, setWaste] = useState(settings.defaultWaste);
    const [unit, setUnit] = useState<'ft' | 'm'>(settings.defaultUnit);

    useEffect(() => {
        if (visible) {
            setWaste(settings.defaultWaste);
            setUnit(settings.defaultUnit);
        }
    }, [visible, settings]);

    const handleSave = async () => {
        await updateSettings({
            defaultWaste: waste,
            defaultUnit: unit,
        });
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
                    <View style={styles.modalContent}>
                        <ThemedText type="subtitle" style={styles.title}>Defaults</ThemedText>
                        <ThemedText style={styles.subtitle}>Set your preferred defaults for new estimates.</ThemedText>

                        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Preferred Unit</ThemedText>
                        <View style={styles.unitRow}>
                            <Button
                                title="Imperial (ft/in)"
                                onPress={() => setUnit('ft')}
                                variant={unit === 'ft' ? 'primary' : 'secondary'}
                                style={styles.unitButton}
                            />
                            <Button
                                title="Metric (m/cm)"
                                onPress={() => setUnit('m')}
                                variant={unit === 'm' ? 'primary' : 'secondary'}
                                style={styles.unitButton}
                            />
                        </View>

                        <Input
                            label="Default Waste %"
                            value={waste}
                            onChangeText={setWaste}
                            keyboardType="numeric"
                            placeholder="10"
                            unit="%"
                        />

                        <View style={styles.actions}>
                            <Button title="Cancel" onPress={onClose} variant="secondary" style={styles.button} />
                            <Button title="Save Defaults" onPress={handleSave} style={styles.button} />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    title: {
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 24,
        opacity: 0.7,
        fontSize: 14,
    },
    sectionTitle: {
        marginBottom: 12,
    },
    unitRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    unitButton: {
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    button: {
        flex: 1,
    }
});
