import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { Logger } from '../../../logger/logger';
import { LogLevel } from './logger-strategy.interface';
import { StdoutLoggerStrategy } from './stdout-logger.strategy';

describe('StdoutLogger', () => {
	let stdoutSpy: Mock;

	beforeEach(() => {
		stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		(Logger as any).setLoggerStrategy(undefined);
	});

	it('Only logs messages of level Error to stdout when log level is set to Error', () => {
		Logger.setLoggerStrategy(
			new StdoutLoggerStrategy({
				logLevel: LogLevel.Error,
			}),
		);

		Logger.debug('Debug');
		expect(stdoutSpy).toHaveBeenCalledTimes(0);

		Logger.verbose('Verbose');
		expect(stdoutSpy).toHaveBeenCalledTimes(0);

		Logger.info('Info');
		expect(stdoutSpy).toHaveBeenCalledTimes(0);

		Logger.warn('Warn');
		expect(stdoutSpy).toHaveBeenCalledTimes(0);

		Logger.error('Error');
		expect(stdoutSpy).toHaveBeenCalledTimes(1);
		expect(stdoutSpy.mock.calls[0][0]).toContain('Error');
	});

	it('Only logs messages of levels Warn, and Error to stdout when log level is set to Warn', () => {
		Logger.setLoggerStrategy(
			new StdoutLoggerStrategy({
				logLevel: LogLevel.Warn,
			}),
		);

		Logger.debug('Debug');
		expect(stdoutSpy).toHaveBeenCalledTimes(0);

		Logger.verbose('Verbose');
		expect(stdoutSpy).toHaveBeenCalledTimes(0);

		Logger.info('Info');
		expect(stdoutSpy).toHaveBeenCalledTimes(0);

		Logger.warn('Warn');
		expect(stdoutSpy).toHaveBeenCalledTimes(1);
		expect(stdoutSpy.mock.calls[0][0]).toContain('Warn');

		Logger.error('Error');
		expect(stdoutSpy).toHaveBeenCalledTimes(2);
		expect(stdoutSpy.mock.calls[1][0]).toContain('Error');
	});

	it('Only logs messages of levels Info, Warn, and Error to stdout when log level is set to Info', () => {
		Logger.setLoggerStrategy(
			new StdoutLoggerStrategy({
				logLevel: LogLevel.Info,
			}),
		);

		Logger.debug('Debug');
		expect(stdoutSpy).toHaveBeenCalledTimes(0);

		Logger.verbose('Verbose');
		expect(stdoutSpy).toHaveBeenCalledTimes(0);

		Logger.info('Info');
		expect(stdoutSpy).toHaveBeenCalledTimes(1);
		expect(stdoutSpy.mock.calls[0][0]).toContain('Info');

		Logger.warn('Warn');
		expect(stdoutSpy).toHaveBeenCalledTimes(2);
		expect(stdoutSpy.mock.calls[1][0]).toContain('Warn');

		Logger.error('Error');
		expect(stdoutSpy).toHaveBeenCalledTimes(3);
		expect(stdoutSpy.mock.calls[2][0]).toContain('Error');
	});

	it('Only logs messages of levels Warn, Error, Info, and Verbose to stdout when log level is set to Verbose', () => {
		Logger.setLoggerStrategy(
			new StdoutLoggerStrategy({
				logLevel: LogLevel.Verbose,
			}),
		);

		Logger.debug('Debug');
		expect(stdoutSpy).toHaveBeenCalledTimes(0);

		Logger.info('Info');
		expect(stdoutSpy).toHaveBeenCalledTimes(1);
		expect(stdoutSpy.mock.calls[0][0]).toContain('Info');

		Logger.warn('Warn');
		expect(stdoutSpy).toHaveBeenCalledTimes(2);
		expect(stdoutSpy.mock.calls[1][0]).toContain('Warn');

		Logger.error('Error');
		expect(stdoutSpy).toHaveBeenCalledTimes(3);
		expect(stdoutSpy.mock.calls[2][0]).toContain('Error');

		Logger.verbose('Verbose');
		expect(stdoutSpy).toHaveBeenCalledTimes(4);
		expect(stdoutSpy.mock.calls[3][0]).toContain('Verbose');
	});

	it('Logs messages of all levels to stdout when log level is set to Debug', () => {
		Logger.setLoggerStrategy(
			new StdoutLoggerStrategy({
				logLevel: LogLevel.Debug,
			}),
		);

		Logger.info('Info');
		expect(stdoutSpy).toHaveBeenCalledTimes(1);
		expect(stdoutSpy.mock.calls[0][0]).toContain('Info');

		Logger.warn('Warn');
		expect(stdoutSpy).toHaveBeenCalledTimes(2);
		expect(stdoutSpy.mock.calls[1][0]).toContain('Warn');

		Logger.error('Error');
		expect(stdoutSpy).toHaveBeenCalledTimes(3);
		expect(stdoutSpy.mock.calls[2][0]).toContain('Error');

		Logger.debug('Debug');
		expect(stdoutSpy).toHaveBeenCalledTimes(4);
		expect(stdoutSpy.mock.calls[3][0]).toContain('Debug');

		Logger.verbose('Verbose');
		expect(stdoutSpy).toHaveBeenCalledTimes(5);
		expect(stdoutSpy.mock.calls[4][0]).toContain('Verbose');
	});
});
