// MÓDULOS
const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const Cookie = require('@hapi/cookie');
const userRoutes = require("./routes/userRoutes.js");
const mainRoutes = require("./routes/mainRoutes.js");
const userRepository = require("./repositories/userRepository");
const Error = require('hapi-error');


// SERVER
const server = Hapi.server({
    port: 8080,
    host: 'localhost',
});

// METODOS COMUNES  
server.method({
    name: 'getUserRepository',
    method: () => {
        return userRepository;
    },
    options: {}
});


// INICIAR SERVER
const iniciarServer = async() => {
    try {
        // Registrar el Inter antes de usar directory en routes
        await server.register(Inert);
        await server.register(Vision);
        await server.register(Cookie);
        //Configurar seguridad

        await server.auth.strategy('auth-registrado', 'cookie', {
            cookie: {
                name: 'session-id',
                password: 'secretosecretosecretosecretosecretosecretosecreto',
                isSecure: false
            },
            redirectTo: '/login',
            validateFunc: function(request, cookie) {
                promise = new Promise((resolve, reject) => {

                    usuarioCriterio = { "usuario": cookie.usuario };
                    if (cookie.usuario != null && cookie.usuario != "" &&
                        cookie.secreto == "secreto") {

                        resolve({
                            valid: true,
                            credentials: cookie.usuario
                        });

                    } else {
                        resolve({ valid: false });
                    }
                });

                return promise;
            }
        });

        const handlebars = require('handlebars');

        await server.register(userRoutes);
        await server.register(mainRoutes);
        await server.register(Error);
        await server.views({
            engines: {
                html: require('handlebars')
            },
            relativeTo: __dirname,
            path: './views',
            layoutPath: './views/layouts',
            context: {
                sitioWeb: "wallapep"
            }
        });
        await server.start();
        console.log('Servidor localhost:8080');
    } catch (error) {
        console.log('Error ' + error);
    }
};

iniciarServer();
