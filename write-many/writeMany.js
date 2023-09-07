//for promise
// const fs = require("node:fs/promises");

// Promise version

// Execution time: 1minutes 30 sec to run,
// CPU Usage: 28% of cpu
// Memory Usage: 48MB

// (async () => {
//     //how to benchmak your code
//     console.time("writeMany");
//     const fileHandle = await fs.open("file.txt", "w");

//     for (let i = 0; i < 1000000; i++) {
//         await fileHandle.write(`${i} `);
//     }
//     console.timeEnd("writeMany");
// })();



// for callbackversion include
// const fs = require("node:fs");
// Call back version that was faster.

// Execution time: 17sec to run,
// CPU Usage: 20% of cpu
// Memory Usage: 30MB
// (async () => {
//     //how to benchmak your code
//     console.time("writeMany");
//     fs.open("file.txt", "w", (err, fd) => {
//         for (let i = 0; i < 1000000; i++) {
//             const buff = Buffer.from(`${i} `, "utf-8")
//             fs.writeSync(fd, buff);
//         }

//         console.timeEnd("writeMany");
//     })
// })();



//WRITABLE STREAMS

// using streams
// const fs = require("node:fs/promises");
//DON'T DO IT THIS WAY

// Execution time: 1.3 sec
// CPU Usage: 28% of cpu
// Memory Usage: 190mb

// (async () => {
//     //how to benchmak your code
//     console.time("writeMany");
//     const fileHandle = await fs.open("file.txt", "w");

//     const stream = fileHandle.createWriteStream();

//     for (let i = 0; i < 1000000; i++) {
//         const buff = Buffer.from(`${i} `, "utf-8")
//         stream.write(buff);
//     }
//     console.timeEnd("writeMany");
// })();



///Solving the issue of memory we got in the above above scenerio
// Execution time: 9sec
// CPU Usage: 28% of cpu
// Memory Usage: 45mb

const fs = require("node:fs/promises");

(async () => {
    //     //how to benchmak your code
    console.time("writeMany");
    const fileHandle = await fs.open("file.txt", "w");

    const stream = fileHandle.createWriteStream();

    //     //this is the maximumsize of the stream internal buffer(16kb)
    //     console.log(stream.writableHighWaterMark);

    //     //Shows how much of this buffer is filled
    //     console.log(stream.writableLength);


    //8 bits = 1byte
    //1000 bytes = 1kb
    //1000 kb = 1mb

    //allocating the writableHighWaterMark = 16384 bytes or "16kb"
    // const buff = Buffer.alloc(16383, 'a');
    // console.log(stream.write(buff));
    // console.log(stream.write(Buffer.alloc(1, 'a')));
    // console.log(stream.write(Buffer.alloc(1, 'a')));
    // console.log(stream.write(Buffer.alloc(1, 'a')));

    // console.log(stream.writableLength);
    // //how to let a stream empty itself, we listen for drain event.
    // stream.on("drain", () => {
    //     console.log(stream.write(Buffer.alloc(16384, 'a')));
    //     console.log(stream.writableLength);
    //     console.log("we are now safe to add more")
    // })


    // setInterval(() => { }, 1000);

    let i = 0;
    const numberOfWrites = 1000000

    const writeMany = () => {

        while (i < numberOfWrites) {
            const buff = Buffer.from(`${i} `, "utf-8")

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

    //resume our loop once streams internal buffer is empty
    stream.on("drain", () => {
        writeMany();
    })

    //this is emitted by the stream.end method
    stream.on("finish", () => {
        console.timeEnd("writeMany");
        fileHandle.close();
    })

})();
