//READABLE STREAMS
//Highwatermark value for createReadstream is 65kb
//Trey as much as possible to implement draining when working with streams toavoid memory issues.
const fs = require("node:fs/promises");


(async () => {

    const fileHandleRead = await fs.open("src.txt", "r");
    const fileHandleWrite = await fs.open("dest.txt", "w");

    //highWatermark can be set by passing the object parameter highWaterMark: size.
    const streamRead = fileHandleRead.createReadStream({ highWaterMark: 64 * 1024 });

    const streamWrite = fileHandleWrite.createWriteStream();

    streamRead.on("data", (chunk) => {
        const num = chunk.toString("utf-8").split(' ');
        console.log(num)
        if (!streamWrite.write(chunk)) {
            //pause the reading stream
            streamRead.pause();
        }
    });

    //when data has been successfully written to underlying resource. 
    streamWrite.on("drain", () => {
        streamRead.resume();
    })
})();