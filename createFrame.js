export default (bufferData) => {
    const payload = JSON.stringify(bufferData);

    const payloadByteLength = Buffer.byteLength(payload);
    let payloadBytesOffset = 2;
    let payloadLength = payloadByteLength;

    if (payloadByteLength > 65535) {
        payloadBytesOffset += 8;
        payloadLength = 127;
    } else if (payloadByteLength > 125) {
        payloadBytesOffset += 2;
        payloadLength = 126;
    }

    const buffer = Buffer.alloc(payloadBytesOffset + payloadByteLength);
    buffer.writeUInt8(0b10000001, 0);
    buffer.writeUInt8(payloadLength, 1);

    if (payloadLength === 126) {
        buffer.writeUInt16BE(payloadByteLength, 2);
    } else if (payloadByteLength === 127) {
        buffer.writeBigUInt64BE(BigInt(payloadByteLength), 2);
    }

    buffer.write(payload, payloadBytesOffset);
    return buffer;
}