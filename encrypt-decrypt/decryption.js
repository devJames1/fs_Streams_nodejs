// encryption/decryption => crypto module
// hashing-salting => crypto module
// compression => zlib module
// decoding/encoding => buffer module (only text-encoding/decoding in default nodejs no image other types)

const { Transform } = require("node:stream");
const fs = require("node:fs/promises");

class Decrypt extends Transform {

    constructor(totalBytes) {
        super();
        this.totalBytes = totalBytes;
        this.processedBytes = 0;
        this.progressSteps = [25, 50, 75, 100];
        this.currentStep = 0;
    }

    _transform(chunk, encoding, callback) {

        //Suntract 1 to decrypt if value is not 255. Snce we didn't touch 255 values while encrypting
        for (let i = 0; i < chunk.length; i++) {
            if (chunk[i] !== 255) {
                chunk[i] = chunk[i] - 1
            }
        }
        this.processedBytes += chunk.length;

        const progress = (this.processedBytes / this.totalBytes) * 100;

        // Check if the progress reaches the next milestone
        if (progress >= this.progressSteps[this.currentStep]) {
            console.log(`Progress: ${this.progressSteps[this.currentStep]}%`);
            this.currentStep++;
        }

        this.push(chunk);
        callback();
    }
}

// 52 !== '52'

//<34, ff, a4, 11, 22 ...>

(async () => {
    const readFileHandle = await fs.open("encrypted.txt", "r");
    const writeFileHandle = await fs.open("decrypted.txt", "w");

    const readStream = readFileHandle.createReadStream();
    const writeStream = writeFileHandle.createWriteStream();

    //get the file size for progress tracking
    const stats = await fs.stat("encrypted.txt");
    const totalBytes = stats.size

    const decrypt = new Decrypt(totalBytes);

    readStream.pipe(decrypt).pipe(writeStream);

    readStream.on("end", async () => {
        console.log("Decryption complete");
        await readFileHandle.close();
        await writeFileHandle.close();
    });
})()
