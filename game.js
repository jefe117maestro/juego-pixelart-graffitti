const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#333',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
        },
    },
    scene: {
        preload,
        create,
        update,
    },
};

const game = new Phaser.Game(config);

let player;
let cursors;
let walls;
let objects;
let exit;
let collectedItems = 0;
let totalItems = 3;
let scoreText;
let enemies;
let graffiti;

function preload() {
    this.load.image('player', 'assets/player.png');
    this.load.image('wall', 'assets/wall.png');
    this.load.image('object', 'assets/object.png');
    this.load.image('exit', 'assets/exit.png');
    this.load.image('enemy', 'assets/enemy.png'); // Imagen de los enemigos
    
    // Cargar el gif del graffiti como spritesheet (ajusta el frameWidth y frameHeight)
    this.load.spritesheet('graffiti', 'assets/graffiti.gif', { 
        frameWidth: 1200,   // Tamaño de cada cuadro del gif
        frameHeight: 1200,  // Tamaño de cada cuadro del gif
        endFrame: 10       // Número total de cuadros en el gif
    });
}

function create() {
    // Crear grupo de paredes
    walls = this.physics.add.staticGroup();

    // Nuevo diseño del laberinto
    const maze = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    const tileSize = 50;
    maze.forEach((row, rowIndex) => {
        row.forEach((tile, colIndex) => {
            if (tile === 1) {
                walls.create(colIndex * tileSize + tileSize / 2, rowIndex * tileSize + tileSize / 2, 'wall');
            }
        });
    });

    // Crear al jugador
    player = this.physics.add.sprite(75, 75, 'player').setCollideWorldBounds(true);

    // Crear objetos
    objects = this.physics.add.group();
    objects.create(150, 150, 'object');
    objects.create(450, 250, 'object');
    objects.create(650, 400, 'object');

    // Crear la salida
    exit = this.physics.add.staticSprite(750, 550, 'exit');

    // Crear enemigos
    enemies = this.physics.add.group();
    enemies.create(300, 300, 'enemy');
    enemies.create(500, 100, 'enemy');
    enemies.create(700, 500, 'enemy');

    // Colisiones y eventos
    this.physics.add.collider(enemies, walls);
    this.physics.add.collider(player, walls);
    this.physics.add.collider(player, enemies, gameOver, null, this);
    this.physics.add.overlap(player, objects, collectObject, null, this);
    this.physics.add.overlap(player, exit, finishGame, null, this);

    // Texto de objetos recolectados
    scoreText = this.add.text(10, 10, `Items: ${collectedItems}/${totalItems}`, {
        fontSize: '20px',
        fill: '#fff',
    });

    // Configurar controles
    cursors = this.input.keyboard.createCursorKeys();

    // Crear animación del graffiti
    this.anims.create({
        key: 'graffitiAnimation',
        frames: this.anims.generateFrameNumbers('graffiti', { start: 0, end: 10 }), // Rango de frames del gif
        frameRate: 10, // Velocidad de la animación
        repeat: -1, // Repetir infinitamente
    });
}

function update() {
    player.setVelocity(0);

    if (cursors.left.isDown) player.setVelocityX(-150);
    if (cursors.right.isDown) player.setVelocityX(150);
    if (cursors.up.isDown) player.setVelocityY(-150);
    if (cursors.down.isDown) player.setVelocityY(150);

    // Teletransportación: cuando el jugador cruza un borde, se teletransporta al lado opuesto
    if (player.x < 0) {
        player.x = config.width; // Teletransporta a la derecha
    } else if (player.x > config.width) {
        player.x = 0; // Teletransporta a la izquierda
    }

    if (player.y < 0) {
        player.y = config.height; // Teletransporta abajo
    } else if (player.y > config.height) {
        player.y = 0; // Teletransporta arriba
    }

    // Movimiento de los enemigos
    enemies.children.iterate((enemy) => {
        this.physics.moveToObject(enemy, player, 100);
    });
}

function collectObject(player, object) {
    object.destroy();
    collectedItems++;
    scoreText.setText(`Items: ${collectedItems}/${totalItems}`);
}

function finishGame(player, exit) {
    if (collectedItems === totalItems) {
        graffiti = this.add.sprite(400, 300, 'graffiti').setOrigin(0.5, 0.5).play('graffitiAnimation'); // Usar la animación
        this.physics.pause();
        this.add.text(300, 550, '¡Felicidades! Presiona R para reiniciar', {
            fontSize: '20px',
            fill: '#fff',
        });
        this.input.keyboard.once('keydown-R', () => {
            collectedItems = 0;
            this.scene.restart();
        });
    }
}

function gameOver(player, enemy) {
    this.physics.pause();
    this.add.text(300, 300, '¡Game Over! Presiona R para reiniciar', {
        fontSize: '20px',
        fill: '#f00',
    });
    this.input.keyboard.once('keydown-R', () => {
        collectedItems = 0;
        this.scene.restart();
    });
}
