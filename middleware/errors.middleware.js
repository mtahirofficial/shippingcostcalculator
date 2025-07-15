function ErrorsMiddleware(exception, request, response, next) {
  const status = exception.status;
  const message = exception.message;
  const errors = exception.errors || null;

  response.status(status).send({
    status,
    message,
    errors,
  });
}

module.exports = ErrorsMiddleware;
