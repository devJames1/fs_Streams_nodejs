// encryption/decryption => crypto module
// hashing-salting => crypto module
// compression => zlib module
// decoding/encoding => buffer module (only text-encoding/decoding in default nodejs no image other types)

const { Transform } = require("node:stream");
const fs = require("node:fs/promises");

class Encrypt extends Transform {
    constructor(totalBytes) {
        super();
        this.totalBytes = totalBytes;
        this.processedBytes = 0;
        this.progressSteps = [25, 50, 75, 100];
        this.currentStep = 0;
    }


    _transform(chunk, encoding, callback) {

        //Add 1 to encrypt if value is not 255. Since we don't touch 255 as it is the highest value a byte can carry
        for (let i = 0; i < chunk.length; i++) {
            if (chunk[i] !== 255) {
                chunk[i] = chunk[i] + 1
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
    const readFileHandle = await fs.open("read.txt", "r");
    const writeFileHandle = await fs.open("encrypted.txt", "w");

    const readStream = readFileHandle.createReadStream();
    const writeStream = writeFileHandle.createWriteStream();

    //get the file size for progress tracking
    const stats = await fs.stat("read.txt");
    const totalBytes = stats.size

    const encrpt = new Encrypt(totalBytes);

    readStream.pipe(encrpt).pipe(writeStream);

    readStream.on("end", async () => {
        console.log("Encryption complete");
        await readFileHandle.close();
        await writeFileHandle.close();
    });
})()
