const express = require('express');
const router = express.Router();
const emailLogRepo = require('../dal/EmailLogRepository');
const unsubscribeRepo = require('../dal/UnsubscribeRepository');

// 1x1 transparent GIF (43 bytes)
const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

// GET /api/tracking/pixel/:emailLogId — open tracking
router.get('/pixel/:emailLogId', (req, res) => {
  const { emailLogId } = req.params;

  // Fire-and-forget: record the open
  try { emailLogRepo.recordOpen(emailLogId); } catch (e) { /* ignore */ }

  res.set({
    'Content-Type': 'image/gif',
    'Content-Length': TRANSPARENT_GIF.length,
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  });
  res.end(TRANSPARENT_GIF);
});

// GET /api/tracking/click/:emailLogId — click tracking + redirect
router.get('/click/:emailLogId', (req, res) => {
  const { emailLogId } = req.params;
  const { url } = req.query;

  // Validate URL to prevent open redirect
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return res.status(400).send('Invalid URL');
  }

  // Record the click
  try { emailLogRepo.recordClick(emailLogId, url); } catch (e) { /* ignore */ }

  res.redirect(302, url);
});

// GET /api/crm-tracking/unsubscribe — show unsubscribe form
router.get('/unsubscribe', (req, res) => {
  const prefillEmail = req.query.email || '';

  res.send(`<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>הסרה מרשימת תפוצה - Mentori</title>
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Heebo', Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); padding: 20px; }
    .card { background: white; border-radius: 20px; padding: 48px 40px; text-align: center; max-width: 440px; width: 100%; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
    .logo { margin-bottom: 24px; }
    .logo img { height: 40px; }
    h1 { color: #1f2937; font-size: 22px; font-weight: 700; margin: 0 0 8px; }
    .subtitle { color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 28px; }
    .form-group { text-align: right; margin-bottom: 20px; }
    label { display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px; }
    input[type="email"] { width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 16px; font-family: 'Heebo', Arial, sans-serif; direction: ltr; text-align: left; outline: none; transition: border-color 0.2s; }
    input[type="email"]:focus { border-color: #b923d7; }
    .btn { width: 100%; padding: 14px; background: #b923d7; color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 700; font-family: 'Heebo', Arial, sans-serif; cursor: pointer; transition: background 0.2s; }
    .btn:hover { background: #a01dc0; }
    .btn:disabled { background: #d1d5db; cursor: not-allowed; }
    .success { display: none; }
    .success h1 { color: #059669; }
    .success .check { font-size: 48px; margin-bottom: 16px; }
    .error-msg { color: #dc2626; font-size: 13px; margin-top: 6px; display: none; }
  </style>
</head>
<body>
  <div class="card">
    <div id="formView">
      <div class="logo">
        <img src="https://literature-data.b-cdn.net/site-logo.svg" alt="Mentori" />
      </div>
      <h1>הסרה מרשימת תפוצה</h1>
      <p class="subtitle">הזינו את כתובת המייל שברצונכם להסיר מרשימת התפוצה שלנו</p>
      <form id="unsubForm" onsubmit="handleSubmit(event)">
        <div class="form-group">
          <label for="email">כתובת אימייל</label>
          <input type="email" id="email" name="email" value="${prefillEmail}" placeholder="example@email.com" required />
          <p class="error-msg" id="errorMsg"></p>
        </div>
        <button type="submit" class="btn" id="submitBtn">הסרה מהרשימה</button>
      </form>
    </div>
    <div id="successView" class="success">
      <div class="check">&#10003;</div>
      <h1>הוסרת בהצלחה</h1>
      <p class="subtitle" id="successMsg"></p>
    </div>
  </div>
  <script>
    async function handleSubmit(e) {
      e.preventDefault();
      var email = document.getElementById('email').value.trim();
      var btn = document.getElementById('submitBtn');
      var errorMsg = document.getElementById('errorMsg');
      errorMsg.style.display = 'none';
      if (!email) return;
      btn.disabled = true;
      btn.textContent = '...';
      try {
        var res = await fetch('/api/crm-tracking/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email })
        });
        if (!res.ok) throw new Error('error');
        document.getElementById('formView').style.display = 'none';
        document.getElementById('successView').style.display = 'block';
        document.getElementById('successMsg').textContent = 'הכתובת ' + email + ' הוסרה מרשימת התפוצה שלנו.';
      } catch (err) {
        errorMsg.textContent = 'אירעה שגיאה, נסו שוב';
        errorMsg.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'הסרה מהרשימה';
      }
    }
  </script>
</body>
</html>`);
});

// POST /api/crm-tracking/unsubscribe — process unsubscribe
router.post('/unsubscribe', express.json(), (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }

  try { unsubscribeRepo.addEmail(email); } catch (e) { /* ignore */ }

  res.json({ success: true, email });
});

module.exports = router;
