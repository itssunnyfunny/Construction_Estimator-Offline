import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { SettingsModal } from '@/components/SettingsModal';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { StorageService } from '@/services/storage';
import { Project } from '@/types';

export default function ProjectsScreen() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const router = useRouter();
    const iconColor = useThemeColor({}, 'icon');

    useFocusEffect(
        useCallback(() => {
            loadProjects();
        }, [])
    );

    const loadProjects = async () => {
        const data = await StorageService.getProjects();
        setProjects(data);
    };

    const deleteProject = (id: string) => {
        Alert.alert(
            "Delete Project",
            "Are you sure you want to delete this project?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await StorageService.deleteProject(id);
                        loadProjects();
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: Project }) => (
        <TouchableOpacity onPress={() => router.push(`/project/${item.id}` as any)}>
            <Card style={styles.projectCard}>
                <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                        <IconSymbol
                            name={
                                item.type === 'concrete' ? 'square.stack.3d.up.fill' :
                                    item.type === 'flooring' ? 'square.grid.2x2.fill' :
                                        'paintbrush.fill'
                            }
                            size={24}
                            color="#0a7ea4"
                        />
                    </View>
                    <View style={styles.textContainer}>
                        <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                        <ThemedText style={styles.date}>
                            {new Date(item.createdAt).toLocaleDateString()}
                        </ThemedText>
                    </View>
                    <TouchableOpacity onPress={() => deleteProject(item.id)} style={styles.deleteButton}>
                        <IconSymbol name="trash.fill" size={20} color="#ff4444" />
                    </TouchableOpacity>
                </View>
                <ThemedText numberOfLines={2} style={styles.summary}>
                    {getSummary(item)}
                </ThemedText>
            </Card>
        </TouchableOpacity>
    );

    const getSummary = (project: Project) => {
        if (project.type === 'concrete') {
            return `${project.result.totalVolume.toFixed(2)} ${project.data.unit === 'ft' ? 'ft³' : 'm³'}`;
        } else if (project.type === 'flooring') {
            return `${project.result.totalTiles} tiles (${project.result.totalArea.toFixed(2)} area)`;
        } else if (project.type === 'paint') {
            return `${project.result.paintRequired.toFixed(2)} ${project.data.unit === 'ft' ? 'gal' : 'L'}`;
        }
        return '';
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Saved Estimates',
                    headerRight: () => (
                        <TouchableOpacity onPress={() => setSettingsVisible(true)}>
                            <IconSymbol name="gear" size={24} color="#007AFF" />
                        </TouchableOpacity>
                    ),
                }}
            />

            {projects.length === 0 ? (
                <View style={styles.emptyState}>
                    <ThemedText type="subtitle">No saved estimates yet</ThemedText>
                    <ThemedText style={styles.emptyText}>
                        Save a job to reuse or share later.
                    </ThemedText>
                </View>
            ) : (
                <FlatList
                    data={projects}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                />
            )}
            <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 16,
    },
    projectCard: {
        padding: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E6F4FE',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    date: {
        fontSize: 12,
        opacity: 0.6,
    },
    deleteButton: {
        padding: 8,
    },
    summary: {
        marginTop: 4,
        opacity: 0.8,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 8,
        opacity: 0.7,
    }
});
