trackRotation = 0.0;
cubePositionz = 0.0;
cubeR = 1.5;

// Track
//
// Initialize the track we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
function Track(gl) {

    // Create a buffer for the cube's vertex positions.
  
    const positionBuffer = gl.createBuffer();
  
    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.
  
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
    // Now create an array of positions for the cube.
    var height=1.0;
    var dx=0.6;

    const positions = [
      // Front face
    //   -1.0, -1.0,  1.0,
    //    1.0, -1.0,  1.0,
    //    1.0,  1.0,  1.0,
    //   -1.0,  1.0,  1.0,
        // -height * Math.tan(45 / 2 * Math.PI / 180), -height, -330.0,
        // -height * Math.tan(45 / 2 * Math.PI / 180), -height, 1.0,
        // height * Math.tan(45 / 2 * Math.PI / 180), -height, 1.0,
        // height * Math.tan(45 / 2 * Math.PI / 180), -height, -330.0,
       
        //left and right track
        -2.0+dx, -height, -1.0,
        -2.0+dx, -height, 1.0,
        -1.0+dx-0.1, -height, 1.0,
        -1.0+dx-0.1, -height, -1.0,

        2.0-dx, -height, -1.0,
        2.0-dx, -height, 1.0,
        1.0-dx+0.1, -height, 1.0,
        1.0-dx+0.1, -height, -1.0,

        //middle track
        -1.0+dx, -height, -1.0,
        -1.0+dx, -height, 1.0,
        1.0-dx, -height, 1.0,
        1.0-dx, -height, -1.0,
    ];
  
    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.
  
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  
    // Now set up the colors for the faces. We'll use solid colors
    // for each face.
  
    const faceColors = [
    //   [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [185/255,  127/255,  43/255,  1.0],    // Back face: dark brown
    [185/255,  127/255,  43/255,  1.0],    // Back face: dark brown
    [203/255,  151/255,  59/255,  1.0],    // Back face: brown

];
    // var colors = [
    //   1.0,  1.0,  1.0,  1.0,    // white
    //   1.0,  0.0,  0.0,  1.0,    // red
    //   0.0,  1.0,  0.0,  1.0,    // green
    //   0.0,  0.0,  1.0,  1.0,    // blue
    // ];
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
    //   12, 13, 14,     12, 14, 15,   // bottom
    //   16, 17, 18,     16, 18, 19,   // right
    //   20, 21, 22,     20, 22, 23,   // left
    ];
  
    // Now send the element array to GL
  
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.STATIC_DRAW);
  
    return {
      position: positionBuffer,
      color: colorBuffer,
      indices: indexBuffer,
    };
  }

  function drawTrack(gl, programInfo, track, deltaTime) {
    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.
  
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 70.0;
    const projectionMatrix = mat4.create();
  
    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix,
                     fieldOfView,
                     aspect,
                     zNear,
                     zFar);
    
    for (var i = 0; i < 300; i++) {
        // Set the drawing position to the "identity" point, which is
        // the center of the scene.
        const modelViewMatrix = mat4.create();
    
        // Now move the drawing position a bit to where we want to
        // start drawing the square.
    
        // mat4.translate(modelViewMatrix,     // destination matrix
        //             modelViewMatrix,     // matrix to translate
        //             // [-0.0, 0.0, -6.0]);  // amount to translate
        //             [0.0, cubeR, 0.0]);  // amount to translate
        
        var cubeTranslate = cubePositionz;
        while (cubeTranslate >= 16) {
            cubeTranslate -= 16;
        }

        mat4.translate(modelViewMatrix,     // destination matrix
            modelViewMatrix,     // matrix to translate
            [-0.0, 0.0, cubeTranslate - i*2]);  // amount to translate
        //Write your code to Rotate the cube here//
        // mat4.rotate(modelViewMatrix, modelViewMatrix, trackRotation * .7, [0, 1, 0]);
    
        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute
        {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, track.position);
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
        gl.bindBuffer(gl.ARRAY_BUFFER, track.color);
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
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, track.indices);
    
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
        const vertexCount = 18;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
        }
    
        // Update the rotation for the next draw
    
        // trackRotation += deltaTime;
        cubePositionz += deltaTime;
    }
  }
  