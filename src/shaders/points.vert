varying vec3 vColor;

void main() {
    gl_PointSize = 2.0;
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;

    vColor = vec3(1.0, 1.0, 1.0);
}