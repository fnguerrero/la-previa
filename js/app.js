(function(){
  "use strict";

  var local = location.protocol === "file:" || /^(localhost|127\.)/.test(location.hostname);

  var CATALOGO = [
    { id:"tetris",     nom:"Tetris",          desc:"El de siempre. Con récord.",        emo:"🧱", tag:"clásico", c:"#5ec8f0",
      externo:{ local:"../Tetris/index.html", web:"https://fnguerrero.github.io/tetris/" } },
    { id:"sudoku",     nom:"Sudoku",          desc:"Tres dificultades y notas.",        emo:"🔢", tag:"clásico", c:"#f0c05e" },
    { id:"buscaminas", nom:"Buscaminas",      desc:"Tocá para abrir, mantené para marcar.", emo:"💣", tag:"clásico", c:"#e0574f" },
    { id:"dosmil",     nom:"2048",            desc:"Deslizá y juntá potencias de dos.", emo:"🎯", tag:"clásico", c:"#f08a5e" },
    { id:"match3",     nom:"Combinar",        desc:"Tres iguales en 60 segundos.",      emo:"💎", tag:"casual",  c:"#5ee0b0" },
    { id:"palabra",    nom:"Palabra del día", desc:"Cinco letras, seis intentos.",      emo:"🔤", tag:"casual",  c:"#a97bff" },
    { id:"teacordas",  nom:"Te acordás",      desc:"Un desafío de nostalgia por día.",  emo:"📼", tag:"diario",  c:"#f0a736",
      externo:{ local:"../TeAcordas/index.html", web:"https://fnguerrero.github.io/teacordas/" } },
    { id:"picante",    nom:"Picante",         desc:"Verdad o atrevimiento, de a dos.",  emo:"🔥", tag:"+18",     c:"#ff5f8f" }
  ];

  var $menu     = document.getElementById("menu");
  var $juego    = document.getElementById("juego");
  var $grilla   = document.getElementById("grilla");
  var $lienzo   = document.getElementById("lienzo");
  var $titulo   = document.getElementById("titulo");
  var $acciones = document.getElementById("acciones");
  var actual = null;

  // ---- menú ----
  CATALOGO.forEach(function(j){
    var b = document.createElement("button");
    b.className = "ficha";
    b.style.setProperty("--c", j.c);
    b.innerHTML =
      '<span class="tag">' + j.tag + '</span>' +
      '<span class="emo">' + j.emo + '</span>' +
      '<b>' + j.nom + '</b>' +
      '<small>' + j.desc + '</small>';
    b.addEventListener("click", function(){ abrir(j); });
    $grilla.appendChild(b);
  });

  // ---- API que usan los juegos ----
  var api = {
    // agrega un botón a la barra superior; devuelve el elemento
    accion: function(texto, fn){
      var b = document.createElement("button");
      b.textContent = texto;
      b.addEventListener("click", fn);
      $acciones.appendChild(b);
      return b;
    },
    // guarda y lee por juego, tolerando navegadores sin storage
    guardar: function(clave, valor){
      try { localStorage.setItem("laprevia." + clave, JSON.stringify(valor)); } catch(e){}
    },
    leer: function(clave, porDefecto){
      try {
        var v = localStorage.getItem("laprevia." + clave);
        return v === null ? porDefecto : JSON.parse(v);
      } catch(e){ return porDefecto; }
    },
    // cartel de fin de partida
    fin: function(titulo, texto, botones){
      var capa = document.createElement("div");
      capa.className = "fin";
      var caja = document.createElement("div");
      caja.innerHTML = "<h2>" + titulo + "</h2><p>" + texto + "</p>";
      (botones || []).forEach(function(b){
        var el = document.createElement("button");
        el.className = "btn" + (b.suave ? " fantasma" : "");
        el.textContent = b.txt;
        el.addEventListener("click", function(){ capa.remove(); b.fn(); });
        caja.appendChild(el);
      });
      capa.appendChild(caja);
      $lienzo.appendChild(capa);
      return capa;
    }
  };

  function abrir(j, sinHistorial){
    if (actual) cerrar();
    actual = j;
    $menu.hidden = true;
    $juego.hidden = false;
    $titulo.textContent = j.nom;
    $acciones.innerHTML = "";
    $lienzo.innerHTML = "";
    window.scrollTo(0, 0);
    if (!sinHistorial) history.pushState({ juego:j.id }, "", "#" + j.id);

    if (j.externo){
      var fr = document.createElement("iframe");
      fr.className = "externo";
      fr.src = local ? j.externo.local : j.externo.web;
      fr.addEventListener("error", function(){ fr.src = j.externo.web; });
      $lienzo.appendChild(fr);
      return;
    }

    var mod = window.JUEGOS && window.JUEGOS[j.id];
    if (!mod){
      $lienzo.innerHTML = '<p class="aviso">Este juego todavía no está.</p>';
      return;
    }
    mod.montar($lienzo, api);
  }

  // baja el juego actual y vuelve al menú, sin tocar el historial
  function cerrar(){
    if (actual){
      var mod = window.JUEGOS && window.JUEGOS[actual.id];
      if (mod && mod.desmontar) mod.desmontar();
    }
    actual = null;
    $lienzo.innerHTML = "";
    $acciones.innerHTML = "";
    $juego.hidden = true;
    $menu.hidden = false;
  }

  function porId(id){
    return CATALOGO.filter(function(x){ return x.id === id; })[0];
  }

  document.getElementById("volver").addEventListener("click", function(){
    if (history.state && history.state.juego) history.back();
    else cerrar();
  });

  // el botón atrás del teléfono cierra el juego, y adelante lo reabre
  window.addEventListener("popstate", function(e){
    var id = e.state && e.state.juego;
    var j = id && porId(id);
    if (j) abrir(j, true);
    else cerrar();
  });

  // entrar directo por hash (#sudoku, #picante, …)
  var pedido = porId(location.hash.replace("#", ""));
  if (pedido){
    history.replaceState({ juego:pedido.id }, "", "#" + pedido.id);
    abrir(pedido, true);
  }
})();
