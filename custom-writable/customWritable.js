const { Writable } = require("node:stream");

class fileWriteStream extends Writable {
    constructor({ highWaterMark, fileName }) {
        super({ highWaterMark });

        this.fileName = fileName;
    }

    _construct(callback) {

    }

    _write(chunk, encoding, callback) {
        //do our write operation

        //when we are done call the callback operation
        callback();
    }

    _final() {

    }

    _destroy() {

    }

}

const stream = new fileWriteStream({ highWaterMark: 1800 });

stream.write(Buffer.from("this is some string"));
stream.end(Buffer.from("Our last write."));

stream.on("drain", () => {

})