const { Duplex } = require("node:stream");
const fs = require("node:fs");

class DuplexStream extends Duplex {
    constructor({
        writableHighWaterMark,
        readableHighWaterMark,
        readFileName,
        writeFileName
    }) {
        super({ writableHighWaterMark, readableHighWaterMark });
        this.readFileName = readFileName;
        this.writeFileName = writeFileName;
        this.readFd = null;
        this.writeFd = null;
        this.chunks = [];
        this.chunksSize = 0;
    }

    _construct(callback) {
        fs.open(this.readFileName, "r", (err, readFd) => {
            if (err) {
                return callback(err)
            }
            this.readFd = readFd;
            fs.open(this.writeFileName, "w", (err, writeFd) => {
                if (err) {
                    return callback(err)
                }
                this.writeFd = writeFd;
                callback();
            })
        });
    }

    _write(chunk, encoding, callback) {
        this.chunks.push(chunk);
        this.chunksSize += chunk.length;

        if (this.chunksSize > this.writableHighWaterMark) {
            fs.write(this.writeFd, Buffer.concat(this.chunks), (err) => {
                if (err) {
                    return callback(err);
                }
                this.chunks = [];
                this.chunksSize = 0;
                callback();
            })
        } else {
            //when we are done call the callback operation
            callback();
        }

    }

    _read(size) {
        const buff = Buffer.alloc(size)
        fs.read(this.readFd, buff, 0, size, null, (err, bytesRead) => {
            //only way to handle error here
            if (err) return this.destroy(err);
            // null isto indicate the end of the string
            this.push(bytesRead > 0 ? buff.subarray(0, bytesRead) : null) //remove the zeros or nulls we encoutered in previous example. get the bytes from 0 to the bytes read.

        })
    }

    _final(callback) {
        fs.write(this.writeFd, Buffer.concat(this.chunks), (err) => {
            if (err) {
                return callback(err)
            }

            this.chunks = [];
            callback();
        })
    }

    _destroy(error, callback) {
        callback(error);
    }

}


const duplex = new DuplexStream({
    readFileName: "read.txt",
    writeFileName: "write.txt"
});

duplex.write(Buffer.from("this is a string 0\n"));
duplex.write(Buffer.from("this is a string 1\n"));
duplex.write(Buffer.from("this is a string 2\n"));
duplex.write(Buffer.from("this is a string 3\n"));
duplex.end(Buffer.from("end of write."));

duplex.on("data", (chunk) => {
    console.log(chunk.toString("utf-8"));
})