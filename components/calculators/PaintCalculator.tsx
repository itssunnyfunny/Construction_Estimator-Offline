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

type PaintCalculatorProps = {
    initialData?: {
        area: string;
        coverage: string;
        coats: string;
        unit: 'ft' | 'm';
    };
    isEditing?: boolean;
    onResultChange?: (result: { paintRequired: number } | null) => void;
    onStateChange?: (data: { area: string; coverage: string; coats: string; unit: 'ft' | 'm' }) => void;
    onCalculate?: () => void;
};

export function PaintCalculator({ initialData, isEditing = false, onResultChange, onStateChange, onCalculate }: PaintCalculatorProps) {
    const { settings } = useSettings();
    const router = useRouter();
    const { isPro } = usePro();

    const [area, setArea] = useState(initialData?.area || '');
    const [coverage, setCoverage] = useState(initialData?.coverage || '350');
    const [coats, setCoats] = useState(initialData?.coats || '2');
    const [unit, setUnit] = useState<'ft' | 'm'>(initialData?.unit || settings.defaultUnit);

    const [result, setResult] = useState<{ paintRequired: number } | null>(null);

    const [saveModalVisible, setSaveModalVisible] = useState(false);
    const [paywallVisible, setPaywallVisible] = useState(false);
    const [paywallVariant, setPaywallVariant] = useState<PaywallVariant>('default');

    useEffect(() => {
        if (!initialData) {
            setUnit(settings.defaultUnit);
        }
    }, [settings, initialData]);

    useEffect(() => {
        if (!initialData && !isEditing) {
            setCoverage(unit === 'ft' ? '350' : '10');
        }
    }, [unit]); // Only reset default coverage on unit toggle in create mode?

    useEffect(() => {
        if (isEditing) {
            calculate();
        }
    }, [area, coverage, coats, unit]);

    useEffect(() => {
        if (onStateChange) onStateChange({ area, coverage, coats, unit });
    }, [area, coverage, coats, unit]);

    const calculate = () => {
        const a = parseFloat(area);
        const c = parseFloat(coverage);
        const n = parseFloat(coats);

        if (isNaN(a) || isNaN(c) || isNaN(n)) {
            if (!isEditing) Alert.alert('Invalid Input', 'Please enter valid numbers.');
            setResult(null);
            if (onResultChange) onResultChange(null);
            return;
        }

        if (c === 0) {
            if (!isEditing) Alert.alert('Error', 'Coverage cannot be zero.');
            setResult(null);
            if (onResultChange) onResultChange(null);
            return;
        }

        const required = (a * n) / c;

        const res = { paintRequired: required };
        setResult(res);
        if (onResultChange) onResultChange(res);

        if (onCalculate) {
            setTimeout(() => onCalculate(), 100);
        }
    };

    const clear = () => {
        setArea('');
        setCoverage(unit === 'ft' ? '350' : '10');
        setCoats('2');
        setResult(null);
        if (onResultChange) onResultChange(null);
    };

    const toggleUnit = () => {
        setUnit(prev => {
            const next = prev === 'ft' ? 'm' : 'ft';
            if (next === 'ft') setCoverage('350');
            else setCoverage('10');
            return next;
        });
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
        <View>
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

                {!isEditing && (
                    <>
                        <Button title="Quick Estimate" onPress={calculate} />
                        <Button title="Clear" onPress={clear} variant="secondary" />
                    </>
                )}
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

                    {!isEditing && (
                        <Button title="Save Project" onPress={onSavePress} style={{ marginTop: 16 }} variant="secondary" />
                    )}
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
