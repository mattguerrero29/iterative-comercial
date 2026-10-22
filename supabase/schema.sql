-- Control Comercial Iterative · esquema de base de datos para Supabase
-- Ejecutar completo en Supabase → SQL Editor → New query → Run.

-- 1. Perfiles (uno por usuario de Supabase Auth)
create table if not exists public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  email text not null,
  rol text not null default 'comercial' check (rol in ('comercial', 'supervisor'))
);

-- 2. Oportunidades
create table if not exists public.oportunidades (
  id uuid primary key default gen_random_uuid(),
  empresa text not null,
  ciudad text,
  ciiu text,
  erp text,
  contacto text,
  valor numeric not null default 0,
  opcion text default 'Por definir',
  etapa text not null default 'E0' check (etapa in ('E0','E1','E2','E3','E4','E5','E6','E7','PIL','X')),
  etapa_desde timestamptz not null default now(),
  owner_id uuid not null references public.perfiles (id),
  siguiente_paso text default '',
  siguiente_fecha date,
  checklist jsonb not null default '{}'::jsonb,
  motivo_perdida text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Bitácora de eventos (solo inserción: no se puede editar ni borrar desde la app)
create table if not exists public.eventos (
  id uuid primary key default gen_random_uuid(),
  oportunidad_id uuid not null references public.oportunidades (id) on delete cascade,
  autor_id uuid not null references public.perfiles (id) default auth.uid(),
  tipo text not null,
  detalle text not null default '',
  created_at timestamptz not null default now()
);

-- Datos del caso (dimensionamiento, retorno, piloto y textos de la propuesta) en un solo documento JSON
alter table public.oportunidades add column if not exists caso jsonb;

-- 3b. Documentos generados (P1, P2, P3, one-pagers). Guardan la foto de los datos para descargarlos idénticos.
create table if not exists public.documentos (
  id uuid primary key default gen_random_uuid(),
  oportunidad_id uuid not null references public.oportunidades (id) on delete cascade,
  tipo text not null check (tipo in ('P1','P2','P3','OP','A1','A2','A3','A4')),
  version int not null,
  datos jsonb not null,
  autor_id uuid not null references public.perfiles (id) default auth.uid(),
  created_at timestamptz not null default now(),
  unique (oportunidad_id, tipo, version)
);
create index if not exists documentos_oportunidad_idx on public.documentos (oportunidad_id, created_at desc);

create index if not exists oportunidades_owner_idx on public.oportunidades (owner_id);
create index if not exists eventos_oportunidad_idx on public.eventos (oportunidad_id, created_at desc);

-- updated_at automático
create or replace function public.tocar_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists oportunidades_updated on public.oportunidades;
create trigger oportunidades_updated before update on public.oportunidades
  for each row execute function public.tocar_updated_at();

-- ¿El usuario actual es supervisor?
create or replace function public.es_supervisor() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and rol = 'supervisor');
$$;

-- 4. Seguridad por filas (RLS)
alter table public.perfiles enable row level security;
alter table public.oportunidades enable row level security;
alter table public.eventos enable row level security;

drop policy if exists perfiles_leer on public.perfiles;
create policy perfiles_leer on public.perfiles for select to authenticated using (true);

-- Comercial: ve y edita solo sus oportunidades. Supervisor: ve y edita todas.
drop policy if exists op_leer on public.oportunidades;
create policy op_leer on public.oportunidades for select to authenticated
  using (owner_id = auth.uid() or public.es_supervisor());
drop policy if exists op_crear on public.oportunidades;
create policy op_crear on public.oportunidades for insert to authenticated
  with check (owner_id = auth.uid() or public.es_supervisor());
drop policy if exists op_editar on public.oportunidades;
create policy op_editar on public.oportunidades for update to authenticated
  using (owner_id = auth.uid() or public.es_supervisor())
  with check (owner_id = auth.uid() or public.es_supervisor());
-- Sin política de DELETE: nadie borra oportunidades desde la app (se marcan como Perdida).

drop policy if exists ev_leer on public.eventos;
create policy ev_leer on public.eventos for select to authenticated
  using (exists (select 1 from public.oportunidades o where o.id = oportunidad_id
                 and (o.owner_id = auth.uid() or public.es_supervisor())));
