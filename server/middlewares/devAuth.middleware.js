const devAuth = async (req, res, next) => {
    req.user = { id: "e5b85486-39e6-4a2f-b4c4-6dbd4b5df6b9" };
    req.auth = { userId: "dev-test" };
    next();
};

export default devAuth;
