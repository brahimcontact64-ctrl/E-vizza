# Assets Guide for E-Vizza Mobile App

This guide explains what images you need to prepare for your mobile app.

## Required Assets

### 1. App Icon (icon.png)
- **Size**: 1024 x 1024 pixels
- **Format**: PNG with transparency
- **Location**: `assets/icon.png`
- **Usage**: Main app icon shown on home screen
- **Design Tips**:
  - Use E-Vizza brand colors (#0F4C81, #00C2A8)
  - Keep design simple and recognizable at small sizes
  - Avoid text (may not be readable)
  - Leave some padding around edges

### 2. Android Adaptive Icon (adaptive-icon.png)
- **Size**: 1024 x 1024 pixels
- **Format**: PNG with transparency
- **Location**: `assets/adaptive-icon.png`
- **Usage**: Android adaptive icon foreground layer
- **Design Tips**:
  - Same as main icon but optimized for Android
  - Background color set in app.json (#0F4C81)
  - Icon will be masked into various shapes (circle, square, etc.)
  - Keep important content in center 66% of canvas

### 3. Splash Screen (splash.png)
- **Size**: 1284 x 2778 pixels (iPhone 14 Pro Max)
- **Format**: PNG
- **Location**: `assets/splash.png`
- **Usage**: Shown while app loads
- **Design Tips**:
  - Background color: #0F4C81 (set in app.json)
  - Center your logo/brand
  - Keep it simple (shown for 1-2 seconds)
  - Use gradient similar to web app (optional)
  - Example content:
    ```
    - E-Vizza logo in center
    - Tagline below (optional)
    - Clean, professional look
    ```

### 4. Favicon (favicon.png)
- **Size**: 48 x 48 pixels
- **Format**: PNG
- **Location**: `assets/favicon.png`
- **Usage**: Web favicon (when running as PWA)
- **Design Tips**:
  - Simplified version of app icon
  - Must be recognizable at tiny size

### 5. Notification Icon (notification-icon.png)
- **Size**: 96 x 96 pixels
- **Format**: PNG with transparency
- **Location**: `assets/notification-icon.png`
- **Usage**: Android notification icon
- **Design Tips**:
  - Simple, flat design
  - White icon on transparent background
  - No colors (Android will tint it)
  - Keep it simple (passport icon, document icon, etc.)

## Quick Start Templates

If you don't have a designer, you can:

1. **Use Figma Templates**:
   - Search "mobile app icon template" on Figma Community
   - Customize with your colors

2. **Use Canva**:
   - Search for "app icon" templates
   - Export at required sizes

3. **Use Online Tools**:
   - https://icon.kitchen/ - Generate all assets from one icon
   - https://appicon.co/ - Generate iOS and Android icons
   - https://makeappicon.com/ - Complete icon set generator

## Color Palette

Use these brand colors consistently:

```
Primary Blue: #0F4C81
Secondary Teal: #00C2A8
White: #FFFFFF
Gray: #F5F5F5
Text: #333333
```

## Asset Checklist

Before building your app, ensure you have:

- [ ] icon.png (1024x1024)
- [ ] adaptive-icon.png (1024x1024)
- [ ] splash.png (1284x2778)
- [ ] favicon.png (48x48)
- [ ] notification-icon.png (96x96)

## Temporary Placeholders

If you need to test without final assets, create simple colored squares:

```bash
# On macOS/Linux, you can create placeholder assets using ImageMagick:
convert -size 1024x1024 xc:'#0F4C81' -gravity center -pointsize 200 -fill white -annotate +0+0 'E-V' assets/icon.png
convert -size 1024x1024 xc:'#0F4C81' -gravity center -pointsize 200 -fill white -annotate +0+0 'E-V' assets/adaptive-icon.png
convert -size 1284x2778 xc:'#0F4C81' -gravity center -pointsize 120 -fill white -annotate +0+0 'E-Vizza' assets/splash.png
convert -size 48x48 xc:'#0F4C81' assets/favicon.png
convert -size 96x96 xc:'white' assets/notification-icon.png
```

Or simply use any solid color images at the correct sizes for testing.

## Screenshots for App Stores

You'll also need screenshots for app store listings:

### iOS Screenshots Needed:
- iPhone 6.5" Display (1242 x 2688) - 3-5 screenshots
- iPhone 5.5" Display (1242 x 2208) - 3-5 screenshots
- iPad Pro 12.9" Display (2048 x 2732) - 3-5 screenshots

### Android Screenshots Needed:
- Phone (1080 x 1920 or 1440 x 2560) - 2-8 screenshots
- 7" Tablet (1200 x 1920) - optional
- 10" Tablet (1600 x 2560) - optional

### Screenshot Tips:
- Show key features (application list, submission form, status tracking)
- Use real or realistic data
- Add text overlays explaining features
- Keep first screenshot most compelling
- Use consistent style across all screenshots

### Tools for Screenshots:
- iOS Simulator (Xcode)
- Android Emulator (Android Studio)
- Device screenshots (use your physical device)
- Screenshot editing: Figma, Sketch, Adobe XD
- Frame screenshots: https://screenshots.pro, https://www.screely.com

## App Store Assets

### Additional Assets Needed:

1. **App Store Icon** (iOS):
   - Size: 1024 x 1024
   - No transparency
   - No rounded corners (Apple adds them)

2. **Feature Graphic** (Android):
   - Size: 1024 x 500
   - Showcases app branding
   - Shown at top of Play Store listing

3. **Promotional Images** (Optional):
   - Various sizes for marketing
   - Use for ads, social media, website

## Need Help?

If you need professional assets created:
1. Hire a designer on Fiverr, Upwork, or Dribbble
2. Use AI tools like Midjourney, DALL-E for inspiration
3. Contact the E-Vizza team for brand guidelines

## Testing Assets

After adding assets:

1. Check in Expo Go:
```bash
npm start
```

2. Verify in app.json configuration

3. Test splash screen timing

4. Check icon appearance on device

5. Verify notification icon (Android)

Build a preview version to see final result:
```bash
eas build --platform android --profile preview
```
