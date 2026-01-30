import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';

type SaveProjectModalProps = {
    visible: boolean;
    onClose: () => void;
    onSave: (name: string, note: string) => void;
};

export function SaveProjectModal({ visible, onClose, onSave }: SaveProjectModalProps) {
    const [name, setName] = useState('');
    const [note, setNote] = useState('');

    const handleSave = () => {
        if (!name.trim()) return;
        onSave(name, note);
        setName('');
        setNote('');
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
                    <View style={styles.modalContent}>
                        <ThemedText type="subtitle" style={styles.title}>Save Project</ThemedText>

                        <Text style={styles.label}>Project Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Backyard Patio"
                            value={name}
                            onChangeText={setName}
                            autoFocus
                        />

                        <Text style={styles.label}>Notes (Optional)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Add any details..."
                            value={note}
                            onChangeText={setNote}
                            multiline
                            numberOfLines={3}
                        />

                        <View style={styles.actions}>
                            <Button title="Cancel" onPress={onClose} variant="secondary" style={styles.button} />
                            <Button title="Save" onPress={handleSave} disabled={!name.trim()} style={styles.button} />
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
        marginBottom: 16,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#444',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
    }
});
