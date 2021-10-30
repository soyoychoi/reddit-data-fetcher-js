class DataExporterError extends Error {
    constructor(type, message, details) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.type = type;
        this.message = message;
        this.details = details;
    }
}

module.exports = {
    invalidParams: (err) => {
        return new DataExporterError(
            "ValidationError",
            "Invalid params during initialization",
            { message: err.details[0].message },
        );
    },
    requestError: (err) => {
        return new DataExporterError(
            "RequestError",
            "Error while making request to the api",
            { message: err.message },
        );
    },
    fileWriteError: (err) => {
        return new DataExporterError(
            "FileWriteError",
            "Error while writing csv file",
            { message: err.message },
        );
    }
};