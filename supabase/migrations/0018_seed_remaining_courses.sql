-- Seed: remaining courses from the Guided Pathways playlists, in teaching order.
-- Requires 0016_create_courses.sql.

insert into public.courses (title, description, instructor, youtube_playlist_id, thumbnail_url, sort_order)
values ('Al-Da'' wa al-Dawa'' (Arabic Course)', 'An Arabic language course built around the book Al-Da'' wa al-Dawa'', with grammar sessions included.', 'Guided Pathways', 'PL04UWwXROLWAKT6oDPSoD-jr7RqifG3e1', 'https://i.ytimg.com/vi/qk3gcf799_k/hqdefault.jpg', 3)
on conflict (youtube_playlist_id) do nothing;

insert into public.course_lessons (course_id, position, title, youtube_video_id)
select c.id, v.position, v.title, v.vid
from public.courses c
cross join (values

  (1, 'Class 1', 'qk3gcf799_k'),
  (2, 'Class 2', 'WFLQhI1mUpA'),
  (3, 'Class 3', 'ZFp87MFINMk'),
  (4, 'Class 4', 'qTUNcQe7MLE'),
  (5, 'Class 5', 'szi6LKzsVdg'),
  (6, 'Class 8', 'zZNLlYZprk4'),
  (7, 'Class 9', '_-8y_kjB5Aw'),
  (8, 'Class 10 + Grammar', '_7Sy9c2aeuc'),
  (9, 'Class 11', 'uBRkiPTpyMY'),
  (10, 'Class 12', 'sZgTdAGRBSg'),
  (11, 'Class 13', 'd-7IdT-BsRI'),
  (12, 'Class 14', '8NR6zdDCQ1g'),
  (13, 'Class 15 + Grammar', 'ELjcNXCsK9s'),
  (14, 'Class 16', 'SBImwqVwGhM'),
  (15, 'Class 17 + Grammar', 'GhAr3BbMLtg'),
  (16, 'Class 18', 'm-dJ3MI4Kzk'),
  (17, 'Class 19', 'M_bgwV1i4YM'),
  (18, 'Class 20', 'HLfOOSCehhs'),
  (19, 'Class 21', 'uZpACOF-lN0'),
  (20, 'Class 22', 'LmMzCkkSdRA'),
  (21, 'Class 23', 'xlx8sGHD2m8'),
  (22, 'Class 24', 'gyuUCqJVPCI')
) as v(position, title, vid)
where c.youtube_playlist_id = 'PL04UWwXROLWAKT6oDPSoD-jr7RqifG3e1'
on conflict (course_id, position) do nothing;

insert into public.courses (title, description, instructor, youtube_playlist_id, thumbnail_url, sort_order)
values ('Qasas-un-Nabiyyin (Arabic)', 'Learn Arabic through Qasas-un-Nabiyyin, the stories of the Prophets, alongside Al-Ajrumiyyah grammar.', 'Guided Pathways', 'PL04UWwXROLWAOthnLeKOBX2EmI2Z688Je', 'https://i.ytimg.com/vi/XlAWYmr-gbw/hqdefault.jpg', 4)
on conflict (youtube_playlist_id) do nothing;

