import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

exports.addMessage = functions.https.onRequest(async (req, res) => {
  const original = req.query.text;
  const writeResult = await admin
    .firestore()
    .collection("messages")
    .add({ original: original });
  res.json({ result: `Message with ID: ${writeResult.id} added.` });
});

exports.makeUppercase = functions.firestore
  .document("/messages/{documentId}")
  .onCreate((snap, context) => {
    const original: string = snap.data().original;
    functions.logger.log("Uppercasing", context.params.documentId, original);

    const uppercase: string = original.toUpperCase();
    return snap.ref.set({ uppercase }, { merge: true });
  });
