import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * GET /api/reports/[assessmentId]
 *
 * Generates a printable, brand-compliant HTML assessment report from Supabase data.
 *
 * Query params:
 *   ?variant=print — light background for printing
 *
 * Returns Content-Type: text/html.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface ReportData {
  overallScore: number;
  verdict: string;
  summary: string;
  dimensions: Record<string, {
    name: string;
    score: number;
    color: string;
    keyFindings: string[];
    strengths: string[];
    improvements: string[];
  }>;
  recommendations: { priority: string; text: string }[];
}

const VERDICT_LABELS: Record<string, string> = {
  READY: 'Ready',
  ALMOST_THERE: 'Almost Ready',
  BUILD_FIRST: 'Build First',
  NOT_YET: 'Not Yet',
};

function buildReportFromAssessment(assessment: {
  overall_score: number;
  verdict: string;
  financial_score: number;
  financial_breakdown: Record<string, unknown>;
  emotional_score: number;
  emotional_breakdown: Record<string, unknown>;
  timing_score: number;
  timing_breakdown: Record<string, unknown>;
}): ReportData {
  return {
    overallScore: assessment.overall_score,
    verdict: VERDICT_LABELS[assessment.verdict] ?? assessment.verdict,
    summary: `Your overall decision readiness score is ${assessment.overall_score}/100. Financial: ${assessment.financial_score}, Emotional: ${assessment.emotional_score}, Timing: ${assessment.timing_score}.`,
    dimensions: {
      financial: {
        name: 'Financial Reality',
        score: assessment.financial_score,
        color: '#22d3ee',
        keyFindings: extractFindings(assessment.financial_breakdown),
        strengths: [],
        improvements: [],
      },
      emotional: {
        name: 'Emotional Truth',
        score: assessment.emotional_score,
        color: '#34d399',
        keyFindings: extractFindings(assessment.emotional_breakdown),
        strengths: [],
        improvements: [],
      },
      timing: {
        name: 'Perfect Timing',
        score: assessment.timing_score,
        color: '#facc15',
        keyFindings: extractFindings(assessment.timing_breakdown),
        strengths: [],
        improvements: [],
      },
    },
    recommendations: generateRecommendations(assessment),
  };
}

function extractFindings(breakdown: Record<string, unknown>): string[] {
  return Object.entries(breakdown).map(([key, val]) => {
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    if (typeof val === 'object' && val && 'points' in val && 'maxPoints' in val) {
      const v = val as { points: number; maxPoints: number };
      return `${label}: ${v.points}/${v.maxPoints} points`;
    }
    return `${label}: ${JSON.stringify(val)}`;
  });
}

function generateRecommendations(a: { financial_score: number; emotional_score: number; timing_score: number }): { priority: string; text: string }[] {
  const recs: { priority: string; text: string }[] = [];
  if (a.financial_score < 70) recs.push({ priority: 'High', text: 'Strengthen your financial foundation — focus on debt reduction and emergency savings' });
  if (a.emotional_score < 70) recs.push({ priority: 'High', text: 'Address emotional readiness gaps — ensure alignment with key stakeholders' });
  if (a.timing_score < 70) recs.push({ priority: 'Medium', text: 'Timing indicators suggest waiting — monitor conditions for improvement' });
  if (recs.length === 0) recs.push({ priority: 'Low', text: 'You are in a strong position — continue maintaining your readiness' });
  return recs;
}

// ---------------------------------------------------------------------------
// Score ring SVG helper
// ---------------------------------------------------------------------------

