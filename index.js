#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const moment = require('moment');
const low = require('lowdb')
const db = low('hulo.db.json')

const out = function (message) {

	// This is a helper function for formatting a message to the console.

	console.log(`${chalk.bold('Hulo:')} ${message}`);
	return true;

};

const done = function (strMessage) {

	// This is a helper function to send a done message to the console.

	console.log(`${chalk.bold('hulo:')} ${chalk.green(strMessage)}`);
	return true;

};

const value = function (value) {

	// Helper function to output value

	return chalk.blue(value);

};

const problem = function (value) {

	// Helper function to output problem

	return out(chalk.red(value));

};

// initialise the database

db.defaults({

	log: [],
	track: [],
	count: []

}).write()

// Define program command line UI

program
	.version('0.1.0 alpha')

program
	.command('log <message>')
	.description('Make a log entry.')
	.action(function(message){

		db.get('log')
			.push({
				timestamp: moment().format(),
				message: message
			})
			.write();

		done('Message logged.');

	});


program
	.command('last [count]')
	.description('Output the last Hulo log entry. Optional count for number of items to return.')
	.action(function(count){

		count = parseInt(count) || 1;

		let result = db.get('log')
			.takeRight(count)
			.value();

		result.map(logItem => {

			console.info(`${chalk.dim(moment(logItem.timestamp).format('dddd, MMMM Do YYYY, h:mm:ss a'))}`);
			console.info(`${logItem.message}`);
			console.info(`-`);

		})

	});

program
	.command('count <item> [number]')
	.description('Count an item.')
	.action(function(item, number){

		// number = number || 1;
		// out(`Counting ${value(number)} ${value(item)} at ${timeStamp()}`);
		// done();
		problem('Count not currently implemented.');

	});

program
	.command('howmany <item>')
	.description('Get the current count for an item.')
	.action(function(item, number){

		// number = number || 1;
		// out(`Counting ${value(number)} ${value(item)} at ${timeStamp()}`);
		// done();
		problem('Count not currently implemented.');

	});

program
	.command('track <item> <number>')
	.description('Keep a record of a value over time.')
	.action(function(item, number){

		// out(`Tracking ${value(item)} at new value ${value(number)} at ${timeStamp()}`);
		// done();

		problem('Track not currently implemented.');

	});

program.parse(process.argv);
