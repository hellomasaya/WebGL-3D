function Trafficlight(gl, zl) {
    posx=0.0;
    posy=0.0;
    posz=0.0;
    lengthx = 0.09;
    lengthy =2.5;
    lengthz =0.092;
    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  
    const textureCoordinates = [
      // Front
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Back
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Top
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Bottom
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Right
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Left
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,

    ];
  
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                  gl.STATIC_DRAW);

    // Create a buffer for the camera's vertex positions.

    const positionBuffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Now create an array of positions for the camera.

    const positions = [
        // Front face
        -0.045,-2.5,  0.046,
        0.045,-2.5,  0.046,
        0.045, 2.5,  0.046,
        -0.045, 2.5,  0.046,

        // Back face
        -0.045,-2.5, -0.046,
        -0.045, 2.5, -0.046,
        0.045, 2.5, -0.046,
        0.045,-2.5, -0.046,

        // Top face
        -0.045, 2.5, -0.046,
        -0.045, 2.5,  0.046,
        0.045, 2.5,  0.046,
        0.045, 2.5, -0.046,

        // Bottom face
        -0.045,-2.5, -0.046,
        0.045,-2.5, -0.046,
        0.045,-2.5,  0.046,
        -0.045,-2.5,  0.046,

        // Right face
        0.045,-2.5, -0.046,
        0.045, 2.5, -0.046,
        0.045, 2.5,  0.046,
        0.045,-2.5,  0.046,

        // Left face
        -0.045,-2.5, -0.046,
        -0.045,-2.5,  0.046,
        -0.045, 2.5,  0.046,
        -0.045, 2.5, -0.046,
    ];

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Now set up the colors for the faces. We'll use solid colors
    // for each face.

    const faceColors = [
        [118/255,  133/255,  152/255,  1.0],    // Front face: white
        [118/255,  133/255,  152/255,  1.0],    // Front face: white
        [67/255,  92/255,  113/255,  1.0],    // Front face: white
        [67/255,  92/255,  113/255,  1.0],    // Front face: white
        [67/255,  92/255,  113/255,  1.0],    // Front face: white
        [67/255,  92/255,  113/255,  1.0],    // Front face: white
    ];

    // Convert the array of colors into a table for all the vertices.

    var colors = [];

    for (var j = 0; j < faceColors.length; ++j) {
        const c = faceColors[j];

        // Repeat each color four times for the four vertices of the face
        colors = colors.concat(c, c, c, c);
    }

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    // Build the element array buffer; this specifies the indices
    // into the vertex arrays for each face's vertices.

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.

    const indices = [
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23,   // left
    ];

    // Now send the element array to GL

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.STATIC_DRAW);

    // theta = Math.random() * (Math.PI);
    // speed = (Math.random() * (10)-5);
    lane = Math.floor((Math.random() * (2)+1)); //1=right or 2=left
    if (lane==1) lane =1.2;
    if (lane==2) lane =-1.2;

    return {
        position: positionBuffer,
        color: colorBuffer,
        indices: indexBuffer,
        // r: 3,
        lane: lane,
        z: zl,
        // speed: speed,
        // normal: normalBuffer,
        textureCoord: textureCoordBuffer,
        posx: posx,
        posy: posy,
        posz: posz,
        lengthx: lengthx,
        lengthy: lengthy,
        lengthz: lengthz,
    };
}

function drawTrafficlights(gl, programInfo, buffers, deltaTime) {
    // while(buffers.a<0)
    // {
    //     buffers.a += Math.PI;
    // }
    // while(buffers.a>=Math.PI){
    //     buffers.a -= Math.PI;
    // }
    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 60.0;
    const projectionMatrix = mat4.create();

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();

    mat4.translate(modelViewMatrix,     // destination matrix
        modelViewMatrix,     // matrix to translate
        [buffers.lane, 0, 0]);
    // Now move the drawing position a bit to where we want to
    // start drawing the square.
//when player in air cameraR stays same 
    mat4.translate(modelViewMatrix,     // destination matrix
        modelViewMatrix,     // matrix to translate
        [0, cameraR-2.27, 0]);  // amount to translate

    // mat4.rotate(modelViewMatrix,  // destination matrix
    //     modelViewMatrix,  // matrix to rotate
    //     -cameraA-Math.PI/2,     // amount to rotate in radians
    //     [0, 0, 1]);       // axis to rotate around (Z)
    //
    // mat4.translate(modelViewMatrix,     // destination matrix
    //     modelViewMatrix,     // matrix to translate
    //     [-cameraR*Math.cos(cameraA), -cameraR*Math.sin(cameraA), 0]);  // amount to translate
    buffers.posx=buffers.lane;
    buffers.posy=cameraR-2.27;
    buffers.posz=cameraPositionz+buffers.z;
    mat4.translate(modelViewMatrix,     // destination matrix
        modelViewMatrix,     // matrix to translate
        [-0.0, 0.0, cameraPositionz+buffers.z]);  // amount to translate

    // mat4.rotate(modelViewMatrix,  // destination matrix
    //     modelViewMatrix,  // matrix to rotate
    //     buffers.a+tunnelRotation-cameraA,     // amount to rotate in radians
    //     [0, 0, 1]);       // axis to rotate around (Z)
    // mat4.rotate(modelViewMatrix,  // destination matrix
    //     modelViewMatrix,  // matrix to rotate
    //     tunnelRotation,// amount to rotate in radians
    //     [0, 1, 0]);       // axis to rotate around (X)

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }

    // Tell WebGL how to pull out the colors from the color buffer
    // into the vertexColor attribute.
    {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexColor);
    }

    // Tell WebGL which indices to use to index the vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    // Tell WebGL to use our program when drawing

    gl.useProgram(programInfo.program);

    // Set the shader uniforms

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);

    {
        const vertexCount = 36;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }

    // Update the rotation for the next draw
    return buffers;
}

