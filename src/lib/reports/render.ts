import React from "react"
import { renderToBuffer } from "@react-pdf/renderer"
import { HomiReportPdf, type ReportData } from "./template"

export async function renderReportPdf(args: { data: ReportData; variant: "dark" | "light" }) {
  const element = React.createElement(HomiReportPdf, { data: args.data, variant: args.variant }) as React.ReactElement
  const buf = await renderToBuffer(element)
  return Buffer.from(buf)
}
