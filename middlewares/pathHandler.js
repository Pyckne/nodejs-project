module.exports = (req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Ruta '${req.originalUrl}' no encontrada`
  });
};