insert into public.course_lessons (course_id, position, title, youtube_video_id)
select c.id, v.position, v.title, v.vid
from public.courses c
cross join (values

  (1, 'Class 1', 'XlAWYmr-gbw'),
  (2, 'Class 2', 'mnU71YA-X8E'),
  (3, 'Class 3', 'WBfbn6LztzI'),
  (4, 'Class 4', '_csNezhEb5g'),
  (5, 'Class 5', 'BP2cc2dfY_A'),
  (6, 'Class 6', 'd-R2cNQa6Vo'),
  (7, 'Class 7 (Part 1)', '-vl3Hg4Ya7g'),
  (8, 'Class 7 (Part 2)', 'a4ZWCSJbHbE'),
  (9, 'Class 8', 'oJ0SbZRrHzk'),
  (10, 'Class 9', '5BlRidMSNEI'),
  (11, 'Class 10', 'c2UCYh9ewNA'),
  (12, 'Class 11', '8LWQ2onILU8'),
  (13, 'Class 12', '948aDqJJwgA'),
  (14, 'Class 13', 'Do6kXz84Iqo'),
  (15, 'Class 14', 'thg9PJxTrmo'),
  (16, 'Class 15', 'hEDMN-WuCSY'),
  (17, 'Class 16', '12kyiITFd2Q'),
  (18, 'Class 17', '9JqmZTDhS6s'),
  (19, 'Class 18', 'aAxPirnWxps'),
  (20, 'Class 19', '8VSNpVsn3WI'),
  (21, 'Class 20', '-RW6tVVE_T0'),
  (22, 'Class 21', 'Fzy7ppKiQgk'),
  (23, 'Class 22', 'sIF2iLFTmYA'),
  (24, 'Class 23', 'YznWpW1JZwQ'),
  (25, 'Class 24', 'yiM4rLmZQpc'),
  (26, 'Class 25', 'uQHnTJt6OWo'),
  (27, 'Class 26 + Al-Ajrumiyyah (Grammar)', 'yW5Euz1SC3w'),
  (28, 'Class 27', 'HgnaYQoy9cQ'),
  (29, 'Class 28 + Al-Ajrumiyyah (Grammar)', '2JLutJgv-Yk'),
  (30, 'Class 29 + Al-Ajrumiyyah (Grammar)', 'U4VhfRano80'),
  (31, 'Class 30', 'cISs0D37QTs'),
  (32, 'Class 31 + Al-Ajrumiyyah (Grammar)', '3wmjAGm8vvk'),
  (33, 'Class 32', 'bjoYB806aWs'),
  (34, 'Class 33 + Al-Ajrumiyyah (Grammar)', 'X9CMICeTxy4'),
  (35, 'Class 34', '45cml_C9Yr4'),
  (36, 'Class 35', '19X-6MNN2fs'),
  (37, 'Class 36', '7CQSuWdWVjM')
) as v(position, title, vid)
where c.youtube_playlist_id = 'PL04UWwXROLWAOthnLeKOBX2EmI2Z688Je'
on conflict (course_id, position) do nothing;

insert into public.courses (title, description, instructor, youtube_playlist_id, thumbnail_url, sort_order)
values ('Al-Aqeedah Al-Wasitiyyah', 'A study of Shaykh al-Islam Ibn Taymiyyah''s Al-Aqeedah Al-Wasitiyyah: the pillars of faith, the divine names and attributes, and the way of Ahl as-Sunnah.', 'Guided Pathways', 'PL04UWwXROLWCNtBHjs5J35i4HHySezniL', 'https://i.ytimg.com/vi/9erUkZsrwdA/hqdefault.jpg', 5)
on conflict (youtube_playlist_id) do nothing;

insert into public.course_lessons (course_id, position, title, youtube_video_id)
select c.id, v.position, v.title, v.vid
from public.courses c
cross join (values

  (1, 'Introductory Class', '9erUkZsrwdA'),
  (2, 'Imaan', 'X2jStoRI53c'),
  (3, 'Types of Tawheed', '5qbpzHxdnFU'),
  (4, 'Existence of Allah', 'YXlM-zextKk'),
  (5, 'Tawheed Ar Rabubiyyah', '8_BL3sCYKfg'),
  (6, 'Tawheed al-Asma wa as-Sifaat (Part 1)', '3Lld5JaDsBA'),
  (7, 'Tawheed al-Asma wa as-Sifaat (Part 2)', 'KH2UCptDAvY'),
  (8, 'Tawheed al-Asma wa as-Sifaat (Part 3)', '_sYPOg9UP8c'),
  (9, 'Tawheed al-Asma wa as-Sifaat (Part 4)', 'PeR4hi9v87U'),
  (10, 'Tawheed al-Asma wa as-Sifaat (Part 5)', 'AMzqewzVVHs'),
  (11, 'Tawheed al-Asma wa as-Sifaat (Part 6)', 'XzMmY2eU6LU'),
  (12, 'Tawheed al-Asma wa as-Sifaat (Part 7)', 'f_GagbbN1ro'),
  (13, 'Tawheed e Uloohiyat', 'RQxT6R4SmZQ'),
  (14, 'Farishto per Imaan', '-E8LLyziMRs'),
  (15, 'Kitaab per Imaan', '6PXIqG_RM2U'),
  (16, 'Imaan on Rasool', 'TEeDTIX8Sr4'),
  (17, 'Obeying Rasool (S.A.W)', 'ZZzilo6ipD4'),
  (18, 'Taqdeer per Imaan', 'ClIw89nSsNs'),
  (19, 'Akhirat per Imaan', 'IsQAVyITQjY'),
  (20, 'Sahaba', '8XDhuRjuRcs'),
  (21, 'Manhaj', 'TD80Vkgwvtk'),
  (22, 'Muslim Sects – Last Class (Part 1)', 'YPDqI7pm-J4'),
  (23, 'Muslim Sects – Last Class (Part 2)', 'XiFfiAS9rWw'),
  (24, 'Muslim Sects – Last Class (Part 3)', 'zegeY3nHueU')
) as v(position, title, vid)
where c.youtube_playlist_id = 'PL04UWwXROLWCNtBHjs5J35i4HHySezniL'
on conflict (course_id, position) do nothing;

