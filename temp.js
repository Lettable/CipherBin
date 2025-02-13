import { createBrotliCompress, createBrotliDecompress, constants } from 'zlib';
import { Buffer } from 'buffer';

const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const CHUNK_SIZE = 64 * 1024;

/**
 * Encodes a Buffer into a Base62 string.
 * @param {Buffer} buffer - The input buffer.
 * @returns {string} The Base62-encoded string.
 */
function base62Encode(buffer) {
  let bigInt = BigInt('0x' + buffer.toString('hex'));
  let encoded = '';
  while (bigInt > 0n) {
    encoded = BASE62[Number(bigInt % 62n)] + encoded;
    bigInt = bigInt / 62n;
  }
  return encoded;
}

/**
 * Decodes a Base62 string back into a Buffer.
 * @param {string} encoded - The Base62 string.
 * @returns {Buffer} The decoded Buffer.
 */
function base62Decode(encoded) {
  let bigInt = 0n;
  for (const char of encoded) {
    bigInt = bigInt * 62n + BigInt(BASE62.indexOf(char));
  }
  let hex = bigInt.toString(16);
  if (hex.length % 2) {
    hex = '0' + hex;
  }
  return Buffer.from(hex, 'hex');
}

/**
 * Compresses and encodes a string using Brotli at maximum quality,
 * then converts the compressed data to a Base62-encoded string.
 * @param {string} content - The string to compress.
 * @returns {Promise<string>} A promise resolving to the Base62 encoded compressed string.
 */
export async function compressEncode(content) {
  return new Promise((resolve, reject) => {
    const brotliOptions = {
      params: {
        [constants.BROTLI_PARAM_QUALITY]: 11, // Maximum compression
      },
    };
    const compress = createBrotliCompress(brotliOptions);
    const chunks = [];

    compress.on('data', (chunk) => chunks.push(chunk));
    compress.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const result = base62Encode(buffer);
      resolve(result);
    });
    compress.on('error', reject);

    let offset = 0;
    const writeNextChunk = () => {
      while (offset < content.length) {
        const chunk = content.slice(offset, offset + CHUNK_SIZE);
        offset += CHUNK_SIZE;
        if (!compress.write(chunk)) {
          compress.once('drain', writeNextChunk);
          return;
        }
      }
      compress.end();
    };
    writeNextChunk();
  });
}

/**
 * Decodes and decompresses a Base62 encoded string back to the original text.
 * @param {string} encoded - The Base62 encoded compressed string.
 * @returns {Promise<string>} A promise resolving to the original string.
 */
export async function decompressDecode(encoded) {
  return new Promise((resolve, reject) => {
    const buffer = base62Decode(encoded);
    const decompress = createBrotliDecompress();
    const chunks = [];

    decompress.on('data', (chunk) => chunks.push(chunk));
    decompress.on('end', () => {
      resolve(Buffer.concat(chunks).toString());
    });
    decompress.on('error', reject);

    let offset = 0;
    const writeNextChunk = () => {
      while (offset < buffer.length) {
        const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
        offset += CHUNK_SIZE;
        if (!decompress.write(chunk)) {
          decompress.once('drain', writeNextChunk);
          return;
        }
      }
      decompress.end();
    };
    writeNextChunk();
  });
}

// // Example usage:
// async function main() {
//   // Highly compressible input (e.g., 14k repeated characters)
//   const largeContent = 'eyJjb250ZW50IjoiYVcxd2IzSjBJSHNnWTNKbFlYUmxSR1ZtYkdGMFpTd2dZM0psWVhSbFNXNW1iR0YwWlNCOUlHWnliMjBnSjNwc2FXSW5Pd3BwYlhCdmNuUWdleUJDZFdabVpYSWdmU0JtY205dElDZGlkV1ptWlhJbk93b0tMeThnUW1GelpUWXlJRVZ1WTI5a2FXNW5JRU52Ym1acFozVnlZWFJwYjI0S1kyOXVjM1FnUWtGVFJUWXlJRDBnSWpBeE1qTTBOVFkzT0RsQlFrTkVSVVpIU0VsS1MweE5UazlRVVZKVFZGVldWMWhaV21GaVkyUmxabWRvYVdwcmJHMXViM0J4Y25OMGRYWjNlSGw2SWpzS1kyOXVjM1FnUTBoVlRrdGZVMGxhU';
//   try {
//     const encoded = await compressEncode(largeContent);
//     console.log('Encoded length:', encoded.length);
//     console.log('Original length:', largeContent.length);

//     const decoded = await decompressDecode(encoded);
//     console.log('Decoded matches original:', decoded === largeContent);
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

// main();


