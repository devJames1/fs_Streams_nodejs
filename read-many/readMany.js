//READABLE STREAMS
//Highwatermark value for createReadstream is 65kb
//Trey as much as possible to implement draining when working with streams toavoid memory issues.
const fs = require("node:fs/promises");


(async () => {
    console.time("readmany")
    const fileHandleRead = await fs.open("src.txt", "r");
    const fileHandleWrite = await fs.open("dest.txt", "w");

    //highWatermark can be set by passing the object parameter highWaterMark: size.
    const streamRead = fileHandleRead.createReadStream({ highWaterMark: 64 * 1024 });

    const streamWrite = fileHandleWrite.createWriteStream();

    let splitNum = "";

    streamRead.on("data", (chunk) => {
        const numbers = chunk.toString("utf-8").split("  ");

        if (Number(numbers[0]) !== Number(numbers[1]) - 1) {
            if (splitNum) {
                numbers[0] = splitNum.trim() + numbers[0].trim();
            }
        }

        if (Number(numbers[numbers.length - 2]) + 1 !== Number(numbers[numbers.length - 1])) {
            splitNum = numbers.pop();
        }


        numbers.forEach((number) => {
            let n = Number(number);

            if (n % 10 === 0) {
                if (!streamWrite.write(" " + n + " ")) {
                    //pause the reading stream
                    streamRead.pause();
                }

            }
        })
        // console.log(numbers);

        // console.log(splitNum);


    });

    //when data has been successfully written to underlying resource. 
    streamWrite.on("drain", () => {
        streamRead.resume();
    })

    streamRead.on("end", () => {
        console.log("Done reading.");
        console.timeEnd("readmany")
    })
})();