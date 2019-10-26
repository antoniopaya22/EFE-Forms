module.exports = {
    conexion: async () => {
        var mongo = require("mongodb");
        //var db = "mongodb://admin:informatica1111@cluster0-shard-00-00-ze9uo.mongodb.net:27017,cluster0-shard-00-01-ze9uo.mongodb.net:27017,cluster0-shard-00-02-ze9uo.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority";
        var db = "mongodb://admin:adminadmin@clustermiw-shard-00-00-x3yuf.mongodb.net:27017,clustermiw-shard-00-01-x3yuf.mongodb.net:27017,clustermiw-shard-00-02-x3yuf.mongodb.net:27017/test?ssl=true&replicaSet=ClusterMIW-shard-0&authSource=admin&retryWrites=true&w=majority";

        promise = new Promise((resolve, reject) => {
            mongo.MongoClient.connect(db, (err, db) => {
                if (err) {
                    resolve(null)
                } else {
                    resolve(db);
                }
            });
        });
        return promise;
    },
    addRespuesta: async(db, respuesta) => {
        promise = new Promise((resolve, reject) => {
            var collection = db.collection('respuestas');
            collection.insert(respuesta, (err, result) => {
                if (err) {
                    resolve(null);
                } else {
                    resolve(result.ops[0]._id.toString());
                }
                db.close();
            });
        });

        return promise;
    },
}
