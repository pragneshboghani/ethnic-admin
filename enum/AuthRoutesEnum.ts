export const AuthRoutes = {
    SIGN_IN: "/sign-in",
    HOME: "/",
};

export const ProtectedRoutes = {
    ACCOUNT: "/account",
};

export const PUBLIC_ROUTES = [
    AuthRoutes.SIGN_IN,
    AuthRoutes.HOME,
];
