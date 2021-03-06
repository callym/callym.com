var fs = require('fs');
var path = require('path');
var colors = require('colors');
var indent = require('indent-string');
String.prototype.__defineGetter__('indent', function() { return indent('' + this, 4); });

email_auth = JSON.parse(fs.readFileSync('./email/newsletter_auth.json'));
s3_auth = JSON.parse(fs.readFileSync('./email/s3_auth.json'));
dynamoDB_auth = JSON.parse(fs.readFileSync('./email/dynamoDB_auth.json'));

exports.send_dry_email = (email) => exports.send_email(email, { dry_run: true });

exports.send_test_email = (email) => exports.send_email(email, { test: true });

exports.send_email = function send_email(email, options = { /* dry_run, test */ }) {
	var { 
		dry_run = false,
		test = false
	} = options;

	if (dry_run) {
		console.log('*** dry_run ***'
			.cyan
			.bold);
	}

	exports.sync_assets();

	var yaml = require('node-yaml');

	email_data = yaml.readSync('./email/emails/' + email + '.yaml');
	var data_path = path.parse(email);
	var assets_path = `${data_path.dir}/${data_path.name}/`;

	var EmailTemplate = require('email-templates').EmailTemplate;
	var minify = require('html-minifier').minify;
	var nodemailer = require('nodemailer');
	var async = require('async');

	var transport = nodemailer.createTransport({
		service: 'SES-EU-WEST-1',
		auth: {
			user: email_auth.user,
			pass: email_auth.pass
		}
	});

	var s3_prefix = `https://s3-eu-west-1.amazonaws.com/${s3_auth.bucket}/assets/`;

	var constants = {
		s3_prefix: s3_prefix,
		assets_path: s3_prefix + assets_path,
		base_url: "https://callym.com",
		aws: false
	}
	console.log('** constants **'
		.magenta
		.bold);
	console.log(JSON.stringify(constants, null, 4)
		.magenta
		.indent);

	var email = {
		preheader: email_data.description,
		topic: email_data.template,
	}
	console.log('** email **'
		.green
		.bold);
	console.log(JSON.stringify(email_data, null, 4)
		.green
		.indent);

	get_users(email.topic, test)
		.then(function(users) {
			var templatesDir = path.resolve(__dirname, './', 'email', 'templates');
			var template = new EmailTemplate(path.join(templatesDir, email_data.template), {
				sassOptions: {
					includePaths: ['./sass']
				}
			});

			dry_run = dry_run || false;

			send_emails(users, template);
		});
	
	function send_emails(users, template) {
		async.mapLimit(users, 10, function(user, next) {
			var item = Object.assign({}, constants, email, email_data, user);

			if (dry_run) {
				console.log(`** ${item.email} **`
					.yellow
					.bold);
				console.log(JSON.stringify(user, (k, v) => (k == 'email') ? undefined : v, 4)
					.yellow
					.indent);
			}

			template.render(item, function (error, results) {
				if (error) {
					return next(error);
				}

				if (dry_run) {
					console.log(`would have sent to: ${item.email}`
						.cyan
						.indent);
					return next(null);
				}

				if (test) {
					console.log('*** test ***'
						.magenta
						.bold);
				}

				var html = minify(results.html, {
					removeComments: true,
					maxLineLength: 160,
					collapseWhitespace: true,
					conservativeCollapse: true
				});

				transport.sendMail({
					from: `Callym <${email_auth.email}>`,
					to: item.email,
					subject: item.title,
					html: html
				}, function (error, responseStatus) {
					if (error) {
						return next(error);
					}
					console.log(`sent to: ${item.email}`
						.green);
					next(null, responseStatus.message);
				});
			});
		}, function(error) {
			if (error) {
				console.log(`ERROR: ${error}`
					.red
					.bold);
			}
			if (dry_run) {
				console.log(`would have sent ${users.length} emails`
					.cyan
					.bold);
			} else {
				console.log(`succesfully sent ${users.length} messages`
					.green
					.bold);
			}
		});
	};
};

exports.template_for_aws = function(template_name) {
	var EmailTemplate = require('email-templates').EmailTemplate;
	var minify = require('html-minifier').minify;

	var s3_prefix = `https://s3-eu-west-1.amazonaws.com/${s3_auth.bucket}/assets/`;

	var constants = {
		s3_prefix: s3_prefix,
		// should only use base assets!
		assets_path: s3_prefix,
		base_url: "https://callym.com",
		aws: true
	}

	var email = {
		preheader: '{{ preheader }}',
		topic: '{{ topic }}',
	}

	var item = Object.assign(constants, email);

	var templatesDir = path.resolve(__dirname, './', 'email', 'templates');
	var template = new EmailTemplate(path.join(templatesDir, template_name), {
		sassOptions: {
			includePaths: ['./sass']
		}
	});

	template.render(item, function (error, results) {
		if (error) {
			console.log(`ERROR: ${error}`
				.red
				.bold);
		}

		var html = minify(results.html, {
			removeComments: true,
			maxLineLength: 160,
			collapseWhitespace: true,
			conservativeCollapse: true
		});

		var file_name = `./email/build/${template_name}.nunjucks`;
		ensureDirectoryExistence(file_name);
		fs.writeFileSync(file_name, html);
	});
};

function get_users(email_topic, test) {
	return new Promise(function(resolve, reject) {
		if (test) {
			resolve([
				{
					email: 'hi@callym.com',
					topics: [ 'updates', 'news', 'dogs' ],
				    date: '2016-09-27T21:52:45.750Z',
				    confirmed: true
				}
			]);
		}

		var users = [];

		var aws = require('aws-sdk');
		aws.config.update({
			region: dynamoDB_auth.region,
			accessKeyId: dynamoDB_auth.id,
			secretAccessKey: dynamoDB_auth.secret
		});
		var doc_client = new aws.DynamoDB.DocumentClient();
		var params = {
			TableName: 'callym-com-email'
		};
		doc_client.scan(params, on_scan);
		function on_scan(error, data) {
			if (error) {
				console.log(`ERROR: ${JSON.stringify(error)}`
					.red
					.bold);
				return reject(error);
			}
			else {
				data.Items.forEach(function(item, i, arr) {
					if (item.confirmed) {
						if (email_topic == 'all' || item.topics.indexOf(email_topic) > -1) {
							users.push(item);
						}
					}
				});

				if (typeof data.LastEvaluatedKey != "undefined") {
					params.ExclusiveStartKey = data.LastEvaluatedKey;
					doc_client.scan(params, on_scan);
				} else {
					resolve(users);
				}
			}
		};
	});
}

exports.sync_assets = function sync_assets() {
	var s3 = require('s3');
	var s3_client = s3.createClient({
		s3Options: {
			accessKeyId: s3_auth.id,
			secretAccessKey: s3_auth.secret,
			region: s3_auth.region
		}
	});
	var s3_params = {
		localDir: './email/assets',
		deleteRemoved: true,
		s3Params: {
			Bucket: s3_auth.bucket,
			Prefix: "assets/"
		}
	};
	var uploader = s3_client.uploadDir(s3_params);
	uploader.on('end', function() {
		console.log('done uploading'
			.cyan
			.bold);
	});
}

function ensureDirectoryExistence(filePath) {
	var dirname = path.dirname(filePath);
	if (directoryExists(dirname)) {
		return true;
	}
	ensureDirectoryExistence(dirname);
	fs.mkdirSync(dirname);
};

function directoryExists(path) {
	try {
		return fs.statSync(path).isDirectory();
	}
	catch (error) {
		return false;
	}
};

require('make-runnable');