/**
 * Mentori branded email template wrapper.
 * Table-based layout with inline styles for email-client compatibility.
 */

const BRAND = {
  navy: '#1c1f3e',
  blue: '#0086c0',
  surface: '#f4f5f7',
  white: '#ffffff',
  textDark: '#1c1f3e',
  textMuted: '#6b7280',
};

function wrapInBrandedTemplate(contentHtml) {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Mentori</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BRAND.surface};font-family:'Inter',Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.surface};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <!-- Main container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:${BRAND.navy};border-radius:16px 16px 0 0;padding:28px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:36px;height:36px;background-color:${BRAND.blue};border-radius:10px;text-align:center;vertical-align:middle;">
                          <span style="color:#ffffff;font-size:20px;font-weight:700;font-family:'Inter',Arial,sans-serif;line-height:36px;">M</span>
                        </td>
                        <td style="padding-left:12px;">
                          <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:2px;font-family:'Inter',Arial,sans-serif;">MENTORI</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content area -->
          <tr>
            <td style="background-color:${BRAND.white};padding:36px 32px;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${BRAND.surface};border-top:1px solid #e5e7eb;border-radius:0 0 16px 16px;padding:24px 32px;text-align:center;">
              <p style="margin:0 0 8px 0;font-size:12px;color:${BRAND.textMuted};font-family:'Inter',Arial,sans-serif;">
                &copy; ${new Date().getFullYear()} Mentori. All rights reserved.
              </p>
              <p style="margin:0;font-size:12px;color:${BRAND.textMuted};font-family:'Inter',Arial,sans-serif;">
                <a href="{{unsubscribe_url}}" style="color:${BRAND.blue};text-decoration:underline;">Unsubscribe</a>
                &nbsp;&bull;&nbsp;
                <a href="https://mentori.app" style="color:${BRAND.blue};text-decoration:underline;">mentori.app</a>
              </p>
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
