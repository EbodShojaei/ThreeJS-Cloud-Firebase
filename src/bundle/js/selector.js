// See @https://armandocanals.com/posts/CSS-transform-rotating-a-3D-object-perspective-based-on-mouse-position.html

let constrain = 20;
let mouseOverContainer = document.getElementById('container');
let playground = document.getElementById('playground');
let animationList = document.getElementById('animationList');
let animationItems = document.getElementById('animationItems');

let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
let posX = 0, posY = 0; // For translate
let translateTransform = ''; // To store the translation part
let rotateTransform = ''; // To store the rotation part

const dragMouseDown = (e) => {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;

    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
};

const elementDrag = (e) => {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    let newPosX = posX - pos1;
    let newPosY = posY - pos2;

    let containerRect = playground.getBoundingClientRect();
    let elementRect = animationList.getBoundingClientRect();

    // Check boundaries for X-axis
    if (newPosX + elementRect.width <= containerRect.width && newPosX >= 0) {
        posX = newPosX;
    }

    // Check boundaries for Y-axis
    if (newPosY + elementRect.height <= containerRect.height && newPosY >= 0) {
        posY = newPosY;
    }

    translateTransform = `translate3d(${posX}px, ${posY}px, 0px)`;
    applyTransforms();
};

const closeDragElement = () => {
    document.onmouseup = null;
    document.onmousemove = null;
};

const transforms = (x, y, el) => {
    let box = el.getBoundingClientRect();
    let calcX = (y - box.y - box.height / 2) / constrain;
    let calcY = -(x - box.x - box.width / 2) / constrain;

    return `perspective(100px) rotateX(${calcX}deg) rotateY(${calcY}deg)`;
};

animationList.onmouseleave = () => {
    rotateTransform = 'perspective(100px) rotateX(0deg) rotateY(0deg)';
    applyTransforms();
};

const applyTransforms = () => {
    animationList.style.transform = `${translateTransform}`;  // Only translation
    animationItems.style.transform = `${rotateTransform}`;  // Only rotation
};

animationList.onmousedown = dragMouseDown;

mouseOverContainer.onmousemove = (e) => {
    let xy = [e.clientX, e.clientY];
    let position = xy.concat([animationList]);

    rotateTransform = transforms.apply(null, position);
    applyTransforms();
};
