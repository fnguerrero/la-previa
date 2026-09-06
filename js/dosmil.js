window.JUEGOS = window.JUEGOS || {};
window.JUEGOS.dosmil = (function(){
  "use strict";

  var N = 4;
  var g, puntos, record, $grid, $pts, $rec, cont, api, terminado;

  function vacias(){
    var v = [];
    for (var i = 0; i < N*N; i++) if (!g[i]) v.push(i);
    return v;
  }

  function nueva(){
    var v = vacias();
    if (!v.length) return;
    g[v[Math.floor(Math.random()*v.length)]] = Math.random() < 0.9 ? 2 : 4;
  }

  function fila(i, dir){
    // devuelve los 4 indices de la fila/columna recorridos en el sentido del movimiento
    var idx = [], k;
    for (k = 0; k < N; k++){
      idx.push(dir === "izq" || dir === "der" ? i*N + k : k*N + i);
    }
    if (dir === "der" || dir === "abajo") idx.reverse();
    return idx;
  }

  function mover(dir){
    if (terminado) return;
    var movio = false, sumado = 0;
    for (var i = 0; i < N; i++){
      var idx = fila(i, dir);
      var vals = idx.map(function(p){ return g[p]; }).filter(Boolean);
      var res = [];
      for (var k = 0; k < vals.length; k++){
        if (vals[k] === vals[k+1]){
          res.push(vals[k]*2);
          sumado += vals[k]*2;
          k++;
        } else res.push(vals[k]);
      }
      while (res.length < N) res.push(0);
      for (var j = 0; j < N; j++){
        if (g[idx[j]] !== res[j]) movio = true;
        g[idx[j]] = res[j];
      }
    }
    if (!movio) return;
    puntos += sumado;
    nueva();
    pintar();
    if (!hayJugada()) perder();
  }

  function hayJugada(){
    if (vacias().length) return true;
    for (var f = 0; f < N; f++){
      for (var c = 0; c < N; c++){
        var v = g[f*N+c];
        if (c < N-1 && g[f*N+c+1] === v) return true;
        if (f < N-1 && g[(f+1)*N+c] === v) return true;
      }
    }
    return false;
  }

  function perder(){
    terminado = true;
    if (puntos > record){
      record = puntos;
      api.guardar("2048.record", record);
    }
    api.fin("Se acabó", "Hiciste <b>" + puntos + "</b> puntos.", [
      { txt:"Otra vez", fn:arrancar }
    ]);
    pintar();
  }

  function pintar(){
    $pts.textContent = puntos;
    $rec.textContent = record;
    var html = "";
    for (var i = 0; i < N*N; i++){
      var v = g[i];
      html += '<div class="c' + (v ? " v" + Math.min(v, 4096) : "") + '">' + (v || "") + "</div>";
    }
    $grid.innerHTML = html;
  }

  function arrancar(){
    g = new Array(N*N).fill(0);
    puntos = 0;
    terminado = false;
    nueva(); nueva();
    pintar();
  }

  function tecla(e){
    var m = { ArrowLeft:"izq", ArrowRight:"der", ArrowUp:"arriba", ArrowDown:"abajo" }[e.key];
    if (!m) return;
    e.preventDefault();
    mover(m);
  }

  var x0, y0;
  function tocar(e){ var t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; }
  function soltar(e){
    if (x0 == null) return;
    var t = e.changedTouches[0];
    var dx = t.clientX - x0, dy = t.clientY - y0;
    x0 = null;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
    mover(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "der" : "izq") : (dy > 0 ? "abajo" : "arriba"));
  }

  return {
    montar: function(el, _api){
      api = _api; cont = el;
      record = api.leer("2048.record", 0);
      el.innerHTML =
        '<div class="marcador"><div><b id="p2048">0</b>puntos</div><div><b id="r2048">0</b>récord</div></div>' +
        '<div class="tablero g2048" id="g2048"></div>' +
        '<p class="aviso">Deslizá sobre el tablero. En compu, con las flechas.</p>';
      $grid = document.getElementById("g2048");
      $pts = document.getElementById("p2048");
      $rec = document.getElementById("r2048");
      api.accion("Reiniciar", arrancar);
      document.addEventListener("keydown", tecla);
      $grid.addEventListener("touchstart", tocar, { passive:true });
      $grid.addEventListener("touchend", soltar);
      arrancar();
    },
    desmontar: function(){
      document.removeEventListener("keydown", tecla);
    }
  };
})();
