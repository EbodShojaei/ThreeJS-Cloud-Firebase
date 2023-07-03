const axios = require('axios');
const fs = require('fs');
const { PassThrough } = require('stream');


const getModel = async (downloadURL, res) => {
    axios.get(downloadURL, { responseType: 'arraybuffer' })
        .then(response => {
            console.log('Sending cloud model...')
            const fileData = response.data;

            res.setHeader('Content-Length', fileData.byteLength);
            const stream = new PassThrough();
            stream.end(fileData);
            stream.pipe(res);
        })
        .catch(error => {
            console.log('Sending local model...');
            const glbFilePath = 'src/model/model.glb';
            const stream = fs.createReadStream(glbFilePath);
            const stat = fs.statSync(glbFilePath);

            res.setHeader('Content-Length', stat.size);
            stream.pipe(res);
        });
};

module.exports = getModel;