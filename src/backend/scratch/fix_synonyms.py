import os

# Mapping of corrupted strings to correct Vietnamese
restoration_map = {
    "c?ng_ngh?_th?ng_tin": "công_nghệ_thông_tin",
    "m?y_vitinh": "máy_vitinh",
    "khoa_h?c_m?y_t?nh": "khoa_học_máy_tính",
    "qu?n_tr?_kinh_doanh": "quản_trị_kinh_doanh",
    "t?i_ch?nh": "tài_chính",
    "ng?n_h?ng": "ngân_hàng",
    "kinh_t?": "kinh_tế",
    "gi?ng_vi?n": "giảng_viên",
    "th?y_gi?o": "thầy_giáo",
    "c?_gi?o": "cô_giáo",
    "ph?_gi?o_s?": "phó_giáo_sư",
    "gi?o_s?": "giáo_sư",
    "gi?ng_???ng": "giảng_đường",
    "h?i_tr??ng": "hội_trường",
    "h?c_k?": "học_kỳ",
    "t?n_ch?": "tín_chỉ",
    "?i?m": "điểm",
    "h?c_b?ng": "học_bổng",
    "lu?n_v?n": "luận_văn",
    "??_?n": "đồ_án",
    "quy?n_s?ch": "quyển_sách",
    "ti?u_lu?n": "tiểu_luận",
    "th?c_t?p": "thực_tập",
    "h?c_h?i": "học_hỏi",
    "nghi?n_c?u": "nghiên_cứu",
    "th?_vi?n": "thư_viện",
    "ph?ng_th?_vi?n": "phòng_thư_viện",
    "ph?ng_th?_nghi?m": "phòng_thí_nghiệm",
    "y_khoa": "y_khoa",
    "ph?ng_y_t?": "phòng_y_tế",
    "ngo?i_ng?": "ngoại_ngữ",
    "ti?ng_anh": "tiếng_anh",
    "m?n_ti?ng_vi?t": "môn_tiếng_việt",
    "k?_thu?t_ph?n_m?m": "kỹ_thuật_phần_mềm",
    "h?_th?ng_th?ng_tin": "hệ_thống_thông_tin",
    "an_to?n_th?ng_tin": "an_toàn_thông_tin",
    "tr?_tu?_nh?n_t?o": "trí_tuệ_nhân_tạo",
    "d?_li?u_l?n": "dữ_liệu_lớn",
    "khoa_h?c_t?_nhi?n": "khoa_học_tự_nhiên",
    "khoa_h?c_x?_h?i": "khoa_học_xã_hội",
    "y_d??c": "y_dược",
    "ki?n_tr?c": "kiến_trúc",
    "x?y_d?ng": "xây_dựng",
    "?i?n_t?": "điện_tử",
    "vi?n_th?ng": "viễn_thông",
    "t?_??ng_h?a": "tự_động_hóa",
    "c?_kh?": "cơ_khí",
    "h?a_h?c": "hóa_học",
    "sinh_h?c": "sinh_học",
    "m?i_tr??ng": "môi_trường",
    "du_l?ch": "du_lịch",
    "kh?ch_s?n": "khách_sạn",
    "k?_t?c_x?": "ký_túc_xá",
    "h?c_ph?": "học_phí",
    "??ng_k?_m?n_h?c": "đăng_ký_môn_học",
    "b?ng_?i?m": "bảng_điểm",
    "ch?ng_ch?": "chứng_chỉ",
    "b?ng_c?_nh?n": "bằng_cử_nhân",
    "b?ng_th?c_s?": "bằng_thạc_sĩ",
    "b?ng_ti?n_s?": "bằng_tiến_sĩ",
    "nghi?n_c?u_sinh": "nghiên_cứu_sinh",
    "tr??ng_h?c": "trường_học",
    "c?_h?i": "cơ_hội",
    "gi?i_thi?u": "giới_thiệu",
    "vitinh": "vi_tính",
}

syn_path = r"c:\Users\ASUS\A20-App-075\data\VSL_HamNoSys\Synonyms.txt"
with open(syn_path, 'r', encoding='utf-8', errors='replace') as f:
    lines = f.readlines()

fixed_lines = []
for line in lines:
    fixed_line = line
    for corrupted, correct in restoration_map.items():
        fixed_line = fixed_line.replace(corrupted, correct)
    fixed_lines.append(fixed_line)

with open(syn_path, 'w', encoding='utf-8') as f:
    f.writelines(fixed_lines)

print(f"Successfully fixed {len(lines)} lines in Synonyms.txt")
