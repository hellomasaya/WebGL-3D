var sound1 =0;
// wallTexture;
main();

//
// Start here
//
function main() {
  sub = document.getElementById("music");
  // if(sound1==0)
  // sub.play(); 
  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

  // Fragment shader program

  const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

  const vsSourceTexture = `
  attribute vec4 aVertexPosition;
  attribute vec3 aVertexNormal;
  attribute vec2 aTextureCoord;

  uniform mat4 uNormalMatrix;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  varying highp vec2 vTextureCoord;
  varying highp vec3 vLighting;

  void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;

    // Apply lighting effect

    highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
    highp vec3 directionalLightColor = vec3(1, 1, 1);
    highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

    highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

    highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    vLighting = ambientLight + (directionalLightColor * directional);
  }
`;

  const fsSourceTexture = `
  #ifdef GL_ES
  precision mediump float;
  #endif
  
  varying highp vec2 vTextureCoord;
  varying highp vec3 vLighting;

  uniform sampler2D uSampler;

  void main(void) {
    highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

    gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
  }
  `;

  const fsSourcebw = `
  #ifdef GL_ES
  precision mediump float;
  #endif
  varying lowp vec4 vColor;

  void main(void) {
      float gray = (vColor.r + vColor.g + vColor.b) / 3.0;
      vec3 grayscale = vec3(gray);

      gl_FragColor = vec4(grayscale, vColor.a);
  }
`;

  const fsSourceTexbw = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  varying highp vec2 vTextureCoord;
  varying highp vec3 vLighting;

  uniform sampler2D uSampler;

  void main(void) {
    highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
    
      vec3 color = texelColor.rgb;
      float gray = (color.r + color.g + color.b) / 3.0;
      vec3 grayscale = vec3(gray);

      gl_FragColor = vec4(grayscale * vLighting, texelColor.a);
      // gl_FragColor = vec4(grayscale, texelColor.a);
    }
  `;

  const fsSourceBlink = `
  varying lowp vec4 vColor;

  void main(void) {
    gl_FragColor = vColor;
  }
`;

  const fsSourceTexBlink = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  varying highp vec2 vTextureCoord;
  varying highp vec3 vLighting;

  uniform sampler2D uSampler;

  void main(void) {
    highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
    // gl_FragColor = vec4(texelColor.rgb , texelColor.a);
    gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);

    gl_FragColor.r+=0.4;
    gl_FragColor.g+=0.4;
    gl_FragColor.b+=0.4;
  }
  `;
  const fsSourceTexBlinkbw = `
  #ifdef GL_ES
  precision mediump float;
  #endif
  
  varying highp vec2 vTextureCoord;
  varying highp vec3 vLighting;

  uniform sampler2D uSampler;

  void main(void) {
    highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
     gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
    
    vec3 color = texelColor.rgb;
      float gray = (color.r + color.g + color.b) / 3.0;
      vec3 grayscale = vec3(gray);

      // gl_FragColor = vec4(grayscale, texelColor.a);
      gl_FragColor = vec4(grayscale * vLighting, texelColor.a);
      gl_FragColor.r+=0.4;
    gl_FragColor.g+=0.4;
    gl_FragColor.b+=0.4;
    
  }
`;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  const shaderProgramTex = initShaderProgram(gl, vsSourceTexture, fsSourceTexture);    
  const shaderProgrambw = initShaderProgram(gl, vsSource, fsSourcebw);
  const shaderProgramTexbw = initShaderProgram(gl, vsSourceTexture, fsSourceTexbw);
  const shaderProgramBlink = initShaderProgram(gl, vsSource, fsSourceBlink);
  const shaderProgramTexBlink = initShaderProgram(gl, vsSourceTexture, fsSourceTexBlink);
  const shaderProgramTexBlinkbw = initShaderProgram(gl, vsSourceTexture, fsSourceTexBlinkbw);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
  };

  const programInfoTexture = {
    program: shaderProgramTex,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgramTex, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgramTex, 'aTextureCoord'),
      vertexNormal: gl.getAttribLocation(shaderProgramTex, 'aVertexNormal'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgramTex, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgramTex, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(shaderProgramTex, 'uSampler'),
      normalMatrix: gl.getUniformLocation(shaderProgramTex, 'uNormalMatrix'),

    },
  };

  const programInfobw = {
    program: shaderProgrambw,
    attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgrambw, 'aVertexPosition'),
        vertexColor: gl.getAttribLocation(shaderProgrambw, 'aVertexColor'),
    },
    uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgrambw, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgrambw, 'uModelViewMatrix'),
    },
};

