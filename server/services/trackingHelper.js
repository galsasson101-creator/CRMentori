/**
 * Email tracking helper — open pixel injection and click URL wrapping.
 * Tracking endpoints are hosted on the deployed limudy server (Render).
 */

const BASE_URL = process.env.TRACKING_BASE_URL || 'http://localhost:3001';
const TRACKING_PATH = '/api/crm-tracking';

function getTrackingPixelHtml(emailLogId) {
  return `<img src="${BASE_URL}${TRACKING_PATH}/pixel/${emailLogId}" width="1" height="1" style="display:block;width:1px;height:1px;border:0;" alt="" />`;
}

function wrapUrlForTracking(originalUrl, emailLogId) {
  return `${BASE_URL}${TRACKING_PATH}/click/${emailLogId}?url=${encodeURIComponent(originalUrl)}`;
}

function injectTrackingPixel(html, emailLogId) {
  const pixel = getTrackingPixelHtml(emailLogId);
  if (html.includes('</body>')) {
    return html.replace('</body>', `${pixel}</body>`);
  }
  return html + pixel;
}

function wrapAllLinks(html, emailLogId) {
  const trackingPattern = `${TRACKING_PATH}/`;
  return html.replace(/href="(https?:\/\/[^"]+)"/g, (match, url) => {
    // Skip unsubscribe and tracking URLs
    if (url.includes('{{unsubscribe_url}}') || url.includes('/unsubscribe?') || url.includes(trackingPattern)) {
      return match;
    }
    return `href="${wrapUrlForTracking(url, emailLogId)}"`;
  });
}

function getUnsubscribeUrl(email) {
  return `${BASE_URL}${TRACKING_PATH}/unsubscribe?email=${encodeURIComponent(email || '')}`;
}

module.exports = {
  getTrackingPixelHtml,
  wrapUrlForTracking,
  injectTrackingPixel,
  wrapAllLinks,
  getUnsubscribeUrl,
};
