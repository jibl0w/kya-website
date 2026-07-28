"use client";

import { useState } from "react";
import Dojah from "react-dojah";

export default function DojahTestPage() {
  const [launched, setLaunched] = useState(false);

  const appID = process.env.NEXT_PUBLIC_DOJAH_APP_ID || "";
  const publicKey = process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY || "";
  const widgetID = process.env.NEXT_PUBLIC_DOJAH_WIDGET_ID_KYC || "";

  const config = { widget_id: widgetID };
  const userData = { first_name: "", last_name: "", dob: "" };
  const metadata = { user_id: "test-user" };

  const response = (type: string, data: unknown) => {
    console.log("Dojah event:", type, data);
  };

  if (!launched) {
    return (
      <div style={{ padding: 40, color: "white", background: "#080C14", minHeight: "100vh" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Dojah Widget Test</h1>
        <p style={{ color: "#8A9AB5", marginTop: 8, fontSize: 14 }}>
          appID: {appID ? "set" : "MISSING"} · publicKey: {publicKey ? "set" : "MISSING"} · widgetID: {widgetID ? "set" : "MISSING"}
        </p>
        <button
          onClick={() => setLaunched(true)}
          style={{ marginTop: 20, background: "#C9A84C", color: "#080C14", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 700, cursor: "pointer" }}
        >
          Launch Dojah Widget
        </button>
      </div>
    );
  }

  return (
    <Dojah
      response={response}
      appID={appID}
      publicKey={publicKey}
      type="custom"
      config={config}
      userData={userData}
      metadata={metadata}
    />
  );
}