const programInfoTexbw = {
  program: shaderProgramTexbw,
  attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgramTexbw, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgramTexbw, 'aTextureCoord'),
      vertexNormal: gl.getAttribLocation(shaderProgramTexbw, 'aVertexNormal'),
  },
  uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgramTexbw, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgramTexbw, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(shaderProgramTexbw, 'uSampler'),
      normalMatrix: gl.getUniformLocation(shaderProgramTexbw, 'uNormalMatrix'),
  },
};

const programInfoBlink = {
  program: shaderProgramBlink,
  attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgramBlink, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgramBlink, 'aVertexColor'),
  },
  uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgramBlink, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgramBlink, 'uModelViewMatrix'),
  },
};

const programInfoTexBlink = {
  program: shaderProgramTexBlink,
  attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgramTexBlink, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgramTexBlink, 'aTextureCoord'),
      vertexNormal: gl.getAttribLocation(shaderProgramTexBlink, 'aVertexNormal'),
  },
  uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgramTexBlink, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgramTexBlink, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(shaderProgramTexBlink, 'uSampler'),
      normalMatrix: gl.getUniformLocation(shaderProgramTexBlink, 'uNormalMatrix'),
  },
};

const programInfoTexBlinkbw = {
  program: shaderProgramTexBlinkbw,
  attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgramTexBlinkbw, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgramTexBlinkbw, 'aTextureCoord'),
      vertexNormal: gl.getAttribLocation(shaderProgramTexBlinkbw, 'aVertexNormal'),
  },
  uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgramTexBlinkbw, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgramTexBlinkbw, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(shaderProgramTexBlinkbw, 'uSampler'),
      normalMatrix: gl.getUniformLocation(shaderProgramTexBlinkbw, 'uNormalMatrix'),
  },
};

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  var tex = false;
  var bw = false;
  const track = Track(gl);
  const grass = Grass(gl);
  const walls = Wall(gl);
  const player = Player(gl, -5.0);
  const camera = Camera(gl);
  var pillars = [];
  var trains = [];
  var coinss = [];
  var coinssl = [];
  var coinssr = [];
  var stopblock = [];
  var jumpboost=[];
  var flyboost=[];
  var stoppass = [];
  var trafficlights = [];
  const wallTexture = loadTexture(gl, './images/finalWall.jpg');
  const trackTexture = loadTexture(gl, './images/track2.jpg');
  const grassTexture = loadTexture(gl, './images/finalgrass.jpg');
  const blockTexture = loadTexture(gl, './images/block3copy.jpg');
  const passTexture = loadTexture(gl, './images/block2.jpg');
  const poleTexture = loadTexture(gl, './images/pole2.jpg');
  const jumpTexture = loadTexture(gl, './images/crystal.jpg');
  const playTexture = loadTexture(gl, './images/finalgrass.jpg');
  const flyTexture = loadTexture(gl, './images/crystal3.jpg');

  for (var i = 40; i <= 1040; i += 20) {
    var rand = (Math.random() * (10) - 5);
    if (rand < 0) {
        coinss.push(Coin(gl, -i));
    }
    else {
      coinssl.push(Coinl(gl, -i));
      coinssr.push(Coinr(gl, -i));
    }
  }

  for (var i = 40; i <= 1100; i += 150) {
    var rand = (Math.random() * (10) - 5);
    if (rand < 0) {
      // console.log("pillar");
      pillars.push(Pillar(gl, -i));
    }
    else{
      trafficlights.push(Trafficlight(gl, -i));
    }
  }

  for (var i = 60; i <= 430; i += 300) {
    if (i==60 || i==660) {
      // console.log("pillar");
      jumpboost.push(Jumpboost(gl, -i));
    }
    else{
      flyboost.push(Flyboost(gl, -i));
    }
  }

  for (var i = 60; i <= 1040; i += 10) {
    // console.log(lane);
    var rand = (Math.random() * (10));
    if (rand > 0 && rand < 3) {
        stopblock.push(Stopblock(gl, -i));
    }
    else if(rand > 3 && rand < 6){
        stoppass.push(Stoppass(gl, -i));
    }
    else if(rand >6 && i%50==0){
      trains.push(Train(gl,-i));
      trains.push(Train(gl,-i-1000));
    }
  }

  var then = 0;
  Mousetrap.bind('left', function () {
    if(playerX>=0.0)
      playerX += -1.2;
  });

  Mousetrap.bind('right', function () {
    if(playerX<=0.0)
      playerX += 1.2;
  });

  Mousetrap.bind('up', function () {
    if(playerY==0.0)
    playerY += 1.0;
  });

  Mousetrap.bind('down', function () {
    if(playerR==0.0)
    playerR += 1.57;
  });

  Mousetrap.bind('t', function () {
    tex = ~tex;
    // console.log(tex);
  });

  Mousetrap.bind('b', function () {
    bw = ~bw;
  });

  var count = 120;

  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;
    gl.clearColor(0.0, 154.0/255.0, 233.0/255.0, 1.0);  // Clear to blue, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
  
    // Clear the canvas before we start drawing on it.
  
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //grass
    if(bw){
      if (tex)
        drawGrassTexture(gl, programInfoTexbw, grass, deltaTime, grassTexture);
      else
        drawGrass(gl, programInfobw, grass, deltaTime);
    }
    else{
      if(tex)
        drawGrassTexture(gl, programInfoTexture, grass, deltaTime, grassTexture);
      else
        drawGrass(gl, programInfo, grass, deltaTime);
    }

    //track
    if(bw){
      if (tex)
          drawTrackTexture(gl, programInfoTexbw, track, deltaTime, trackTexture);
      else
          drawTrack(gl, programInfobw, track, deltaTime);
    }
    else{
      if (tex)
        drawTrackTexture(gl, programInfoTexture, track, deltaTime, trackTexture);
      else
        drawTrack(gl, programInfo, track, deltaTime);
    }

    //wall
    if(bw){
      if(count>0){
        if (tex)
            drawWallTexture(gl, programInfoTexbw, walls, deltaTime, wallTexture);
        else
            drawWall(gl, programInfobw, walls, deltaTime);
      }
      else{
        if (tex)
            drawWallTexture(gl, programInfoTexBlinkbw, walls, deltaTime, wallTexture);
        else
            drawWall(gl, programInfobw, walls, deltaTime);
        if (count < -1)
          count = 120;
      }
    }
    else{
      if(count>0){
        if (tex)
          drawWallTexture(gl, programInfoTexture, walls, deltaTime, wallTexture);
        else
          drawWall(gl, programInfo, walls, deltaTime);
      }
      else{
        if (tex)
          drawWallTexture(gl, programInfoTexBlink, walls, deltaTime, wallTexture);
        else
          drawWall(gl, programInfoBlink, walls, deltaTime);
        if (count < -1)
          count = 120;
      }
    }
    count--;

    //player
    if(bw){
      // if(tex)
      // drawPlayerTexture(gl, programInfobw, player, deltaTime, playTexture);
      // else
      drawPlayer(gl, programInfobw, player, deltaTime);
    }
    else{
      // if(tex)
      // drawPlayerTexture(gl, programInfo, player, deltaTime, playTexture);
      // else
      drawPlayer(gl, programInfo, player, deltaTime);
    }

    drawCamera(gl, programInfo, camera, deltaTime);

    //coins
    for (j = 0; j < coinss.length; ++j) {
      if(bw){
        drawCoins(gl, programInfobw, coinss[j], deltaTime);
      }
      else{
        drawCoins(gl, programInfo, coinss[j], deltaTime);
      }
    }

    for (j = 0; j < coinssl.length; ++j) {
      if(bw)
      drawCoinsl(gl, programInfobw, coinssl[j], deltaTime);
      else
      drawCoinsl(gl, programInfo, coinssl[j], deltaTime);
    }

    for (j = 0; j < coinssr.length; ++j) {
      if(bw)
      drawCoinsr(gl, programInfobw, coinssr[j], deltaTime);
      else
      drawCoinsr(gl, programInfo, coinssr[j], deltaTime);
    }
