const DataExporter = require("./src/DataExporter");
require("dotenv").config();

async function main() {
    const dExporter = new DataExporter({
        token: process.env.TOKEN,
        customHeaders: ["Suicidal Ideation"],
        subredditNames: ["SuicideWatch", "depression", "anxiety", "Offmychest" ]
    });

    await dExporter.exportDataToCsv();
}

main().catch(e => console.error(e));

module.exports = DataExporter;