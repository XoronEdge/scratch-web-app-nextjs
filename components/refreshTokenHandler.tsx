import { useSession } from "next-auth/react";
import { useEffect } from "react";

const RefreshTokenHandler = (props) => {
  const { data: session } = useSession();

  useEffect(() => {
    if (!!session) {
      console.log("session", session);
      // We did set the token to be ready to refresh after 23 hours, here we set interval of 23 hours 30 minutes.
      const timeRemaining = Math.round(
        (session.accessTokenExpiry - Date.now()) / 1000
      );
      console.log("timeRemaining", timeRemaining);
      props.setInterval(timeRemaining > 0 ? timeRemaining : 0);
    }
  }, []);

  return null;
};

export { RefreshTokenHandler };
