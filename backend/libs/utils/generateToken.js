import jwt from 'jsonwebtoken';

// This function generates a JWT, encodes it with a secret key, and sets it as a cookie in the response.

export const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, { //data to be encoded in the token. Here, the userId is included as the payload.
        expiresIn: '15d'
    })

    res.cookie("jwt", token, {
        maxAge: 15*24*60*60*1000, //Miliseconds
        httpOnly: true,   //prevents XSS attacks cross-site scripting attacks
        sameSite: "strict",   //CSRF attacks cross-site request forgery attacks
        secure: process.env.NODE_ENV !== "developlent", 

    })
}