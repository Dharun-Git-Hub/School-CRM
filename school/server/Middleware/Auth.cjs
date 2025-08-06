const checkAuth = (req,res,next) => {
    const key = req.headers['key'] === 'auth_key'
    if(key)
        next()
    return res.json({status:'failure',message:'Unauthorized Access'})
}

module.exports = checkAuth