import React from 'react';

import { GoogleLogin } from '@react-oauth/google';

import { verifyCredential } from "pastecat-utils/firebase.js";

const renderSignInPrompt = (user) => {
  if (!user) {
    return (
      <div>
        <p>🔓 Please sign in with Google</p>
      </div>
    );
  } else {
    return (
      <div>
        <p>🔐 Signed in as: {user.email}</p>
      </div>
    );
  }
};

export const renderCommonHeader = (user, isLandscape) => {
  return (
    <div>
      <div className="containers-header">
        <h1>PasteCat <a href="/create/">🐿️ 🐖</a></h1>
        <div className="containers-signin">
          {isLandscape ? renderSignInPrompt(user) : null}
          <GoogleLogin
            onSuccess={
              async (response) => await verifyCredential(response.credential)
            }
            type="icon"
            shape="circle"
            onError={() => console.log("Google login failed")}
          />
        </div>
      </div>
      <p>Brought to you by 🍳 and 🍓 with ❤️</p>
      {isLandscape ? null : renderSignInPrompt(user)}
    </div>
  );
};
