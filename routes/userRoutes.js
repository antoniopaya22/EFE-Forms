module.exports = {
    name: 'UserRouter',
    register: async(server, options) => {
        miserver = server;
        repositorio = server.methods.getUserRepository();

        server.route([
            // ================== LOGOUT =======================
            {
                method: 'GET',
                path: '/logout',
                handler: async(req, h) => {
                    req.cookieAuth.set({ usuario: "", secreto: "" });
                    return h.view('users/login', {}, { layout: 'base' });
                }
            },
            // =================== LOGIN ===========================
            {
                method: 'GET',
                path: '/login',
                handler: async(req, h) => {
                    return h.view('users/login', {}, { layout: 'base' });
                }
            },
            {
                method: 'POST',
                path: '/login',
                handler: async(req, h) => {
                    password = require('crypto').createHmac('sha256', 'secreto')
                        .update(req.payload.password).digest('hex');

                    usuarioBuscar = {
                        usuario: req.payload.usuario,
                        password: password,
                    }

                    // await no continuar hasta acabar esto
                    // Da valor a respuesta
                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerUsuarios(db, usuarioBuscar))
                        .then((usuarios) => {
                            respuesta = "";
                            if (usuarios == null || usuarios.length == 0) {
                                respuesta = h.redirect('/login?mensaje="Usuario o password incorrecto"')
                            } else {
                                req.cookieAuth.set({
                                    usuario: usuarios[0].usuario,
                                    secreto: "secreto"
                                });
                                respuesta = h.redirect('/misForms')

                            }
                        })
                    return respuesta;
                }
            },
            // ============== REGISTER ====================
            {
                method: 'GET',
                path: '/register',
                handler: async(req, h) => {
                    return h.view('users/register', {}, { layout: 'base' });
                }
            },
            {
                method: 'POST',
                path: '/register',
                handler: async(req, h) => {
                    password = require('crypto').createHmac('sha256', 'secreto')
                        .update(req.payload.password).digest('hex');

                    usuario = {
                        usuario: req.payload.usuario,
                        password: password,
                    }

                    // await no continuar hasta acabar esto
                    // Da valor a respuesta
                    await repositorio.conexion()
                        .then((db) => repositorio.insertarUsuario(db, usuario))
                        .then((id) => {
                            respuesta = "";
                            if (id == null) {
                                respuesta = h.redirect('/register?mensaje="Error al crear cuenta"')
                            } else {
                                respuesta = h.redirect('/login?mensaje="Usuario Creado"')
                                idAnuncio = id;
                            }
                        })

                    return respuesta;
                }
            }
        ])
    }
}
