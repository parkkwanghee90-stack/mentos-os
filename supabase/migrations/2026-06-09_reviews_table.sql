-- 대문(랜딩) 후기 + 대시보드 리뷰 작성 공용 테이블.
-- 정책: 작성 즉시 노출(approved 기본 true). 로그인 유저만 본인 명의로 작성 가능.
-- 기존에 수동 생성돼 있을 수 있으므로 모두 idempotent 하게 작성.

create table if not exists public.reviews (
  id          bigint generated always as identity primary key,
  user_id     uuid references auth.users(id) on delete set null,
  name        text not null,
  role        text not null default '학생',
  rating      int  not null check (rating between 1 and 5),
  content     text not null,
  approved    boolean not null default true,   -- 즉시 노출
  created_at  timestamptz not null default now()
);

-- 이미 존재하던 테이블 보강 (컬럼 누락 대비)
alter table public.reviews add column if not exists user_id   uuid references auth.users(id) on delete set null;
alter table public.reviews add column if not exists role      text not null default '학생';
alter table public.reviews add column if not exists approved  boolean not null default true;
alter table public.reviews add column if not exists created_at timestamptz not null default now();

create index if not exists reviews_approved_created_idx
  on public.reviews (approved, created_at desc);

alter table public.reviews enable row level security;

-- 기존(수동 생성 시 만들어졌을 수 있는) 정책을 모두 제거한 뒤 깨끗하게 재정의.
-- 느슨한 insert 정책이 남아 있으면 OR 로 합쳐져 anon 삽입이 통과되므로 반드시 정리.
do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
     where schemaname = 'public' and tablename = 'reviews'
  loop
    execute format('drop policy if exists %I on public.reviews', pol.policyname);
  end loop;
end $$;

-- 조회: 누구나(anon/authenticated) approved=true 만
create policy reviews_select_approved on public.reviews
  for select to anon, authenticated
  using (approved = true);

-- 작성: 로그인 유저, 본인 user_id 로만
create policy reviews_insert_own on public.reviews
  for insert to authenticated
  with check (user_id = auth.uid());

-- PostgREST 스키마 캐시 리로드
notify pgrst, 'reload schema';
