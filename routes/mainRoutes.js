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
                    return h.view('home', {}, { layout: 'base' });
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
