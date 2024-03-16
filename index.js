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
    description: shapeshift_1.s.string,
    metadata: shapeshift_1.s.object({
        color: shapeshift_1.s.string,
        image: shapeshift_1.s.string
    }),
    scheme: shapeshift_1.s.string
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
        if (github.context.payload.issue.title.toLowerCase() !== "theme") {
            return;
        }
        const json = Schema.parse(JSON.parse(github.context.payload.issue.body));
        const css = json.scheme.replaceAll("\\n", "\n");
        const path = `themes/${github.context.actor}/${json.name}.css`;
        const content = await api.rest.repos.getContent({
            path,
            ref: github.context.ref,
            ...data
        }).catch(() => null);
        const sha = content ? Reflect.get(content.data, "sha") : undefined;
        const created = await api.rest.repos.createOrUpdateFileContents({
            path,
            sha,
            content: Buffer.from(css, "utf-8").toString("base64"),
            message: `New theme by ${github.context.actor}`,
            branch: github.context.ref,
            ...data
        });
        // https://raw.githubusercontent.com/Plinkie03/my-workflow-testing/main/themes/@BotForge/Dark.css
        Reflect.set(json, "cssUrl", `https://raw.githubusercontent.com/${data.owner}/${data.repo}/${github.context.ref}/${path}`);
        Reflect.set(json, "avatarUrl", github.context.payload.sender.avatar_url);
        Reflect.set(json, "username", github.context.payload.sender.login);
        Reflect.deleteProperty(json, "scheme");
        const themes = await api.rest.repos.getContent({
            ...data,
            ref: github.context.ref,
            path: "themes.json"
        }).then(x => x.data);
        if (!("type" in themes) || themes.type !== "file")
            throw "Not a file";
        const jsonThemes = JSON.parse(Buffer.from(themes.content, "base64").toString("utf-8"));
        if (sha) {
            const index = jsonThemes.findIndex(x => x.name === json.name && github.context.actor === x.username);
            jsonThemes[index] = json;
        }
        else {
            jsonThemes.push(json);
        }
        await api.rest.repos.createOrUpdateFileContents({
            path: themes.path,
            content: Buffer.from(JSON.stringify(jsonThemes), "utf-8").toString("base64"),
            message: `${sha ? "Updated" : "Created"} theme by ${github.context.actor}`,
            branch: github.context.ref,
            sha: themes.sha,
            ...data
        });
        await send(`${sha ? "Updated" : "Created"} theme!`);
        await close();
    }
    catch (error) {
        await send(error.message ?? error);
        await close();
        core.setFailed(error.message ?? error);
    }
}
main();
