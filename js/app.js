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
           '<path d="M12 1.6c.9 1.7 2.4 2.3 2.4 4a2.4 2.4 0 0 1-4.8 0c0-1.7 1.5-2.3 2.4-4z" opacity=".55"/>',
    cuatro:'<rect x="1.5" y="6" width="21" height="16.4" rx="2.6" fill="none" stroke="currentColor" stroke-width="1.9"/>'+
           '<circle cx="7" cy="11.5" r="2.2"/><circle cx="12" cy="17" r="2.2"/><circle cx="17" cy="11.5" r="2.2" opacity=".45"/>'+
           '<circle cx="12" cy="11.5" r="2.2" opacity=".45"/><circle cx="7" cy="17" r="2.2" opacity=".45"/>',
    timbiriche:'<g stroke="currentColor" stroke-width="2" stroke-linecap="round">'+
           '<path d="M4 4h8M4 4v8M12 4v8" opacity=".9"/><path d="M4 12h8" opacity=".35"/>'+
           '<path d="M12 12h8M20 12v8M12 20h8" opacity=".35"/></g>'+
           '<g><circle cx="4" cy="4" r="1.9"/><circle cx="12" cy="4" r="1.9"/><circle cx="20" cy="12" r="1.9"/>'+
           '<circle cx="4" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="12" cy="20" r="1.9"/>'+
           '<circle cx="20" cy="20" r="1.9"/></g>',
    reflejos:'<path d="M13.6 1.4L4.2 13.2h5.4l-1.2 9.4 9.4-11.8h-5.4z"/>',
    pacman:'<path d="M12 12L21.6 6.4A11 11 0 1 0 21.6 17.6z"/><circle cx="11.4" cy="7.4" r="1.5" opacity=".35"/>',
    culebrita:'<g fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">'+
           '<path d="M3.4 6.6h7.2v5.4h6.2v5.4h-6.6"/></g><circle cx="20.4" cy="17.4" r="2.6"/>'+
           '<circle cx="3.6" cy="6.6" r="2" opacity=".5"/>',
    solitario:'<rect x="2.4" y="4.6" width="11" height="15" rx="2" transform="rotate(-9 8 12)" opacity=".45"/>'+
           '<rect x="10.4" y="4.6" width="11" height="15" rx="2" transform="rotate(7 16 12)"/>',
    naval:'<path d="M2.6 14.6h18.8l-3 5.8H5.6z"/><path d="M11 3.2h2v9.4h-2z" opacity=".8"/>'+
           '<path d="M13.4 4.2l5.4 3-5.4 3z" opacity=".55"/><path d="M6.6 9.4h3.6v3.2H6.6z" opacity=".55"/>',
    yonunca:'<path d="M5.4 3.2h13.2l-1.4 7.2a5.4 5.4 0 0 1-10.4 0z"/>'+
           '<path d="M11 15.2h2v4.4h-2z" opacity=".7"/><path d="M7.4 19.4h9.2v1.9H7.4z" opacity=".7"/>',
    tateti:'<g stroke="currentColor" stroke-width="1.7" opacity=".4"><path d="M9 2.4v19.2M15 2.4v19.2M2.4 9h19.2M2.4 15h19.2"/></g>'+
           '<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none">'+
           '<path d="M4.2 4.2l3.6 3.6M7.8 4.2l-3.6 3.6"/></g><circle cx="18" cy="18" r="2.4" fill="none" stroke="currentColor" stroke-width="2.2"/>',
    duo:'<rect x="1.4" y="4.4" width="9" height="9" rx="1.8"/>'+
           '<rect x="13.6" y="10.6" width="9" height="9" rx="1.8" opacity=".5"/>'+
           '<path d="M12.4 6.6h4.2v3.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>'
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
    { id:"pacman",     nom:"Pac-Man",         desc:"El laberinto y los cuatro fantasmas.", tag:"clásico", c:"#f0e05e",
      externo:{ local:"../Pacman/index.html", web:"https://fnguerrero.github.io/pacman/" } },
    { id:"culebrita",  nom:"Culebrita",       desc:"La víbora del Nokia.",     tag:"clásico", c:"#5ee0b0" },
    { id:"solitario",  nom:"Solitario",       desc:"El Klondike de siempre.",  tag:"clásico", c:"#4f9de0" },
    { id:"picante",    nom:"Picante",         desc:"Verdad o reto.",  tag:"+18",     c:"#ff5f8f", dos:true },
    { id:"cuatro",     nom:"Cuatro en línea", desc:"El primero que alinea cuatro.", tag:"por turnos", c:"#5ec8f0", dos:true },
    { id:"timbiriche", nom:"Timbiriche",      desc:"Cerrá cajas y volvés a jugar.", tag:"por turnos", c:"#5ee0b0", dos:true },
    { id:"reflejos",   nom:"Duelo de reflejos", desc:"El primero que toca en verde.", tag:"a la vez", c:"#f0c05e", dos:true },
    { id:"duo",        nom:"Palabra para dos", desc:"Le mandás una palabra por chat.", tag:"a distancia", c:"#f08a5e", dos:true },
    { id:"naval",      nom:"Batalla naval",   desc:"Hundile los cinco barcos.", tag:"por turnos", c:"#4f9de0", dos:true },
    { id:"yonunca",    nom:"Yo nunca nunca",  desc:"Tres niveles, el que lee toma.", tag:"+18", c:"#c77bff", dos:true },
    { id:"tateti",     nom:"Ta-te-ti",        desc:"Dos minutos y revancha.",  tag:"por turnos", c:"#9a91b0", dos:true }
  ];

  var $menu     = document.getElementById("menu");
  var $juego    = document.getElementById("juego");
  var $grilla   = document.getElementById("grilla");
  var $lienzo   = document.getElementById("lienzo");
  var $titulo   = document.getElementById("titulo");
  var $acciones = document.getElementById("acciones");
  var actual = null;

  // ---- menú, en dos secciones ----
  function ficha(j){
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
    return b;
  }

  [{ titulo:"Solo", bajada:"para el rato muerto", dos:false },
   { titulo:"De a dos", bajada:"siete en el mismo teléfono, uno por chat", dos:true }].forEach(function(sec){
    var juegos = CATALOGO.filter(function(j){ return !!j.dos === sec.dos; });
    if (!juegos.length) return;
    var h = document.createElement("h2");
    h.className = "seccion";
    h.innerHTML = sec.titulo + "<span>" + sec.bajada + "</span>";
    $grilla.appendChild(h);
    juegos.forEach(function(j){ $grilla.appendChild(ficha(j)); });
  });

  // ---- API que usan los juegos ----
  var api = {
    // lo que venía en el link (#duo=XXXX); vacío si se entró desde el menú
    parametro: "",
    // arma un link a este mismo juego con un dato adentro, para mandar por chat
    enlace: function(id, valor){
      return location.origin + location.pathname + "#" + id + "=" + valor;
    },
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

  function abrir(j, sinHistorial, parametro){
    if (actual) cerrar();
    actual = j;
    api.parametro = parametro || "";
    $menu.hidden = true;
    $juego.hidden = false;
    $titulo.textContent = j.nom;
    $acciones.innerHTML = "";
    $lienzo.innerHTML = "";
    window.scrollTo(0, 0);
    if (!sinHistorial){
      var h = "#" + j.id + (parametro ? "=" + parametro : "");
      history.pushState({ juego:j.id, dato:parametro || "" }, "", h);
    }

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

  // abre lo que diga el hash: #sudoku, #picante, o #duo=XXXX con un desafío adentro
  function aplicarHash(){
    var partes = /^#([a-z0-9]+)(?:=(.*))?$/.exec(location.hash) || [];
    var j = porId(partes[1]);
    if (j) abrir(j, true, partes[2]);
    else cerrar();
  }

  // el botón atrás del teléfono cierra el juego, y adelante lo reabre
  window.addEventListener("popstate", function(e){
    var id = e.state && e.state.juego;
    var j = id && porId(id);
    if (j) abrir(j, true, e.state.dato);
    else aplicarHash();
  });

  // pegar un link mientras la app ya está abierta cambia el hash sin recargar
  window.addEventListener("hashchange", aplicarHash);

  if (location.hash){
    var partes = /^#([a-z0-9]+)(?:=(.*))?$/.exec(location.hash) || [];
    var pedido = porId(partes[1]);
    if (pedido){
      history.replaceState({ juego:pedido.id, dato:partes[2] || "" }, "", location.hash);
      abrir(pedido, true, partes[2]);
    }
  }
})();
