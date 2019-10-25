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
                    req.cookieAuth.set({ user: "", secreto: "" });
                    return h.view('users/login', {}, { layout: 'login-base' });
                }
            },
            // =================== LOGIN ===========================
            {
                method: 'GET',
                path: '/login',
                handler: async(req, h) => {
                    return h.view('users/login', {}, { layout: 'login-base' });
                }
            },
            {
                method: 'POST',
                path: '/login',
                handler: async(req, h) => {
                    password = require('crypto').createHmac('sha256', 'secreto')
                        .update(req.payload.password).digest('hex');

                    userBuscar = {
                        user: req.payload.user,
                        password: password,
                    }

                    // await no continuar hasta acabar esto
                    // Da valor a respuesta
                    await repositorio.conexion()
                        .then((db) => repositorio.obtenerUsuarios(db, userBuscar))
                        .then((users) => {
                            respuesta = "";
                            redir = "";
                            if (users == null || users.length == 0) {
                                respuesta =  "Credenciales incorrectas"
                                redir = '/login?mensaje='+respuesta;

                            } else {
                                req.cookieAuth.set({
                                    user: users[0].user,
                                    secreto: "secreto"
                                });
                                respuesta = "Identificado correctamente";
                                redir = '/misForms?mensaje='+respuesta;
                            }
                        })
                    return h.redirect(redir);
                }
            },
            // ============== REGISTER ====================
            {
                method: 'GET',
                path: '/register',
                handler: async(req, h) => {
                    return h.view('users/register', {}, { layout: 'login-base' });
                }
            },
            {
                method: 'POST',
                path: '/register',
                handler: async(req, h) => {
                    password = require('crypto').createHmac('sha256', 'secreto')
                        .update(req.payload.password).digest('hex');
                    password2 = require('crypto').createHmac('sha256', 'secreto')
                        .update(req.payload.password2).digest('hex');
                    
                    if(password != password2){
                        return;
                    }

                    user = {
                        user: req.payload.user,
                        password: password,
                    }

                    // await no continuar hasta acabar esto
                    // Da valor a respuesta
                    await repositorio.conexion()
                        .then((db) => repositorio.insertarUsuario(db, user))
                        .then((id) => {
                            respuesta = "";
                            if (id == null) {
                                respuesta = h.redirect('/register?mensaje="Error al crear cuenta"')
                            } else {
                                respuesta = h.redirect('/login')
                                idAnuncio = id;
                            }
                        })

                    return respuesta;
                }
            }
        ])
    }
}
