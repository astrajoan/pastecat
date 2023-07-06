#!/usr/bin/env node

// import { createRequire } from "module";
// const require = createRequire(import.meta.url);

import * as fs from 'fs/promises';
// const { Command } = require('commander');
import { Command } from 'commander/esm.mjs';

import chalk from 'chalk';

import { getPasteCollection, getPaste, storePaste } from 'pastecat-utils';

const program = new Command();
const log = console.log;
const success = chalk.green;
const err = chalk.bold.red;
const warn = chalk.hex('#FFA500');
const it = chalk.italic;

var stdinMsg = '';
program.name('pastecat');

// common utility functions
function logSuccess (pasteId) {
    log("Upload success! Store your ID: " + success(pasteId) + " for viewing.");
    log("View in your browser: " + "https://pastecat.io/?p=" + pasteId);
}

// action handles
async function handleGetPaste (pasteId) {
    // TODO?: change to get multiple docs from collection
    if (!pasteId) {
        throw new Error("Paste ID cannot be empty!");
    }
    const pasteData = await getPasteCollection(pasteId);

    const name = pasteData.pasteName;
    const language = pasteData.language;
    const value = await getPaste(pasteId, name);

    const content = value.content;
    await fs.writeFile(name, content);
    log(chalk.green("File has been saved to: " + it(name) + "!"));
}

async function handleStorePaste (filepath, options) {
    const content = await fs.readFile(filepath, 'utf8');
    const name = filepath.split('/').pop();
    const lang = options.language? options.language : name.split('.').pop();
    const pasteId = await storePaste(name, lang, content);
    logSuccess(pasteId);
}

async function handleStorePasteFromStdin (content, options) {
    const lang = options.language? options.language : 'plaintext';
    const name = options.pastename? options.pastename : "untitled_pastecat";
    const pasteId = await storePaste(name, lang, content);
    logSuccess(pasteId);
}

// commands
function getPasteCatCommand () {
    const get = new Command('get');
    get
        .description('download from pastecat')
        .argument('<pasteId>', 'id to download pastecat from')
        .action(async function (pasteId) { await handleGetPaste(pasteId) });
    return get;
}

function storePasteCatCommand () {
    const store = new Command('store');
    store
        .description('upload file to pastecat')
        .argument('[filepath]', 'path to file to upload to pastecat')
        .option('-l, --language <string>',
            'code file language, auto populated if not provided')
        .option('-n, --pastename <string>',
            'name of the paste file, untitled if not provided')
        .action(async function (filepath, options) {
            if (stdinMsg) {
                const content = stdinMsg;
                await handleStorePasteFromStdin(content, options);
            } else await handleStorePaste(filepath, options);
        });
    return store;
}


program.addCommand(getPasteCatCommand());    
program.addCommand(storePasteCatCommand());


try {
    if (process.stdin.isTTY) {
        await program.parseAsync(process.argv);
        process.exit(0);
    } else {
        process.stdin.on('readable', function () {
            const chunk = this.read();
            if (chunk !== null) stdinMsg += chunk;
        });
        process.stdin.on('end', async function () {
            await program.parseAsync(process.argv);
            process.exit(0);
        });
    }
} catch (e) {
    log(err(e));
    process.exit(1);
}
