import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChecklistItem } from '@/types';
import { useState } from 'react';
import { Keyboard, Modal, ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

type SaveProjectModalProps = {
    visible: boolean;
    onClose: () => void;
    onSave: (name: string, note: string, checklistItems: ChecklistItem[]) => void;
};

export function SaveProjectModal({ visible, onClose, onSave }: SaveProjectModalProps) {
    const [name, setName] = useState('');
    const [note, setNote] = useState('');
    const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
    const [newItemText, setNewItemText] = useState('');

    const handleAddItem = () => {
        if (!newItemText.trim()) return;
        setChecklistItems([
            ...checklistItems,
            { id: Date.now().toString(), text: newItemText.trim(), checked: false }
        ]);
        setNewItemText('');
    };

    const handleRemoveItem = (id: string) => {
        setChecklistItems(items => items.filter(item => item.id !== id));
    };

    const handleSave = () => {
        if (!name.trim()) return;
        onSave(name, note, checklistItems);
        setName('');
        setNote('');
        setChecklistItems([]);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>
                    <View style={styles.modalContent}>
                        <ThemedText type="subtitle" style={styles.title}>Save Estimate</ThemedText>

                        <Input
                            label="Project Name"
                            placeholder="e.g. Backyard Patio"
                            value={name}
                            onChangeText={setName}
                            autoFocus
                        />

                        <Input
                            label="Job Notes (Optional)"
                            value={note}
                            onChangeText={setNote}
                            placeholder="e.g. Access via side gate"
                            multiline
                            numberOfLines={3}
                        />

                        <ThemedText type="subtitle" style={styles.sectionTitle}>Checklist (Optional)</ThemedText>
                        <View style={styles.addItemRow}>
                            <Input
                                value={newItemText}
                                onChangeText={setNewItemText}
                                placeholder="Add item (e.g. Sealer)"
                                containerStyle={{ flex: 1, marginBottom: 0 }}
                                label="Add Item"
                            />
                            <Button title="Add" onPress={handleAddItem} variant="secondary" style={styles.addButton} />
                        </View>

                        {checklistItems.length > 0 && (
                            <ScrollView style={styles.checklist} nestedScrollEnabled>
                                {checklistItems.map(item => (
                                    <View key={item.id} style={styles.checklistItem}>
                                        <ThemedText style={{ flex: 1 }}>{item.text}</ThemedText>
                                        <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                                            <ThemedText style={{ color: '#ff4444' }}>Remove</ThemedText>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        )}

                        <View style={styles.actions}>
                            <Button title="Cancel" onPress={onClose} variant="secondary" style={styles.button} />
                            <Button title="Save" onPress={handleSave} disabled={!name.trim()} style={styles.button} />
                        </View>
                    </View>
                </View>
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
    sectionTitle: {
        marginTop: 16,
        marginBottom: 8,
    },
    addItemRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
        marginBottom: 12,
    },
    addButton: {
        width: 80,
    },
    checklist: {
        maxHeight: 150,
        marginBottom: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 8,
    },
    checklistItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
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
