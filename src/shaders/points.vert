varying vec3 vColor;

uniform sampler2D colorTexture;
uniform float pixelRatio;

void main() {
    gl_PointSize = 2.1 * pixelRatio;
    vec4 modelViewPosition = modelViewMatrix * vec4(position.xy, 0.0, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;

    float pointIndex = position.z;
    vColor = texture2D(colorTexture, vec2(pointIndex / 512.0, 0)).rgb;
}