import json
import os

def parse_vsl_data(data_path, output_path):
    dictionary_file = os.path.join(data_path, "Dictionary VSL HamNoSys.txt")
    synonyms_file = os.path.join(data_path, "Synonyms.txt")
    
    # Helper to open file with multiple encoding attempts
    def open_file(file_path):
        encodings = ['utf-8', 'utf-8-sig', 'utf-16', 'windows-1258', 'cp1252']
        for enc in encodings:
            try:
                with open(file_path, 'r', encoding=enc) as f:
                    content = f.read()
                    return content.splitlines(), enc
            except UnicodeDecodeError:
                continue
        raise ValueError(f"Could not decode {file_path} with any common encoding.")

    # Parse Dictionary
    vsl_dict = {}
    if os.path.exists(dictionary_file):
        lines, enc = open_file(dictionary_file)
        print(f"Reading dictionary with {enc} encoding...")
        if lines:
            header = lines[0].strip().split('\t')
            for line in lines[1:]:
                parts = line.strip().split('\t')
                if len(parts) >= 9:
                    word = parts[0].lower()
                    vsl_dict[word] = {
                        "mouth": parts[1],
                        "body": parts[2],
                        "head": parts[3],
                        "shoulder": parts[4],
                        "eyegaze": parts[5],
                        "eyebrow": parts[6],
                        "eyelids": parts[7],
                        "hand": parts[8]
                    }
    
    # Parse Synonyms
    synonyms = {}
    if os.path.exists(synonyms_file):
        lines, enc = open_file(synonyms_file)
        print(f"Reading synonyms with {enc} encoding...")
        if len(lines) > 1:
            for line in lines[1:]:
                parts = line.strip().split('\t')
                if len(parts) >= 2:
                    word = parts[0].lower()
                    similar = parts[1].lower()
                    if word not in synonyms:
                        synonyms[word] = []
                    synonyms[word].append(similar)
    
    # Save to JSON
    output_dict = {
        "dictionary": vsl_dict,
        "synonyms": synonyms
    }
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_dict, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully processed {len(vsl_dict)} words and {len(synonyms)} synonym groups.")

if __name__ == "__main__":
    data_dir = r"c:\Users\ASUS\A20-App-075\data\VSL_HamNoSys"
    output_file = r"c:\Users\ASUS\A20-App-075\src\backend\data\vsl_processed.json"
    parse_vsl_data(data_dir, output_file)
