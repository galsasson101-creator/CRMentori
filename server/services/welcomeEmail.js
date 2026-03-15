const { sendEmail } = require('./emailService');
const emailLogRepo = require('../dal/EmailLogRepository');

const FONT_STACK = "'Heebo','Arial Hebrew','Tahoma',Arial,sans-serif";

function buildWelcomeHtml(userName, settings) {
  const displayName = userName || 'תלמיד/ה';
  const s = settings;
  const primary = s.primaryColor || '#b923d7';
  const websiteUrl = s.websiteUrl || 'https://mentori.app';
  const companyName = s.companyName || 'Mentori';
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="he" dir="rtl" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>!ברוכים הבאים ל-${companyName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <style>* { font-family: Tahoma, Arial, sans-serif !important; } table { direction: rtl; } td { direction: rtl; text-align: right; }</style>
  <![endif]-->
  <style>
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .hero-section { padding: 40px 20px 32px !important; }
      .hero-title { font-size: 28px !important; }
      .hero-subtitle { font-size: 15px !important; }
      .content-section { padding: 28px 20px !important; }
      .feature-table { width: 100% !important; }
      .feature-cell { display: block !important; width: 100% !important; padding: 0 0 16px 0 !important; }
      .steps-cell { padding: 20px 16px !important; }
      .cta-btn { display: block !important; width: 100% !important; }
      .footer-section { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f0ecf7;font-family:${FONT_STACK};-webkit-font-smoothing:antialiased;direction:rtl;text-align:right;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0ecf7;direction:rtl;">
    <tr>
      <td align="center" style="padding:24px 16px;">

        <!-- Main Container -->
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(185,35,215,0.12);">

          <!-- ============ HERO SECTION ============ -->
          <tr>
            <td class="hero-section" style="background:linear-gradient(135deg, #7c3aed 0%, ${primary} 50%, #ec4899 100%);padding:52px 40px 44px;text-align:center;">
              <!-- Logo -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 28px;">
                <tr>
                  <td style="text-align:center;">
                    ${s.logoUrl
                      ? `<img src="${s.logoUrl}" alt="${s.logoAltText || companyName}" width="${s.logoWidth || 140}" style="display:block;margin:0 auto;max-width:${s.logoWidth || 140}px;height:auto;" />`
                      : `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                          <tr>
                            <td style="width:48px;height:48px;background-color:rgba(255,255,255,0.2);border-radius:14px;text-align:center;vertical-align:middle;">
                              <span style="color:#ffffff;font-size:26px;font-weight:800;font-family:${FONT_STACK};line-height:48px;">${companyName[0]}</span>
                            </td>
                            <td style="padding-right:14px;">
                              <span style="color:#ffffff;font-size:26px;font-weight:800;letter-spacing:3px;font-family:${FONT_STACK};">${companyName.toUpperCase()}</span>
                            </td>
                          </tr>
                        </table>`
                    }
                  </td>
                </tr>
              </table>

              <!-- Welcome Badge -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 20px;">
                <tr>
                  <td style="background-color:rgba(255,255,255,0.18);border-radius:40px;padding:8px 24px;text-align:center;">
                    <span style="color:#ffffff;font-size:13px;font-weight:500;font-family:${FONT_STACK};letter-spacing:1px;">WELCOME TO ${companyName.toUpperCase()}</span>
                  </td>
                </tr>
              </table>

              <!-- Hero Title -->
              <h1 class="hero-title" style="margin:0 0 16px;font-size:34px;font-weight:800;color:#ffffff;font-family:${FONT_STACK};line-height:1.3;text-align:center;">
                ,${displayName} שלום
                <br/>
                !איזה כיף שהצטרפת
              </h1>

              <!-- Hero Subtitle -->
              <p class="hero-subtitle" style="margin:0 auto;max-width:440px;font-size:16px;font-weight:300;color:rgba(255,255,255,0.9);font-family:${FONT_STACK};line-height:1.7;text-align:center;">
                אנחנו ב-${companyName} בנינו את הפלטפורמה הכי חכמה ללמידה מותאמת אישית.
                <br/>
                המסע שלך מתחיל עכשיו.
              </p>
            </td>
          </tr>

          <!-- ============ FEATURE CARDS ============ -->
          <tr>
            <td class="content-section" style="background-color:#ffffff;padding:40px 32px 20px;">

              <!-- Section Title -->
              <p style="margin:0 0 28px;font-size:18px;font-weight:600;color:#1c1f3e;font-family:${FONT_STACK};text-align:center;">
                ?מה מחכה לך
              </p>

              <!-- Feature 1 -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
                <tr>
                  <td style="background:linear-gradient(135deg, #faf5ff, #f3e8ff);border-radius:16px;padding:24px;direction:rtl;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:52px;vertical-align:top;text-align:center;padding-left:16px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="width:52px;height:52px;background-color:${primary};border-radius:14px;text-align:center;vertical-align:middle;">
                                <span style="font-size:24px;line-height:52px;">&#127891;</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td style="vertical-align:top;direction:rtl;text-align:right;">
                          <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#1c1f3e;font-family:${FONT_STACK};">למידה מותאמת אישית</p>
                          <p style="margin:0;font-size:14px;color:#6b7280;font-family:${FONT_STACK};line-height:1.6;">
                            המערכת שלנו לומדת את הקצב והסגנון שלך ומתאימה את החומר בדיוק בשבילך
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Feature 2 -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
                <tr>
                  <td style="background:linear-gradient(135deg, #f0fdf4, #dcfce7);border-radius:16px;padding:24px;direction:rtl;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:52px;vertical-align:top;text-align:center;padding-left:16px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="width:52px;height:52px;background-color:#22c55e;border-radius:14px;text-align:center;vertical-align:middle;">
                                <span style="font-size:24px;line-height:52px;">&#128202;</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td style="vertical-align:top;direction:rtl;text-align:right;">
                          <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#1c1f3e;font-family:${FONT_STACK};">מעקב התקדמות חכם</p>
                          <p style="margin:0;font-size:14px;color:#6b7280;font-family:${FONT_STACK};line-height:1.6;">
                            תמיד תדעו בדיוק איפה אתם עומדים ומה הצעד הבא שלכם
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Feature 3 -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
                <tr>
                  <td style="background:linear-gradient(135deg, #eff6ff, #dbeafe);border-radius:16px;padding:24px;direction:rtl;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:52px;vertical-align:top;text-align:center;padding-left:16px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="width:52px;height:52px;background-color:#3b82f6;border-radius:14px;text-align:center;vertical-align:middle;">
                                <span style="font-size:24px;line-height:52px;">&#9201;</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td style="vertical-align:top;direction:rtl;text-align:right;">
                          <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#1c1f3e;font-family:${FONT_STACK};">בכל מקום, בכל זמן</p>
                          <p style="margin:0;font-size:14px;color:#6b7280;font-family:${FONT_STACK};line-height:1.6;">
                            תלמדו מהנייד, מהמחשב או מהטאבלט — החומר תמיד מחכה לכם
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ============ GETTING STARTED STEPS ============ -->
          <tr>
            <td style="background-color:#ffffff;padding:0 32px 40px;">

              <!-- Divider with label -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="border-top:1px solid #e5e7eb;padding-top:28px;text-align:center;">
                    <p style="margin:0 0 24px;font-size:18px;font-weight:600;color:#1c1f3e;font-family:${FONT_STACK};">
                      :3 צעדים פשוטים להתחלה
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Step 1 -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="direction:rtl;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:40px;vertical-align:top;text-align:center;padding-left:14px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="width:40px;height:40px;background:linear-gradient(135deg, #7c3aed, ${primary});border-radius:50%;text-align:center;vertical-align:middle;">
                                <span style="color:#ffffff;font-size:18px;font-weight:700;font-family:${FONT_STACK};line-height:40px;">1</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td style="vertical-align:middle;direction:rtl;text-align:right;">
                          <p style="margin:0;font-size:15px;color:#1c1f3e;font-family:${FONT_STACK};">
                            <strong>היכנסו לאתר</strong> — גלו את מגוון הקורסים שלנו
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Step 2 -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="direction:rtl;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:40px;vertical-align:top;text-align:center;padding-left:14px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="width:40px;height:40px;background:linear-gradient(135deg, #7c3aed, ${primary});border-radius:50%;text-align:center;vertical-align:middle;">
                                <span style="color:#ffffff;font-size:18px;font-weight:700;font-family:${FONT_STACK};line-height:40px;">2</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td style="vertical-align:middle;direction:rtl;text-align:right;">
                          <p style="margin:0;font-size:15px;color:#1c1f3e;font-family:${FONT_STACK};">
                            <strong>בחרו קורס</strong> — התחילו ללמוד בקצב שלכם
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Step 3 -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
                <tr>
                  <td style="direction:rtl;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:40px;vertical-align:top;text-align:center;padding-left:14px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="width:40px;height:40px;background:linear-gradient(135deg, #7c3aed, ${primary});border-radius:50%;text-align:center;vertical-align:middle;">
                                <span style="color:#ffffff;font-size:18px;font-weight:700;font-family:${FONT_STACK};line-height:40px;">3</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td style="vertical-align:middle;direction:rtl;text-align:right;">
                          <p style="margin:0;font-size:15px;color:#1c1f3e;font-family:${FONT_STACK};">
                            <strong>התקדמו</strong> — עקבו אחרי ההישגים שלכם ותגדלו
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
                      href="${websiteUrl}" style="height:56px;v-text-anchor:middle;width:360px;"
                      arcsize="14%" strokecolor="${primary}" fillcolor="${primary}">
                      <w:anchorlock/>
                      <center style="color:#ffffff;font-family:Tahoma,Arial,sans-serif;font-size:18px;font-weight:700;">&#x1F680; !בואו נתחיל ללמוד</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${websiteUrl}" target="_blank" class="cta-btn" style="display:inline-block;background:linear-gradient(135deg, #7c3aed 0%, ${primary} 50%, #ec4899 100%);color:#ffffff;font-family:${FONT_STACK};font-size:18px;font-weight:700;text-decoration:none;text-align:center;padding:18px 48px;border-radius:14px;line-height:1.2;box-shadow:0 4px 20px rgba(185,35,215,0.35);mso-hide:all;">
                      &#x1F680; !בואו נתחיל ללמוד
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ============ SUPPORT BANNER ============ -->
          <tr>
            <td style="background:linear-gradient(135deg, #faf5ff, #fce7f3);padding:28px 32px;text-align:center;">
              <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#1c1f3e;font-family:${FONT_STACK};">
                ?צריכים עזרה
              </p>
              <p style="margin:0;font-size:14px;color:#6b7280;font-family:${FONT_STACK};line-height:1.6;">
                פשוט תענו על המייל הזה — הצוות שלנו כאן בשבילכם
              </p>
            </td>
          </tr>

          <!-- ============ FOOTER ============ -->
          <tr>
            <td class="footer-section" style="background-color:#1c1f3e;border-radius:0 0 20px 20px;padding:32px;text-align:center;">

              ${s.socialInstagram ? `
              <!-- Social Links -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 20px;">
                <tr>
                  ${s.socialInstagram ? `<td style="padding:0 8px;">
                    <a href="https://instagram.com/${s.socialInstagram.replace('@','')}" target="_blank" style="display:inline-block;width:36px;height:36px;background-color:rgba(255,255,255,0.1);border-radius:50%;text-align:center;line-height:36px;text-decoration:none;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    </a>
                  </td>` : ''}
                  ${s.socialFacebook ? `<td style="padding:0 8px;">
                    <a href="https://facebook.com/${s.socialFacebook}" target="_blank" style="display:inline-block;width:36px;height:36px;background-color:rgba(255,255,255,0.1);border-radius:50%;text-align:center;line-height:36px;text-decoration:none;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#ffffff"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </a>
                  </td>` : ''}
                </tr>
              </table>
              ` : ''}

              <!-- Tagline -->
              <p style="margin:0 0 12px;font-size:13px;color:rgba(255,255,255,0.6);font-family:${FONT_STACK};direction:rtl;">
                ${s.footerText || 'לומדים חכם, לא קשה'}
              </p>

              <!-- Copyright -->
              <p style="margin:0 0 12px;font-size:12px;color:rgba(255,255,255,0.4);font-family:${FONT_STACK};direction:rtl;">
                &copy; ${year} ${companyName}. כל הזכויות שמורות.
              </p>

              <!-- Links -->
              <p style="margin:0;font-size:12px;font-family:${FONT_STACK};">
                <a href="{{unsubscribe_url}}" style="color:rgba(255,255,255,0.5);text-decoration:underline;">הסרה מרשימת תפוצה</a>
                <span style="color:rgba(255,255,255,0.3);"> &bull; </span>
                <a href="${websiteUrl}" style="color:rgba(255,255,255,0.5);text-decoration:underline;">${websiteUrl.replace(/^https?:\/\//, '')}</a>
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

async function sendWelcomeEmail(user) {
  if (!user.email) {
    console.log('[WelcomeEmail] No email address for user, skipping welcome email');
    return null;
  }

  try {
    const brandSettingsRepo = require('../dal/BrandSettingsRepository');
    const settings = brandSettingsRepo.get();
    const companyName = settings.companyName || 'Mentori';

    const subject = `!${companyName}-ברוכים הבאים ל`;
    const html = buildWelcomeHtml(user.name, settings);

    const result = await sendEmail({
      to: user.email,
      subject,
      html,
    });

    // Log the email
    try {
      await emailLogRepo.create({
        campaignId: null,
        campaignName: 'Welcome Email (Auto)',
        recipientEmail: user.email,
        recipientName: user.name || '',
        subject,
        status: 'sent',
        sentAt: new Date().toISOString(),
        messageId: result.messageId,
      });
    } catch (logErr) {
      console.error('[WelcomeEmail] Failed to log email:', logErr.message);
    }

    console.log(`[WelcomeEmail] Sent welcome email to ${user.email}`);
    return result;
  } catch (err) {
    console.error(`[WelcomeEmail] Failed to send to ${user.email}:`, err.message);
    return null;
  }
}

module.exports = { sendWelcomeEmail, buildWelcomeHtml };
