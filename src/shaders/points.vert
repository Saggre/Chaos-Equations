#version 120

varying vec3 vColor;

uniform float iters;
uniform float steps;
uniform mat3 px;
uniform mat3 py;
uniform float cpuTime;
uniform float deltaTime;
uniform float pixelRatio;
uniform sampler2D colorTexture;

const int MAX_ITERATIONS = 2048;

void main() {
    int thisIter = int(position.x);
    float t = cpuTime + deltaTime * position.y;

    vec3 pos = vec3(t, t, t);

    for (int iter = 0; iter < MAX_ITERATIONS; iter++) {
        if (iter > thisIter){
            break;
        }

        vec3 xxyytt = pos * pos;// x*x, y*y, t*t combinations
        vec3 xyxzyz = pos.xxy * pos.yzz;// x*y, x*z, y*z combinations

        pos.xy = vec2(
        xxyytt.x * px[0][0] + xxyytt.y * px[1][0] + xxyytt.z * px[2][0] + xyxzyz.x * px[0][1] + xyxzyz.y * px[1][1] + xyxzyz.z * px[2][1] + pos.x * px[0][2] + pos.y * px[1][2] + pos.z * px[2][2],
        xxyytt.x * py[0][0] + xxyytt.y * py[1][0] + xxyytt.z * py[2][0] + xyxzyz.x * py[0][1] + xyxzyz.y * py[1][1] + xyxzyz.z * py[2][1] + pos.x * py[0][2] + pos.y * py[1][2] + pos.z * py[2][2]
        );
    }

    gl_PointSize = 1.8 * pixelRatio;
    vec4 modelViewPosition = modelViewMatrix * vec4(pos.xy, 0., 1.);
    gl_Position = projectionMatrix * modelViewPosition;

    if (position.x > 1.0 && position.y > 1.0){
        vColor = texture2D(colorTexture, position.xy / vec2(iters, steps)).rgb;
    } else {
        vColor = vec3(1., 1., 1.);
    }
}