import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

export type InputProps = TextInputProps & {
    label?: string;
    lightColor?: string;
    darkColor?: string;
    unit?: string;
};

export function Input({ style, label, lightColor, darkColor, unit, ...otherProps }: InputProps) {
    const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
    const backgroundColor = useThemeColor({ light: '#f9f9f9', dark: '#1e1e1e' }, 'background');
    const borderColor = useThemeColor({ light: '#ccc', dark: '#444' }, 'icon');

    return (
        <View style={styles.container}>
            {label && <Text style={[styles.label, { color }]}>{label}</Text>}
            <View style={[styles.inputContainer, { backgroundColor, borderColor }]}>
                <TextInput
                    style={[styles.input, { color }, style]}
                    placeholderTextColor="#888"
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
        height: 50,
    },
    input: {
        flex: 1,
        fontSize: 18,
        height: '100%',
    },
    unit: {
        fontSize: 16,
        marginLeft: 8,
        opacity: 0.7,
    },
});
