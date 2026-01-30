import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet, View, ViewProps } from 'react-native';

export type CardProps = ViewProps;

export function Card({ style, ...otherProps }: CardProps) {
    const backgroundColor = useThemeColor({ light: '#fff', dark: '#1e1e1e' }, 'background');
    const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');

    return (
        <View
            style={[
                styles.card,
                { backgroundColor, borderColor },
                style
            ]}
            {...otherProps}
        />
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
});
