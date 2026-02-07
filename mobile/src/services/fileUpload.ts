import * as ImagePicker from 'expo-image-picker';
import * as Camera from 'expo-camera';
import { Alert, Platform } from 'react-native';

export const handleCameraUpload = async (): Promise<string | null> => {
  try {
    const { status } = await Camera.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to capture documents. Please enable it in your device settings.',
        [{ text: 'OK' }]
      );
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error('Camera upload error:', error);
    Alert.alert('Error', 'Failed to capture photo. Please try again.');
    return null;
  }
};

export const handleGalleryUpload = async (): Promise<string | null> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Photo library permission is required to select documents. Please enable it in your device settings.',
        [{ text: 'OK' }]
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error('Gallery upload error:', error);
    Alert.alert('Error', 'Failed to select photo. Please try again.');
    return null;
  }
};

export const uploadToFirebase = async (uri: string, path: string): Promise<string | null> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    return uri;
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
};
