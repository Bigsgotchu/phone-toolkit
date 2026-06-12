# Phone Toolkit Production Readiness

## Distribution

- [x] Desktop packaging configuration complete
- [x] Application icons created
- [x] electron-updater installed (production dependency)
- [x] Development mode detection via app.isPackaged
- [x] QA:mac:unsigned script for private macOS testing
- [x] release:mac script requires Apple credentials
- [ ] Apple Developer Program membership active
- [ ] Developer ID Application certificate installed
- [ ] macOS arm64 build signed
- [ ] macOS x64 build signed
- [ ] macOS builds notarized
- [ ] Notarization tickets validated
- [ ] Windows installer built
- [ ] Windows unsigned-installer notice published
- [ ] SHA-256 checksums published
- [ ] Development builds remain private and local

## Quality assurance

- [ ] Tested on clean Apple Silicon Mac
- [ ] Tested on clean Intel Mac or equivalent
- [ ] Tested on clean Windows 11 machine
- [ ] Tested application installation
- [ ] Tested application uninstall
- [ ] Tested user registration
- [ ] Tested user login
- [ ] Tested password reset
- [ ] Tested payment success
- [ ] Tested payment cancellation
- [ ] Tested failed payment
- [ ] Tested subscription cancellation
- [ ] Tested device connection
- [ ] Tested supported real devices
- [ ] Tested application restart
- [ ] Tested backend outage behavior
- [ ] Tested expired authentication session

## Payments and secrets

- [ ] Stripe production secret is stored outside source control
- [ ] Stripe production publishable key configured
- [ ] Stripe production webhook secret configured
- [ ] Stripe webhook signatures verified
- [ ] JWT production secret generated securely
- [ ] Previous JWT key retained during rotation window
- [ ] Access tokens use limited expiration
- [ ] Refresh tokens can be revoked
- [ ] Tokens encrypted at rest
- [ ] Production database backups tested

## Legal

- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Refund policy published
- [ ] Support email published
- [ ] Legal documents linked before payment
- [ ] Legal documents linked inside desktop application

## Operations

- [ ] Production logs enabled
- [ ] Secrets excluded from logs
- [ ] Error monitoring enabled
- [ ] Health endpoint monitored
- [ ] Database backup alerts enabled
- [ ] Rollback procedure documented
- [ ] Auto-update remains disabled for initial release
- [ ] Customer support procedure documented