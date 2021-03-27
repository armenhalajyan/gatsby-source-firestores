const report = require('gatsby-cli/lib/reporter');
const firebase = require('firebase-admin');
const crypto = require('crypto');
const { resolve } = require('path');

const getDigest = (id) => crypto.createHash('md5').update(id).digest('hex');

exports.sourceNodes = async ({ actions }, { bases }) => {
    const { createNode } = actions;

    const createDocumentNode = async ({ type, parent = null }, db) => {
        const collectionName =
            parent && parent.collectionName
                ? `${parent.collectionName}/${parent.id}/${type.collection}`
                : type.collection;

        const snapshot = await db.collection(collectionName).get();
        const promises = [];

        snapshot.forEach((doc) => {
            promises.push(
                new Promise(async (resolve) => {
                    let children = [];
                    if (type.subCollections) {
                        const subCollectionIds = await Promise.all(
                            type.subCollections.map((subCollection) =>
                                createDocumentNode({
                                    type: subCollection,
                                    parent: {
                                        id: doc.id,
                                        ...type,
                                        collectionName,
                                    },
                                }, db)
                            )
                        );

                        type.subCollections.map((_subCollection, i) => {
                            children = [...children, ...subCollectionIds[i]];
                        });
                    }

                    createNode({
                        id: doc.id,
                        parent: parent ? parent.id : null,
                        children,
                        internal: {
                            type: type.type,
                            contentDigest: getDigest(doc.id),
                        },
                        ...type.map(doc.data()),
                    });
                    
                    resolve(doc.id);
                })
            );
        });

        return Promise.all(promises)

    };

    await bases.forEach(async (base) => {
        let current = null;
        try {
            if (firebase.apps) {
                current = firebase.initializeApp(
                    {
                        credential: firebase.credential.cert(base.credential),
                    },
                    base.name
                );
            }
        } catch (e) {
            report.warn(
                'Could not initialize Firebase. Please check `credential` property in gatsby-config.js'
            );
            report.warn(e);
            return;
        }
        const db = current.firestore();

        await Promise.all(
            base.types.map((type) => createDocumentNode({ type }, db))
        );
    });

    return;
};
