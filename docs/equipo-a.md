# Nuestra parte del proyecto

A - Centros, espacios, horarios y cierres

## Qué hacemos

- Definir los datos y las relaciones de las organizaciones, los centros deportivos que aportan a la aplicación y los espacios reales que existen dentro de cada centro. También definimos los datos sobre sus horarios habituales, además de los datos sobre los cierres extraordinarios que puedan tener.

- Preparar las operaciones para crear y consultar centros y espacios, mostrar sus horarios y registrar los cierres.

- Gestionar los casos en los que el cierre de un espacio cause un conflicto con reservas posibles y confirmadas.

## Conceptos y reglas

### Datos

Una organización es una entidad que controla uno o más centros y los quiere registrar en la aplicación.

- ORGANIZACIÓN (**ID_org**, nombre, teléfono, correo)

Un centro es un lugar controlado por una organización.

- CENTRO (**ID_centro**, nombre, dirección, teléfono, correo, tipo, estado, _ID_org_)

Un espacio es cada zona que se puede reservar o dedicar a una actividad dentro de un centro.

- ESPACIO (**ID_espacio**, nombre, tipo, estado, _ID_centro_)

Los horarios son los períodos en los que se pueden hacer reservas de forma habitual. No necesitan clave propia, están asociados a un espacio (o posiblemente a un centro).

- HORARIO (_ID_espacio_, días, hora_apertura, hora_cierre)

Un cierre es un período extraordinario en el que un espacio (tal vez un centro entero) pasa a estado inactivo.

- CIERRE (**ID_cierre**, fecha_inicio, fecha_fin, motivo, _ID_espacio_)

### Reglas

- El rol de Administración gestiona el proceso de introducir en el sistema a las organizaciones, sus centros, sus espacios y sus horarios.

- El rol de Mantenimiento registra cierres.

- Cada organización, centro, espacio y cierre tiene que tener un identificador único.

- No se puede permitir que se haga una solicitud de reserva para un espacio cerrado, ya sea por su horario habitual o por otro tipo de cierre.

- Cuando un cierre coincide con reservas confirmadas, las reservas pendientes son rechazadas y las reservas confirmadas son canceladas; sus solicitantes reciben una notificación informando del suceso y el motivo.

## Ejemplos de funcionamiento

### Ejemplos de configuraciones

#### **Centro**

| ID centro |   Nombre    |   tlfn    |         correo         | dirección |   tipo   | ID organización |
| :-------: | :---------: | :-------: | :--------------------: | :-------: | :------: | :-------------: |
|    123    | Pabedeporte | 684684684 | pabedeporte@hotmail.es |   xxxx    | pabellón |       25        |

#### **Espacios**

| ID espacios |   Nombre   | estado  |  tipo   |                 descripción                  | ID centro |
| :---------: | :--------: | :-----: | :-----: | :------------------------------------------: | :-------: |
|     211     | Baloncesto | abierto |  pista  |   Cancha de baloncesto que abre de mañana    |    123    |
|     231     |  Natación  | abierto | piscina | Piscina con varias calles que abre de mañana |    123    |

#### **Horario centro**

|      días       | Hora de apertura | Hora de cierre | ID espacio |
| :-------------: | :--------------: | :------------: | :--------: |
|   [L,M,X,J,V]   |       8:00       |     12:30      |    211     |
| [L,M,X,J,V,S,D] |       9:00       |     12:00      |    231     |

#### **Cierres de espacios**

| ID cierre |  fecha   | inicio |  fin  |    motivo     | ID espacio |
| :-------: | :------: | :----: | :---: | :-----------: | :--------: |
|    301    | 20/10/26 |  9:00  | 10:00 | Mantenimiento |    211     |
|    302    | 21/10/26 |  8:00  | 9:00  | Mantenimiento |    211     |
|    303    | 15/10/26 | 10:30  | 12:30 |    Avería     |    231     |

### Ejemplos de cierres

Cuando se registra un cierre de un espacio, hay que comprobar si ya existe una reserva o una sesión que coincida con él. Se comprueba:

