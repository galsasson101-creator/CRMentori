/**
 * Mentori branded email template wrapper.
 * Table-based layout with inline styles for email-client compatibility.
 * Accepts dynamic brand settings for customization.
 */

const brandSettingsRepo = require('../dal/BrandSettingsRepository');

function buildLogoHtml(settings) {
  if (settings.logoUrl) {
    return `<img src="${settings.logoUrl}" alt="${settings.logoAltText || 'Logo'}" width="${settings.logoWidth || 140}" style="display:block;max-width:${settings.logoWidth || 140}px;height:auto;" />`;
  }
  // Fallback: text-based "M" logo + company name
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="width:36px;height:36px;background-color:${settings.primaryColor};border-radius:10px;text-align:center;vertical-align:middle;">
        <span style="color:#ffffff;font-size:20px;font-weight:700;font-family:'Inter',Arial,sans-serif;line-height:36px;">${(settings.companyName || 'M')[0].toUpperCase()}</span>
      </td>
      <td style="padding-left:12px;">
        <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:2px;font-family:'Inter',Arial,sans-serif;">${(settings.companyName || 'MENTORI').toUpperCase()}</span>
      </td>
    </tr>
  </table>`;
}

function buildSocialLinksHtml(settings) {
  const links = [];
  if (settings.socialFacebook) links.push(`<a href="${settings.socialFacebook}" style="color:${settings.primaryColor};text-decoration:none;font-size:13px;font-family:'Inter',Arial,sans-serif;">Facebook</a>`);
  if (settings.socialTwitter) links.push(`<a href="${settings.socialTwitter}" style="color:${settings.primaryColor};text-decoration:none;font-size:13px;font-family:'Inter',Arial,sans-serif;">Twitter</a>`);
  if (settings.socialLinkedin) links.push(`<a href="${settings.socialLinkedin}" style="color:${settings.primaryColor};text-decoration:none;font-size:13px;font-family:'Inter',Arial,sans-serif;">LinkedIn</a>`);
  if (settings.socialInstagram) links.push(`<a href="${settings.socialInstagram}" style="color:${settings.primaryColor};text-decoration:none;font-size:13px;font-family:'Inter',Arial,sans-serif;">Instagram</a>`);

  if (links.length === 0) return '';

  return `<tr>
    <td style="padding:0 32px 16px 32px;text-align:center;">
      <p style="margin:0;font-size:13px;color:${settings.mutedTextColor};font-family:'Inter',Arial,sans-serif;">
        ${links.join('&nbsp;&nbsp;&bull;&nbsp;&nbsp;')}
      </p>
    </td>
  </tr>`;
}

function wrapInBrandedTemplate(contentHtml, settings = null) {
  if (!settings) {
    settings = brandSettingsRepo.get();
  }

  const s = settings;
  const year = new Date().getFullYear();
  const companyName = s.companyName || 'Mentori';
  const copyrightLine = s.copyrightText || `&copy; ${year} ${companyName}. All rights reserved.`;
  const websiteUrl = s.websiteUrl || 'https://mentori.app';
  const websiteDisplay = websiteUrl.replace(/^https?:\/\//, '');

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${companyName}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .email-content { padding: 24px 20px !important; }
      .email-header { padding: 20px 20px !important; }
      .email-footer-cell { padding: 16px 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${s.bodyBgColor};font-family:'Inter',Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${s.bodyBgColor};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <!-- Main container -->
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td class="email-header" style="background-color:${s.headerBgColor};border-radius:16px 16px 0 0;padding:28px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    ${buildLogoHtml(s)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content area -->
          <tr>
            <td class="email-content" style="background-color:${s.contentBgColor};padding:36px 32px;color:${s.textColor};font-size:15px;line-height:1.6;font-family:'Inter',Arial,Helvetica,sans-serif;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="background-color:${s.footerBgColor};padding:0 32px;">
              <div style="border-top:1px solid #e5e7eb;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${s.footerBgColor};border-radius:0 0 16px 16px;padding:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <!-- Social links -->
                ${buildSocialLinksHtml(s)}
                <!-- Footer text -->
                <tr>
                  <td class="email-footer-cell" style="padding:${s.socialFacebook || s.socialTwitter || s.socialLinkedin || s.socialInstagram ? '0' : '20px'} 32px 12px 32px;text-align:center;">
                    ${s.footerText ? `<p style="margin:0 0 8px 0;font-size:12px;color:${s.mutedTextColor};font-family:'Inter',Arial,sans-serif;">${s.footerText}</p>` : ''}
                    <p style="margin:0 0 8px 0;font-size:12px;color:${s.mutedTextColor};font-family:'Inter',Arial,sans-serif;">
                      ${copyrightLine}
                    </p>
                  </td>
                </tr>
                <!-- Links -->
                <tr>
                  <td style="padding:0 32px 24px 32px;text-align:center;">
                    <p style="margin:0;font-size:12px;color:${s.mutedTextColor};font-family:'Inter',Arial,sans-serif;">
                      <a href="{{unsubscribe_url}}" style="color:${s.primaryColor};text-decoration:underline;">Unsubscribe</a>
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

module.exports = { wrapInBrandedTemplate };
