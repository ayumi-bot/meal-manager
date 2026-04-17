-- Storageバケット作成
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict do nothing;

-- 誰でもアップロード・閲覧できるポリシー
create policy "Public upload" on storage.objects
  for insert with check (bucket_id = 'images');

create policy "Public read" on storage.objects
  for select using (bucket_id = 'images');

create policy "Public update" on storage.objects
  for update using (bucket_id = 'images');

create policy "Public delete" on storage.objects
  for delete using (bucket_id = 'images');

-- profilesテーブルに画像カラム追加
alter table profiles
  add column if not exists avatar_url text,
  add column if not exists bg_image_url text;
