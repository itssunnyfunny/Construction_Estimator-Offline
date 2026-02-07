import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

export type InputProps = TextInputProps & {
    label?: string;
    lightColor?: string;
    darkColor?: string;
    unit?: string;
    containerStyle?: StyleProp<ViewStyle>;
};

export function Input({ style, label, lightColor, darkColor, unit, containerStyle, ...otherProps }: InputProps) {
    const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
    const backgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#1e1e1e' }, 'background');
    const borderColor = useThemeColor({ light: '#E2E8F0', dark: '#444' }, 'icon');

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={[styles.label, { color }]}>{label}</Text>}
            <View style={[styles.inputContainer, { backgroundColor, borderColor }]}>
                <TextInput
                    style={[styles.input, { color }, style]}
                    placeholderTextColor="#94A3B8"
                    {...otherProps}
                />
                {unit && <Text style={[styles.unit, { color }]}>{unit}</Text>}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        minHeight: 50,
    },
    input: {
        flex: 1,
        fontSize: 18,
        minHeight: 50,
        paddingVertical: 10,
    },
    unit: {
        fontSize: 16,
        marginLeft: 8,
        opacity: 0.7,
    },
});
