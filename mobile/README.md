# E-Vizza Mobile App

Production-ready mobile wrapper for the E-Vizza visa application platform built with Expo React Native.

## Features

- **WebView Integration**: Loads the existing web platform securely
- **Firebase Authentication**: Maintains session across app restarts
- **Document Upload**: Camera and gallery access for passport/document photos
- **Push Notifications**: Ready for status updates and alerts
- **Deep Linking**: Support for external links (evizza://)
- **Offline Handling**: Graceful offline state with retry functionality
- **Error Recovery**: User-friendly error screens with retry options
- **Session Persistence**: Auth tokens stored securely
- **Native Navigation**: Hardware back button support (Android)

## Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- Expo account (free): https://expo.dev/signup
- For iOS builds: Apple Developer account ($99/year)
- For Android builds: Google Play Developer account ($25 one-time)

## Setup Instructions

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Edit `.env`:
```
EXPO_PUBLIC_WEB_URL=https://your-deployed-web-app.com
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 3. Update App Configuration

Edit `app.json`:
- Update `expo.extra.eas.projectId` after running `eas build:configure`
- Customize `expo.ios.bundleIdentifier` (e.g., `com.yourcompany.evizza`)
- Customize `expo.android.package` (e.g., `com.yourcompany.evizza`)

### 4. Prepare Assets

Place the following images in the `assets/` folder:

- **icon.png**: 1024x1024px app icon
- **adaptive-icon.png**: 1024x1024px Android adaptive icon (foreground)
- **splash.png**: 1284x2778px splash screen image
- **favicon.png**: 48x48px web favicon
- **notification-icon.png**: 96x96px notification icon (Android)

You can use the provided placeholder assets or create your own using the E-Vizza branding colors:
- Primary: #0F4C81
- Secondary: #00C2A8

## Development

### Run on iOS Simulator (macOS only)

```bash
npm run ios
```

### Run on Android Emulator

```bash
npm run android
```

### Run with Expo Go (Physical Device)

1. Install Expo Go app on your device
2. Run:
```bash
npm start
```
3. Scan the QR code with:
   - iOS: Camera app
   - Android: Expo Go app

## Building for Production

### Initial Setup

1. Create Expo account: https://expo.dev/signup
2. Login to EAS:
```bash
eas login
```

3. Configure the project:
```bash
eas build:configure
```

This creates `eas.json` and links your project to Expo.

### Build Android APK

```bash
eas build --platform android --profile production
```

This generates an APK file that can be:
- Distributed directly (sideloading)
- Uploaded to Google Play Store
- Shared for testing

Download the APK from the Expo dashboard after the build completes.

### Build iOS IPA (Requires Apple Developer Account)

```bash
eas build --platform ios --profile production
```

Requirements:
- Apple Developer account ($99/year)
- App Store Connect app created
- Provisioning profiles and certificates (EAS handles automatically)

### Build Both Platforms

```bash
eas build --platform all --profile production
```

## Submission to App Stores

### Google Play Store

1. Build production APK:
```bash
eas build --platform android --profile production
```

2. Download APK from Expo dashboard

3. Go to Google Play Console: https://play.google.com/console

4. Create new app and follow the setup wizard

5. Upload APK to Internal Testing track first

6. Complete store listing (description, screenshots, etc.)

7. Submit for review

### Apple App Store

1. Build production IPA:
```bash
eas build --platform ios --profile production
```

2. EAS automatically uploads to App Store Connect

3. Go to App Store Connect: https://appstoreconnect.apple.com

4. Complete app information and metadata

5. Add screenshots (use iOS simulator or device)

6. Submit for review

## Testing Builds

### Preview Build (Internal Testing)

Generate a preview build for testing:

```bash
# Android APK
eas build --platform android --profile preview

# iOS Simulator
eas build --platform ios --profile preview
```

Share the build URL with testers.

## Deep Linking

The app supports deep linking with the custom scheme `evizza://`

Examples:
- `evizza://dashboard` → Opens dashboard
- `evizza://application/123` → Opens specific application

To test deep links:

**iOS:**
```bash
xcrun simctl openurl booted evizza://dashboard
```

**Android:**
```bash
adb shell am start -W -a android.intent.action.VIEW -d "evizza://dashboard" com.evizza.app
```

## Push Notifications

### Setup

1. Get your Expo project ID from `app.json` (`expo.extra.eas.projectId`)

2. Notifications are handled by Expo's push notification service

3. To send test notifications, use Expo's Push Notification Tool:
   https://expo.dev/notifications

### Send from Backend

Use Expo's Push API to send notifications:

```javascript
const message = {
  to: 'ExponentPushToken[xxxxxx]',
  sound: 'default',
  title: 'Visa Status Update',
  body: 'Your visa application has been approved!',
  data: { applicationId: '123' },
  channelId: 'status-updates',
};

await fetch('https://exp.host/--/api/v2/push/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(message),
});
```

## Web Platform Integration

The mobile app communicates with the web platform via JavaScript messages:

### From Mobile to Web

```javascript
// Available in web platform (injected by mobile app)
window.isNativeApp // true if running in mobile app
window.isMobileApp // true if running in mobile app
window.uploadFromCamera() // Opens camera
window.uploadFromGallery() // Opens gallery
window.storeAuthToken(token) // Store auth token
window.getAuthToken() // Retrieve auth token
window.clearAuthToken() // Clear auth token
```

### From Web to Mobile

The web platform can listen for messages:

```javascript
// Listen for file uploads from mobile
window.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'FILE_UPLOADED') {
    console.log('File uploaded:', data.uri);
    // Handle the uploaded file
  }

  if (data.type === 'AUTH_TOKEN') {
    console.log('Auth token:', data.token);
    // Use the token
  }
});
```

## Troubleshooting

### Build Fails

1. Clear cache:
```bash
expo start -c
```

2. Reinstall dependencies:
```bash
rm -rf node_modules
npm install
```

3. Check EAS build logs in Expo dashboard

### App Crashes on Launch

1. Check environment variables in `.env`
2. Verify Firebase configuration
3. Check web URL is accessible
4. Review error logs in Expo Go or device console

### WebView Not Loading

1. Verify `EXPO_PUBLIC_WEB_URL` is correct
2. Check internet connection
3. Ensure web app is deployed and accessible
4. Check for CORS issues (should allow mobile app origin)

### Notifications Not Working

1. Ensure physical device (not simulator for iOS)
2. Check notification permissions granted
3. Verify Expo project ID in `app.json`
4. Test with Expo's notification tool first

## File Structure

```
mobile/
├── App.tsx                          # Main app entry point
├── app.json                         # Expo configuration
├── eas.json                         # EAS Build configuration
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── babel.config.js                  # Babel config
├── .env                            # Environment variables (gitignored)
├── .env.example                    # Environment template
├── assets/                         # App assets (icons, splash)
└── src/
    ├── screens/
    │   ├── LoadingScreen.tsx       # Loading state
    │   ├── OfflineScreen.tsx       # Offline state
    │   └── ErrorScreen.tsx         # Error state
    └── services/
        ├── fileUpload.ts           # Camera/gallery upload
        └── notifications.ts        # Push notification setup
```

## Performance Optimization

### Reduce Bundle Size

1. Use Hermes engine (enabled by default in Expo SDK 51+)
2. Enable ProGuard for Android (production builds)
3. Use dynamic imports where possible

### Improve Load Time

1. Optimize splash screen assets
2. Minimize injected JavaScript
3. Use WebView caching (enabled by default)
4. Preload critical resources

## Security Considerations

1. **HTTPS Only**: Always use HTTPS for web URL
2. **Secure Storage**: Auth tokens stored in secure storage
3. **Certificate Pinning**: Consider implementing for production
4. **Input Validation**: Validate all messages from WebView
5. **Permissions**: Request only necessary permissions
6. **API Keys**: Never hardcode sensitive keys (use environment variables)

## Maintenance

### Update Dependencies

```bash
npm update
```

### Update Expo SDK

```bash
npx expo install expo@latest
npx expo install --fix
```

### Monitor Crashes

Use Expo's error tracking:
1. Go to Expo dashboard
2. Select your project
3. View "Errors" tab

## Support

For issues and questions:
- Expo Documentation: https://docs.expo.dev
- Expo Forums: https://forums.expo.dev
- GitHub Issues: Create issue in repository

## License

Proprietary - E-Vizza Platform
