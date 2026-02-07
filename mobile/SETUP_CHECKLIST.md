# Mobile App Setup Checklist

Complete this checklist to get your E-Vizza mobile apps ready for production.

## ✅ Phase 1: Development Setup

### Prerequisites
- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] Expo account created (https://expo.dev/signup)
- [ ] Git repository set up

### Initial Setup
- [ ] Navigate to `mobile` directory
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Update `.env` with Firebase credentials
- [ ] Update `.env` with web URL (must be HTTPS)
- [ ] Install Expo CLI: `npm install -g expo-cli`
- [ ] Install EAS CLI: `npm install -g eas-cli`

### Test Development Build
- [ ] Run `npm start` and test with Expo Go
- [ ] Or run `npm run ios` (macOS only)
- [ ] Or run `npm run android`
- [ ] Verify web platform loads in WebView
- [ ] Test navigation and back button
- [ ] Verify Firebase auth works

## ✅ Phase 2: Assets Preparation

### App Icon
- [ ] Create 1024x1024px app icon
- [ ] Save as `assets/icon.png`
- [ ] Use brand colors (#0F4C81, #00C2A8)
- [ ] Test visibility at small sizes

### Android Assets
- [ ] Create 1024x1024px adaptive icon
- [ ] Save as `assets/adaptive-icon.png`
- [ ] Create 96x96px notification icon (white on transparent)
- [ ] Save as `assets/notification-icon.png`

### Splash Screen
- [ ] Create 1284x2778px splash screen
- [ ] Save as `assets/splash.png`
- [ ] Include E-Vizza logo/branding
- [ ] Use gradient or solid color background

### Other Assets
- [ ] Create 48x48px favicon
- [ ] Save as `assets/favicon.png`

### Verify Assets
- [ ] All images at correct sizes
- [ ] PNG format with transparency where needed
- [ ] No text that's hard to read at small sizes
- [ ] Consistent with brand guidelines

## ✅ Phase 3: Configuration

### app.json
- [ ] Update `expo.name` if needed
- [ ] Update `expo.slug` (lowercase, no spaces)
- [ ] Set `expo.version` (e.g., "1.0.0")
- [ ] Update `expo.ios.bundleIdentifier` (e.g., "com.yourcompany.evizza")
- [ ] Update `expo.android.package` (e.g., "com.yourcompany.evizza")
- [ ] Review iOS permissions descriptions
- [ ] Review Android permissions

### EAS Configuration
- [ ] Run `eas build:configure`
- [ ] Update `expo.extra.eas.projectId` in app.json
- [ ] Review `eas.json` build profiles
- [ ] Set up build credentials (EAS handles automatically)

### Firebase Configuration
- [ ] Verify Firebase project exists
- [ ] Enable Authentication (Email/Password)
- [ ] Enable Firestore
- [ ] Enable Storage
- [ ] Update Firebase rules for mobile access
- [ ] Add web URL to authorized domains

## ✅ Phase 4: Testing

### Functionality Testing
- [ ] Test app launch and splash screen
- [ ] Test WebView loads correctly
- [ ] Test Firebase authentication
- [ ] Test camera upload
- [ ] Test gallery upload
- [ ] Test push notification registration
- [ ] Test deep linking (use test commands)
- [ ] Test offline screen
- [ ] Test error recovery
- [ ] Test back button navigation (Android)
- [ ] Test pull-to-refresh

### Device Testing
- [ ] Test on iOS device (if available)
- [ ] Test on Android device
- [ ] Test on different screen sizes
- [ ] Test on older devices/OS versions
- [ ] Test with slow internet
- [ ] Test airplane mode behavior

### Build Preview
- [ ] Build preview APK: `eas build --platform android --profile preview`
- [ ] Install and test on physical device
- [ ] Verify all features work in standalone build
- [ ] Check app size is reasonable

## ✅ Phase 5: Production Build

### Android Production
- [ ] Review app.json Android settings
- [ ] Build: `eas build --platform android --profile production`
- [ ] Wait for build to complete (check dashboard)
- [ ] Download APK
- [ ] Test APK on multiple devices
- [ ] Verify signing certificate

### iOS Production (if applicable)
- [ ] Apple Developer account active ($99/year)
- [ ] Review app.json iOS settings
- [ ] Build: `eas build --platform ios --profile production`
- [ ] Wait for build to complete
- [ ] Verify upload to App Store Connect
- [ ] Test on TestFlight

## ✅ Phase 6: Store Listing Preparation

### Screenshots
- [ ] Capture 3-5 iPhone screenshots (various sizes)
- [ ] Capture 3-5 Android screenshots (1080x1920)
- [ ] Show key features (dashboard, submission, status)
- [ ] Add text overlays explaining features
- [ ] Edit and polish screenshots

### Store Listing Content
- [ ] Write app title (max 30 chars)
- [ ] Write short description (80 chars for Android)
- [ ] Write full description (4000 chars)
- [ ] List key features
- [ ] Create feature graphic (Android: 1024x500)
- [ ] Prepare promotional text
- [ ] Define keywords/tags for App Store

### Privacy & Legal
- [ ] Privacy policy URL prepared
- [ ] Terms of service URL prepared
- [ ] Contact email for support
- [ ] Age rating determined (likely Everyone/4+)
- [ ] Data collection disclosed

## ✅ Phase 7: Google Play Store Submission

### Play Console Setup
- [ ] Google Play Console account active ($25 one-time)
- [ ] Create new app in Play Console
- [ ] Upload APK to Internal Testing track
- [ ] Test with internal testers

### Complete Store Listing
- [ ] Add app icon
- [ ] Add feature graphic
- [ ] Upload screenshots
- [ ] Write description
- [ ] Set content rating
- [ ] Set up pricing (free)
- [ ] Select countries/regions
- [ ] Add privacy policy link

### Release Preparation
- [ ] Complete all store listing requirements
- [ ] Review app content for policy compliance
- [ ] Set up app signing (Google handles)
- [ ] Move to Production track
- [ ] Submit for review
- [ ] Monitor review status

## ✅ Phase 8: Apple App Store Submission

### App Store Connect Setup
- [ ] Apple Developer account active
- [ ] Create app in App Store Connect
- [ ] Set up app information
- [ ] Upload iOS build (via EAS)

### Complete App Information
- [ ] Add app icon
- [ ] Upload screenshots (all required sizes)
- [ ] Write app description
- [ ] Add keywords
- [ ] Set content rating
- [ ] Set pricing (free)
- [ ] Select countries/regions
- [ ] Add privacy policy URL

### TestFlight Testing
- [ ] Add internal testers
- [ ] Test build via TestFlight
- [ ] Fix any issues
- [ ] Get feedback

### Submit for Review
- [ ] Complete all required fields
- [ ] Submit for App Review
- [ ] Respond to any review questions
- [ ] Monitor review status (1-2 days typically)

## ✅ Phase 9: Post-Launch

### Monitoring
- [ ] Monitor crash reports (Expo dashboard)
- [ ] Check user reviews daily
- [ ] Monitor app analytics
- [ ] Track user engagement

### User Support
- [ ] Set up support email
- [ ] Create FAQ document
- [ ] Respond to user reviews
- [ ] Track feature requests

### Maintenance
- [ ] Schedule regular dependency updates
- [ ] Monitor security advisories
- [ ] Plan feature updates
- [ ] Test new OS versions (iOS 17, Android 14, etc.)

## ✅ Phase 10: Marketing & Growth

### App Store Optimization (ASO)
- [ ] Optimize app title and keywords
- [ ] A/B test screenshots and descriptions
- [ ] Encourage positive reviews
- [ ] Respond to all reviews

### Promotion
- [ ] Add app download links to website
- [ ] Create social media posts
- [ ] Email existing users about app
- [ ] Create promotional materials

### Analytics
- [ ] Set up Firebase Analytics
- [ ] Track key metrics (installs, engagement)
- [ ] Monitor user flows
- [ ] Identify improvement opportunities

## Common Issues Checklist

If something doesn't work, check:

### WebView Issues
- [ ] Web URL is HTTPS (not HTTP)
- [ ] Web app is deployed and accessible
- [ ] Firebase config matches between web and mobile
- [ ] CORS is properly configured

### Build Issues
- [ ] All environment variables set correctly
- [ ] Assets are correct sizes and formats
- [ ] Bundle identifiers are unique
- [ ] EAS is properly configured

### Camera Issues
- [ ] Testing on physical device (not simulator)
- [ ] Permissions granted in device settings
- [ ] Permissions properly defined in app.json

### Notification Issues
- [ ] Testing on physical device
- [ ] Permissions granted
- [ ] Expo project ID is correct
- [ ] Push tokens being saved correctly

## Need Help?

Refer to:
- [ ] README.md for comprehensive documentation
- [ ] QUICKSTART.md for quick commands
- [ ] ASSETS_GUIDE.md for asset requirements
- [ ] ARCHITECTURE.md for technical details
- [ ] Expo documentation: https://docs.expo.dev
- [ ] Expo forums: https://forums.expo.dev

## Version Control

Track your progress:
- [ ] Commit mobile app code
- [ ] Tag release versions (e.g., v1.0.0)
- [ ] Document changes in CHANGELOG.md
- [ ] Keep .env out of version control

## Success Criteria

Your mobile app is ready when:
- ✅ Builds successfully for both platforms
- ✅ All features work on physical devices
- ✅ Firebase authentication syncs properly
- ✅ Camera/gallery uploads work
- ✅ App meets store guidelines
- ✅ Internal testing completed
- ✅ No critical bugs found
- ✅ Performance is acceptable

---

**Congratulations!** Once all items are checked, your E-Vizza mobile apps are ready for production launch! 🎉
