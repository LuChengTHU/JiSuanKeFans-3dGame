import React, { Component, PropTypes} from 'react';
import * as THREE from 'three';
import { Vector3 } from 'three';

import Game from '../components/Game';

import { loadModel, } from '../utils/utils';

// Load our simple functions that manage scene/game state
import playerMovement from '../logic/playerMovement';

/**
 * Our "container" component. See https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0#.jwywi6ltw
 * for more reading. This container holds the game logic, but not the view code
 */
export default class GameContainer extends Component {

    constructor() {

        super();

        // Initial scene state
        this.state = {
            cameraPosition: new Vector3( 0, 5, 0 ),
            lookAt: new Vector3( 0, 0, 0 )
        };
    }

    componentDidMount() {

        // Track if we're mounted so game loop doesn't tick after unmount
        this.mounted = true;

        // Expose the global THREE object for use in debugging console
        window.THREE = THREE;

        // Load the geometry in didMount, which is only executed server side.
        // Note we can pass our JSON file paths to webpack!

        // loadModel( '../assets/sitepoint-robot.json' ).then(
        //     (geometry) => {
        //         console.log(geometry);
        //         this.setState({geometry}, ()=>{console.log(this.state);});
        //     }
        // );

        const geometry = {
            "faces":[41,63,62,67,68,0,1,2,3,0,0,1,1,41,20,73,78,22,4,5,6,7,2,2,3,3,41,28,3,5,29,8,9,10,11,4,5,6,7,41,62,61,66,67,1,12,13,2,0,0,1,1,41,75,74,79,80,14,15,16,17,3,3,8,8,41,29,5,7,34,11,10,18,19,7,6,9,10,41,65,64,69,70,20,21,22,23,1,1,11,11,41,76,75,80,81,24,14,17,25,3,3,8,8,41,34,7,9,39,19,18,26,27,10,9,12,13,41,66,65,70,71,13,20,23,28,1,1,11,11,41,77,76,81,82,29,24,25,30,3,3,8,8,41,39,9,11,44,27,26,31,32,13,12,14,15,41,67,66,71,72,2,13,28,33,1,1,11,11,41,78,77,82,83,6,29,30,34,3,3,8,8,41,44,11,13,49,32,31,35,36,15,14,16,17,41,68,67,72,73,3,2,33,5,1,1,11,2,41,22,78,83,24,7,6,34,37,3,3,8,8,41,49,13,15,54,36,35,38,39,17,16,18,19,41,18,68,73,20,40,3,5,4,1,1,2,2,41,80,79,28,27,17,16,41,42,8,8,4,4,41,54,15,17,59,39,38,43,44,19,18,20,0,41,70,69,74,75,23,22,15,14,11,11,3,3,41,81,80,27,26,25,17,42,45,8,8,4,4,41,59,17,19,64,44,43,46,21,0,20,21,1,41,71,70,75,76,28,23,14,24,11,11,3,3,41,26,0,82,81,45,47,30,25,4,4,8,8,41,64,19,21,69,21,46,48,22,1,21,22,11,41,72,71,76,77,33,28,24,29,11,11,3,3,41,0,1,83,82,47,49,34,30,4,4,8,8,41,69,21,23,74,22,48,50,15,11,22,23,3,41,21,19,92,93,51,52,53,54,22,21,24,25,41,24,83,1,2,37,34,49,55,8,8,4,4,41,74,23,25,79,15,50,56,16,3,23,26,8,41,16,63,68,18,57,0,3,40,0,0,1,1,41,73,72,77,78,5,33,29,6,2,11,3,3,41,79,25,3,28,16,56,58,41,8,26,5,4,41,61,60,65,66,12,59,20,13,0,0,1,1,41,60,59,64,65,59,44,21,20,0,0,1,1,41,14,58,63,16,60,61,0,57,27,27,0,0,41,58,57,62,63,61,62,1,0,27,19,0,0,41,57,56,61,62,62,63,12,1,19,27,0,0,41,56,55,60,61,63,64,59,12,27,19,0,0,41,55,54,59,60,64,39,44,59,19,19,0,0,41,12,53,58,14,65,66,61,60,17,17,27,27,41,53,52,57,58,66,67,62,61,17,17,19,27,41,52,51,56,57,67,68,63,62,17,17,27,19,41,51,50,55,56,68,69,64,63,17,17,19,27,41,50,49,54,55,69,36,39,64,17,17,19,19,41,10,48,53,12,70,71,66,65,15,15,17,17,41,48,47,52,53,71,72,67,66,15,15,17,17,41,47,46,51,52,72,73,68,67,15,15,17,17,41,46,45,50,51,73,74,69,68,15,15,17,17,41,45,44,49,50,74,32,36,69,15,15,17,17,41,8,43,48,10,75,76,71,70,13,13,15,15,41,43,42,47,48,76,77,72,71,13,13,15,15,41,42,41,46,47,77,78,73,72,13,13,15,15,41,41,40,45,46,78,79,74,73,13,13,15,15,41,40,39,44,45,79,27,32,74,13,13,15,15,41,6,38,43,8,80,81,76,75,10,10,13,13,41,38,37,42,43,81,82,77,76,10,10,13,13,41,37,36,41,42,82,83,78,77,10,10,13,13,41,36,35,40,41,83,84,79,78,10,10,13,13,41,35,34,39,40,84,19,27,79,10,10,13,13,41,4,33,38,6,85,86,81,80,7,7,10,10,41,33,32,37,38,86,87,82,81,7,7,10,10,41,32,31,36,37,87,88,83,82,7,7,10,10,41,31,30,35,36,88,89,84,83,7,7,10,10,41,30,29,34,35,89,11,19,84,7,7,10,10,41,2,1,33,4,90,91,86,85,4,4,7,7,41,1,0,32,33,91,92,87,86,4,4,7,7,41,0,26,31,32,92,93,88,87,4,4,7,7,41,26,27,30,31,93,94,89,88,4,4,7,7,41,27,28,29,30,94,8,11,89,4,4,7,7,41,94,93,105,106,95,96,97,98,28,25,29,30,41,17,15,90,91,99,100,101,102,20,18,31,32,41,13,11,88,89,103,104,105,106,16,14,33,34,41,9,7,86,87,107,108,109,110,12,9,35,36,41,23,21,93,94,111,51,54,112,23,22,25,28,41,19,17,91,92,52,99,102,53,21,20,32,24,41,15,13,89,90,100,103,106,101,18,16,34,31,41,11,9,87,88,104,107,110,105,14,12,36,33,41,7,5,84,86,108,113,114,109,9,6,37,35,41,3,25,95,85,115,116,117,118,5,26,38,39,41,25,23,94,95,116,111,112,117,26,23,28,38,41,5,3,85,84,113,119,120,114,6,5,39,37,41,99,98,110,111,121,122,123,124,40,41,42,43,41,91,90,102,103,125,126,127,128,32,31,44,45,41,88,87,99,100,129,130,131,132,33,36,40,46,41,95,94,106,107,133,95,98,134,38,28,30,47,41,84,85,97,96,135,136,137,138,37,39,48,49,41,92,91,103,104,139,125,128,140,24,32,45,50,41,89,88,100,101,141,129,132,142,34,33,46,51,41,85,95,107,97,143,133,134,144,39,38,47,48,41,86,84,96,98,145,135,138,146,35,37,49,41,41,93,92,104,105,96,139,140,97,25,24,50,29,41,90,89,101,102,126,141,142,127,31,34,51,44,41,87,86,98,99,130,145,146,131,36,35,41,40,41,111,110,122,123,147,148,149,150,43,42,10,52,41,106,105,117,118,151,152,153,154,30,29,53,54,41,103,102,114,115,155,156,157,158,45,44,55,56,41,100,99,111,112,159,121,124,160,46,40,43,57,41,107,106,118,119,161,151,154,162,47,30,54,58,41,96,97,109,108,163,164,165,166,49,48,59,60,41,104,103,115,116,167,155,158,168,50,45,56,61,41,101,100,112,113,169,159,160,170,51,46,57,62,41,97,107,119,109,171,161,162,172,48,47,58,59,41,98,96,108,110,122,163,166,123,41,49,60,42,41,105,104,116,117,152,167,168,153,29,50,61,53,41,102,101,113,114,156,169,170,157,44,51,62,55,41,118,117,129,130,173,174,175,176,54,53,11,3,41,115,114,126,127,177,178,179,180,56,55,27,0,41,112,111,123,124,181,147,150,182,57,43,52,15,41,119,118,130,131,183,173,176,184,58,54,3,8,41,108,109,121,120,185,186,187,188,60,59,4,7,41,116,115,127,128,189,177,180,190,61,56,0,1,41,113,112,124,125,191,181,182,192,62,57,15,17,41,109,119,131,121,193,183,184,194,59,58,8,4,41,110,108,120,122,148,185,188,149,42,60,7,10,41,117,116,128,129,174,189,190,175,53,61,1,11,41,114,113,125,126,178,191,192,179,55,62,17,27],
            "vertices":[0,-1,-0.68336,0,-1,-0.350026,0,-1,-0.016693,0,-1,-2.01669,0.5,-0.866025,-0.016693,0.5,-0.866026,-2.01669,0.866025,-0.5,-0.016693,0.866025,-0.5,-2.01669,1,0,-0.016693,1,-0,-2.01669,0.866025,0.5,-0.016693,0.866025,0.5,-2.01669,0.5,0.866025,-0.016693,0.5,0.866025,-2.01669,0,1,-0.016693,0,1,-2.01669,-0.5,0.866026,-0.016693,-0.5,0.866025,-2.01669,-0.866025,0.5,-0.016693,-0.866025,0.5,-2.01669,-1,0,-0.016693,-1,0,-2.01669,-0.866026,-0.499999,-0.016693,-0.866026,-0.5,-2.01669,-0.500001,-0.866025,-0.016693,-0.500001,-0.866025,-2.01669,0,-1,-1.01669,0,-1,-1.35003,0,-1,-1.68336,0.5,-0.866025,-1.68336,0.5,-0.866025,-1.35003,0.5,-0.866025,-1.01669,0.5,-0.866025,-0.68336,0.5,-0.866025,-0.350026,0.866025,-0.5,-1.68336,0.866025,-0.5,-1.35003,0.866025,-0.5,-1.01669,0.866025,-0.5,-0.68336,0.866025,-0.5,-0.350026,1,-0,-1.68336,1,-0,-1.35003,1,-0,-1.01669,1,0,-0.68336,1,0,-0.350026,0.866025,0.5,-1.68336,0.866025,0.5,-1.35003,0.866025,0.5,-1.01669,0.866025,0.5,-0.68336,0.866025,0.5,-0.350026,0.5,0.866025,-1.68336,0.5,0.866025,-1.35003,0.5,0.866025,-1.01669,0.5,0.866025,-0.68336,0.5,0.866025,-0.350026,0,1,-1.68336,0,1,-1.35003,0,1,-1.01669,0,1,-0.68336,0,1,-0.350026,-0.5,0.866025,-1.68336,-0.5,0.866025,-1.35003,-0.5,0.866025,-1.01669,-0.5,0.866025,-0.68336,-0.5,0.866025,-0.350026,-0.866025,0.5,-1.68336,-0.866025,0.5,-1.35003,-0.866025,0.5,-1.01669,-0.866025,0.5,-0.68336,-0.866025,0.5,-0.350026,-1,0,-1.68336,-1,0,-1.35003,-1,0,-1.01669,-1,0,-0.68336,-1,0,-0.350026,-0.866026,-0.5,-1.68336,-0.866026,-0.5,-1.35003,-0.866026,-0.5,-1.01669,-0.866026,-0.5,-0.68336,-0.866026,-0.499999,-0.350026,-0.500001,-0.866025,-1.68336,-0.500001,-0.866025,-1.35003,-0.500001,-0.866025,-1.01669,-0.500001,-0.866025,-0.68336,-0.500001,-0.866025,-0.350026,0.401744,-0.695841,-2.01669,-0,-0.803489,-2.01669,0.695841,-0.401744,-2.01669,0.803488,-0,-2.01669,0.695841,0.401744,-2.01669,0.401744,0.695841,-2.01669,0,0.803488,-2.01669,-0.401744,0.695841,-2.01669,-0.695841,0.401744,-2.01669,-0.803488,0,-2.01669,-0.695842,-0.401744,-2.01669,-0.401745,-0.695841,-2.01669,0.401744,-0.695841,-2.26971,0,-0.803489,-2.26971,0.695841,-0.401744,-2.26971,0.803488,-0,-2.26971,0.695841,0.401744,-2.26971,0.401744,0.695841,-2.26971,0,0.803488,-2.26971,-0.401744,0.695841,-2.26971,-0.695841,0.401744,-2.26971,-0.803488,0,-2.26971,-0.695842,-0.401744,-2.26971,-0.401745,-0.695841,-2.26971,0.072358,-0.125328,-2.28184,-0,-0.144716,-2.28184,0.125328,-0.072358,-2.28184,0.144716,0,-2.28184,0.125328,0.072358,-2.28184,0.072358,0.125328,-2.28184,0,0.144716,-2.28184,-0.072358,0.125328,-2.28184,-0.125328,0.072358,-2.28184,-0.144717,0,-2.28184,-0.125328,-0.072358,-2.28184,-0.072358,-0.125328,-2.28184,0.072358,-0.125328,-2.95091,-0,-0.144716,-2.95091,0.125328,-0.072358,-2.95091,0.144716,0,-2.95091,0.125328,0.072358,-2.95091,0.072358,0.125328,-2.95091,-0,0.144716,-2.95091,-0.072358,0.125328,-2.95091,-0.125328,0.072358,-2.95091,-0.144717,0,-2.95091,-0.125328,-0.072358,-2.95091,-0.072359,-0.125328,-2.95091],
            "faceVertexUvs":[[0.41669,0.053791,0.41669,0.107438,0.333381,0.107438,0.333381,0.053791,0.250072,0.000144,0.250072,0.053791,0.166762,0.053791,0.166762,0.000144,0.999857,0.268379,0.999857,0.322026,0.916547,0.322027,0.916547,0.268379,0.41669,0.161085,0.333381,0.161085,0.166762,0.214732,0.166762,0.26838,0.083453,0.26838,0.083453,0.214732,0.833238,0.322027,0.833238,0.268379,0.333381,0.214732,0.333381,0.26838,0.250072,0.26838,0.250072,0.214732,0.166762,0.161085,0.083453,0.161085,0.749928,0.322027,0.749928,0.268379,0.250072,0.161085,0.166762,0.107438,0.083453,0.107438,0.666619,0.322027,0.666619,0.26838,0.250072,0.107438,0.083453,0.053791,0.583309,0.322027,0.583309,0.26838,0.083453,0.000144,0.5,0.322027,0.5,0.26838,0.333381,0.000144,0.000143,0.26838,0.000143,0.214733,0.41669,0.322027,0.41669,0.26838,0.000143,0.161085,0.333381,0.322027,0.000143,0.107438,0.250072,0.322027,0.000143,0.053791,0.166762,0.322027,0.000143,0.519426,0.000143,0.436116,0.030693,0.444302,0.030693,0.51124,0.000143,0.000144,0.083453,0.322027,0.41669,0.000144,0.000144,0.322027,0.41669,0.214732,0.5,0.000144,0.5,0.053791,0.5,0.107438,0.5,0.161085,0.5,0.214732,0.583309,0.000144,0.583309,0.053791,0.583309,0.107438,0.583309,0.161085,0.583309,0.214732,0.666619,0.000144,0.666619,0.053791,0.666619,0.107438,0.666619,0.161085,0.666619,0.214732,0.749928,0.000144,0.749928,0.053791,0.749928,0.107438,0.749928,0.161085,0.749928,0.214732,0.833238,0.000144,0.833238,0.053791,0.833238,0.107438,0.833238,0.161085,0.833238,0.214732,0.916547,0.000143,0.916547,0.053791,0.916547,0.107438,0.916547,0.161085,0.916547,0.214732,0.999856,0.000143,0.999857,0.053791,0.999857,0.107438,0.999857,0.161085,0.999857,0.214732,0.13402,0.633516,0.200958,0.633516,0.200958,0.674236,0.13402,0.674236,0.041798,0.363968,0.113946,0.322314,0.122132,0.352863,0.064162,0.386332,0.197255,0.322314,0.269404,0.363968,0.24704,0.386332,0.18907,0.352863,0.311058,0.436116,0.311058,0.519426,0.280509,0.51124,0.280509,0.444302,0.041798,0.591573,0.064162,0.56921,0.269404,0.591574,0.24704,0.569211,0.197255,0.633228,0.113946,0.633228,0.122132,0.602679,0.18907,0.602679,0.197255,0.633229,0.18907,0.60268,0.561207,0.413741,0.561225,0.48068,0.458788,0.453266,0.458785,0.44121,0.334834,0.633516,0.401772,0.633516,0.401772,0.674236,0.334834,0.674236,0.535648,0.633516,0.602587,0.633516,0.602587,0.674236,0.535648,0.674236,0.067082,0.633516,0.067082,0.674236,0.736463,0.633516,0.803401,0.633516,0.803401,0.674236,0.736463,0.674236,0.267896,0.633516,0.267896,0.674236,0.46871,0.633516,0.46871,0.674236,0.000143,0.633516,0.000143,0.674236,0.669525,0.633516,0.669525,0.674236,0.670019,0.322314,0.682075,0.322314,0.682075,0.429994,0.670018,0.429994,0.344793,0.538662,0.311345,0.480679,0.413782,0.453267,0.419807,0.46371,0.344843,0.355777,0.402816,0.322314,0.430257,0.424743,0.419816,0.43077,0.527728,0.355777,0.452755,0.43077,0.402748,0.572157,0.430245,0.469743,0.527777,0.538662,0.469822,0.572157,0.442326,0.469742,0.452764,0.46371,0.311363,0.413741,0.413786,0.44121,0.469754,0.322314,0.442314,0.424743,0.469686,0.572194,0.442301,0.469749,0.585625,0.322314,0.597681,0.322314,0.597681,0.429994,0.585625,0.429994,0.621794,0.322314,0.63385,0.322314,0.63385,0.429994,0.621794,0.429994,0.657962,0.322314,0.657962,0.429994,0.573569,0.322314,0.573569,0.429994,0.694131,0.322314,0.706187,0.322314,0.706187,0.429994,0.694131,0.429994,0.609737,0.322314,0.609737,0.429994,0.645906,0.322314,0.645906,0.429994,0.561512,0.322314,0.561512,0.429994]],
            "vertexNormals":[-0.499985,0.866024,-0,-0.866024,0.499985,-0,-0.999969,0,-0,-0.866024,-0.499985,-0,0,-1,-0,0,-0.757134,-0.653218,0.378552,-0.655721,-0.653218,0.499985,-0.866024,-0,-0.499985,-0.866024,-0,0.655721,-0.378552,-0.653218,0.866024,-0.499985,-0,-1,0,-0,0.757134,0,-0.653218,1,0,-0,0.655721,0.378552,-0.653218,0.866024,0.499985,-0,0.378552,0.655721,-0.653218,0.499985,0.866024,-0,0,0.757134,-0.653218,0,1,-0,-0.378552,0.655721,-0.653218,-0.655721,0.378552,-0.653218,-0.757134,0,-0.653218,-0.655721,-0.378552,-0.653218,-0.552263,0.318857,-0.770257,-0.637715,0,-0.770257,-0.378552,-0.655721,-0.653218,0,0.999969,-0,-0.552263,-0.318857,-0.770257,-0.762261,0,-0.647237,-0.660146,-0.381115,-0.647237,0,0.637715,-0.770257,-0.318857,0.552263,-0.770257,0.552263,0.318857,-0.770257,0.318857,0.552263,-0.770257,0.552263,-0.318857,-0.770257,0.637715,0,-0.770257,0.318857,-0.552263,-0.770257,-0.318857,-0.552263,-0.770257,0,-0.637715,-0.770257,0.762261,0,-0.647237,0.660146,-0.381115,-0.647237,0.559526,-0.323038,-0.763237,0.646107,0,-0.763237,0,0.762261,-0.647237,-0.381115,0.660146,-0.647237,0.660146,0.381115,-0.647237,-0.381115,-0.660146,-0.647237,0,-0.762261,-0.647237,0.381115,-0.660146,-0.647237,-0.660146,0.381115,-0.647237,0.381115,0.660146,-0.647237,0.999969,0,-0,-0.646107,0,-0.763237,-0.559526,-0.323038,-0.763237,0,0.646107,-0.763237,-0.323038,0.559526,-0.763237,0.559526,0.323038,-0.763237,-0.323038,-0.559526,-0.763237,0,-0.646107,-0.763237,0.323038,-0.559526,-0.763237,-0.559526,0.323038,-0.763237,0.323038,0.559526,-0.763237],
            "name":"Cylinder.001Geometry.2",
            "metadata":{
                "version":3,
                "generator":"io_three",
                "faces":120,
                "vertices":132,
                "type":"Geometry",
                "vertexNormals":63,
                "faceVertexUvs":1
            }
        };
        this.setState({geometry}, ()=>{console.log(this.state.geometry);});


        //console.log(this.state);
        // Start the game loop when this component loads
        this.requestGameLoop();

    }

