# Quick Start Guide - E-Vizza Mobile

Get your mobile app running in 5 minutes.

## Prerequisites
```bash
npm install -g expo-cli eas-cli
```

## 1. Install Dependencies
```bash
cd mobile
npm install
```

## 2. Set Environment Variables
```bash
cp .env.example .env
# Edit .env with your Firebase and web URL
```

## 3. Add Placeholder Assets
Create a folder `assets/` and add these files (any images at these sizes):
- icon.png (1024x1024)
- adaptive-icon.png (1024x1024)
- splash.png (1284x2778)
- favicon.png (48x48)
- notification-icon.png (96x96)

## 4. Run Development Server
```bash
# iOS Simulator (macOS only)
npm run ios

# Android Emulator
npm run android

# Or use Expo Go on your phone
npm start
# Scan QR code with Expo Go app
```

## 5. Test in Browser
```bash
npm run web
```

## Build for Production

### One-Time Setup
```bash
eas login
eas build:configure
```

### Build Android APK
```bash
eas build --platform android --profile production
```

### Build iOS IPA
```bash
eas build --platform ios --profile production
```

## Common Issues

**"Module not found"**: Run `npm install`

**"EXPO_PUBLIC_WEB_URL not set"**: Check your `.env` file

**"Build failed"**: Check EAS dashboard for detailed logs

**WebView blank**: Verify web URL is accessible and HTTPS

## Next Steps

1. Customize `app.json` with your bundle IDs
2. Add proper app icons and splash screen
3. Test all features (camera, notifications)
4. Submit to app stores (see README.md)

## Support

Full documentation in README.md and ASSETS_GUIDE.md
