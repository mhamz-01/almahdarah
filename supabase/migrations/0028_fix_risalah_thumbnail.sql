-- The Ar-Risalah At-Tadmuriyyah thumbnail was a signed YouTube playlist URL that
-- expired (404). Serve a copy from /public instead so it can't break again.
update public.courses
  set thumbnail_url = '/assets/courses/ar-risalah-tadmuriyyah.jpg'
  where youtube_playlist_id = 'PL04UWwXROLWDiTC5Ldf9gs3l__SlbGEgv';
