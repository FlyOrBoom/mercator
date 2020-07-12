// ==UserScript==
// @name         Mercator
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Google Meet Matrix Rain
// @author       Xing
// @match        https://meet.google.com/*
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';

    class mercatorMediaStream extends MediaStream {
        constructor(old_stream) {
            super(old_stream)

            const camera = document.createElement('canvas');
            const matrix = document.createElement('canvas');
            const comp = document.createElement('canvas');

            const video = document.createElement('video');

            // Matrix rain
            const katakana = `1234567890ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶヷヸヹヺーヽヾヿ`;

            video.setAttribute('playsinline','');
            video.setAttribute('autoplay','');

            document.body.appendChild(video);

            video.style='position:fixed;left:0;top:0;width:50px;height:50px;z-index:9999999;background:black';

            const constraints = {audio: false, video: true};

            video.srcObject = old_stream

            const old_stream_settings = old_stream.getVideoTracks()[0].getSettings()

            const w = old_stream_settings.width
            const h = old_stream_settings.height
            const aspect_ratio = w/h
            const r = w/64
            matrix.width = w*1.5
            matrix.height = h
            comp.width = w
            comp.height = h
            camera.width = w/r
            camera.height = h/r
            const matrix_ctx = matrix.getContext('2d')
            const camera_ctx = camera.getContext('2d')
            const comp_ctx = comp.getContext('2d')
            matrix_ctx.font = r+'px sans-serif'
            camera_ctx.filter = 'brightness(0.8) contrast(2.5)'

            matrix_ctx.fillStyle='#020'
            matrix_ctx.fillRect(0,0,w*1.5,h)
            matrix_ctx.fillStyle = '#8f8'
            matrix_ctx.lineWidth = r/10
            matrix_ctx.strokeStyle = '#080'

            for(let x = 0; x < w*1.5; x+=r*1.5){
                for(let y = 0; y < h; y+=r){
                    const rand_text = katakana[Math.floor(Math.random()*katakana.length)]
                    matrix_ctx.strokeText(rand_text,x,y)
                    matrix_ctx.fillText(rand_text,x,y)
                }
            }
            let rainx = 0
            let rainy = 0
            let rain_text = 0
            comp_ctx.imageSmoothingEnabled = false

            function draw(){

                matrix_ctx.fillStyle = '#020'
                matrix_ctx.fillRect(rainx,rainy,r*1.5,-r)
                matrix_ctx.fillStyle = '#8f8'
                rain_text = katakana[Math.floor(Math.random()*katakana.length)]
                matrix_ctx.strokeText(rain_text,rainx,rainy);
                matrix_ctx.fillText(rain_text,rainx,rainy);
                rainx = Math.floor(Math.random*w/r)*r*1.5
                rainy = Math.floor(Math.random*h/r)*r
                matrix_ctx.strokeStyle = '#0f0'
                matrix_ctx.fillStyle = '#fff'
                matrix_ctx.strokeText(rain_text,rainx,rainy);
                matrix_ctx.fillText(rain_text,rainx,rainy);

                camera_ctx.drawImage(video, 0, 0, w/r, h/r)

                comp_ctx.clearRect(0,0,w,h)
                comp_ctx.globalCompositeOperation = 'source_over'
                comp_ctx.drawImage(camera,0,0,w,h)
                comp_ctx.globalCompositeOperation = 'color'
                comp_ctx.drawImage(matrix,0,0,w,h)
                comp_ctx.globalCompositeOperation = 'multiply'
                comp_ctx.drawImage(matrix,0,0,w,h)

                requestAnimationFrame(draw)
            }
            draw()

            return comp.captureStream(10)
        }
    }

    async function newGetUserMedia(constraints) {
        if (constraints && constraints.video && !constraints.audio) {
            return new mercatorMediaStream(await navigator.mediaDevices.oldGetUserMedia(constraints))
        } else {
            return navigator.mediaDevices.oldGetUserMedia(constraints)
        }
    }
    MediaDevices.prototype.oldGetUserMedia = MediaDevices.prototype.getUserMedia
    MediaDevices.prototype.getUserMedia = newGetUserMedia

})();
