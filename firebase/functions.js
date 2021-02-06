const admin = require("firebase-admin");
const serviceAccount = require("../credentials/GaCampFinServiceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();
const storage = admin.storage();

module.exports = {
  pushToFirestore(JSONData, fileName, collection) {
    try {
      db.collection(collection)
        .doc(fileName)
        .set(JSONData)
        .then(() => {
          console.log(
            "successfully wrote " +
              fileName +
              " to firestore database " +
              collection
          );
        });
    } catch (err) {
      console.log(
        "error writing " +
          fileName +
          "to firestore database  " +
          collection +
          "\n",
        err
      );
    }
  },

  // interface: senObj
  pushPhotoToCloudStorage(senator) {
    const gcBucket = storage.bucket("gs://ga-camp-fin.appspot.com");
    gcBucket
      .upload(`${__dirname}/../pics/${senator.fileName}.jpg`)
      .then((res) =>
        console.log(`uploaded ${senator.fileName}.jpg to Cloud bucket`)
      )
      .catch((err) => {
        if (err)
          console.log(
            `error uploading photo: ${senator.fileName}.jpg to Cloud bucket`
          );
      });
  },
};
