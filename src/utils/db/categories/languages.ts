import LanguageModel from "../models/languages.js"; // Adjust the path as necessary

export class Languages {
  // Get the language for the specified guild
  static async getLanguage(guildId: string): Promise<string> {
    const languageDoc = await LanguageModel.findOne({ guildId });
    if (!languageDoc) {
      return "en"; // Default to English if no language is set
    }
    return languageDoc.language; // Return the language directly
  }

  // Set the language for the specified guild
  static async setLanguage(guildId: string, language: string): Promise<void> {
    await LanguageModel.updateOne(
      { guildId },
      { language }, // Update the language field directly
      { upsert: true } // Create the document if it doesn't exist
    );
  }
}

export enum LanguagesList {
  English = "en",
  Spanish = "es",
  French = "fr",
  German = "de",
  Portuguese = "pt",
  Russian = "ru",
  Chinese = "zh",
  Arabic = "ar",
  Hindi = "hi",
  Japanese = "ja",
  Italian = "it",
  Korean = "ko",
  Turkish = "tr",
  Vietnamese = "vi",
  Thai = "th",
  Indonesian = "id",
}

export const TranslatedLanguages = {
  [LanguagesList.English]: "English",
  [LanguagesList.Spanish]: "Español",
  [LanguagesList.French]: "Français",
  [LanguagesList.German]: "Deutsch",
  [LanguagesList.Portuguese]: "Português",
  [LanguagesList.Russian]: "Русский",
  [LanguagesList.Chinese]: "中文",
  [LanguagesList.Arabic]: "العربية",
  [LanguagesList.Hindi]: "हिन्दी",
  [LanguagesList.Japanese]: "日本語",
  [LanguagesList.Italian]: "Italiano",
  [LanguagesList.Korean]: "한국어",
  [LanguagesList.Turkish]: "Türkçe",
  [LanguagesList.Vietnamese]: "Tiếng Việt",
  [LanguagesList.Thai]: "ไทย",
  [LanguagesList.Indonesian]: "Bahasa Indonesia",
};

export function getLanguageNameInEnglish(code: string): string | undefined {
  const languageEntry = Object.entries(LanguagesList).find(
    ([, value]) => value === code
  );
  return languageEntry ? languageEntry[0] : undefined;
}

// Function to get the native language name
export function getNativeLanguageName(code: string): string | undefined {
  return TranslatedLanguages[code as LanguagesList];
}