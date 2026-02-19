#!/usr/bin/env node
/**
 * Sync version numbers across all files
 * Run this after `npm version patch|minor|major`
 */

const fs = require('fs');
const path = require('path');

// Read version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const version = packageJson.version;

console.log(`Syncing version to: ${version}`);

// 1. Update custom-text-block.php
const phpFile = path.join(__dirname, 'custom-text-block.php');
let phpContent = fs.readFileSync(phpFile, 'utf8');
phpContent = phpContent.replace(
  /\* Version:\s+[\d.]+/,
  `* Version:           ${version}`
);
fs.writeFileSync(phpFile, phpContent);
console.log('✓ Updated custom-text-block.php');

// 2. Update readme.txt
const readmeFile = path.join(__dirname, 'readme.txt');
let readmeContent = fs.readFileSync(readmeFile, 'utf8');
readmeContent = readmeContent.replace(
  /Stable tag:\s+[\d.]+/,
  `Stable tag:        ${version}`
);
fs.writeFileSync(readmeFile, readmeContent);
console.log('✓ Updated readme.txt');

console.log('\nVersion sync complete!');
