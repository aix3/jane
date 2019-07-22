var debug = false;

var config = {
    putPixel: false,
    interval: 100,
    stepSize: 128,
    finalPixelSize: 16,
    img: 'images/1.jpeg'
}

function log() {
    if (!debug) {
        return;
    }
    const args = new Array(arguments.length);
    for (let i = 0; i < args.length; ++i) {
        args[i] = arguments[i];
    }
    console.log(args.join(' '));
}

function drawLine(x, y, w, h, src, dst, table, context) {
    if (x > w) {
        window.setTimeout(drawNextLine, context.interval, 0, y + context.stepSize, w, h, src, dst, table, context);
    } else {
        var half = context.stepSize / 2;
        // log('x=', x, 'y=', y, 'table.length', table.length)
        // log('x/stepSize=', x / stepSize, 'y/stepSize=', y / stepSize, 'TBX.length-1=', table.length - 1, 'TBY.length-1=', Math.min(table[Math.min(table.length - 1, x / stepSize)].length - 1))
        var xx = Math.min(table.length - 1, x / context.stepSize);
        var yy = Math.min(table[xx].length - 1, y / context.stepSize);
        var trueX = table[xx][yy][0];
        var trueY = table[xx][yy][1];
        animationDraw(src, dst, trueX, trueY, 2, context);
        window.setTimeout(drawLine, context.interval, x + context.stepSize, y, w, h, src, dst, table, context);
    }
}

function animationDraw(src, dst, x, y, size, context) {
    var half = (size) / 2;
    var shalf = context.stepSize / 2;

    // log(pixel);
    var pixel = src.getImageData(x + shalf, y + shalf, size, size);
    // log("stepSize=",context.stepSize, "size=", size, "x + shalf - half=",x + shalf - half, "y + shalf - half=",y + shalf - half)
    var data = pixel.data;
    var rgba = 'rgba(' + data[0] + ',' + data[1] + ',' + data[2] + ',' + (data[3] / 255) + ')';
    dst.fillStyle = rgba;

    if (context.putPixel) {
        dst.putImageData(pixel, x + shalf - half, y + shalf - half);
    } else {
        dst.fillRect(x + context.stepSize / 2 - half, y + context.stepSize / 2 - half, size, size);
    }

    if ((size + 2) <= context.stepSize) {
        window.requestAnimationFrame(function () {
            animationDraw(src, dst, x, y, size + 2, context);
        });
    }
}

function drawNextLine(x, y, w, h, src, dst, table, context) {
    context = Object.assign({}, context)
    if (y <= h) {
        window.setTimeout(drawLine, context.interval, 0, y, w, h, src, dst, table, context);
    } else {
        window.setTimeout(drawNextBox, 0, x, y, w, h, src, dst, table, context);
    }
}

function drawNextBox(x, y, w, h, src, dst, table, context) {
    if (context.stepSize > context.finalPixelSize) {
        log('y=====', y, h, context.stepSize)
        context.stepSize = context.stepSize / 2;
        context.interval = context.interval / 2;
        log(context.interval, 'interval')
        table = shuffleTable(context.stepSize, w, h);

        window.setTimeout(drawLine, context.interval, 0, 0, w, h, src, dst, table, context);
    }
}

function draw() {
    var img = new Image();
    img.src = config.img;

    img.onload = function () {
        var sw = document.body.scrollWidth;//window.screen.width;
        var sh = document.body.scrollHeight;//window.screen.height;
        log('sw=', sw, 'sh=', sh)

        var nw = img.naturalWidth;
        var nh = img.naturalHeight;
        log('nw=', nw, 'nh=', nh)

        var w = sw - (sw % 2);
        var h = sh - (sh % 2);

        var srcCvs = document.createElement('canvas');
        srcCvs.width = w;
        srcCvs.height = h;

        var src = srcCvs.getContext('2d');

        var scaleS = sw / sh;
        var scaleN = nw / nh;

        var ww, hh, sx, sy;
        if (scaleS > scaleN) {
            hh = Math.ceil(nw / scaleS);
            ww = nw;
            sx = 0;
            sy = (nh - hh) / 2;
        } else {
            ww = Math.ceil(nh * scaleS);
            hh = nh;
            sx = (nw - ww) / 2;
            sy = 0;
        }
        log(scaleS, 'scale')
        log(ww, hh, 'ww, hh')

        src.drawImage(img, sx, sy, ww, hh, 0, 0, w, h);

        img.style.display = 'none';
        log(img.naturalWidth, img.naturalHeight)
        log(img.width, img.height)

        var boxCvs = document.getElementById('canvas');
        boxCvs.width = w;
        boxCvs.height = h;
        config.cvs = boxCvs;

        var dst = boxCvs.getContext('2d');
        var table = shuffleTable(config.stepSize, w, h);
        window.setTimeout(drawLine, config.interval, 0, 0, w, h, src, dst, table, config);
    }
};

function shuffleTable(stepSize, w, h) {
    var table = new Array();
    for (var i = 0; i < w; i += stepSize) {
        var tbi = new Array();
        for (var j = 0; j < h; j += stepSize) {
            tbi.push([i, j]);
        }
        tbi.sort(function () { return 0.5 - Math.random() })
        table.push(tbi);
    }
    table.sort(function () { return 0.5 - Math.random() })
    return table;
}

window.requestAnimationFrame(draw);