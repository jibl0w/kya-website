"use client";

import { Amplify } from "aws-amplify";
import awsConfig from "../../aws-exports";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(awsConfig);

export default function LoginPage() {
  return (
    <div style={{ padding: "40px" }}>
      <h1>KYA Secure Login</h1>

      <Authenticator>
        {({ signOut, user }) => (
          <main>
            <h2>Welcome {user?.username}</h2>

            <button onClick={signOut}>
              Sign Out
            </button>
          </main>
        )}
      </Authenticator>
    </div>
  );
}