"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shapeshift_1 = require("@sapphire/shapeshift");
const core = require("@actions/core");
const github = require("@actions/github");
const data = {
    repo: github.context.repo.repo,
    owner: github.context.repo.owner,
};
const api = github.getOctokit(process.env.GITHUB_TOKEN);
const Schema = shapeshift_1.s.object({
    name: shapeshift_1.s.string,
    author: shapeshift_1.s.string,
    description: shapeshift_1.s.string,
    metadata: shapeshift_1.s.object({
        color: shapeshift_1.s.string,
        image: shapeshift_1.s.string
    }),
    scheme: shapeshift_1.s.object({
        "--primary-background": shapeshift_1.s.string,
        "--secondary-background": shapeshift_1.s.string,
        "--tertiary-background": shapeshift_1.s.string,
        "--color-alt-secondary": shapeshift_1.s.string,
        "--color-alt-light": shapeshift_1.s.string,
        "--shade-background": shapeshift_1.s.string,
        "--secondary-shade": shapeshift_1.s.string,
        "--primary-text": shapeshift_1.s.string,
        "--secondary-text": shapeshift_1.s.string,
        "--tertiary-text": shapeshift_1.s.string,
        "--colored-text": shapeshift_1.s.string,
        "--alt-text": shapeshift_1.s.string,
        "--light-gray": shapeshift_1.s.string,
        "--primary-border": shapeshift_1.s.string,
        "--secondary-border": shapeshift_1.s.string,
        "--dark-gray": shapeshift_1.s.string,
        "--tooltip-color": shapeshift_1.s.string,
        "--tooltip-text": shapeshift_1.s.string,
        "--scrollbar-thumb": shapeshift_1.s.string,
        "--scrollbar-bg": shapeshift_1.s.string
    })
});
async function send(msg) {
    await api.rest.issues.createComment({
        ...data,
        issue_number: github.context.issue.number,
        body: msg
    });
}
async function close() {
    await api.rest.issues.update({
        ...data,
        state: "closed",
        issue_number: github.context.issue.number
    });
}
async function main() {
    try {
        const json = Schema.parse(JSON.parse(github.context.payload.issue.body));
        console.log(json);
    }
    catch (error) {
        await send(error.message);
        await close();
        core.setFailed(error.message);
    }
}
main();
