import './App.css';
import React, { useRef, useState } from 'react';

// adding compat to fix v9 firebase issue
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
	apiKey: "AIzaSyBkoxMc_EvP9221C-pMJZG5TewuC3VIlt0",
	authDomain: "chat-56199.firebaseapp.com",
	projectId: "chat-56199",
	storageBucket: "chat-56199.appspot.com",
	messagingSenderId: "362215652557",
	appId: "1:362215652557:web:203059006cbfe44f537d84",
	measurementId: "G-R3WDZKKDT8"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
	const [user] = useAuthState(auth);
	return (
		<div className="App">
			<header>
				<SignOut />
			</header>
			<main>
				{user ? <ChatRoom /> : <SignIn />}
			</main>
		</div>
	);
}

function SignIn() {
	const signInWithGoogle = () => {
		const provider = new firebase.auth.GoogleAuthProvider();
		auth.signInWithPopup(provider);
	}
	return (
		<button className='sign-in' onClick={signInWithGoogle}>Masuk dengan Google</button>
	);
}

function SignOut() {
	return auth.currentUser && (
		<button onClick={() => auth.signOut()}>Keluar</button>
	);
}

function ChatRoom() {
	const dummy = useRef();

	const messageRef = firestore.collection('messages');
	const query = messageRef.orderBy('createdAt').limit(25);

	const [messages] = useCollectionData(query, { idField: 'id' });

	const [formValue, setFormValue] = useState('');

	const sendMessage = async (e) => {
		//prevent reloading when somone submited the form
		e.preventDefault();

		const { uid, photoURL } = auth.currentUser;

		await messageRef.add({
			text: formValue,
			createdAt: firebase.firestore.FieldValue.serverTimestamp(),
			uid,
			photoURL
		});

		setFormValue('');

		dummy.current.scrollIntoView({ behavior: 'smooth' });
	}

	return (
		<>
			<div>
				{messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

				<div ref={dummy}></div>
			</div>

			<form onSubmit={sendMessage}>
				<input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
				<button type="submit">Sent</button>
			</form>

			<div>

			</div>
		</>
	);
}

function ChatMessage(props) {
	const { text, uid, photoURL } = props.message;

	const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

	return (
		<div className={`message ${messageClass}`}>
			<img src={photoURL} alt='Image' />
			<p>{text}</p>
		</div>
	);
}

export default App;
