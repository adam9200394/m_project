import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';

class pathGroup {
    constructor(pathColor){
      this.pathColor = pathColor;
      this.pathElement = [];
      this.pathwieght = 0  ;
    }
    calculatePathWieght () {
        let wieghts = 0;
        this.pathElement.forEach((ele)=> {
            wieghts = wieghts + (ele.obj.position.x + ele.obj.position.y + ele.obj.position.z) ;

        });
        wieghts = wieghts * .1;
        return wieghts;
    }
}
//all action buttons
const init_btn = document.getElementById("init-btn");
const play_btn = document.getElementById("play-btn");
const visualize_btn = document.getElementById("visualize");
const readyOne_btn = document.getElementById("ready-one");
export const new_action_btn = document.getElementById("new-action-btn");
// html elements controller
const canvas = document.getElementById("threeDCanvas");
const main_content = document.getElementById("main-content");
const leftContent = document.getElementById("left-content");
const rightContent = document.getElementById("right-content");
const bottomContent = document.getElementById("bottom-content");
const topContent = document.getElementById("top-content");
const data_div = document.getElementById("data-div");
const visualize_div = document.getElementById("visualize-div");
//const btn_color = document.getElementById("btn_color");

//value varibles ==================================================
let colour = 0x0000ff;
let time = 0;
const width = 10;
const height = 10;
const intensity = 1;
const colors = [ 0xd3c41d, 0x88ed7d, 0xe12323, 0xe123cb, 0x23e1c8, 0xe16c23];
const pathGroups = [];
const pointArray = [];
let init_ready = false;
const size = 800;
const divisions = 50;
let new_action_err_msg = false;

//init data
export let data = {};
data.actions = [];
data.effectors = [];
export function getData() {
    data.param =parseInt(document.getElementById("par").value);
    data.segments =parseInt(document.getElementById("segments").value);
    data.bones =parseInt(document.getElementById("bones").value);
    data.groups =parseInt(document.getElementById("groups").value);
    
}


//init pathgroups
for (let i=0; i < colors.length; i++){
    pathGroups.push(new pathGroup(colors[i]));
}
//console.log(pathGroups)



