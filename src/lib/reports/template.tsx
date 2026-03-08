import * as React from "react"
import { Document, Page, Text, View, StyleSheet, Svg, Circle } from "@react-pdf/renderer"

type Variant = "dark" | "light"

export type ReportData = {
  appName: string
  entity: string
  ein: string
  assessmentId: string
  createdAt: string
  verdict: "ready" | "not_yet" | null
  overall: number
  financial: number
  emotional: number
  timing: number
  insights?: {
    executive_summary?: string
    financial_insight?: string
    emotional_insight?: string
    timing_insight?: string
    recommendations?: string[]
  } | null
  subScores?: {
    financial?: Record<string, unknown>
    emotional?: Record<string, unknown>
    timing?: Record<string, unknown>
  } | null
}

const COLORS = {
  cyan: "#22d3ee",
  emerald: "#34d399",
  yellow: "#facc15",
  amber: "#fab633",
  crimson: "#f24822",
  navy: "#0a1628",
  slate: "#1e293b",
  ink: "#0b1220"
}

function makeStyles(variant: Variant) {
  const dark = variant === "dark"
  return StyleSheet.create({
    page: {
      padding: 36,
      backgroundColor: dark ? COLORS.navy : "#ffffff",
      color: dark ? "#ffffff" : COLORS.ink,
      fontSize: 11,
      fontFamily: "Helvetica"
    },
    h1: { fontSize: 22, fontWeight: 700, marginBottom: 6 },
    h2: { fontSize: 14, fontWeight: 700, marginTop: 16, marginBottom: 8 },
    p: { lineHeight: 1.5, color: dark ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.75)" },
    small: { fontSize: 9, color: dark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)" },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    card: {
      borderRadius: 14,
      padding: 14,
      backgroundColor: dark ? "rgba(255,255,255,0.05)" : "#f5f7fb",
      border: dark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.08)"
    },
    divider: { height: 1, marginVertical: 12, backgroundColor: dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)" },
    footer: {
      position: "absolute",
      left: 36,
      right: 36,
      bottom: 22,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center"
    }
  })
}

function clamp0_100(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)))
}

function VerdictBadge({ verdict, variant }: { verdict: ReportData["verdict"]; variant: Variant }) {
  const dark = variant === "dark"
  const label = verdict === "ready" ? "READY" : verdict === "not_yet" ? "NOT YET" : "PENDING"
  const bg =
    verdict === "ready" ? "rgba(52,211,153,0.18)" :
    verdict === "not_yet" ? "rgba(250,204,21,0.18)" :
    dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)"
  const fg =
    verdict === "ready" ? COLORS.emerald :
    verdict === "not_yet" ? COLORS.yellow :
    dark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.75)"

  return (
    <Text style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, fontSize: 10, fontWeight: 700, backgroundColor: bg, color: fg }}>
      {label}
    </Text>
  )
}

function MiniCompass({ f, e, t }: { f: number; e: number; t: number }) {
  const size = 160
  const cx = size / 2
  const cy = size / 2
  return (
    <Svg width={size} height={size}>
      <Circle cx={cx} cy={cy} r={70} stroke={COLORS.cyan} strokeWidth={8} opacity={0.25} />
      <Circle cx={cx} cy={cy} r={52} stroke={COLORS.emerald} strokeWidth={8} opacity={0.25} />
      <Circle cx={cx} cy={cy} r={34} stroke={COLORS.yellow} strokeWidth={8} opacity={0.25} />

      <Circle cx={cx} cy={cy} r={70} stroke={COLORS.cyan} strokeWidth={8}
        strokeDasharray={`${(clamp0_100(f) / 100) * 440} 999`}
      />
      <Circle cx={cx} cy={cy} r={52} stroke={COLORS.emerald} strokeWidth={8}
        strokeDasharray={`${(clamp0_100(e) / 100) * 327} 999`}
      />
      <Circle cx={cx} cy={cy} r={34} stroke={COLORS.yellow} strokeWidth={8}
        strokeDasharray={`${(clamp0_100(t) / 100) * 214} 999`}
      />
    </Svg>
  )
}

function ScoreRow({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 10, opacity: 0.8 }}>{label}</Text>
        <Text style={{ fontSize: 10, fontWeight: 700 }}>{clamp0_100(score)}/100</Text>
      </View>
      <View style={{ height: 7, backgroundColor: "rgba(255,255,255,0.10)", borderRadius: 999, overflow: "hidden" }}>
        <View style={{ width: `${clamp0_100(score)}%`, height: "100%", backgroundColor: color }} />
      </View>
    </View>
  )
}

export function HomiReportPdf({ data, variant }: { data: ReportData; variant: Variant }) {
  const s = makeStyles(variant)
  const created = new Date(data.createdAt).toLocaleDateString()

  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        <View style={s.row}>
          <Text style={{ fontSize: 26, fontWeight: 800 }}>
            <Text style={{ color: COLORS.cyan }}>H</Text>
            <Text style={{ color: COLORS.emerald }}>ō</Text>
            <Text style={{ color: COLORS.yellow }}>M</Text>
            <Text style={{ color: COLORS.cyan }}>I</Text>
          </Text>
          <VerdictBadge verdict={data.verdict} variant={variant} />
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={s.h1}>Decision Readiness Report</Text>
          <Text style={s.p}>Assessment ID: {data.assessmentId}</Text>
          <Text style={s.p}>Assessed on: {created}</Text>
        </View>

        <View style={{ marginTop: 18, flexDirection: "row", gap: 16 }}>
          <View style={[s.card, { flex: 1 }]}>
            <Text style={{ fontSize: 12, fontWeight: 700 }}>Overall</Text>
            <Text style={{ fontSize: 44, fontWeight: 800, marginTop: 6 }}>{clamp0_100(data.overall)}</Text>
            <Text style={s.small}>/100</Text>
            <View style={{ marginTop: 12 }}>
              <ScoreRow label="Financial Reality" score={data.financial} color={COLORS.cyan} />
              <ScoreRow label="Emotional Truth" score={data.emotional} color={COLORS.emerald} />
              <ScoreRow label="Perfect Timing" score={data.timing} color={COLORS.yellow} />
            </View>
          </View>

          <View style={[s.card, { width: 220, alignItems: "center", justifyContent: "center" }]}>
            <MiniCompass f={data.financial} e={data.emotional} t={data.timing} />
            <Text style={[s.small, { marginTop: 8 }]}>Threshold Compass</Text>
          </View>
        </View>

        <View style={{ marginTop: 18 }}>
          <Text style={s.h2}>Executive Summary</Text>
          <Text style={s.p}>
            {data.insights?.executive_summary ??
              "This report summarizes your readiness across Financial Reality, Emotional Truth, and Perfect Timing. It is informational and not advice."}
          </Text>
        </View>

        <View style={s.footer}>
          <Text style={s.small}>{data.entity}</Text>
          <Text style={s.small}>For informational purposes only</Text>
        </View>
      </Page>
    </Document>
  )
}
