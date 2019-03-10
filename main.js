var score =0;
var hit =0; //hits obstacles
var death =0; //hits train or pillars
cameraRotation = 0.0;
cameraPositionz = 0.0;
cameraR = 0.8;
cameraA = -Math.PI / 2;
cameraV = 0;
gravity = 0.02;
//objects
var track;
var grass;
var walls;
var player;
var camera;
var target;
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
var left = false;
var right = false;
var fly = 0;
var rot = 0; //duck
var jump = 0;


//reposition after collision
var repos_coin=[]; //coinss i.e middle coins
var repos_coinl=[]; //coins i.e left coins
var repos_coinr=[]; //coins i.e right coins

//policeman
policeman=false;
caught=false;

function callDead() {
  death = 1;
  // console.log("dead");
  $("#canvasDiv").html("<h1>Game Over</h1>");
  document.getElementById('music').pause();
  document.getElementById('crash').play();
}

//collisions - no need of separate functions
function detectCollision_CoinPlayer(coin, player){
    // console.log("mid",coin.posx);
  if( Math.abs(player.posx - coin.posx) < player.lengthx/2+coin.lengthx/2 
    && Math.abs(player.posy - coin.posy) < player.lengthy/2+coin.lengthy/2
    && Math.abs(player.posz - coin.posz) < player.lengthz/2+coin.lengthz/2 ){
        return 1;
    }
}

function detectCollision_CoinleftPlayer(coinl, player){
  // console.log(coinl.lengthx);
if( Math.abs(player.posx - coinl.posx) < player.lengthx/2+coinl.lengthx/2 
  && Math.abs(player.posy - coinl.posy) < player.lengthy/2+coinl.lengthy/2
  && Math.abs(player.posz - coinl.posz) < player.lengthz/2+coinl.lengthz/2 ){
      return 1;
  }
}

function detectCollision_CoinrightPlayer(coinr, player){
  // console.log("player", "z", player.posz);
  // console.log("coin", "z", coinr.posz);
if( Math.abs(player.posx - coinr.posx) < player.lengthx/2+coinr.lengthx/2 
  && Math.abs(player.posy - coinr.posy) < player.lengthy/2+coinr.lengthy/2
  && Math.abs(player.posz - coinr.posz) < player.lengthz/2+coinr.lengthz/2 ){
      return 1;
  }
}

function detectCollision_pillarPlayer(pillar, player){ //not working
if( ( left && ((player.posz - pillar.posz) < player.lengthz/2+pillar.lengthz/2 ))
|| (right && ((player.posz - pillar.posz) < player.lengthz/2+pillar.lengthz/2) )){
      return 1;
  }
}

function detectCollision_FlyPlayer(flyboost, player){
  // console.log(flyboost.posz);
  // console.log(player.lengthz/2+flyboost.lengthx/2, player.posz - flyboost.posz);
  if(Math.abs(player.posx - flyboost.posx) < player.lengthx/2+flyboost.lengthx/2
  && Math.abs(player.posy - flyboost.posy) < player.lengthy/2+flyboost.lengthx/2
  && Math.abs(player.posz - flyboost.posz) < player.lengthz/2+flyboost.lengthx/2){
    // console.log("flying");
    return 1;
  }
}

function detectCollision_JumpPlayer(jumpboost, player){
  if(Math.abs(player.posx - jumpboost.posx) < player.lengthx/2+jumpboost.lengthx/2
  && Math.abs(player.posy - jumpboost.posy) < player.lengthy/2+jumpboost.lengthx/2
  && Math.abs(player.posz - jumpboost.posz) < player.lengthz/2+jumpboost.lengthx/2){
    // console.log("jumping");
    return 1;
  }
}

function detect_collision(object, player){ //train, stopblock, stoppass, target, pole
  // console.log(object.posy, player.posy);
  if(Math.abs(player.posx - object.posx) < player.lengthx/2+object.lengthx/2
  && Math.abs(player.posy+0.7299 - object.posy) < player.lengthy/2+object.lengthx/2
  && Math.abs(player.posz - object.posz) < player.lengthz/2+object.lengthx/2)
    return 1;
}

