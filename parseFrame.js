export default (frameBuffer) => {
    const buffer = Buffer.from(frameBuffer);
    let maskLength = 4;
    let lengthEnd = 2;
    let keyIndex = 0;
    let total = 0;
    let data = [];

    const frameStructure = {
        fin: 1,
        fsv1: 1,
        fsv2: 1,
        fsv3: 1,
        opcode: 4,
        maskFlag: 1,
        baseLength: 7,
    }

    let frameContent = {
        fin: null,
        fsv1: null,
        fsv2: null,
        fsv3: null,
        opcode: null,
        maskFlag: null,
        baseLength: null,
    }

    const frameKeys = Object.keys(frameStructure);

    for (const key of frameKeys) {
        total += frameStructure[key];
    }

    for (let index = 0; index < total / 8; index++) {
        const binnaryChunk = buffer[index].toString(2);
        let added = 0;

        while (added < 8) {
            frameContent[frameKeys[keyIndex]] = binnaryChunk.slice(added, added + frameStructure[frameKeys[keyIndex]]);
            added += frameStructure[frameKeys[keyIndex]];
            keyIndex++;
        }
    }

    if (frameContent.baseLength == 126) {
        frameContent.baseLength = parseInt(Buffer.from(buffer.subarray(2, 4)).toString("hex"), 16);
        lengthEnd += 2;
    } else if (frameContent.baseLength == 127) {
        frameContent.baseLength = parseInt(Buffer.from(buffer.subarray(2, 10)).toString("hex"), 16);
        lengthEnd += 8;
    }

    const maskEnd = lengthEnd + maskLength;
    const mask = buffer.subarray(lengthEnd, maskEnd);
    const dataBuffer = buffer.subarray(maskEnd);

    dataBuffer.forEach((item, itemIndex) => {
        const maskItem = mask[itemIndex % 4];
        data.push(String.fromCharCode(item ^ maskItem));
    });

    frameContent.content = data.join("");

    return frameContent;
}