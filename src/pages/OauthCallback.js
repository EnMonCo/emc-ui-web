import React, { FC, useEffect } from "react";

// import { Google, Azure } from "./config";

const OauthCallback = ({ location }) => {
  useEffect(async () => {
    // TODO: Login from here
    // const code = (location.search.match(/code=([^&]+)/) || [])[1];
    // const state = (location.search.match(/state=([^&]+)/) || [])[1];
    // const qParams = [
    //   `code=${code}`,
    //   `redirect_uri=${
    //     state === "google" ? Google.REDIRECT_URI : Azure.REDIRECT_URI
    //   }`,
    //   `scope=${state === "google" ? Google.SCOPE : Azure.SCOPE}`
    // ].join("&");
    // fetch(`/api/auth-from-code/${state}?${qParams}`, {
    //   credentials: "include"
    // })
    //   .then(res => res.json())
    //   .then(res => console.log(res))
    //   .catch(console.error);
  }, []);

  return <p>
    Logging in...
  </p>;
};

export default OauthCallback;
