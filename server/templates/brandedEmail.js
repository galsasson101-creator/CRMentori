/**
 * Mentori branded email template wrapper.
 * RTL Hebrew layout with table-based inline styles for email-client compatibility.
 * Accepts dynamic brand settings for customization.
 */

const brandSettingsRepo = require('../dal/BrandSettingsRepository');

const FONT_STACK = "'Heebo','Arial Hebrew','Tahoma',Arial,sans-serif";

function buildLogoHtml(settings) {
  if (settings.logoUrl) {
    return `<img src="${settings.logoUrl}" alt="${settings.logoAltText || 'Logo'}" width="${settings.logoWidth || 140}" style="display:block;max-width:${settings.logoWidth || 140}px;height:auto;" />`;
  }
  // Fallback: text-based "M" logo + company name
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="direction:rtl;">
    <tr>
      <td style="width:36px;height:36px;background-color:${settings.primaryColor};border-radius:10px;text-align:center;vertical-align:middle;direction:rtl;">
        <span style="color:#ffffff;font-size:20px;font-weight:700;font-family:${FONT_STACK};line-height:36px;">${(settings.companyName || 'M')[0].toUpperCase()}</span>
      </td>
      <td style="padding-right:12px;direction:rtl;text-align:right;">
        <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:2px;font-family:${FONT_STACK};">${(settings.companyName || 'MENTORI').toUpperCase()}</span>
      </td>
    </tr>
  </table>`;
}

function normalizeSocialUrl(url, platform) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const bases = {
    facebook: 'https://facebook.com/',
    twitter: 'https://twitter.com/',
    linkedin: 'https://linkedin.com/in/',
    instagram: 'https://instagram.com/',
  };
  const handle = url.replace(/^@/, '');
  return (bases[platform] || 'https://') + handle;
}

function buildSocialLinksHtml(settings) {
  const socials = [];
  if (settings.socialInstagram) {
    socials.push({
      url: normalizeSocialUrl(settings.socialInstagram, 'instagram'),
      label: 'Instagram',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${settings.primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
    });
  }
  if (settings.socialFacebook) {
    socials.push({
      url: normalizeSocialUrl(settings.socialFacebook, 'facebook'),
      label: 'Facebook',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${settings.primaryColor}"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
    });
  }
  if (settings.socialLinkedin) {
    socials.push({
      url: normalizeSocialUrl(settings.socialLinkedin, 'linkedin'),
      label: 'LinkedIn',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${settings.primaryColor}"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
    });
  }
  if (settings.socialTwitter) {
    socials.push({
      url: normalizeSocialUrl(settings.socialTwitter, 'twitter'),
      label: 'X',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${settings.primaryColor}"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    });
  }

  if (socials.length === 0) return '';

  const iconCells = socials.map(s => `
    <td style="padding:0 8px;text-align:center;">
      <!--[if !mso]><!-->
      <a href="${s.url}" target="_blank" style="text-decoration:none;">${s.svg}</a>
      <!--<![endif]-->
      <!--[if mso]>
      <a href="${s.url}" style="color:${settings.primaryColor};text-decoration:none;font-size:13px;font-family:Tahoma,Arial,sans-serif;">${s.label}</a>
      <![endif]-->
    </td>`).join('');

  return `<tr>
    <td style="padding:20px 32px 16px 32px;text-align:center;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
        <tr>
          ${iconCells}
        </tr>
      </table>
    </td>
  </tr>`;
}

/**
 * Build an Outlook-compatible CTA button.
 * @param {string} text - Button label
 * @param {string} url - Button link
 * @param {object} [options] - Customization options
 * @returns {string} HTML string
 */
function buildCtaButton(text, url, options = {}) {
  const {
    bgColor = '#c432e2',
    textColor = '#ffffff',
    borderRadius = '8',
    fontSize = '16',
    padding = '14px 32px',
    align = 'center',
    fullWidth = false,
  } = options;

  const widthAttr = fullWidth ? 'width="100%"' : '';
  const aWidth = fullWidth ? 'width:100%;' : '';
  const vmlWidth = fullWidth ? '600' : '250';

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" ${fullWidth ? 'width="100%"' : ''} style="margin:16px 0;" class="cta-button">
  <tr>
    <td align="${align}" style="direction:rtl;text-align:${align};">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
        href="${url}" style="height:48px;v-text-anchor:middle;width:${vmlWidth}px;"
        arcsize="${Math.round((parseInt(borderRadius) / 48) * 100)}%"
        strokecolor="${bgColor}" fillcolor="${bgColor}">
        <w:anchorlock/>
        <center style="color:${textColor};font-family:Tahoma,Arial,sans-serif;font-size:${fontSize}px;font-weight:700;">${text}</center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-->
      <a href="${url}" target="_blank" style="display:inline-block;${aWidth}background-color:${bgColor};color:${textColor};font-family:${FONT_STACK};font-size:${fontSize}px;font-weight:700;text-decoration:none;text-align:center;padding:${padding};border-radius:${borderRadius}px;line-height:1.2;mso-hide:all;" ${widthAttr}>${text}</a>
      <!--<![endif]-->
    </td>
  </tr>
</table>`;
}

/**
 * Build an Apple App Store badge (Hebrew version).
 * @param {string} appStoreUrl - Link to the app on the App Store
 * @param {object} [options] - Customization options
 * @returns {string} HTML string
 */
