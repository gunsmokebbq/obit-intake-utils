# Assets Directory

This directory should contain application icons.

## Required Icons

For full packaging support, you'll need:

- `icon.png` - 512x512 PNG icon (used as fallback)
- `icon.icns` - macOS icon file (for .dmg builds)
- `icon.ico` - Windows icon file (for .exe builds)

## Creating Icons

You can create icons using:
- Online tools like [CloudConvert](https://cloudconvert.com/) or [IconConverter](https://iconconverter.com/)
- macOS: Use `iconutil` to convert PNG to .icns
- Windows: Use online converters or tools like IcoFX

For now, the application will work without custom icons (Electron will use default icons).

