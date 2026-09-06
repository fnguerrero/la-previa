window.JUEGOS = window.JUEGOS || {};
window.JUEGOS.match3 = (function(){
  "use strict";

  var N = 8, TIPOS = 6, DURA = 60;
  var g, puntos, sel, bloqueado, seg, reloj, api, $grid, $mar;

  function idx(f, c){ return f*N + c; }
  function az(){ return Math.floor(Math.random()*TIPOS); }

  function combos(){
    var marcados = {};
    var f, c, k;
    for (f = 0; f < N; f++){
      for (c = 0; c < N-2; c++){
        var v = g[idx(f,c)];
        if (v < 0) continue;
        k = 1;
        while (c+k < N && g[idx(f,c+k)] === v) k++;
        if (k >= 3) for (var i = 0; i < k; i++) marcados[idx(f,c+i)] = 1;
      }
    }
    for (c = 0; c < N; c++){
      for (f = 0; f < N-2; f++){
        var w = g[idx(f,c)];
        if (w < 0) continue;
        k = 1;
        while (f+k < N && g[idx(f+k,c)] === w) k++;
        if (k >= 3) for (var j = 0; j < k; j++) marcados[idx(f+j,c)] = 1;
      }
    }
    return Object.keys(marcados).map(Number);
  }

  function caer(){
    for (var c = 0; c < N; c++){
      var libre = N-1;
      for (var f = N-1; f >= 0; f--){
        if (g[idx(f,c)] >= 0){
          g[idx(libre,c)] = g[idx(f,c)];
          if (libre !== f) g[idx(f,c)] = -1;
          libre--;
        }
      }
      for (var k = libre; k >= 0; k--) g[idx(k,c)] = az();
    }
  }

  function resolver(cadena){
    var m = combos();
    if (!m.length){ bloqueado = false; return; }
    bloqueado = true;
    puntos += m.length * 10 * (cadena || 1);
    m.forEach(function(i){ g[i] = -1; });
    pintar();
    setTimeout(function(){
      caer();
      pintar();
      setTimeout(function(){ resolver((cadena || 1) + 1); }, 150);
    }, 180);
  }

  function pegados(a, b){
    var fa = Math.floor(a/N), ca = a%N, fb = Math.floor(b/N), cb = b%N;
    return Math.abs(fa-fb) + Math.abs(ca-cb) === 1;
  }

  function intercambiar(a, b){
    var t = g[a]; g[a] = g[b]; g[b] = t;
  }

  function tocar(i){
    if (bloqueado || seg <= 0) return;
    if (sel === null){ sel = i; pintar(); return; }
    if (sel === i){ sel = null; pintar(); return; }
    if (!pegados(sel, i)){ sel = i; pintar(); return; }

    var a = sel; sel = null;
    intercambiar(a, i);
    if (!combos().length){
      pintar();
      bloqueado = true;
      setTimeout(function(){ intercambiar(a, i); bloqueado = false; pintar(); }, 200);
      return;
    }
    pintar();
    setTimeout(function(){ resolver(1); }, 120);
  }

  var CARAS = ["💎","🍋","🍒","⭐","🍇","🍀"];

  function pintar(){
    var html = "";
    for (var i = 0; i < N*N; i++){
      var v = g[i];
      html += '<div class="j' + (i === sel ? " sel" : "") + (v < 0 ? " ido" : "") +
              '" data-i="' + i + '">' + (v < 0 ? "" : CARAS[v]) + "</div>";
    }
    $grid.innerHTML = html;
    $mar.innerHTML = '<div><b>' + puntos + '</b>puntos</div><div><b>' + Math.max(0,seg) + '</b>segundos</div>';
  }

  function terminar(){
    clearInterval(reloj);
    var rec = api.leer("match3.record", 0);
    var nuevo = puntos > rec;
    if (nuevo) api.guardar("match3.record", puntos);
    api.fin("Tiempo", nuevo
      ? "Nuevo récord: <b>" + puntos + "</b> puntos."
      : "Hiciste " + puntos + ". Tu récord es " + rec + ".",
      [{ txt:"Otra vez", fn:arrancar }]);
  }

  function arrancar(){
    clearInterval(reloj);
    g = new Array(N*N);
    do {
      for (var i = 0; i < N*N; i++) g[i] = az();
    } while (combos().length);
    puntos = 0; sel = null; bloqueado = false; seg = DURA;
    pintar();
    reloj = setInterval(function(){
      seg--;
      pintar();
      if (seg <= 0) terminar();
    }, 1000);
  }

  return {
    montar: function(el, _api){
      api = _api;
      el.innerHTML =
        '<div class="marcador" id="marM3"></div>' +
        '<div class="tablero gm3" id="gm3"></div>' +
        '<p class="aviso">Tocá una ficha y después una pegada para cambiarlas. Tres iguales suman.</p>';
      $grid = document.getElementById("gm3");
      $mar = document.getElementById("marM3");
      api.accion("Reiniciar", arrancar);
      $grid.addEventListener("click", function(e){
        var c = e.target.closest(".j");
        if (c) tocar(+c.dataset.i);
      });
      arrancar();
    },
    desmontar: function(){ clearInterval(reloj); }
  };
})();
