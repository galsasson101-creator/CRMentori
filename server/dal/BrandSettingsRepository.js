const BaseRepository = require('./BaseRepository');

const DEFAULTS = {
  // Colors
  primaryColor: '#0086c0',
  headerBgColor: '#1c1f3e',
  footerBgColor: '#f4f5f7',
  bodyBgColor: '#f4f5f7',
  contentBgColor: '#ffffff',
  textColor: '#1c1f3e',
  mutedTextColor: '#6b7280',
  // Logo
  logoUrl: '',
  logoAltText: 'Mentori',
  logoWidth: 140,
  // Company
  companyName: 'Mentori',
  websiteUrl: 'https://mentori.app',
  // Footer
  footerText: '',
  copyrightText: '',
  // Social
  socialFacebook: '',
  socialTwitter: '',
  socialLinkedin: '',
  socialInstagram: '',
  // App Store
  appStoreUrl: '',
};

class BrandSettingsRepository extends BaseRepository {
  constructor() {
    super('data/brandSettings.json');
  }

  getDefaults() {
    return { ...DEFAULTS };
  }

  get() {
    const items = this._readData();
    if (items.length === 0) {
      // Auto-seed with defaults
      const settings = this.create({ ...DEFAULTS });
      return settings;
    }
    // Return the first (singleton) entry, merged with defaults for any missing keys
    return { ...DEFAULTS, ...items[0] };
  }

  save(data) {
    const items = this._readData();
    if (items.length === 0) {
      return this.create({ ...DEFAULTS, ...data });
    }
    return this.update(items[0].id, { ...DEFAULTS, ...data });
  }
}

module.exports = new BrandSettingsRepository();
