/*
ML5 Hand Pose Detection and Analysis

This script uses the ML5 library to perform real-time hand pose detection using a webcam.
It visualizes the detected keypoints, measures distances and angles between points,
calculates the centroid of all visible points, and draws a bounding box around the detected hands.
Can measure between points on the same or different hands.

Key Variables:
- video: Stores the webcam video feed
- handPose: ML5 hand detection model
- hands: Array to store detected hands
- boundingBoxes: Array to store bounding box coordinates for each detected hand
- centroid: Object to store the x and y coordinates of the centroid
- confidenceThreshold: Minimum confidence score for a point to be considered visible
- handNumberIndex1: Index of first hand to measure from (0 or 1)
- handPointIndex1: Keypoint index on first hand
- handNumberIndex2: Index of second hand to measure to (0 or 1)
- handPointIndex2: Keypoint index on second hand

Key Functions:
- preload(): Loads the ML5 hand pose model
- gotHands(): Callback function when hands are detected
- showAllPoints(): Visualizes all detected keypoints and the bounding box
- showPoint(): Highlights a specific keypoint with given color and index
- showCentroid(): Highlights the centroid point
- getKeypoint(): Helper function to safely get keypoint data
- measureDistance(point1, point2): Calculates and shows distance between two points in pixels
- measureAngle(basePoint, endPoint): Calculates and shows angle from horizontal in degrees

HandPose Keypoint Indices:
    0: "WRIST",
    1: "THUMB_CMC",
    2: "THUMB_MCP", 
    3: "THUMB_IP",
    4: "THUMB_TIP",
    5: "INDEX_FINGER_MCP",
    6: "INDEX_FINGER_PIP",
    7: "INDEX_FINGER_DIP",
    8: "INDEX_FINGER_TIP",
    9: "MIDDLE_FINGER_MCP",
    10: "MIDDLE_FINGER_PIP",
    11: "MIDDLE_FINGER_DIP",
    12: "MIDDLE_FINGER_TIP",
    13: "RING_FINGER_MCP",
    14: "RING_FINGER_PIP",
    15: "RING_FINGER_DIP",
    16: "RING_FINGER_TIP",
    17: "PINKY_MCP",
    18: "PINKY_PIP",
    19: "PINKY_DIP",
    20: "PINKY_TIP"
*/

// Declare variables for video, hand detection, and data storage
let video;
let handPose;
let hands = [];
let boundingBoxes = [];
let centroid = { x: 0, y: 0 };
let confidenceThreshold = 0.5;
let flipVideo = true;
let showVideo = true;

// Variables for point selection
let handNumberIndex1 = 0;  // First hand index (0 or 1)
let handPointIndex1 = 4;   // Default to thumb tip
let handNumberIndex2 = 0;  // Second hand index (0 or 1)
let handPointIndex2 = 8;   // Default to index tip

let maxHands = 4;

// Preload function to load the ML5 hand pose model
function preload() {
    handPose = ml5.handPose({maxHands: maxHands, flipped: flipVideo});
}

// Setup function to initialize the canvas, video, and start hand detection
function setup() {
    createCanvas(640, 480);
    video = createCapture(VIDEO, {flipped: flipVideo});
    video.size(640, 480);
    video.hide();
    handPose.detectStart(video, gotHands);
}

function draw() {
    background(255);
    // Display the video feed based on variable
    if(showVideo) { 
        image(video, 0, 0, width, height);
    }
    
    // Process and display hand data
    showAllPoints();
}

// Callback function when hands are detected
function gotHands(results) {
    hands = results;
    
    // Calculate bounding boxes for each hand
    boundingBoxes = hands.map(hand => {
        if (!hand.keypoints || hand.keypoints.length === 0) return null;
        
        // Find min/max coordinates
        let xCoords = hand.keypoints.map(p => p.x);
        let yCoords = hand.keypoints.map(p => p.y);
        let xMin = Math.min(...xCoords);
        let xMax = Math.max(...xCoords);
        let yMin = Math.min(...yCoords);
        let yMax = Math.max(...yCoords);
        
        return {
            xMin: xMin,
            xMax: xMax,
            yMin: yMin,
            yMax: yMax,
            width: xMax - xMin,
            height: yMax - yMin
        };
    }).filter(box => box != null);
    
    // Update centroid position for first hand
    if (boundingBoxes[0]) {
        const box = boundingBoxes[0];
        centroid.x = (box.xMin + box.xMax) / 2;
        centroid.y = (box.yMin + box.yMax) / 2;
    }
}

