let canvas;
let ctx;
let character = new Image();


function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    character.src = '../img/2_character_pepe/1_idle/long_idle/I-20.png';
    ctx.drawImage(character, 20, 20, 50, 150 );

}