# E-Vizza Mobile App Documentation Index

Welcome to the E-Vizza mobile app documentation. This index helps you find what you need quickly.

## 🚀 Getting Started

**New to the mobile app?** Start here:

1. **[QUICKSTART.md](QUICKSTART.md)** - Get running in 5 minutes
2. **[SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)** - Complete setup guide with checklist

## 📚 Core Documentation

### Essential Reading

- **[README.md](README.md)** - Complete documentation covering everything
  - Features overview
  - Installation instructions
  - Development workflow
  - Building for production
  - Deployment to app stores
  - Troubleshooting

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture and design
  - System overview
  - Component breakdown
  - Authentication flow
  - Deep linking
  - Security considerations
  - Performance optimization

### Asset & Design

- **[ASSETS_GUIDE.md](ASSETS_GUIDE.md)** - Asset requirements and specifications
  - Icon specifications
  - Splash screen requirements
  - Screenshot guidelines
  - Design tips
  - Tools and resources

### Configuration

- **[app.json](app.json)** - Expo configuration
  - App metadata
  - iOS configuration
  - Android configuration
  - Permissions
  - Plugins

- **[eas.json](eas.json)** - Build configuration
  - Development builds
  - Preview builds
  - Production builds

- **[.env.example](.env.example)** - Environment variable template
  - Firebase configuration
  - Web URL
  - API keys

## 📁 Project Structure

```
mobile/
├── 📄 Documentation
│   ├── INDEX.md (this file)
│   ├── README.md (main documentation)
│   ├── QUICKSTART.md (quick start)
│   ├── SETUP_CHECKLIST.md (complete checklist)
│   ├── ASSETS_GUIDE.md (asset requirements)
│   └── ARCHITECTURE.md (technical docs)
│
├── ⚙️ Configuration
│   ├── app.json (Expo config)
│   ├── eas.json (build config)
│   ├── package.json (dependencies)
│   ├── tsconfig.json (TypeScript)
│   └── babel.config.js (Babel)
│
├── 📱 Source Code
│   ├── App.tsx (main entry)
│   └── src/
│       ├── screens/ (UI screens)
│       │   ├── LoadingScreen.tsx
│       │   ├── OfflineScreen.tsx
│       │   └── ErrorScreen.tsx
│       └── services/ (native features)
│           ├── fileUpload.ts
│           └── notifications.ts
│
└── 🎨 Assets
    └── assets/
        ├── icon.png
        ├── adaptive-icon.png
        ├── splash.png
        ├── favicon.png
        └── notification-icon.png
```

## 🎯 Quick Navigation

### By Task

**I want to...**

- **Run the app locally** → [QUICKSTART.md](QUICKSTART.md)
- **Build for app stores** → [README.md#building-for-production](README.md)
- **Prepare assets** → [ASSETS_GUIDE.md](ASSETS_GUIDE.md)
- **Understand the architecture** → [ARCHITECTURE.md](ARCHITECTURE.md)
- **Follow a complete setup** → [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)
- **Configure environment** → [.env.example](.env.example)
- **Customize the app** → [app.json](app.json)

### By Audience

**I'm a...**

- **Developer** → Start with [README.md](README.md) and [ARCHITECTURE.md](ARCHITECTURE.md)
- **Designer** → See [ASSETS_GUIDE.md](ASSETS_GUIDE.md)
- **Project Manager** → Review [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)
- **Tester** → Check [README.md#testing-builds](README.md)

## 🔧 Development Commands

Quick reference for common commands:

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Build for production
eas build --platform android
eas build --platform ios
eas build --platform all
```

## 📖 Key Concepts

### WebView Integration
The app loads your existing web platform inside a native WebView container. All business logic remains in the web app.

### Message Bridge
Communication between native (mobile) and web happens via JavaScript message passing.

### Firebase Authentication
Auth tokens are persisted in secure native storage and synced with the web platform.

### Deep Linking
Custom URL scheme (`evizza://`) allows opening specific pages from external links.

### Push Notifications
Expo Push Notification service handles delivery of status updates and alerts.

## 🆘 Troubleshooting

### Common Issues

1. **Build Fails** → Check [README.md#troubleshooting](README.md)
2. **WebView Blank** → Verify HTTPS web URL and Firebase config
3. **Camera Not Working** → Must use physical device, check permissions
4. **Notifications Not Working** → Physical device required, verify project ID

### Getting Help

1. Check documentation (start with README.md)
2. Review [Expo documentation](https://docs.expo.dev)
3. Search [Expo forums](https://forums.expo.dev)
4. Check [React Native WebView docs](https://github.com/react-native-webview/react-native-webview)

## 📦 Dependencies

### Key Libraries

- **Expo** (~51.0.0) - Development framework
- **React Native** (0.74.0) - Mobile framework
- **react-native-webview** (13.8.6) - WebView component
- **expo-camera** (~15.0.0) - Camera access
- **expo-image-picker** (~15.0.0) - Gallery access
- **expo-notifications** (~0.28.0) - Push notifications
- **Firebase** (^12.9.0) - Backend services

See [package.json](package.json) for complete list.

## 🔐 Security

### Best Practices

- Always use HTTPS for web URL
- Store auth tokens securely (handled automatically)
- Validate all messages from WebView
- Request minimum necessary permissions
- Never hardcode API keys (use .env)

See [ARCHITECTURE.md#security-considerations](ARCHITECTURE.md) for details.

## 🚢 Deployment

### Release Process

1. **Development** → Test with Expo Go
2. **Preview** → Build preview version for internal testing
3. **Production** → Build production version for app stores
4. **Submission** → Submit to Google Play and App Store
5. **Monitoring** → Track crashes and user feedback

See [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) for complete workflow.

## 📊 Analytics & Monitoring

### Available Tools

- **Expo Dashboard** - Build logs, errors, analytics
- **Firebase Analytics** - User behavior and events
- **App Store Connect** - iOS metrics and reviews
- **Google Play Console** - Android metrics and reviews

## 🔄 Updates

### Web Platform Updates
Changes to the web platform are immediately available to mobile users on next app launch. No app store submission needed.

### Mobile App Updates
Changes to native features require new build and app store submission.

### Over-the-Air Updates
Use Expo Updates for emergency fixes without store submission.

## 📞 Support

For additional help:

- **Documentation Issues** - Check all .md files in this directory
- **Technical Questions** - Contact development team
- **Expo Issues** - https://forums.expo.dev
- **General Questions** - See README.md

## 📝 Additional Resources

### External Links

- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Apple App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Store Guidelines](https://play.google.com/about/developer-content-policy/)

### Tools

- [Expo Go App](https://expo.dev/client) - Test on devices
- [EAS CLI](https://github.com/expo/eas-cli) - Build and submit
- [Icon Kitchen](https://icon.kitchen/) - Generate app icons
- [Expo Push Notification Tool](https://expo.dev/notifications) - Test notifications

## 🎓 Learning Path

Recommended order for learning:

1. Read [QUICKSTART.md](QUICKSTART.md)
2. Run the app locally
3. Read [README.md](README.md) for full understanding
4. Study [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
5. Follow [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) for production
6. Prepare assets with [ASSETS_GUIDE.md](ASSETS_GUIDE.md)
7. Build and submit to stores

## ✅ Next Steps

- [ ] Read QUICKSTART.md to run the app
- [ ] Review SETUP_CHECKLIST.md for complete setup
- [ ] Prepare assets using ASSETS_GUIDE.md
- [ ] Build production version
- [ ] Submit to app stores

---

**Happy Building! 🎉**

For questions or issues, start with the documentation files in this directory.
