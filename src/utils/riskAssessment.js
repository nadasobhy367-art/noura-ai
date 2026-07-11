const normalizeConfidence = value => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  if (numeric <= 1) return Math.round(numeric * 1000) / 10;
  return Math.round(numeric * 10) / 10;
};

const normalizeRiskTier = value => {
  const raw = String(value || '')
    .toLowerCase()
    .replace(/\s*risk\s*/g, '')
    .trim();

  if (raw.includes('low')) return 'Low';
  if (raw.includes('medium') || raw.includes('moderate') || raw.includes('follow')) return 'Medium';
  if (raw.includes('high') || raw.includes('abnormal')) return 'High';
  if (raw === 'normal') return 'Low';
  if (raw === 'unknown' || raw === 'uncertain') return 'Unknown';
  return null;
};

export const deriveRiskAssessment = scan => {
  const aiResult = scan?.aiResult || {};
  const prediction = String(aiResult.prediction || scan?.result || '')
    .toLowerCase()
    .trim();
  const confidence = normalizeConfidence(aiResult.confidence ?? scan?.confidence);
  const tierFromAi =
    normalizeRiskTier(aiResult.riskLevel) || normalizeRiskTier(scan?.result);

  if (
    prediction === 'uncertain' ||
    prediction === 'unknown' ||
    String(aiResult.riskLevel || '').toLowerCase() === 'unknown' ||
    (confidence === 0 && !tierFromAi)
  ) {
    return { riskLevel: 'Unknown', riskScore: 0 };
  }

  const riskLevel =
    tierFromAi ||
    (confidence >= 70 ? 'High' : confidence >= 40 ? 'Medium' : 'Low');

  let riskScore;
  if (riskLevel === 'Low') {
    riskScore = confidence > 0 ? Math.max(5, Math.min(28, Math.round(confidence * 0.3))) : 12;
  } else if (riskLevel === 'Medium') {
    riskScore = confidence > 0 ? Math.max(32, Math.min(58, Math.round(confidence * 0.65))) : 45;
  } else {
    riskScore = confidence > 0 ? Math.max(60, Math.min(98, Math.round(confidence))) : 78;
  }

  return { riskLevel, riskScore };
};
