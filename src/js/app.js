import * as Three from 'three';
import Chance from 'chance';
import * as Stats from 'stats.js';
import pointsFrag from '../shaders/points.frag';
import pointsVert from '../shaders/points.vert';

const debug = false;
const chance = new Chance();
const stats = new Stats();
