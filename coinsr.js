function Coinr(gl, zl) {
    posx=1.1;
    posy=0.0;
    posz=0.0;
    lengthx = 0.12;
    lengthy = 0.1;
    lengthz = 0.12;
    // Create a buffer for the camera's vertex positions.

    const positionBuffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Now create an array of positions for the camera.
    dd=1.1;
    const positions = [
        // Front face
        -0.06+dd, -0.05,  0.06+dd,
        0.06+dd, -0.05,  0.06+dd,
        0.06+dd,  0.05,  0.06+dd,
        -0.06+dd,  0.05,  0.06+dd,

        // Back face
        -0.06+dd, -0.05, -0.06+dd,
        -0.06+dd,  0.05, -0.06+dd,
        0.06+dd,  0.05, -0.06+dd,
        0.06+dd, -0.05, -0.06+dd,

        // Top face
        -0.06+dd,  0.05, -0.06+dd,
        -0.06+dd,  0.05,  0.06+dd,
        0.06+dd,  0.05,  0.06+dd,
        0.06+dd,  0.05, -0.06+dd,

        // Bottom face
        -0.06+dd, -0.05, -0.06+dd,
        0.06+dd, -0.05, -0.06+dd,
        0.06+dd, -0.05,  0.06+dd,
        -0.06+dd, -0.05,  0.06+dd,

        // Right face
        0.06+dd, -0.05, -0.06+dd,
        0.06+dd,  0.05, -0.06+dd,
        0.06+dd,  0.05,  0.06+dd,
        0.06+dd, -0.05,  0.06+dd,

        // Left face
        -0.06+dd, -0.05, -0.06+dd,
        -0.06+dd, -0.05,  0.06+dd,
        -0.06+dd,  0.05,  0.06+dd,
        -0.06+dd,  0.05, -0.06+dd,
    ];

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Now set up the colors for the faces. We'll use solid colors
    // for each face.

    const faceColors = [
        [247/255,  203/255,  0/255,  1.0],    // Front face: white
        [217/255,  151/255,  0/255,  1.0],    // Left face: purple
        [247/255,  203/255,  0/255,  1.0], 
        [217/255,  151/255,  0/255,  1.0],    // Left face: purple
        [217/255,  151/255,  0/255,  1.0],    // Left face: purple
        [217/255,  151/255,  0/255,  1.0],    // Left face: purple
           // Front face: white
   // Left face: purple

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

    return {
        position: positionBuffer,
        color: colorBuffer,
        indices: indexBuffer,
        r: 3,
        // a: theta,
        z: zl,
        posx: posx,
        posy: posy,
        posz: posz,
        lengthx: lengthx,
        lengthy: lengthy,
        lengthz: lengthz,
        // speed: speed,
        // normal: normalBuffer,
        // textureCoord: textureCoordBuffer,
    };
}

function drawCoinsr(gl, programInfo, buffers, deltaTime, repos) {

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

    mat4.translate(modelViewMatrix,     // destination matrix
        modelViewMatrix,     // matrix to translate
        [0.0, cameraR-2.37, 0]);  // amount to translate

        buffers.posy=cameraR-2.37;
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
        [0.0, 0.0, cameraPositionz+buffers.z]);  // amount to translate

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