insert into public.courses (title, description, instructor, youtube_playlist_id, thumbnail_url, sort_order)
values ('Tafseer of the 30th Para (Juz Amma)', 'Tafseer of the short surahs of the 30th para, from Surah An-Naba to Surah Al-Qari''ah.', 'Guided Pathways', 'PL04UWwXROLWDXlYM24P4sVQC_x8O4fuBU', 'https://i.ytimg.com/vi/3Ei8Vr9dg0w/hqdefault.jpg', 6)
on conflict (youtube_playlist_id) do nothing;

insert into public.course_lessons (course_id, position, title, youtube_video_id)
select c.id, v.position, v.title, v.vid
from public.courses c
cross join (values

  (1, 'Surah An-Naba (Part 1)', '3Ei8Vr9dg0w'),
  (2, 'Surah An-Naba (Part 2)', 'YJm0pLOWOaE'),
  (3, 'Surah An-Naba (Part 3)', 'mENgT0lUqKI'),
  (4, 'Surah An-Nazi''at', 'jjM4Zc1VRxk'),
  (5, 'Surah Abasa (Part 2)', 'TVCVEsxEqZc'),
  (6, 'Surah At-Takwir (Part 1)', 'sY3vOLpPqQM'),
  (7, 'Surah At-Takwir (Part 2)', 'QrSl--vTVEA'),
  (8, 'Surah Infitar', 'b_BE6VvMMcY'),
  (9, 'Surah Al-Mutaffifin', 'li1JiQWtNVk'),
  (10, 'Surah Al-Mutaffifin (Part 2)', 'ipNe2Uxqvew'),
  (11, 'Surah Inshiqaq', 'xxKd_jdoHsQ'),
  (12, 'Surah Tariq', 'DA56MEssOBM'),
  (13, 'Surah Al-Ala (Part 1)', 'NJoyRuIqBgA'),
  (14, 'Surah Al-Ala (Part 2)', 'ooLYQD772DI'),
  (15, 'Surah Al-Ghashiyah (Part 1)', 'G0PnQ_LRROI'),
  (16, 'Surah Al-Ghashiyah (Part 2)', 'Q1uVH7a8zCs'),
  (17, 'Surah Al-Fajr (Part 2)', 'JQWnM3Izj8A'),
  (18, 'Surah Ash-Shams (Part 2)', 'LxEAkBP_imU'),
  (19, 'Surah Al-Layl (Part 1)', 'CUOcTT_-gak'),
  (20, 'Surah Al-Layl (Part 2)', 'RAhfTipe6Gw'),
  (21, 'Surah Ad-Duhaa', 'U4KfQy9bPhg'),
  (22, 'Surah Ash-Sharh', 'Loy3_ZKY_2M'),
  (23, 'Surah At-Tin (Part 2)', 'LkgHv47ByvE'),
  (24, 'Surah Al-''Alaq (Part 1)', '_kHfGV8dpCE'),
  (25, 'Surah Al-''Alaq (Part 2)', 'seXpt4FS_WQ'),
  (26, 'Surah Al-Qadr', 'xSIcJXUeBt8'),
  (27, 'Surah Al-Bayyinah (Part 1)', '6BaAG4wUhn4'),
  (28, 'Surah Al-Bayyinah (Part 2)', 'PKs6w2yle10'),
  (29, 'Surah Az-Zalzalah', 'OE0aoEmm__Y'),
  (30, 'Surah Al-''Adiyat', 'w7e-xZXEb64'),
  (31, 'Surah Al-Qari''ah', 'EdZc7D513gg')
) as v(position, title, vid)
where c.youtube_playlist_id = 'PL04UWwXROLWDXlYM24P4sVQC_x8O4fuBU'
on conflict (course_id, position) do nothing;

