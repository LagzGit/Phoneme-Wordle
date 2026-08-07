// HCE (Harrington, Cox & Evans) broad Australian English phonemic
// transcription data, sourced from the unit's phoneme corpus.
// Keyboard layout mirrors the reference "Keyboard for wordle" chart:
// each row groups phonemes by manner/place (consonants) or height/
// backness (vowels), exactly as provided, so the on-screen keyboard
// matches the course material students already use.

export const PHONEME_LABELS = {
  "b": { label: "B", example: "bed" },
  "d": { label: "D", example: "bed" },
  "dʒ": { label: "J", example: "jam" },
  "e": { label: "E", example: "bed" },
  "eː": { label: "AIR", example: "hair" },
  "f": { label: "F", example: "fan" },
  "h": { label: "H", example: "hat" },
  "iː": { label: "EE", example: "scream" },
  "j": { label: "Y", example: "yes" },
  "k": { label: "K", example: "bark" },
  "l": { label: "L", example: "boil" },
  "m": { label: "M", example: "jam" },
  "n": { label: "N", example: "thin" },
  "oɪ": { label: "OY", example: "boil" },
  "oː": { label: "OR", example: "fork" },
  "p": { label: "P", example: "ship" },
  "s": { label: "S", example: "choice" },
  "t": { label: "T", example: "boot" },
  "tʃ": { label: "CH", example: "choice" },
  "v": { label: "V", example: "van" },
  "w": { label: "W", example: "win" },
  "z": { label: "Z", example: "zip" },
  "æ": { label: "A", example: "bad" },
  "æɔ": { label: "OW", example: "cloud" },
  "æɪ": { label: "AY", example: "bait" },
  "ð": { label: "TH", example: "then" },
  "ŋ": { label: "NG", example: "ring" },
  "ɐ": { label: "U", example: "bud" },
  "ɐː": { label: "AR", example: "bark" },
  "ɑe": { label: "IGH", example: "bike" },
  "ɔ": { label: "O", example: "log" },
  "ə": { label: "UH", example: "sofa" },
  "əʉ": { label: "OH", example: "boat" },
  "ɜː": { label: "ER", example: "bird" },
  "ɡ": { label: "G", example: "log" },
  "ɪ": { label: "I", example: "bid" },
  "ɪə": { label: "EAR", example: "beard" },
  "ɹ": { label: "R", example: "ring" },
  "ʃ": { label: "SH", example: "ship" },
  "ʉː": { label: "OO", example: "boot" },
  "ʊ": { label: "OO", example: "book" },
  "ʒ": { label: "ZH", example: "vision" },
  "θ": { label: "TH", example: "thin" },
};

export function findPhoneme(ipa) {
  const meta = PHONEME_LABELS[ipa];
  if (!meta) return null;
  return { ipa, label: meta.label, example: meta.example };
}

// The keyboard chart as provided: rows of consonants, then rows of vowels.
// Empty strings represent unfilled cells in the original grid.
export const KEYBOARD_ROWS = [
  ["p", "t", "k", ""],
  ["b", "d", "ɡ", ""],
  ["n", "m", "ŋ", ""],
  ["f", "s", "θ", "ʃ"],
  ["v", "z", "ð", "ʒ"],
  ["l", "ɹ", "w", "j"],
  ["h", "tʃ", "dʒ", ""],
  ["iː", "ɪ", "e", "eː"],
  ["æ", "ɐ", "ɐː", "ɜː"],
  ["ʉː", "ɔ", "oː", "ʊ"],
  ["æɪ", "ɑe", "oɪ", "əʉ"],
  ["æɔ", "ɪə", "", "ə"],
];

// Assessment 1 deliberately uses one fixed Wordle word and a fixed list of
// five Word Search words. Database-backed word management belongs to the
// later assessments.
export const WORDLE_TARGET = { word: "THIN", phonemes: ["θ", "ɪ", "n"] };

export const WORDSEARCH_PRESET = [
  { word: "THIN", phonemes: ["θ", "ɪ", "n"] },
  { word: "THEN", phonemes: ["ð", "e", "n"] },
  { word: "SHIP", phonemes: ["ʃ", "ɪ", "p"] },
  { word: "CHIN", phonemes: ["tʃ", "ɪ", "n"] },
  { word: "JAM", phonemes: ["dʒ", "æ", "m"] },
];
