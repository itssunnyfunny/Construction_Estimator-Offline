import { ConcreteCalculator } from '@/components/calculators/ConcreteCalculator';
import { FlooringCalculator } from '@/components/calculators/FlooringCalculator';
import { PaintCalculator } from '@/components/calculators/PaintCalculator';
import { PaywallModal, PaywallVariant } from '@/components/PaywallModal';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Input } from '@/components/ui/Input';
import { usePro } from '@/context/ProContext';
import { PdfService } from '@/services/pdf';
import { StorageService } from '@/services/storage';
import { ChecklistItem, Project } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ProjectDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [paywallVisible, setPaywallVisible] = useState(false);
    const [paywallVariant, setPaywallVariant] = useState<PaywallVariant>('default');

    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState<any>(null);
    const [editedResult, setEditedResult] = useState<any>(null);
    const [editedNote, setEditedNote] = useState('');
    const [editedName, setEditedName] = useState('');

    const { isPro } = usePro();

    useEffect(() => {
        loadProject();
    }, [id]);

    const loadProject = async () => {
        if (typeof id === 'string') {
            const p = await StorageService.getProject(id);
            setProject(p);
            setChecklist(p?.checklist || []);
            setEditedData(p?.data);
            setEditedResult(p?.result);
            setEditedNote(p?.note || '');
            setEditedName(p?.name || '');
        }
        setLoading(false);
    };

    const toggleChecklistItem = async (itemId: string) => {
        if (!project) return;
        const newChecklist = checklist.map(item =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
        );
        setChecklist(newChecklist);
        const updatedProject = { ...project, checklist: newChecklist };
        setProject(updatedProject);
        await StorageService.saveProject(updatedProject);
    };

    const handleEdit = () => {
        if (!project) return;
        if (isPro) {
            // Initialize draft state
            setEditedData(project.data);
            setEditedResult(project.result);
            setEditedNote(project.note || '');
            setEditedName(project.name);
            setIsEditing(true);
        } else {
            setPaywallVariant('editing');
            setPaywallVisible(true);
        }
    };

    const handleDuplicate = async () => {
        if (!project) return;
        if (isPro) {
            try {
                await StorageService.duplicateProject(project.id);
                Alert.alert("Success", "Estimate duplicated.", [
                    { text: "OK", onPress: () => router.push('/(tabs)/projects') }
                ]);
            } catch (e) {
                Alert.alert("Error", "Failed to duplicate estimate.");
            }
        } else {
            setPaywallVariant('duplicate');
            setPaywallVisible(true);
        }
    };

    const handleExport = async () => {
        if (!project) return;
        if (isPro) {
            await PdfService.exportProject(project);
        } else {
            setPaywallVariant('export');
            setPaywallVisible(true);
        }
    };

    const handleSave = async () => {
        if (!project || !editedResult) return;

        const updatedProject = {
            ...project,
            name: editedName,
            data: editedData,
            result: editedResult,
            note: editedNote,
        };

        try {
            await StorageService.saveProject(updatedProject);
            setProject(updatedProject);
            setIsEditing(false);
            Alert.alert("Success", "Changes saved.");
        } catch (e) {
            Alert.alert("Error", "Failed to save changes.");
        }
    };

    const deleteProject = () => {
        Alert.alert("Delete Project", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    if (project) {
                        await StorageService.deleteProject(project.id);
                        router.back();
                    }
                }
            }
        ]);
    };

    if (loading) {
        return <View style={styles.center}><ActivityIndicator /></View>;
    }

    if (!project) {
        return <View style={styles.center}><ThemedText>Project not found</ThemedText></View>;
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {!isEditing ? (
                // VIEW MODE
                <>
                    <Card>
                        <ThemedText type="title" style={styles.title}>{project.name}</ThemedText>
                        <ThemedText style={styles.date}>Created: {new Date(project.createdAt).toLocaleDateString()}</ThemedText>
                        <ThemedText style={styles.type}>Type: {project.type.toUpperCase()}</ThemedText>
                    </Card>

                    <Card>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>Inputs</ThemedText>
                        {Object.entries(project.data).map(([key, value]) => (
                            <View key={key} style={styles.row}>
                                <ThemedText style={styles.label}>{key}:</ThemedText>
                                <ThemedText>{String(value)}</ThemedText>
                            </View>
                        ))}
                    </Card>

                    <Card style={styles.resultCard}>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>Results</ThemedText>
                        {Object.entries(project.result).map(([key, value]) => (
                            <View key={key} style={styles.row}>
                                <ThemedText style={styles.label}>{key}:</ThemedText>
                                <ThemedText type="defaultSemiBold">{typeof value === 'number' ? value.toFixed(2) : String(value)}</ThemedText>
                            </View>
                        ))}
                    </Card>

                    {project.note ? (
                        <Card>
                            <ThemedText type="subtitle" style={styles.sectionTitle}>Notes</ThemedText>
                            <ThemedText>{project.note}</ThemedText>
                        </Card>
                    ) : null}

                    {checklist.length > 0 && (
                        <Card>
                            <ThemedText type="subtitle" style={styles.sectionTitle}>Checklist</ThemedText>
                            {checklist.map(item => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.checklistItem}
                                    onPress={() => toggleChecklistItem(item.id)}
                                >
                                    <IconSymbol
                                        name={item.checked ? "checkmark.circle.fill" : "circle"}
                                        size={24}
                                        color={item.checked ? "#4CAF50" : "#ccc"}
                                    />
                                    <ThemedText style={[
                                        styles.checklistText,
                                        item.checked && styles.checklistTextChecked
                                    ]}>
                                        {item.text}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </Card>
                    )}

                    <View style={styles.actions}>
                        <Button
                            title="Edit"
                            onPress={handleEdit}
                            variant="secondary"
                            style={{ flex: 1 }}
                            icon={!isPro ? "lock.fill" : "pencil"}
                        />
                        <Button
                            title="Copy"
                            onPress={handleDuplicate}
                            variant="secondary"
                            style={{ flex: 1 }}
                            icon={!isPro ? "lock.fill" : "doc.on.doc"}
                        />
                    </View>
                    <View style={[styles.actions, { marginTop: 12 }]}>
                        <Button
                            title="Export PDF"
                            onPress={handleExport}
                            style={{ flex: 1 }}
                            icon={!isPro ? "lock.fill" : "square.and.arrow.up"}
                        />
                        <Button title="Delete" onPress={deleteProject} variant="danger" style={{ flex: 1 }} icon="trash" />
                    </View>
                </>
            ) : (
                // EDIT MODE
                <>
                    <Card style={{ marginBottom: 16 }}>
                        <ThemedText type="title" style={{ marginBottom: 16 }}>Editing Estimate</ThemedText>
                        <Input
                            label="Project Name"
                            value={editedName}
                            onChangeText={setEditedName}
                        />
                    </Card>

                    {project.type === 'concrete' && (
                        <ConcreteCalculator
                            key="concrete-edit"
                            isEditing={true}
                            initialData={project.data}
                            onStateChange={setEditedData}
                            onResultChange={setEditedResult}
                        />
                    )}
                    {project.type === 'paint' && (
                        <PaintCalculator
                            key="paint-edit"
                            isEditing={true}
                            initialData={project.data}
                            onStateChange={setEditedData}
                            onResultChange={setEditedResult}
                        />
                    )}
                    {project.type === 'flooring' && (
                        <FlooringCalculator
                            key="flooring-edit"
                            isEditing={true}
                            initialData={project.data}
                            onStateChange={setEditedData}
                            onResultChange={setEditedResult}
                        />
                    )}

                    <Card style={{ marginTop: 16 }}>
                        <Input
                            label="Notes"
                            value={editedNote}
                            onChangeText={setEditedNote}
                            multiline
                            placeholder="Add notes..."
                        />
                    </Card>

                    <View style={styles.actions}>
                        <Button title="Save Changes" onPress={handleSave} style={{ flex: 1 }} />
                        <Button title="Cancel" onPress={() => setIsEditing(false)} variant="secondary" style={{ flex: 1 }} />
                    </View>
                </>
            )}

            <PaywallModal
                visible={paywallVisible}
                onClose={() => setPaywallVisible(false)}
                variant={paywallVariant}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingBottom: 40,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        marginBottom: 4,
    },
    date: {
        opacity: 0.6,
        marginBottom: 4,
    },
    type: {
        fontWeight: '600',
        color: '#0a7ea4',
    },
    sectionTitle: {
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 4,
    },
    label: {
        fontWeight: '600',
        opacity: 0.8,
    },
    resultCard: {
        backgroundColor: '#E6F4FE',
        borderColor: '#0a7ea4',
    },
    actions: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 24,
    },
    checklistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        gap: 12,
    },
    checklistText: {
        fontSize: 16,
        flex: 1,
    },
    checklistTextChecked: {
        textDecorationLine: 'line-through',
        opacity: 0.6,
    }
});
