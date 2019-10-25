module.exports = {
    name: 'MainRouter',
    register: async(server, options) => {
        miserver = server;
        repositorio = server.methods.getUserRepository();

        server.route([

            // ================== Recursos estáticos =======================
            {
                method: 'GET',
                path: '/{param*}',
                handler: {
                    directory: {
                        path: './public'
                    }
                }
            },
            {
                method: 'GET',
                path: '/',
                handler: async (req, h) => {
                    return h.view('index',
                        { },
                        { layout: 'base'});
                }
            }
        ])
    }
}