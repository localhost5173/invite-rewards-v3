import json
import re
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

class JSONTranslator:
    def __init__(self, target_language, max_workers=10):
        self.target_language = target_language
        self.max_workers = max_workers
        self._lock = threading.Lock()

    def extract_placeholders(self, text):
        """Extract placeholders from text."""
        placeholders = re.findall(r'\{[^{}]+\}', text)
        clean_text = re.sub(r'\{[^{}]+\}', '§PLACEHOLDER§', text)
        return clean_text, placeholders

    def restore_placeholders(self, translated_text, original_placeholders):
        """Restore placeholders in translated text."""
        for placeholder in original_placeholders:
            translated_text = translated_text.replace('§PLACEHOLDER§', placeholder, 1)
        return translated_text

    def translate_value(self, text):
        """Translate text using Google Translate API with placeholder handling."""
        if not isinstance(text, str):
            return text

        # Extract placeholders
        clean_text, placeholders = self.extract_placeholders(text)
        
        if not clean_text or clean_text.strip() == '§PLACEHOLDER§':
            return text

        # Translate
        url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl={self.target_language}&dt=t&q={clean_text}"
        try:
            with self._lock:  # Thread-safe API request
                response = requests.get(url)
                translation = response.json()[0][0][0]

            # Restore placeholders
            final_translation = self.restore_placeholders(translation, placeholders)
            return final_translation
        except Exception:
            return text

    def translate_recursive(self, obj):
        """Recursively translate JSON objects."""
        if isinstance(obj, dict):
            return {k: self.translate_recursive(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                return list(executor.map(self.translate_recursive, obj))
        elif isinstance(obj, str):
            return self.translate_value(obj)
        return obj

    def translate_json(self, input_path, output_path):
        """Main translation method."""
        with open(input_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        translated_data = self.translate_recursive(data)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(translated_data, f, ensure_ascii=False, indent=2)

def main():
    import sys
    if len(sys.argv) != 4:
        print("Usage: python script.py <language_code> <input_path> <output_path>")
        sys.exit(1)
    
    language = sys.argv[1]
    input_file = sys.argv[2]
    output_file = sys.argv[3]
    
    translator = JSONTranslator(language)
    translator.translate_json(input_file, output_file)

if __name__ == "__main__":
    main()