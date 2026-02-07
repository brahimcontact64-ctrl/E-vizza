# E-Vizza Mobile App Architecture

This document explains how the mobile app works and integrates with the web platform.

## Overview

The E-Vizza mobile app is a **native wrapper** around the existing web application. It provides:
- Native mobile experience (app icon, splash screen, etc.)
- Enhanced features (camera, push notifications)
- Offline handling
- Seamless Firebase authentication sync

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│         Mobile App (React Native)       │
│                                         │
│  ┌────────────────────────────────┐   │
│  │       App.tsx (Main)           │   │
│  │  - WebView Container           │   │
│  │  - Navigation Handler          │   │
│  │  - Message Bridge              │   │
│  └────────────────────────────────┘   │
│               ▲                         │
│               │                         │
│  ┌────────────┴────────────────────┐  │
│  │   Services Layer                │  │
│  │  - fileUpload.ts (Camera)       │  │
│  │  - notifications.ts (Push)      │  │
│  └─────────────────────────────────┘  │
│               ▲                         │
│               │                         │
│  ┌────────────┴────────────────────┐  │
│  │   Screens Layer                 │  │
│  │  - LoadingScreen                │  │
│  │  - OfflineScreen                │  │
│  │  - ErrorScreen                  │  │
│  └─────────────────────────────────┘  │
└─────────────────────────────────────────┘
               │
               │ HTTPS
               ▼
┌─────────────────────────────────────────┐
│     Web Platform (React + Vite)         │
│  - All business logic                   │
│  - Firebase authentication              │
│  - Firestore data operations            │
│  - UI components                        │
└─────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│        Firebase Backend                 │
│  - Authentication                       │
│  - Firestore Database                   │
│  - Storage (documents)                  │
└─────────────────────────────────────────┘
```

## Component Breakdown

### 1. App.tsx (Main Container)

**Responsibilities:**
- Initialize Expo services (notifications, linking, splash screen)
- Set up Firebase authentication
- Render WebView with the web application
- Handle deep links
- Manage app states (loading, offline, error)
- Bridge between native and web

**Key Features:**
- Hardware back button handling (Android)
- WebView caching for performance
- Pull-to-refresh support
- Session persistence

### 2. WebView Integration

The WebView loads the entire web application and maintains:
- Cookies and session storage
- Firebase authentication state
- Full DOM access
- JavaScript execution

**Injected JavaScript:**
```javascript
window.isNativeApp = true
window.isMobileApp = true
window.uploadFromCamera()
window.uploadFromGallery()
window.storeAuthToken(token)
window.getAuthToken()
window.clearAuthToken()
```

### 3. Message Bridge

Communication between native (mobile) and web happens via:

**Web → Native:**
```javascript
window.ReactNativeWebView.postMessage(JSON.stringify({
  type: 'UPLOAD_FROM_CAMERA'
}));
```

**Native → Web:**
```javascript
webViewRef.current?.postMessage(JSON.stringify({
  type: 'FILE_UPLOADED',
  uri: imageUri
}));
```

### 4. File Upload Service

**fileUpload.ts** handles:
- Camera permission requests
- Camera capture with editing
- Gallery permission requests
- Image selection from gallery
- Image compression and optimization
- Base64 encoding for web transfer

**Flow:**
1. Web app calls `window.uploadFromCamera()`
2. Mobile app requests camera permission
3. Native camera opens
4. User captures/selects image
5. Image is processed
6. URI sent back to web via message
7. Web uploads to Firebase Storage

### 5. Notification Service

**notifications.ts** handles:
- Push notification registration
- Expo Push Token generation
- Notification channels (Android)
- Notification handlers
- Deep link integration from notifications

**Notification Flow:**
1. App starts → Register for push notifications
2. Get Expo Push Token
3. Send token to backend (web handles this)
4. Backend stores token with user profile
5. When status changes, backend sends push notification
6. User taps notification → Deep link opens app to specific page

### 6. Screen Components

#### LoadingScreen
- Shown during app initialization
- Shows E-Vizza branding
- Gradient background matching web theme

#### OfflineScreen
- Detected via WebView error handling
- Shows friendly offline message
- Retry button to reload
- Tips for connectivity

#### ErrorScreen
- Catches WebView errors (HTTP 500+)
- Prevents white screen of death
- Retry functionality
- Support information

## Authentication Flow

### Session Persistence

```
┌──────────────┐
│  User Login  │ (Web Platform)
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Firebase Auth Token  │
└──────┬───────────────┘
       │
       │ storeAuthToken(token)
       ▼
┌──────────────────────┐
│  AsyncStorage (Secure)│
└──────┬───────────────┘
       │
       │ Token persisted
       ▼
┌──────────────────────┐
│  App Restart         │
└──────┬───────────────┘
       │
       │ getAuthToken()
       ▼
┌──────────────────────┐
│  Web Auto-Login      │
└──────────────────────┘
```

The web platform should:
```javascript
// On app start
if (window.isMobileApp) {
  window.getAuthToken();
}

