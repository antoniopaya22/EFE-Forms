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
        ])
    }
}