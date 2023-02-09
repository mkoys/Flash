import http from "http";
import crypto from "crypto";

import parseFrame from "./parseFrame.js";
import createFrame from "./createFrame.js";

class Flash {
    constructor({ server = http.createServer() } = {}) {
        this.server = server;
        this.magic = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
        this.map = new Map();
        this.handshake = () => { };
        this.connections = [];
        this.disconnections = [];
    }

    #createHash(key) {
        const sha1 = crypto.createHash('sha1');
        sha1.update(key + this.magic);
        const hash = new Buffer.from(sha1.digest()).toString("base64");
        return hash;
    }

    #handshake(socket, hash) {
        const headers = [
            'HTTP/1.1 101 Web Socket Protocol Handshake',
            'Upgrade: WebSocket',
            'Connection: Upgrade',
            `Sec-WebSocket-Accept: ${hash}`
        ]

        socket.write(headers.concat("\r\n").join("\r\n"));
    }

    #event(type, callback) {
        const foundStack = this.map.get(type);

        if (foundStack) {
            const newStack = [...found, callback];
            this.map.set(type, newStack);
        } else {
            this.map.set(type, [callback]);
        }
    }

    init() {
        this.server.on('upgrade', (request, socket) => {
            const hash = this.#createHash(request.headers["sec-websocket-key"]);
            socket.decline = () => socket.end();

            socket.accept = () => {
                this.#handshake(socket, hash);
                for (const connection of this.connections) {
                    connection(request, socket);
                }
            }

            socket.event = (type, callback) => this.#event(type, callback);
            socket.send = (message) => socket.write(createFrame(message));

            this.handshake(request, socket);

            socket.on("data", (frameData) => {
                const parsedFrame = parseFrame(frameData);
                let data = null;

                if(parseInt(parsedFrame.opcode, 2) == 8) {
                    return socket.end();
                }

                try { data = JSON.parse(parsedFrame.content) }
                catch (error) { console.log("Cant parse frame to JSON") }

                if (data?.type && data?.content) {
                    if (this.map.has(data.type)) {
                        const handlers = this.map.get(data.type);
                        for (const handler of handlers) { handler(data.content) }
                    }
                } else {
                    console.log("No data type specified");
                }
            });

            socket.on("end", () => {
                for (const disconnections of this.disconnections) {
                    disconnections(request, socket);
                }
            });
        });
    }

    event(type, callback) {
        switch (type) {
            case "handshake":
                this.handshake = callback;
                break;
            case "connection":
                this.connections.push(callback);
                break;
            default:
                break;
        }
    }

    listen(port, callback) {
        this.server.listen(port, callback);
    }
}

export default (args) => new Flash(args);