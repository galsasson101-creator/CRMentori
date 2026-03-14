/**
 * Email tracking helper — open pixel injection and click URL wrapping.
 */

const BASE_URL = process.env.TRACKING_BASE_URL || 'http://localhost:3001';

function getTrackingPixelHtml(emailLogId) {
  return `<img src="${BASE_URL}/api/tracking/pixel/${emailLogId}" width="1" height="1" style="display:block;width:1px;height:1px;border:0;" alt="" />`;
}

function wrapUrlForTracking(originalUrl, emailLogId) {
  return `${BASE_URL}/api/tracking/click/${emailLogId}?url=${encodeURIComponent(originalUrl)}`;
}

function injectTrackingPixel(html, emailLogId) {
  const pixel = getTrackingPixelHtml(emailLogId);
  if (html.includes('</body>')) {
    return html.replace('</body>', `${pixel}</body>`);
  }
  return html + pixel;
}

function wrapAllLinks(html, emailLogId) {
  const trackingPixelPattern = `/api/tracking/`;
  return html.replace(/href="(https?:\/\/[^"]+)"/g, (match, url) => {
    // Skip unsubscribe and tracking URLs
    if (url.includes('{{unsubscribe_url}}') || url.includes(trackingPixelPattern)) {
      return match;
    }
    return `href="${wrapUrlForTracking(url, emailLogId)}"`;
  });
}

module.exports = {
  getTrackingPixelHtml,
  wrapUrlForTracking,
  injectTrackingPixel,
  wrapAllLinks,
};
