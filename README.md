# La Previa

Ocho juegos en una sola página, pensados para adultos y para el rato muerto.
Sin instalación, sin cuentas, sin backend: todo corre en el navegador y lo poco
que se guarda (récords, racha) queda en el teléfono.

## Los ocho

| Juego | Qué es |
|---|---|
| **Tetris** | El proyecto que ya existía, embebido |
| **Sudoku** | Generador propio con solución única, tres niveles y notas |
| **Buscaminas** | 9×9, diez minas, nunca perdés en el primer toque |
| **2048** | Deslizar en el celular, flechas en la compu |
| **Combinar** | Match-3 contra reloj, 60 segundos, con cascadas |
| **Palabra del día** | Wordle en español, una por día, resultado compartible |
| **Te acordás** | El juego de nostalgia argentina, embebido |
| **Picante** | Verdad o atrevimiento para dos, +18 |

Tetris y Te acordás viven en sus propios repos y entran por iframe: en local
se leen de las carpetas hermanas, publicado se leen de GitHub Pages.

## Estructura

```
index.html          menú, barra del juego y contenedor
css/estilo.css      base y componentes comunes
css/juegos.css      lo específico de cada tablero
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
de arriba, `guardar(clave, valor)` y `leer(clave, default)` para persistir, y
`fin(titulo, texto, botones)` para el cartel de fin de partida.

Para agregar un juego: crear `js/nuevo.js`, sumarlo al `CATALOGO` de `app.js`
y agregar el `<script>` en `index.html`.

## Atajos

Cada juego tiene su URL: `#sudoku`, `#picante`, `#palabra`, `#dosmil`,
`#match3`, `#buscaminas`, `#tetris`, `#teacordas`. El botón atrás del teléfono
cierra el juego y vuelve al menú.