insert into public.courses (title, description, instructor, youtube_playlist_id, thumbnail_url, sort_order)
values ('Al-Arba''een an-Nawawiyyah', 'Explanation of Imam an-Nawawi''s collection of forty-two hadith, class by class.', 'Guided Pathways', 'PL04UWwXROLWDt3RzWkOQ_HIK9j_zvcpfo', 'https://i.ytimg.com/vi/c-Rrs8_ZwTA/hqdefault.jpg', 7)
on conflict (youtube_playlist_id) do nothing;

insert into public.course_lessons (course_id, position, title, youtube_video_id)
select c.id, v.position, v.title, v.vid
from public.courses c
cross join (values

  (1, 'Introduction', 'c-Rrs8_ZwTA'),
  (2, 'Class 1', 'O735t3UWRps'),
  (3, 'Class 3', 'jSLjpuay3n4'),
  (4, 'Class 4', 'XvXGpcrdHao'),
  (5, 'Class 5', 'u-qcphhsnG0'),
  (6, 'Class 6', 'W93DIlPlBQA'),
  (7, 'Class 7', '9J1YkAbvIoI'),
  (8, 'Class 8', 'ZnHpQjkbRkc'),
  (9, 'Class 9', 'PfTnMOjsuS4'),
  (10, 'Class 10', 'D4gvpBRYmJk'),
  (11, 'Class 11', 'LHRAfNftC2U'),
  (12, 'Class 12', 'AAC0Z3gRrfA'),
  (13, 'Class 13', '1-4tKhqtUwo'),
  (14, 'Class 14', 'Ks6cNDlHdw4'),
  (15, 'Class 15', '32Ggws5qfp0'),
  (16, 'Class 16', '5Gmwm5TJmxg'),
  (17, 'Class 17', 'SXj-dP_VpdY'),
  (18, 'Class 18', 'oBhVpsnVDQs'),
  (19, 'Class 19', 'NMnqGFZ7_jE'),
  (20, 'Class 20', 'Y2j-KZ6eqyk'),
  (21, 'Class 21', 'xYRC-RT5-0w'),
  (22, 'Class 22', '8CzydV4Jhxw'),
  (23, 'Class 23', '9g928SzcU24'),
  (24, 'Class 24', 'C59eSqyY1fQ'),
  (25, 'Class 25', 'y8fWq0dlycE'),
  (26, 'Class 26', 'igu4jtmsgIg'),
  (27, 'Class 27', 'WQTF-YGoabY'),
  (28, 'Class 28', 'Udu9Ep36boA'),
  (29, 'Class 29', '8j93-kfq54o'),
  (30, 'Class 30', 'cwurnu2L6Kk'),
  (31, 'Class 31', 'WhdNztJft2s'),
  (32, 'Class 32', 'x81YEThqFnc'),
  (33, 'Class 33', '6XV77Vg3-0M'),
  (34, 'Class 34', '88Ck4umFug8'),
  (35, 'Class 35', 'a6cOtNWVcnQ'),
  (36, 'Class 36', 'HbUdDgFUM9A'),
  (37, 'Class 37', '8Hsc0BOikoQ'),
  (38, 'Class 38', '7WoBmsR_MD0'),
  (39, 'Class 39', '9lE16Xb8OwU'),
  (40, 'Class 40', 'QcIkKyL8fdQ'),
  (41, 'Class 41', 'F-7zSfSEUJw'),
  (42, 'Class 42', '5scjH5QO7ps'),
  (43, 'Class 43', 'SFSW0f0vUTE'),
  (44, 'Class 44 (Part 1)', 'abs4Q1Nwk6o'),
  (45, 'Class 44 (Part 2)', 'caNWHZE6pjE')
) as v(position, title, vid)
where c.youtube_playlist_id = 'PL04UWwXROLWDt3RzWkOQ_HIK9j_zvcpfo'
on conflict (course_id, position) do nothing;

