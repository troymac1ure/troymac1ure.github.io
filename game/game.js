// game.js

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

score = 0;
highScore = 0;
deathMovement = 0;
hoverDirection = -0.2;
screenOffset = 0;
inMenu = true;
inGame = false;

showFPS = false;
let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 0;

const boardSpritePaths = [
    'sprites/board1.png',
    'sprites/board2.png',
    'sprites/board3.png',
    'sprites/board4.png',
    'sprites/board5.png',
    'sprites/board6.png'
];
const boardSprites = [];

const player = {
    x: canvas.width / 4,
    y: canvas.height*2/3,
    width: 128, // Set the width of your player sprite
    height: 128, // Set the height of your player sprite
    speed: 4,
    moveX: 0,
    moveY: 0,
    riderXOffset: 0,
    riderYOffset: -75,
    hoverOffset: 0,
    boardSprite: new Image(),
    riderSprite: new Image(),
    frameIndex: 0,
    framesPerRow: 4, // Number of frames in each row of the sprite sheet
    frameDelay: 10, // Adjust this value to control animation speed
    currentFrameDelay: 0,
    isDead: false,
};

const background = {
    x: 0, // Initial background position
    image: new Image(),
};

const mountains = {
    x: 0, // Initial background position
    image: new Image(),
};

const clouds = {
    x: 0, // Initial background position
    image: new Image(),
};

const sky = {
    x: 0, // Initial background position
    image: new Image(),
};


const rock = {
    x: canvas.width,
    y: getRandomInteger(canvas.height/2, canvas.height),
    width: 128, // Set the width of rock sprite
    height: 128, // Set the height of rock sprite
    speed: 0,
    moveX: 0,
    moveY: 0,
    sprite: new Image(),
}

function loadBoardSprite(path) {
    const image = new Image();

    image.onload = function() {
        console.log(`Image loaded: ${path}`);
        boardSprites.push(image);
    };

    image.onerror = function() {
        console.warn(`Error loading image: ${path}`);
        // Handle the error gracefully, e.g., by not adding the image to the array
    };

    image.src = path;
}

function loadPlayerSprites(board, rider) {
   console.log("Loading Player Sprites");
   // Load two separate images
   player.boardSprite.src = './sprites/board4.png';
   player.riderSprite.src = './sprites/rider1.png';
}

// Load the board & player sprites
loadPlayerSprites(1,1);

// Load the rock sprite
console.log("Loading Rock Sprite");
rock.sprite.src = 'sprites/rock1.png';
rock.sprite.onload = () => {
   rock.width = rock.sprite.width * 2;
   rock.height = rock.sprite.height * 2;
};

// Load the background image
console.log("Loading Backgrounds & Sky");
background.image.src = 'images/ground.png';
mountains.image.src = 'images/mountains.png';
clouds.image.src = 'images/clouds.png';
sky.image.src = 'images/sky.png';

const audio = new Audio('audio/cruisingmusic.mp3'); // Replace with the path to your sound file

function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawBackground() {

    // ** Draw Sky
    ctx.drawImage(sky.image, 
         0, 0, sky.image.width, sky.image.height*0.55,
         0, 0, canvas.width, canvas.height*0.55);

    // ** Draw Clouds
    clouds.x = (screenOffset / 5) % clouds.image.width;
    imageEnd = Math.min(canvas.width, clouds.image.width-clouds.x);
    ctx.drawImage(clouds.image, 
         (clouds.x % clouds.image.width), 0, imageEnd, clouds.image.height,
         0, 0, imageEnd, canvas.height/2);
    // For clouds wrapping
    if (imageEnd < canvas.width) {
       ctx.drawImage(clouds.image, 
            0, 0, canvas.width-imageEnd, clouds.image.height,
            imageEnd, 0, canvas.width-imageEnd, canvas.height/2);
    }
    // ctx.drawImage(clouds.image, 0, 0, canvas.width-clouds.x, canvas.height);
    // ctx.drawImage(clouds.image, canvas.width+clouds.x, 0, canvas.width, canvas.height);

    // ** Draw Mountains
    mountains.x = (screenOffset / 4) % mountains.image.width;
    imageEnd = Math.min(canvas.width, mountains.image.width-mountains.x);
    ctx.drawImage(mountains.image, 
         (mountains.x % mountains.image.width), 0, imageEnd, mountains.image.height,
         0, 0, imageEnd, canvas.height*0.61);
    // For mountains wrapping
    if (imageEnd < canvas.width) {
       ctx.drawImage(mountains.image, 
            0, 0, canvas.width-imageEnd, mountains.image.height,
            imageEnd, 0, canvas.width-imageEnd, canvas.height*0.61);
    }

    // Clear the ground canvas
    // ctx.clearRect(0, canvas.height*0.60, canvas.width, canvas.height);

    // ** Draw Ground
    background.x = screenOffset % background.image.width;
    imageEnd = Math.min(canvas.width, background.image.width-background.x);
    ctx.drawImage(background.image, 
         (background.x % background.image.width), 0, imageEnd, background.image.height,
         0, canvas.height*0.60, imageEnd, canvas.height);
    // For background wrapping
    if (imageEnd < canvas.width) {
       ctx.drawImage(background.image, 
            0, 0, canvas.width-imageEnd, background.image.height,
            imageEnd, canvas.height*0.60, canvas.width-imageEnd, canvas.height);
    }
    // ctx.drawImage(background.image, 0, 0, canvas.width-background.x, canvas.height);
    // ctx.drawImage(background.image, canvas.width+background.x, 0, canvas.width, canvas.height);
}

