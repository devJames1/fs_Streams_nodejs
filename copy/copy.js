const fs = require('node:fs/promises');


//Space
//Speed
// Memory usage is high
//time is faster
// (async () => {
//     const destFile = await fs.open("text-copy.txt", 'w');
//     const result = await fs.readFile("src.txt");

//     await destFile.write(result);

// })()



//creating our custom stream.
//memeory usage is good
//time is fair
// (async () => {
//     console.time("copy");

//     const srcFile = await fs.open("src.txt", "r");
//     const destFile = await fs.open("text-copy.txt", "w");

//     let bytesRead = -1;

//     while (bytesRead !== 0) {
//         const readResult = await srcFile.read();
//         bytesRead = readResult.bytesRead;
//         console.log(readResult)
//         if (bytesRead !== 16384) {
//             //returns the first zero that happens in our buffer
//             const indexOfNotFilled = readResult.buffer.indexOf(0);
//             const newBuffer = Buffer.alloc(indexOfNotFilled);
//             readResult.buffer.copy(newBuffer, 0, 0, indexOfNotFilled);
//             destFile.write(newBuffer);
//         } else {
//             destFile.write(readResult.buffer);
//         }
//     }

//     console.timeEnd("copy");
// })()



//Using streams.
//memeory
//time
(async () => {
    console.time("copy");

    const srcFile = await fs.open("src.txt", "r");
    const destFile = await fs.open("text-copy.txt", "w");

    let bytesRead = -1;

    while (bytesRead !== 0) {
        const readResult = await srcFile.read();
        bytesRead = readResult.bytesRead;
        console.log(readResult)
        if (bytesRead !== 16384) {
            //returns the first zero that happens in our buffer
            const indexOfNotFilled = readResult.buffer.indexOf(0);
            const newBuffer = Buffer.alloc(indexOfNotFilled);
            readResult.buffer.copy(newBuffer, 0, 0, indexOfNotFilled);
            destFile.write(newBuffer);
        } else {
            destFile.write(readResult.buffer);
        }
    }

    console.timeEnd("copy");
})()