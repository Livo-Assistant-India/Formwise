// Fill one test case through the real API and save the PDF.
// usage: node try_form.mjs <formId> <values.json> <out.pdf>
import { readFileSync, writeFileSync } from "node:fs";
const [formId, valuesPath, outPath] = process.argv.slice(2);
const API = "http://127.0.0.1:4500/api";
const values = JSON.parse(readFileSync(valuesPath, "utf-8"));
const call = async (path, options = {}) => {
  const response = await fetch(API + path, options);
  if (!response.ok) throw new Error(`${path} ${response.status} ${await response.text()}`);
  return response;
};
const json = (path, method, body) => call(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()).then((b) => b.data ?? b);

const created = await json("/cases", "POST", { formId });
const caseId = created.caseId || created.id;
const keys = Object.keys(values);
const quote = (v) => `"${String(v).replace(/"/g, '""')}"`;
const csv = [keys.join(","), keys.map((k) => quote(values[k])).join(",")].join("\n");
const form = new FormData();
form.append("file", new Blob([csv], { type: "text/csv" }), "test.csv");
const imported = await call(`/cases/${caseId}/sheet-import`, { method: "POST", body: form }).then((r) => r.json()).then((b) => b.data ?? b);
console.log("import:", JSON.stringify(imported).slice(0, 600));
const filled = await json(`/cases/${caseId}/fill`, "POST", {});
console.log("fill:", JSON.stringify(filled));
const fields = await call(`/cases/${caseId}/fields`).then((r) => r.json()).then((b) => b.data ?? b);
for (const f of fields.fields || []) if (f.status !== "ok") console.log("  not filled:", f.field, f.status, f.value ?? "");
await json(`/cases/${caseId}/regenerate`, "POST", {});
const pdf = Buffer.from(await (await call(`/cases/${caseId}/pdf`)).arrayBuffer());
writeFileSync(outPath, pdf);
console.log("saved", outPath, "case", caseId);
