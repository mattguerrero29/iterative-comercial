-- Control Comercial Iterative · acceso solo para correos @iterativeco.com con perfil asignado
-- Ejecutar completo en Supabase → SQL Editor → New query → Run (después de schema.sql).
-- Se puede ejecutar más de una vez sin problema.

-- 1. ¿El usuario actual está autorizado? Correo del dominio + perfil creado por el administrador.
create or replace function public.autorizado() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(lower(auth.jwt() ->> 'email') like '%@iterativeco.com', false)
     and exists (select 1 from public.perfiles where id = auth.uid());
$$;
revoke all on function public.autorizado() from public, anon;
grant execute on function public.autorizado() to authenticated;

-- 2. Los perfiles solo pueden ser de correos del dominio.
alter table public.perfiles drop constraint if exists perfiles_email_dominio;
alter table public.perfiles add constraint perfiles_email_dominio check (lower(email) like '%@iterativeco.com');

-- 3. Políticas restrictivas: se suman a las existentes; sin autorización no se lee ni se escribe nada.
drop policy if exists solo_iterative on public.perfiles;
create policy solo_iterative on public.perfiles as restrictive for all to authenticated
  using (public.autorizado()) with check (public.autorizado());

drop policy if exists solo_iterative on public.oportunidades;
create policy solo_iterative on public.oportunidades as restrictive for all to authenticated
  using (public.autorizado()) with check (public.autorizado());

drop policy if exists solo_iterative on public.eventos;
create policy solo_iterative on public.eventos as restrictive for all to authenticated
  using (public.autorizado()) with check (public.autorizado());

drop policy if exists solo_iterative on public.documentos;
create policy solo_iterative on public.documentos as restrictive for all to authenticated
  using (public.autorizado()) with check (public.autorizado());

drop policy if exists solo_iterative on public.tarifas;
create policy solo_iterative on public.tarifas as restrictive for all to authenticated
  using (public.autorizado()) with check (public.autorizado());

-- 4. Las funciones del tarifario también exigen autorización.
create or replace function public.proponer_tarifa(p_datos jsonb, p_motivo text) returns public.tarifas
language plpgsql security definer set search_path = public as $$
declare v public.tarifas; sup boolean := public.es_supervisor();
begin
  if not public.autorizado() then raise exception 'Usuario no autorizado'; end if;
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
  if not public.autorizado() or not public.es_supervisor() then raise exception 'Solo el supervisor puede aprobar cambios al tarifario'; end if;
  update public.tarifas set estado = case when p_aprobar then 'aprobada' else 'rechazada' end,
         revisor_id = auth.uid(), revisado_at = now()
   where id = p_id and estado = 'pendiente';
  if not found then raise exception 'La propuesta ya no está pendiente'; end if;
end $$;

-- 5. Nadie sin sesión (rol anon) ve ninguna tabla.
revoke all on public.perfiles, public.oportunidades, public.eventos, public.documentos, public.tarifas from anon;
