(function () {
    // Polyfill for requestAnimationFrame
    var requestAnimationFrame = window.requestAnimationFrame 
        || window.mozRequestAnimationFrame 
        || window.webkitRequestAnimationFrame 
        || window.msRequestAnimationFrame 
        || function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    window.requestAnimationFrame = requestAnimationFrame;
})();

// ============================================================
// Main Initialization Function
// ============================================================
function initializeBackgroundAnimation() {

    // ============================================================
    // Global canvas, context, and sizing
    // ============================================================
    var background = document.getElementById("bg-canvas"),
        bgCtx = background.getContext("2d"),
        width = window.innerWidth,
        height = document.body.offsetHeight;

    (height < 400) ? height = 400 : height;

    background.width = width;
    background.height = height;

    // ============================================================
    // Helper function to find how low the dropdown sits
    // ============================================================
    function calculateDropdownBottom() {
        var dropdownItems = document.querySelectorAll(".menu li");
        if (dropdownItems.length === 0) {
            return height;
        }
        var lastItem = dropdownItems[dropdownItems.length - 1];
        var rect = lastItem.getBoundingClientRect();
        return rect.bottom + window.scrollY;
    }

    // ============================================================
    // Terrain Constructor
    // ============================================================
    function Terrain(options) {
        options = options || {};

        // We'll store the current width/height in the terrain instance.
        this.width = width;
        this.height = height;

        this.terrain = document.createElement("canvas");
        this.terCtx = this.terrain.getContext("2d");
        this.scrollDelay = options.scrollDelay || 90;
        this.lastScroll = new Date().getTime();
        this.fillStyle = options.fillStyle || "#000000";
        this.displacement = options.displacement || 140;

        // Set initial canvas size
        this.terrain.width = this.width;
        this.terrain.height = this.height;

        // Calculate maxHeight and mHeight
        this.maxHeight = Math.max(this.height * 2 / 5, calculateDropdownBottom() - 10);
        this.mHeight = Math.min(options.mHeight || this.height, this.maxHeight);

        // Initialize the points array
        this.points = [];

        // Generate the terrain
        this.generatePoints();

        // Append the new canvas to the DOM
        document.body.appendChild(this.terrain);
    }

    // ------------------------------------------------------------
    // Generate the terrain points (midpoint displacement)
    // ------------------------------------------------------------
    Terrain.prototype.generatePoints = function() {
        // Clear out any old points
        this.points.length = 0;

        // Power-of-2 length
        var power = Math.pow(2, Math.ceil(Math.log(this.width) / Math.log(2)));

        // Start & end at mHeight
        this.points[0] = this.mHeight;
        this.points[power] = this.points[0];

        // Local displacement so we don't override this.displacement
        var d = this.displacement;

        // Recursively generate intermediate points
        for (var i = 1; i < power; i *= 2) {
            for (var j = (power / i) / 2; j < power; j += power / i) {
                this.points[j] = (
                    (this.points[j - (power / i) / 2] + this.points[j + (power / i) / 2]) / 2
                ) + Math.floor(Math.random() * -d + d);
            }
            d *= 0.6; 
        }
    };

    // ------------------------------------------------------------
    // Update/draw terrain each frame
    // ------------------------------------------------------------
    Terrain.prototype.update = function () {
        this.terCtx.clearRect(0, 0, this.width, this.height);
        this.terCtx.fillStyle = this.fillStyle;

        // Scroll effect
        if (new Date().getTime() > this.lastScroll + this.scrollDelay) {
            this.lastScroll = new Date().getTime();
            // Shift the points to "scroll" terrain
            this.points.push(this.points.shift());
        }

        // Draw the polygon
        this.terCtx.beginPath();
        for (var i = 0; i <= this.width; i++) {
            if (i === 0) {
                this.terCtx.moveTo(0, this.points[0]);
            } else if (this.points[i] !== undefined) {
                this.terCtx.lineTo(i, this.points[i]);
            }
        }
        this.terCtx.lineTo(this.width, this.height);
        this.terCtx.lineTo(0, this.height);
        this.terCtx.lineTo(0, this.points[0]);
        this.terCtx.fill();
    };

    // ============================================================
    // Star constructor
    // ============================================================
    const DEFAULT_INITIAL_STAR_SIZE = 3;
    function Star(options) {
        this.size = Math.random() * DEFAULT_INITIAL_STAR_SIZE;
        this.speed = Math.random() * 0.05;
        this.x = options.x;
        this.y = options.y;
    }

    Star.prototype.reset = function () {
        this.size = Math.random() * 2;
        this.speed = Math.random() * 0.05;
        this.x = width;
        this.y = Math.random() * height;
    };

    Star.prototype.update = function () {
        this.x -= this.speed;
        if (this.x < 0) {
            this.reset();
        } else {
            bgCtx.fillRect(this.x, this.y, this.size, this.size);
        }
    };

    // ============================================================
    // Shooting Star constructor
    // ============================================================
    const DEFAULT_MIN_ANGLE = 100;
    const DEFAULT_MAX_ANGLE = 160;
    const RANDOM_LENGTH_MIN = 10;
    const RANDOM_LENGTH_MAX = 80;
    const SPEED_MIN = 6;
    const SPEED_MAX = 14;
    const SIZE_MIN = 0.1;
    const SIZE_MAX = 1;
    const WAIT_TIME_MIN = 1000;
    const WAIT_TIME_MAX = 5000;

    function ShootingStar() {
        this.minAngle = DEFAULT_MIN_ANGLE;
        this.maxAngle = DEFAULT_MAX_ANGLE;

        const angleInRadians = (
            Math.random() * (this.maxAngle - this.minAngle) + this.minAngle
        ) * (Math.PI / 180);

        this.direction = { 
            x: Math.cos(angleInRadians),
            y: Math.sin(angleInRadians)
        };
        this.reset();
    }

    ShootingStar.prototype.reset = function () {
        this.x = Math.random() * width;
        this.y = 0;
        this.len = (Math.random() * RANDOM_LENGTH_MAX) + RANDOM_LENGTH_MIN;
        this.speed = (Math.random() * SPEED_MAX) + SPEED_MIN;
        this.size = (Math.random() * SIZE_MAX) + SIZE_MIN;
        this.waitTime = new Date().getTime() + (Math.random() * WAIT_TIME_MAX) + WAIT_TIME_MIN;
        this.active = false;
    };

    ShootingStar.prototype.update = function () {
        if (this.active) {
            this.x += this.direction.x * this.speed;
            this.y += this.direction.y * this.speed;

            if (this.x < 0 || this.x > width || this.y > height) {
                this.reset();
            } else {
                bgCtx.lineWidth = this.size;
                bgCtx.strokeStyle = "#ffffff";
                bgCtx.beginPath();
                bgCtx.moveTo(this.x, this.y);
                bgCtx.lineTo(
                    this.x - this.len * this.direction.x,
                    this.y - this.len * this.direction.y
                );
                bgCtx.stroke();
            }
        } else {
            // Activate star
            if (this.waitTime < new Date().getTime()) {
                this.active = true;
            }
        }
    };

    // ============================================================
    // Initialize all entities
    // ============================================================
    var entities = [];

    // Add stars
    function createStars() {
        // We'll do a simple approach: create "height" # of stars
        // so the star field feels "dense" at large heights.
        for (var i = 0; i < height; i++) {
            entities.push(new Star({
                x: Math.random() * width,
                y: Math.random() * height
            }));
        }
    }
    // Actually call createStars at the start
    createStars();

    // Add shooting stars
    const AMOUNT_OF_SHOOTING_STARS = 7;
    for (var i = 0; i < AMOUNT_OF_SHOOTING_STARS; i++) {
        entities.push(new ShootingStar());
    }

    const TERRAIN_ONE = "#433D8B";
    const TERRAIN_TWO = "#17153B";
    const TERRAIN_THREE = "#2E236C";

    // Add terrain layers
    entities.push(new Terrain({ fillStyle: TERRAIN_ONE, mHeight: (height * 2) / 5 }));
    entities.push(new Terrain({ displacement: 200, scrollDelay: 50, fillStyle: TERRAIN_TWO, mHeight: (height * 2) / 5 }));
    entities.push(new Terrain({ displacement: 250, scrollDelay: 20, fillStyle: TERRAIN_THREE, mHeight: (height * 2) / 5 }));

    // ============================================================
    // Animation loop
    // ============================================================
    function animate() {
        bgCtx.fillStyle = '#110E19'; // Sky color
        bgCtx.fillRect(0, 0, width, height);
        bgCtx.fillStyle = '#ffffff'; // Star colors
        bgCtx.strokeStyle = '#ffffff';

        var entLen = entities.length;
        while (entLen--) {
            entities[entLen].update();
        }
        requestAnimationFrame(animate);
    }
    animate();

    // ============================================================
    // Resize listener
    // ============================================================
    window.addEventListener('resize', function() {
        // 1) Update global width/height
        width = window.innerWidth;
        height = document.body.offsetHeight;
        (height < 400) ? height = 400 : height;

        // 2) Resize main bg-canvas
        background.width = width;
        background.height = height;
        bgCtx.fillStyle = '#110E19';
        bgCtx.fillRect(0, 0, width, height);

        // 3) Remove old stars from the array, re-add new ones
        entities = entities.filter(e => !(e instanceof Star));
        createStars();

        // 4) Resize terrain canvases in place
        entities.forEach(entity => {
            if (entity instanceof Terrain) {
                entity.width = width;
                entity.height = height;
                entity.terrain.width = width;
                entity.terrain.height = height;

                entity.maxHeight = Math.max(height * 2 / 5, calculateDropdownBottom() - 10);
                entity.mHeight = Math.min(entity.mHeight, entity.maxHeight);
                entity.generatePoints();
            }
        });
    });
}

// ============================================================
// Deferred Execution
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
    initializeBackgroundAnimation();

    // jQuery logic for smooth scrolling
    $('a[href^="#"]').on('click', function (event) {
        var target = $($(this).attr('href'));
        if (target.length) {
            event.preventDefault();
            $('html, body').animate({
                scrollTop: target.offset().top
            }, 1000); // Adjust speed (in ms) as needed
        }
    });
});


