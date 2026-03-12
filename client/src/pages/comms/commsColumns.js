export const commsColumns = [
  { key: "validatedEmail", label: "Email", type: "text", width: 240 },
  { key: "emailVerified", label: "Email Verified", type: "toggle", width: 130 },
  { key: "formattedPhone", label: "Phone", type: "text", width: 160 },
  { key: "phoneVerified", label: "Phone Verified", type: "toggle", width: 130 },
  { key: "marketingOptIn", label: "Marketing Opt-In", type: "toggle", width: 140 },
  { key: "segmentTags", label: "Segments", type: "tags", width: 200 },
  { key: "preferredChannel", label: "Channel", type: "status", width: 120,
    colorMap: { email: '#0086c0', sms: '#00c875', both: '#a25ddc', none: '#c4c4c4' }
  },
  { key: "lastContacted", label: "Last Contact", type: "date", width: 140 },
];
