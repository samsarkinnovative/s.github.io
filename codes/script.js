// script.js

document.getElementById('generateBtn').addEventListener('click', generateVideo);

function generateVideo() {
    const images = document.getElementById('uploadImages').files;
    const audioFile = document.getElementById('uploadAudio').files[0];
    const textFile = document.getElementById('uploadText').files[0];

    if (!images.length || !audioFile || !textFile) {
        alert("Please upload all files: images, audio, and text.");
        return;
    }

    // Read text content from uploaded text file
    const reader = new FileReader();
    reader.onload = function(event) {
        const textContent = event.target.result;
        console.log("Text content:", textContent);
        processFiles(images, audioFile, textContent);
    };
    reader.readAsText(textFile);
}

function processFiles(images, audioFile, textContent) {
    // Create video element
    const videoElement = document.getElementById('outputVideo');

    // Create canvas for image frames
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 640;
    canvas.height = 480;

    let currentImageIndex = 0;

    function drawImage() {
        const img = new Image();
        img.src = URL.createObjectURL(images[currentImageIndex]);

        img.onload = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const dataUrl = canvas.toDataURL('image/jpeg');
            const videoBlob = dataURItoBlob(dataUrl);
            
            videoElement.src = URL.createObjectURL(videoBlob);
        };

        currentImageIndex = (currentImageIndex + 1) % images.length;
    }

    setInterval(drawImage, 2000); // Change image every 2 seconds

    // Handle audio
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioSource = audioContext.createBufferSource();
    const reader = new FileReader();
    reader.onload = function(event) {
        audioContext.decodeAudioData(event.target.result, function(buffer) {
            audioSource.buffer = buffer;
            audioSource.connect(audioContext.destination);
            audioSource.start(0);
        });
    };
    reader.readAsArrayBuffer(audioFile);
}

// Utility function to convert data URL to Blob
function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const buffer = new ArrayBuffer(byteString.length);
    const data = new Uint8Array(buffer);

    for (let i = 0; i < byteString.length; i++) {
        data[i] = byteString.charCodeAt(i);
    }

    return new Blob([buffer], { type: mimeString });
}
