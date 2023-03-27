import { Readable as StreamReadable } from 'stream';

export function stream2Array<T>(stream: StreamReadable): Promise<Array<T>> {
    return new Promise((resolve, reject) => {
        const array: T[] = [];
        stream.on('data', (data: T) => {
            array.push(data);
        }).on('end', () => resolve(array))
            .on('error', (err: Error) => reject(err))
    });
};

export function stream2String(stream: StreamReadable): Promise<string> {
    return new Promise((resolve, reject) => {
        let text: string = '';
        stream.on('data', (data) => {
            text += data?.toString();
        }).on('end', () => resolve(text))
            .on('error', (err: Error) => reject(err))
    });
};