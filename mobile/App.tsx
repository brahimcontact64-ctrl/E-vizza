import { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, Platform, Alert, BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import LoadingScreen from './src/screens/LoadingScreen';
import OfflineScreen from './src/screens/OfflineScreen';
import ErrorScreen from './src/screens/ErrorScreen';
import { registerForPushNotifications, setupNotificationHandlers } from './src/services/notifications';
import { handleCameraUpload, handleGalleryUpload } from './src/services/fileUpload';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || 'https://your-web-app.com';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await setupNotificationHandlers();
      await registerForPushNotifications();

      const url = await Linking.getInitialURL();
      if (url) {
        handleDeepLink(url);
      }

      Linking.addEventListener('url', (event) => {
        handleDeepLink(event.url);
      });

      await SplashScreen.hideAsync();

      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Initialization error:', error);
      setHasError(true);
    }
  };

  const handleDeepLink = (url: string) => {
    const { path, queryParams } = Linking.parse(url);
    if (webViewRef.current && path) {
      const targetUrl = `${WEB_URL}/${path}${queryParams ? '?' + new URLSearchParams(queryParams).toString() : ''}`;
      webViewRef.current.injectJavaScript(`window.location.href = "${targetUrl}";`);
    }
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [canGoBack]);

  const handleWebViewMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      switch (data.type) {
        case 'UPLOAD_FROM_CAMERA':
          const cameraUri = await handleCameraUpload();
          if (cameraUri) {
            webViewRef.current?.postMessage(JSON.stringify({
              type: 'FILE_UPLOADED',
              uri: cameraUri,
              source: 'camera'
            }));
          }
          break;

        case 'UPLOAD_FROM_GALLERY':
          const galleryUri = await handleGalleryUpload();
          if (galleryUri) {
            webViewRef.current?.postMessage(JSON.stringify({
              type: 'FILE_UPLOADED',
              uri: galleryUri,
              source: 'gallery'
            }));
          }
          break;

        case 'STORE_AUTH_TOKEN':
          await AsyncStorage.setItem('authToken', data.token);
          break;

        case 'GET_AUTH_TOKEN':
          const token = await AsyncStorage.getItem('authToken');
          webViewRef.current?.postMessage(JSON.stringify({
            type: 'AUTH_TOKEN',
            token
          }));
          break;

        case 'CLEAR_AUTH_TOKEN':
          await AsyncStorage.removeItem('authToken');
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  };

  const injectedJavaScript = `
    (function() {
      window.isNativeApp = true;
      window.isMobileApp = true;

      window.uploadFromCamera = function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'UPLOAD_FROM_CAMERA' }));
      };

      window.uploadFromGallery = function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'UPLOAD_FROM_GALLERY' }));
      };

      window.storeAuthToken = function(token) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'STORE_AUTH_TOKEN', token }));
      };

      window.getAuthToken = function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'GET_AUTH_TOKEN' }));
      };

      window.clearAuthToken = function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CLEAR_AUTH_TOKEN' }));
      };

      const originalFileInput = document.createElement('input');
      originalFileInput.type = 'file';
      originalFileInput.accept = 'image/*';

      document.addEventListener('click', function(e) {
        if (e.target.tagName === 'INPUT' && e.target.type === 'file') {
          e.preventDefault();
          const accept = e.target.accept;
          if (accept && accept.includes('image')) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'UPLOAD_FROM_GALLERY' }));
          }
        }
      }, true);

      true;
    })();
  `;

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (hasError) {
    return <ErrorScreen onRetry={() => {
      setHasError(false);
      setIsLoading(true);
      initializeApp();
    }} />;
  }

  if (isOffline) {
    return <OfflineScreen onRetry={() => {
      setIsOffline(false);
      setIsLoading(true);
    }} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#0F4C81" />
      <WebView
        ref={webViewRef}
        source={{ uri: WEB_URL }}
        style={styles.webview}
        injectedJavaScript={injectedJavaScript}
        onMessage={handleWebViewMessage}
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          setHasError(true);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('HTTP error:', nativeEvent.statusCode);
          if (nativeEvent.statusCode >= 500) {
            setHasError(true);
          }
        }}
        startInLoadingState={true}
        renderLoading={() => <LoadingScreen />}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        cacheEnabled={true}
        allowsBackForwardNavigationGestures={true}
        pullToRefreshEnabled={true}
        incognito={false}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F4C81',
  },
  webview: {
    flex: 1,
  },
});
