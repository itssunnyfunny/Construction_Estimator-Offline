import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { PaywallModal } from '@/components/PaywallModal';
import { SettingsModal } from '@/components/SettingsModal';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { usePro } from '@/context/ProContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { StorageService } from '@/services/storage';
import { Project } from '@/types';

export default function ProjectsScreen() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [paywallVisible, setPaywallVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'concrete' | 'flooring' | 'paint'>('all');
    const router = useRouter();
    const iconColor = useThemeColor({}, 'icon');
    const { isPro } = usePro();

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

    const duplicateProject = async (id: string) => {
        if (!isPro) {
            setPaywallVisible(true);
            return;
        }

        try {
            await StorageService.duplicateProject(id);
            Alert.alert("Success", "Estimate duplicated.");
            loadProjects();
        } catch (e) {
            Alert.alert("Error", "Failed to duplicate estimate.");
        }
    };

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || p.type === filterType;
        return matchesSearch && matchesType;
    });

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
                    <View style={styles.actions}>
                        <TouchableOpacity onPress={() => duplicateProject(item.id)} style={styles.actionButton}>
                            <IconSymbol name="doc.on.doc" size={20} color="#0a7ea4" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteProject(item.id)} style={styles.actionButton}>
                            <IconSymbol name="trash.fill" size={20} color="#ff4444" />
                        </TouchableOpacity>
                    </View>
                </View>
                <ThemedText numberOfLines={2} style={styles.summary}>
                    {getSummary(item)}
                </ThemedText>
            </Card>
        </TouchableOpacity >
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

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <IconSymbol name="magnifyingglass" size={20} color="#666" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search estimates..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <IconSymbol name="xmark.circle.fill" size={16} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={styles.filtersContent}>
                    {(['all', 'concrete', 'flooring', 'paint'] as const).map(type => (
                        <TouchableOpacity
                            key={type}
                            style={[styles.filterChip, filterType === type && styles.filterChipActive]}
                            onPress={() => setFilterType(type)}
                        >
                            <ThemedText style={[styles.filterLabel, filterType === type && styles.filterLabelActive]}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {filteredProjects.length === 0 ? (
                <View style={styles.emptyState}>
                    <ThemedText type="subtitle">No saved estimates yet</ThemedText>
                    <ThemedText style={styles.emptyText}>
                        Save a job to reuse or share later.
                    </ThemedText>
                </View>
            ) : (
                <FlatList
                    data={filteredProjects}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                />
            )}
            <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
            <PaywallModal
                visible={paywallVisible}
                onClose={() => setPaywallVisible(false)}
                variant="duplicate"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        padding: 16,
        paddingBottom: 8,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 12,
        borderRadius: 10,
        height: 40,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
    },
    filters: {
        flexDirection: 'row',
    },
    filtersContent: {
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#eee',
    },
    filterChipActive: {
        backgroundColor: '#0a7ea4',
        borderColor: '#0a7ea4',
    },
    filterLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    filterLabelActive: {
        color: 'white',
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
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        padding: 8,
        marginLeft: 4,
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
