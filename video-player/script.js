'use strict';

const scenario = document.getElementById('scenario');
const container = document.getElementById('container');
let scenes;

function app() {
    try {
        // select previous and next HTML elements
        const prevButton = document.querySelector('.btn-prev');
        const nextButton = document.querySelector('.btn-next');
        // current scene counter
        let currentScene = 0;
        function stopVideo(player) {
            player.pause();
        }
        function playVideo(player) {
            player.play();
            player.addEventListener('ended', backScenario, false);
        }
        function move(currentScene) {
            const container = document.querySelector(".container");
            const list = Array.from(container.children);
            const item = list[0];
            const scrollAmount = item.offsetWidth * currentScene;
            container.style.transition = "all 300ms";
            container.style.transform = `translateX(${-scrollAmount}px)`;
        }
        function nextScene() {
            scenes[currentScene].children.item(0).classList.remove('border-6');
            // check if current scene is the last and reset current scene
            if (currentScene === (scenes.length - 1)) {
                currentScene = 0;
            } else {
                currentScene++;
            }
            move(currentScene);
            scenes[currentScene].children.item(0).classList.add('border-6');
        };
        function prevScene() {
            scenes[currentScene].children.item(0).classList.remove('border-6');
            // check if current scene is the first and reset current scene to last
            if (currentScene === 0) {
                currentScene = scenes.length - 1;
            } else {
                currentScene--;
            }
            move(currentScene);

            scenes[currentScene].children.item(0).classList.add('border-6');
        };
        function fullScene() {
            const video = document.querySelector('.border-6');
            const playerWrapper = document.querySelector('#playerWrapper');
            const player = playerWrapper.children.item(0);
            if (video) {
                player.src = video.src;
                playerWrapper.className = 'full-scene';
                prevButton.classList.add('hide');
                nextButton.classList.add('hide');
                playVideo(player);
            }
        };
        function backScenario() {
            const player = document.querySelector('#player');
            const playerWrapper = document.querySelector('#playerWrapper');

            if (player) {
                playerWrapper.className = 'hide-player';
                prevButton.classList.remove('hide');
                nextButton.classList.remove('hide');
                stopVideo(player);
            }
        }
        document.addEventListener('keydown', (event) => {
            const code = event.keyCode;
            switch (code) {
                case 39:
                    nextScene();
                    break;
                case 37:
                    prevScene();
                    break;
                case 13:
                    fullScene();
                    break;
                case 8:
                    backScenario();
                    break;
                default:
                // do nothing
            }
        }, false);
    } catch (error) {
        console.log("An error occurred: ", error)
    }
}

const setSizes = (isFirstElement) => {
    scenes = Array.from(container.children);
    let width;
    let itemWidth;
    if (isFirstElement) {
        width = 63 * scenes.length;
        itemWidth = 63 * (scenario.offsetWidth / container.offsetWidth);
    } else {
        width = 45 * scenes.length;
        itemWidth = 45 * (scenario.offsetWidth / container.offsetWidth);
    }

    container.style.width = `${width}%`;
    scenes.forEach((scene) => {
        scene.style.width = `${itemWidth}%`;
    });
};

function getJSON(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function () {
        const status = xhr.status;
        if (status === 200) {
            callback(null, xhr.response);
        } else {
            callback(status, xhr.response);
        }
    };
    xhr.send();
};

function loadStreams(streams) {
    let isFirstElement = true;
    streams.forEach((stream, index) => {
        if (stream.name && stream.mediaFile) {
            let scene = document.createElement('li');
            scene.classList.add('scene');
            let video = document.createElement('video');
            video.name = stream.name;
            video.src = stream.mediaFile;
            video.oncanplay = (event) => {
                if (isFirstElement) {
                    video.classList.add('border-6');
                }
                scene.appendChild(video);
                container.appendChild(scene);
                setSizes(isFirstElement);
                isFirstElement = false;
            };
        } else {
            console.log("The items received are not enough, a 'name' and 'mediaFile' are expected.");
        }
    });
    scenario.appendChild(container);
}

getJSON('https://cdn-media.brightline.tv/training/demo.json',
    function (err, data) {
        if (err !== null) {
            alert('Something went wrong while parsing the JSON feed.\nError code: ' + err);
        } else {
            loadStreams(data.streams);
            app();
        }
    });