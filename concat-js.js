#!/usr/bin/env node

// const fs = require('fs')
// const path = require('path')
import fs from 'fs'
import path from 'path'
/**
 * Node.js script to concatenate all .js files in a directory
 * Usage:
 *   node concat-js.js <source-folder> <output-file> [--recursive] [--sort]
 *
 * Examples:
 *   node concat-js.js src dist/bundle.js
 *   node concat-js.js src dist/bundle.js --recursive --sort
 */

const args = process.argv.slice(2)

if (args.length < 2) {
  console.error('Usage: node concat-js.js <source-folder> <output-file> [--recursive] [--sort]')
  process.exit(1)
}

const sourceDir = path.resolve(args[0])
const outputFile = path.resolve(args[1])
const recursive = args.includes('--recursive') || args.includes('-r')
const sortFiles = args.includes('--sort')

if (!fs.existsSync(sourceDir)) {
  console.error(`Error: Source directory does not exist: ${sourceDir}`)
  process.exit(1)
}

// Collect all .js files
function getJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      if (recursive) {
        getJsFiles(filePath, fileList)
      }
    } else if (path.extname(file).toLowerCase() === '.js') {
      fileList.push(filePath)
    }
  })

  return fileList
}

let jsFiles = getJsFiles(sourceDir)

// Optional: sort files alphabetically (helpful for consistent builds)
if (sortFiles) {
  jsFiles.sort()
}

// Add header comment
let outputContent = `/*\n * Combined JavaScript files\n * Source: ${sourceDir}\n * Generated on: ${new Date().toISOString()}\n * Total files: ${
  jsFiles.length
}\n */\n\n`

// Add separator and file comment before each file
jsFiles.forEach((filePath, index) => {
  const relativePath = path.relative(sourceDir, filePath)
  const content = fs.readFileSync(filePath, 'utf8')

  outputContent += `/* ===== ${relativePath} ===== */\n`
  outputContent += content

  // Add newline between files (unless it's the last one)
  if (index < jsFiles.length - 1) {
    outputContent += '\n\n'
  }
})

// Write the final concatenated file
fs.writeFileSync(outputFile, outputContent, 'utf8')

console.log(`✅ Successfully concatenated ${jsFiles.length} JavaScript file(s)`)
console.log(`📁 Source: ${sourceDir}`)
console.log(`💾 Output: ${outputFile}`)
if (jsFiles.length > 0) {
  console.log(`\nFirst few files included:`)
  jsFiles.slice(0, 10).forEach((f) => {
    console.log(`   • ${path.relative(sourceDir, f)}`)
  })
  if (jsFiles.length > 10) console.log(`   ... and ${jsFiles.length - 10} more`)
}
