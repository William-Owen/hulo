#!/usr/bin/env node

/* ----------------------- *\

	HULO
	A logging tool for humans.

\* ----------------------- */

const program = require('commander');
const chalk = require('chalk');
const moment = require('moment');
const low = require('lowdb');
const settings = require('user-settings').file('.hulo-settings');
const inquirer = require('inquirer');
const path = require('path');
const gitUserName = require('git-user-name');
const gitBranch = require('git-branch');
const gitRepoName = require('git-repo-name');
const homedir = process.env.HOME || process.env.USERPROFILE
const filepath = path.join(homedir, 'hulo.db');
const fs = require('fs');

hulo = {}

// Define the database

hulo.db = low(filepath);

hulo.db.defaults({

	log: [],
	track: [],
	count: []

}).write()

// Define User information

hulo.username = settings.get('username');

// Define Git information

hulo.git = {}

if (fs.existsSync('.git')) {

	const CurrentGitUserName = gitUserName();
	const CurrentGitBranchName = gitBranch.sync();
	const CurrentGitRepoName = gitRepoName.sync();

	hulo.git.username = CurrentGitUserName ? CurrentGitUserName : 'Unknown Git User';
	hulo.git.branch = CurrentGitBranchName ? CurrentGitBranchName : 'Unknown Git Branch';
	hulo.git.repo = CurrentGitRepoName ? CurrentGitRepoName : 'Unknown Git Repo';

}

// Console message helper functions

hulo.console = {};

hulo.console.out = (message) => {

	// This is a helper function for formatting a message to the console.

	console.log(`${chalk.bold('Hulo:')} ${message}`);

	return true;

};

hulo.console.done = (strMessage) => {

	// This is a helper function to send a done message to the console.

	console.log(`${chalk.bold('hulo:')} ${chalk.green(strMessage)}`);

	return true;

};

// Message formatting helper functions

hulo.format = {};

hulo.format.value = (value) => {

	// Helper function to output value

	return chalk.blue(value);

};

hulo.format.problem = (value) => {

	// Helper function to output problem

	return out(chalk.red(value));

};

// Set the username as a user preference

hulo.setUserName = (newUsername) => {

	hulo.username = newUsername;
	settings.set('username', hulo.username);
	hulo.console.out(`Your username is set to ${hulo.username}`);

	return true;

};

hulo.ensureUsernameSet = (next) => {

	const prompt = inquirer.createPromptModule();

	if ( ( !hulo.username || hulo.username === "" ) && !hulo.gitUsername ) {

		prompt([{

			type: 'input',
			name: 'username',
			message: 'Please create a user name to log against.'

		}]).then(answers => {

			hulo.setUserName( answers.username );
			next();

		});

	} else {

		next();

	}

};


// LOG

hulo.log = (message) => {

	hulo.ensureUsernameSet(() => {

		hulo.db.get('log')
			.push({
				git: {
					user: hulo.git.username,
					branch: hulo.git.branch,
					repo: hulo.git.repo
				},
				system: {
					path: process.cwd()
				},
				username: hulo.username,
				timestamp: moment().format(),
				message: message
			})
			.write();

		hulo.console.done('Message logged.');

	});

}

// Command line UI description

program
	.version('0.1.0 alpha')

program
	.command('log [message]')
	.description('Make a log entry.')
	.action(function(message){

		if (message) {

			hulo.log( message );

		} else {

			const messagePrompt = inquirer.createPromptModule();

			messagePrompt([{

				type: 'editor',
				name: 'logMessage',
				message: 'Please create a log entry.'

			}]).then(answers => {

				hulo.log( answers.logMessage );

				next();

			});

		}

	});

program
	.command('last [count]')
	.description('Output the last Hulo log entry. Optional count for number of items to return.')
	.action(function(count){

		count = parseInt(count) || 1;

		let result = hulo.db.get('log')
			.takeRight(count)
			.value();

		result.map(logItem => {

			let gitBranchDetails = "";
			let usernameString = "";
			let systemDetails = "";

			if ( logItem.git.repo ) {

				gitBranchDetails += chalk.green('Repo:') + ' ' + chalk.blue(logItem.git.repo) + ' ';

			}

			if ( logItem.git.branch ) {

				gitBranchDetails += chalk.green('Branch:') + ' ' + chalk.blue(logItem.git.branch) + ' ';

			}

			if (hulo.username && hulo.git.username !== undefined ) {

				usernameString = chalk.blue(hulo.username) + ' ' + chalk.green('(') + chalk.blue(hulo.git.username) + chalk.green(')');

			} else if (hulo.username) {

				usernameString = chalk.blue(hulo.username)

			}

			if ( logItem.system.path ) {

				systemDetails += chalk.green('Path:') + ' ' + chalk.blue(logItem.system.path) + ' ';

			}

			console.info(`${chalk.green(moment(logItem.timestamp).format('dddd, MMMM Do YYYY, h:mm:ss a'))}`);

			if (gitBranchDetails !=="") {

				console.info(gitBranchDetails);

			}

			if (systemDetails !=="") {

				console.info(systemDetails);

			}

			console.info(usernameString + chalk.green(' wrote: -'));
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
		hulo.console.problem('Count not currently implemented.');

	});

program
	.command('howmany <item>')
	.description('Get the current count for an item.')
	.action(function(item, number){

		// number = number || 1;
		// out(`Counting ${value(number)} ${value(item)} at ${timeStamp()}`);
		// done();
		hulo.console.problem('howmany not currently implemented.');

	});

program
	.command('username [newUsername]')
	.description('Get the current username.')
	.action(function(newUsername){

		if (newUsername) {

			hulo.setUserName(newUsername);

		} else {

			hulo.ensureUsernameSet(() => {

				hulo.console.out(`Your username is set to ${hulo.username}`);
				hulo.console.out(`Your Git username is set to ${hulo.gitUsername}`);

			});

		}

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
