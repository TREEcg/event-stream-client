import {createLogger, format, transports} from "winston";

/***************************************
 * Title: Logger
 * Description: Simple logger class
 * Author: Wout Slabbinck (wout.slabbinck@ugent.be)
 * Created on 02/12/2021
 *****************************************/

export class Logger {
    private readonly logger;

    constructor(loggable: Instance | string, level: LogLevel |undefined) {
        const label = typeof loggable === 'string' ? loggable : loggable.constructor.name;
        level = level && isLogLevel(level.toLowerCase()) ? level.toLowerCase() : 'info'

        this.logger = createLogger({
            level: level,
            format: format.combine(
                format.colorize(),
                format.label({label}),
                format.timestamp(),
                format.printf(({
                                   level: levelInner,
                                   message,
                                   label: labelInner,
                                   timestamp
                               }: Record<string, any>): string =>
                    `${timestamp} [${labelInner}] ${levelInner}: ${message}`),
            ),
            transports: [new transports.Console()],
        });
    }

    public log(level: LogLevel, message: string): void {
        this.logger.log(level, message);
    }

    public error(message: string): void {
        this.log('error', message);
    }


    public warn(message: string): void {
        this.log('warn', message);
    }


    public info(message: string): void {
        this.log('info', message);
    }


    public verbose(message: string): void {
        this.log('verbose', message);
    }


    public debug(message: string): void {
        this.log('debug', message);
    }


    public silly(message: string): void {
        this.log('silly', message);
    }

}

const logLevels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly']
export type LogLevel = typeof logLevels[number];

export function isLogLevel(value: string): value is LogLevel {
    return logLevels.includes(value as LogLevel)
}

interface Instance {
    constructor: { name: string };
}