function buildAppStoreBadge(appStoreUrl, options = {}) {
  const {
    align = 'center',
    width = 150,
  } = options;

  if (!appStoreUrl) return '';

  const badgeImgUrl = 'https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/he-il?size=250x83';

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${align}" class="app-badges" style="margin:12px auto;">
  <tr>
    <td style="text-align:${align};">
      <a href="${appStoreUrl}" target="_blank" style="text-decoration:none;">
        <img src="${badgeImgUrl}" alt="הורידו באפ סטור" width="${width}" style="display:inline-block;max-width:${width}px;height:auto;border:0;" />
      </a>
    </td>
  </tr>
</table>`;
}

function wrapInBrandedTemplate(contentHtml, settings = null) {
  if (!settings) {
    settings = brandSettingsRepo.get();
  }

  const s = settings;
  const year = new Date().getFullYear();
  const companyName = s.companyName || 'Mentori';
  const copyrightLine = s.copyrightText || `&copy; ${year} ${companyName}. כל הזכויות שמורות.`;
  const websiteUrl = s.websiteUrl || 'https://mentori.app';
  const websiteDisplay = websiteUrl.replace(/^https?:\/\//, '');

  const appStoreBadgeHtml = s.appStoreUrl ? `<tr>
    <td style="padding:0 32px 12px 32px;text-align:center;">
      ${buildAppStoreBadge(s.appStoreUrl)}
    </td>
  </tr>` : '';

  return `<!DOCTYPE html>
<html lang="he" dir="rtl" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${companyName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700&display=swap" rel="stylesheet" />
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <style>
    * { font-family: Tahoma, Arial, sans-serif !important; }
    table { direction: rtl; }
    td { direction: rtl; text-align: right; }
  </style>
  <![endif]-->
  <style>
    .email-body h1 { margin:0 0 16px; font-size:26px; font-weight:700; line-height:1.3; }
    .email-body h2 { margin:0 0 14px; font-size:22px; font-weight:700; line-height:1.3; }
    .email-body h3 { margin:0 0 12px; font-size:18px; font-weight:600; line-height:1.4; }
    .email-body p  { margin:0 0 12px; font-size:15px; line-height:1.6; }
    .email-body ul, .email-body ol { margin:0 0 12px; padding-right:20px; padding-left:0; }
    .email-body li { margin-bottom:6px; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .email-content { padding: 24px 20px !important; }
      .email-header { padding: 20px 20px !important; }
      .email-footer-cell { padding: 16px 20px !important; }
      .cta-button { width: 100% !important; }
      .cta-button a { display: block !important; }
      .app-badges td { display: block !important; text-align: center !important; }
      .email-body h1 { font-size: 22px !important; }
      .email-body h2 { font-size: 19px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${s.bodyBgColor};font-family:${FONT_STACK};-webkit-font-smoothing:antialiased;direction:rtl;text-align:right;">
  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${s.bodyBgColor};direction:rtl;">
    <tr>
      <td align="center" style="padding:32px 16px;direction:rtl;text-align:right;">
        <!-- Main container -->
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;direction:rtl;">

          <!-- Header -->
          <tr>
            <td class="email-header" style="background-color:${s.headerBgColor};border-radius:16px 16px 0 0;padding:28px 32px;direction:rtl;text-align:right;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="direction:rtl;text-align:right;">
                    ${buildLogoHtml(s)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content area -->
          <tr>
            <td class="email-content" style="background-color:${s.contentBgColor};padding:36px 32px;color:${s.textColor};font-size:15px;line-height:1.6;font-family:${FONT_STACK};direction:rtl;text-align:right;">
              <div class="email-body" style="direction:rtl;text-align:right;">
                ${contentHtml}
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="background-color:${s.footerBgColor};padding:0 32px;direction:rtl;text-align:right;">
              <div style="border-top:1px solid #e5e7eb;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${s.footerBgColor};border-radius:0 0 16px 16px;padding:0;direction:rtl;text-align:right;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <!-- Social links -->
                ${buildSocialLinksHtml(s)}
                <!-- App Store badge -->
                ${appStoreBadgeHtml}
                <!-- Footer text -->
                <tr>
                  <td class="email-footer-cell" style="padding:${s.socialFacebook || s.socialTwitter || s.socialLinkedin || s.socialInstagram ? '0' : '20px'} 32px 12px 32px;text-align:center;">
                    ${s.footerText ? `<p style="margin:0 0 8px 0;font-size:12px;color:${s.mutedTextColor};font-family:${FONT_STACK};direction:rtl;">${s.footerText}</p>` : ''}
                    <p style="margin:0 0 8px 0;font-size:12px;color:${s.mutedTextColor};font-family:${FONT_STACK};direction:rtl;">
                      ${copyrightLine}
                    </p>
                  </td>
                </tr>
                <!-- Links -->
                <tr>
                  <td style="padding:0 32px 24px 32px;text-align:center;">
                    <p style="margin:0;font-size:12px;color:${s.mutedTextColor};font-family:${FONT_STACK};direction:rtl;">
                      <a href="{{unsubscribe_url}}" style="color:${s.primaryColor};text-decoration:underline;">הסרה מרשימת תפוצה</a>
                      &nbsp;&bull;&nbsp;
                      <a href="${websiteUrl}" style="color:${s.primaryColor};text-decoration:underline;">${websiteDisplay}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = { wrapInBrandedTemplate, buildCtaButton, buildAppStoreBadge };
