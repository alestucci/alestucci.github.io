const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

// Set di caratteri originali: Katakana a mezza larghezza (Half-width Katakana), cifre e simboli
const KATAKANA = "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾙﾚﾛﾜﾝ";
const LATIN_DIGITS = "0123456789ABCDEF:+-*=<>";
const CHAR_SET = (KATAKANA + LATIN_DIGITS).split("");

const FONT_SIZE = 18;
let columns = 0;
let drops = [];

// Genera una velocità di caduta fluida e moderata (fedele al film)
function getRandomSpeed() {
    return 0.20 + Math.random() * 0.35;
}

// Struttura di ogni colonna: posizione Y, velocità, lunghezza scia e mutazioni
function initMatrix() {
    // Ottimizzazione per display Retina / High-DPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    columns = Math.floor(window.innerWidth / FONT_SIZE);
    drops = [];

    for (let i = 0; i < columns; i++) {
        drops.push({
            y: Math.random() * -100, // Inizio sfasato in alto
            speed: getRandomSpeed(), // Velocità più lenta e fluida
            tailLength: 14 + Math.floor(Math.random() * 20),
            chars: [] // Array per memorizzare i glifi della scia
        });
    }
}

function getRandomChar() {
    return CHAR_SET[Math.floor(Math.random() * CHAR_SET.length)];
}

function renderRain() {
    // Effetto dissolvenza nera con leggero residuo (ghosting)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.10)';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    ctx.font = `${FONT_SIZE}px "Consolas", "Courier New", monospace`;

    for (let i = 0; i < drops.length; i++) {
        const drop = drops[i];
        const x = i * FONT_SIZE;
        const currentY = Math.floor(drop.y);

        // Aggiungi un nuovo carattere in testa se la colonna è avanzata di riga
        if (drop.chars.length === 0 || drop.chars[0].y !== currentY) {
            drop.chars.unshift({
                char: getRandomChar(),
                y: currentY
            });

            // Mantieni solo la lunghezza impostata per la scia
            if (drop.chars.length > drop.tailLength) {
                drop.chars.pop();
            }
        }

        // Disegna la scia di caratteri con gradiente di colore
        for (let j = 0; j < drop.chars.length; j++) {
            const item = drop.chars[j];
            const posY = item.y * FONT_SIZE;

            // Non disegnare elementi fuori schermo
            if (posY < -FONT_SIZE || posY > window.innerHeight + FONT_SIZE) continue;

            // Effetto mutazione casuale dei caratteri lungo la scia (come nel film)
            if (Math.random() < 0.04) {
                item.char = getRandomChar();
            }

            if (j === 0) {
                // TESTA DEL CODICE: Bianco puro brillante con bagliore verde smeraldo
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = '#88ffaa';
                ctx.shadowBlur = 10;
            } else if (j < 3) {
                // PRIMA PARTE DELLA SCIA: Verde chiaro neon
                ctx.fillStyle = '#55ff77';
                ctx.shadowColor = '#00ff66';
                ctx.shadowBlur = 5;
            } else {
                // CORPO E CODA: Verde Matrix a gradiente verso il buio
                const fade = (drop.tailLength - j) / drop.tailLength;
                const alpha = Math.max(0.12, fade);
                ctx.fillStyle = `rgba(0, ${Math.floor(180 * fade) + 50}, ${Math.floor(50 * fade) + 10}, ${alpha})`;
                ctx.shadowBlur = 0;
            }

            ctx.fillText(item.char, x, posY);
        }

        // Reset ombra
        ctx.shadowBlur = 0;

        // Avanzamento riga
        drop.y += drop.speed;

        // Reset casuale in cima quando la scia supera il fondo schermo
        if (drop.y * FONT_SIZE - (drop.tailLength * FONT_SIZE) > window.innerHeight) {
            drop.y = Math.random() * -20;
            drop.speed = getRandomSpeed();
            drop.tailLength = 14 + Math.floor(Math.random() * 20);
            drop.chars = [];
        }
    }

    requestAnimationFrame(renderRain);
}

// Gestione ridimensionamento finestra
window.addEventListener('resize', () => {
    initMatrix();
});

// Avvio
initMatrix();
requestAnimationFrame(renderRain);

