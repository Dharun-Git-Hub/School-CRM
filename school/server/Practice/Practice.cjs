// const xlsx = require('xlsx');

// async function importExcelToMongoDB(filePath) {
//     try{
//         const workbook = xlsx.readFile(filePath);
//         const sheetName = workbook.SheetNames[0];
//         const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
//         console.log(data)
//     }
//     catch(error){
//         console.error('Error importing data:', error);
//     }
// }

// importExcelToMongoDB('../../xlxs/Book1.xlsx');

// // const xlsx = require('xlsx');

// // const workbook = xlsx.readFile('../../xlxs/Book1.xlsx');

// // const sheetName = workbook.SheetNames[0];
// // const worksheet = workbook.Sheets[sheetName];

// // let jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

// // const defaultHeaders = ['Roll', 'Name', 'Grade'];
// // if (jsonData.length > 0 && jsonData[0].some(cell => cell === undefined || cell === null)) {
// //   jsonData[0] = defaultHeaders;
// // }
// // const result = xlsx.utils.sheet_to_json(worksheet, { header: jsonData[0] });

// // console.log(result);

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

// Session middleware
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: 'YOUR_GOOGLE_CLIENT_ID',
    clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
    callbackURL: '/auth/google/callback'
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

app.get('/', (req, res) => res.send('Home Page'));
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => res.redirect('/profile')
);
app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/');
  res.send(`Hello, ${req.user.displayName}`);
});
app.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/'));
});

// Start server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
