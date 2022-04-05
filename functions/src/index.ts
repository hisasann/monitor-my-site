import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as https from "https";
import {WebClient} from "@slack/web-api";

admin.initializeApp();

// HTTP STATUS
const PERMANENT_REDIRECT = 308;
const OK = 200;

/**
 * checkRequire
 * @param {string} url
 * @return {Promise}
 */
function checkRequire(url: string) {
  return new Promise((resolve, reject) => {
    const request = https.get(`${url}`, (res) => {
      // console.log('statusCode:', res.statusCode);
      // console.log('headers:', res.headers);

      if (res.statusCode === PERMANENT_REDIRECT || res.statusCode === OK) {
        console.log(`${url}`, "OK");
        resolve();
      } else {
        reject(new Error("URL is not working."));
      }
    });
    request.on("error", reject);
  });
}

exports.addMessage = functions.https.onRequest(async (req, res) => {
  const original = req.query.text;
  const writeResult = await admin
      .firestore()
      .collection("messages")
      .add({original: original});
  res.json({result: `Message with ID: ${writeResult.id} added.`});
});

exports.makeUppercase = functions.firestore
    .document("/messages/{documentId}")
    .onCreate((snap, context) => {
      const original: string = snap.data().original;
      functions.logger.log("Uppercasing", context.params.documentId, original);

      const uppercase: string = original.toUpperCase();
      return snap.ref.set({uppercase}, {merge: true});
    });

// Slack に通知する
const token = functions.config().slack.token;
const web = new WebClient(token);
const conversationId = "C03A06PMU0M";

exports.scheduledFunction = functions.region("asia-northeast1")
    .pubsub.schedule("every 24 hours")
    .timeZone("Asia/Tokyo")
    .onRun(() => {
      Promise.all([
        checkRequire("https://hisasann.dev/"),
        checkRequire("https://dialy.hisasann.dev/"),
        checkRequire("https://blog.hisasann.dev/"),
        checkRequire("https://essay.hisasann.dev/"),
        checkRequire("https://hisasann.github.io/"),
        checkRequire("https://cup-ramen-counter.com/"),
      ]).then(() => {
        (async () => {
          const res = await web.chat.postMessage({
            channel: conversationId, text: "大丈夫でした。",
          });
          console.log("Message sent: ", res.ts);
        })();
      }).catch(() => {
        (async () => {
          const res = await web.chat.postMessage({
            channel: conversationId, text: "ダメでした。",
          });
          console.log("Message sent: ", res.ts);
        })();
      });

      return null;
    });
