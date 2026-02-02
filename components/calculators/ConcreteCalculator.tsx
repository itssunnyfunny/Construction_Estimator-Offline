import { PaywallModal, PaywallVariant } from '@/components/PaywallModal';
import { SaveProjectModal } from '@/components/SaveProjectModal';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { usePro } from '@/context/ProContext';
import { useSettings } from '@/context/SettingsContext';
import { StorageService } from '@/services/storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

type ConcreteCalculatorProps = {
    initialData?: {
        length: string;
        width: string;
        depth: string;
        waste: string;
        unit: 'ft' | 'm';
    };
    isEditing?: boolean;
    onResultChange?: (result: { rawVolume: number; totalVolume: number } | null) => void;
    onStateChange?: (data: { length: string; width: string; depth: string; waste: string; unit: 'ft' | 'm' }) => void;
};

export function ConcreteCalculator({ initialData, isEditing = false, onResultChange, onStateChange }: ConcreteCalculatorProps) {
    const { settings } = useSettings();
    const router = useRouter();
    const { isPro } = usePro();

    const [length, setLength] = useState(initialData?.length || '');
    const [width, setWidth] = useState(initialData?.width || '');
    const [depth, setDepth] = useState(initialData?.depth || '');
    const [waste, setWaste] = useState(initialData?.waste || settings.defaultWaste);
    const [unit, setUnit] = useState<'ft' | 'm'>(initialData?.unit || settings.defaultUnit);

    const [result, setResult] = useState<{ rawVolume: number; totalVolume: number } | null>(null);

    const [saveModalVisible, setSaveModalVisible] = useState(false);
    const [paywallVisible, setPaywallVisible] = useState(false);
    const [paywallVariant, setPaywallVariant] = useState<PaywallVariant>('default');

    useEffect(() => {
        if (!initialData) {
            setWaste(settings.defaultWaste);
            setUnit(settings.defaultUnit);
        }
    }, [settings, initialData]);

    useEffect(() => {
        if (isEditing) {
            calculate();
        }
    }, [length, width, depth, waste, unit]); // Auto-calculate in edit mode

    // Broadcast state changes
    useEffect(() => {
        if (onStateChange) {
            onStateChange({ length, width, depth, waste, unit });
        }
    }, [length, width, depth, waste, unit]);

    const calculate = () => {
        const l = parseFloat(length);
        const w = parseFloat(width);
        const d = parseFloat(depth);
        const wastePct = parseFloat(waste);

        if (isNaN(l) || isNaN(w) || isNaN(d)) {
            // In edit mode (live), don't alert effectively, or handle gracefully
            if (!isEditing) Alert.alert('Invalid Input', 'Please enter valid numbers for dimensions.');
            setResult(null);
            if (onResultChange) onResultChange(null);
            return;
        }

        const rawVol = l * w * d;
        const wasteMultiplier = 1 + (isNaN(wastePct) ? 0 : wastePct) / 100;
        const totalVol = rawVol * wasteMultiplier;

        const res = {
            rawVolume: rawVol,
            totalVolume: totalVol,
        };
        setResult(res);
        if (onResultChange) onResultChange(res);
    };

    const clear = () => {
        setLength('');
        setWidth('');
        setDepth('');
        setWaste(settings.defaultWaste);
        setResult(null);
        if (onResultChange) onResultChange(null);
    };

    const toggleUnit = () => {
        setUnit(prev => prev === 'ft' ? 'm' : 'ft');
        setResult(null);
        if (onResultChange) onResultChange(null);
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
            type: 'concrete' as const,
            createdAt: Date.now(),
            data: { length, width, depth, waste, unit },
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
        <View>
            <View style={styles.header}>
                <View style={{ flex: 1, marginRight: 8 }}>
                    <ThemedText type="title">Concrete Calculator</ThemedText>
                </View>
                <Button
                    title={unit === 'ft' ? 'Feet' : 'Meters'}
                    onPress={toggleUnit}
                    variant="secondary"
                    style={styles.unitButton}
                />
            </View>

            <Card>
                <Input
                    label={`Slab Length (${unit})`}
                    value={length}
                    onChangeText={setLength}
                    keyboardType="numeric"
                    placeholder="0.0"
                    unit={unit}
                />
                <Input
                    label={`Slab Width (${unit})`}
                    value={width}
                    onChangeText={setWidth}
                    keyboardType="numeric"
                    placeholder="0.0"
                    unit={unit}
                />
                <Input
                    label={`Slab Thickness (${unit})`}
                    value={depth}
                    onChangeText={setDepth}
                    keyboardType="numeric"
                    placeholder="0.0"
                    unit={unit}
                />
                <Input
                    label="Extra for safety (%)"
                    value={waste}
                    onChangeText={setWaste}
                    keyboardType="numeric"
                    placeholder="5"
                    unit="%"
                />
                <ThemedText style={{ fontSize: 12, color: '#666', marginTop: -12, marginBottom: 12, marginLeft: 4 }}>
                    Adds buffer for spillage & uneven ground
                </ThemedText>

                {!isEditing && (
                    <>
                        <Button title="Quick Estimate" onPress={calculate} />
                        <Button title="Clear" onPress={clear} variant="secondary" />
                    </>
                )}
            </Card>

            {result && (
                <>
                    <ThemedText style={styles.unitBanner}>
                        {unit === 'ft'
                            ? 'Slab: ft | Thickness: in'
                            : 'Slab: m | Thickness: cm'}
                    </ThemedText>
                    <Card style={styles.resultCard}>
                        <ThemedText type="subtitle" style={styles.resultTitle}>Concrete to Order (With Extra)</ThemedText>
                        <ThemedText type="title" style={styles.resultValue}>
                            {result.totalVolume.toFixed(2)} {unit === 'ft' ? 'ft³' : 'm³'}
                        </ThemedText>

                        {unit === 'ft' && (
                            <View style={[styles.conversionRow, { borderTopWidth: 0, marginTop: -8, marginBottom: 16, paddingTop: 0 }]}>
                                <ThemedText type="default" style={{ color: '#0a7ea4', fontWeight: '600' }}>
                                    = {(result.totalVolume / 27).toFixed(2)} yd³ (Cubic Yards)
                                </ThemedText>
                            </View>
                        )}

                        <View style={[styles.resultRow, { marginTop: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(10, 126, 164, 0.2)' }]}>
                            <ThemedText style={{ fontSize: 14 }}>Concrete Needed (Exact):</ThemedText>
                            <ThemedText type="defaultSemiBold" style={{ color: '#666' }}>
                                {result.rawVolume.toFixed(2)} {unit === 'ft' ? 'ft³' : 'm³'}
                            </ThemedText>
                        </View>

                        {!isEditing && (
                            <Button title="Save Project" onPress={onSavePress} style={{ marginTop: 16 }} variant="secondary" />
                        )}
                    </Card>
                </>
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
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    unitButton: {
        height: 36,
        marginVertical: 0,
        minWidth: 80,
    },
    resultCard: {
        backgroundColor: '#E6F4FE', // Light blue tint
        borderColor: '#0a7ea4',
    },
    resultTitle: {
        marginBottom: 16,
    },
    resultValue: {
        color: '#0a7ea4',
        textAlign: 'center',
        marginVertical: 8,
    },
    unitBanner: {
        textAlign: 'center',
        marginBottom: 8,
        fontSize: 12,
        opacity: 0.6,
        fontStyle: 'italic',
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        alignItems: 'center',
    },
    conversionRow: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        alignItems: 'flex-end',
        marginBottom: 12,
    }
});