drop policy if exists ev_crear on public.eventos;
create policy ev_crear on public.eventos for insert to authenticated
  with check (autor_id = auth.uid() and exists (select 1 from public.oportunidades o where o.id = oportunidad_id
                 and (o.owner_id = auth.uid() or public.es_supervisor())));
-- Sin políticas de UPDATE/DELETE en eventos: la bitácora es inalterable desde la app.

alter table public.documentos enable row level security;
drop policy if exists doc_leer on public.documentos;
create policy doc_leer on public.documentos for select to authenticated
  using (exists (select 1 from public.oportunidades o where o.id = oportunidad_id
                 and (o.owner_id = auth.uid() or public.es_supervisor())));
drop policy if exists doc_crear on public.documentos;
create policy doc_crear on public.documentos for insert to authenticated
  with check (autor_id = auth.uid() and exists (select 1 from public.oportunidades o where o.id = oportunidad_id
                 and (o.owner_id = auth.uid() or public.es_supervisor())));
-- Sin UPDATE/DELETE: cada versión generada queda como registro permanente.

-- 4b. Tarifario versionado (costos y márgenes). Solo el supervisor aprueba; los comerciales proponen.
create table if not exists public.tarifas (
  id uuid primary key default gen_random_uuid(),
  version int not null unique,
  datos jsonb not null,
  motivo text not null,
  estado text not null check (estado in ('aprobada', 'pendiente', 'rechazada')),
  autor_id uuid not null references public.perfiles (id),
  revisor_id uuid references public.perfiles (id),
  created_at timestamptz not null default now(),
  revisado_at timestamptz
);
alter table public.tarifas enable row level security;
drop policy if exists tar_leer on public.tarifas;
create policy tar_leer on public.tarifas for select to authenticated using (true);
-- Sin políticas de INSERT/UPDATE/DELETE: los cambios entran solo por las funciones de abajo.

create or replace function public.proponer_tarifa(p_datos jsonb, p_motivo text) returns public.tarifas
language plpgsql security definer set search_path = public as $$
declare v public.tarifas; sup boolean := public.es_supervisor();
begin
  if auth.uid() is null then raise exception 'Debe iniciar sesión'; end if;
  if coalesce(trim(p_motivo), '') = '' then raise exception 'Indique el motivo del cambio'; end if;
  lock table public.tarifas in exclusive mode;
  insert into public.tarifas (version, datos, motivo, estado, autor_id, revisor_id, revisado_at)
  values ((select coalesce(max(version), 0) + 1 from public.tarifas), p_datos, p_motivo,
          case when sup then 'aprobada' else 'pendiente' end, auth.uid(),
          case when sup then auth.uid() end, case when sup then now() end)
  returning * into v;
  return v;
end $$;

create or replace function public.revisar_tarifa(p_id uuid, p_aprobar boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.es_supervisor() then raise exception 'Solo el supervisor puede aprobar cambios al tarifario'; end if;
  update public.tarifas set estado = case when p_aprobar then 'aprobada' else 'rechazada' end,
         revisor_id = auth.uid(), revisado_at = now()
   where id = p_id and estado = 'pendiente';
  if not found then raise exception 'La propuesta ya no está pendiente'; end if;
end $$;

revoke all on function public.proponer_tarifa(jsonb, text) from public, anon;
revoke all on function public.revisar_tarifa(uuid, boolean) from public, anon;
grant execute on function public.proponer_tarifa(jsonb, text) to authenticated;
grant execute on function public.revisar_tarifa(uuid, boolean) to authenticated;

-- 5. Crear usuarios
-- a) En Supabase → Authentication → Users → Add user (correo + contraseña, marcar "Auto Confirm User").
-- b) Luego registre su perfil (cambie correo, nombre y rol):
-- insert into public.perfiles (id, nombre, email, rol)
--   select id, 'Nombre Apellido', email, 'comercial' from auth.users where email = 'comercial@iterativeco.com';
-- insert into public.perfiles (id, nombre, email, rol)
--   select id, 'Director Comercial', email, 'supervisor' from auth.users where email = 'director@iterativeco.com';

-- 6. Tarifario inicial: mientras no haya una versión aprobada, la app usa valores de ejemplo y lo avisa.
--    El supervisor entra a Tarifario → Editar tarifario, carga los costos reales y guarda (queda como versión 1).
