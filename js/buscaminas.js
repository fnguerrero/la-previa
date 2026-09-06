window.JUEGOS = window.JUEGOS || {};
window.JUEGOS.buscaminas = (function(){
  "use strict";

  var F = 9, C = 9, MINAS = 10;
  var mina, abierta, bandera, arrancado, terminado, api, $grid, $mar, $t, reloj, seg;

  function idx(f, c){ return f*C + c; }
  function dentro(f, c){ return f >= 0 && f < F && c >= 0 && c < C; }

  function vecinos(f, c){
    var v = [];
    for (var df = -1; df <= 1; df++)
      for (var dc = -1; dc <= 1; dc++)
        if ((df || dc) && dentro(f+df, c+dc)) v.push([f+df, c+dc]);
    return v;
  }

  function cuenta(f, c){
    return vecinos(f, c).filter(function(p){ return mina[idx(p[0], p[1])]; }).length;
  }

  function sembrar(saltoF, saltoC){
    // nunca poner mina en la primera celda tocada ni en sus vecinas
    var prohibido = {};
    prohibido[idx(saltoF, saltoC)] = 1;
    vecinos(saltoF, saltoC).forEach(function(p){ prohibido[idx(p[0], p[1])] = 1; });
    var puestas = 0;
    while (puestas < MINAS){
      var i = Math.floor(Math.random() * F * C);
      if (mina[i] || prohibido[i]) continue;
      mina[i] = true;
      puestas++;
    }
    arrancado = true;
    seg = 0;
    reloj = setInterval(function(){ seg++; pintarMarcador(); }, 1000);
  }

  function abrir(f, c){
    var i = idx(f, c);
    if (abierta[i] || bandera[i]) return;
    abierta[i] = true;
    if (mina[i]) return perder();
    if (cuenta(f, c) === 0){
      vecinos(f, c).forEach(function(p){ abrir(p[0], p[1]); });
    }
  }

  function marcar(f, c){
    var i = idx(f, c);
    if (abierta[i]) return;
    bandera[i] = !bandera[i];
  }

  function gano(){
    for (var i = 0; i < F*C; i++) if (!mina[i] && !abierta[i]) return false;
    return true;
  }

  function perder(){
    terminado = true;
    clearInterval(reloj);
    for (var i = 0; i < F*C; i++) if (mina[i]) abierta[i] = true;
    pintar();
    api.fin("Boom", "Pisaste una mina a los " + seg + " segundos.", [
      { txt:"Otra vez", fn:arrancar }
    ]);
  }

  function ganar(){
    terminado = true;
    clearInterval(reloj);
    var mejor = api.leer("minas.record", null);
    var nuevo = mejor === null || seg < mejor;
    if (nuevo) api.guardar("minas.record", seg);
    pintar();
    api.fin("Limpio", nuevo
      ? "Nuevo récord: <b>" + seg + "</b> segundos."
      : "Lo sacaste en " + seg + " segundos. Tu récord es " + mejor + ".",
      [{ txt:"Otra vez", fn:arrancar }]);
  }

  function pintarMarcador(){
    var b = bandera.filter(Boolean).length;
    $mar.innerHTML =
      '<div><b>' + Math.max(0, MINAS - b) + '</b>minas</div>' +
      '<div><b>' + seg + '</b>segundos</div>';
  }

  var COLOR = ["", "#5ec8f0", "#5ee0b0", "#f0c05e", "#f08a5e", "#ff5f8f", "#a97bff", "#efeaf6", "#9a91b0"];

  function pintar(){
    var html = "";
    for (var f = 0; f < F; f++){
      for (var c = 0; c < C; c++){
        var i = idx(f, c), cls = "m", txt = "";
        if (abierta[i]){
          cls += " ab";
          if (mina[i]) { cls += " boom"; txt = "💣"; }
          else {
            var n = cuenta(f, c);
            if (n) txt = '<span style="color:' + COLOR[n] + '">' + n + "</span>";
          }
        } else if (bandera[i]) txt = "🚩";
        html += '<div class="' + cls + '" data-f="' + f + '" data-c="' + c + '">' + txt + "</div>";
      }
    }
    $grid.innerHTML = html;
    pintarMarcador();
  }

  var press, movio;
  function down(e){
    var cel = e.target.closest(".m");
    if (!cel || terminado) return;
    movio = false;
    press = setTimeout(function(){
      press = null;
      movio = true;              // ya resolvió como pulsación larga
      marcar(+cel.dataset.f, +cel.dataset.c);
      pintar();
      if (navigator.vibrate) navigator.vibrate(15);
    }, 350);
  }
  function up(e){
    var cel = e.target.closest(".m");
    if (!press){ press = null; return; }
    clearTimeout(press); press = null;
    if (!cel || terminado || movio) return;
    var f = +cel.dataset.f, c = +cel.dataset.c;
    if (!arrancado) sembrar(f, c);
    abrir(f, c);
    if (!terminado){
      pintar();
      if (gano()) ganar();
    }
  }
  function menu(e){
    var cel = e.target.closest(".m");
    if (!cel || terminado) return;
    e.preventDefault();
    marcar(+cel.dataset.f, +cel.dataset.c);
    pintar();
  }

  function arrancar(){
    clearInterval(reloj);
    mina = new Array(F*C).fill(false);
    abierta = new Array(F*C).fill(false);
    bandera = new Array(F*C).fill(false);
    arrancado = false; terminado = false; seg = 0;
    pintar();
  }

  return {
    montar: function(el, _api){
      api = _api;
      el.innerHTML =
        '<div class="marcador" id="marMinas"></div>' +
        '<div class="tablero gminas" id="gminas"></div>' +
        '<p class="aviso">Tocá para abrir. Mantené apretado para poner bandera.</p>';
      $grid = document.getElementById("gminas");
      $mar = document.getElementById("marMinas");
      api.accion("Reiniciar", arrancar);
      $grid.addEventListener("pointerdown", down);
      $grid.addEventListener("pointerup", up);
      $grid.addEventListener("pointercancel", function(){ clearTimeout(press); press = null; });
      $grid.addEventListener("contextmenu", menu);
      arrancar();
    },
    desmontar: function(){ clearInterval(reloj); clearTimeout(press); }
  };
})();
