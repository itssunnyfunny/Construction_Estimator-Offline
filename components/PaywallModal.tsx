import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { usePro } from '@/context/ProContext';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

type PaywallModalProps = {
    visible: boolean;
    onClose: () => void;
    featureName: string;
};

export function PaywallModal({ visible, onClose, featureName }: PaywallModalProps) {
    const { purchasePro } = usePro();

    const handlePurchase = async () => {
        await purchasePro();
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <IconSymbol name="xmark" size={24} color="#666" />
                    </TouchableOpacity>

                    <View style={styles.iconContainer}>
                        <IconSymbol name="star.fill" size={48} color="#FFD700" />
                    </View>

                    <ThemedText type="title" style={styles.title}>Unlock Pro Tools</ThemedText>

                    <ThemedText style={styles.description}>
                        {featureName} is an Advanced Tool. Unlock to use:
                    </ThemedText>

                    <View style={styles.features}>
                        <FeatureRow text="Save unlimited estimates" />
                        <FeatureRow text="Share Estimates (PDF)" />
                        <FeatureRow text="Reuse previous jobs" />
                        <FeatureRow text="Support Development" />
                    </View>

                    <Button title="Unlock Pro Tools - $9.99" onPress={handlePurchase} />
                    <Button title="Restore Access" onPress={() => { }} variant="secondary" style={{ marginTop: 8 }} />
                </View>
            </View>
        </Modal>
    );
}

function FeatureRow({ text }: { text: string }) {
    return (
        <View style={styles.featureRow}>
            <IconSymbol name="checkmark.circle.fill" size={20} color="#0a7ea4" />
            <ThemedText style={styles.featureText}>{text}</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        padding: 24,
    },
    content: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1,
    },
    iconContainer: {
        marginBottom: 16,
        marginTop: 8,
    },
    title: {
        marginBottom: 12,
    },
    description: {
        textAlign: 'center',
        marginBottom: 24,
        opacity: 0.8,
    },
    features: {
        width: '100%',
        marginBottom: 24,
        gap: 12,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    featureText: {
        fontSize: 16,
    }
});
