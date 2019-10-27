module.exports = {
    conexion: async() => {
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
    addForm: async(db, form) => {
        promise = new Promise((resolve, reject) => {
            var collection = db.collection('forms');
            collection.insert(form, (err, result) => {
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
    getFormsPg: async (db, pg, criterio) => {
        promise = new Promise((resolve, reject) => {
            var collection = db.collection('forms');
            collection.count( criterio, (err, count) => {
                collection.find(criterio).skip( (pg-1)*2 ).limit( 2 )
                    .toArray( (err, result) => {

                        if (err) {
                            resolve(null);
                        } else {
                            result.total = count;
                            resolve(result);
                        }
                        db.close();
                    });
            })
        });

        return promise;
    },
    getForms: async (db, criterio) => {
        promise = new Promise((resolve, reject) => {
            var collection = db.collection('forms');
            collection.find(criterio).toArray( (err, result) => {
                if (err) {
                    resolve(null);
                } else {
                    // lista de anuncios
                    resolve(result);
                }
                db.close();
            });
        });

        return promise;
    },
    editForm : async (db, criterio, form) => {

        promise = new Promise((resolve, reject) => {
            var collection = db.collection('forms');
            collection.update(criterio, {$set: form}, (err, result) => {
                if (err) {
                    resolve(null);
                } else {
                    // modificado
                    resolve(result);
                }
                db.close();
            });
        });

        return promise;
    },
    deleteForm : async (db, criterio) => {
        promise = new Promise((resolve, reject) => {
            var collection = db.collection('forms');
            collection.remove(criterio, (err, result) => {
                if (err) {
                    resolve(null);
                } else {
                    resolve(result);
                }
                db.close();
            });
        });

        return promise;
    }
}
