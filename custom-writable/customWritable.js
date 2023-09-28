const { Writable } = require("node:stream");
const fs = require("node:fs");


class fileWriteStream extends Writable {
    constructor({ highWaterMark, fileName }) {
        super({ highWaterMark });

        this.fileName = fileName;
        this.fd = null;
        this.chunks = [];
        this.chunksSize = 0;
        this.writesCount = 0;
    }

    // this will run after the constructor, and it will put off calling all the other methods until we call the callback func
    _construct(callback) {
        fs.open(this.fileName, 'w', (err, fd) => {
            if (err) {
                // so if we call the callback with an argument, it means we have error and we should not proceed
                callback(err)
            } else {
                this.fd = fd;
                //no argument means it was successful
                callback();
            }
        })

    }

    _write(chunk, encoding, callback) {
        this.chunks.push(chunk);
        this.chunksSize += chunk.length;

        if (this.chunksSize > this.writableHighWaterMark) {
            fs.write(this.fd, Buffer.concat(this.chunks), (err) => {
                if (err) {
                    return callback(err);
                }
                this.chunks = [];
                this.chunksSize = 0;
                ++this.writesCount;
                callback();
            })
        } else {
            //when we are done call the callback operation
            callback();
        }

    }

    _final(callback) {
        fs.write(this.fd, Buffer.concat(this.chunks), (err) => {
            if (err) {
                return callback(err)
            }

            this.chunks = [];
            ++this.writesCount;
            callback();
        })
    }

    _destroy(error, callback) {
        console.log("Number of writes:", this.writesCount);
        if (this.fd) {
            fs.close(this.fd, (err) => {
                callback(err || error);
            })
        } else {
            callback(error);
        }
    }

}



//TESTING OUR CUSTOM STREAM CLASS
(async () => {
    //     //how to benchmak your code
    console.time("writeMany");

    const stream = new fileWriteStream({ fileName: "text.txt" });



    let i = 0;
    const numberOfWrites = 1000000;

    const writeMany = () => {

        while (i < numberOfWrites) {
            const buff = Buffer.from(` ${i} `, "utf-8")

            //this is last write
            if (i === numberOfWrites - 1) {
                return stream.end(buff)
            }

            //if stream.write returns false stop the loop
            if (!stream.write(buff))
                break;

            i++;
        }
    }

    writeMany();

    let d = 0;
    //resume our loop once streams internal buffer is empty
    stream.on("drain", () => {
        ++d;
        writeMany();
    })

    //this is emitted by the stream.end method
    stream.on("finish", () => {
        console.log("number of drains:", d)
        console.timeEnd("writeMany");
        // fileHandle.close();
    })

})();
