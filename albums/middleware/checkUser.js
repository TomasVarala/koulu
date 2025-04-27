const checkUserQuery = (req, res, next) => {
    if (req.method === 'DELETE' && !req.query.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
};

module.exports = checkUserQuery;
