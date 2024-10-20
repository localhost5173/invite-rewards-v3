import LanguageModel from "../models/languages"; // Adjust the path as necessary
export class Languages {
    // Get the language for the specified guild
    static async getLanguage(guildId) {
        const languageDoc = await LanguageModel.findOne({ guildId });
        if (!languageDoc) {
            return "en"; // Default to English if no language is set
        }
        return languageDoc.language; // Return the language directly
    }
    // Set the language for the specified guild
    static async setLanguage(guildId, language) {
        await LanguageModel.updateOne({ guildId }, { language }, // Update the language field directly
        { upsert: true } // Create the document if it doesn't exist
        );
    }
}
export var LanguagesList;
(function (LanguagesList) {
    LanguagesList["English"] = "en";
    LanguagesList["Spanish"] = "es";
    LanguagesList["French"] = "fr";
    LanguagesList["German"] = "de";
    LanguagesList["Portuguese"] = "pt";
    LanguagesList["Russian"] = "ru";
    LanguagesList["Chinese"] = "zh";
    LanguagesList["Arabic"] = "ar";
    LanguagesList["Hindi"] = "hi";
    LanguagesList["Japanese"] = "ja";
    LanguagesList["Italian"] = "it";
    LanguagesList["Korean"] = "ko";
    LanguagesList["Turkish"] = "tr";
    LanguagesList["Vietnamese"] = "vi";
    LanguagesList["Thai"] = "th";
    LanguagesList["Indonesian"] = "id";
})(LanguagesList || (LanguagesList = {}));
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
export function getLanguageNameInEnglish(code) {
    const languageEntry = Object.entries(LanguagesList).find(([, value]) => value === code);
    return languageEntry ? languageEntry[0] : undefined;
}
// Function to get the native language name
export function getNativeLanguageName(code) {
    return TranslatedLanguages[code];
}
