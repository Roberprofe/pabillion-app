# Cómo trabajamos en este repositorio

Un repositorio, tres equipos de cinco y una aplicación. El profesor asigna las primeras tareas y sus códigos. El Project contiene las issues reales, creadas desde `Todo → + → Create new issue`, seleccionando este repositorio. Se escribe el trabajo en la descripción y los criterios como casillas `- [ ]`.

## Nombres de issues y ramas

Los títulos son `[A-01] Definir centros, espacios y cierres`, `[B-01] Definir el recorrido y los estados de una reserva` y `[C-01] Definir actividades, sesiones y ocupación de espacios`. Las siguientes siguen el contador de su equipo, asignado por el profesor. GitHub añade otro número `#N`, usado para enlaces: no coincide necesariamente con el código docente.

Las tareas de análisis pueden resolverse en la issue, sin rama. Para cada tarea de código se crea una rama desde `main` actualizada, con patrón `equipo/numero-descripcion`, por ejemplo `a/02-listar-espacios`. Todo en minúsculas, sin espacios ni tildes. No habrá ramas permanentes por equipo. Si se divide una tarea grande, el profesor asignará nuevas issues antes de abrir ramas adicionales.

## Del trabajo al PR en VS Code

Usad Git integrado para clonar, cambiar rama, revisar archivos, hacer commit y push. La extensión oficial **GitHub Pull Requests**, de GitHub (`GitHub.vscode-pull-request-github`), permite crear y revisar PRs. Cada persona debe configurar su propia identidad Git.

1. Leed la issue, comprobad criterios y movedla a `In progress`.
2. Actualizad `main`, cread la rama y verificad su nombre antes de editar.
3. Programad, probad los casos y ejecutad `pnpm run check`. Si se cambió la base, comprobad también migraciones y consultas con PostgreSQL.
4. Revisad las diferencias y haced commits con mensajes que expliquen el resultado. Subid la rama.
5. Cread un PR hacia `main`. Indicad qué cambia, pruebas, riesgos o dudas y la issue real con `Refs #N`.
6. Solicitad revisión a una persona del otro equipo. La ronda inicial es **B revisa A, C revisa B y A revisa C**. El profesor valida y autoriza la integración.
7. Si hay correcciones, hacedlas en la misma rama y el mismo PR; no se abre uno nuevo por cada comentario.
8. Tras integrar, comprobad los criterios de la issue, cerradla cuando esté aceptada y verificad `Done` en Project. Actualizad `main` para la siguiente tarea.

`Closes #N` en el PR puede cerrar automáticamente la issue al integrar en la rama por defecto. Se usa solo cuando se resuelve completa y se acuerda con el profesor. Una tarjeta en `Done` o una aprobación no sustituye las pruebas. El autor no revisa como aprobador su propio PR.

## Revisar es comprobar

Leed los archivos cambiados, ejecutad el caso principal y un límite, y comprobádlos contra los criterios. Comentad algo concreto: «La lista de espacios no distingue el centro; ¿qué muestra al cambiar de centro?». Pedid cambios si hace falta. No integréis mientras queda una pregunta importante sin resolver. Si vais a hacer checkout de un PR, preservad vuestro trabajo local antes de cambiar de rama.

Los bloqueos se comentan en la issue con qué falta, quién puede responder y qué trabajo impide. Antes de tocar archivos comunes como `schema.prisma`, `layout.tsx`, estilos o configuración, coordinadlo. Los cinco integrantes no deben editar simultáneamente la misma rama sin acordar quién lleva cada parte.
