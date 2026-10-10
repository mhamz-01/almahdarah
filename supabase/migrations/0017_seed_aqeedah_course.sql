-- Seed: Ar-Risalah At-Tadmuriyyah (Aqeedah course), in teaching order.
-- Requires 0016_create_courses.sql.

insert into public.courses (title, description, instructor, youtube_playlist_id, thumbnail_url, sort_order)
values (
  'Ar-Risalah At-Tadmuriyyah (Aqeedah)',
  'A study of Shaykh al-Islam Ibn Taymiyyah''s Ar-Risalah At-Tadmuriyyah on Islamic creed, with introductory lessons on the Shaykh and the sects.',
  'Guided Pathways',
  'PL04UWwXROLWDiTC5Ldf9gs3l__SlbGEgv',
  'https://i.ytimg.com/pl_c/PL04UWwXROLWDiTC5Ldf9gs3l__SlbGEgv/studio_square_thumbnail.jpg?sqp=CKTqqdYG-oaymwEICIAKENAFSFqi85f_AwYI2dPDzwY=&rs=AOn4CLA9VsufYNvYUOkrdiYncDBAAjFWGg',
  2
)
on conflict (youtube_playlist_id) do nothing;

insert into public.course_lessons (course_id, position, title, youtube_video_id)
select c.id, v.position, v.title, v.vid
from public.courses c
cross join (values
  (1, 'Introduction of Shaykh al-Islam Ibn Taymiyyah', '6z74C60S4D0'),
  (2, 'Introduction of Shaykh al-Islam Ibn Taymiyyah (Part 2)', '90ND7Bz4cuU'),
  (3, 'Al-Aqeedah Al-Wasitiyyah – Muslim Sects – Last Class (Part 1)', 'YPDqI7pm-J4'),
  (4, 'Al-Aqeedah Al-Wasitiyyah – Muslim Sects – Last Class (Part 2)', 'XiFfiAS9rWw'),
  (5, 'Al-Aqeedah Al-Wasitiyyah – Muslim Sects – Last Class (Part 3)', 'zegeY3nHueU'),
  (6, 'Class 1 – Al-Muqaddimah', 'mvnnI8nx0O0'),
  (7, 'Class 2 – Al-Muqaddimah (Part 2)', '9x8vGvuV3Eo'),
  (8, 'Class 3 – Al-Muqaddimah (Part 3)', 'cmUi5pQujr0'),
  (9, 'Class 4 – Al-Muqaddimah (Part 4)', 'cN0aq2LkADw'),
  (10, 'Class 5 – Methodology of Prophets', 'UGzSZBSWCpk'),
  (11, 'Class 6 – Methodology of Deviant Sects', 'hmOOsheiFOs'),
  (12, 'Class 7 – Implications of Deviance & The Absolute Commonality', 'zAO4Fj661mk'),
  (13, 'Class 8 – The First Principle: One Rule for all Attributes', 'B4-NFDNc39c'),
  (14, 'Class 9 – The First Principle: One Rule for all Attributes (Part 2)', 'atF7mMmVTlE'),
  (15, 'Class 10 – The First Principle: One Rule for all Attributes (Part 3)', 'wGU1hlRFo8o'),
  (16, 'Class 11 – The First Principle: One Rule for all Attributes (Part 4)', 'qssvp85dzWs'),
  (17, 'Class 12 – Second principle: same rule for self and attributes', 'iCFm-aqE4GQ'),
  (18, 'Class 13', 'gPw35iuoG6g'),
  (19, 'Class 14', 'duRGxDvJAsQ'),
  (20, 'Class 15', 'SBTGoQuYirY'),
  (21, 'Class 16', 'Vj8miDWvijk'),
  (22, 'Class 17', 'ULBBx1r1ssM'),
  (23, 'Class 18', 'Zhbri_MYCB0'),
  (24, 'Class 19', 'GTrVfJHN2SA'),
  (25, 'Class 20', 'Vo2fikNoX2I'),
  (26, 'Class 21', '4d-ExUdsgDQ'),
  (27, 'Class 22', '7eILPGFFMW8')
) as v(position, title, vid)
where c.youtube_playlist_id = 'PL04UWwXROLWDiTC5Ldf9gs3l__SlbGEgv'
on conflict (course_id, position) do nothing;
