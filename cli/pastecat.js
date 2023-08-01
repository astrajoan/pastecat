#!/usr/bin/env node

import * as os from 'os';
import * as fs from 'fs/promises';
import { Command } from 'commander/esm.mjs';
import chalk from 'chalk';
import axios from 'axios';

import {
  getPasteCollection,
  getPaste,
  storePaste,
  verifyCredential,
} from 'pastecat-utils/firebase.js';
import { getAutoLanguage } from 'pastecat-utils/language.js';
import { googleApiConfig } from 'pastecat-utils/config.js';

const program = new Command();
program.name('pastecat');

const log = console.log;
const success = chalk.green;
const link = chalk.cyan;
const err = chalk.bold.red;
const warn = chalk.hex('#FFA500');
const it = chalk.italic;

var stdinMsg = "";

// common utility functions
const logSuccess = (pasteId) => {
    log("Upload success! Store your ID: " + success(pasteId) + " for viewing.");
    log("View in your browser: " + "https://pastecat.io/?p=" + pasteId);
};

const delay = async (time) => {
    return new Promise(resolve => setTimeout(resolve, time * 1000));
};

// action handles
const handleGetPaste = async (pasteId, options) => {
    // TODO?: change to get multiple docs from collection
    if (!pasteId) {
        throw new Error("Paste ID cannot be empty!");
    }
    const pasteData = await getPasteCollection(pasteId);

    const name = pasteData.pasteName;
    const language = pasteData.language;
    const value = await getPaste(pasteId, name);

    const content = value.content;
    if (!options.print) {
        await fs.writeFile(name, content);
        log(success("File has been saved to: " + it(name) + "!"));
    } else {
        process.stdout.write(content + "\n");
    }
};

const handleStorePaste = async (filepath, options) => {
    await loginFirebase();

    const content = await fs.readFile(filepath, 'utf8');
    const name = filepath.split('/').pop();
    const lang = options.language ? options.language : getAutoLanguage(name);
    const pasteId = await storePaste(name, lang, content);
    logSuccess(pasteId);
};

const handleStorePasteFromStdin = async (content, options) => {
    await loginFirebase();

    const lang = options.language ? options.language : 'plaintext';
    const name = options.pastename ? options.pastename : "untitled_pastecat";
    const pasteId = await storePaste(name, lang, content);
    logSuccess(pasteId);
};

const pollForToken = async (deviceCode, time, maxRetries) => {
    let poll;
    for (let retries = 0; retries < maxRetries; ++retries) {
        try {
            await delay(time);
            poll = await axios({
                method: 'post',
                url: 'https://oauth2.googleapis.com/token',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                params: {
                    ...googleApiConfig,
                    code: deviceCode,
                    grant_type: 'http://oauth.net/grant_type/device/1.0',
                },
            });
            return poll;
        } catch (error) {
            if (retries === maxRetries - 1) throw error;
        }
    }
};

const loginFirebase = async () => {
    try {
        const filename = os.homedir() + '/.pastecat.json';
        const data = await fs.readFile(filename, 'utf8');
        const tokens = JSON.parse(data);
        const refreshToken = tokens.refresh_token;
        const response = await axios({
            method: 'post',
            url: 'https://oauth2.googleapis.com/token',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            params: {
                ...googleApiConfig,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            },
        });
        const idToken = response.data.id_token;
        await verifyCredential(idToken);
    } catch (error) {
        log(warn("Please run pastecat init to refresh your tokens!"));
        throw(error);
    }
};

const handleInit = async () => {
    const response = await axios({
        method: 'post',
        url: 'https://oauth2.googleapis.com/device/code',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        params: {
            client_id: googleApiConfig.client_id,
            scope: 'email profile',
        },
    });
    const userCode = response.data.user_code;
    const verifyUrl = response.data.verification_url;
    const deviceCode = response.data.device_code;
    const interval = response.data.interval;
    const expiration = response.data.expires_in;

    log("Enter code: " + success(userCode) + " at " + link(verifyUrl));
    log("to verify your account.");

    const maxRetries = expiration / interval;
    const poll = await pollForToken(deviceCode, interval, maxRetries);
    const refreshToken = poll.data.refresh_token;
    
    const filename = os.homedir() + '/.pastecat.json';
    const content = JSON.stringify({ refresh_token: refreshToken });
    await fs.writeFile(filename, content);
};

// commands
const getPasteCatCommand = () => {
    const get = new Command('get');
    get
        .description('download from pastecat')
        .argument('<pasteId>', 'id to download pastecat from')
        .option('-p, --print',
            'if provided, paste will be sent to stdout instead of being saved')
        .action(async (pasteId, options) => {
            await handleGetPaste(pasteId, options);
        });
    return get;
};

const storePasteCatCommand = () => {
    const store = new Command('store');
    store
        .description('upload file to pastecat')
        .argument('[filepath]', 'path to file to upload to pastecat')
        .option('-l, --language <string>',
            'code file language, auto populated if not provided')
        .option('-n, --pastename <string>',
            'name of the paste file, untitled if not provided')
        .action(async (filepath, options) => {
            if (stdinMsg) await handleStorePasteFromStdin(stdinMsg, options);
            else await handleStorePaste(filepath, options);
        });
    return store;
};

const initPasteCatCommand = () => {
    const init = new Command('init');
    init
        .description('initialize your login credential with Google')
        .action(async () => await handleInit());
    return init;
};

program.addCommand(getPasteCatCommand());    
program.addCommand(storePasteCatCommand());
program.addCommand(initPasteCatCommand());

try {
    if (process.stdin.isTTY) {
        await program.parseAsync(process.argv);
        process.exit(0);
    } else {
        process.stdin.on('readable', async () => {
            const chunk = process.stdin.read();
            if (chunk !== null) stdinMsg += chunk;
        });
        process.stdin.on('end', async () => {
            await program.parseAsync(process.argv);
            process.exit(0);
        });
    }
} catch (error) {
    log(err(error));
    process.exit(1);
}
