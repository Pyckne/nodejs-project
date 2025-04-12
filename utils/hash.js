const bcrypt = require('bcrypt');

exports.hashPassword = (password) => bcrypt.hashSync(password, 10);
exports.comparePassword = (password, hash) => bcrypt.compareSync(password, hash);