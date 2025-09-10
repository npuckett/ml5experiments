/*
ML5 Single-Person Body Pose Detection using MoveNet

This script uses the ML5 library to perform real-time body pose detection for a single person using a webcam.
It visualizes the detected keypoints, measures distances and angles between points,
calculates the centroid of all visible points, and draws a bounding box around the detected person.

Key Variables:
- video: Stores the webcam video feed
- bodyPose: ML5 pose detection model
- poses: Array to store detected poses
- boundingBoxes: Array to store bounding box coordinates for each detected pose
- centroid: Object to store the x and y coordinates of the centroid
- confidenceThreshold: Minimum confidence score for a point to be considered visible

Key Functions:
- preload(): Loads the ML5 body pose model
- gotPoses(): Callback function when poses are detected
- showAllPoints(): Visualizes all detected keypoints and the bounding box
- showPoint(): Highlights a specific keypoint with given color and index
- showCentroid(): Highlights the centroid point
- getKeypoint(): Helper function to safely get keypoint data

MoveNet Keypoint Indices:
0: nose
1: left_eye
2: right_eye
3: left_ear
4: right_ear
5: left_shoulder
6: right_shoulder
7: left_elbow
8: right_elbow
9: left_wrist
10: right_wrist
11: left_hip
12: right_hip
13: left_knee
14: right_knee
15: left_ankle
16: right_ankle

Example of using getKeypoint() to access body points:

// Get nose position for the first person
let nose = getKeypoint(0, 0);  // (pointIndex, personIndex)
if (nose) {
    // The nose point was found! You can use its x, y, and confidence values
    circle(nose.x, nose.y, 20);  // Draw a circle at the nose position
}

// Get left shoulder for the first person
let shoulder = getKeypoint(5, 0);
if (shoulder && shoulder.confidence > confidenceThreshold) {
    // The shoulder was found and is visible enough!
    circle(shoulder.x, shoulder.y, 20);
}
*/

// Declare variables for video, pose detection, and data storage
let video;
let bodyPose;
let poses = [];
let boundingBoxes = [];
let centroid = { x: 0, y: 0 };
let confidenceThreshold = 0.2;
let flipVideo = true;
let showVideo = true;


// Preload function to load the ML5 body pose model
function preload() {
        bodyPose = ml5.bodyPose("MoveNet", {
        modelType: "MULTIPOSE_LIGHTNING",
        enableSmoothing: true,
        minPoseScore: 0.25,
        multiPoseMaxDimension: 256,
        enableTracking: true,
        trackerType: "boundingBox",
        flipped: flipVideo
    });
}

// Setup function to initialize the canvas, video, and start pose detection
function setup() {
    createCanvas(640, 480);
    video = createCapture(VIDEO, {flipped: flipVideo});
    video.size(640, 480);
    video.hide();
    bodyPose.detectStart(video, gotPoses);
}

// Main draw loop
function draw() {
    background(255);
    // Display the video feed based on variable
    if(showVideo)
     { 
    image(video, 0, 0, width, height);
     }
    
    
    // Process and display pose data
    showAllPoints();
    showCentroid();
}

// Callback function when poses are detected
function gotPoses(results) {
    poses = results || [];
    
    // Update bounding boxes and centroid
    boundingBoxes = poses.map(pose => pose.box).filter(box => box != null);
    
    // Update centroid position
    if (boundingBoxes[0]) {
        const box = boundingBoxes[0];
        centroid.x = (box.xMin + box.xMax) / 2;
        centroid.y = (box.yMin + box.yMax) / 2;
    } else {
        centroid.x = 0;
        centroid.y = 0;
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

        // Person number label
        text(`Person ${i}`, box.xMin + box.width / 2, box.yMin + 20);
    });

    // Draw all keypoints for each person
    poses.forEach((pose, personIndex) => {
        // Check each possible keypoint (0-16 for MoveNet)
        for (let pointIndex = 0; pointIndex < 17; pointIndex++) {
            const point = getKeypoint(pointIndex, personIndex);
            if (point && point.confidence > confidenceThreshold) {
                point.index = pointIndex;
                showPoint(point, color(0, 255, 0));
            }
        }
        
        // Draw skeleton connections
        drawSkeleton(personIndex);
    });
}

// Function to highlight a specific point with a given color
function showPoint(point, pointColor) {
    if (!isValidPoint(point)) return;

    // Draw point circle
    fill(pointColor);
    noStroke();
    circle(point.x, point.y, 20);
    
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
    let displayText = `(${Math.round(point.x)}, ${Math.round(point.y)})`;
    if (point.name) {
        displayText = `${point.name}\n${displayText}`;
    }
    text(displayText, point.x, point.y + 15);
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
function getKeypoint(pointIndex, personIndex = 0) {
    // Check if we have valid data
    if (!poses || poses.length === 0) return null;
    if (!poses[personIndex]) return null;
    
    // Get the keypoint if it exists
    const keypoints = poses[personIndex].keypoints;
    if (!keypoints) return null;
    
    return keypoints[pointIndex] || null;
}

// Helper function to check if a point has valid coordinates
function isValidPoint(point) {
    return point && 
           typeof point.x === 'number' && 
           typeof point.y === 'number';
}

// Function to draw skeleton connections between keypoints
function drawSkeleton(personIndex) {
    // Define the connections for MoveNet keypoints
    const connections = [
        // Head
        [0, 1],   // nose to left_eye
        [0, 2],   // nose to right_eye
        [1, 3],   // left_eye to left_ear
        [2, 4],   // right_eye to right_ear
        
        // Torso
        [5, 6],   // left_shoulder to right_shoulder
        [5, 11],  // left_shoulder to left_hip
        [6, 12],  // right_shoulder to right_hip
        [11, 12], // left_hip to right_hip
        
        // Left arm
        [5, 7],   // left_shoulder to left_elbow
        [7, 9],   // left_elbow to left_wrist
        
        // Right arm
        [6, 8],   // right_shoulder to right_elbow
        [8, 10],  // right_elbow to right_wrist
        
        // Left leg
        [11, 13], // left_hip to left_knee
        [13, 15], // left_knee to left_ankle
        
        // Right leg
        [12, 14], // right_hip to right_knee
        [14, 16]  // right_knee to right_ankle
    ];
    
    // Draw each connection
    stroke(0, 255, 0); // Green lines
    strokeWeight(3);
    noFill();
    
    connections.forEach(([startIdx, endIdx]) => {
        const startPoint = getKeypoint(startIdx, personIndex);
        const endPoint = getKeypoint(endIdx, personIndex);
        
        if (startPoint && endPoint && 
            startPoint.confidence > confidenceThreshold && 
            endPoint.confidence > confidenceThreshold) {
            line(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
        }
    });
}

function keyPressed() {
    if (key === 's' || key === 'S') {
        showVideo = !showVideo;
    }
}
function keyPressed() {
  if (key === ' ') {
    showVideo = !showVideo;
  }
}