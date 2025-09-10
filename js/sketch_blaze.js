/*
ML5 Multi-Person Body Pose Detection using BlazePose

This script uses the ML5 library to perform real-time body pose detection for multiple people using a webcam with BlazePose.
It focuses on tracking as many people as possible, showing only bounding boxes with x,y coordinates.
Note: BlazePose is optimized for single-person detection, but can handle multiple with detection.

Key Variables:
- video: Stores the webcam video feed
- bodyPose: ML5 pose detection model
- poses: Array to store detected poses
- confidenceThreshold: Minimum confidence score for a pose to be considered

Key Functions:
- preload(): Loads the ML5 body pose model with BlazePose
- gotPoses(): Callback function when poses are detected
- drawBoxes(): Draws bounding boxes and coordinates for each detected person
*/

// Declare variables for video, pose detection, and data storage
let video;
let bodyPose;
let poses = [];
let confidenceThreshold = 0.2;
let flipVideo = true;
let showVideo = true;

// Preload function to load the ML5 body pose model
function preload() {
    bodyPose = ml5.bodyPose("BlazePose", {
        modelType: "full",
        enableSmoothing: true,
        minPoseScore: 0.25,
        flipped: flipVideo
    });
}

// Setup function to initialize the canvas, video, and start pose detection
function setup() {
    createCanvas(640, 480);
    video = createCapture(VIDEO);
    video.size(640, 480);
    video.hide();
    if (flipVideo) {
        video.style('transform', 'scaleX(-1)');
    }
    bodyPose.detectStart(video, gotPoses);
}

// Main draw loop
function draw() {
    background(255);
    // Display the video feed based on variable
    if (showVideo) {
        image(video, 0, 0, width, height);
    }

    // Draw bounding boxes and coordinates
    drawBoxes();
}

// Callback function when poses are detected
function gotPoses(results) {
    poses = results || [];
}

// Function to draw bounding boxes and coordinates for each person
function drawBoxes() {
    poses.forEach((pose, index) => {
        if (!pose.box) return;

        const box = pose.box;
        const centerX = (box.xMin + box.xMax) / 2;
        const centerY = (box.yMin + box.yMax) / 2;

        // Draw box outline
        noFill();
        stroke(0, 255, 0);
        strokeWeight(5);
        rect(box.xMin, box.yMin, box.width, box.height);

        // Draw coordinates in the middle of the box
        fill(0, 255, 0);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(20);
        text(`(${Math.round(centerX)}, ${Math.round(centerY)})`,
             box.xMin + box.width / 2, box.yMin + box.height / 2);
    });
}

function keyPressed() {
    if (key === ' ') {
        showVideo = !showVideo;
    }
}
