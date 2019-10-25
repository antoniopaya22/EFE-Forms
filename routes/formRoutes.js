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
                        propietario: req.state["session-id"].user,
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
                                respuesta = h.redirect('/misForms?mensaje="Error al insertar"')
                            } else {
                                respuesta = h.redirect('/misForms?mensaje="Formulario creado"')
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

                    var pg = parseInt(req.query.pg);
                    if (req.query.pg == null) { 
                        pg = 1;
                    }

                    var criterio = { "propietario": req.auth.credentials };

                    await repositorioForm.conexion()
                    .then((db) => repositorioForm.getForms(db, pg, criterio))
                    .then((forms, total) => {
                        formsEjemplo = forms;
                        
                        pgUltima = formsEjemplo.total / 2;
                        if (pgUltima % 2 > 0) {
                            pgUltima = Math.trunc(pgUltima);
                            pgUltima = pgUltima + 1;
                        }
                        
                    })
                    var paginas = [];
                    var previous = true;
                    var next = true;
                    var start =  pg-1;
                    if(start < 1){
                        start = 1;
                        previous = false;

                    }
                    var finish = pg+1;
                    if(finish > pgUltima){
                        finish = pgUltima;
                        next = false;
                    }
                    for (i = start; i <= finish; i++) {
                        if (i == pg) {
                            paginas.push({ valor: i, clase: "uk-active" });
                        } else {
                            paginas.push({ valor: i });
                        }
                    }   
                    return h.view('forms/misforms',
                        {
                            forms: formsEjemplo,
                            usuarioAutenticado: req.state["session-id"].user,
                            paginas: paginas,
                            current: pg,
                            hasPrevious: previous,
                            hasNext: next
                        },
                        { layout: 'base' });
                }
            }

        ])
    }
}
