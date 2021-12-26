# Reddit Data Fetcher
Fetches reddit data and exports randomly selected data to .csv

## Instructions for use

### Initialize
```
const DataExporter = require("./src/DataExporter");
require("dotenv").config();

const dExporter = new DataExporter({
    token: process.env.TOKEN,
    customHeaders: ["Suicidal Ideation"],
    subredditNames: ["SuicideWatch", "depression", "anxiety", "Offmychest" ]
});
```

### Export data collected to csv

```
await dExporter.exportDataToCsv();
```

### Options
| parameter        | values                                                       | required                  |
| :----------------| :------------------------------------------------------------|:--------------------------|
| `token`          | `<your-reddit-api-token>`                                    |  yes                      |
| `customHeaders`  | `<your-custom-header-for-label>`                             |  no                       |
| `subredditNames` | `<a list of subreddit names you want to pull data from>`     |  yes                      |
| `fileName`       | `<your custom fileName>`                                     |  no                       |

### Errors
### error.name
`DataExporterError`

### error.type
| type                      | description                                   |
| :-------------------------| :---------------------------------------------|
| `ValidationError`         | Invalid params during initialization          |
| `RequestError`            | Error while making request to the reddit api  |
| `FileWriteError`          | Error while writing csv file                  |

#### error.message
- error description