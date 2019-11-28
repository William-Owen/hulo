#!/usr/bin/env node

/* ----------------------- *\

	HULO
	A logging tool for humans.

\* ----------------------- */

const commander = require('commander')
const chalk = require('chalk')
const moment = require('moment')
const low = require('lowdb')
const settings = require('user-settings').file('.hulo-settings')
const inquirer = require('inquirer')
const gitUserName = require('git-user-name')
const gitBranch = require('git-branch')
const gitRepoName = require('git-repo-name')
const fs = require('fs')
const FileSync = require('lowdb/adapters/FileSync')

const program = new commander.Command()
const prompt = inquirer.createPromptModule()

hulo = {}

// Define the database
const adapter = new FileSync('hulo.db')
hulo.db = low(adapter)

hulo.db.defaults({

	log: [],
	task: [],

}).write()

// Define User information

hulo.username = settings.get('username')

// Define Git information

hulo.git = {}

if (fs.existsSync('.git')) {

	const CurrentGitUserName = gitUserName()
	const CurrentGitBranchName = gitBranch.sync()
	const CurrentGitRepoName = gitRepoName.sync()

	hulo.git.username = CurrentGitUserName ? CurrentGitUserName : 'Unknown Git User'
	hulo.git.branch = CurrentGitBranchName ? CurrentGitBranchName : 'Unknown Git Branch'
	hulo.git.repo = CurrentGitRepoName ? CurrentGitRepoName : 'Unknown Git Repo'

}

// Console message helper functions

hulo.console = {

	out: (message) => {

		// This is a helper function for formatting a message to the console.
	
		console.log(`${chalk.bold('Hulo:')} ${message}`)
	
		return true
	
	},

	done: (message) => {

		// This is a helper function to send a done message to the console.
	
		console.log(`${chalk.bold('hulo:')} ${chalk.green(message)}`)
	
		return true
	
	},

	problem: (message) => {

		// This is a helper function to send a done message to the console.
	
		console.log(`${chalk.bold('hulo:')} ${chalk.red(message)}`)
	
		return true
	
	}

}

// Message formatting helper functions

hulo.format = {

	value: (value) => {

		// Helper function to output value
	
		return chalk.blue(value)
	
	},

	problem: (value) => {

		// Helper function to output problem
	
		return chalk.red(value)
	
	}

}

// Set the username as a user preference

hulo.setUserName = (newUsername) => {

	hulo.username = newUsername
	settings.set('username', hulo.username)
	hulo.console.out(`Your username is set to ${hulo.username}`)

	return true

}

hulo.ensureUsernameSet = (next) => {

	if ( ( !hulo.username || hulo.username === "" ) && !hulo.gitUsername ) {

		prompt([{

			type: 'input',
			name: 'username',
			message: 'Please create a user name to log against.'

		}]).then(answers => {

			hulo.setUserName( answers.username )
			next()

		})

	} else {

		next()

	}

}


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
			.write()

		hulo.console.done('Message logged.')

	})

}

// Command line UI description

program
	.version('1.0.4 alpha', '-v, --version', 'output the current version');

program
	.command('log [message]')
	.description('Make a log entry.')
	.action(function(message){

		if (message) {

			hulo.log( message )

		} else {

			prompt([{

				type: 'editor',
				name: 'logMessage',
				message: 'Please create a log entry.'

			}]).then(answers => {

				hulo.log( answers.logMessage )

			})

		}

	})

program
	.command('read [count]')
	.alias('last')
	.option("-v, --verbose", "Verbose output")
	.option("-a, --all", "Read all")
	.description('Output the last Hulo log entry. Optional count for number of items to return.')
	.action(function(count, options){

		count = parseInt(count) || 1

		let result = options.all ? hulo.db.get('log').value() : hulo.db.get('log').takeRight(count).value()

		result.map(logItem => {

			let usernameString = ""

			if (options.verbose) {

				let gitBranchDetails = ""
				let systemDetails = ""

				if ( logItem.git.repo ) {

					gitBranchDetails += chalk.green('Repo:') + ' ' + chalk.blue(logItem.git.repo) + ' '

				}

				if ( logItem.git.branch ) {

					gitBranchDetails += chalk.green('Branch:') + ' ' + chalk.blue(logItem.git.branch) + ' '

				}

				if ( logItem.system.path ) {

					systemDetails += chalk.green('Path:') + ' ' + chalk.blue(logItem.system.path) + ' '

				}

				console.info(`${chalk.green(moment(logItem.timestamp).format('dddd, MMMM Do YYYY, h:mm:ss a'))}`)

				if (gitBranchDetails !=="") {

					console.info(gitBranchDetails)

				}

				if (systemDetails !=="") {

					console.info(systemDetails)

				}
				
				if (hulo.username && hulo.git.username !== undefined ) {

					usernameString = chalk.blue(hulo.username) + ' ' + chalk.green('(') + chalk.blue(hulo.git.username) + chalk.green(')')
	
				} else if (hulo.username) {
	
					usernameString = chalk.blue(hulo.username)
	
				}

				console.info(`${usernameString} ${chalk.green(`wrote:`)}`)
				console.info(`${logItem.message}`)

			} else {

				if (hulo.username) {
	
					usernameString = chalk.blue(hulo.username)
	
				}
	
				console.info(`${chalk.green(moment(logItem.timestamp).format('D-MM-YY hh:mm'))} ${usernameString} ${chalk.green(`wrote:`)} ${logItem.message}`)
	
			}
			

		})

	})

program
	.command('task [taskName]')
	.option("-s, --start", "End current task and start a new task")
	.option("-e, --end", "End a task")
	.description('Track a task')
	.action(function(taskName, options){

		let result = hulo.db.get('task').takeRight(1).value() || []

		if(options.end) {

			// End a task
			hulo.console.problem('End task not implemented  yet.')

		}

		if(options.start) {
			
			// End a task and start a new one, or just start a new one
			hulo.console.problem(`Start task not implemented yet so can't start ${taskName}`)

		}

		if (!options.start && !options.end || options.start && options.end ) {
			
			// Read a task

			hulo.console.problem('Read task no implemented.')

			if (!result.length) {

				hulo.console.problem('No tasks have been recorded yet.')

			} else {

				if(result.end) {

					hulo.console.problem('No tasks currently tracked.')

				} else {

					hulo.console.out(`${result.taskName} was started ${moment(result.start).format('D-MM-YY hh:mm')} (${moment(result.start).duration()})`)

				}

			}

		}	

	})

program.parse(process.argv)
