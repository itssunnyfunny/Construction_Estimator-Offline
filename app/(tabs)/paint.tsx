import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { PaywallModal } from '@/components/PaywallModal';
import { SaveProjectModal } from '@/components/SaveProjectModal';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { usePro } from '@/context/ProContext';
import { useSettings } from '@/context/SettingsContext';
import { StorageService } from '@/services/storage';

export default function PaintScreen() {
    const { settings } = useSettings();
    const [area, setArea] = useState('');
    const [coverage, setCoverage] = useState('350');
    const [coats, setCoats] = useState('2');
    const [unit, setUnit] = useState<'ft' | 'm'>(settings.defaultUnit);

    useEffect(() => {
        setUnit(settings.defaultUnit);
    }, [settings]);

    const [saveModalVisible, setSaveModalVisible] = useState(false);
    const [paywallVisible, setPaywallVisible] = useState(false);
    const [paywallVariant, setPaywallVariant] = useState<import('@/components/PaywallModal').PaywallVariant>('default');

    const [result, setResult] = useState<{
        paintRequired: number;
    } | null>(null);

    const router = useRouter();
    const { isPro } = usePro();

    const calculate = () => {
        const a = parseFloat(area);
        const c = parseFloat(coverage);
        const n = parseFloat(coats);

        if (isNaN(a) || isNaN(c) || isNaN(n)) {
            Alert.alert('Invalid Input', 'Please enter valid numbers.');
            return;
        }

        if (c === 0) {
            Alert.alert('Error', 'Coverage cannot be zero.');
            return;
        }

        const required = (a * n) / c;

        setResult({
            paintRequired: required,
        });
    };

    const clear = () => {
        setArea('');
        setCoverage(unit === 'ft' ? '350' : '10');
        setCoats('2');
        setResult(null);
    };

    const toggleUnit = () => {
        setUnit(prev => {
            const next = prev === 'ft' ? 'm' : 'ft';
            if (next === 'ft') setCoverage('350');
            else setCoverage('10');
            return next;
        });
        setResult(null);
    };

    const onSavePress = async () => {
        if (!result) return;
        if (isPro) {
            setSaveModalVisible(true);
            return;
        }

        const projects = await StorageService.getProjects();
        if (projects.length < 5) {
            setSaveModalVisible(true);
        } else {
            setPaywallVariant('saveLimit');
            setPaywallVisible(true);
        }
    };

    const handleSave = async (name: string, note: string) => {
        if (!result) return;

        const project = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            name,
            type: 'paint' as const,
            createdAt: Date.now(),
            data: { area, coverage, coats, unit },
            result,
            note,
        };

        try {
            await StorageService.saveProject(project);
            Alert.alert('Success', 'Project saved!');
            router.push('/(tabs)/projects');
        } catch (e) {
            Alert.alert('Error', 'Failed to save project.');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <Stack.Screen options={{ title: 'Paint' }} />

                <View style={styles.header}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <ThemedText type="title">Paint Calculator</ThemedText>
                    </View>
                    <Button
                        title={unit === 'ft' ? 'Imperial (gal)' : 'Metric (L)'}
                        onPress={toggleUnit}
                        variant="secondary"
                        style={styles.unitButton}
                    />
                </View>

                <Card>
                    <Input
                        label={`Total Wall Area (${unit === 'ft' ? 'sq ft' : 'sq m'})`}
                        value={area}
                        onChangeText={setArea}
                        keyboardType="numeric"
                        placeholder="0.0"
                        unit={unit === 'ft' ? 'sq ft' : 'sq m'}
                    />

                    <Input
                        label={`Coverage per ${unit === 'ft' ? 'Gallon' : 'Liter'}`}
                        value={coverage}
                        onChangeText={setCoverage}
                        keyboardType="numeric"
                        placeholder={unit === 'ft' ? '350' : '10'}
                        unit={unit === 'ft' ? 'sq ft/gal' : 'm²/L'}
                    />
                    <ThemedText type="default" style={styles.hint}>
                        {unit === 'ft' ? 'Standard: 350-400 sq ft/gal' : 'Standard: 10-12 m²/L'}
                    </ThemedText>

                    <Input
                        label="Number of Coats"
                        value={coats}
                        onChangeText={setCoats}
                        keyboardType="numeric"
                        placeholder="2"
                    />

                    <Button title="Quick Estimate" onPress={calculate} />
                    <Button title="Clear" onPress={clear} variant="secondary" />
                </Card>

                {result && (
                    <Card style={styles.resultCard}>
                        <ThemedText type="subtitle" style={styles.resultTitle}>Results</ThemedText>

                        <View style={styles.resultRow}>
                            <ThemedText>Paint Needed:</ThemedText>
                            <ThemedText type="title" style={{ color: '#0a7ea4' }}>
                                {result.paintRequired.toFixed(2)} {unit === 'ft' ? 'gallons' : 'liters'}
                            </ThemedText>
                        </View>

                        <View style={styles.resultRow}>
                            <ThemedText style={{ fontSize: 14, opacity: 0.7 }}>
                                (based on {coats} coats)
                            </ThemedText>
                        </View>

                        <Button title="Save Project" onPress={onSavePress} style={{ marginTop: 16 }} variant="secondary" />
                    </Card>
                )}

                <SaveProjectModal
                    visible={saveModalVisible}
                    onClose={() => setSaveModalVisible(false)}
                    onSave={handleSave}
                />

                <PaywallModal
                    visible={paywallVisible}
                    onClose={() => setPaywallVisible(false)}
                    variant={paywallVariant}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    unitButton: {
        height: 36,
        marginVertical: 0,
        minWidth: 100,
    },
    hint: {
        fontSize: 12,
        color: '#666',
        marginTop: -12,
        marginBottom: 12,
        marginLeft: 4,
    },
    resultCard: {
        backgroundColor: '#E6F4FE',
        borderColor: '#0a7ea4',
    },
    resultTitle: {
        marginBottom: 16,
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        alignItems: 'center',
    },
});
