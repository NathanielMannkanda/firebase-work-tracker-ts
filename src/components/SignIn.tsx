import { auth, firestore } from '../firebase/firebase';
import { FirebaseError } from 'firebase/app';
import {
  GoogleAuthProvider,
  EmailAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  linkWithCredential,
  updateProfile
} from 'firebase/auth';

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
 } from 'firebase/firestore';
import { useState, type FormEvent } from 'react';
import GoogleLogo from '/icons/google_logo.png'

import { motion } from 'framer-motion';

interface PendingCredential {
  email: string;
  password: string;
}

function SignIn(){
  const [email, setEmail] = useState("");
  const [passowrd, setPassword] = useState("");
  const [name, setName] = useState("");

  const [isLogin, setIsLogin] = useState(true);

  //to catch errors
  const  [error, setError] = useState("")

  const [pendingCredential, setPendingCredential] = useState<PendingCredential | null>(null);

  //success banner once an account gets linked
  const [linkedPopup, setLinkedPopup] = useState(false);

  const provider = new GoogleAuthProvider();

  //Google sign in
  const handleGoogleSignIn = async () => {
    try{
      const result = await signInWithPopup(
        auth,
        provider
      );

      const user = result.user;


      if (pendingCredential && pendingCredential.email === user.email) {
        try {
          await linkWithCredential(
            user,
            EmailAuthProvider.credential(
              pendingCredential.email,
              pendingCredential.password
            )
          );
        } catch (linkError) {
          //already linked - nothing to do
          if (
            linkError instanceof FirebaseError &&
            linkError.code !== "auth/credential-already-in-use" &&
            linkError.code !== "auth/provider-already-linked"
          ) {
            console.log(linkError);
          }
        }

        setPendingCredential(null);
        setError("");
        setLinkedPopup(true);
        setTimeout(() => setLinkedPopup(false), 4000);
      }

      const userRef = doc(
        firestore,
        "users",
        user.uid
      );

      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName,
          email: user.email,
          role: null,
          createdAt: serverTimestamp()
        });
      }

    }catch(error){
      if (error instanceof FirebaseError && error.code === "auth/account-exists-with-different-credential") {
        const email = error.customData?.email as string | undefined;
        const googleCredential = GoogleAuthProvider.credentialFromError(error);

        //this email already has a password account - if we have the
        //password on hand (they just tried it), sign in with it and
        //attach Google as another sign-in method
        if (pendingCredential && pendingCredential.email === email && googleCredential) {
          try {
            const passResult = await signInWithEmailAndPassword(
              auth,
              pendingCredential.email,
              pendingCredential.password
            );

            await linkWithCredential(passResult.user, googleCredential);

            setPendingCredential(null);
            setError("");
            setLinkedPopup(true);
            setTimeout(() => setLinkedPopup(false), 4000);
          } catch (linkError) {
            console.log(linkError);
            setError("Couldn't link accounts. Please sign in with your password instead.");
            setTimeout(() => setError(""), 5000);
          }
        } else {
          setError("This email already has a password account. Please sign in with your password instead.");
          setTimeout(() => setError(""), 5000);
        }
      } else {
        console.log(error)
      }
    }

  };

  //Email Auth
  const handleEmailAuth = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try{
      //Login
      if (isLogin){
        await signInWithEmailAndPassword(
          auth,
          email,
          passowrd
        );

        setPendingCredential(null);
      } else {
        //sign up
        const result =
          await createUserWithEmailAndPassword(
            auth,
            email,
            passowrd
          );

          await updateProfile(
            result.user,
            {
              displayName: name
            }
          );

          await setDoc(
            doc(
              firestore,
              "users",
              result.user.uid
            ),
            {
              name,
              email,
              role: null,
              createdAt: serverTimestamp()
            }
          );

          setPendingCredential(null);
      }
    }catch(error){
      if (!(error instanceof FirebaseError)) {
        console.log(error);
        return;
      }

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        //could be a wrong password, or a Google-only account with no
        //password set - keep it in case "Continue with Google" resolves it
        setPendingCredential({ email, password: passowrd });

        setError(
          "Incorrect password, or this account uses Google Sign-In. Click \"Sign in with Google to link this account\" below."
        );

        console.log(error);
        return;

      } else if (error.code === "auth/email-already-in-use") {

        //likely a Google account with this email - offer to link it
        setPendingCredential({ email, password: passowrd });

        setError(
          "An account with this email already exists. Click \"Sign in with Google to link this account\" below."
        );

        console.log(error);
        return;

      } else if (error.code === "auth/user-not-found") {

        setError("No account found.");

      } else {

        setError("Something went wrong.");
      }

      setTimeout(() => {
        setError("");
      }, 5000);

      console.log(error);
    }
  };

  return(
    <>
      {error && (
        <motion.div
          initial={{
            opacity: 0,
            x: 100
          }}
          animate={{
            opacity: 1,
            x: 0
          }}
          exit={{
            opacity: 0,
            x: 100
          }}
          transition={{
            duration: 0.3
          }}
          className='fixed top-6 right-4 left-4 md:left-auto md:right-6 max-w-md bg-red-500/10 border border-red-500 text-red-400 px-5 py-4 rounded-2xl shadow-2xl backdrop-bl ur-md fade-in z-50'>
          {error}
        </motion.div>
      )}

      {linkedPopup && (
        <motion.div
          initial={{
            opacity: 0,
            x: 100
          }}
          animate={{
            opacity: 1,
            x: 0
          }}
          exit={{
            opacity: 0,
            x: 100
          }}
          transition={{
            duration: 0.3
          }}
          className='fixed top-6 right-4 left-4 md:left-auto md:right-6 max-w-md bg-green-500/10 border border-green-500 text-green-400 px-5 py-4 rounded-2xl shadow-2xl z-50'>
          Account linked — you can now sign in with Google or your password.
        </motion.div>
      )}
      <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4">

      <div className='w-full max-w-md bg-[#1c1c1e] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl'>
        <h1 className='text-4xl font-bold text-white mb-2'>
          Work Tracker
        </h1>

        <p className='text-gray-400 mb-8'>
          Manage workers, sessions and tasks
        </p>

        <form
          onSubmit={handleEmailAuth}
          className='space-y-4'
        >
          {!isLogin && (
            <input
              type='text'
              placeholder='Full Name'
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className='w-full bg-[#2c2c2e] text-white rounded-2xl p-4 border border-gray-700 outline-none'
            />
          )}

          <input
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full bg-[#2c2c2e] text-white rounded-2xl p-4 border border-gray-700 outline-none"
          />

          <input
            type='password'
            placeholder='Password'
            value={passowrd}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full bg-[#2c2c2e] text-white rounded-2xl p-4 border border-gray-700 outline-none"
          />

          <button
            type='submit'
            className='w-full bg-[#ff9f0a] hover:opacity-90 text-black font-semibold py-4 rounded-2xl transition cursor-pointer'
          >
            {isLogin
              ? "Sign In"
              : "Create Account"
            }
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">

            <div className="flex-1 h-px bg-gray-800"></div>

            <p className="text-gray-500 text-sm">
              OR
            </p>

            <div className="flex-1 h-px bg-gray-800"></div>

          </div>

          <button
            onClick={handleGoogleSignIn}
            className={`w-full bg-white text-black py-4 rounded-2xl font-semibold hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-3 ${
              pendingCredential ? "ring-2 ring-[#ff9f0a]" : ""
            }`}
          >
            <img src={GoogleLogo} width="20" height="20"/>

            {pendingCredential
              ? "Sign in with Google to link this account"
              : "Continue with Google"
            }
          </button>

          <button
            onClick={() =>
              setIsLogin(!isLogin)
            }
            className="w-full mt-6 text-sm text-gray-400 hover:text-white transition hover:cursor-pointer"
          >
            {isLogin
              ? "Don't have an account? Sign Up"
              : "Already have an account? Sign In"}
          </button>

        </div>

      </div>
    </>
  );

}

export default SignIn;