//pillar
    for (j = 0; j < pillars.length; ++j) {
      if(bw){
        if (tex)
          drawPillarsTexture(gl, programInfoTexbw, pillars[j], deltaTime, wallTexture);
        else
          drawPillars(gl, programInfobw, pillars[j], deltaTime);
      }
      else{
        if (tex)
          drawPillarsTexture(gl, programInfoTexture, pillars[j], deltaTime, wallTexture);
        else
          drawPillars(gl, programInfo, pillars[j], deltaTime);
      }
    }
    //block
    for (j = 0; j < stopblock.length; ++j) {
      if(bw){
        if (tex)
          drawStopblockTexture(gl, programInfoTexbw, stopblock[j], deltaTime, blockTexture);
        else
          drawStopblock(gl, programInfobw, stopblock[j], deltaTime);
      }
      else{
        if (tex)
        drawStopblockTexture(gl, programInfoTexture, stopblock[j], deltaTime, blockTexture);
        else
        drawStopblock(gl, programInfo, stopblock[j], deltaTime);
      }
    }
//passs
    for (j = 0; j < stoppass.length; ++j) {
      if(bw){
      if (tex)
      drawStoppassTexture(gl, programInfoTexbw, stoppass[j], deltaTime, passTexture);
    else
      drawStoppass(gl, programInfobw, stoppass[j], deltaTime);
      }
      else{
        if (tex)
        drawStoppassTexture(gl, programInfoTexture, stoppass[j], deltaTime, passTexture);
      else
        drawStoppass(gl, programInfo, stoppass[j], deltaTime);
      }
    }
