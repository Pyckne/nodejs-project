exports.auth = (role) => (req, res, next) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    next();
  };  

  //middleware como este para vistas protegidas>
  
  module.exports = {
    ensureAuthenticated: (req, res, next) => {
      if (req.isAuthenticated || req.user) return next();
      res.redirect('/login'); // Configurar pagina personalizada mas adelante
    }
  };