/*
ML5 Face Mesh Detection and Tracking

This script uses the ML5 library to perform real-time face detection and landmark tracking using a webcam.
It visualizes all detected keypoints with coordinates, and draws bounding boxes around faces.
Optimized for tracking multiple faces.

Key Variables:
- video: Stores the webcam video feed
- faceMesh: ML5 face mesh detection model
- faces: Array to store detected faces
- options: Configuration for max faces, refinement, and flipping

Key Functions:
- preload(): Loads the ML5 face mesh model
- gotFaces(): Callback function when faces are detected
- drawFaces(): Draws bounding boxes and keypoints with coordinates
- showPoint(): Highlights a specific keypoint with coordinates
*/

let faceMesh;
let video;
let faces = [];
let options = { maxFaces: 4, refineLandmarks: true, flipHorizontal: true };
let flipVideo = true;
let showVideo = true;

function preload() {
  // Load the faceMesh model
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  createCanvas(640, 480);
  // Create the webcam video and hide it
  video = createCapture(VIDEO, {flipped: flipVideo});
  video.size(640, 480);
  video.hide();

  // Start detecting faces from the webcam video
  faceMesh.detectStart(video, gotFaces);
}

function draw() {
  background(255);
  // Draw the webcam video
  if (showVideo) {
    image(video, 0, 0, width, height);
  }

  // Draw all faces with keypoints and coordinates
  drawFaces();
}

// Callback function for when faceMesh outputs data
function gotFaces(results) {
  // Save the output to the faces variable
  faces = results;
}

// Function to draw bounding boxes and keypoints for each face
function drawFaces() {
  faces.forEach((face, index) => {
    // Draw bounding box if available
    if (face.box) {
      const box = face.box;
      noFill();
      stroke(0, 255, 0);
      strokeWeight(2);
      rect(box.xMin, box.yMin, box.width, box.height);

      // Draw face number
      fill(0, 255, 0);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(12);
      text(`Face ${index}`, box.xMin + box.width / 2, box.yMin - 10);
    }

    // Draw all keypoints
    if (face.keypoints) {
      face.keypoints.forEach((keypoint, i) => {
        keypoint.index = i;
        showPoint(keypoint, color(0, 255, 0));
      });
    }
  });
}

// Function to highlight a specific point with coordinates
function showPoint(point, pointColor) {
  if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') return;

  // Draw point circle
  fill(pointColor);
  noStroke();
  circle(point.x, point.y, 5);

  // Draw point coordinates
  fill(255, 255, 0);
  textAlign(CENTER, TOP);
  textSize(8);
  text(`(${Math.round(point.x)}, ${Math.round(point.y)})`, point.x, point.y + 5);
}

function keyPressed() {
    if (key === 's' || key === 'S') {
        showVideo = !showVideo;
    }
}