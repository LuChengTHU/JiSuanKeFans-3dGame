import { JSONLoader, TextureLoader } from 'three';
import React, { Component } from 'react';
const THREE = require('three');
const OBJLoader = require('three-obj-loader');
OBJLoader(THREE);

const jsonLoader = new JSONLoader();
const textureLoader = new TextureLoader();
const objLoader = new THREE.OBJLoader();

export function loadJsonModel( path ) {
    return new Promise( ( resolve, reject ) => {
        jsonLoader.load(
            path,
            resolve,
            () => null,
            error => reject
        );

    });
}

export function loadObjModel( path ) {
    return new Promise( ( resolve, reject ) => {
        objLoader.load(
            path,
            resolve,
            () => null,
            error => reject
        );
    });
}

export function loadTexture( path ) {
    return new Promise( ( resolve, reject ) => {
        textureLoader.load(
            path,
            resolve,
            () => null,
            reject
        );
    });
}