# Control Comercial · iterative.

Tablero web para que cada comercial siga sus oportunidades por etapas (E0 → E7 del Playbook Comercial) y el supervisor audite el proceso todos los días. Destino: **https://comercial.iterativeco.com**

## Qué hace

| Rol | Puede |
|-----|-------|
| **Comercial** | Ver solo sus oportunidades en el tablero por etapas · abrir cada cliente con su **diagrama de flujo** · marcar los requisitos de salida de la etapa · agendar el siguiente paso (obligatorio) · avanzar de etapa, iniciar piloto o cerrar como perdida · escribir notas en la bitácora. |
| **Supervisor** | Todo lo anterior para todo el equipo · **Auditoría diaria**: oportunidades en rojo, % con siguiente paso, resumen por comercial, embudo de conversión y actividad del día · marcar cada oportunidad como auditada hoy · reasignar y reabrir oportunidades. |

### Cada cliente es un caso completo

Al abrir una oportunidad hay cinco pestañas:

| Pestaña | Qué contiene |
|---------|--------------|
| **Seguimiento** | Diagrama de flujo E0 → E7, requisitos de salida, siguiente paso, cierre como perdida y bitácora. |
| **Dimensionamiento** | Reemplaza la matriz Excel: finanzas y CMD, escalera de inversión, sedes y hardware, retorno, ventas perdidas y viabilidad del piloto. Los resultados se recalculan al escribir. |
| **Datos de la propuesta** | Dolores, comité, fechas, condiciones comerciales y datos de ingeniería. |
| **Documentos** | Genera P1 (Deck), P2 (Anexo Económico), P3 (Anexo Técnico) y los 4 one-pagers por rol en PowerPoint con la marca. Cada versión queda en el historial con quién la generó y cuándo, y se descarga idéntica después. |
| **Correos y WhatsApp** | Las plantillas del playbook (citación, pre-presentación, resumen, secuencia S1–S6 y control semanal) llenas con los datos del caso, listas para copiar. |

Al guardar el caso, el valor y la opción de la oportunidad se actualizan con la inversión recomendada, y el pipeline refleja esos montos.

La pestaña **Documentos** también genera los **activos de nutrición** del seguimiento semanal:

| Activo | Formato | Se envía |
|--------|---------|----------|
| A1 · Calculadora de Caja Inmovilizada | Excel con fórmulas, prellenado con los datos del cliente | Semana 1 (correo S1) |
| A2 · Caso de éxito + guion de video | PowerPoint A4, 2 páginas (requiere autorización escrita del cliente referenciado) | Semana 2 (S2) |
| A3 · Guía de conciliación ante revisoría fiscal | PowerPoint A4, 4 páginas con cronograma y modelo de acta | Semana 3 (S3) |
| A4 · Comparativo de entrada | PowerPoint A4, 1 página | Semana 4 (S4) |

### Tarifario (rúbrica de precios) · réplica de la matriz "Costos Iterative SAS" (FLEX)

Menú **Tarifario**: reglas de dimensionamiento (1 antena cada 48 m², 2 antenas por lector de 4 puertos, 5 m de cable y 15 RJ45 por antena), costos de hardware importado y local, importación, etiquetas, obra civil, software, multiplicadores de venta, impuestos y gastos operativos mensuales.

- **Costeo por caso:** con la TRM del día de la operación (botón *Consultar TRM de hoy*, fuente Superfinanciera en datos.gov.co, o escrita a mano), las sedes (metraje por piso × pisos, pistolas, unidades a rastrear) y la mezcla de etiquetas. Bodega 1 = primera sede; Multisede = todas las sedes, con software, flete y seguro una sola vez.
- **Precio sugerido del proyecto** = hardware ×2,75 (incluye flete, seguro y agente aduanero) + software ×2,1 + obra civil ×1,5. **Etiquetas y su mano de obra se cotizan aparte ×1,75.** El IVA de importación, el de la nacionalización del lector y el de las compras locales (PC, UPS, switch, Zebra) no suman al costo: se descuentan.
- **Mínimo sin aprobación:** hardware ×2,35 y etiquetas ×1,75 (ajustables). Por debajo, P1, P2 y A4 se bloquean hasta que el supervisor apruebe los precios.
- **Control interno:** IVA generado, IVA descontable, IVA a pagar, retención en la fuente, ICA, utilidad y meses de gastos operativos cubiertos.
- **Permisos:** el comercial solo propone cambios (con motivo); el supervisor aprueba o rechaza, y cada versión queda en el historial.
- **Diagnóstico y piloto** (método propuesto, ajustable): costo directo ×1,5, abonable 100 % al proyecto. Diagnóstico = (días en sitio × personas × horas + horas de informe) × hora de ingeniería + un viaje. Piloto = costo de la sección Piloto del caso (equipos, etiquetas, ingeniería y viajes).

