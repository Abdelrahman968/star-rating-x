import { useMemo } from "react";

/**
 * useRatingAnalytics — compute rich insights from an array of rating values.
 *
 * @param {number[]} ratings   Array of numeric ratings e.g. [5,4,5,3,5,2,4]
 * @param {object}  options
 * @param {number}  options.max          Max star value (default 5)
 * @param {number}  options.positiveMin  Threshold for "positive" (default 4)
 * @param {number}  options.negativeMax  Threshold for "negative" (default 2)
 *
 * @returns {AnalyticsResult}
 */
export function useRatingAnalytics(ratings = [], {
  max = 5,
  positiveMin = 4,
  negativeMax = 2,
} = {}) {
  return useMemo(() => {
    if (!ratings || ratings.length === 0) {
      return {
        count: 0,
        average: 0,
        median: 0,
        mode: 0,
        min: 0,
        max: 0,
        stdDev: 0,
        nps: 0,
        trend: "stable",
        percentPositive: 0,
        percentNegative: 0,
        percentNeutral: 100,
        distribution: {},
        distributionPercent: {},
        topScore: 0,
        bottomScore: 0,
        recentTrend: "stable",
      };
    }

    const count = ratings.length;

    // ── distribution ──────────────────────────────────────────────────────────
    const distribution = {};
    for (let i = 1; i <= max; i++) distribution[i] = 0;
    for (const r of ratings) {
      const key = Math.round(r);
      if (key >= 1 && key <= max) distribution[key]++;
    }

    const distributionPercent = {};
    for (const k in distribution) {
      distributionPercent[k] = +((distribution[k] / count) * 100).toFixed(1);
    }

    // ── average ───────────────────────────────────────────────────────────────
    const sum = ratings.reduce((a, b) => a + b, 0);
    const average = +(sum / count).toFixed(2);

    // ── median ────────────────────────────────────────────────────────────────
    const sorted = [...ratings].sort((a, b) => a - b);
    const mid = Math.floor(count / 2);
    const median = count % 2 !== 0
      ? sorted[mid]
      : +((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2);

    // ── mode ──────────────────────────────────────────────────────────────────
    let mode = 0, maxFreq = 0;
    for (const [k, v] of Object.entries(distribution)) {
      if (v > maxFreq) { maxFreq = v; mode = +k; }
    }

    // ── std deviation ─────────────────────────────────────────────────────────
    const variance = ratings.reduce((acc, r) => acc + Math.pow(r - average, 2), 0) / count;
    const stdDev = +Math.sqrt(variance).toFixed(2);

    // ── positive / negative / neutral ─────────────────────────────────────────
    const positives = ratings.filter(r => r >= positiveMin).length;
    const negatives = ratings.filter(r => r <= negativeMax).length;
    const neutrals  = count - positives - negatives;

    const percentPositive = +((positives / count) * 100).toFixed(1);
    const percentNegative = +((negatives / count) * 100).toFixed(1);
    const percentNeutral  = +(100 - percentPositive - percentNegative).toFixed(1);

    // ── NPS (Net Promoter Score) ───────────────────────────────────────────────
    // Promoters: 5 stars, Detractors: 1-2 stars, Passives: 3-4 stars
    const promoters  = ratings.filter(r => r >= max).length;
    const detractors = ratings.filter(r => r <= 2).length;
    const nps = Math.round(((promoters - detractors) / count) * 100);

    // ── trend (compare first half vs second half) ─────────────────────────────
    const half      = Math.floor(count / 2);
    const firstHalf = ratings.slice(0, half);
    const secHalf   = ratings.slice(half);

    const avgFirst = firstHalf.length
      ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
      : average;
    const avgSec = secHalf.length
      ? secHalf.reduce((a, b) => a + b, 0) / secHalf.length
      : average;

    const diff = avgSec - avgFirst;
    const trend =
      diff > 0.2  ? "improving" :
      diff < -0.2 ? "declining" :
                    "stable";

    // ── recent trend (last 20% vs previous 20%) ───────────────────────────────
    const slice      = Math.max(1, Math.floor(count * 0.2));
    const recent     = ratings.slice(-slice);
    const prevRecent = ratings.slice(-slice * 2, -slice);

    const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
    const avgPrev   = prevRecent.length
      ? prevRecent.reduce((a, b) => a + b, 0) / prevRecent.length
      : avgRecent;

    const rDiff = avgRecent - avgPrev;
    const recentTrend =
      rDiff > 0.15  ? "improving" :
      rDiff < -0.15 ? "declining" :
                      "stable";

    // ── top / bottom ──────────────────────────────────────────────────────────
    const topScore    = sorted[count - 1];
    const bottomScore = sorted[0];

    return {
      count,
      average,
      median,
      mode,
      min: bottomScore,
      max: topScore,
      stdDev,
      nps,
      trend,
      recentTrend,
      percentPositive,
      percentNegative,
      percentNeutral,
      distribution,
      distributionPercent,
      topScore,
      bottomScore,
    };
  }, [ratings, max, positiveMin, negativeMax]);
}


/**
 * useRatingGroupAnalytics — analytics per category in a RatingGroup.
 *
 * @param {Record<string, number[]>} categoryRatings
 *   e.g. { quality: [5,4,5,3], service: [4,3,4,5] }
 *
 * @returns {Record<string, AnalyticsResult> & { topRated, weakestRated, overallAverage }}
 */
export function useRatingGroupAnalytics(categoryRatings = {}, options = {}) {
  return useMemo(() => {
    const results = {};
    for (const [key, vals] of Object.entries(categoryRatings)) {
      const arr = Array.isArray(vals) ? vals : [vals];
      const count = arr.length;
      const avg   = count ? arr.reduce((a, b) => a + b, 0) / count : 0;
      results[key] = { average: +avg.toFixed(2), count };
    }

    const entries = Object.entries(results);
    const topRated     = entries.sort((a, b) => b[1].average - a[1].average)[0]?.[0] ?? null;
    const weakestRated = entries.sort((a, b) => a[1].average - b[1].average)[0]?.[0] ?? null;

    const allAvgs  = Object.values(results).map(r => r.average);
    const overallAverage = allAvgs.length
      ? +(allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length).toFixed(2)
      : 0;

    return { ...results, topRated, weakestRated, overallAverage };
  }, [categoryRatings]);
}
