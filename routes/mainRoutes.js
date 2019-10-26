module.exports = {
    name: 'MainRouter',
    register: async(server, options) => {
        miserver = server;
        repositorio = server.methods.getUserRepository();

        server.route([

            // ================== Home Page =======================
            {
                method: 'GET',
                path: '/',
                handler: async(req, h) => {
                    user = undefined;
                    if(req.state["session-id"]){
                        user = req.state["session-id"].user;
                    }
                    return h.view('home', 
                    {
                        usuarioAutenticado: user // añadir esto a todas las rutas que necesiten el usuario
                    }, 
                    { layout: 'base' });
                }
            },

            // ================== Error Page =======================
            {
                method: 'GET',
                path: '/error',
                handler: async(req, h) => {
                    return h.view('error', {}, { layout: 'base' });
                }
            },

            // ================== Recursos estáticos =======================
            {
                method: 'GET',
                path: '/{param*}',
                handler: {
                    directory: {
                        path: './public'
                    }
                }
            }
        ])
    }
}
