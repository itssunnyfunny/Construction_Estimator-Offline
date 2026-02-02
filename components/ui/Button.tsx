import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';

export type ButtonProps = TouchableOpacityProps & {
    title: string;
    variant?: 'primary' | 'secondary' | 'danger';
    isLoading?: boolean;
    icon?: React.ComponentProps<typeof IconSymbol>['name'];
};

export function Button({ title, variant = 'primary', isLoading, style, disabled, icon, ...otherProps }: ButtonProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const backgroundColor =
        variant === 'primary' ? theme.tint :
            variant === 'danger' ? '#d32f2f' :
                'transparent';

    const textColor =
        variant === 'primary' ? '#fff' :
            variant === 'danger' ? '#fff' :
                theme.tint;

    const borderColor = variant === 'secondary' ? theme.tint : 'transparent';
    const borderWidth = variant === 'secondary' ? 2 : 0;

    return (
        <TouchableOpacity
            style={[
                styles.button,
                { backgroundColor, borderColor, borderWidth, opacity: disabled ? 0.6 : 1 },
                style
            ]}
            disabled={disabled || isLoading}
            {...otherProps}
        >
            {isLoading ? (
                <ActivityIndicator color={textColor} />
            ) : (
                <View style={styles.content}>
                    {icon && <IconSymbol name={icon} size={20} color={textColor} />}
                    <Text style={[styles.text, { color: textColor }]}>{title}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 50,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        marginVertical: 8,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
