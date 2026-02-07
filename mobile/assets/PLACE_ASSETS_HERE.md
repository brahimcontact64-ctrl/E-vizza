# Place Your App Assets Here

This folder should contain:

1. **icon.png** - 1024x1024px app icon
2. **adaptive-icon.png** - 1024x1024px Android adaptive icon
3. **splash.png** - 1284x2778px splash screen
4. **favicon.png** - 48x48px web favicon
5. **notification-icon.png** - 96x96px notification icon

See **ASSETS_GUIDE.md** for detailed specifications.

## Quick Test Assets

For testing, you can use any solid color images at these sizes.

Using online tools:
- https://icon.kitchen/ - Generate all assets from one design
- https://placeholder.com/ - Generate placeholder images

Using ImageMagick:
```bash
convert -size 1024x1024 xc:'#0F4C81' icon.png
convert -size 1024x1024 xc:'#0F4C81' adaptive-icon.png
convert -size 1284x2778 xc:'#0F4C81' splash.png
convert -size 48x48 xc:'#0F4C81' favicon.png
convert -size 96x96 xc:'white' notification-icon.png
```

Or download from:
https://via.placeholder.com/1024x1024/0F4C81/FFFFFF?text=E-Vizza

Save as the appropriate filename above.