function drawTrafficlightsTexture(gl, programInfo, buffers, deltaTime, poleTexture) {
    // while(buffers.a<0)
    // {
    //     buffers.a += Math.PI;
    // }
    // while(buffers.a>=Math.PI){
    //     buffers.a -= Math.PI;
    // }
    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 60.0;
    const projectionMatrix = mat4.create();

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();

    // Now move the drawing position a bit to where we want to
    // start drawing the square.
//when player in air cameraR stays same 
mat4.translate(modelViewMatrix,     // destination matrix
    modelViewMatrix,     // matrix to translate
    [buffers.lane, 0, 0]);
// Now move the drawing position a bit to where we want to
// start drawing the square.
//when player in air cameraR stays same 
mat4.translate(modelViewMatrix,     // destination matrix
    modelViewMatrix,     // matrix to translate
    [0, cameraR-2.27, 0]);  // amount to translate
    buffers.posx=buffers.lane;
    buffers.posy=cameraR-2.27;
    buffers.posz=cameraPositionz+buffers.z;
// mat4.rotate(modelViewMatrix,  // destination matrix
//     modelViewMatrix,  // matrix to rotate
//     -cameraA-Math.PI/2,     // amount to rotate in radians
//     [0, 0, 1]);       // axis to rotate around (Z)
//
// mat4.translate(modelViewMatrix,     // destination matrix
//     modelViewMatrix,     // matrix to translate
//     [-cameraR*Math.cos(cameraA), -cameraR*Math.sin(cameraA), 0]);  // amount to translate

mat4.translate(modelViewMatrix,     // destination matrix
    modelViewMatrix,     // matrix to translate
    [-0.0, 0.0, cameraPositionz+buffers.z]);  // amount to translate
    // if(lane ==1){
    //     mat4.translate(modelViewMatrix,     // destination matrix
    //         modelViewMatrix,     // matrix to translate
    //         [-1.2, 0, 0]);
    // }
    // else if(lane ==3){
    //     mat4.translate(modelViewMatrix,     // destination matrix
    //         modelViewMatrix,     // matrix to translate
    //         [1.2, 0, 0]);
    // }
    // mat4.rotate(modelViewMatrix,  // destination matrix
    //     modelViewMatrix,  // matrix to rotate
    //     buffers.a+tunnelRotation-cameraA,     // amount to rotate in radians
    //     [0, 0, 1]);       // axis to rotate around (Z)
    // mat4.rotate(modelViewMatrix,  // destination matrix
    //     modelViewMatrix,  // matrix to rotate
    //     tunnelRotation,// amount to rotate in radians
    //     [0, 1, 0]);       // axis to rotate around (X)

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }

        // tell webgl how to pull out the texture coordinates from buffer
        {
            const num = 2; // every coordinate composed of 2 values
            const type = gl.FLOAT; // the data in the buffer is 32 bit float
            const normalize = false; // don't normalize
            const stride = 0; // how many bytes to get from one set to the next
            const offset = 0; // how many bytes inside the buffer to start from
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
            gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, num, type, normalize, stride, offset);
            gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
        }

    // Tell WebGL which indices to use to index the vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    // Tell WebGL to use our program when drawing

    gl.useProgram(programInfo.program);

    // Set the shader uniforms

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);
        
        // Tell WebGL we want to affect texture unit 0
        gl.activeTexture(gl.TEXTURE0);

        // Bind the texture to texture unit 0
        gl.bindTexture(gl.TEXTURE_2D, poleTexture);

        // Tell the shader we bound the texture to texture unit 0
        gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    {
        const vertexCount = 36;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }

    // Update the rotation for the next draw
    return buffers;
}