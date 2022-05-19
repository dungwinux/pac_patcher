/**
 * The MIT License (MIT)
 * Copyright © 2022 Dung Tuan Nguyen
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const fs = require("fs");
const { Buffer } = require("buffer");
const Pac = require("./Pac");
const Srp = require("./Srp");
const KaitaiStream = require("kaitai-struct/KaitaiStream");
const assert = require("assert");
const iconvlite = require("iconv-lite");

const fileContent = fs.readFileSync(process.argv[2]);
const parsed = new Pac(new KaitaiStream(fileContent));

// Tracking new offset after patching
class CraftedChunk {
    constructor(data, relOffset, offsetSize) {
        this.data = data;
        this.relOffset = relOffset;
        this.offsetSize = offsetSize;
    }
}

function rotateUInt8Right(x, n) {
    return ((x << (8 - n)) | (x >> n)) & 0xff;
}

function decodeText(data) {
    const rot = 4;
    return Buffer.from(data).map((x) => rotateUInt8Right(x, rot));
}

// Rotation amount is 4, so they are the same
const encodeText = decodeText;

function encodeSrp(file) {
    const patch = fs.readFileSync(file);
    const patched_data = new Srp(new KaitaiStream(patch));
    let out = Buffer.alloc(patch.byteLength);
    let count = 0;
    out.writeUInt32LE(patched_data.chunkCount, count);
    count += 4;
    patched_data.chunks.forEach((chunk) => {
        out.writeUInt16LE(chunk.codeSize, count);
        count += 2;
        out.writeUInt32LE(chunk.codeData.codeType, count);
        count += 4;
        if (chunk.codeData.rawText !== undefined) {
            encodeText(iconvlite.encode(chunk.codeData.rawText, "SJIS")).copy(
                out,
                count
            );
        } else {
            encodeText(chunk.codeData.raw).copy(out, count);
        }
        count += chunk.codeSize - 4;
    });
    return out;
}

offset_change = 0;
parsed.chunks.forEach((chunk) => {
    const patched_file = chunk.name + ".srp";
    if (offset_change !== 0) {
        chunk.fileContent = new CraftedChunk(
            chunk.fileContent.data,
            chunk.fileContent.relOffset + offset_change,
            chunk.fileContent.offsetSize
        );
    }
    // Uncomment to backup original file
    // fs.writeFileSync(patched_file + ".bak", decode(chunk.fileContent.data));
    if (chunk.fileContent.cat == "srp" && fs.existsSync(patched_file)) {
        console.log(`Modifying ${chunk.name} using ${chunk.name}.srp`);
        const patched_data = encodeSrp(`${chunk.name}.srp`);
        offset_change = patched_data.byteLength - chunk.fileContent.offsetSize;
        chunk.fileContent = new CraftedChunk(
            patched_data,
            chunk.fileContent.relOffset,
            patched_data.byteLength
        );
    }
});

let counter = 0;

let patched = Buffer.alloc(fileContent.byteLength + offset_change);

console.log(`Writing Header...`);
patched.writeUInt16LE(parsed.chunkCount, counter);
counter += 2;
patched.writeUInt8(parsed.nameLength, counter);
counter += 1;
patched.writeUInt32LE(parsed.dataOffset, counter);
counter += 4;

console.log(`Writing names...`);
parsed.chunks.forEach((chunk) => {
    let new_data = Buffer.from(chunk.fileContent.data);
    // Buffer.copy
    patched.write(chunk.name, counter, parsed.nameLength);
    counter += parsed.nameLength;
    if (parsed.version === 1) {
        patched.writeUInt32LE(chunk.fileContent.relOffset, counter);
        counter += 4;
    } else if (parsed.version === 2) {
        patched.writeBigUInt64LE(BigInt(chunk.fileContent.relOffset), counter);
        counter += 8;
    }
    patched.writeUInt32LE(chunk.fileContent.offsetSize, counter);
    counter += 4;
});

assert(counter === parsed.dataOffset);
console.log(`Writing data...`);
parsed.chunks.forEach((chunk) => {
    let new_data = Buffer.from(chunk.fileContent.data);
    Buffer.from(chunk.fileContent.data).copy(patched, counter);
    counter += new_data.byteLength;
});

fs.writeFileSync(`${process.argv[2]}.patch.pac`, patched);