// Function to visualize all detected keypoints and bounding box
function showAllPoints() {
    // Draw bounding boxes
    boundingBoxes.forEach((box, i) => {
        if (!box) return;

        // Draw box outline
        noFill();
        stroke(0, 255, 0);
        strokeWeight(2);
        rect(box.xMin, box.yMin, box.width, box.height);
        
        // Draw box dimensions
        fill(0, 255, 0);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(12);
        
        // Width label
        text(`Width: ${Math.round(box.width)}px`, 
             box.xMin + box.width / 2, box.yMin - 10);
        
        // Height label
        push();
        translate(box.xMin - 10, box.yMin + box.height / 2);
        rotate(-PI/2);
        text(`Height: ${Math.round(box.height)}px`, 0, 0);
        pop();

        // Hand number label
        text(`Hand ${i}`, box.xMin + box.width / 2, box.yMin + 20);
    });

    // Draw all keypoints for each hand
    hands.forEach((hand, handIndex) => {
        if (!hand.keypoints) return;
        
        hand.keypoints.forEach((point, index) => {
            point.index = index;  // Add index for reference
            showPoint(point, color(0, 255, 0));
        });
    });
    
    // Show centroid
    // showCentroid();
}

// Function to highlight a specific point with a given color
function showPoint(point, pointColor) {
    if (!isValidPoint(point)) return;

    // Draw point circle
    fill(pointColor);
    noStroke();
    circle(point.x, point.y, 10);
    
    // Draw point index number
    if (point.index != null) {
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(10);
        text(point.index, point.x, point.y);
    }
    
    // Draw point coordinates
    fill(255, 255, 0);
    textAlign(CENTER, TOP);
    textSize(8);
    text(`(${Math.round(point.x)}, ${Math.round(point.y)})`, 
         point.x, point.y + 10);
}

// Function to highlight the centroid point
function showCentroid() {
    if (!isValidPoint(centroid)) return;

    // Draw centroid circle
    fill(255, 0, 0);
    noStroke();
    circle(centroid.x, centroid.y, 15);
    
    // Draw 'C' label
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(10);
    text('C', centroid.x, centroid.y);
    
    // Draw centroid coordinates
    fill(255, 255, 0);
    textAlign(CENTER, TOP);
    textSize(8);
    text(`Centroid: (${Math.round(centroid.x)}, ${Math.round(centroid.y)})`, 
         centroid.x, centroid.y + 15);
}

// Helper function to safely get keypoint data
function getKeypoint(pointIndex, handIndex = 0) {
    // Check if we have valid data
    if (!hands || hands.length === 0) return null;
    if (!hands[handIndex] || !hands[handIndex].keypoints) return null;
    
    return hands[handIndex].keypoints[pointIndex] || null;
}

// Helper function to check if a point has valid coordinates
function isValidPoint(point) {
    return point && 
           typeof point.x === 'number' && 
           typeof point.y === 'number';
}

// Function to measure and visualize distance between two points
function measureDistance(point1, point2) {
    if (!point1 || !point2) return null;
    
    // Calculate distance
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Draw line between points
    stroke(255, 165, 0); // Orange
    strokeWeight(2);
    line(point1.x, point1.y, point2.x, point2.y);
    
    // Show distance text at midpoint
    const midX = (point1.x + point2.x) / 2;
    const midY = (point1.y + point2.y) / 2;
    noStroke();
    fill(255, 165, 0);
    textSize(12);
    text(`${Math.round(distance)}px`, midX, midY);

    return distance;
}

// Function to measure and visualize angle between two points
function measureAngle(basePoint, endPoint) {
    if (!basePoint || !endPoint) return null;
    
    // Calculate angle
    const dx = endPoint.x - basePoint.x;
    const dy = endPoint.y - basePoint.y;
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    if (angle < 0) angle += 360;
    
    // Draw angle arc
    noFill();
    stroke(255, 165, 0);
    const arcRadius = 30;
    arc(basePoint.x, basePoint.y, arcRadius*2, arcRadius*2, 0, angle * PI/180);
    
    // Draw small line at 0 degrees for reference
    stroke(255, 165, 0, 127); // Semi-transparent orange
    line(basePoint.x, basePoint.y, basePoint.x + arcRadius, basePoint.y);
    
    // Show angle text near base point
    noStroke();
    fill(255, 165, 0);
    textSize(12);
    text(`${Math.round(angle)}°`, basePoint.x + arcRadius + 5, basePoint.y);

    return angle;
}

function keyPressed() 
{
    // Toggle video with 's' key
    if (key === 's' || key === 'S') {
        showVideo = !showVideo;
    }
    
    // Save canvas as PNG with 'p' key
    if (key === 'p' || key === 'P') {
        let timestamp = year() + nf(month(), 2) + nf(day(), 2) + '_' + nf(hour(), 2) + nf(minute(), 2) + nf(second(), 2);
        saveCanvas('pose_' + timestamp, 'png');
    }
}