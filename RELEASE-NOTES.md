# Phone Toolkit Release Notes

## Release Decision - June 2026

### Windows
- **Status**: Production release allowed after QA and Stripe live verification
- **Signing**: Unsigned (disclose "Unknown publisher" in download page)
- **Distribution**: Public paid download

### macOS
- **Status**: Private internal QA only through `qa:mac:unsigned`
- **Signing**: Deferred until Apple Developer enrollment
- **Distribution**: Not permitted publicly until Developer ID signing and notarization are enabled
- **Waitlist**: "Coming soon" messaging on download page

## Operational Commands

### Local Development
```bash
npm run dev --workspace desktop
```

### Private macOS QA (Unsigned)
```bash
npm run qa:mac:unsigned --workspace desktop
```

### Windows Customer Release
```bash
npm run release:win --workspace desktop
```

### macOS Customer Release (After Apple Credentials)
```bash
npm run release:mac --workspace desktop
```

## Release Validation

Before Windows paid launch:
```bash
./scripts/check-production-release.sh
npm ci
npm run build --workspace desktop
npm run release:win --workspace desktop
```

Verify on clean Windows 11:
- Installer opens and installs correctly
- SmartScreen "Unknown publisher" messaging documented
- Published SHA-256 matches installer
- Registration, login, payment, entitlement activation, cancellation, refund flows
- Real supported devices complete critical workflows
- No secrets in logs or packaged files
- Privacy policy, terms, refund policy, support visible before purchase