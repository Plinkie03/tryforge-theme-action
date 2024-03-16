"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const github = require("@actions/github");
try {
    console.log(core);
    console.log(github.context);
}
catch (error) {
    core.setFailed(error.message);
}
