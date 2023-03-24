const tap = require('tap')
const fs = require('fs')
const ResinJetsonFlash = require('../lib/resin-jetson-flash.js');


const { getSdk } = require('balena-sdk');

const IMAGE_PATH = 'jetson-tx2.img'

const balena = getSdk({
    apiUrl: "https://api.balena-cloud.com/",
});

tap.test('Test jetson-flash artifact preperation', async t => {
    // download tx2 image with sdk 
    await new Promise(async (resolve, reject) => {
        t.comment('Downloading image...')
        balena.models.os.download('jetson-tx2').then(function(stream) {
            stream.pipe(fs.createWriteStream(IMAGE_PATH));
            stream.on("finish", () => {
                resolve();
            })
        });
    })

    const Flasher = new ResinJetsonFlash(
		'jetson-tx2',
		IMAGE_PATH,
		'',
		`${__dirname}/../assets/jetson-tx2-assets`,
		'./jetson-flash-artifacts',
	);

    await t.resolves(
        Flasher.generateArtifacts(),
        'Should generate artifacts without errors'
    )
})
