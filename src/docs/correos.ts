// Correos y mensajes del Playbook (sección 5), con las variables del caso.
// Lo que queda entre [CORCHETES] se completa a mano antes de enviar.

export interface Plantilla {
  id: string;
  grupo: "Antes de la propuesta" | "Seguimiento semanal post-propuesta" | "Control semanal";
  nombre: string;
  canal: "Email" | "WhatsApp";
  cuando: string;
  asunto?: string;
  cuerpo: string;
}

const FIRMA = "[NOMBRE_COMERCIAL]\nIterative S.A.S. · [CELULAR]";

export const PLANTILLAS: Plantilla[] = [
  {
    id: "citacion", grupo: "Antes de la propuesta", nombre: "Citación a Reunión 1", canal: "Email", cuando: "Prospecto nuevo, tras la Ficha Pre-Exploración",
    asunto: "inventario [EMPRESA]",
    cuerpo: `[NOMBRE_CEO],

Revisando los estados financieros de [EMPRESA], vimos que crecieron [CRECIMIENTO_CLIENTE_%] frente a [CRECIMIENTO_SECTOR_%] de su sector. Con [N_SEDES] sedes, ese ritmo suele traer un problema concreto: confirmar si una referencia está físicamente, y en qué sede, toma más de lo que el cliente espera.

En [EMPRESA], cada día de inventario representa cerca de $[CMD_M] millones a costo. Ayudamos a distribuidores a ver su inventario en tiempo real dentro de [ERP], con RFID, obra civil e integración incluidas.

¿Le sirve que le mostremos en 30 minutos los números que calculamos para [EMPRESA]?

${FIRMA}
Si prefiere no recibir más correos, responda "no".`,
  },
  {
    id: "pre", grupo: "Antes de la propuesta", nombre: "Correo pre-presentación de propuesta", canal: "Email", cuando: "24–48 h antes de la reunión de decisión",
    asunto: "propuesta [EMPRESA] · [FECHA_REUNION_DECISION]",
    cuerpo: `[NOMBRE_CHAMPION], buenos días.

Antes de vernos el [FECHA_REUNION_DECISION], le anticipo los puntos clave para que pueda comentarlos internamente con [NOMBRE_CEO] y [NOMBRE_CFO].

1. Lo que escuchamos
   [DOLOR_1_TITULO] · [DOLOR_2_TITULO] · [DOLOR_3_TITULO]

2. El número central
   Cada día de inventario cuesta a [EMPRESA] cerca de $[CMD_M] millones. Reducir [DIAS_PAGAN_FASE] días paga la fase que recomendamos.

3. Rango de inversión (antes de IVA)
   · Piloto de 1 mes con informe de conciliación: [PRECIO_PILOTO]
   · Bodega [SEDE_1]: [PRECIO_BODEGA1]
   · Proyecto completo de [N_SEDES] sedes: [PRECIO_TOTAL]

4. Condiciones
   50 % a la firma · 40 % con obra certificada · 10 % solo cuando el conteo RFID supere 95 % de exactitud. Iterative ejecuta el etiquetado inicial y acompaña en sitio a su equipo.

5. Lo que buscamos al final de la reunión
   Acordar cuál de las tres opciones avanza y agendar la visita técnica.

Si hay alguien más que deba estar en la reunión, ¿me confirma su correo para incluirlo en la invitación?

${FIRMA}`,
  },
  {
    id: "confirma", grupo: "Antes de la propuesta", nombre: "Confirmación el día de la reunión", canal: "WhatsApp", cuando: "2 h antes de la reunión",
    cuerpo: "Hola [NOMBRE_CHAMPION], le confirmo nuestra reunión de hoy. Llevamos los números de [EMPRESA] y las tres opciones. ¿Seguimos en pie?",
  },
  {
    id: "resumen", grupo: "Antes de la propuesta", nombre: "Resumen post-presentación", canal: "Email", cuando: "Mismo día, menos de 4 h después",
    asunto: "resumen y siguiente paso",
    cuerpo: `[NOMBRE_CHAMPION], gracias por el espacio de hoy.

Acordamos:
· [ACUERDO_1]
· [ACUERDO_2]
· Siguiente paso: visita técnica el [FECHA_PROPUESTA] (ya está en su calendario).

Adjunto el Deck que presentamos. Le envío por separado el Anexo Económico a [NOMBRE_CFO], como lo conversamos.

${FIRMA}`,
  },
  {
    id: "s1", grupo: "Seguimiento semanal post-propuesta", nombre: "S1 · Calculadora de caja inmovilizada", canal: "Email", cuando: "Semana 1 · martes · Champion + CFO",
    asunto: "caja inmovilizada [EMPRESA]",
    cuerpo: `[NOMBRE_CFO],

Pasé los datos de la visita por la calculadora: con [DIO_REAL] días de inventario y un costo de mercancía por día de $[CMD_M] millones, [EMPRESA] tiene cerca de [CAJA_INMOVILIZADA] en inventario.

Una reducción de [DIAS_PAGAN_FASE] días ([%_REDUCCION] %) paga la fase recomendada. Le dejo la hoja para que la ajuste con sus propios supuestos: [ENLACE_CALCULADORA]

¿Le parece razonable ese porcentaje o lo ve más conservador?

${FIRMA}`,
  },
  {
    id: "s1w", grupo: "Seguimiento semanal post-propuesta", nombre: "S1 · Recordatorio", canal: "WhatsApp", cuando: "Semana 1 · jueves · Champion",
    cuerpo: "Hola [NOMBRE_CHAMPION], ¿alcanzó a ver la calculadora que le envié el martes? Si quiere, la revisamos en 10 minutos por llamada.",
  },
  {
    id: "s2", grupo: "Seguimiento semanal post-propuesta", nombre: "S2 · Video del piloto en operación", canal: "Email", cuando: "Semana 2 · martes · Champion",
    asunto: "así se ve en bodega",
    cuerpo: `[NOMBRE_CHAMPION],

Una pregunta que siempre aparece en el equipo de bodega es cómo cambia su día. Grabamos un conteo con RFID: el auxiliar recorre el pasillo y el [ERP] se actualiza mientras camina.

[ENLACE_VIDEO]

Si le sirve, podemos mostrárselo a su equipo en la bodega para que pregunten lo que quieran.

${FIRMA}`,
  },
  {
    id: "s3", grupo: "Seguimiento semanal post-propuesta", nombre: "S3 · Guía de conciliación ante revisoría fiscal", canal: "Email", cuando: "Semana 3 · martes · CFO",
    asunto: "ajustes de inventario y revisoría",
    cuerpo: `[NOMBRE_CFO],

Cuando una empresa pasa a contar con RFID, el primer conteo suele mostrar diferencias contra el [ERP]. Preparamos una guía de 4 páginas sobre cómo documentar y registrar esos ajustes en su propio calendario, antes del cierre y de la revisión del revisor fiscal.

[ENLACE_GUIA]

¿Le sería útil revisarla 20 minutos con su contador y con nosotros?

${FIRMA}`,
  },
  {
    id: "s3w", grupo: "Seguimiento semanal post-propuesta", nombre: "S3 · Diagnóstico del bloqueo", canal: "WhatsApp", cuando: "Semana 3 · jueves · Champion",
    cuerpo: "[NOMBRE_CHAMPION], para no insistir de más: ¿la decisión está detenida por presupuesto, por tiempos de la junta o por algún tema técnico? Con eso le propongo algo que encaje.",
  },
  {
    id: "s4", grupo: "Seguimiento semanal post-propuesta", nombre: "S4 · Reducir el tamaño de la decisión", canal: "Email", cuando: "Semana 4 · martes · Champion + CEO",
    asunto: "empezar por una bodega",
    cuerpo: `[NOMBRE_CHAMPION],

Cuando un proyecto de [N_SEDES] sedes llega a junta, es normal que la decisión tome tiempo. Dos formas de avanzar sin esperar al presupuesto completo:

· Piloto de 1 mes en [ZONA_PILOTO]: [PRECIO_PILOTO]. Al cierre entregamos el informe de conciliación, y el valor se abona 100 % si deciden seguir en [DIAS_CREDITO] días.
· Bodega [SEDE_1]: [PRECIO_BODEGA1]. Se paga con [D_B1] días menos de inventario y deja el modelo listo para replicar.

Ambas suelen aprobarse sin pasar por junta. ¿Cuál le sirve más llevar a [NOMBRE_CEO]?

${FIRMA}`,
  },
  {
    id: "s5", grupo: "Seguimiento semanal post-propuesta", nombre: "S5 · Costo de esperar", canal: "Email", cuando: "Semana 5 · martes · CFO o CEO",
    asunto: "semanas sin decisión",
    cuerpo: `[NOMBRE_CFO],

Han pasado [SEMANAS] semanas desde que presentamos la propuesta. Con el costo de mercancía por día de [EMPRESA] ($[CMD_M] millones), cada semana sin control mantiene inmovilizado inventario que pudo liberarse.

Lo menciono porque el cálculo fue suyo en la reunión, no para presionar. Si el momento no es ahora, también me sirve saberlo.

${FIRMA}`,
  },
  {
    id: "s5w", grupo: "Seguimiento semanal post-propuesta", nombre: "S5 · Pedir 15 minutos", canal: "WhatsApp", cuando: "Semana 5 · jueves · Champion",
    cuerpo: "[NOMBRE_CHAMPION], ¿tiene 15 minutos esta semana o la próxima para cerrar los puntos pendientes? Le propongo [OPCION_1] o [OPCION_2].",
  },
  {
    id: "s6", grupo: "Seguimiento semanal post-propuesta", nombre: "S6 · Cierre respetuoso", canal: "Email", cuando: "Semana 6 · martes · Champion",
    asunto: "cierro el tema por ahora",
    cuerpo: `[NOMBRE_CHAMPION],

No he tenido respuesta en las últimas semanas, así que entiendo que la prioridad cambió. Voy a cerrar la propuesta en nuestro sistema para no seguir escribiéndole.

Si más adelante quieren retomarla, el diagnóstico y los números de [EMPRESA] quedan guardados y los actualizamos en una semana.

Gracias por el tiempo que le dedicaron.

${FIRMA}`,
  },
  {
    id: "w-rec", grupo: "Control semanal", nombre: "Recordatorio de reunión", canal: "WhatsApp", cuando: "24 h antes de cualquier reunión",
    cuerpo: "Hola [NOMBRE_CHAMPION], mañana nos vemos para [OBJETIVO]. ¿Confirmamos?",
  },
  {
    id: "w-pend", grupo: "Control semanal", nombre: "Pendiente del cliente", canal: "WhatsApp", cuando: "Cuando el cliente debe algo",
    cuerpo: "[NOMBRE_CHAMPION], quedé atento a [PENDIENTE]. ¿Lo tendría para el [FECHA]?",
  },
  {
    id: "w-jur", grupo: "Control semanal", nombre: "Contrato en revisión jurídica", canal: "WhatsApp", cuando: "Etapa E6",
    cuerpo: "[NOMBRE_CHAMPION], ¿jurídica tiene comentarios del contrato? Si ayuda, nuestro abogado puede llamar al suyo esta semana.",
  },
  {
    id: "w-os", grupo: "Control semanal", nombre: "Orden de servicio pendiente", canal: "WhatsApp", cuando: "Etapa E6 → E7",
    cuerpo: "[NOMBRE_CHAMPION], con la orden de servicio firmada antes del [FECHA] mantenemos la fecha de inicio de obra del [FECHA_OBRA].",
  },
];
