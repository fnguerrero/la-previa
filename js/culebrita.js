window.JUEGOS = window.JUEGOS || {};
window.JUEGOS.culebrita = (function(){
  "use strict";

  var N = 17;                 // celdas por lado
  var api, cv, ctx, lado, cuerpo, dir, pedido, fruta, reloj, vivo, puntos, record, $mar;

  function celdaLibre(){
    var p;
    do {
      p = { x:Math.floor(Math.random()*N), y:Math.floor(Math.random()*N) };
    } while (cuerpo.some(function(c){ return c.x === p.x && c.y === p.y; }));
    return p;
  }

  function paso(){
    dir = pedido;
    var cab = { x:cuerpo[0].x + dir.x, y:cuerpo[0].y + dir.y };

    // las paredes matan; es más claro que atravesarlas
    if (cab.x < 0 || cab.y < 0 || cab.x >= N || cab.y >= N) return perder();
    if (cuerpo.some(function(c){ return c.x === cab.x && c.y === cab.y; })) return perder();

    cuerpo.unshift(cab);
    if (cab.x === fruta.x && cab.y === fruta.y){
      puntos++;
      fruta = celdaLibre();
      if (puntos % 4 === 0) acelerar();
    } else {
      cuerpo.pop();
    }
    dibujar();
  }

  var demora;
  function acelerar(){
    demora = Math.max(70, demora - 8);
    clearInterval(reloj);
    reloj = setInterval(paso, demora);
  }

  function perder(){
    vivo = false;
    clearInterval(reloj);
    if (puntos > record){
      record = puntos;
      api.guardar("culebrita.record", record);
    }
    dibujar();
    api.fin("Chocaste", "Comiste <b>" + puntos + "</b>.", [{ txt:"Otra vez", fn:arrancar }]);
  }

  function dibujar(){
    var c = lado / N;
    ctx.fillStyle = "#171522";
    ctx.fillRect(0, 0, lado, lado);

    ctx.fillStyle = "#e0574f";
    ctx.beginPath();
    ctx.arc((fruta.x + .5)*c, (fruta.y + .5)*c, c*.32, 0, 7);
    ctx.fill();

    for (var i = cuerpo.length - 1; i >= 0; i--){
      ctx.fillStyle = i === 0 ? "#7ff0b4" : "#5ee0b0";
      ctx.globalAlpha = i === 0 ? 1 : Math.max(.35, 1 - i/(cuerpo.length + 6));
      redondeado(cuerpo[i].x*c + 1, cuerpo[i].y*c + 1, c - 2, c - 2, Math.min(5, c/3));
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    $mar.innerHTML = '<div><b>' + puntos + '</b>comidas</div><div><b>' + record + '</b>récord</div>';
  }

  function redondeado(x, y, w, h, r){
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function girar(d){
    if (!vivo) return;
    // no se puede volver sobre uno mismo
    if (d.x === -dir.x && d.y === -dir.y) return;
    pedido = d;
  }

  function tecla(e){
    var m = { ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0}, ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1} }[e.key];
    if (!m) return;
    e.preventDefault();
    girar(m);
  }

  var x0, y0;
  function tocar(e){ var t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; }
  function soltar(e){
    if (x0 == null) return;
    var t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
    x0 = null;
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
    girar(Math.abs(dx) > Math.abs(dy)
      ? { x:dx > 0 ? 1 : -1, y:0 }
      : { x:0, y:dy > 0 ? 1 : -1 });
  }

  function medir(){
    lado = Math.min(cv.parentNode.clientWidth, 420);
    cv.width = lado; cv.height = lado;
    cv.style.width = lado + "px"; cv.style.height = lado + "px";
  }

  function arrancar(){
    clearInterval(reloj);
    medir();
    cuerpo = [{x:8,y:8},{x:7,y:8},{x:6,y:8}];
    dir = { x:1, y:0 }; pedido = dir;
    fruta = celdaLibre();
    puntos = 0; vivo = true; demora = 150;
    dibujar();
    reloj = setInterval(paso, demora);
  }

  return {
    montar: function(el, _api){
      api = _api;
      record = api.leer("culebrita.record", 0);
      el.innerHTML =
        '<div class="marcador" id="marCu"></div>' +
        '<canvas class="tablero gcu" id="gcu"></canvas>' +
        '<p class="aviso">Deslizá sobre el tablero para girar. En compu, con las flechas.</p>';
      cv = document.getElementById("gcu");
      ctx = cv.getContext("2d");
      $mar = document.getElementById("marCu");
      api.accion("Reiniciar", arrancar);
      document.addEventListener("keydown", tecla);
      cv.addEventListener("touchstart", tocar, { passive:true });
      cv.addEventListener("touchend", soltar);
      window.addEventListener("resize", medir);
      arrancar();
    },
    desmontar: function(){
      clearInterval(reloj);
      document.removeEventListener("keydown", tecla);
      window.removeEventListener("resize", medir);
    }
  };
})();
