export const pipelineColumns = [
  { key: "name", label: "Deal Name", type: "text", width: 240 },
  { key: "ownerId", label: "Owner", type: "avatar", width: 140 },
  { key: "stage", label: "Stage", type: "status", width: 150,
    colorMap: { lead: '#c4c4c4', qualified: '#00c875', proposal: '#0086c0', negotiation: '#fdab3d', closed_won: '#00c875', closed_lost: '#e2445c' }
  },
  { key: "closeProbability", label: "Close %", type: "progress", width: 160 },
  { key: "estimatedValue", label: "Est. Value", type: "currency", width: 140 },
  { key: "expectedCloseDate", label: "Close Date", type: "date", width: 130 },
  { key: "tags", label: "Tags", type: "tags", width: 180 },
];
