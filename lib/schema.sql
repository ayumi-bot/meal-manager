-- ユーザープロフィール
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  height_cm numeric not null,
  weight_kg numeric not null,
  age integer not null,
  gender text not null check (gender in ('male', 'female')),
  activity_level text not null check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  is_muscle_training boolean not null default false,
  daily_calorie_goal integer not null,
  daily_protein_goal integer not null,
  daily_fat_goal integer not null,
  daily_carbs_goal integer not null,
  created_at timestamptz default now()
);

-- 食品データベース
create table if not exists food_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  calories_per_100g numeric not null,
  protein_per_100g numeric not null default 0,
  fat_per_100g numeric not null default 0,
  carbs_per_100g numeric not null default 0,
  fiber_per_100g numeric not null default 0,
  sodium_per_100g numeric not null default 0,
  is_custom boolean not null default false,
  created_at timestamptz default now()
);

-- 食事記録
create table if not exists meal_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  date date not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  food_item_id uuid references food_items(id),
  quantity_g numeric not null,
  calories numeric not null,
  protein numeric not null default 0,
  fat numeric not null default 0,
  carbs numeric not null default 0,
  fiber numeric not null default 0,
  sodium numeric not null default 0,
  cost numeric,
  created_at timestamptz default now()
);

-- 食費記録
create table if not exists expense_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  date date not null,
  store_name text not null,
  amount integer not null,
  memo text,
  created_at timestamptz default now()
);

-- 月予算
create table if not exists monthly_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  year integer not null,
  month integer not null,
  budget integer not null,
  unique(user_id, year, month)
);

-- サンプル食品データ（日本の一般的な食品）
insert into food_items (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, fiber_per_100g, sodium_per_100g) values
  ('白米（炊いたもの）', 168, 2.5, 0.3, 37.1, 0.3, 0.001),
  ('食パン', 264, 9.3, 4.4, 46.7, 2.3, 0.5),
  ('鶏むね肉（皮なし）', 108, 23.3, 1.9, 0, 0, 0.04),
  ('鶏もも肉（皮なし）', 127, 22.0, 4.3, 0, 0, 0.07),
  ('豚ロース', 263, 19.3, 19.2, 0.2, 0, 0.06),
  ('牛もも肉', 215, 19.5, 14.4, 0.4, 0, 0.06),
  ('鮭（生）', 133, 22.3, 4.1, 0.1, 0, 0.08),
  ('マグロ（赤身）', 125, 26.4, 1.4, 0.1, 0, 0.05),
  ('卵', 151, 12.3, 10.3, 0.3, 0, 0.14),
  ('牛乳', 67, 3.3, 3.8, 4.8, 0, 0.04),
  ('ヨーグルト（無糖）', 62, 3.6, 3.0, 4.9, 0, 0.05),
  ('木綿豆腐', 72, 6.6, 4.2, 1.6, 0.4, 0.01),
  ('納豆', 200, 16.5, 10.0, 12.1, 6.7, 0),
  ('ブロッコリー', 33, 4.3, 0.5, 5.2, 4.4, 0.02),
  ('ほうれん草', 20, 2.2, 0.4, 3.1, 2.8, 0.02),
  ('トマト', 19, 0.7, 0.1, 4.7, 1.0, 0.004),
  ('キャベツ', 23, 1.3, 0.2, 5.2, 1.8, 0.005),
  ('にんじん', 39, 0.7, 0.1, 9.3, 2.8, 0.04),
  ('じゃがいも', 76, 1.8, 0.1, 17.6, 1.3, 0.001),
  ('バナナ', 86, 1.1, 0.2, 22.5, 1.1, 0),
  ('りんご', 57, 0.2, 0.1, 15.5, 1.4, 0),
  ('みかん', 46, 0.7, 0.1, 12.0, 1.0, 0.001),
  ('オートミール', 380, 13.7, 5.7, 69.1, 9.4, 0.001),
  ('そば（ゆで）', 132, 4.8, 1.0, 26.0, 2.0, 0.001),
  ('うどん（ゆで）', 105, 2.6, 0.4, 21.6, 0.8, 0.001),
  ('パスタ（ゆで）', 165, 5.8, 0.9, 32.2, 1.5, 0.001),
  ('鶏ささみ', 114, 24.6, 1.1, 0, 0, 0.05),
  ('ツナ缶（水煮）', 71, 16.0, 0.7, 0.1, 0, 0.27),
  ('サラダチキン', 116, 24.8, 1.8, 0.5, 0, 0.27),
  ('プロテイン（ホエイ）', 380, 75.0, 5.0, 10.0, 0, 0.2)
on conflict do nothing;
