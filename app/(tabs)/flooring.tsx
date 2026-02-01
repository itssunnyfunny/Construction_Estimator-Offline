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

export default function FlooringScreen() {
    const { settings } = useSettings();
    const [roomLength, setRoomLength] = useState('');
    const [roomWidth, setRoomWidth] = useState('');
    const [tileLength, setTileLength] = useState('');
    const [tileWidth, setTileWidth] = useState('');
    const [waste, setWaste] = useState(settings.defaultWaste);
    const [unit, setUnit] = useState<'ft' | 'm'>(settings.defaultUnit);

    useEffect(() => {
        setWaste(settings.defaultWaste);
        setUnit(settings.defaultUnit);
    }, [settings]);

    const [saveModalVisible, setSaveModalVisible] = useState(false);
    const [paywallVisible, setPaywallVisible] = useState(false);

    const [result, setResult] = useState<{
        tilesRequired: number;
        totalArea: number;
        totalTiles: number;
        tileArea: number;
    } | null>(null);

    const router = useRouter();
    const { isPro } = usePro();

    const calculate = () => {
        const rL = parseFloat(roomLength);
        const rW = parseFloat(roomWidth);
        const tL = parseFloat(tileLength);
        const tW = parseFloat(tileWidth);
        const wastePct = parseFloat(waste);

        if (isNaN(rL) || isNaN(rW) || isNaN(tL) || isNaN(tW)) {
            Alert.alert('Invalid Input', 'Please enter valid dimensions.');
            return;
        }

        // Calculate Areas
        // Room Area
        const roomArea = rL * rW; // sq ft or sq m

        // Tile Area
        let tileArea = 0;
        if (unit === 'ft') {
            // Input in inches, convert to sq ft
            // (tL / 12) * (tW / 12)
            tileArea = (tL / 12) * (tW / 12);
        } else {
            // Input in cm, convert to sq m
            // (tL / 100) * (tW / 100)
            tileArea = (tL / 100) * (tW / 100);
        }

        if (tileArea === 0) {
            Alert.alert('Error', 'Tile area cannot be zero.');
            return;
        }

        // Tiles Required (Ceiling)
        const rawTiles = Math.ceil(roomArea / tileArea);

        // Add Waste
        const wasteMultiplier = 1 + (isNaN(wastePct) ? 0 : wastePct) / 100;
        const finalTiles = Math.ceil(rawTiles * wasteMultiplier);

        setResult({
            tilesRequired: rawTiles,
            totalTiles: finalTiles,
            totalArea: roomArea,
            tileArea: tileArea,
        });
    };

    const clear = () => {
        setRoomLength('');
        setRoomWidth('');
        setTileLength('');
        setTileWidth('');
        setWaste(settings.defaultWaste);
        setResult(null);
    };

    const toggleUnit = () => {
        setUnit(prev => prev === 'ft' ? 'm' : 'ft');
        setResult(null);
    };

    const onSavePress = () => {
        if (!result) return;
        if (isPro) {
            setSaveModalVisible(true);
        } else {
            setPaywallVisible(true);
        }
    };

    const handleSave = async (name: string, note: string) => {
        if (!result) return;

        const project = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            name,
            type: 'flooring' as const,
            createdAt: Date.now(),
            data: { roomLength, roomWidth, tileLength, tileWidth, waste, unit },
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
                <Stack.Screen options={{ title: 'Flooring' }} />

                <View style={styles.header}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <ThemedText type="title">Flooring Calculator</ThemedText>
                    </View>
                    <Button
                        title={unit === 'ft' ? 'Imperial (ft/in)' : 'Metric (m/cm)'}
                        onPress={toggleUnit}
                        variant="secondary"
                        style={styles.unitButton}
                    />
                </View>

                <Card>
                    <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Room Dimensions</ThemedText>
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Input
                                label={`Room Length (${unit})`}
                                value={roomLength}
                                onChangeText={setRoomLength}
                                keyboardType="numeric"
                                placeholder="0.0"
                                unit={unit}
                            />
                        </View>
                        <View style={{ width: 12 }} />
                        <View style={styles.col}>
                            <Input
                                label={`Room Width (${unit})`}
                                value={roomWidth}
                                onChangeText={setRoomWidth}
                                keyboardType="numeric"
                                placeholder="0.0"
                                unit={unit}
                            />
                        </View>
                    </View>

                    <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Tile Dimensions</ThemedText>
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Input
                                label={`Tile Length (${unit === 'ft' ? 'in' : 'cm'})`}
                                value={tileLength}
                                onChangeText={setTileLength}
                                keyboardType="numeric"
                                placeholder="0.0"
                                unit={unit === 'ft' ? 'in' : 'cm'}
                            />
                        </View>
                        <View style={{ width: 12 }} />
                        <View style={styles.col}>
                            <Input
                                label={`Tile Width (${unit === 'ft' ? 'in' : 'cm'})`}
                                value={tileWidth}
                                onChangeText={setTileWidth}
                                keyboardType="numeric"
                                placeholder="0.0"
                                unit={unit === 'ft' ? 'in' : 'cm'}
                            />
                        </View>
                    </View>

                    <Input
                        label="Extra for cuts & breakage (%)"
                        value={waste}
                        onChangeText={setWaste}
                        keyboardType="numeric"
                        placeholder="10"
                        unit="%"
                    />
                    <ThemedText style={{ fontSize: 12, color: '#666', marginTop: -12, marginBottom: 12, marginLeft: 4 }}>
                        Covers cuts, mistakes, and pattern loss
                    </ThemedText>

                    <Button title="Quick Estimate" onPress={calculate} />
                    <Button title="Clear" onPress={clear} variant="secondary" />
                </Card>

                {result && (
                    <>
                        <ThemedText style={styles.unitBanner}>
                            {unit === 'ft'
                                ? 'Room: ft | Tile: in (auto-converted)'
                                : 'Room: m | Tile: cm (auto-converted)'}
                        </ThemedText>
                        <Card style={styles.resultCard}>
                            <ThemedText type="subtitle" style={styles.resultTitle}>Results</ThemedText>

                            <View style={styles.resultRow}>
                                <ThemedText>Tiles to Buy (With Extra):</ThemedText>
                                <ThemedText type="title" style={{ color: '#0a7ea4' }}>
                                    {result.totalTiles}
                                </ThemedText>
                            </View>

                            <View style={styles.resultRow}>
                                <ThemedText>Tiles Needed (Exact):</ThemedText>
                                <ThemedText type="defaultSemiBold">
                                    {result.tilesRequired}
                                </ThemedText>
                            </View>

                            <View style={styles.resultRow}>
                                <ThemedText>Room Area:</ThemedText>
                                <ThemedText type="defaultSemiBold">
                                    {result.totalArea.toFixed(2)} {unit === 'ft' ? 'sq ft' : 'sq m'}
                                </ThemedText>
                            </View>

                            <View style={styles.resultRow}>
                                <ThemedText>Tile Area (each):</ThemedText>
                                <ThemedText type="defaultSemiBold">
                                    {result.tileArea.toFixed(4)} {unit === 'ft' ? 'sq ft' : 'sq m'}
                                </ThemedText>
                            </View>

                            <Button title="Save Project" onPress={onSavePress} style={{ marginTop: 16 }} variant="secondary" />
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
                    featureName="Saving Projects"
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
    sectionTitle: {
        marginBottom: 12,
        marginTop: 4,
    },
    row: {
        flexDirection: 'row',
    },
    col: {
        flex: 1,
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
    unitBanner: {
        textAlign: 'center',
        marginBottom: 8,
        fontSize: 12,
        opacity: 0.6,
        fontStyle: 'italic',
    }
});
