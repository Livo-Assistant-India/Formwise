// The streams forms are grouped by on every form list (Pick a form, Forms, New batch). The group comes from each
// form's form-rules.json ("group"); a form without one is shown under OTHER.
export const FORM_GROUPS = {
  VCC: "VCC",
  US_TAX: "US tax",
  NFT: "NFT",
  GIFT_CITY: "GIFT City",
  OTHER: "Other",
} as const;

/** The order groups are listed in. */
export const FORM_GROUP_ORDER: string[] = [FORM_GROUPS.VCC, FORM_GROUPS.US_TAX, FORM_GROUPS.GIFT_CITY, FORM_GROUPS.NFT, FORM_GROUPS.OTHER];

/** The colour dot shown beside each group's name. */
export const FORM_GROUP_DOT_CLASSES: Record<string, string> = {
  [FORM_GROUPS.VCC]: "bg-brand-500",
  [FORM_GROUPS.US_TAX]: "bg-sky-500",
  [FORM_GROUPS.GIFT_CITY]: "bg-amber-500",
  [FORM_GROUPS.NFT]: "bg-violet-500",
  [FORM_GROUPS.OTHER]: "bg-stone-400",
};

export function getFormGroup(form: { group?: string }): string {
  return form.group || FORM_GROUPS.OTHER;
}
