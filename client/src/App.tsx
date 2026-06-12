import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";

function App() {
  const { getToken } = useAuth();

  const callBackend = async () => {
    const token = await getToken();

    const response = await fetch("http://localhost:5000/protected", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    console.log(data);
    alert(JSON.stringify(data, null, 2));
  };

  return (
    <div style={{ padding: "2rem" }}>
      <SignedOut>
        <SignInButton />
      </SignedOut>

      <SignedIn>
        <UserButton />

        <br />
        <br />

        <button onClick={callBackend}>
          Call Protected Backend Route
        </button>
      </SignedIn>
    </div>
  );
}

export default App;