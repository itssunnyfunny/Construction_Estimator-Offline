import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';

import { PaywallModal } from '@/components/PaywallModal';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { usePro } from '@/context/ProContext';
import { PdfService } from '@/services/pdf';
import { StorageService } from '@/services/storage';
import { Project } from '@/types';

export default function ProjectDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [paywallVisible, setPaywallVisible] = useState(false);

    const { isPro } = usePro();

    useEffect(() => {
        loadProject();
    }, [id]);

    const loadProject = async () => {
        if (typeof id === 'string') {
            const p = await StorageService.getProject(id);
            setProject(p);
        }
        setLoading(false);
    };

    const handleExport = async () => {
        if (!project) return;
        if (isPro) {
            await PdfService.exportProject(project);
        } else {
            setPaywallVisible(true);
        }
    };

    const deleteProject = () => {
        Alert.alert(
            "Delete Project",
            "Are you sure?",
            [
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
            ]
        );
    };

    if (loading) {
        return <View style={styles.center}><ActivityIndicator /></View>;
    }

    if (!project) {
        return <View style={styles.center}><ThemedText>Project not found</ThemedText></View>;
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
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

            <View style={styles.actions}>
                <Button title="Export PDF" onPress={handleExport} style={{ flex: 1 }} />
                <Button title="Delete" onPress={deleteProject} variant="danger" style={{ flex: 1 }} />
            </View>

            <PaywallModal
                visible={paywallVisible}
                onClose={() => setPaywallVisible(false)}
                featureName="Exporting PDF"
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
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
    }
});