insert into public.courses (title, description, instructor, youtube_playlist_id, thumbnail_url, sort_order)
values ('Al-Umdah fi al-Ahkam', 'Hadith-based study of Islamic rulings through Al-Umdah fi al-Ahkam.', 'Guided Pathways', 'PL04UWwXROLWCUy6egb4NZ14m-IEMVFSSX', 'https://i.ytimg.com/vi/xph4FK598tw/hqdefault.jpg', 8)
on conflict (youtube_playlist_id) do nothing;

insert into public.course_lessons (course_id, position, title, youtube_video_id)
select c.id, v.position, v.title, v.vid
from public.courses c
cross join (values

  (1, 'Hadith 1–10', 'xph4FK598tw'),
  (2, 'Hadith 11–20', 'uCrG50ZtJEc'),
  (3, 'Hadith 21–30', 'HiSc56C-clA'),
  (4, 'Hadith 31–40', 'EdNocTVz2tg'),
  (5, 'Hadith 41–50', 'Bwmzy2kh2vo'),
  (6, 'Hadith 50–60', 'Q6-WzzotB_U'),
  (7, 'Hadith 61–70', 'zgXtZl1uyMY'),
  (8, 'Hadith 71–80', '4luZVo6qTqA'),
  (9, 'Hadith 81–90', 'QrJymoODbOo'),
  (10, 'Hadith 91–100', 'SpbCkhc1DoM'),
  (11, 'Hadith 101–110', 'L9CRcn4nHd8'),
  (12, 'Hadith 111–120', 'b8g6Jrb_cTk'),
  (13, 'Hadith 121–130', 'Nc-i25WKilQ'),
  (14, 'Hadith 128–137', 'L-c3Bnu5ypQ'),
  (15, 'Hadith 138–142', 'sr6Xkb-2OTA'),
  (16, 'Hadith 143–151', 'ZCiBhurr8Nc'),
  (17, 'Hadith 152–161', 'QGCkbJI-A30'),
  (18, 'Hadith 162–167', 'W4s0VJjf1n4'),
  (19, 'Hadith 168–173 and 183–189', 'BBuu_nAlOmk'),
  (20, 'Hadith 173–183 (Kitab as-Siyam)', 'FyhdPndvGrU'),
  (21, 'Hadith 189–199', 'oIxdjSiamzc'),
  (22, 'Hadith 200–206', 'OHlX-0Ze3NI'),
  (23, 'Hadith 207–212', 'pc0Duy4uvQw'),
  (24, 'Hadith 213–216', 'TQFKGXzyX6U'),
  (25, 'Hadith 217–224', 'Kfz3J0yi-8U'),
  (26, 'Hadith 225–234', 'GpzBfsfJSCQ'),
  (27, 'Hadith 234–244', '6PQEPzb6JNU'),
  (28, 'Hadith 245–249 (Part 1)', 'Be-qtMfcSos'),
  (29, 'Hadith 245–249 (Part 2)', '5F3qYGWCYuA'),
  (30, 'Hadith 250–251', '3VFEQFCdbp8'),
  (31, 'Hadith 253–259', '7XU-YVKgYHI'),
  (32, 'Hadith 260–264', 'Dz5eGKxY5-I'),
  (33, 'Hadith 265–268', 'KCGdF1e9Q-U'),
  (34, 'Introduction to Riba and its types', 'KvYXjK52CZQ'),
  (35, 'Hadith 269–274', '94uD0DBUE6A'),
  (36, 'Hadith 275–279', 'CO2uX3n8m9Q'),
  (37, 'Hadith 279–283', '0Jw-EpMAnyQ'),
  (38, 'Hadith 284–287', 'i_dmid9I4ls'),
  (39, 'Hadith 288–290', 'zLwtJOj70WU')
) as v(position, title, vid)
where c.youtube_playlist_id = 'PL04UWwXROLWCUy6egb4NZ14m-IEMVFSSX'
on conflict (course_id, position) do nothing;
