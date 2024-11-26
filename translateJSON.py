import json
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
import sys
import os
import urllib.parse

# Global list of commands to preserve
COMMANDS = [
    # Invite Management Commands
    "/bonus invites add",
    "/bonus invites remove",
    "/inviter",
    "/invites",
    "/invited-list", 
    "/who-used",
    "/history",

    # Giveaway Commands
    "/giveaway create",
    "/giveaway end",
    "/giveaway delete", 
    "/giveaway reroll",
    "/giveaway list",

    # Auto Roles Commands
    "/auto-roles add-role",
    "/auto-roles remove-role", 
    "/auto-roles view",

    # Language Commands
    "/language set",
    "/language view",

    # Leaderboard Commands
    "/leaderboard daily",
    "/leaderboard weekly", 
    "/leaderboard monthly",
    "/leaderboard all-time",

    # Reaction Roles Commands
    "/reaction-roles button create",

    # Rewards Commands
    "/rewards add-reward", 
    "/rewards remove-reward",
    "/rewards view",

    # Verification Commands
    "/verification setup simple", 
    "/verification setup question",
    "/verification setup pin",
    "/verification disable",

    # Welcomer Commands (Welcome Messages)
    "/farewell channel set",
    "/farewell channel disable",
    "/farewell message set-server",
    "/farewell message remove-server", 
    "/farewell message view-server",
    "/farewell message set-dm",
    "/farewell message remove-dm", 
    "/farewell message view-dm",
    "/farewell message set-vanity", 
    "/farewell message remove-vanity",
    "/farewell message view-vanity",
    "/farewell embed set-server", 
    "/farewell embed remove-server",
    "/farewell embed view-server", 
    "/farewell embed set-dm",
    "/farewell embed remove-dm", 
    "/farewell embed view-dm",
    "/farewell embed set-vanity", 
    "/farewell embed remove-vanity", 
    "/farewell embed view-vanity",
    "/welcome channel set",
    "/welcome channel disable", 
    "/welcome message set-server",
    "/welcome message remove-server", 
    "/welcome message view-server",
    "/welcome message set-dm", 
    "/welcome message remove-dm",
    "/welcome message view-dm", 
    "/welcome message set-vanity",
    "/welcome message remove-vanity", 
    "/welcome message view-vanity",
    "/welcome embed set-server", 
    "/welcome embed remove-server",
    "/welcome embed view-server", 
    "/welcome embed set-dm",
    "/welcome embed remove-dm", 
    "/welcome embed view-dm",
    "/welcome embed set-vanity", 
    "/welcome embed remove-vanity",
    "/welcome embed view-vanity",

    # Miscellaneous Commands
    "/help",
    "/feedback", 
    "/invite",
    "/placeholders",
    "/vote"
]

LANGUAGE_CODES = [
    "es", "fr", "de", "pt", "ru", "zh", "ar", "hi", 
    "ja", "it", "ko", "tr", "vi", "th", "id"
]

import re

class JSONTranslator:
    def __init__(self, target_language, max_workers=15):
        self.target_language = target_language
        self.max_workers = max_workers
        self._lock = threading.Lock()

    def is_preserved_text(self, text):
        """Check if text should be fully preserved from translation."""
        return text in COMMANDS

    def extract_placeholders(self, text):
        """Extract placeholders while separating translatable parts."""
        # Matches placeholders like {placeholder} or ::placeholder::
        pattern = r"(\{.*?\}|\:\:.*?\:\:)"
        return re.split(pattern, text)

    def translate_text_with_placeholders(self, text):
        """Translate text while preserving placeholders."""
        if not isinstance(text, str) or self.is_preserved_text(text):
            return text

        parts = self.extract_placeholders(text)
        translated_parts = []

        for part in parts:
            if re.match(r"^\{.*?\}$|^\:\:.*?\:\:$", part):  # Preserve placeholders
                translated_parts.append(part)
            elif part.strip():  # Translate non-placeholder parts
                translated_parts.append(self.translate_single_part(part))
            else:  # Preserve whitespace or empty parts exactly as-is
                translated_parts.append(part)

        # Join parts while ensuring spacing is preserved
        result = ''.join(
            part if re.match(r"^\{.*?\}$|^\:\:.*?\:\:$", part) else f' {part} ' if part.strip() else part
            for part in translated_parts
        ).strip()

        return result

    def translate_single_part(self, text):
        """Translate a single text part."""
        if not text or text.isspace():  # Skip empty or whitespace-only strings
            return text

        url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl={self.target_language}&dt=t&q={urllib.parse.quote(text)}"
        try:
            with self._lock:  # Thread-safe API request
                response = requests.get(url)
                translation = response.json()[0][0][0]
            return translation
        except Exception:
            return text

    def translate_recursive(self, obj, parent_key=None):
        """Recursively translate JSON objects while preserving placeholders and commands."""
        if parent_key == 'color' and isinstance(obj, str):  # Ignore translation for 'color' values
            return obj

        if isinstance(obj, dict):
            return {k: self.translate_recursive(v, k) for k, v in obj.items()}
        elif isinstance(obj, list):
            with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                return list(executor.map(lambda x: self.translate_recursive(x), obj))
        elif isinstance(obj, str):
            return self.translate_text_with_placeholders(obj)
        return obj

    def translate_json(self, input_path, output_path):
        """Main translation method."""
        with open(input_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        translated_data = self.translate_recursive(data)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(translated_data, f, ensure_ascii=False, indent=2)



def main():
    # Ensure output directory exists
    output_dir = "./src/languages/"
    os.makedirs(output_dir, exist_ok=True)

    # Input file path
    input_file = "./src/languages/en.json"

    # Translate to all languages
    for language in LANGUAGE_CODES:
        # Output file path
        output_file = os.path.join(output_dir, f"{language}.json")
        
        try:
            print(f"Translating to {language}...")
            translator = JSONTranslator(language)
            translator.translate_json(input_file, output_file)
            print(f"Completed translation for {language}")
        except Exception as e:
            print(f"Error translating to {language}: {e}")

if __name__ == "__main__":
    main()