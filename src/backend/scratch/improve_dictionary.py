import json
import os

def improve_dictionary():
    dict_path = r"c:\Users\ASUS\A20-App-075\src\backend\data\vsl_processed.json"
    
    if not os.path.exists(dict_path):
        print(f"Dictionary not found at {dict_path}")
        return

    with open(dict_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    vsl_dict = data.get("dictionary", {})
    synonyms_map = data.get("synonyms", {})
    
    initial_count = len(vsl_dict)
    print(f"Initial dictionary size: {initial_count}")

    # 1. Merge synonyms into dictionary
    merged_count = 0
    for word, similar_list in synonyms_map.items():
        if word in vsl_dict:
            continue
            
        for similar in similar_list:
            if similar in vsl_dict:
                vsl_dict[word] = vsl_dict[similar]
                merged_count += 1
                break
    
    print(f"Merged {merged_count} synonyms into main dictionary.")

    # 2. Add custom tech and common mappings
    custom_mappings = {
        "ai": "thông_minh",
        "trí_tuệ": "thông_minh",
        "nhân_tạo": "giả",
        "học_máy": "học",
        "máy_học": "học",
        "thuật_toán": "phương_pháp",
        "ứng_dụng": "sử_dụng",
        "dữ_liệu": "thông_tin",
        "chào": "chào_mừng",
        "tôi": "tôi",
        "bạn": "bạn",
        "vsl": "ngôn_ngữ_ký_hiệu",
        "cảm_ơn": "cám_ơn",
        "tạm_biệt": "tạm_biệt",
        "xin_lỗi": "xin_lỗi",
        "giới_thiệu": "giới_thiệu",
        "quan_trọng": "quan_trọng",
        "cuộc_sống": "đời_sống",
        "hàng_ngày": "mỗi_ngày"
    }
    
    added_custom = 0
    # Normalize dictionary keys
    space_versions = {}
    for k, v in vsl_dict.items():
        space_key = k.replace("_", " ")
        if space_key != k and space_key not in vsl_dict:
            space_versions[space_key] = v
    vsl_dict.update(space_versions)

    for word, target in custom_mappings.items():
        # Try finding target in current vsl_dict
        target_norm = target.replace(" ", "_")
        target_space = target.replace("_", " ")
        
        found_target = vsl_dict.get(target_norm) or vsl_dict.get(target_space)
        
        if found_target and word not in vsl_dict:
            vsl_dict[word] = found_target
            added_custom += 1
            # Also add space/underscore variations for the new word
            vsl_dict[word.replace("_", " ")] = found_target
            vsl_dict[word.replace(" ", "_")] = found_target

    print(f"Added {added_custom} custom tech/common mappings.")

    # 3. Save updated dictionary
    data["dictionary"] = vsl_dict
    with open(dict_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"Final dictionary size: {len(vsl_dict)} words.")

if __name__ == "__main__":
    improve_dictionary()
