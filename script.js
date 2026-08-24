const canvas = document.getElementById('canvasPreview');
const ctx = canvas.getContext('2d');
const uploadInput = document.getElementById('upload-foto');
const zoomSlider = document.getElementById('zoom-slider');
const btnDownload = document.getElementById('btn-download');
const loadingOverlay = document.getElementById('loading-overlay');

let userImg = new Image();
let frameImg = new Image();

let imgState = {
    loaded: false,
    x: 0,
    y: 0,
    scale: 1,
    isDragging: false,
    startX: 0,
    startY: 0
};

// Carrega a moldura enviada da Carla 20055
frameImg.src = 'moldura.png';
frameImg.onload = () => {
    drawCanvas();
};

uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        loadingOverlay.style.display = 'flex';
        const reader = new FileReader();
        reader.onload = (event) => {
            userImg.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

userImg.onload = () => {
    imgState.loaded = true;
    loadingOverlay.style.display = 'none';
    
    // Configura escala inicial proporcional (Preenchimento inteligente)
    const scaleX = canvas.width / userImg.width;
    const scaleY = canvas.height / userImg.height;
    imgState.scale = Math.max(scaleX, scaleY);
    
    imgState.x = (canvas.width - userImg.width * imgState.scale) / 2;
    imgState.y = (canvas.height - userImg.height * imgState.scale) / 2;

    zoomSlider.disabled = false;
    btnDownload.disabled = false;
    
    // Define limites dinâmicos para o slider de zoom
    zoomSlider.min = (imgState.scale * 0.5).toFixed(2);
    zoomSlider.max = (imgState.scale * 4.0).toFixed(2);
    zoomSlider.value = imgState.scale.toFixed(2);

    drawCanvas();
};

function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Desenha o fundo branco estável
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Desenha a foto inserida pelo apoiador
    if (imgState.loaded) {
        ctx.save();
        ctx.drawImage(
            userImg, 
            imgState.x, 
            imgState.y, 
            userImg.width * imgState.scale, 
            userImg.height * imgState.scale
        );
        ctx.restore();
    }

    // 3. Sobrepõe a Moldura Oficial da Carla 20055
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
}

// Controle fino do Zoom centralizado
zoomSlider.addEventListener('input', (e) => {
    if (!imgState.loaded) return;
    
    const oldScale = imgState.scale;
    const newScale = parseFloat(e.target.value);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    imgState.x = centerX - (centerX - imgState.x) * (newScale / oldScale);
    imgState.y = centerY - (centerY - imgState.y) * (newScale / oldScale);
    imgState.scale = newScale;
    
    drawCanvas();
});

// Funções para mapear coordenadas de toque e mouse corretamente
function getEventCoords(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
    }
    
    return {
        x: ((clientX - rect.left) / rect.width) * canvas.width,
        y: ((e.clientY || e.touches[0].clientY) - rect.top) / rect.height * canvas.height
    };
}

function handleStart(e) {
    if (!imgState.loaded) return;
    imgState.isDragging = true;
    const coords = getEventCoords(e);
    imgState.startX = coords.x - imgState.x;
    imgState.startY = coords.y - imgState.y;
    if(e.cancelable) e.preventDefault();
}

function handleMove(e) {
    if (!imgState.isDragging) return;
    const coords = getEventCoords(e);
    imgState.x = coords.x - imgState.startX;
    imgState.y = coords.y - imgState.startY;
    drawCanvas();
    if(e.cancelable) e.preventDefault();
}

function handleEnd() {
    imgState.isDragging = false;
}

// Eventos Unificados (Desktop + Mobile)
canvas.addEventListener('mousedown', handleStart);
window.addEventListener('mousemove', handleMove);
window.addEventListener('mouseup', handleEnd);

canvas.addEventListener('touchstart', handleStart, { passive: false });
window.addEventListener('touchmove', handleMove, { passive: false });
window.addEventListener('touchend', handleEnd);

// Download da Imagem Pronta
btnDownload.addEventListener('click', () => {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'carla-20055-apoiador.png';
    link.href = dataUrl;
    link.click();
});