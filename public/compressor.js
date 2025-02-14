import { createDeflate, createInflate } from 'zlib';
import { Buffer } from 'buffer';

const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const CHUNK_SIZE = 64 * 1024;

export async function compressEncode(content) {
  return new Promise((resolve, reject) => {
    const deflate = createDeflate({ level: 9 });
    const chunks = [];
    let result = '';

    deflate.on('data', chunk => chunks.push(chunk));
    deflate.on('end', () => {
      const buffer = Buffer.concat(chunks);
      result = base62Encode(buffer);
      resolve(result);
    });
    deflate.on('error', reject);

    let offset = 0;
    const writeNextChunk = () => {
      while (offset < content.length) {
        const chunk = content.slice(offset, offset + CHUNK_SIZE);
        offset += CHUNK_SIZE;
        if (!deflate.write(chunk)) {
          deflate.once('drain', writeNextChunk);
          return;
        }
      }
      deflate.end();
    };

    writeNextChunk();
  });
}

export async function decompressDecode(encoded) {
  return new Promise((resolve, reject) => {
    const buffer = base62Decode(encoded);
    const inflate = createInflate();
    const chunks = [];
    let result = '';

    inflate.on('data', chunk => chunks.push(chunk));
    inflate.on('end', () => {
      resolve(Buffer.concat(chunks).toString());
    });
    inflate.on('error', reject);

    let offset = 0;
    const writeNextChunk = () => {
      while (offset < buffer.length) {
        const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
        offset += CHUNK_SIZE;
        if (!inflate.write(chunk)) {
          inflate.once('drain', writeNextChunk);
          return;
        }
      }
      inflate.end();
    };

    writeNextChunk();
  });
}

function base62Encode(buffer) {
  let bigInt = BigInt('0x' + buffer.toString('hex'));
  let encoded = '';
  while (bigInt > 0n) {
    encoded = BASE62[Number(bigInt % 62n)] + encoded;
    bigInt = bigInt / 62n;
  }
  return encoded;
}

function base62Decode(encoded) {
  let bigInt = 0n;
  for (const char of encoded) {
    bigInt = bigInt * 62n + BigInt(BASE62.indexOf(char));
  }
  return Buffer.from(bigInt.toString(16), 'hex');
}

// // async function main() {
// //   const largeContent = 'A'.repeat(8263);
// //   try {
// //     const encoded = await compressEncode(largeContent);
// //     console.log('Encoded length:', encoded.length);
// //     console.log('LargeContent length:', largeContent.length);
    
// //     const decoded = await decompressDecode(encoded);
// //     console.log('Decoded matches:', decoded === largeContent);
// //   } catch (error) {
// //     console.error('Error:', error);
// //   }
// // }
