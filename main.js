
//****** GAME LOOP ********//

let time = new Date();
let deltaTime = 0;

if(document.readyState === "complete" || document.readyState === "interactive"){
    setTimeout(Init, 1);
}else{
    document.addEventListener("DOMContentLoaded", Init); 
}

function Init() {
    time = new Date();
    Start();
    Loop();
}

function Loop() {
    deltaTime = (new Date() - time) / 1000;
    time = new Date();
    Update();
    requestAnimationFrame(Loop);
}

//****** GAME LOGIC ********//

let sueloY = 22;
let velY = 0;
let impulso = 900;
let gravedad = 2500;

let vikingoPosX = 42;
let vikingoPosY = sueloY; 

let sueloX = 0;
let velEscenario = 1280/3;
let gameVel = 1;
let score = 0;

let parado = false;
let saltando = false;

let tiempoHastaObstaculo = 2;
let tiempoObstaculoMin = 0.7;
let tiempoObstaculoMax = 1.8;
let obstaculoPosY = 16;
let obstaculos = [];

let tiempoHastaNube = 0.5;
let tiempoNubeMin = 0.7;
let tiempoNubeMax = 2.7;
let maxNubeY = 270;
let minNubeY = 100;
let nubes = [];
let velNube = 0.5;

let contenedor;
let vikingo;
let textoScore;
let suelo;
let gameOver;

function Start() {
    gameOver = document.querySelector(".game-over");
    suelo = document.querySelector(".suelo");
    contenedor = document.querySelector(".contenedor");
    textoScore = document.querySelector(".score");
    vikingo = document.querySelector(".vikingo");
    document.addEventListener("keydown", HandleKeyDown);
}

function Update() {
    if(parado) return;
    
    Movervikingosaurio();
    MoverSuelo();
    DecidirCrearObstaculos();
    DecidirCrearNubes();
    MoverObstaculos();
    MoverNubes();
    DetectarColision();

    velY -= gravedad * deltaTime;
}

function HandleKeyDown(ev){
    if(ev.keyCode == 32 || ev.key === "ArrowUp"){ 
        Saltar();
    }
}

function Saltar(){
    if(vikingoPosY === sueloY){
        saltando = true;
        velY = impulso;
        vikingo.classList.remove("vikingo-corriendo");
    }
}

function Movervikingosaurio() {
    vikingoPosY += velY * deltaTime;
    if(vikingoPosY < sueloY){
        
        TocarSuelo();
    }
    vikingo.style.bottom = vikingoPosY+"px";
}

function TocarSuelo() {
    vikingoPosY = sueloY;
    velY = 0;
    if(saltando){
        vikingo.classList.add("vikingo-corriendo");
    }
    saltando = false;
}

function MoverSuelo() {
    sueloX += CalcularDesplazamiento();
    suelo.style.left = -(sueloX % contenedor.clientWidth) + "px";
}

function CalcularDesplazamiento() {
    return velEscenario * deltaTime * gameVel;
}

function Estrellarse() {
    vikingo.classList.remove("vikingo-corriendo");
    vikingo.classList.add("vikingo-estrellado");
    parado = true;
}

function DecidirCrearObstaculos() {
    tiempoHastaObstaculo -= deltaTime;
    if(tiempoHastaObstaculo <= 0) {
        CrearObstaculo();
    }
}

function DecidirCrearNubes() {
    tiempoHastaNube -= deltaTime;
    if(tiempoHastaNube <= 0) {
        CrearNube();
    }
}

function CrearObstaculo() {
    let obstaculo = document.createElement("div");
    contenedor.appendChild(obstaculo);
    obstaculo.classList.add("fuego");
    if(Math.random() > 0.5) obstaculo.classList.add("fuego2");
    obstaculo.posX = contenedor.clientWidth;
    obstaculo.style.left = contenedor.clientWidth+"px";

    obstaculos.push(obstaculo);
    tiempoHastaObstaculo = tiempoObstaculoMin + Math.random() * (tiempoObstaculoMax-tiempoObstaculoMin) / gameVel;
}