//train
    for (j = 0; j < trains.length; ++j) {
      if(bw)
      drawTrains(gl, programInfobw, trains[j], deltaTime);
      else
      drawTrains(gl, programInfo, trains[j], deltaTime);

    }
//trafficpole
    for (j = 0; j < trafficlights.length; ++j) {
      if (tex)
        drawTrafficlightsTexture(gl, programInfoTexture, trafficlights[j], deltaTime, poleTexture);
      else
        drawTrafficlights(gl, programInfo, trafficlights[j], deltaTime);
    }

//jumpboost
for (j = 0; j < jumpboost.length; ++j) {
  if(bw){
  if (tex)
  drawJumpboostTexture(gl, programInfoTexbw, jumpboost[j], deltaTime, jumpTexture);
else
  drawJumpboost(gl, programInfobw, jumpboost[j], deltaTime);
  }
  else{
    if (tex)
    drawJumpboostTexture(gl, programInfoTexture, jumpboost[j], deltaTime, jumpTexture);
  else
    drawJumpboost(gl, programInfo, jumpboost[j], deltaTime);
  }
}
//fly
for (j = 0; j < flyboost.length; ++j) {
  if(bw){
  if (tex)
  drawFlyboostTexture(gl, programInfoTexbw, flyboost[j], deltaTime, flyTexture);
else
  drawFlyboost(gl, programInfobw, flyboost[j], deltaTime);
  }
  else{
    if (tex)
    drawFlyboostTexture(gl, programInfoTexture, flyboost[j], deltaTime, flyTexture);
  else
    drawFlyboost(gl, programInfo, flyboost[j], deltaTime);
  }
}
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
// function initBuffers(gl) {

//   // Create a buffer for the cube's vertex positions.

//   const positionBuffer = gl.createBuffer();

//   // Select the positionBuffer as the one to apply buffer
//   // operations to from here out.

//   gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

//   // Now create an array of positions for the cube.

//   const positions = [
//     // Front face
//     -1.0, -1.0,  1.0,
//      1.0, -1.0,  1.0,
//      1.0,  1.0,  1.0,
//     -1.0,  1.0,  1.0,

//   ];

//   // Now pass the list of positions into WebGL to build the
//   // shape. We do this by creating a Float32Array from the
//   // JavaScript array, then use it to fill the current buffer.

//   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

//   // Now set up the colors for the faces. We'll use solid colors
//   // for each face.

//   const faceColors = [
//     [1.0,  1.0,  1.0,  1.0],    // Front face: white
//     [1.0,  0.0,  0.0,  1.0],    // Back face: red
//     [0.0,  1.0,  0.0,  1.0],    // Top face: green
//     [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
//     [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
//     [1.0,  0.0,  1.0,  1.0],    // Left face: purple
//   ];
//   // var colors = [
//   //   1.0,  1.0,  1.0,  1.0,    // white
//   //   1.0,  0.0,  0.0,  1.0,    // red
//   //   0.0,  1.0,  0.0,  1.0,    // green
//   //   0.0,  0.0,  1.0,  1.0,    // blue
//   // ];
//   // Convert the array of colors into a table for all the vertices.

//   var colors = [];

//   for (var j = 0; j < faceColors.length; ++j) {
//     const c = faceColors[j];

