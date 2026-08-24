const canvas = document.getElementById('canvasPreview');
const ctx = canvas.getContext('2d');
const uploadInput = document.getElementById('upload-foto');
const zoomSlider = document.getElementById('zoom-slider');
const btnDownload = document.getElementById('btn-download');

let userImg = new Image();
let frameImg = new Image();

// Configurações iniciais da imagem do usuário no Canvas
let imgState = {
    loaded: false,
    x: 0,
    y: 0,
    scale: 1,
    isDragging: false,
    startX: 0,
    startY: 0
};

// Carrega a imagem da moldura por padrão
frameImg.src = 'moldura.png';
frameImg.onload = () => {
    drawCanvas();
};

// Ouvinte para upload de foto
uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            userImg.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

userImg.onload = () => {
    imgState.loaded = true;
    
    // Centraliza e ajusta a escala inicial de forma proporcional (Cover)
    const scaleX = canvas.width / userImg.width;
    const scaleY = canvas.height / userImg.height;
    imgState.scale = Math.max(scaleX, scaleY);
    
    imgState.x = (canvas.width - userImg.width * imgState.scale) / 2;
    imgState.y = (canvas.height - userImg.height * imgState.scale) / 2;

    // Configura o slider de zoom com base no tamanho ideal
    zoomSlider.disabled = false;
    btnDownload.disabled = false;
    zoomSlider.min = Math.min(scaleX, scaleY).toFixed(2);
    zoomSlider.max = (imgState.scale * 3).toFixed(2);
    zoomSlider.value = imgState.scale.toFixed(2);

    drawCanvas();
};

// Atualiza o desenho no Canvas
function drawCanvas() {
    // Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Desenha a foto do usuário se estiver carregada
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

    // 2. Desenha a Moldura por cima
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
}

// Controle do Slider de Zoom
zoomSlider.addEventListener('input', (e) => {
    if (!imgState.loaded) return;
    
    const oldScale = imgState.scale;
    const newScale = parseFloat(e.target.value);
    
    // Mantém o zoom focado no centro do canvas
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    imgState.x = centerX - (centerX - imgState.x) * (newScale / oldScale);
    imgState.y = centerY - (centerY - imgState.y) * (newScale / oldScale);
    imgState.scale = newScale;
    
    drawCanvas();
});

// Funções para Arrastar e Posicionar a Foto (Mouse e Touchscreen)
function startDrag(clientX, clientY) {
    if (!imgState.loaded) return;
    imgState.isDragging = true;
    imgState.startX = clientX - imgState.x;
    imgState.startY = clientY - imgState.y;
}

function moveDrag(clientX, clientY) {
    if (!imgState.isDragging) return;
    imgState.x = clientX - imgState.startX;
    imgState.y = clientY - imgState.startY;
    drawCanvas();
}

function stopDrag() {
    imgState.isDragging = false;
}

// Eventos de Mouse
canvas.addEventListener('mousedown', (e) => startDrag(e.offsetX, e.offsetY));
window.addEventListener('mousemove', (e) => {
    if(imgState.isDragging) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * canvas.width;
        const mouseY = ((e.clientY - rect.top) / rect.height) * canvas.height;
        moveDrag(mouseX, mouseY);
    }
});
window.addEventListener('mouseup', stopDrag);

// Eventos de Touch (Celular)
canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        const rect = canvas.getBoundingClientRect();
        const touchX = ((e.touches[0].clientX - rect.left) / rect.width) * canvas.width;
        const touchY = ((e.touches[0].clientY - rect.top) / rect.height) * canvas.height;
        startDrag(touchX, touchY);
    }
});
canvas.addEventListener('touchmove', (e) => {
    if (imgState.isDragging && e.touches.length === 1) {
        const rect = canvas.getBoundingClientRect();
        const touchX = ((e.touches[0].clientX - rect.left) / rect.width) * canvas.width;
        const touchY = ((e.touches[0].clientY - rect.top) / rect.height) * canvas.height;
        moveDrag(touchX, touchY);
    }
});
canvas.addEventListener('touchend', stopDrag);

// Ação de Download da Imagem Pronta
btnDownload.addEventListener('click', () => {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'meu-perfil-apoiador.png';
    link.href = dataUrl;
    link.click();
});