    componentWillUnmount() {

        this.mounted = false;
        this.cancelGameLoop();

    }


    requestGameLoop() {

        this.reqAnimId = window.requestAnimationFrame( this.gameLoop );

    }

    cancelGameLoop() {

        window.cancelAnimationFrame( this.reqAnimId );

    }

    // Our game loop, which is managed as the window's requestAnimationFrame
    // callback
    gameLoop = (time) => {

        if( !this.mounted ) {
            return;
        }

        this.requestGameLoop();

        const oldState = this.state;

        // Apply our reducer functions to the "game state", which for this
        // example is held in local container state. It could be moved into
        // a redux/flux store and udpated once per game loop.
        const newState = playerMovement( oldState, time );

        this.setState( newState );
    };

    render() {

        const width = window.innerWidth;
        const height = window.innerHeight;

        const {
            cameraPosition, geometry, lookAt, playerPosition, playerRotation,
        } = this.state;

        // Pass the data <Game /> needs to render. Note we don't show the game
        // until the geometry model file is loaded. This could be replaced with
        // a loading  screen, or even a 3d scene without geometry in it
        return <div>
            { geometry ? <Game
                width={ width }
                height={ height }
                cameraPosition={ cameraPosition }
                lookAt={ lookAt }
                geometry={ geometry }
                playerPosition={ playerPosition }
                playerRotation={ playerRotation }
            /> : 'Loading' }
        </div>;

    }

}