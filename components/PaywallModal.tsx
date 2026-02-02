import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { usePro } from '@/context/ProContext';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

export type PaywallVariant = 'default' | 'saveLimit' | 'export' | 'duplicate';

type PaywallModalProps = {
    visible: boolean;
    onClose: () => void;
    variant?: PaywallVariant;
};

export function PaywallModal({ visible, onClose, variant = 'default' }: PaywallModalProps) {
    const { purchasePro, restorePurchase } = usePro();

    const handlePurchase = async () => {
        await purchasePro();
        onClose();
    };

    const handleRestore = async () => {
        await restorePurchase();
    };

    const getContent = () => {
        switch (variant) {
            case 'saveLimit':
                return {
                    title: 'You’ve saved 5 estimates',
                    subtitle: 'Most contractors unlock Pro to save unlimited jobs and reuse them for future quotes.',
                    primaryButton: 'Unlock Pro',
                    secondaryButton: 'Not now',
                    showFeatures: false,
                };
            case 'export':
                return {
                    title: 'PDF export is a Pro tool',
                    subtitle: 'Share professional estimates with clients in one tap.',
                    primaryButton: 'Unlock Pro',
                    secondaryButton: 'Cancel',
                    showFeatures: false,
                };
            case 'duplicate':
                return {
                    title: 'Reuse jobs faster with Pro',
                    subtitle: 'Duplicate past estimates instead of starting over.',
                    primaryButton: 'Unlock Pro',
                    secondaryButton: 'Cancel',
                    showFeatures: false,
                };
            default:
                return {
                    title: 'Unlock Pro Tools',
                    subtitle: 'Built for contractors who quote often.',
                    primaryButton: 'Unlock Pro — Pay once',
                    secondaryButton: 'Maybe later',
                    showFeatures: true,
                };
        }
    };

    const content = getContent();

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

                    <ThemedText type="title" style={styles.title}>{content.title}</ThemedText>

                    <ThemedText style={styles.description}>
                        {content.subtitle}
                    </ThemedText>

                    {content.showFeatures && (
                        <View style={styles.features}>
                            <FeatureRow text="Save unlimited estimates" />
                            <FeatureRow text="Edit & reuse past jobs" />
                            <FeatureRow text="Share clean PDF estimates" />
                            <FeatureRow text="No ads. Works offline." />
                        </View>
                    )}

                    {content.showFeatures && (
                        <View style={styles.pricingContainer}>
                            <ThemedText style={styles.pricingText}>One-time purchase. No subscription.</ThemedText>
                        </View>
                    )}

                    <Button title={content.primaryButton} onPress={handlePurchase} />
                    <Button
                        title={content.secondaryButton}
                        onPress={onClose}
                        variant="secondary"
                        style={{ marginTop: 8 }}
                    />

                    {content.showFeatures && (
                        <TouchableOpacity onPress={handleRestore} style={styles.restoreButton}>
                            <ThemedText style={styles.restoreText}>Restore access anytime from settings.</ThemedText>
                        </TouchableOpacity>
                    )}
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
        marginBottom: 8,
        textAlign: 'center',
    },
    description: {
        textAlign: 'center',
        marginBottom: 24,
        opacity: 0.8,
        fontSize: 16,
        lineHeight: 22,
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
    },
    pricingContainer: {
        marginBottom: 16,
    },
    pricingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0a7ea4',
    },
    restoreButton: {
        marginTop: 16,
    },
    restoreText: {
        fontSize: 12,
        opacity: 0.6,
        textAlign: 'center',
    }
});
