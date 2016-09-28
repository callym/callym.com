var fs = require('fs');
var path = require('path');

email_auth = JSON.parse(fs.readFileSync('./email/newsletter_auth.json'));
s3_auth = JSON.parse(fs.readFileSync('./email/s3_auth.json'));

exports.send_dry_email = function send_dry_email(email) { exports.send_email(email, true); };

exports.send_email = function send_email(email, dry_run = false) {
	exports.sync_assets();

	email_data = JSON.parse(fs.readFileSync('./email/emails/' + email));
	var data_path = path.parse(email);
	var assets_path = `${data_path.dir}/${data_path.name}/`;

	var EmailTemplate = require('email-templates').EmailTemplate;
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
		base_url: "https://beta.callym.com"
	}
	var users = [];

	var aws = require('aws-sdk');
	aws.config.update({
		region: 'eu-west-1'
	});
	var doc_client = new aws.DynamoDB.DocumentClient();
	var params = {
		TableName: 'callym-com-email'
	};
	doc_client.scan(params, on_scan);
	function on_scan(error, data) {
		if (error) {
			console.log("ERROR: ", JSON.stringify(error));
		}
		else {
			data.Items.forEach(function(item, i, arr) {
				if (item.confirmed) {
					if (email.topic == 'all' || item.topics.indexOf(email.topic) > -1) {
						users.push(item);
					}
				}
			});

			if (typeof data.LastEvaluatedKey != "undefined") {
				params.ExclusiveStartKey = data.LastEvaluatedKey;
				doc_client.scan(params, on_scan);
			} else {
				send_emails();
			}
		}
	};

	var templatesDir = path.resolve(__dirname, './', 'email', 'templates');
	var template = new EmailTemplate(path.join(templatesDir, email_data.template), {
		sassOptions: {
			includePaths: ['./sass']
		}
	});

	var email = {
		preheader: email_data.description,
		topic: email_data.template,
	}

	dry_run = dry_run || false;
	
	function send_emails() {
		async.mapLimit(users, 10, function (item, next) {
			var item = Object.assign(constants, email, email_data, item);

			if (dry_run) {
				console.log(item);
			}

			template.render(item, function (err, results) {
				if (err) return next(err)
				if (!dry_run) {
					transport.sendMail({
						from: 'Callym <newsletter@callym.com>',
						to: item.email,
						subject: item.title,
						html: results.html
					}, function (err, responseStatus) {
						if (err) {
							return next(err)
						}
						console.log('sent to: ' + item.email);
						next(null, responseStatus.message)
					});
				} else {
					console.log('would have sent to: ' + item.email);
					next(null);
				}
			})
		}, function (err) {
			if (err) {
				console.error(err)
			}
			if (dry_run) {
				console.log(`would have sent ${users.length} emails`);
			} else {
				console.log(`succesfully sent ${users.length} messages`);
			}
		});
	};
};

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
		console.log("done uploading");
	});
}

require('make-runnable');