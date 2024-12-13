(function () {
    // Polyfill for requestAnimationFrame to ensure compatibility with older browsers.
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
        window.setTimeout(callback, 1000 / 60); // Fallback to setTimeout for 60 FPS.
    };
    window.requestAnimationFrame = requestAnimationFrame;
})();

// Set up the background canvas and its dimensions.
var background = document.getElementById("bg-canvas"),
    bgCtx = background.getContext("2d"), // Get the 2D drawing context.
    width = window.innerWidth, // Full width of the window.
    height = document.body.offsetHeight; // Height of the document body.

// Ensure a minimum height of 400px for the canvas.
(height < 400) ? height = 400 : height;

// Set canvas dimensions to match the window size.
background.width = width;
background.height = height;

// Function to calculate the bottom position of the dropdown menu.
function calculateDropdownBottom() {
    var dropdownItems = document.querySelectorAll(".menu li"); // Get all list items in the menu.
    if (dropdownItems.length === 0) {
        return height; // If no dropdown exists, default to full height.
    }

    var lastItem = dropdownItems[dropdownItems.length - 1]; // Get the last item in the dropdown.
    var rect = lastItem.getBoundingClientRect(); // Get the bounding box of the last item.
    return rect.bottom + window.scrollY; // Return the bottom position relative to the document.
}

// Constructor function for the Terrain object.
function Terrain(options) {
    options = options || {}; // Default options if none are provided.
    this.terrain = document.createElement("canvas"); // Create a new canvas element for the terrain.
    this.terCtx = this.terrain.getContext("2d"); // Get the 2D context for the terrain canvas.
    this.scrollDelay = options.scrollDelay || 90; // Delay between scrolling updates.
    this.lastScroll = new Date().getTime(); // Timestamp of the last scroll.

    this.terrain.width = width; // Set terrain canvas width.
    this.terrain.height = height; // Set terrain canvas height.
    this.fillStyle = options.fillStyle || "#191D4C"; // Default fill color for the terrain.

    // Determine the maximum height of the terrain, ensuring it does not overlap critical elements.
    this.maxHeight = Math.max(height * 2 / 5, calculateDropdownBottom() - 10); // 2/5 of screen height or below the dropdown.
    this.mHeight = Math.min(options.mHeight || height, this.maxHeight); // Ensure mHeight does not exceed maxHeight.

    // Generate terrain points using the midpoint displacement algorithm.
    this.points = [];

    var displacement = options.displacement || 140, // Initial displacement for randomness.
        power = Math.pow(2, Math.ceil(Math.log(width) / (Math.log(2)))); // Ensure points array length is a power of 2.

    // Initialize the start and end heights for the terrain.
    this.points[0] = this.mHeight;
    this.points[power] = this.points[0];

    // Recursively generate intermediate points.
    for (var i = 1; i < power; i *= 2) {
        for (var j = (power / i) / 2; j < power; j += power / i) {
            this.points[j] = ((this.points[j - (power / i) / 2] + this.points[j + (power / i) / 2]) / 2) + Math.floor(Math.random() * -displacement + displacement);
        }
        displacement *= 0.6; // Reduce displacement for finer detail.
    }

    document.body.appendChild(this.terrain); // Append the terrain canvas to the document body.
}

// Method to update and redraw the terrain.
Terrain.prototype.update = function () {
    // Clear the canvas before redrawing.
    this.terCtx.clearRect(0, 0, width, height);
    this.terCtx.fillStyle = this.fillStyle; // Set the fill style.

    // Scroll the terrain if enough time has passed.
    if (new Date().getTime() > this.lastScroll + this.scrollDelay) {
        this.lastScroll = new Date().getTime(); // Update the last scroll time.
        this.points.push(this.points.shift()); // Scroll by shifting points in the array.
    }

    this.terCtx.beginPath(); // Begin drawing the terrain.
    for (var i = 0; i <= width; i++) {
        if (i === 0) {
            this.terCtx.moveTo(0, this.points[0]); // Start at the first point.
        } else if (this.points[i] !== undefined) {
            this.terCtx.lineTo(i, this.points[i]); // Draw a line to the next point.
        }
    }

    // Close the terrain shape and fill it.
    this.terCtx.lineTo(width, this.terrain.height);
    this.terCtx.lineTo(0, this.terrain.height);
    this.terCtx.lineTo(0, this.points[0]);
    this.terCtx.fill();
}

// Set up the background canvas for the stars.
bgCtx.fillStyle = '#05004c'; // Background color for the sky.
bgCtx.fillRect(0, 0, width, height); // Fill the entire canvas.

const DEFAULT_INITIAL_STAR_SIZE = 3;

// Constructor function for the Star object.
function Star(options) {
    this.size = Math.random() * DEFAULT_INITIAL_STAR_SIZE; // Random size for the star.
    this.speed = Math.random() * .05; // Random horizontal speed.
    this.x = options.x; // Initial x-coordinate.
    this.y = options.y; // Initial y-coordinate.
}

// Reset the star's position when it moves off-screen.
Star.prototype.reset = function () {
    this.size = Math.random() * 2; // Reset the size.
    this.speed = Math.random() * .05; // Reset the speed.
    this.x = width; // Place it at the right edge of the canvas.
    this.y = Math.random() * height; // Randomize its vertical position.
}

