import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F4C81', '#00C2A8']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>E-Vizza</Text>
          </View>

          <ActivityIndicator size="large" color="#FFFFFF" style={styles.spinner} />

          <Text style={styles.text}>Loading your visa portal...</Text>
          <Text style={styles.subtext}>Please wait</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 60,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  spinner: {
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 20,
  },
  subtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
});
