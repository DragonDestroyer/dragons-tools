const { ipcRenderer } = require('electron');
const fs = require('fs');

let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let source = null;
let currentBuffer = null;
let playlist = [];
let currentIndex = -1;
let isPlaying = false;

const nowPlaying = document.getElementById('nowPlaying');
const playlistEl = document.getElementById('playlist');
const playBtn = document.getElementById('play');
const stretch = document.getElementById('stretch');
const pitch = document.getElementById('pitch');
const tune = document.getElementById('tune');
const volume = document.getElementById('volume');

function updateLabels() {
  document.getElementById('stretchLabel').textContent = parseFloat(stretch.value).toFixed(2) + ' ×';
  document.getElementById('pitchLabel').textContent = pitch.value + ' Semi';
  document.getElementById('tuneLabel').textContent = tune.value + ' Cent';
  document.getElementById('volLabel').textContent = volume.value + ' dB';
}

stretch.oninput = pitch.oninput = tune.oninput = volume.oninput = updateLabels;

async function loadFile(path) {
  const arrayBuffer = fs.readFileSync(path);
  currentBuffer = await audioContext.decodeAudioData(arrayBuffer.buffer.slice(arrayBuffer.byteOffset, arrayBuffer.byteOffset + arrayBuffer.byteLength));
  nowPlaying.textContent = path.split(/[\\/]/).pop();
  // Simple visual feedback
  document.getElementById('playhead').style.left = '0%';
}

function playCurrent() {
  if (!currentBuffer) return;
  if (source) source.stop();
  source = audioContext.createBufferSource();
  source.buffer = currentBuffer;
  // Basic rate for stretch (note: this changes pitch too; true stretch needs more advanced processing)
  source.playbackRate.value = parseFloat(stretch.value);
  const gain = audioContext.createGain();
  gain.gain.value = Math.pow(10, volume.value / 20);
  source.connect(gain).connect(audioContext.destination);
  source.start();
  isPlaying = true;
  playBtn.textContent = '⏸';
  source.onended = () => {
    isPlaying = false;
    playBtn.textContent = '▶';
    if (currentIndex < playlist.length - 1) {
      nextTrack();
    }
  };
}

function nextTrack() {
  if (currentIndex < playlist.length - 1) {
    currentIndex++;
    loadFile(playlist[currentIndex]).then(playCurrent);
    updatePlaylistUI();
  }
}

function prevTrack() {
  if (currentIndex > 0) {
    currentIndex--;
    loadFile(playlist[currentIndex]).then(playCurrent);
    updatePlaylistUI();
  }
}

function updatePlaylistUI() {
  playlistEl.innerHTML = playlist.map((p, i) => 
    `<div class="${i === currentIndex ? 'active' : ''}" data-index="${i}">${p.split(/[\\/]/).pop()}</div>`
  ).join('');
  playlistEl.querySelectorAll('div').forEach(el => {
    el.onclick = () => {
      currentIndex = parseInt(el.dataset.index);
      loadFile(playlist[currentIndex]).then(playCurrent);
      updatePlaylistUI();
    };
  });
}

document.getElementById('openFile').onclick = async () => {
  const file = await ipcRenderer.invoke('select-file');
  if (file) {
    playlist = [file];
    currentIndex = 0;
    await loadFile(file);
    updatePlaylistUI();
  }
};

document.getElementById('openFolder').onclick = async () => {
  const files = await ipcRenderer.invoke('select-folder');
  if (files && files.length) {
    playlist = files;
    currentIndex = 0;
    await loadFile(files[0]);
    updatePlaylistUI();
  }
};

playBtn.onclick = () => {
  if (isPlaying) {
    if (source) source.stop();
    isPlaying = false;
    playBtn.textContent = '▶';
  } else {
    playCurrent();
  }
};

document.getElementById('stop').onclick = () => {
  if (source) source.stop();
  isPlaying = false;
  playBtn.textContent = '▶';
};

document.getElementById('next').onclick = nextTrack;
document.getElementById('prev').onclick = prevTrack;

updateLabels();