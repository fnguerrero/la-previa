(function(){
  "use strict";

  var local = location.protocol === "file:" || /^(localhost|127\.)/.test(location.hostname);

  // miniaturas: se dibujan con el color del juego, sangrando por la esquina
  var ICONO = {
    tetris:'<rect x="2" y="11" width="6.2" height="6.2" rx="1.4"/><rect x="8.9" y="11" width="6.2" height="6.2" rx="1.4"/>'+
           '<rect x="15.8" y="11" width="6.2" height="6.2" rx="1.4"/><rect x="8.9" y="4.1" width="6.2" height="6.2" rx="1.4"/>',
    sudoku:'<rect x="2" y="2" width="6" height="6" rx="1.2" opacity=".45"/><rect x="9" y="2" width="6" height="6" rx="1.2"/>'+
           '<rect x="16" y="2" width="6" height="6" rx="1.2" opacity=".45"/><rect x="2" y="9" width="6" height="6" rx="1.2"/>'+
           '<rect x="9" y="9" width="6" height="6" rx="1.2" opacity=".45"/><rect x="16" y="9" width="6" height="6" rx="1.2"/>'+
           '<rect x="2" y="16" width="6" height="6" rx="1.2" opacity=".45"/><rect x="9" y="16" width="6" height="6" rx="1.2"/>'+
           '<rect x="16" y="16" width="6" height="6" rx="1.2" opacity=".45"/>',
    buscaminas:'<circle cx="12" cy="13" r="6.4"/><g stroke="currentColor" stroke-width="1.9" stroke-linecap="round">'+
           '<path d="M12 1.6v3.2M2.2 13h3.2M18.6 13h3.2M5.1 6.1l2.3 2.3M18.9 6.1l-2.3 2.3"/></g>',
    dosmil:'<rect x="2" y="2" width="9" height="9" rx="2" opacity=".4"/><rect x="13" y="2" width="9" height="9" rx="2" opacity=".65"/>'+
           '<rect x="2" y="13" width="9" height="9" rx="2" opacity=".65"/><rect x="13" y="13" width="9" height="9" rx="2"/>',
    match3:'<path d="M12 1.5l4.4 5.2L12 11.9 7.6 6.7z"/><path d="M5.6 12.1l4.4 5.2-4.4 5.2-4.4-5.2z" opacity=".55"/>'+
           '<path d="M18.4 12.1l4.4 5.2-4.4 5.2-4.4-5.2z" opacity=".55"/>',
    palabra:'<rect x="1.5" y="4" width="6.6" height="6.6" rx="1.4"/><rect x="8.7" y="4" width="6.6" height="6.6" rx="1.4" opacity=".4"/>'+
           '<rect x="15.9" y="4" width="6.6" height="6.6" rx="1.4" opacity=".4"/><rect x="1.5" y="13.4" width="6.6" height="6.6" rx="1.4" opacity=".4"/>'+
           '<rect x="8.7" y="13.4" width="6.6" height="6.6" rx="1.4"/><rect x="15.9" y="13.4" width="6.6" height="6.6" rx="1.4" opacity=".4"/>',
    teacordas:'<rect x="1.6" y="5.2" width="20.8" height="13.6" rx="2.6" fill="none" stroke="currentColor" stroke-width="1.9"/>'+
           '<circle cx="8.6" cy="11.4" r="2.5"/><circle cx="15.4" cy="11.4" r="2.5"/>'+
           '<rect x="6.6" y="15.4" width="10.8" height="1.7" rx=".8"/>',
    picante:'<path d="M12 21.4S3.6 16.2 3.6 10.5a4.7 4.7 0 0 1 8.4-2.9 4.7 4.7 0 0 1 8.4 2.9c0 5.7-8.4 10.9-8.4 10.9z"/>'+
           '<path d="M12 1.6c.9 1.7 2.4 2.3 2.4 4a2.4 2.4 0 0 1-4.8 0c0-1.7 1.5-2.3 2.4-4z" opacity=".55"/>'
  };

  var CATALOGO = [
    { id:"tetris",     nom:"Tetris",          desc:"El de siempre.",        tag:"clásico", c:"#5ec8f0",
      externo:{ local:"../Tetris/index.html", web:"https://fnguerrero.github.io/tetris/" } },
    { id:"sudoku",     nom:"Sudoku",          desc:"Tres niveles y notas.",             tag:"clásico", c:"#f0c05e" },
    { id:"buscaminas", nom:"Buscaminas",      desc:"9×9 con diez minas.",      tag:"clásico", c:"#e0574f" },
    { id:"dosmil",     nom:"2048",            desc:"Juntá potencias de dos.", tag:"clásico", c:"#f08a5e" },
    { id:"match3",     nom:"Combinar",        desc:"Tres iguales en 60 segundos.",      tag:"contrarreloj", c:"#5ee0b0" },
    { id:"palabra",    nom:"Palabra del día", desc:"Cinco letras, seis intentos.",      tag:"diario",  c:"#a97bff", hoy:true },
    { id:"teacordas",  nom:"Te acordás",      desc:"Nostalgia, una por día.",  tag:"diario",  c:"#f0a736", hoy:true,
      externo:{ local:"../TeAcordas/index.html", web:"https://fnguerrero.github.io/teacordas/" } },
    { id:"picante",    nom:"Picante",         desc:"Verdad o atrevimiento.",  tag:"+18",     c:"#ff5f8f" }
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
      '<svg class="mini" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + ICONO[j.id] + '</svg>' +
      '<span class="tag">' + j.tag + '</span>' +
      (j.hoy ? '<span class="hoy"><i></i>hoy</span>' : '') +
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
