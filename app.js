// MÓDULOS
const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const Cookie = require('@hapi/cookie');
const userRoutes = require("./routes/userRoutes.js");
const formRoutes = require("./routes/formRoutes.js");
const mainRoutes = require("./routes/mainRoutes.js");
const userRepository = require("./repositories/userRepository");
const formRepository = require("./repositories/formRepository");
const respuestaRepository = require("./repositories/respuestaRepository");
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

server.method({
    name: 'getFormRepository',
    method: () => {
        return formRepository;
    },
    options: {}
});

server.method({
    name: 'getRespuestaRepository',
    method: () => {
        return respuestaRepository;
    },
    options: {}
});

var handlebars = require('handlebars');
handlebars.registerHelper("sumar", (a, b) => {
    return a + b;
})
handlebars.registerHelper("select", (a, b) => {
    if(a == b) return "selected";
    return "";
})
handlebars.registerHelper("check", (a) => {
    if(a) return "checked";
    return "";
})
handlebars.registerHelper("getTipo", (a) => {
    if(a === "Texto") return "text";
    else if(a === "Fecha") return "date";
    else if(a === "Número") return "number";
    else return "text";
})
handlebars.registerHelper("get", (a, b) => {
    return a[parseInt(b)].pregunta;
})

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

                    usuarioCriterio = { "user": cookie.user };
                    if (cookie.user != null && cookie.user != "" &&
                        cookie.secreto == "secreto") {

                        resolve({
                            valid: true,
                            credentials: cookie.user
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
        await server.register(formRoutes);
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
