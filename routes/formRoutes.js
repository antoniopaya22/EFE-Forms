module.exports = {
    name: 'FormRouter',
    register: async (server, options) => {
        miserver = server;
        repositorioForm = server.methods.getFormRepository();
        server.route([

            // ================== Add Form =======================
            {
                method: 'GET',
                path: '/addForm',
                handler: async(req, h) => {
                    return h.view('forms/addForm', {}, { layout: 'base' });
                }
            },
            {
                method: 'POST',
                path: '/addForm',
                handler: async(req, h) => {
                    var numPreguntas = Object.keys(req.payload).filter(x => x.includes('obligatoria')).length;
                    var preguntas = [];
                    for (let i = 0; i < numPreguntas; i++) {
                        preguntas.push({
                            pregunta: req.payload[`titulo${i+1}`],
                            tipo: req.payload[`tipo${i+1}`],
                            requerida: req.payload[`obligatoria${i+1}`] == 'on' ? true : false
                        });
                    }
                    var form = {
                        titulo: req.payload.titulo,
                        descripcion: req.payload.descripcion,
                        propietario: 'antonio-por-defecto',
                        publico: req.payload.publico == 'Público' ? true : false,
                        tags: req.payload.tags.split(';'),
                        preguntas: preguntas
                    };

                    await repositorioForm.conexion()
                        .then((db) => {
                            repositorioForm.addForm(db, form)
                        })
                        .then((id) => {
                            respuesta = "";
                            if (id === null) {
                                respuesta = h.redirect('/?mensaje="Error al insertar"')
                            } else {
                                respuesta = h.redirect('/?mensaje="Formulario creado"')
                            }
                        });
                    return respuesta;
                }
            },
            // ================== Mis Forms =======================
            {
                method: 'GET',
                path: '/misForms',
                options: {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {

                    var pg = parseInt(req.query.pg); // Es String !!!
                    if (req.query.pg == null) { // Puede no venir el param
                        pg = 1;
                    }

                    var criterio = { "user": req.auth.credentials };
                    // cookieAuth

                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerFormsPg(db, pg, criterio))
                        .then((forms, total) => {
                            formsEjemplo = forms;

                            pgUltima = forms.total / 2;
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
                        

                        formsEjemplo = [
                            {
                                titulo: "form 1",
                                descripcion: "descripcion de form 1"
                            },
                            {
                                titulo: "form 2",
                                descripcion: "descripcion de form 2"
                            }
                        ]
                 
                    return h.view('forms/misforms',
                        {
                            forms: forms,
                            usuarioAutenticado: req.state["session-id"].user
                            //paginas: paginas
                        },
                        { layout: 'base' });
                        //return h.view('misforms', {}, { layout: 'base' });
                }
            }

        ])
    }
}
