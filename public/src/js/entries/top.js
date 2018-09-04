'use strict';
require('babel-polyfill');
const io = require('socket.io-client');

// トップページのエントリファイル

const socket = io.connect();

socket.on('connect', () => {
    console.log('connect');
});

socket.on('disconnect', () => {
    console.log('disconnect');
});
