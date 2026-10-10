-- Custom thumbnails for two courses (safe to re-run; also covers databases
-- where 0016/0017 were already applied with the default video thumbnails).
update public.courses set thumbnail_url = 'https://i.ytimg.com/vi/2ScoPH2bU7o/hqdefault.jpg?sqp=-oaymwEnCNACELwBSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLCUjRHyXlUZUVRZS--tv7sIYYbPJA'
where youtube_playlist_id = 'PL04UWwXROLWB5rZLQvlO4W2XtTAK4kZl2';

update public.courses set thumbnail_url = 'https://i.ytimg.com/pl_c/PL04UWwXROLWDiTC5Ldf9gs3l__SlbGEgv/studio_square_thumbnail.jpg?sqp=CKTqqdYG-oaymwEICIAKENAFSFqi85f_AwYI2dPDzwY=&rs=AOn4CLA9VsufYNvYUOkrdiYncDBAAjFWGg'
where youtube_playlist_id = 'PL04UWwXROLWDiTC5Ldf9gs3l__SlbGEgv';
