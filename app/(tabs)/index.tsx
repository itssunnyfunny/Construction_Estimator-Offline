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

export default function ConcreteScreen() {
  const { settings } = useSettings();
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [depth, setDepth] = useState('');
  const [waste, setWaste] = useState(settings.defaultWaste);
  const [unit, setUnit] = useState<'ft' | 'm'>(settings.defaultUnit);

  useEffect(() => {
    setWaste(settings.defaultWaste);
    setUnit(settings.defaultUnit);
  }, [settings]);

  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);

  const [result, setResult] = useState<{ rawVolume: number; totalVolume: number } | null>(null);

  const router = useRouter();
  const { isPro } = usePro();

  const calculate = () => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const d = parseFloat(depth);
    const wastePct = parseFloat(waste);

    if (isNaN(l) || isNaN(w) || isNaN(d)) {
      Alert.alert('Invalid Input', 'Please enter valid numbers for dimensions.');
      return;
    }

    const rawVol = l * w * d;
    const wasteMultiplier = 1 + (isNaN(wastePct) ? 0 : wastePct) / 100;
    const totalVol = rawVol * wasteMultiplier;

    setResult({
      rawVolume: rawVol,
      totalVolume: totalVol,
    });
  };

  const clear = () => {
    setLength('');
    setWidth('');
    setDepth('');
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Stack.Screen options={{ title: 'Concrete' }} />

        <View style={styles.header}>
          <ThemedText type="title">Concrete Calculator</ThemedText>
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

          <Button title="Quick Estimate" onPress={calculate} />
          <Button title="Clear" onPress={clear} variant="secondary" />
        </Card>

        {result && (
          <>
            <ThemedText style={styles.unitBanner}>
              {unit === 'ft'
                ? 'Slab: ft | Thickness: in'
                : 'Slab: m | Thickness: cm'}
            </ThemedText>
            <Card style={styles.resultCard}>
              <ThemedText type="subtitle" style={styles.resultTitle}>Concrete Needed (Exact)</ThemedText>
              <ThemedText type="title" style={styles.resultValue}>
                {result.rawVolume.toFixed(2)} {unit === 'ft' ? 'ft³' : 'm³'}
              </ThemedText>

              <View style={styles.resultRow}>
                <ThemedText>Concrete to Order (With Extra):</ThemedText>
                <ThemedText type="title" style={{ color: '#0a7ea4' }}>
                  {result.totalVolume.toFixed(2)} {unit === 'ft' ? 'ft³' : 'm³'}
                </ThemedText>
              </View>

              {unit === 'ft' && (
                <View style={styles.conversionRow}>
                  <ThemedText type="default">
                    = {(result.totalVolume / 27).toFixed(2)} yd³ (Cubic Yards)
                  </ThemedText>
                </View>
              )}

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
