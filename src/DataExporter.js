const Joi = require("joi");
const axios = require("axios");
const fs = require("fs");

const errors = require("./misc/errors");
const {
    URLS,
    CUSTOM_ERROR,
    DATA_LIMIT,
    API_RETURN_LIMIT,
    DATA_PER_GROUP_LIMIT
} = require("./misc/constants");

class DataExporter {
    constructor(options) {
        const {
            token,
            customHeaders,
            subredditNames,
            fileName
        } = this._validateOptions(options);

        this._apiToken = token;
        this._customHeaders = customHeaders;
        this._subredditNames = subredditNames;
        this._fileName = fileName;
    }

    _validateOptions(options) {
        const schema = Joi.object({
            token: Joi.string().required(),
            customHeaders: Joi.array().items(Joi.string()).optional(),
            subredditNames: Joi.array().items(Joi.string()).min(1).max(4).required(),
            fileName: Joi.string().optional()
        })
            .required()
            .messages({
                "object.empty": "Provide parameters `token`, `customHeaders`, and `subredditNames`",
            });

        const { error, value } = schema.validate(options);
        if (error) {
            throw errors.invalidParams(error);
        }

        return value;
    }

    _callRedditApi(subredditName, cursor = "") {
        let url = `${URLS.REDDIT_API}/${subredditName}/hot.json?t=month&limit=${API_RETURN_LIMIT}`;
        url = cursor ? `${url}&after=${cursor}` : url;
        return axios({
            url,
            method: "GET",
            headers: {
                "x-api-key": this._apiToken
            }
        });
    }

    async _callRedditApiRecursively(name, cursor = "", totalData = []) {
        try {
            const data = await this._callRedditApi(name, cursor);
            if (!data || !data.data || !data.data.data) {
                return data;
            }
            const redditData = data.data.data;
            totalData = totalData.concat(redditData.children);
            redditData.children = totalData;

            if (!redditData.after || totalData.length > DATA_LIMIT) {
                return data;
            }

            console.info("Data being retrieved from API. Please wait...");
            return await this._callRedditApiRecursively(name, redditData.after, totalData);
        } catch (err) {
            throw errors.requestError(err);
        }
    }

    async _getRandomlySelectedDataFromReddit() {
        try {
            let redditData = await Promise.all(
                this._subredditNames.map(async (name) => {
                    const { data } = await this._callRedditApiRecursively(name);
                    const posts = data && data.data && data.data.children;

                    const shuffledPosts = posts.sort(() => 0.5 - Math.random());
                    const selectedPosts = shuffledPosts.slice(0, DATA_PER_GROUP_LIMIT);

                    console.info(`${selectedPosts.length} posts selected from subreddit ${name}`);
                    return selectedPosts;
                })
            );

            redditData = redditData.reduce((prev, curr) => prev.concat(curr), []);

            return redditData;
        } catch (err) {
            if (err.name === CUSTOM_ERROR.NAME) {
                throw err;
            }
            throw errors.requestError(err);
        }
    }

    _convertDataToCsv(jsonData) {
        const data = jsonData.map(v => v.data.selftext);
        const customHeaders = this._customHeaders.join(",");

        let csvString = `text,${customHeaders} \r\n`;

        for (let i = 0; i < data.length; i++) {
            const cleansedStr = data[i].replace(/(\r?\n|\r)|(,)*/gm, "")
                .replace(/'|’|"|_/gm, "").trim();
            if (!cleansedStr) {
                continue;
            }
            csvString += `${cleansedStr} \r\n`;
        }

        return csvString;
    }

    async exportDataToCsv() {
        let redditData = await this._getRandomlySelectedDataFromReddit();
        try {
            const csv = this._convertDataToCsv(redditData);
            const fileName = this._fileName || "nlp-suicide-ideation-data.csv";

            return fs.writeFileSync(fileName, csv);
        } catch (err) {
            throw errors.fileWriteError(err);
        }
    }
}

module.exports = DataExporter;