import React from 'react'
import CookieConsent from "react-cookie-consent";

export const CookiesBanner = () => {
  return (
    <CookieConsent
      buttonText="I Agree"
      cookieName="user-consent"
      style={{
        background: "#2B373B",
        color: "#fff",
        fontSize: "14px",
        padding: "10px",
        textAlign: "center",
        position: "fixed",
        bottom: "20px",
        width: "100%",
        left: "0",
        zIndex: "9999",
      }}
      buttonStyle={{
        backgroundColor: "#4e9dff",
        color: "white",
        fontSize: "14px",
        borderRadius: "5px",
        padding: "8px 16px",
        marginLeft: "10px",
        cursor: "pointer",
      }}
      expires={365}
    >
      This site uses cookies to enhance the user experience. By clicking "I Agree", you consent to our use of cookies.
    </CookieConsent>
  );
}