// Update the star's position and draw it.
Star.prototype.update = function () {
    this.x -= this.speed; // Move the star left.
    if (this.x < 0) {
        this.reset(); // Reset the star if it moves off-screen.
    } else {
        bgCtx.fillRect(this.x, this.y, this.size, this.size); // Draw the star.
    }
}


// Constants for ShootingStar properties
const DEFAULT_MIN_ANGLE = 100; // Default minimum angle in degrees
const DEFAULT_MAX_ANGLE = 160; // Default maximum angle in degrees
const RANDOM_LENGTH_MIN = 10; // Minimum length of the shooting star trail
const RANDOM_LENGTH_MAX = 80; // Maximum additional length of the shooting star trail
const SPEED_MIN = 6; // Minimum speed of the shooting star
const SPEED_MAX = 14; // Maximum additional speed of the shooting star
const SIZE_MIN = 0.1; // Minimum size (thickness) of the shooting star trail
const SIZE_MAX = 1; // Maximum additional size of the shooting star trail
const WAIT_TIME_MIN = 1000; // Minimum wait time before the shooting star becomes active (in milliseconds)
const WAIT_TIME_MAX = 5000; // Maximum additional wait time (in milliseconds)

// Constructor function for the ShootingStar object.
function ShootingStar() {
    // Angle of attack range (in degrees) with min and max constraints
    // The angle of attack is defined as such:
    // If you were to shoot a line straight down that would be at 90 degrees
    // If you subtracted 45 degrees from the angle the line would pivot from the observers right.
    // If you added 45 degrees from the angle the line would pivot from the observers left.
    // Min and max just define the range the defined angle of attack can be set in    
    this.minAngle = DEFAULT_MIN_ANGLE; // Default minimum angle in degrees
    this.maxAngle = DEFAULT_MAX_ANGLE; // Default maximum angle in degrees

    const angleInRadians = (Math.random() * (this.maxAngle - this.minAngle) + this.minAngle) * (Math.PI / 180); // Convert degrees to radians
    this.direction = { 
        x: Math.cos(angleInRadians), // Calculate x-component from the angle
        y: Math.sin(angleInRadians)  // Calculate y-component from the angle
    };
    this.reset(); // Initialize properties
}

// Reset the shooting star's properties.
ShootingStar.prototype.reset = function () {
    this.x = Math.random() * width; // Random starting x-coordinate.
    this.y = 0; // Start at the top of the canvas.
    this.len = (Math.random() * RANDOM_LENGTH_MAX) + RANDOM_LENGTH_MIN; // Random length.
    this.speed = (Math.random() * SPEED_MAX) + SPEED_MIN; // Fixed speed.
    this.size = (Math.random() * SIZE_MAX) + SIZE_MIN; // Random thickness.
    this.waitTime = new Date().getTime() + (Math.random() * WAIT_TIME_MAX) + WAIT_TIME_MIN; // Wait time before appearing.
    this.active = false; // Initially inactive.
}

// Update the shooting star's position and draw it.
ShootingStar.prototype.update = function () {
    if (this.active) {
        this.x += this.direction.x * this.speed; // Move based on x-component of direction
        this.y += this.direction.y * this.speed; // Move based on y-component of direction

        // Check if the star is out of bounds
        if (this.x < 0 || this.x > width || this.y > height) {
            this.reset(); // Reset the star if it moves off-screen
        } else {
            // Draw the shooting star trail
            bgCtx.lineWidth = this.size; // Set the line thickness
            bgCtx.strokeStyle = "#ffffff"; // Set the trail color
            bgCtx.beginPath();
            bgCtx.moveTo(this.x, this.y); // Start of the shooting star
            bgCtx.lineTo(
                this.x - this.len * this.direction.x, // Extend the trail backward along the x direction
                this.y - this.len * this.direction.y  // Extend the trail backward along the y direction
            );
            bgCtx.stroke(); // Render the trail
        }
    } else {
        // Activate the star after its wait time
        if (this.waitTime < new Date().getTime()) {
            this.active = true;
        }
    }
}







var entities = []; // Array to hold all visual entities (stars, terrain, etc.).

// Init the stars
for (var i = 0; i < height; i++) {
    entities.push(new Star({
        x: Math.random() * width,
        y: Math.random() * height
    }));
}

const AMOUNT_OF_SHOOTING_STARS = 7;

// Add an amount of shooting stars that just cycle.
for (var i = 0; i < AMOUNT_OF_SHOOTING_STARS; i++) {
    entities.push(new ShootingStar());
}
entities.push(new Terrain({ mHeight: ((height * 2) / 5) })); // Layer 0 - 2/5 of screen
entities.push(new Terrain({ displacement: 200, scrollDelay: 50, fillStyle: "rgb(17,20,40)", mHeight: ((height * 2) / 5) })); // Layer 1
entities.push(new Terrain({ displacement: 250, scrollDelay: 20, fillStyle: "rgb(10,10,5)", mHeight: ((height * 2) / 5) })); // Layer 2

// Animate background
function animate() {
    bgCtx.fillStyle = '#110E19';
    bgCtx.fillRect(0, 0, width, height);
    bgCtx.fillStyle = '#ffffff';
    bgCtx.strokeStyle = '#ffffff';

    var entLen = entities.length;

    while (entLen--) {
        entities[entLen].update();
    }
    requestAnimationFrame(animate);
}
animate();
