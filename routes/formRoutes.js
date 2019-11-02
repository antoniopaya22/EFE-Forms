module.exports = {
    name: 'FormRouter',
    register: async (server, options) => {

        miserver = server;
        repositorioForm = server.methods.getFormRepository();
        repositorioRespuesta = server.methods.getRespuestaRepository();
        server.route([

            // ================== GET FORM =======================
            {
                method: 'GET',
                path: '/form/{id}',
                handler: async (req, h) => {
                    user = undefined;
                    if (req.state["session-id"]) {
                        user = req.state["session-id"].user;
                    }
                    if (require("mongodb").ObjectID.isValid(req.params.id)) {
                        var criterio = {
                            "_id": require("mongodb").ObjectID(req.params.id)
                        };
                        var respuesta = "";
                        await repositorioForm.conexion()
                            .then((db) => repositorioForm.getForms(db, criterio))
                            .then((forms) => {
                                if (forms === null) {
                                    respuesta = h.redirect('/?mensaje=Formulario no encontrado&tipoMensaje=warning');
                                } else {
                                    formEdit = forms[0];
                                }
                            });
                        var criterioRespuesta = {
                            "formid": req.params.id
                        };
                        await repositorioRespuesta.conexion()
                            .then((db) => repositorioRespuesta.getRespuestas(db, criterioRespuesta))
                            .then((respuestas) => {
                                var allresp = [];
                                respuestas.forEach(x => x.preguntas.forEach(y => allresp.push(y)));
                                var x = allresp.reduce((r, a) => {
                                    r[a.pregunta] = [...r[a.pregunta] || [], a];
                                    return r;
                                }, {});
                                var y = [];
                                Object.entries(x).forEach(([key, value]) => {
                                    y.push(value);
                                });
                                respuesta = h.view('forms/form',
                                    { form: formEdit, usuarioAutenticado: user, respuestas: y },
                                    { layout: 'base' });
                            });
                    } else {
                        respuesta = h.redirect('/?mensaje=Formulario no encontrado&tipoMensaje=warning');
                    }
                    return respuesta;
                }

            },
            // ================== Add Respuesta =======================
            {
                method: 'POST',
                path: '/form/{id}/addRespuesta',
                handler: async (req, h) => {
                    var criterio = {
                        "_id": require("mongodb").ObjectID(req.params.id)
                    };
                    var respuestas = Object.keys(req.payload).filter(x => x.includes('pre_'));
                    await repositorioForm.conexion()
                        .then((db) => repositorioForm.getForms(db, criterio))
                        .then((forms) => {
                            form = forms[0];
                        });
                    var preguntas = [];
                    respuestas.forEach(x => preguntas.push({
                        pregunta: form.preguntas.filter(y => y.pregunta.includes(x.split('pre_')[1]))[0].pregunta,
                        tipo: form.preguntas.filter(y => y.pregunta.includes(x.split('pre_')[1]))[0].tipo,
                        requerida: form.preguntas.filter(y => y.pregunta.includes(x.split('pre_')[1]))[0].requerida,
                        respuesta: req.payload[x]
                    }));
                    user_respuesta = "";
                    if (req.state["session-id"]) {
                        user_respuesta = req.state["session-id"].user;
                    } else {
                        user_respuesta = "anonimo"; // esto lo dejamos "anónimo" o undefined? eso lo puedes cambiar si necesitas comprobar algo con un if en la vista
                    }
                    var respuesta = {
                        formid: req.params.id,
                        autor: user,
                        preguntas: preguntas
                    };
                    //////////////////////////// publico privado
                    var resp = "";
                    await repositorioRespuesta.conexion()
                        .then((db) => repositorioRespuesta.addRespuesta(db, respuesta))
                        .then((id) => {
                            if (id === null) {
                                resp = h.redirect('/?mensaje=Error&tipoMensage=danger');
                            } else {
                                resp = h.redirect('/?mensaje=Respuesta->enviada');
                            }
                        });
                    return resp;
                }
            },
            {
                method: 'GET',
                path: '/form/{id}/addRespuesta',

                handler: async (req, h) => {

                    var criterio = {
                        "_id": require("mongodb").ObjectID(req.params.id)
                        //"propietario": req.auth.credentials ----> no tienes que ser propietario para contestar
                    };

                    await repositorioForm.conexion()
                        .then((db) => repositorioForm.getForms(db, criterio))
                        .then((forms) => {
                            formEdit = forms[0];
                        });
                    user = undefined;
                    if (req.state["session-id"]) {
                        user = req.state["session-id"].user;
                    }
                    if (formEdit.publico || (!formEdit.publico && user)) {
                        return h.view('forms/addRespuesta',
                            { form: formEdit, usuarioAutenticado: user },
                            { layout: 'base' });
                    } else {
                       
                        
                        return h.redirect('/login?mensaje=Log in para responder&tipoMensaje=warning');
                    }

                }

            },
            // ================== Add Form =======================
            {
                method: 'GET',
                path: '/formCreado/{id}',
                options: {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {
                    var criterio = {
                        "_id": require("mongodb").ObjectID(req.params.id)
                    };
                    user = undefined;
                    if (req.state["session-id"]) {
                        user = req.state["session-id"].user;
                    }
                    respuesta = "";
                    await repositorioForm.conexion()
                        .then((db) => repositorioForm.getForms(db, criterio))
                        .then((forms) => {
                            if (forms === null) {
                                respuesta = h.redirect('/?mensaje="Error al añadir formulario&tipoMensaje=danger"');
                            } else {
                                respuesta = h.view('forms/formCreado', {
                                    form: forms[0],
                                    usuarioAutenticado: user
                                }, { layout: 'base' });
                            }
                        });
                    return respuesta;
                }
            },
            {
                method: 'GET',
                path: '/addForm',
                options: {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {
                    user = undefined;
                    if (req.state["session-id"]) {
                        user = req.state["session-id"].user;
                    }
                    return h.view('forms/addForm', {
                        usuarioAutenticado: user
                    }, { layout: 'base' });
                }
            },
            {
                method: 'POST',
                path: '/addForm',
                options: {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {
                    var numPreguntas = Object.keys(req.payload).filter(x => x.includes('tipo')).length;
                    var preguntas = [];
                    for (let i = 0; i < numPreguntas; i++) {
                        preguntas.push({
                            pregunta: req.payload[`titulo${i + 1}`],
                            tipo: req.payload[`tipo${i + 1}`],
                            requerida: req.payload[`obligatoria${i + 1}`] == 'on' ? true : false
                        });
                    }
                    var new_tags = req.payload.tags.split(';');
                    if (new_tags[new_tags.length - 1] == "") {
                        new_tags.pop();
                    }
                    var form = {
                        titulo: req.payload.titulo,
                        descripcion: req.payload.descripcion,
                        propietario: req.state["session-id"].user,
                        publico: req.payload.publico == 'Público' ? true : false,
                        tags: new_tags,
                        preguntas: preguntas
                    };

                    await repositorioForm.conexion()
                        .then((db) => repositorioForm.addForm(db, form))
                        .then((id) => {
                            respuesta = "";
                            if (id === null) {
                                respuesta = h.redirect(`/formCreado/${id}?mensaje="Error al insertar&tipoMensaje=danger"`)
                            } else {
                                respuesta = h.redirect(`/formCreado/${id}?mensaje="Formulario creado"`)
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
                    var total = 0;
                    await repositorioForm.conexion()
                        .then((db) => repositorioForm.getFormsPg(db, pg, criterio))
                        .then((forms, total) => {
                            formsEjemplo = forms;
                            pgUltima = formsEjemplo.total / 2;
                            if (formsEjemplo.total % 2 > 0) {
                                pgUltima = Math.trunc(pgUltima);
                                pgUltima = pgUltima + 1;
                            }

                        });
                    var paginas = [];
                    var previous = true;
                    var next = true;
                    var start = pg - 1;
                    if (start < 1) {
                        start = 1;
                        previous = false;

                    }
                    var finish = pg + 1;
                    if (finish > pgUltima) {
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
                    // Recorte
                    formsEjemplo.forEach((e) => {
                        e.titulo_largo = e.titulo;
                        if (e.titulo.length > 25) {
                            e.titulo = e.titulo.substring(0, 25) + "...";
                        }
                        if (e.descripcion.length > 80) {
                            e.descripcion = e.descripcion.substring(0, 80) + "...";;
                        }
                    });
                    return h.view('forms/misforms',
                        {
                            forms: formsEjemplo,
                            usuarioAutenticado: req.state["session-id"].user,
                            paginas: paginas,
                            current: pg,
                            hasPrevious: previous,
                            hasNext: next,
                            empty: formsEjemplo.total == 0 ? true : false,
                            hasPrevNext: previous || next,
                            totalForms: formsEjemplo.total
                        },
                        { layout: 'base' });
                }
            },
            // ================== Editar forms =======================
            {
                method: 'POST',
                path: '/form/{id}/edit',
                options: {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {
                    // criterio de form a modificar
                    var criterio = {
                        "_id": require("mongodb").ObjectID(req.params.id),
                        "propietario": req.auth.credentials
                    };
                    var numPreguntas = Object.keys(req.payload).filter(x => x.includes('tipo')).length;
                    var preguntas = [];
                    for (let i = 0; i < numPreguntas; i++) {
                        preguntas.push({
                            pregunta: req.payload[`titulo${i + 1}`],
                            tipo: req.payload[`tipo${i + 1}`],
                            requerida: req.payload[`obligatoria${i + 1}`] == 'on' ? true : false
                        });
                    }
                    var new_tags = "";
                    if (req.payload.tags) {
                        new_tags = req.payload.tags.split(';');
                        if (new_tags.length - 1 > 0) {
                            if (new_tags[new_tags.length - 1] == "") {
                                new_tags.pop();
                            }
                        }
                    }
                    var form = {
                        titulo: req.payload.titulo,
                        descripcion: req.payload.descripcion,
                        propietario: req.state["session-id"].user,
                        publico: req.payload.publico == 'Público' ? true : false,
                        tags: new_tags,
                        preguntas: preguntas
                    };

                    // await no continuar hasta acabar esto
                    // Da valor a respuesta
                    await repositorioForm.conexion()
                        .then((db) => repositorioForm.editForm(db, criterio, form))
                        .then((id) => {
                            respuesta = "";
                            if (id == null) {
                                respuesta = "Error al modificar&tipoMensaje=danger"
                            } else {
                                respuesta = "Editado";
                            }
                        })

                    return h.redirect('/misForms?mensaje=' + respuesta)
                }
            },
            {
                method: 'GET',
                path: '/form/{id}/edit',
                options: {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {

                    var criterio = {
                        "_id": require("mongodb").ObjectID(req.params.id),
                        "propietario": req.auth.credentials
                    };

                    await repositorioForm.conexion()
                        .then((db) => repositorioForm.getForms(db, criterio))
                        .then((forms) => {
                            // ¿Solo una coincidencia por _id?
                            formEdit = forms[0];
                        })
                    var tags = "";
                    for (var i = 0; i < formEdit.tags.length; i++) {
                        tags += formEdit.tags[i] + "; ";
                    }
                    formEdit.tags = tags;
                    user = {};
                    if (req.state["session-id"]) {
                        user = req.state["session-id"].user;
                    }
                    return h.view('forms/editForm',
                        { form: formEdit, usuarioAutenticado: user },
                        { layout: 'base' });
                }
            },

            // ================== Eliminar forms =======================
            {
                method: 'GET',
                path: '/form/{id}/delete',
                options: {
                    auth: 'auth-registrado'
                },
                handler: async (req, h) => {

                    var criterio = {
                        "_id":
                            require("mongodb").ObjectID(req.params.id),
                        "propietario": req.auth.credentials
                    };

                    await repositorioForm.conexion()
                        .then((db) => repositorioForm.deleteForm(db, criterio))
                        .then((resultado) => {
                            console.log("Eliminado")
                        });

                    return h.redirect('/misForms?mensaje="Formulario eliminado"')
                }
            },
            // ================== Buscar forms =======================
            {
                method: 'GET',
                path: '/explore',
                handler: async (req, h) => {

                    var pg = parseInt(req.query.pg);
                    if (req.query.pg == null) {
                        pg = 1;
                    }

                    var criterio = {};
                    var searchBy = "titulo";
                    if (req.query.criterio != null) {
                        searchBy = req.query.tipocriterio;
                        req.state['form-search-filter'] = searchBy;
                        if (searchBy == "titulo") {
                            criterio = {
                                "titulo": {
                                    $regex: ".*" + req.query.criterio + ".*"
                                },
                                "publico": true
                            }
                        } else {
                            var new_tags = req.query.criterio.split(';');
                            if (new_tags[new_tags.length - 1] == "") {
                                new_tags.pop();
                            }
                            var tag_obj = ".*(";
                            for (var i = 0; i < new_tags.length; i++) {
                                if (i != new_tags.length - 1) {
                                    tag_obj += new_tags[i] + "|";
                                } else {
                                    tag_obj += new_tags[i];
                                }

                            }
                            tag_obj += ").*";
                            criterio = {
                                "tags": {
                                    $elemMatch: { $regex: ".*" + tag_obj + ".*" }
                                },
                                "publico": true
                            }
                        }

                    } else {
                        criterio = { "publico": true };

                    }

                    await repositorioForm.conexion()
                        .then((db) => repositorioForm.getFormsPg(db, pg, criterio))
                        .then((forms, total) => {
                            formsEjemplo = forms;

                            pgUltima = formsEjemplo.total / 2;
                            if (formsEjemplo.total % 2 > 0) {
                                pgUltima = Math.trunc(pgUltima);
                                pgUltima = pgUltima + 1;
                            }

                        });
                    var paginas = [];
                    var previous = true;
                    var next = true;
                    var start = pg - 1;
                    if (start < 1) {
                        start = 1;
                        previous = false;

                    }
                    var finish = pg + 1;
                    if (finish > pgUltima) {
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


                    // Recorte
                    formsEjemplo.forEach((e) => {
                        e.titulo_largo = e.titulo;
                        if (e.titulo.length > 25) {
                            e.titulo = e.titulo.substring(0, 25) + "...";
                        }
                        if (e.descripcion.length > 80) {
                            e.descripcion = e.descripcion.substring(0, 80) + "...";;
                        }
                    }); 
                    var user = undefined;
                    if(req.state["session-id"].user){
                        user = req.state["session-id"].user;
                    }
                    return h.view('forms/explore',
                        {
                            forms: formsEjemplo,
                            usuarioAutenticado: user,
                            paginas: paginas,
                            current: pg,
                            hasPrevious: previous,
                            hasNext: next,
                            empty: formsEjemplo.total == 0 ? true : false,
                            hasPrevNext: previous || next,
                            filter: searchBy,
                            totalForms: formsEjemplo.total
                        },
                        { layout: 'base' });
                }
            }
        ])
    }
};
