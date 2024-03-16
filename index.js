"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const github = require("@actions/github");
async function main() {
    try {
        const api = github.getOctokit(process.env.GITHUB_TOKEN);
        await api.rest.issues.createComment({
            body: "Hello from node!",
            issue_number: github.context.issue.number,
            owner: github.context.repo.owner,
            repo: github.context.repo.repo
        });
        await api.rest.issues.update({
            state: "closed",
            issue_number: github.context.issue.number,
            repo: github.context.repo.repo,
            owner: github.context.repo.owner
        });
    }
    catch (error) {
        core.setFailed(error.message);
    }
}
main();
