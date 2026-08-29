import type { Messages as EnMessages } from "./dictionaries/en";

/** The full key set, derived from the English dictionary. */
export type Messages = EnMessages;

/** A single translation key — typed so `t('typo.key')` fails to compile. */
export type MessageKey = keyof Messages;

/** Interpolation variables for `t(key, vars)` — `{name}` in the template. */
export type TVars = Record<string, string | number>;

/** The translation function signature shared by the context and helpers. */
export type TFunction = (key: MessageKey, vars?: TVars) => string;
