exports.getAuthToken = function getAuthToken(headers) {
  const auth = headers.authorization.split(' ')[1];
  return new Buffer(auth, 'base64').toString().split(':')[1];
}