- Si la reserva o sesión tiene el mismo ID de espacio que el cierre.
- Si la reserva o sesión es el mismo día que el cierre.
- Si la reserva o sesión y el cierre coinciden en algún momento. Si uno termina justo cuando empieza el otro (por ejemplo, un uso hasta las 9:00 y un cierre desde las 9:00), no hay conflicto.
- Que la reserva o sesión esté aprobada y confirmada.

Los ejemplos de debajo muestran los tipos de cierres más típicos y las distintas formas en
las que pueden afectar a reservas existentes y solicitudes futuras.

#### Ejemplo 1: Avería

En la Piscina del Centro Rede do Porto Norte se ha descubierto una avería.
Mantenimiento registra el cierre de ese espacio desde las 9:00 del lunes hasta las
15:00 del martes. Hay tres sesiones reservadas o solicitadas para el lunes y el
martes:

- Lunes, 10:00 - 11:00. Aprobada.
- Martes, 14:30 - 15:30. Pendiente.
- Martes, 15:30 - 16:15. Pendiente.

La sesión del lunes pasa a estar cancelada. El solicitante recibe una notificación
automática informando de este cambio de estado.
La primera sesión del martes será rechazada porque entra en conflicto con el cierre, durante
el cuál el espacio no está disponible.
La segunda sesión del martes no será afectada por el cierre. Su aprobación o rechazo
dependen de otros factores de disponibilidad, a discreción de Recepción como es
habitual.
Aunque todavía no está contemplado, de haber listas de espera o futuros conflictos
de disponibilidad, se le podría ofrecer más prioridad a los Solicitantes cuyas
sesiones hayan sido canceladas por cierres imprevistos.

#### Ejemplo 2: Mantenimiento programado

En el Centro Lúa se va a hacer mantenimiento. El equipo de Mantenimiento escoge
un viernes en el que no hay sesiones reservadas y registra un cierre para todo el
día. Al cerrar el centro, ninguno de sus espacios se muestra como disponible.
Cuando Recepción o un Solicitante consulte la disponibilidad de los espacios
afectados, reflejarán que no están disponibles y el sistema no permitirá aprobar
ninguna sesión durante ese viernes.
Como añadido, la aplicación podría mostrar un anuncio o notificación indicando que
ningún espacio en el centro está disponible por mantenimiento, aportando mayor
claridad al Solicitante.

## Qué le damos a los demás equipos

Nosotros damos a los otros equipos los datos de los espacios, sus horarios, y sus cierres.

|                Dato que damos                |                                                           Para qué lo usan                                                           |
| :------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------: |
|              **ID del espacio**              | B y C lo usan para indicar en qué espacio se hace una reserva o sesión, y para saber a qué espacio se aplica un horario o un cierre. |
|           **Horario del espacio:**           |                     B comprueba que una reserva está dentro del horario. C comprueba lo mismo con las sesiones.                      |
|           **Cierres del espacio:**           |          B no debe aprobar reservas que coincidan con un cierre. C no debe confirmar sesiones que coincidan con un cierre.           |
| **Aviso cuando se registra un cierre nuevo** |                            B y C revisan si ya tenían reservas o sesiones en ese espacio y en esas horas.                            |

## Dudas pendientes

- Los solicitantes pueden cancelar sus reservas. ¿Hay una hora límite antes de la propia reserva para hacerlo?

- Supongamos que hay dos solicitudes conflictivas y una de ellas se aprueba. ¿Queda la otra solicitud rechazada definitivamente o se permite que siga pendiente por si la primera se cancela? ¿A partir de qué período se rechaza de forma definitiva?

## Pruebas A-03

|   Caso   |   Datos preparados   |   Qué hago     |   Qué debería pasar   |   Qué pasó    |   Pendiente   |
|:--------:|:--------------------:|:--------------:|:---------------------:|:-------------:|:-------------:|
|   Datos ordenados |
|   Renombrado  |
|   Espacio activo/inactivo |
|   Ausencia de centros y espacios  |
|   Centro con dos espacios |
   


