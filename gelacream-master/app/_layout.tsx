import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack, useSegments } from 'expo-router';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { AuthProvider, useAuth } from '../context/AuthContext';

function AppShell() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const segments = useSegments();
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: theme.background,
                }}
            >
                <ActivityIndicator size="large" color={theme.tint} />
            </View>
        );
    }

    const currentRoot = segments[0];
    const isAuthScreen = currentRoot === 'login' || currentRoot === 'signup';

    if (!user && !isAuthScreen) {
        return <Redirect href="/login" />;
    }

    if (user && isAuthScreen) {
        return <Redirect href="/" />;
    }

    return (
        <ThemeProvider value={DefaultTheme}>
            <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="signup" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
            </Stack>
        </ThemeProvider>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <AppShell />
        </AuthProvider>
    );
}
