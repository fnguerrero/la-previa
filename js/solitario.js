window.JUEGOS = window.JUEGOS || {};
window.JUEGOS.solitario = (function(){
  "use strict";

  var PALOS = ["♠", "♥", "♦", "♣"];
  var CARAS = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  var mazo, sobra, fund, cols, sel, movs, api, cont;

  function rojo(c){ return c.p === 1 || c.p === 2; }

  function barajar(){
    var d = [];
    for (var p = 0; p < 4; p++)
      for (var v = 1; v <= 13; v++) d.push({ p:p, v:v, ab:false });
    for (var i = d.length-1; i > 0; i--){
      var j = Math.floor(Math.random()*(i+1)), t = d[i];
      d[i] = d[j]; d[j] = t;
    }
    return d;
  }

  function repartir(){
    var d = barajar();
    cols = [];
    for (var i = 0; i < 7; i++){
      var col = [];
      for (var k = 0; k <= i; k++){
        var c = d.pop();
        c.ab = (k === i);
        col.push(c);
      }
      cols.push(col);
    }
    mazo = d;          // lo que queda es el pozo
    sobra = [];        // el descarte visible
    fund = [[], [], [], []];
    sel = null;
    movs = 0;
  }

  // ---------- reglas ----------
  function vaAFundacion(c, pila){
    if (!pila.length) return c.v === 1;
    var t = pila[pila.length-1];
    return t.p === c.p && c.v === t.v + 1;
  }

  function vaAColumna(c, col){
    if (!col.length) return c.v === 13;
    var t = col[col.length-1];
    return t.ab && rojo(t) !== rojo(c) && c.v === t.v + 1;
  }

  function tomarSeleccion(){
    if (!sel) return null;
    if (sel.tipo === "sobra") return sobra.slice(-1);
    return cols[sel.col].slice(sel.pos);
  }

  function sacarSeleccion(){
    if (sel.tipo === "sobra") sobra.pop();
    else {
      cols[sel.col].length = sel.pos;
      var col = cols[sel.col];
      if (col.length && !col[col.length-1].ab) col[col.length-1].ab = true;
    }
  }

  function soltarEn(destino){
    var cartas = tomarSeleccion();
    if (!cartas || !cartas.length) return false;

    if (destino.tipo === "fund"){
      if (cartas.length > 1) return false;
      if (!vaAFundacion(cartas[0], fund[destino.i])) return false;
      sacarSeleccion();
      fund[destino.i].push(cartas[0]);
    } else {
      if (!vaAColumna(cartas[0], cols[destino.i])) return false;
      sacarSeleccion();
      cols[destino.i] = cols[destino.i].concat(cartas);
    }
    movs++;
    sel = null;
    pintar();
    if (fund.reduce(function(a,f){ return a + f.length; }, 0) === 52) ganar();
    return true;
  }

  // manda a la fundación si entra en alguna
  function subir(cartas){
    if (cartas.length !== 1) return false;
    for (var i = 0; i < 4; i++){
      if (vaAFundacion(cartas[0], fund[i])) return soltarEn({ tipo:"fund", i:i });
    }
    return false;
  }

  function robar(){
    if (mazo.length){
      var c = mazo.pop();
      c.ab = true;
      sobra.push(c);
    } else if (sobra.length){
      while (sobra.length){
        var s = sobra.pop();
        s.ab = false;
        mazo.push(s);
      }
    }
    sel = null;
    pintar();
  }

  function autoSubir(){
    var hubo = true, vueltas = 0;
    while (hubo && vueltas < 60){
      hubo = false; vueltas++;
      cols.forEach(function(col, i){
        if (!col.length) return;
        sel = { tipo:"col", col:i, pos:col.length-1 };
        if (subir([col[col.length-1]])) hubo = true;
      });
      if (sobra.length){
        sel = { tipo:"sobra" };
        if (subir(sobra.slice(-1))) hubo = true;
      }
    }
    sel = null;
    pintar();
  }

  function ganar(){
    api.fin("Ganaste", "Cerraste las cuatro pilas en <b>" + movs + "</b> movimientos.",
      [{ txt:"Otra mano", fn:arrancar }]);
  }

  // ---------- dibujo ----------
  function carta(c, extra){
    if (!c.ab) return '<div class="ct tapada' + (extra || "") + '"></div>';
    return '<div class="ct' + (rojo(c) ? " rojo" : "") + (extra || "") + '">' +
             "<b>" + CARAS[c.v] + "</b><i>" + PALOS[c.p] + "</i></div>";
  }

  function pintar(){
    var s = "";

    // fila de arriba: pozo, descarte y las cuatro pilas
    s += '<div class="arriba">';
    s += '<div class="hueco pozo" data-t="pozo">' +
         (mazo.length ? '<div class="ct tapada"></div>' : '<span>↻</span>') + "</div>";
    s += '<div class="hueco" data-t="sobra">' +
         (sobra.length ? carta(sobra[sobra.length-1],
            (sel && sel.tipo === "sobra" ? " sel" : "")) : "") + "</div>";
    s += '<div class="sep"></div>';
    for (var i = 0; i < 4; i++){
      s += '<div class="hueco" data-t="fund" data-i="' + i + '">' +
           (fund[i].length ? carta(fund[i][fund[i].length-1]) :
            '<span>' + PALOS[i] + "</span>") + "</div>";
    }
    s += "</div>";

    // las siete columnas
    s += '<div class="columnas">';
    cols.forEach(function(col, i){
      s += '<div class="col" data-t="col" data-i="' + i + '">';
      if (!col.length) s += '<div class="hueco vacio"></div>';
      col.forEach(function(c, j){
        var marcada = sel && sel.tipo === "col" && sel.col === i && j >= sel.pos;
        s += carta(c, (marcada ? " sel" : "") + '" data-j="' + j);
      });
      s += "</div>";
    });
    s += "</div>";

    cont.querySelector(".sol").innerHTML = s;
  }

  // ---------- interacción ----------
  function tocar(e){
    var ct = e.target.closest(".ct");
    var zona = e.target.closest("[data-t]");
    if (!zona) return;
    var t = zona.dataset.t;

    if (t === "pozo") return robar();

    // ¿es un destino para lo que ya está seleccionado?
    if (sel){
      var destino = t === "fund" ? { tipo:"fund", i:+zona.dataset.i }
                  : t === "col"  ? { tipo:"col",  i:+zona.dataset.i } : null;
      if (destino && soltarEn(destino)) return;
    }

    // si no, ¿es un origen válido?
    if (t === "sobra" && sobra.length){
      if (sel && sel.tipo === "sobra"){ subir(sobra.slice(-1)); sel = null; }
      else sel = { tipo:"sobra" };
      return pintar();
    }
    if (t === "col"){
      var i = +zona.dataset.i, col = cols[i];
      if (!col.length){ sel = null; return pintar(); }
      var j = ct && ct.dataset.j !== undefined ? +ct.dataset.j : col.length - 1;
      if (!col[j].ab){ sel = null; return pintar(); }
      // volver a tocar lo mismo intenta subirlo a la pila
      if (sel && sel.tipo === "col" && sel.col === i && sel.pos === j){
        if (!subir(col.slice(j))) { sel = null; pintar(); }
        return;
      }
      sel = { tipo:"col", col:i, pos:j };
      return pintar();
    }
    sel = null;
    pintar();
  }

  function arrancar(){
    repartir();
    pintar();
  }

  return {
    montar: function(el, _api){
      api = _api; cont = el;
      el.innerHTML =
        '<div class="sol"></div>' +
        '<p class="aviso">Tocá una carta y después dónde va. Tocarla dos veces la manda a su pila.</p>';
      api.accion("A las pilas", autoSubir);
      api.accion("Nueva mano", arrancar);
      el.querySelector(".sol").addEventListener("click", tocar);
      arrancar();
    },
    desmontar: function(){}
  };
})();