// Listen for token
window.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'AUTH_TOKEN' && data.token) {
    // Use token to restore session
    firebase.auth().signInWithCustomToken(data.token);
  }
});

// After login
firebase.auth().currentUser.getIdToken().then(token => {
  if (window.isMobileApp) {
    window.storeAuthToken(token);
  }
});

// On logout
if (window.isMobileApp) {
  window.clearAuthToken();
}
```

## Deep Linking

### URL Scheme: `evizza://`

**Examples:**
- `evizza://dashboard` → /dashboard
- `evizza://application/123` → /application/123
- `evizza://signin` → /signin

### Implementation:

1. **app.json** defines scheme:
```json
"scheme": "evizza"
```

2. **App.tsx** listens for URLs:
```typescript
Linking.addEventListener('url', handleDeepLink);
```

3. **Handler** navigates WebView:
```typescript
webViewRef.current.injectJavaScript(
  `window.location.href = "${url}";`
);
```

### Testing:

**iOS Simulator:**
```bash
xcrun simctl openurl booted evizza://dashboard
```

**Android:**
```bash
adb shell am start -W -a android.intent.action.VIEW \
  -d "evizza://dashboard" com.evizza.app
```

## Performance Optimization

### 1. WebView Caching
- Enabled by default
- Caches static assets
- Reduces load time on subsequent launches

### 2. Splash Screen Strategy
- Shows native splash immediately
- Transitions to WebView smoothly
- Hides once web content loads

### 3. Image Optimization
- Camera captures compressed (quality: 0.8)
- Allows editing before upload
- Base64 encoding for transfer

### 4. Bundle Size
- Hermes JavaScript engine (faster startup)
- Tree shaking removes unused code
- Optimized production builds

## Security Considerations

### 1. HTTPS Required
Web URL must use HTTPS to prevent MITM attacks.

### 2. Secure Token Storage
Auth tokens stored in:
- iOS: Keychain
- Android: EncryptedSharedPreferences

### 3. WebView Security
- Third-party cookies enabled (Firebase)
- JavaScript enabled (required)
- File access limited
- No arbitrary code execution

### 4. Permission Handling
- Camera: Only when explicitly requested
- Notifications: Optional, with user consent
- Storage: Only for captured/selected images

### 5. Certificate Validation
- System validates SSL certificates
- No self-signed certificates allowed
- Consider certificate pinning for production

## Development Workflow

### Local Development
```bash
npm start → Expo Go (live reload)
```

### Preview Testing
```bash
eas build --profile preview → Test build
```

### Production Release
```bash
eas build --profile production → Store build
```

## Deployment Strategy

### Phase 1: Internal Testing
1. Build preview version
2. Share with internal team
3. Test all features
4. Fix issues

### Phase 2: Beta Testing
1. Build production version
2. Distribute via TestFlight (iOS) or Internal Testing (Android)
3. Gather feedback
4. Iterate

### Phase 3: Public Release
1. Final production build
2. Prepare store listings
3. Submit for review
4. Launch

## Monitoring and Analytics

### Error Tracking
- Expo provides error dashboard
- Monitor crashes and exceptions
- Track WebView errors

### Usage Analytics
- Integrate Firebase Analytics in web platform
- Track screen views, events
- Monitor user flows

### Performance Monitoring
- WebView load times
- Image upload success rates
- Notification delivery rates

## Scalability

### Handling Traffic
- Web platform handles all scaling
- Mobile app is just a wrapper
- No mobile-specific backend needed

### Updates
- Web platform updates: Instant (reload WebView)
- Mobile app updates: Through app stores
- Over-the-air updates: Possible with Expo Updates

## Maintenance

### Regular Updates
- Keep Expo SDK updated
- Update dependencies monthly
- Monitor security advisories

### Platform Changes
- iOS updates (September annually)
- Android updates (throughout year)
- Test on new OS versions

## Troubleshooting

### Common Issues

1. **White Screen on Launch**
   - Check web URL is accessible
   - Verify HTTPS certificate valid
   - Check Firebase configuration

2. **Camera Not Working**
   - Verify permissions in app.json
   - Check device permissions granted
   - Test on physical device (not simulator)

3. **Notifications Not Received**
   - Must use physical device
   - Verify Expo project ID
   - Check notification permissions

4. **Authentication Lost**
   - Check token storage/retrieval
   - Verify Firebase configuration
   - Test session persistence

## Future Enhancements

Potential additions:
- Biometric authentication (Face ID, fingerprint)
- Offline mode with data sync
- Native payment integration
- Document scanning with OCR
- Multi-language support in mobile UI
- App shortcuts (3D Touch)
- Widgets (iOS/Android)

## Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native WebView](https://github.com/react-native-webview/react-native-webview)
- [Firebase for React Native](https://rnfirebase.io)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

## Support

For technical issues:
1. Check documentation files
2. Review Expo forums
3. Contact development team
