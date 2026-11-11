create table public.tasks (
    id uuid primary key default gen_random_uuid(),
    created_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
    title text not null check (length(trim(title)) > 0),
    category text not null check (category in ('todo', 'inProgress', 'inReview', 'done')),
    start_date date,
    end_date date,
    content text not null default '',
    priority text not null check (priority in ('low', 'medium', 'high')),
    position integer not null default 0,
 
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
 
    check (end_date is null or start_date is null or end_date >= start_date),
    unique (id, created_by)
);
 
create table public.labels (
    id uuid primary key default gen_random_uuid(),
    created_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
    name text not null check (length(trim(name)) > 0),
    created_at timestamptz not null default now(),
    color text not null default 'gray' check (color in ('gray', 'red', 'orange', 'green', 'blue', 'purple')),
    unique (created_by, name),
    unique (id, created_by)
);
 
create table public.tasks_labels (
    task_id uuid not null,
    label_id uuid not null,
    created_by uuid not null default auth.uid(),
 
    primary key (task_id, label_id),
    foreign key (task_id, created_by)  references public.tasks(id, created_by)  on delete cascade,
    foreign key (label_id, created_by) references public.labels(id, created_by) on delete cascade
);
 
 
create index tasks_board_idx       on public.tasks (created_by, category, position);
create index labels_created_by_idx on public.labels (created_by);
create index tasks_labels_label_idx on public.tasks_labels (label_id);
 
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
 
create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();
 
alter table public.tasks        enable row level security;
alter table public.labels       enable row level security;
alter table public.tasks_labels enable row level security;
 
create policy "own tasks" on public.tasks
for all to authenticated
using      ((select auth.uid()) = created_by)
with check ((select auth.uid()) = created_by);
 
create policy "own labels" on public.labels
for all to authenticated
using      ((select auth.uid()) = created_by)
with check ((select auth.uid()) = created_by);
 
create policy "own task labels" on public.tasks_labels
for all to authenticated
using      ((select auth.uid()) = created_by)
with check ((select auth.uid()) = created_by);


create or replace function public.move_task(p_task_id uuid, p_category text, p_index integer)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user         uuid := auth.uid();
  v_old_category text;
  v_old_index    integer;
  v_count        integer;ß
begin
  select category, position
    into v_old_category, v_old_index
    from public.tasks
   where id = p_task_id and created_by = v_user
     for update;
 
  if not found then
    raise exception 'Task % not found', p_task_id;
  end if;
 
  update public.tasks
     set position = position - 1
   where created_by = v_user
     and category = v_old_category
     and position > v_old_index;
 
  select count(*) into v_count
    from public.tasks
   where created_by = v_user
     and category = p_category
     and id <> p_task_id;
 
  p_index := greatest(0, least(p_index, v_count));
 
  update public.tasks
     set position = position + 1
   where created_by = v_user
     and category = p_category
     and position >= p_index
     and id <> p_task_id;
 
  update public.tasks
     set category = p_category,
         position = p_index
   where id = p_task_id;
end;
$$;
 
create or replace function public.set_task_labels(p_task_id uuid, p_label_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  delete from public.tasks_labels
   where task_id = p_task_id
     and not (label_id = any (p_label_ids));

  insert into public.tasks_labels (task_id, label_id)
  select p_task_id, unnest(p_label_ids)
  on conflict (task_id, label_id) do nothing;
end;
$$;

create or replace function public.close_position_gap()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.tasks
     set position = position - 1
   where created_by = old.created_by
     and category = old.category
     and position > old.position;
  return null;
end;
$$;
 
create trigger tasks_close_position_gap
after delete on public.tasks
for each row execute function public.close_position_gap();