export const errorHandler = (statusCode, messsage) => {
    const error = new Error(messsage);
    error.statusCode = statusCode;
    return error;
}