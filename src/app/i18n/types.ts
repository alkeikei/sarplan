/**
 * Language support. English and Indonesian.
 *
 * The app is aimed first at Indonesian SAR crews, so Indonesian is a full
 * translation and not a veneer: the panels, the help, the report and the
 * labels that come out of the reference tables all switch together.
 *
 * Three rules hold the translation together:
 *
 *  - The English dictionary is the source of truth and its keys are a closed
 *    union. `id.ts` is typed as Record<TextKey, string>, so a key added to
 *    English and not to Indonesian fails the build rather than shipping a
 *    blank label into an operations room.
 *
 *  - Standard search planning notation is never translated. E, Ro, Ao, Co,
 *    So, DD, SR, W0, fw, fv, ff, Zta, POC, POD, POS are international symbols
 *    and an Indonesian coordinator reads them from the same manual an English
 *    one does. The prose around them is what changes.
 *
 *  - Labels quoted from the source tables keep their English original
 *    alongside the translation where the English is the citation (table
 *    names, appendix references). A translated table name that cannot be
 *    found in the manual is worse than an untranslated one.
 *
 * Numbers keep the full stop as the decimal mark in both languages. Indonesian
 * writing normally uses a comma, but the numeric inputs write a full stop, and
 * the app deliberately shows one decimal mark everywhere so that two figures
 * read side by side under time pressure cannot be misread. Coordinates and
 * bearings follow the same convention in Indonesian aviation and maritime
 * practice.
 */

export type Lang = 'en' | 'id';

export const LANGUAGES: { code: Lang; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'id', label: 'Bahasa Indonesia', short: 'ID' },
];

/** Values interpolated into a string, written as {name} in the dictionary. */
export type Params = Record<string, string | number>;