function drawPlayerShadows() {
    // Draw the board shadow
    ctx.fillStyle = "rgb(0 0 0 / 40%)";
    ctx.beginPath();
    ctx.ellipse(player.x + player.width/2, player.y + player.height-5, player.width/3, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    // Draw the player shadow
    ctx.beginPath();
    ctx.ellipse(player.x + player.width/2 + player.riderXOffset, player.y + player.height + player.riderYOffset + 52, 20, 3.0, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawBoard(image, x, y, width, height, frame) {
    // Draw the board sprite using the current frame
    ctx.drawImage(
        image,
        frame * width, 0, width, height,
        x, y, width, height
    );
}

function drawPlayer() {
    // Draw the board sprite using the current frame
    ctx.drawImage(
        player.boardSprite,
        player.frameIndex * player.width, 0, player.width, player.height,
        player.x, player.height-player.boardSprite.height + player.y + player.hoverOffset, player.width, player.height
    );
    // Draw the player sprite using the current frame
    ctx.drawImage(
        player.riderSprite,
        player.frameIndex * player.width, 0, player.width, player.height,
        player.x + player.riderXOffset, 
        player.height-player.boardSprite.height + player.y + player.riderYOffset + player.hoverOffset, player.width, player.height
    );
}

function drawRock() {
    // Draw the rock sprite 
    ctx.strokeRect(rock.x + 8,rock.y + rock.height - 3,rock.width-10, 2);
    ctx.drawImage(
        rock.sprite,       
        rock.x, rock.y, rock.width, rock.height
    );
}

// Function to check collision between two sprites
function isPlayerCollision(spriteA) {
    return (
        player.x + 40 < spriteA.x + spriteA.width &&
        player.x + player.width - 20 > spriteA.x &&
        player.y + player.height - player.boardSprite.height < spriteA.y + spriteA.height &&
        player.y + player.height > (spriteA.y + spriteA.height * 2 / 3)
    );
}

function drawScore() {
    ctx.font = "24px Arial"; // Set the font size and family
    ctx.fillStyle = "#000"; // Set the text color
    ctx.fillText("Score: " + Math.round(score), 10, 30); // Display the score at (10, 30)
    ctx.fillText("High Score: " + highScore, canvas.width/2-75, 30); // Display the score at (10, 30)
    ctx.fillText("Speed: " + Math.round(player.speed), 10, 50); // Display the speed at (10, 50)

    if (player.isDead) {
       ctx.fillText("Your Score: " + Math.round(score), canvas.width/2-70, canvas.height/2-80); 
       if (Math.round(score) >= highScore) {
	  highScore = Math.round(score);
          ctx.fillText("NEW HIGH SCORE!", canvas.width/2-90, canvas.height/2-50); 
       }
       ctx.fillText("Press SPACE to restart", canvas.width/2-110, canvas.height/2-20); 
    }
}

function playDeathAnimation() {
    player.riderXOffset += 10;
    deathMovement -= 10;
    if (deathMovement < 0)
       deathMovement = 0;
}

function playSound() {
    audio.currentTime = 0; // Rewind to the beginning (optional)
    audio.play();
}

audio.addEventListener('ended', function() {
    playSound();
});


/**************************************************************/
selection = 0;

function menu() {  
    x = 20 - player.width;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "24px Arial"; // Set the font size and family
    ctx.fillStyle = "#000"; // Set the text color
    ctx.fillText("Choose your board with arrow keys (Enter to begin):", 10, 180);
   
    boardSprites.forEach(image => {
       if (image.complete) { 
          drawBoard(image, x+=player.width, 200, player.width, image.height, deathMovement % (player.boardSprite.width / player.width));
       }
    });
    if (selection < 0)
       selection = boardSprites.length-1;
    else if (selection >= boardSprites.length)
       selection = 0;
    ctx.beginPath();
    ctx.strokeRect(20 + selection * player.width, 200, player.width, 32);
    deathMovement++;
    // Call update function recursively
    if (inMenu) {
       requestAnimationFrame(menu);
    }
    else {
       player.boardSprite = boardSprites[selection];
       inGame = true;
       resetGame();
       // Lock @ 50 FPS to keep smooth scrolling (1000ms/20ms = 50fps)
       update = setInterval(gameUpdate, 20);
       update();
    }
}

function gameUpdate() {
    // Update game logic here

    screenOffset += player.speed; // Scroll the background
    // background.x += player.speed; // Scroll the background
    score += player.speed/100;

    // Wrap the background when it goes beyond the canvas width
    if (background.x > background.image.width) {
        background.x = 0;
    }

    rock.x -= player.speed;
    if (rock.x < -rock.width) {
        rock.y = getRandomInteger(canvas.height/2 + 10 + rock.height, canvas.height-rock.height);
        rock.x = canvas.width + 20;
        rock.width = rock.height = getRandomInteger(32, 96);
    }

    if (!player.isDead) {
       speed = Math.round(score / 50 + 4);
       
       if (player.hoverOffset < -5) {
          hoverDirection = 0.2;
       } else if (player.hoverOffset >= 0) {
          hoverDirection = -0.2;
       }
       player.hoverOffset += hoverDirection;
       if (player.speed < speed)
          player.speed = speed;
       if (audio.playbackRate != (player.speed / 40 + 0.7).toFixed(1)) {
          audio.playbackRate = (player.speed / 40 + 0.7).toFixed(1); 
          console.log(audio.playbackRate);
       }

       // move the player
       player.x += player.moveX;
       player.y += player.moveY;
       
       // Set player movement boundries
       if (player.x < 10) {
          player.x = 10;
//          if (player.speed > 3)
             player.speed-=0.2;
       }
       if (player.x > canvas.width/3) {
          player.x = canvas.width/3;
          // if (player.speed < 20)
             player.speed+=0.2;
       }

       if (player.y < canvas.height/2)
          player.y = canvas.height/2;
       if (player.y > canvas.height-player.height)
          player.y = canvas.height-player.height;

       // Check for collision
       // console.log((player.y + player.height - player.boardSprite.height), " ", rock.y, " ",
       //        (player.y + player.height - player.boardSprite.height) < (rock.y + rock.height), "  ",
       //        player.y + player.height > rock.y);
       if (isPlayerCollision(rock)) {
           if (!player.isDead) {
              deathMovement = 100;
              player.isDead = true;
              player.speed = 0;
              audio.pause();
           }
       } else {
           // player.riderXOffset = 0;
       }
    };

    if (deathMovement > 0)
       playDeathAnimation();       

    // Draw game elements
    // ctx.clearRect(0, canvas.height*0.0, canvas.width, canvas.height);
    drawBackground();
    drawPlayerShadows();
    if (player.y + player.height > rock.y + rock.height) {
       drawRock();
       drawPlayer();
    } else {
       drawPlayer();
       drawRock();
    }
    drawScore();

    // Update the frame index for animation only when the frame delay is reached
    player.currentFrameDelay++;
    if (player.currentFrameDelay >= player.frameDelay) {
        player.frameIndex = (player.frameIndex + 1) % player.framesPerRow;
        player.currentFrameDelay = 0;
    }

    // *** For FPS calculations ***
    if (showFPS) {
       // Calculate delta time (time elapsed since last frame)
       const currentTime = performance.now();
       const deltaTime = currentTime - lastFrameTime;

       // Increment frame count
       frameCount++;

       // Calculate FPS every second
       if (deltaTime >= 1000) {
           fps = frameCount;
           frameCount = 0;
           lastFrameTime = currentTime;
       }
       ctx.fillText("FPS: " + fps, canvas.width-110, 30);
    }
    // *** END: For FPS calculations ***

    // Call update function recursively
    if (inGame) {
       requestAnimationFrame(update);
    }
    else {
       inMenu = true;
       menu();
    }

}

function resetGame() {
          player.speed = 4;
          player.moveX = 0;
          player.moveY = 0;
          player.riderXOffset = 0;
          player.riderYOffset = -75;
          score = 0;
          deathMovement = 0;
          // background.x = 0;
          rock.x = -10;
          player.isDead = false;
          playSound();
}

// Handle keyboard input
document.addEventListener("keydown", (event) => {
    if (event.key === " ") {
       if (inGame) {
          resetGame();
       }
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
        if (inMenu) {
           selection--;
        }
        else if (inGame) {
           player.moveX = -5;
        }
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "ArrowLeft") {
        if (inGame) {
           if (player.moveX < 0)
               player.moveX = 0;
        }
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
        if (inMenu) {
           selection++;
        }
        else if (inGame) {
           player.moveX = 5;
        }
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "ArrowRight") {
        if (inGame) {
           if (player.moveX > 0)
               player.moveX = 0;
        }
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") {
        if (inGame) {
           player.moveY = -5;
        } 
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "ArrowUp") {
        if (inGame) {
           if (player.moveY < 0)
               player.moveY = 0;
        }
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
        if (inGame) {
           player.moveY = 5;
        }
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "ArrowDown") {
        if (inGame) {
           if (player.moveY > 0)
               player.moveY = 0;
        }
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        if (inMenu) {
           inMenu = false;
        }
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "f") {
       showFPS = !showFPS;
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        if (!inMenu) {
           inMenu = true;
           inGame = false;
           audio.pause();
        }
    }
});


document.getElementById('playButton').addEventListener('click', () => {
    playSound();
});
document.getElementById('stopButton').addEventListener('click', () => {
    audio.pause();
});

// Start the game loop
console.log("loading board sprites...");
boardSpritePaths.forEach(loadBoardSprite);
console.log("loading menu...");
menu();

