# La Previa

Doce juegos en una sola página, pensados para adultos y para el rato muerto.
Sin instalación, sin cuentas, sin backend: todo corre en el navegador y lo poco
que se guarda (récords, rachas, tanteos) queda en el teléfono.

## Solo

| Juego | Qué es |
|---|---|
| **Tetris** | El proyecto que ya existía, embebido |
| **Sudoku** | Generador propio con solución única, tres niveles y notas |
| **Buscaminas** | 9×9, diez minas, nunca perdés en el primer toque |
| **2048** | Deslizar en el celular, flechas en la compu |
| **Combinar** | Match-3 contra reloj, 60 segundos, con cascadas |
| **Palabra del día** | Wordle en español, una por día, resultado compartible |
| **Te acordás** | El juego de nostalgia argentina, embebido |

## De a dos

| Juego | Cómo se juega |
|---|---|
| **Picante** | Verdad o atrevimiento para dos, +18, por turnos |
| **Cuatro en línea** | Mismo teléfono, con nombres y tanteo que persiste |
| **Timbiriche** | Mismo teléfono; el que cierra una caja vuelve a jugar |
| **Duelo de reflejos** | Pantalla partida, uno de cada lado, primero a tres |
| **Palabra para dos** | A distancia: el desafío viaja adentro del link |

Tetris y Te acordás viven en sus propios repos y entran por iframe: en local
se leen de las carpetas hermanas, publicado se leen de GitHub Pages.

## Estructura

```
index.html          menú, barra del juego y contenedor
css/estilo.css      base, portada y componentes comunes
css/juegos.css      lo específico de cada tablero
css/dos.css         secciones del menú y los juegos de a dos
js/app.js           catálogo, router e historial; expone la API a los juegos
js/<juego>.js       un archivo por juego
```

Cada juego se registra en `window.JUEGOS` con dos métodos:

```js
window.JUEGOS.miJuego = {
  montar: function(contenedor, api){ /* … */ },
  desmontar: function(){ /* apagar timers y listeners */ }
};
```

La `api` que reciben trae `accion(texto, fn)` para poner un botón en la barra
de arriba, `guardar(clave, valor)` y `leer(clave, default)` para persistir,
`fin(titulo, texto, botones)` para el cartel de fin de partida, y para los
juegos a distancia `parametro` (lo que vino en el link) más
`enlace(id, valor)` para armar uno nuevo.

Para agregar un juego: crear `js/nuevo.js`, sumarlo al `CATALOGO` de `app.js`
con su ícono en `ICONO`, y agregar el `<script>` en `index.html`. Marcalo con
`dos:true` si va en la sección de a dos.

## Atajos

Cada juego tiene su URL: `#sudoku`, `#picante`, `#cuatro`, `#timbiriche`,
`#reflejos`, `#duo`, `#palabra`, `#dosmil`, `#match3`, `#buscaminas`,
`#tetris`, `#teacordas`. El botón atrás del teléfono cierra el juego.

**Palabra para dos** usa un hash con dato: `#duo=<palabra en base64>`. Se puede
abrir con la app ya cargada (cambia el hash sin recargar) o desde cero.