main();
//
// Start here
//
function main() {
  sub = document.getElementById("music");
  // if(sound1==0)
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
      // gl_FragColor = vec4(grayscale, texelColor.a);

      gl_FragColor = vec4(grayscale * vLighting, texelColor.a);
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
  track = Track(gl);
  grass = Grass(gl);
  walls = Wall(gl);
  player = Player(gl, -5.0);
  camera = Camera(gl);
  target = Target(gl, -1100.0);

  const wallTexture = loadTexture(gl, './images/finalWall.jpg');
  const trackTexture = loadTexture(gl, './images/track2.jpg');
  const grassTexture = loadTexture(gl, './images/finalgrass.jpg');
  const blockTexture = loadTexture(gl, './images/block3copy.jpg');
  const passTexture = loadTexture(gl, './images/block2.jpg');
  const poleTexture = loadTexture(gl, './images/pole2.jpg');
  const jumpTexture = loadTexture(gl, './images/crystal.jpg');
  const playTexture = loadTexture(gl, './images/player2.jpg');
  const flyTexture = loadTexture(gl, './images/crystal3.jpg');
  const trainTexture = loadTexture(gl, './images/train3.png');
  const targetTexture = loadTexture(gl, './images/target.png');

  for (var i = 40; i <= 1040; i += 20) {
    var rand = (Math.random() * (10) - 5);
    if (rand < 0) {
        coinss.push(Coin(gl, -i));
        repos_coin.push(0);
    }
    else {
      coinssl.push(Coinl(gl, -i));
      repos_coinl.push(0);
      repos_coinr.push(0);
      coinssr.push(Coinr(gl, -i));
    }
  }

  for (var i = 40; i <= 1100; i += 150) {
    var rand = (Math.random() * (10) - 5);
    if (rand < 0) {
      pillars.push(Pillar(gl, -i));
    }
    else{
      trafficlights.push(Trafficlight(gl, -i));
    }
  }

  for (var i = 60; i <= 430; i += 300) {
    if (i==60 || i==660) {
      jumpboost.push(Jumpboost(gl, -i));
    }
    else{
      flyboost.push(Flyboost(gl, -i));
    }
  }

  for (var i = 60; i <= 1040; i += 10) {
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
      // left=true; //for pillar left leg collision

  });

  Mousetrap.bind('right', function () {
    if(playerX<=0.0)
      playerX += 1.2;
      // right=true; //for piller right leg collision
  });

  Mousetrap.bind('up', function () {
    if(playerY==0.0)
    playerY += 1.0+jump;
  });

  Mousetrap.bind('down', function () {
    if(playerR==0.0)
    playerR += 1.57;
  });

  Mousetrap.bind('t', function () {
    tex = ~tex;
  });

  Mousetrap.bind('b', function () {
    bw = ~bw;
  });

  Mousetrap.bind('p',function (){
    sub.play();
  });



  var count = 120;

  // Draw the scene repeatedly
  function render(now) {
// console.log(hit);

    // console.log(jump);
    // console.log(repos_coinr);

    // console.log(cameraPositionz);

    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;
    gl.clearColor(0.0, 154.0/255.0, 233.0/255.0, 1.0);  // Clear to blue, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
    $("#score").text("Score: " + (Math.round(score)));
    $("#jump").text("Jump: " + (Math.round(jump)));
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

    //debug

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
      if(tex)
        drawPlayerTexture(gl, programInfoTexbw, player, deltaTime, playTexture);
      else
        drawPlayer(gl, programInfobw, player, deltaTime);
    }
    else{
      if(tex)
        drawPlayerTexture(gl, programInfoTexture, player, deltaTime, playTexture);
      else
        drawPlayer(gl, programInfo, player, deltaTime);
    }


    //target
    if(bw){
      if(tex)
        drawTargetsTexture(gl, programInfoTexbw, target, deltaTime, targetTexture);
      else
        drawTargets(gl, programInfobw, target, deltaTime);
    }
    else{
      if(tex)
        drawTargetsTexture(gl, programInfoTexture, target, deltaTime, targetTexture);
      else
        drawTargets(gl, programInfo, target, deltaTime);
    }
    //camera
    drawCamera(gl, programInfo, camera, deltaTime);

    //coins
    for (j = 0; j < coinss.length; ++j) {
      if(bw){
        drawCoins(gl, programInfobw, coinss[j], deltaTime, repos_coin[j]);
      }
      else{
        drawCoins(gl, programInfo, coinss[j], deltaTime, repos_coin[j]);
      }

      if(detectCollision_CoinPlayer(coinss[j], player)){
        score+=10;
        repos_coin[j] = 1;
      }

      // console.log(coinss[j].posz);
    }

    for (j = 0; j < coinssl.length; ++j) {
      if(bw){
        drawCoinsl(gl, programInfobw, coinssl[j], deltaTime, repos_coinl[j]);
      }
      else{
        drawCoinsl(gl, programInfo, coinssl[j], deltaTime, repos_coinl[j]);
      }

      if(detectCollision_CoinleftPlayer(coinssl[j], player)){
        score+=10;
        repos_coinl[j] = 1;
      }
    }

    for (j = 0; j < coinssr.length; ++j) {
      if(bw)
      drawCoinsr(gl, programInfobw, coinssr[j], deltaTime);
      else
      drawCoinsr(gl, programInfo, coinssr[j], deltaTime);

      if(detectCollision_CoinrightPlayer(coinssr[0], player)){
        score+=10;
        repos_coinr[j] = 1;
      }
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

      if(detectCollision_pillarPlayer(pillars[j], player)){
        // score+=10;
        // repos_coinr[j] = 1;
        callDead();
        // console.log("dead");
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

      if(detect_collision(stopblock[j], player)){
        hit+=1;
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

      // if(detect_collision(stoppass[j], player)){
      //   hit+=1;
      // }
    }
//train
    for (j = 0; j < trains.length; ++j) {
      if(bw){
        if(tex)
          drawTrainsTexture(gl, programInfoTexbw, trains[j], deltaTime, trainTexture);
        else
          drawTrains(gl, programInfobw, trains[j], deltaTime);
      }
      else{
        if(tex)        
          drawTrainsTexture(gl, programInfoTexture, trains[j], deltaTime, trainTexture);
          else
          drawTrains(gl, programInfo, trains[j], deltaTime);
      }
        if(detect_collision(trains[j], player)){
            callDead();
      }

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
  if(detectCollision_JumpPlayer(jumpboost[j], player)){
    jump=1.4;}
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
    if(detectCollision_FlyPlayer(flyboost[j], player)){
      fly=3.2;
  }
}

if(hit>=14){
  callDead();
}
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

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
