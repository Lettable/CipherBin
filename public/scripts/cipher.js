#!/usr/bin/env node
/*
* Copyright 2025 Mirza
*
* All Rights Reserved.
*
* This code is proprietary and confidential. No part of this code may be used, copied, modified, or distributed without the express written permission of Mirza.
*
* For inquiries, please contact: t.me/mirzyave
*/

import crypto from 'crypto';
import { Buffer } from 'buffer';

function printUsage() {
  console.error(`Usage:
  paste -c "<content>" [-p <true|false>] [-s "<password>"] [-e "<expiration>"] [-h "<host>"]

Options:
  -c   Content (required). For multi-line content, use \n in the string.
  -p   isPublic flag (true or false, default is true).
  -s   Password (required if -p is false).
  -e   Expiration date (optional, e.g. 2025-02-12T11:22:33Z; default is "9999-12-31T23:59:59Z").
  -h   Host URL (optional, default is "https://cipher.ix.tc/").
`);
  process.exit(1);
}

// --- Parse command-line arguments ---
const args = process.argv.slice(2);
let isPublic = true;
let password = "";
let content = "";
let expiresAt = "9999-12-31T23:59:59Z";
let host = "https://cipher.ix.tc/";

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  switch (arg) {
    case "-p":
      if (i + 1 >= args.length) {
        console.error("Error: Missing value for -p");
        printUsage();
      }
      isPublic = args[++i].toLowerCase() === "true";
      break;
    case "-s":
      if (i + 1 >= args.length) {
        console.error("Error: Missing value for -s");
        printUsage();
      }
      password = args[++i];
      break;
    case "-c":
      if (i + 1 >= args.length) {
        console.error("Error: Missing value for -c");
        printUsage();
      }
      content = args[++i];
      break;
    case "-e":
      if (i + 1 >= args.length) {
        console.error("Error: Missing value for -e");
        printUsage();
      }
      expiresAt = args[++i];
      break;
    case "-h":
      if (i + 1 >= args.length) {
        console.error("Error: Missing value for -h");
        printUsage();
      }
      host = args[++i];
      break;
    default:
      console.error(`Error: Unknown argument ${arg}`);
      printUsage();
  }
}

if (!content) {
  console.error("Error: Content (-c) is required.");
  printUsage();
}
if (!isPublic && !password) {
  console.error("Error: Password (-s) is required for private pastes.");
  printUsage();
}
if (isPublic && password) {
  console.error("Warning: Paste is marked public (-p true) but a password (-s) was provided. Ignoring password.");
}

let encodedContent;
if (isPublic) {
  encodedContent = Buffer.from(content, "utf8").toString("base64");
} else {
  const key = crypto.createHash("sha256").update(password).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(content, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  encodedContent = Buffer.concat([iv, encrypted]).toString("base64");
}

const createdAt = new Date().toISOString();

const pasteObject = {
  content: encodedContent,
  createdAt: createdAt,
  expiresAt: expiresAt,
  isPublic: isPublic,
  syntax: "plaintext"
};

const jsonStr = JSON.stringify(pasteObject);
const hmacKey = isPublic
  ? Buffer.from("public-secret", "utf8")
  : crypto.createHash("sha256").update(password).digest();
const signature = crypto.createHmac("sha256", hmacKey).update(jsonStr).digest("base64");

pasteObject.signature = signature;

const finalEncoded = Buffer.from(JSON.stringify(pasteObject), "utf8").toString("base64");

console.log(host + finalEncoded);
