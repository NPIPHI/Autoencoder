window.addEventListener('resize', evt=>{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
window.addEventListener('mousemove', evt=>{
    mouse.x = evt.x;
    mouse.y = evt.y;
});
window.addEventListener('mousedown', evt =>{
    points.push([mouse.x,mouse.y])
    if(points.length>1){
        set = new Set(points);
        let eig = set.getCovarianceMatrix().getEigenvectors();
        let vects = eig.eigVects.transpose();
        eigVects = [];
        vects.elements.forEach((e,index)=>{
            eigVects.push(new Vector(e))
            eigVects[eigVects.length-1].scale(Math.sqrt(eig.eigValues.elements[index][index]))
        });
    }
});
function init(){
    canvas = document.getElementById("canvas");
    canvas.style.position='absolute';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight*(5/6);
    canvas.style.left='0px';
    canvas.style.top='0px';
    ctx = canvas.getContext("2d");
    loop();
}

function loop(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points.forEach(p => {
        ctx.fillRect(p[0]-pointWidth/2,p[1]-pointWidth/2,pointWidth,pointWidth);
    });
    if(eigVects){
        eigVects.forEach(e=>{
            ctx.moveTo(set.mean[0],set.mean[1]);
            ctx.lineTo(set.mean[0]+e[0], set.mean[1]+e[1]);
            ctx.lineTo(set.mean[0]-e[0], set.mean[1]-e[1]);
        })
        ctx.stroke();
        ctx.beginPath();
    }
    window.requestAnimationFrame(loop);
}

var set;
var eigVects;
var canvas;
var points = [];
var ctx;
var eigenVectors;
var mouse = {x: 0, y: 0};
var pointWidth = 10;
init()