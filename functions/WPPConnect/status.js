const Sessions = require('../../controllers/sessions')
const get = require("async-get-file")
const path = require('path')
const fs = require('fs')
const util = require('util');
const urlExists = util.promisify(require('url-exists'));

module.exports = class Status {

    static async sendTextToStorie(req, res) {
        let data = Sessions.getSession(req.body.session)
        if (!req.body.text) {
            return res.status(400).json({
                status: 400,
                error: "Text não foi informado"
            })
        }
        else {
            await data.client.sendText('status@broadcast', req.body.text)
            return res.status(200).json({
                result: 200,
                status: 'SUCCESS',
            })
        }
    }

    static async sendImageToStorie(req, res) {
        try {
            const { caption, path } = req.body;
            let data = Sessions.getSession(req.body.session)
            if (!path) {
                return res.status(400).send({
                    status: 400,
                    error: "Path não informado",
                    message: "Informe o caminho da imagem. Exemplo: C:\\folder\\image.jpg caso a imagem esteja local ou uma URL caso a imagem a ser enviada esteja na internet"
                });
            }
            await data.client.sendImage('status@broadcast', path, 'imagem', caption)
            return res.status(200).json({
                result: 200,
                status: 'SUCCESS',
            })
        } catch (error) {
            return res.status(500).json({
                result: 500,
                error: error
            })
        }
    }

    static async sendVideoToStorie(req, res) {
        if (!req.body.path) {
            return res.status(400).send({
                status: 400,
                error: "Path não informado",
                message: "Informe o path. Exemplo: C:\\folder\\video.mp4 para arquivo local ou URL caso o arquivo a ser enviado esteja na internet"
            });
        }
        let data = Sessions.getSession(req.body.session)
        let isURL = await urlExists(req.body.path);
        let name = req.body.path.split(/[\/\\]/).pop();
        try {
            if (isURL) {
                let dir = 'files-received/'
                await get(req.body.path, {
                    directory: 'files-received'
                });
                await data.client.sendFile('status@broadcast', dir + name, 'Video', req.body.caption)
                fs.unlink(path.basename("/files-received") + "/" + name, erro => console.log(""))
                return res.status(200).json({
                    result: 200,
                    status: 'SUCCESS',
                })
            }
            if (!isURL) {
                await data.client.sendFile('status@broadcast', req.body.path, 'Video', req.body.caption)
                return res.status(200).json({
                    result: 200,
                    status: 'SUCCESS',
                })
            }
        } catch (error) {
            return res.status(500).json({
                result: 500,
                error: error
            })
        }
    }
}