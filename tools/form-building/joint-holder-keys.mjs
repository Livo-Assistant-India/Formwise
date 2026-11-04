// Turns a generated form into a joint-holder form, in one place for every joint generator:
//  - form-rules.json gets "personRole": "joint_holder", so a batch gives it the joint holder's documents (the client
//    folder's "Joint holder" subfolder), never the main investor's;
//  - every field key gets a joint_holder_ prefix (subscriber_name -> joint_holder_name), so one Excel row can carry
//    the investor's and the joint holder's values side by side without clashing.
// Safe to run twice (keys already prefixed are left alone).
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export const JOINT_HOLDER_ROLE = "joint_holder";
const JOINT_HOLDER_PREFIX = "joint_holder_";
const FORMS = "apps/backend/src/forms/vcc";

/** subscriber_name -> joint_holder_name, subscriber_name_p5 -> joint_holder_name_p5, surname -> joint_holder_surname. */
export function toJointHolderKey(fieldKey) {
  if (fieldKey.startsWith(JOINT_HOLDER_PREFIX)) return fieldKey;
  const nameMatch = /^subscriber_name(_p\d+)?$/.exec(fieldKey);
  if (nameMatch) return `${JOINT_HOLDER_PREFIX}name${nameMatch[1] || ""}`;
  return `${JOINT_HOLDER_PREFIX}${fieldKey}`;
}

const readJson = (folder, fileName) => JSON.parse(readFileSync(path.join(folder, fileName), "utf-8"));
const writeJson = (folder, fileName, content) => writeFileSync(path.join(folder, fileName), JSON.stringify(content, null, 2) + "\n");

export function applyJointHolderRole(formIds) {
  for (const formId of formIds) {
    const folder = path.join(FORMS, formId);
    const positions = readJson(folder, "field-positions.json");
    positions.fields = positions.fields.map((field) => ({ ...field, key: toJointHolderKey(field.key) }));
    writeJson(folder, "field-positions.json", positions);

    const sources = readJson(folder, "field-sources.json");
    sources.fieldSources = Object.fromEntries(Object.entries(sources.fieldSources).map(([fieldKey, source]) =>
      [toJointHolderKey(fieldKey), source.replace(/^copy\.(.+)$/, (_match, copiedKey) => `copy.${toJointHolderKey(copiedKey)}`)]));
    writeJson(folder, "field-sources.json", sources);

    const required = readJson(folder, "required-fields.json");
    required.requiredFields = required.requiredFields.map(toJointHolderKey);
    writeJson(folder, "required-fields.json", required);

    const rules = readJson(folder, "form-rules.json");
    rules.personRole = JOINT_HOLDER_ROLE;
    rules.keyFields = (rules.keyFields || []).map((keyField) => (/^(subscriber|joint investor) name$/i.test(keyField) ? "Joint holder name" : keyField));
    rules.reviewSections = rules.reviewSections.map((section) => ({ ...section, fields: section.fields.map(toJointHolderKey) }));
    writeJson(folder, "form-rules.json", rules);

    const configuration = readJson(folder, "form-configuration.json");
    configuration.tickboxes = configuration.tickboxes.map((tickbox) => ({ ...tickbox, key: toJointHolderKey(tickbox.key) }));
    writeJson(folder, "form-configuration.json", configuration);
    console.log(`joint holder role + keys: ${formId}`);
  }
}
