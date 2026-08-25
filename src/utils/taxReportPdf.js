import html2pdf from "html2pdf.js";

const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

const slug = (value) => String(value ?? "").trim().replace(/\s+/g, "-").toLowerCase();

const renderRows = (rows = []) =>
  rows
    .map(
      ({ label, value, bold }) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#4b5563;font-size:12px;${bold ? "font-weight:700;color:#111827;" : ""}">
            ${escapeHtml(label)}
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#111827;font-size:12px;text-align:right;${bold ? "font-weight:700;" : ""}">
            ${escapeHtml(value)}
          </td>
        </tr>`
    )
    .join("");

const renderBreakdown = (breakdown) => {
  if (!breakdown?.rows?.length) return "";
  const head = breakdown.columns
    .map(
      (column, index) =>
        `<th style="padding:6px 0;font-size:11px;color:#6b7280;text-align:${index === 0 ? "left" : "right"};font-weight:600;">${escapeHtml(column)}</th>`
    )
    .join("");
  const body = breakdown.rows
    .map(
      (cells) =>
        `<tr>${cells
          .map(
            (cell, index) =>
              `<td style="padding:6px 0;font-size:12px;color:#111827;text-align:${index === 0 ? "left" : "right"};border-bottom:1px solid #f3f4f6;">${escapeHtml(cell)}</td>`
          )
          .join("")}</tr>`
    )
    .join("");
  return `
    <h2 style="margin:24px 0 8px;font-size:13px;color:#111827;">${escapeHtml(breakdown.title)}</h2>
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr>${head}</tr></thead>
      <tbody>${body}</tbody>
    </table>`;
};

const metaLine = (label, value) =>
  value
    ? `<div style="margin-bottom:4px;"><span style="color:#6b7280;">${escapeHtml(label)}:</span> <span style="color:#111827;font-weight:600;">${escapeHtml(value)}</span></div>`
    : "";

/**
 * Render a modelo calculation summary to a downloadable PDF.
 * Values are passed in already formatted so the document always matches the card.
 */
export const downloadModeloReportPdf = async ({
  modelo,
  title,
  period,
  nif,
  filingStatus,
  transactionsCount,
  calculatedAt,
  headline,
  rows,
  breakdown,
}) => {
  const generatedAt = new Date().toLocaleString("es-ES");

  // html2pdf clones the node it is given, so keep the off-screen positioning on a
  // separate host: a cloned "position:fixed" page would render outside the canvas.
  const host = document.createElement("div");
  host.style.position = "absolute";
  host.style.left = "-10000px";
  host.style.top = "0";
  host.style.width = "794px";

  const page = document.createElement("div");
  page.style.width = "794px";
  page.innerHTML = `
    <div style="font-family:Helvetica,Arial,sans-serif;background:#ffffff;color:#111827;padding:32px;">
      <div style="border-bottom:2px solid #111827;padding-bottom:12px;margin-bottom:20px;">
        <h1 style="margin:0;font-size:20px;">${escapeHtml(title || `Modelo ${modelo}`)}</h1>
        <p style="margin:6px 0 0;font-size:12px;color:#6b7280;">Tax calculation summary</p>
      </div>

      <div style="font-size:12px;margin-bottom:20px;">
        ${metaLine("Modelo", modelo)}
        ${metaLine("Period", period)}
        ${metaLine("NIF / NIE", nif || "—")}
        ${metaLine("Filing status", filingStatus)}
      </div>

      ${
        headline
          ? `<div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:20px;">
              <div style="font-size:11px;color:#6b7280;margin-bottom:4px;">${escapeHtml(headline.label)}</div>
              <div style="font-size:24px;font-weight:700;">${escapeHtml(headline.value)}</div>
            </div>`
          : ""
      }

      <h2 style="margin:0 0 8px;font-size:13px;">Totals</h2>
      <table style="width:100%;border-collapse:collapse;">${renderRows(rows)}</table>

      ${renderBreakdown(breakdown)}

      <div style="margin-top:28px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:11px;color:#6b7280;">
        <div>${escapeHtml(String(transactionsCount ?? 0))} transactions${
          calculatedAt ? ` · calculated ${escapeHtml(new Date(calculatedAt).toLocaleString("es-ES"))}` : ""
        }</div>
        <div style="margin-top:4px;">Generated ${escapeHtml(generatedAt)} · Internal summary, not an official AEAT submission.</div>
      </div>
    </div>`;

  host.appendChild(page);
  document.body.appendChild(host);
  try {
    await html2pdf()
      .set({
        margin: 0,
        filename: `modelo-${slug(modelo)}${period ? `-${slug(period)}` : ""}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 794,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(page)
      .save();
  } finally {
    host.remove();
  }
};