function scoreRingSvg(score: number, color: string, size: number): string {
  const r = (size - 8) / 2;
  const c = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform:rotate(-90deg)">
      <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="rgba(148,163,184,0.15)" stroke-width="6"/>
      <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${color}" stroke-width="6"
        stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"/>
      <text x="${c}" y="${c}" text-anchor="middle" dominant-baseline="central"
        fill="${color}" font-size="${size * 0.3}px" font-weight="700"
        style="transform:rotate(90deg);transform-origin:center">${score}</text>
    </svg>`;
}

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> },
) {
  const { assessmentId } = await params;
  const variant = request.nextUrl.searchParams.get('variant');
  const isPrint = variant === 'print';

  // Fetch assessment from Supabase
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { data: assessment } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', assessmentId)
    .eq('user_id', user.id)
    .single();

  if (!assessment) {
    return new NextResponse('Assessment not found', { status: 404 });
  }

  const bg = isPrint ? '#ffffff' : '#0a1628';
  const textPrimary = isPrint ? '#1e293b' : '#e2e8f0';
  const textSecondary = isPrint ? '#64748b' : '#94a3b8';
  const cardBg = isPrint ? '#f8fafc' : 'rgba(15,23,42,0.6)';
  const cardBorder = isPrint ? '#e2e8f0' : 'rgba(34,211,238,0.1)';
  const sectionBorder = isPrint ? '#e2e8f0' : 'rgba(34,211,238,0.08)';

  const d = buildReportFromAssessment(assessment);
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const dimensionSections = Object.values(d.dimensions)
    .map(
      (dim) => `
      <div style="margin-bottom:40px;padding:32px;background:${cardBg};border:1px solid ${cardBorder};border-radius:12px;">
        <div style="display:flex;align-items:center;gap:20px;margin-bottom:24px;">
          ${scoreRingSvg(dim.score, dim.color, 72)}
          <div>
            <h3 style="margin:0;font-size:20px;font-weight:700;color:${textPrimary};">${dim.name}</h3>
            <p style="margin:4px 0 0;font-size:14px;color:${textSecondary};">Score: ${dim.score}/100</p>
          </div>
        </div>

        <h4 style="margin:0 0 12px;font-size:14px;font-weight:600;color:${dim.color};text-transform:uppercase;letter-spacing:0.5px;">
          Key Findings
        </h4>
        <ul style="margin:0 0 24px;padding-left:20px;color:${textSecondary};font-size:14px;line-height:1.8;">
          ${dim.keyFindings.map((f) => `<li>${f}</li>`).join('')}
        </ul>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
          <div>
            <h4 style="margin:0 0 8px;font-size:13px;font-weight:600;color:#34d399;text-transform:uppercase;letter-spacing:0.5px;">
              Strengths
            </h4>
            <ul style="margin:0;padding-left:18px;color:${textSecondary};font-size:13px;line-height:1.8;">
              ${dim.strengths.map((s) => `<li>${s}</li>`).join('')}
            </ul>
          </div>
          <div>
            <h4 style="margin:0 0 8px;font-size:13px;font-weight:600;color:#facc15;text-transform:uppercase;letter-spacing:0.5px;">
              Areas for Improvement
            </h4>
            <ul style="margin:0;padding-left:18px;color:${textSecondary};font-size:13px;line-height:1.8;">
              ${dim.improvements.map((a) => `<li>${a}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>`,
    )
    .join('');

  const priorityColors: Record<string, string> = {
    High: '#ef4444',
    Medium: '#facc15',
    Low: '#34d399',
  };

  const recommendationRows = d.recommendations
    .map(
      (r) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid ${sectionBorder};">
          <span style="display:inline-block;padding:2px 10px;border-radius:9999px;font-size:11px;font-weight:600;
            background:${priorityColors[r.priority]}20;color:${priorityColors[r.priority]};">
            ${r.priority}
          </span>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid ${sectionBorder};color:${textSecondary};font-size:14px;">
          ${r.text}
        </td>
      </tr>`,
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>H&#x14D;MI Decision Readiness Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Inter',system-ui,sans-serif;background:${bg};color:${textPrimary};line-height:1.6;}
    @media print{
      body{background:#fff !important;color:#1e293b !important;}
      .no-print{display:none !important;}
      .page-break{page-break-before:always;}
    }
  </style>
</head>
<body>
  <div style="max-width:800px;margin:0 auto;padding:48px 32px;">

    <!-- ═══ COVER ═══ -->
    <div style="text-align:center;padding:60px 0 48px;border-bottom:2px solid ${sectionBorder};margin-bottom:48px;">
      <div style="display:inline-flex;align-items:center;gap:12px;margin-bottom:32px;">
        <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#22d3ee,#34d399);
          display:flex;align-items:center;justify-content:center;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0a1628" stroke-width="2.5" stroke-linecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <span style="font-size:28px;font-weight:800;color:${textPrimary};letter-spacing:-0.5px;">
          H&#x14D;MI
        </span>
      </div>

      <h1 style="font-size:32px;font-weight:800;color:${textPrimary};margin-bottom:8px;letter-spacing:-0.5px;">
        Decision Readiness Assessment Report
      </h1>
      <p style="font-size:15px;color:${textSecondary};">
        Generated ${today} &middot; Assessment ID: ${assessmentId}
      </p>
    </div>

    <!-- ═══ EXECUTIVE SUMMARY ═══ -->
    <div style="margin-bottom:48px;">
      <h2 style="font-size:22px;font-weight:700;color:${textPrimary};margin-bottom:24px;">
        Executive Summary
      </h2>

      <div style="display:flex;align-items:center;gap:32px;padding:32px;background:${cardBg};
        border:1px solid ${cardBorder};border-radius:12px;margin-bottom:24px;">
        ${scoreRingSvg(d.overallScore, '#22d3ee', 120)}
        <div>
          <div style="display:inline-block;padding:4px 16px;border-radius:9999px;font-size:13px;font-weight:600;
            background:rgba(250,204,21,0.15);color:#facc15;margin-bottom:12px;">
            ${d.verdict}
          </div>
          <p style="font-size:14px;color:${textSecondary};line-height:1.7;">
            ${d.summary}
          </p>
        </div>
      </div>
    </div>

    <!-- ═══ DIMENSION SECTIONS ═══ -->
    <div style="margin-bottom:48px;">
      <h2 style="font-size:22px;font-weight:700;color:${textPrimary};margin-bottom:24px;">
        Three-Dimensional Analysis
      </h2>
      ${dimensionSections}
    </div>

    <!-- ═══ RECOMMENDATIONS ═══ -->
    <div class="page-break" style="margin-bottom:48px;">
      <h2 style="font-size:22px;font-weight:700;color:${textPrimary};margin-bottom:24px;">
        Recommendations
      </h2>
      <table style="width:100%;border-collapse:collapse;background:${cardBg};border:1px solid ${cardBorder};border-radius:12px;overflow:hidden;">
        <thead>
          <tr style="border-bottom:2px solid ${sectionBorder};">
            <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:600;color:${textSecondary};text-transform:uppercase;letter-spacing:0.5px;width:100px;">
              Priority
            </th>
            <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:600;color:${textSecondary};text-transform:uppercase;letter-spacing:0.5px;">
              Action Item
            </th>
          </tr>
        </thead>
        <tbody>
          ${recommendationRows}
        </tbody>
      </table>
    </div>

    <!-- ═══ METHODOLOGY DISCLAIMER ═══ -->
    <div style="padding:24px;background:${cardBg};border:1px solid ${cardBorder};border-radius:12px;margin-bottom:48px;">
      <h3 style="font-size:14px;font-weight:600;color:${textSecondary};margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px;">
        Methodology &amp; Disclaimer
      </h3>
      <p style="font-size:13px;color:${textSecondary};line-height:1.7;">
        H&#x14D;MI is not a financial advisor, mortgage broker, or licensed professional.
        This report is generated using our proprietary three-dimensional scoring model
        that evaluates financial readiness, emotional alignment, and market timing
        indicators. Scores are based on self-reported data and publicly available
        market information. This assessment is for informational and educational
        purposes only and should not be construed as financial, legal, or investment
        advice. Always consult with qualified professionals before making major
        financial decisions.
      </p>
    </div>

    <!-- ═══ FOOTER ═══ -->
    <div style="text-align:center;padding-top:24px;border-top:1px solid ${sectionBorder};">
      <p style="font-size:12px;color:${textSecondary};">
        &copy; 2026 HOMI TECHNOLOGIES LLC. For informational purposes only.
      </p>
    </div>

  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store',
    },
  });
}
