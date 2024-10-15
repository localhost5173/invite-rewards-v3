import admin from "firebase-admin";
import devServiceAccount from "../firebase/firebaseDev.json" assert { type: "json" };; 
import prodServiceAcount from "../firebase/firebaseProd.json" assert { type: "json" };;

export let db: FirebaseFirestore.Firestore;

export default async function initFirebase(devMode: boolean) {

  admin.initializeApp({
    credential: admin.credential.cert((devMode ? devServiceAccount : prodServiceAcount) as admin.ServiceAccount),
  });

  db = admin.firestore();
}