function CrearNube() {
    let nube = document.createElement("div");
    contenedor.appendChild(nube);
    nube.classList.add("nube");
    nube.posX = contenedor.clientWidth;
    nube.style.left = contenedor.clientWidth+"px";
    nube.style.bottom = minNubeY + Math.random() * (maxNubeY-minNubeY)+"px";
    
    nubes.push(nube);
    tiempoHastaNube = tiempoNubeMin + Math.random() * (tiempoNubeMax-tiempoNubeMin) / gameVel;
}

function MoverObstaculos() {
    for (let i = obstaculos.length - 1; i >= 0; i--) {
        if(obstaculos[i].posX < -obstaculos[i].clientWidth) {
            obstaculos[i].parentNode.removeChild(obstaculos[i]);
            obstaculos.splice(i, 1);
            GanarPuntos();
        }else{
            obstaculos[i].posX -= CalcularDesplazamiento();
            obstaculos[i].style.left = obstaculos[i].posX+"px";
        }
    }
}

function MoverNubes() {
    for (let i = nubes.length - 1; i >= 0; i--) {
        if(nubes[i].posX < -nubes[i].clientWidth) {
            nubes[i].parentNode.removeChild(nubes[i]);
            nubes.splice(i, 1);
        }else{
            nubes[i].posX -= CalcularDesplazamiento() * velNube;
            nubes[i].style.left = nubes[i].posX+"px";
        }
    }
}

function GanarPuntos() {
    score++;
    textoScore.innerText = score;
    if(score == 5){
        gameVel = 1.5;
        contenedor.classList.add("mediodia");
    }else if(score == 10) {
        gameVel = 2;
        contenedor.classList.add("tarde");
    } else if(score == 20) {
        gameVel = 3;
        contenedor.classList.add("noche");
    }
    suelo.style.animationDuration = (3/gameVel)+"s";
}

function GameOver() {
    Estrellarse();
    gameOver.style.display = "block";
    let boton = document.querySelector('.boton')
    boton.addEventListener('click', resetear)
}

function DetectarColision() {
    for (let i = 0; i < obstaculos.length; i++) {
        if(obstaculos[i].posX > vikingoPosX + vikingo.clientWidth) {
            //EVADE
            break; //al estar en orden, no puede chocar con más
        }else{
            if(IsCollision(vikingo, obstaculos[i], 10, 30, 15, 20)) {
                GameOver();
            }
        }
    }
}

function IsCollision(a, b, paddingTop, paddingRight, paddingBottom, paddingLeft) {
    let aRect = a.getBoundingClientRect();
    let bRect = b.getBoundingClientRect();

    return !(
        ((aRect.top + aRect.height - paddingBottom) < (bRect.top)) ||
        (aRect.top + paddingTop > (bRect.top + bRect.height)) ||
        ((aRect.left + aRect.width - paddingRight) < bRect.left) ||
        (aRect.left + paddingLeft > (bRect.left + bRect.width))
    );
}

function resetear() {
    // Restablecer variables del juego
    parado = false;
    saltando = false;
    tiempoHastaObstaculo = 2;
    tiempoHastaNube = 0.5;
    gameVel = 1;
    score = 0;

    // Eliminar obstáculos y nubes existentes
    for (let i = obstaculos.length - 1; i >= 0; i--) {
        obstaculos[i].parentNode.removeChild(obstaculos[i]);
        obstaculos.splice(i, 1);
    }
    for (let i = nubes.length - 1; i >= 0; i--) {
        nubes[i].parentNode.removeChild(nubes[i]);
        nubes.splice(i, 1);
    }

    // Restablecer posición del vikingo
    vikingoPosX = 42;
    vikingoPosY = sueloY;
    vikingo.style.bottom = vikingoPosY + "px";

    // Restablecer suelo
    sueloX = 0;
    suelo.style.left = -(sueloX % contenedor.clientWidth) + "px";

    // Restablecer texto de puntuación
    textoScore.innerText = score;

    // Ocultar pantalla de game over si está visible
    gameOver.style.display = "none";
}