Reglas que aplica (Playbook, secciones 0 y 6):

- No se avanza de etapa sin cumplir los requisitos de salida **y** sin siguiente paso con fecha futura.
- Semáforo: **rojo** si no hay siguiente paso, está vencido o se superó el tiempo máximo de la etapa; **amarillo** al pasar el 75 % del tiempo máximo.
- Nada se borra: las oportunidades se cierran como *Perdida* con motivo, y la bitácora no se puede editar.

## Probarlo en su computador (modo demo)

Sin configurar nada, la app arranca con datos de ejemplo guardados en el navegador.

```bash
npm install
npm run dev
```

Abra http://localhost:5173 y entre con cualquiera de los perfiles de ejemplo.

## Puesta en producción en comercial.iterativeco.com

Necesita acceso a: **Supabase** (base de datos), **GitHub** (código), **Vercel** (donde ya está publicado iterativeco.com) y **Hostinger** (donde se administra el dominio).

### 1. Base de datos en Supabase

1. Cree una cuenta en https://supabase.com y un proyecto nuevo (región *South America (São Paulo)*). Guarde la contraseña de la base de datos.
2. Vaya a **SQL Editor → New query**, pegue el contenido de `supabase/schema.sql` y presione **Run**.
3. Vaya a **Authentication → Providers → Email** y desactive *Allow new users to sign up* (solo el administrador crea usuarios).
4. Cree cada usuario en **Authentication → Users → Add user** (correo y contraseña, marque *Auto Confirm User*).
5. Asigne nombre y rol a cada usuario en el **SQL Editor** (ejemplo al final de `schema.sql`):

   ```sql
   insert into public.perfiles (id, nombre, email, rol)
     select id, 'Director Comercial', email, 'supervisor' from auth.users where email = 'director@iterativeco.com';
   ```

6. En **Project Settings → API** copie la *Project URL* y la *anon public key*.

### 2. Código en GitHub

Suba esta carpeta a un repositorio privado nuevo (por ejemplo `iterative-comercial`). El archivo `.gitignore` ya excluye `node_modules`, `dist` y los archivos `.env`.

### 3. Publicación en Vercel

1. En Vercel: **Add New → Project →** importe el repositorio. Vercel detecta Vite solo.
2. En **Environment Variables** agregue:
   - `VITE_SUPABASE_URL` = Project URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` = anon public key
3. **Deploy**.
4. En el proyecto: **Settings → Domains → Add** → `comercial.iterativeco.com`. Vercel mostrará el registro DNS que necesita (normalmente un CNAME hacia `cname.vercel-dns.com`).

### 4. Subdominio en Hostinger

1. En hPanel: **Dominios → iterativeco.com → DNS / Nameservers → Administrar registros DNS**.
2. Agregue un registro:
   - Tipo: **CNAME** · Nombre: **comercial** · Apunta a: el valor que indicó Vercel (ej. `cname.vercel-dns.com`) · TTL: 3600
3. Espere la propagación (minutos a pocas horas). Vercel emite el certificado HTTPS automáticamente cuando el registro queda activo.

### 5. Verificación

- Entre con un comercial: solo debe ver sus oportunidades.
- Entre con el supervisor: debe ver todo y la pestaña **Auditoría diaria**.
- En Supabase → Table Editor → `eventos` debe aparecer cada cambio con autor y hora.

## Estructura

```
src/config/etapas.ts      Etapas, requisitos de salida, tiempos máximos y probabilidades (editar aquí)
src/lib/reglas.ts         Semáforo, alertas y bloqueos de avance
src/lib/localRepo.ts      Modo demo (navegador)
src/lib/supabaseRepo.ts   Conexión con Supabase
src/caso/tipos.ts         Datos de un caso (entradas de la antigua matriz) y valores por defecto
src/caso/calculo.ts       Fórmulas de la matriz (CMD, días que pagan, sedes, retorno, piloto) y variables [TOKEN]
src/docs/                 Generadores de P1, P2, P3, one-pagers y plantillas de correos
src/components/           Pantallas: Pipeline, Detalle (pestañas del caso), Nueva, Auditoría, Login
supabase/schema.sql       Tablas, seguridad por rol (RLS) y bitácora
```

Para cambiar una etapa o un requisito, edite `src/config/etapas.ts` y vuelva a publicar (Vercel publica solo al subir cambios a GitHub).