//     // Repeat each color four times for the four vertices of the face
//     colors = colors.concat(c, c, c, c);

//   }

//   const colorBuffer = gl.createBuffer();
//   gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
//   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

//   // Build the element array buffer; this specifies the indices
//   // into the vertex arrays for each face's vertices.

//   const indexBuffer = gl.createBuffer();
//   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

//   // This array defines each face as two triangles, using the
//   // indices into the vertex array to specify each triangle's
//   // position.

//   const indices = [
//     0,  1,  2,      0,  2,  3,    // front
//     4,  5,  6,      4,  6,  7,    // back
//     8,  9,  10,     8,  10, 11,   // top
//     12, 13, 14,     12, 14, 15,   // bottom
//     16, 17, 18,     16, 18, 19,   // right
//     20, 21, 22,     20, 22, 23,   // left
//   ];

//   // Now send the element array to GL

//   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
//       new Uint16Array(indices), gl.STATIC_DRAW);

//   return {
//     position: positionBuffer,
//     color: colorBuffer,
//     indices: indexBuffer,
//   };
// }

//
// Draw the scene.
//
// function drawScene(gl, programInfo, buffers, deltaTime) {
//   gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
//   gl.clearDepth(1.0);                 // Clear everything
//   gl.enable(gl.DEPTH_TEST);           // Enable depth testing
//   gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

//   // Clear the canvas before we start drawing on it.

//   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

//   // Create a perspective matrix, a special matrix that is
//   // used to simulate the distortion of perspective in a camera.
//   // Our field of view is 45 degrees, with a width/height
//   // ratio that matches the display size of the canvas
//   // and we only want to see objects between 0.1 units
//   // and 100 units away from the camera.

//   const fieldOfView = 45 * Math.PI / 180;   // in radians
//   const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
//   const zNear = 0.1;
//   const zFar = 100.0;
//   const projectionMatrix = mat4.create();

//   // note: glmatrix.js always has the first argument
//   // as the destination to receive the result.
//   mat4.perspective(projectionMatrix,
//                    fieldOfView,
//                    aspect,
//                    zNear,
//                    zFar);

//   // Set the drawing position to the "identity" point, which is
//   // the center of the scene.
//   const modelViewMatrix = mat4.create();

//   // Now move the drawing position a bit to where we want to
//   // start drawing the square.

//   mat4.translate(modelViewMatrix,     // destination matrix
//                  modelViewMatrix,     // matrix to translate
//                  [-0.0, 0.0, -6.0]);  // amount to translate

//   //Write your code to Rotate the cube here//
//   mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation * .7, [0, 1, 0]);

//   // Tell WebGL how to pull out the positions from the position
//   // buffer into the vertexPosition attribute
//   {
//     const numComponents = 3;
//     const type = gl.FLOAT;
//     const normalize = false;
//     const stride = 0;
//     const offset = 0;
//     gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
//     gl.vertexAttribPointer(
//         programInfo.attribLocations.vertexPosition,
//         numComponents,
//         type,
//         normalize,
//         stride,
//         offset);
//     gl.enableVertexAttribArray(
//         programInfo.attribLocations.vertexPosition);
//   }

//   // Tell WebGL how to pull out the colors from the color buffer
//   // into the vertexColor attribute.
//   {
//     const numComponents = 4;
//     const type = gl.FLOAT;
//     const normalize = false;
//     const stride = 0;
//     const offset = 0;
//     gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
//     gl.vertexAttribPointer(
//         programInfo.attribLocations.vertexColor,
//         numComponents,
//         type,
//         normalize,
//         stride,
//         offset);
//     gl.enableVertexAttribArray(
//         programInfo.attribLocations.vertexColor);
//   }

//   // Tell WebGL which indices to use to index the vertices
//   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

//   // Tell WebGL to use our program when drawing

//   gl.useProgram(programInfo.program);

//   // Set the shader uniforms

//   gl.uniformMatrix4fv(
//       programInfo.uniformLocations.projectionMatrix,
//       false,
//       projectionMatrix);
//   gl.uniformMatrix4fv(
//       programInfo.uniformLocations.modelViewMatrix,
//       false,
//       modelViewMatrix);

//   {
//     const vertexCount = 36;
//     const type = gl.UNSIGNED_SHORT;
//     const offset = 0;
//     gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
//   }

//   // Update the rotation for the next draw

//   cubeRotation += deltaTime;
// }

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
