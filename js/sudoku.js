window.JUEGOS = window.JUEGOS || {};
window.JUEGOS.sudoku = (function(){
  "use strict";

  var PISTAS = { facil:44, medio:34, dificil:27 };
  var sol, tab, fijo, notas, sel, notando, api, $grid, $pad, $mar, btnNotas, seg, reloj, dif;

  // ---------- generador ----------
  function puede(g, i, v){
    var f = Math.floor(i/9), c = i%9;
    for (var k = 0; k < 9; k++){
      if (g[f*9+k] === v || g[k*9+c] === v) return false;
    }
    var f0 = f - f%3, c0 = c - c%3;
    for (var a = 0; a < 3; a++)
      for (var b = 0; b < 3; b++)
        if (g[(f0+a)*9 + c0+b] === v) return false;
    return true;
  }

  function mezclar(a){
    for (var i = a.length-1; i > 0; i--){
      var j = Math.floor(Math.random()*(i+1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function completar(g, i){
    i = i || 0;
    while (i < 81 && g[i]) i++;
    if (i === 81) return true;
    var nums = mezclar([1,2,3,4,5,6,7,8,9]);
    for (var k = 0; k < 9; k++){
      if (puede(g, i, nums[k])){
        g[i] = nums[k];
        if (completar(g, i+1)) return true;
        g[i] = 0;
      }
    }
    return false;
  }

  function contarSoluciones(g, tope){
    var i = 0;
    while (i < 81 && g[i]) i++;
    if (i === 81) return 1;
    var total = 0;
    for (var v = 1; v <= 9; v++){
      if (puede(g, i, v)){
        g[i] = v;
        total += contarSoluciones(g, tope);
        g[i] = 0;
        if (total >= tope) return total;
      }
    }
    return total;
  }

  function generar(nivel){
    sol = new Array(81).fill(0);
    completar(sol, 0);
    var g = sol.slice();
    var orden = mezclar(Array.from({length:81}, function(_, i){ return i; }));
    var quedan = 81;
    for (var k = 0; k < orden.length && quedan > PISTAS[nivel]; k++){
      var i = orden[k], guardado = g[i];
      g[i] = 0;
      if (contarSoluciones(g.slice(), 2) !== 1) g[i] = guardado;
      else quedan--;
    }
    tab = g.slice();
    fijo = g.map(Boolean);
    notas = Array.from({length:81}, function(){ return {}; });
  }

  // ---------- juego ----------
  function conflictos(){
    var mal = {};
    for (var i = 0; i < 81; i++){
      var v = tab[i];
      if (!v) continue;
      var f = Math.floor(i/9), c = i%9;
      for (var k = 0; k < 9; k++){
        var a = f*9+k, b = k*9+c;
        if (a !== i && tab[a] === v) { mal[i] = mal[a] = 1; }
        if (b !== i && tab[b] === v) { mal[i] = mal[b] = 1; }
      }
      var f0 = f - f%3, c0 = c - c%3;
      for (var x = 0; x < 3; x++)
        for (var y = 0; y < 3; y++){
          var j = (f0+x)*9 + c0+y;
          if (j !== i && tab[j] === v) { mal[i] = mal[j] = 1; }
        }
    }
    return mal;
  }

  function pintar(){
    var mal = conflictos();
    var html = "";
    for (var i = 0; i < 81; i++){
      var cls = "s";
      if (fijo[i]) cls += " fijo";
      if (i === sel) cls += " sel";
      else if (sel !== null && (Math.floor(i/9) === Math.floor(sel/9) || i%9 === sel%9)) cls += " luz";
      if (mal[i]) cls += " mal";
      if (sel !== null && tab[i] && tab[i] === tab[sel]) cls += " igual";
      if (i%3 === 2 && i%9 !== 8) cls += " br";
      if (Math.floor(i/9)%3 === 2 && i < 72) cls += " bb";
      var dentro;
      if (tab[i]) dentro = tab[i];
      else {
        var ns = Object.keys(notas[i]).sort();
        dentro = ns.length ? '<i>' + ns.join("") + '</i>' : "";
      }
      html += '<div class="' + cls + '" data-i="' + i + '">' + dentro + "</div>";
    }
    $grid.innerHTML = html;
    var faltan = tab.filter(function(v){ return !v; }).length;
    var LINDO = { facil:"Fácil", medio:"Medio", dificil:"Difícil" };
    $mar.innerHTML = '<div><b>' + LINDO[dif] + '</b>nivel</div><div><b>' + faltan + '</b>por llenar</div>';
    if (!faltan && !Object.keys(mal).length) ganar();
  }

  function ganar(){
    clearInterval(reloj);
    var m = Math.floor(seg/60), s = seg%60;
    api.fin("Resuelto", "Nivel " + dif + " en <b>" + m + "m " + s + "s</b>.", [
      { txt:"Otro igual", fn:function(){ arrancar(dif); } },
      { txt:"Cambiar nivel", suave:true, fn:elegir }
    ]);
  }

  function poner(v){
    if (sel === null || fijo[sel]) return;
    if (notando){
      if (tab[sel]) return;
      if (notas[sel][v]) delete notas[sel][v]; else notas[sel][v] = 1;
    } else {
      tab[sel] = tab[sel] === v ? 0 : v;
      notas[sel] = {};
    }
    pintar();
  }

  function borrar(){
    if (sel === null || fijo[sel]) return;
    tab[sel] = 0;
    notas[sel] = {};
    pintar();
  }

  function tecla(e){
    if (e.key >= "1" && e.key <= "9") poner(+e.key);
    else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") borrar();
  }

  function arrancar(nivel){
    dif = nivel;
    clearInterval(reloj);
    seg = 0;
    reloj = setInterval(function(){ seg++; }, 1000);
    $grid.innerHTML = '<p class="aviso" style="grid-column:1/-1">Armando el tablero…</p>';
    setTimeout(function(){
      generar(nivel);
      sel = null;
      pintar();
    }, 30);
  }

  function elegir(){
    api.fin("¿Qué tan bravo?", "Elegí la dificultad.", [
      { txt:"Fácil",   fn:function(){ arrancar("facil"); } },
      { txt:"Medio",   suave:true, fn:function(){ arrancar("medio"); } },
      { txt:"Difícil", suave:true, fn:function(){ arrancar("dificil"); } }
    ]);
  }

  return {
    montar: function(el, _api){
      api = _api;
      var pad = "";
      for (var n = 1; n <= 9; n++) pad += '<button data-n="' + n + '">' + n + "</button>";
      pad += '<button data-n="0">⌫</button>';
      el.innerHTML =
        '<div class="marcador" id="marSud"></div>' +
        '<div class="tablero gsud" id="gsud"></div>' +
        '<div class="pad" id="padSud">' + pad + "</div>";
      $grid = document.getElementById("gsud");
      $pad  = document.getElementById("padSud");
      $mar  = document.getElementById("marSud");

      btnNotas = api.accion("Notas", function(){
        notando = !notando;
        btnNotas.classList.toggle("on", notando);
      });
      api.accion("Nivel", elegir);

      $grid.addEventListener("click", function(e){
        var c = e.target.closest(".s");
        if (!c) return;
        sel = +c.dataset.i;
        pintar();
      });
      $pad.addEventListener("click", function(e){
        var b = e.target.closest("button");
        if (!b) return;
        var n = +b.dataset.n;
        if (n) poner(n); else borrar();
      });
      document.addEventListener("keydown", tecla);
      notando = false;
      arrancar("facil");
    },
    desmontar: function(){
      clearInterval(reloj);
      document.removeEventListener("keydown", tecla);
    }
  };
})();
