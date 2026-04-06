import UserActions from "@/actions/UserAction";

export const getHeaders = () => {
  const token = UserActions.getToken();

  console.log('')
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY!,
  };
};