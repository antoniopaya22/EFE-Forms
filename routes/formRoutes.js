module.exports = {
    name: 'FormRouter',
    register: async (server, options) => {
        miserver = server;
       // repositorio = server.methods.getFormRepository();

        server.route([
            {
                method: 'GET',
                path: '/misForms',
                options: {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {
/*
                    var pg = parseInt(req.query.pg); // Es String !!!
                    if (req.query.pg == null) { // Puede no venir el param
                        pg = 1;
                    }
*/
                    var criterio = { "user": req.auth.credentials };
                    // cookieAuth
/*
                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerAnunciosPg(db, pg, criterio))
                        .then((anuncios, total) => {
                            anunciosEjemplo = anuncios;

                            pgUltima = anunciosEjemplo.total / 2;
                            // La págian 2.5 no existe
                            // Si excede sumar 1 y quitar los decimales
                            if (pgUltima % 2 > 0) {
                                pgUltima = Math.trunc(pgUltima);
                                pgUltima = pgUltima + 1;
                            }

                        })
                        var paginas = [];
                        for (i = 1; i <= pgUltima; i++) {
                            if (i == pg) {
                                paginas.push({ valor: i, clase: "uk-active" });
                            } else {
                                paginas.push({ valor: i });
                            }
                        }
                        
*/
                 
                    return h.view('forms/misforms',
                        {
                           // anuncios: anunciosEjemplo,
                            usuarioAutenticado: req.auth.credentials
                            //paginas: paginas
                        },
                        { layout: 'base' });
                        //return h.view('misforms', {}, { layout: 'base' });
                }
            }

        ])
    }
}