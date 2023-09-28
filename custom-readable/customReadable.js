const { Readable } = require("node:stream");
const fs = require("node:fs");

class FileReadStream extends Readable {
    constructor({ highWaterMark, fileName }) {
        super({ highWaterMark });
        this.fileName = fileName;
        this.fd = null;
    }

    _construct(callback) {
        fs.open(this.fileName, "r", (err, fd) => {
            if (err) {
                return callback(err)
            }
            this.fd = fd;
            callback();
        })
    }

    _read(size) {
        const buff = Buffer.alloc(size)
        fs.read(this.fd, buff, 0, size, null, (err, bytesRead) => {
            //only way to handle error here
            if (err) return this.destroy(err);
            // null isto indicate the end of the string
            this.push(bytesRead > 0 ? buff.subarray(0, bytesRead) : null) //remove the zeros or nulls we encoutered in previous example. get the bytes from 0 to the bytes read.

        })
    }

    _destroy(error, callback) {
        if (this.fd) {
            fs.close(this.fd, (err) = callback(err || error));
        } else {
            callback(error);
        }
    }
}

const stream = new FileReadStream({ fileName: "text.txt" });

stream.on("data", (chunk) => {
    console.log(chunk.toString("utf-8"));
})

stream.on("end", () => {
    console.log("stream is done reading");
})