// init scene =======================================================================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, .01, 1000 );
camera.position.set( 20, 20, 200 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
const controls = new OrbitControls( camera, renderer.domElement );
controls.update();


// ===================================== beging event =========================================
init_btn.addEventListener("click", ()=> {
    canvas.classList.add("open");
    canvas.classList.remove('closed')
    init_btn.innerText = "";
    main_content.classList.add("visiblity");
    setTimeout(() => {
        canvas.appendChild(renderer.domElement);
        canvas.classList.remove("black");
        leftContent.classList.remove("visiblity");
        rightContent.classList.remove("visiblity");
        bottomContent.classList.remove("visiblity");
        topContent.classList.remove("visiblity");
        document.getElementsByTagName("title")[0].innerText = 'simulator';
    },700);
  
  

 
//get data 
getData();
console.log(data);
let param = data.param;

// axes helper
const axesHelper = new THREE.AxesHelper( 1000 );
scene.add( axesHelper );

//grid helper
const gridHelper = new THREE.GridHelper( size, divisions );
scene.add( gridHelper );

// scene lighting
const spotLight = new THREE.SpotLight( 0xffffff );
spotLight.position.set( 100, 1000, 100 );

spotLight.castShadow = true;
spotLight.power = 200;

spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;

spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 30;

scene.add( spotLight );

/* ------ add meshes -------*/
//sphers geometry ------------------------------
for(let i= 0; i< param; i++){
    let x= (Math.random() * window.innerHeight) / -3;
    let z= Math.random() * 160;
    let y = (Math.random() * window.innerWidth) / 3 ;
    let colordata = colors[Math.floor(Math.random() * colors.length)] ;
    const geometry = new THREE.SphereGeometry( 2, 4, 4 );
    const material = new THREE.MeshBasicMaterial( { color: colordata } );
    const sphere = new THREE.Mesh( geometry, material );
    sphere.position.set(x, y, z);
    let pointObject = {"obj": sphere, colordata}
    pointArray.push(pointObject);
   // console.log(sphere.position)
    scene.add( sphere );
}
// connect vertex  -------------------------------
for (let i=0; i< pathGroups.length; i++){
 for(let j=0; j<pointArray.length; j++) {
   if(pathGroups[i].pathColor == pointArray[j].colordata){
       pathGroups[i].pathElement.push(pointArray[j]);
   }
 }
}
//console.log(pathGroups);

//console.log( pathGroups[0].pathElement[0].obj.position);
for(let j=0; j< pathGroups.length; j++){

    const vertexLine = [];
    for(let i=0; i<pathGroups[j].pathElement.length; i++) {
        let pointVertex = createVertex(pathGroups[j].pathElement[i].obj.position);
        vertexLine.push(pointVertex);
    }

    scene.add(draw(vertexLine, pathGroups[j].pathColor))
    
}
console.log(pathGroups[0].calculatePathWieght());
console.log(pathGroups[1].calculatePathWieght());
console.log(pathGroups[2].calculatePathWieght());
console.log(pathGroups[3].calculatePathWieght());
/* console.log(pathGroups[0].pathElement[0].obj.position.x) */

bottomContent.innerHTML = `<p class="text"> parameters: ${param}    pathgroups: ${pathGroups.length} </p>`;
data_div.innerHTML = `<h4> arttibutes: </h4> <p class="sub-text"> muscle-groups : ${data.groups} </p>  <p class="sub-text">bones : ${data.bones}</p>  <p class="sub-text">segments : ${data.segments}</p>`


//render and animate
renderer.render( scene, camera );
//animate();


});

/* ====================================scene functions============================================ */
function init() {
 // later use
}

function render() {
   //later use
}
function animate() {
	requestAnimationFrame( animate );

	// required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();
     
	renderer.render( scene, camera );   

}


/* =========================== helper function ===================================================*/
// draw from points

 function draw (points, color) {
    const material = new THREE.LineBasicMaterial( { color: color } );
  
    const geometry = new THREE.BufferGeometry().setFromPoints( points );
  
    const line = new THREE.Line( geometry, material );
    return line;

}
 
// set number of points
 function createVertex (location) {   

    return new THREE.Vector3( location.x, location.y, location.z );;
} 
 
/* ==========================================other event listeners================================ */

play_btn.addEventListener("click", ()=> {
    animate();
});

// ==========================================btns event listeners ===================================
//===================================================================================================
//===================================================================================================


readyOne_btn.addEventListener("click", () => {
  getData();
  let groups = data.groups;
  let bones = data.bones;
  let div = document.createElement("div");
  let h4 = document.createElement("h4");
  h4.innerText = "define realshionships : ";
  div.appendChild(h4);
  div.classList.add("sub-section");
  div.classList.add("pop-section");
  div.classList.add("closed");
  div.classList.add("visiblity");

  
  
  if(!init_ready) document.getElementsByClassName("section")[0].appendChild(div);
  init_ready = true;
  setTimeout(() => {
    div.classList.remove("visiblity");
     div.classList.remove("closed");
     div.classList.add("open");
     
}, 100);

for(let i=0; i< bones; i++) {
    let div2 = document.createElement('div');
    div2.classList.add('effector');
    let p = document.createElement("p");
    let divider = document.createElement("div");
    divider.classList.add('divider');
    p.classList.add('text');
    p.innerText = "bone." + i;
    div2.appendChild(p);
    for(let j=0; j<groups; j++){
        let input = document.createElement('input');
        let label =  document.createElement('label');
        input.classList.add('input-text');
        input.type = "range";
        input.name = 'group.' +j ;
        input.min = "0";
        input.max = "100";
        input.value = "0";
        label.for = 'group.' +j ;
        label.innerText = 'group.' +j;
       /*  input.placeholder = 'group ' +j + ' effect'; */
        div2.appendChild(input);
        div2.appendChild(label);
    }
    div.appendChild(div2);
    div.appendChild(divider);

  }

  let btn_1 = document.createElement("button");
  let btn_2 = document.createElement("button");
  let div3 = document.createElement("div");
  btn_1.classList.add("btn");
  btn_2.classList.add("btn");
  btn_1.innerText = "  ok  ";
  btn_2.innerText = " rest ";
  div3.appendChild(btn_1);
  div3.appendChild(btn_2);
  div.appendChild(div3);

  btn_1.addEventListener("click", () => {
    div.classList.add("closed");
    div.classList.remove("open");
    div.classList.add("visiblity");
    setTimeout(() => {
        let select = document.getElementsByClassName("section")[0];
        select.removeChild(select.lastChild);
    }, 100);
    div3.removeChild(div3.firstChild);
    div3.removeChild(div3.firstChild);
    let text = document.createElement('p');
    text.classList.add("text");
    text.classList.add("inline");
    text.innerText = "arttibutes setted.";
    div3.appendChild(text);
    div3.appendChild(btn_2);
    div3.classList.add("centered");
    setTimeout(() => {
        document.getElementsByClassName("section")[0].appendChild(div3);
    }, 101);
   for(let i=0; i< div.children.length; i++){
       if( div.children[i].classList.contains('effector')){
        let value = [];
        let bone = '';
        let effector = {};
        for(let j=0; j<div.children[i].children.length; j++){
            if(div.children[i].children[j].tagName == "INPUT"){
                 value.push(div.children[i].children[j].value);
            }

            if(div.children[i].children[j].tagName == "P"){
                bone = div.children[i].children[j].innerText;
                ///////bookmark
              }

         }
        effector = { bone, value };
        data.effectors.push(effector);
        console.log(data.effectors);
          
       }
       
       
   }

   
  });


  btn_2.addEventListener("click", () => {
    div.classList.remove("open");
    div.classList.add("closed");
    div.classList.add("visiblity");
    let select = document.getElementsByClassName("section")[0];
    select.removeChild(select.lastChild);
    init_ready = false;
    
    
  });

 
});

new_action_btn.addEventListener("click", ()=> {
    getData();
    let section = document.getElementById("new-action");
    let div = document.createElement('div');
    let div2  = document.createElement('div');
    let input = document.createElement("input"); 
    let save_btn = document.createElement("button");  
    if(!init_ready) {
        let error_msg = document.createElement('p');
        error_msg.innerText = "save the mechinceal arttibutes first to initiate actions (press ready button).";
        error_msg.classList.add('centered-text');
        error_msg.classList.add('error-msg');
        div.id = "error-div";
        if(!new_action_err_msg){
            div.appendChild(error_msg);
            section.appendChild(div);
        }
        new_action_err_msg = true;
       
    } else {
        if(section.children[0].id == "error-div"){
            let error_div = document.getElementById("error-div");
            section.removeChild(error_div);
        }
       
        input.type = 'text';
        input.name = 'action-name';
        input.id = 'action-name';
        input.placeholder = 'action name';
        input.classList.add('input-text');
        input.classList.add('inline');
        save_btn.classList.add('btn');
        save_btn.innerText = 'save action';
        for(let i=0; i<data.groups;i++){
            let input = document.createElement('input');
            let label =  document.createElement('label');
            input.classList.add('input-text');
            input.type = "range";
            input.name = 'group.' +i ;
            input.min = "0";
            input.max = "100";
            input.value = "0";
            input.id = 'group.' +i;
            label.for = 'group.' +i;
            label.innerText = 'group.' +i;
            div2.appendChild(input);
            div2.appendChild(label);
        }
    
        div.appendChild(input);
        div.appendChild(save_btn);
        div.appendChild(div2);
        section.appendChild(div);
        save_btn.addEventListener("click", ()=> {
            let name = document.getElementById('action-name').value;
            let values = [] ;
            for(let i=0; i<div2.children.length; i++){
                if(div2.children[i].type == "range"){
                 
                    values.push( div2.children[i].value );
                }
            }
            let action = {action_name: name, values }
        
          let saved = document.createElement("p");
          saved.innerText = 'action name: ' + action.action_name + ' saved';
          div.removeChild(input);
          div.removeChild(save_btn);
          div.removeChild(div2);
          data.actions.push(action);
          div.appendChild(saved);
          console.log(data)
          //section.removeChild(div);
        });
    

    }
   


});







window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
});