// Dependencies
var db = require("../models");
var passport = require("../config/passport.js");
const upload = require("../config/multerConfig"); 
const nodemailer = require('nodemailer');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require("bcryptjs");
const app = express()

// Dummy database
const users = [];

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'wittersocial@gmail.com',
        pass: process.env.GMAIL_PW
    }
});

// Middleware to parse JSON
app.use(bodyParser.json());

// Dummy function to generate a random verification code
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000);
}

module.exports = function(app) {

    // ============================================================
    // LOGIN ROUTE    
    // ============================================================
    app.post("/api/login", async function(req, res, next) {

        try {
            const user = await db.User.findOne({
                where: {
                    username: req.body.username,
                    isVerified: true
                }
            });
    
            if (user) {
                // Mark the user as verified
                console.log("User is verified")
            } else {
                console.log("user is not verified")
                return;
            }
        } catch (error) {
            console.error("Error validating if Email is verified:", error);
            res.status(500).json({ error: "Error verifying email" });
        }
        
        passport.authenticate("local", function(err, user, info) {
            if (err) {
                // Handle unexpected errors
                console.error("Error during authentication:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
    
            if (!user) {
                // Handle authentication failure (invalid username or password)
                console.log("Authentication failed");
                return res.status(401).json({ error: "Invalid username or password" });
            }
    
            // Authentication successful, log in the user
            req.logIn(user, function(err) {
                if (err) {
                    // Handle login error
                    console.error("Error during login:", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }
    
                // Return the user data
                return res.json(req.user);
            });
        })(req, res, next);
    });

    // ============================================================
    // PASSWORD RESET ROUTE    
    // ============================================================
    app.post("/api/resetPassword", async function(req, res) {
        try {
            // Generate a new verification code
            const verificationCode = generateVerificationCode();
    
            // Update the user's verification code in the database
            const user = await db.User.findOne({ where: { email: req.body.email } });

            if (user) {
                await user.update({ verificationCode: verificationCode.toString() });
            } else {
                return res.status(404).json({ success: false, error: "User not found" });
            }
    
            const mailOptions = {
                from: 'wittersocial@gmail.com',
                to: req.body.email,
                subject: 'Password Reset Verification Code',
                html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`
                };
    
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.error("Error sending password reset verification email:", error);
                    res.status(500).json({ success: false, error: "Error sending password reset verification email" });
                } else {
                    console.log("Password reset Verification email sent:", info.response);
                    res.json({ success: true });
                }
            });
        } catch (error) {
            console.error("Error resetting password:", error);
            res.status(500).json({ success: false, error: "Error resetting password", details: error });
        }
    })

    // ============================================================
    // RESET PASSWORD VERIFICATION CODE CHECKER ROUTE    
    // ============================================================
    app.post("/api/passwordResetVerifyCode", async function(req, res) {
        try {
            // Update the user's verification code in the database
            const user = await db.User.findOne({ where: { verificationCode: req.body.verificationCode } });

            if (user) {
                return res.json({ success: true });
            } else {
                return res.status(404).json({ success: false, error: "User not found" });
            }
        } catch (error) {
            console.error("Error resetting password on pwresetverifycode:", error);
            res.status(500).json({ success: false, error: "Error resetting password", details: error });
        }
    })

    // ============================================================
    // RESET PASSWORD RESPONSE ROUTE   
    // ============================================================
    app.post("/api/newPasswordResponse", async function(req, res) {
        try {
            const { email, verificationCode, newPassword } = req.body;
    
            // Find the user by email and verification code
            const user = await db.User.findOne({
                where: {
                    email: email,
                    verificationCode: verificationCode,
                },
            });
    
            if (!user) {
                return res.status(404).json({ success: false, error: "User not found or verification code is invalid" });
            }
    
            // Update the password and clear the verification code
            await user.update({
                password: bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10)),
                verificationCode: null,
            })

            const mailOptions = {
                from: 'wittersocial@gmail.com',
                to: req.body.email,
                subject: 'Witter Account Password Reset',
                html: `<p>Your password has been reset.  If this was not you, please report it to our service team by sending us an email back.  Thanks!</p>`        
            };
    
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.error("Error sending password reset confirmation:", error);
                    res.status(500).json({ error: "Error sending password reset confirmation email" });
                } else {
                    console.log(":", info.response);
                }
            })
    
            return res.json({ success: true, message: "Password updated successfully" });
        } catch (error) {
            console.error("Error updating password:", error);
            return res.status(500).json({ success: false, error: "Error updating password", details: error });
        }
    })

    // ============================================================
    // VERIFY EMAIL DURING SIGN UP ROUTE   
    // ============================================================
    app.post("/api/verify_email", async function(req, res) {
        try {
            const user = await db.User.findOne({
                where: {
                    email: req.body.email,
                    verificationCode: req.body.verificationCode
                }
            });
    
            if (user) {
                // Mark the user as verified
                await user.update({ isVerified: true, verificationCode: null });
                res.json({ success: true, message: "Email verified successfully" });
        
                const mailOptions = {
                    from: 'wittersocial@gmail.com',
                    to: req.body.email,
                    subject: 'Witter Account Verified',
                    html: `<p>Thank you for verifying your account, you may now login!</p>`        
                };
        
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.error("Error sending verification email:", error);
                        res.status(500).json({ error: "Error sending verification email" });
                    } else {
                        console.log(":", info.response);
                        res.json({ success: true, redirect: `/verificationCode?email=${req.body.email}` });
                    }
                })

            } else {
                res.status(401).json({ success: false, error: "Invalid verification code" });
            }
        } catch (error) {
            console.error("Error verifying email:", error);
            res.status(500).json({ error: "Error verifying email" });
        }
    });
    
    // ============================================================
    // SIGN UP ROUTE   
    // ============================================================
    app.post("/api/signup", async function(req, res) {
    try {
        // Generate a verification code
        const verificationCode = generateVerificationCode();

        const defaultProfilePicture = "./defaultProfilePic.png";

        // Create a new user with the verification code
        const newUser = await db.User.create({
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            verificationCode: verificationCode, // Set the verification code during user creation
            // profilePicture: defaultProfilePicture 
            // Set profile picture to noProfilePic.png by default
        })

        const mailOptions = {
            from: 'wittersocial@gmail.com',
            to: req.body.email,
            subject: 'Witter Email Verification Code',
            html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>
            <p>Please use this link to get back to the verification page: 
            <a href="https://localhost:8080/verificationCode?email=${req.body.email}">Verification Page</a></p>`        };


        

        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.error("Error sending verification email:", error);
                res.status(500).json({ error: "Error sending verification email" });
            } else {
                console.log("Verification email sent:", info.response);
                res.json({ success: true, redirect: `/verificationCode?email=${req.body.email}` });

            }
        });
        } catch (error) {
            console.error("Error creating user:", error);
            res.status(401).json({ error: "Error creating user", details: error });
        }
    });

    // ============================================================
    // CHECK IF USER EXISTS ROUTE   
    // ============================================================
    app.post("/api/check_user_existence", async function (req, res) {
        try {
            const user = await db.User.findOne({
                where: {
                    email: req.body.email,
                },
            });

            res.json({ exists: !!user }); // Send whether the user exists as JSON
        } catch (error) {
            console.error("Error checking user existence:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    // ============================================================
    // RESEND VERIFICATION CODE ROUTE   
    // ============================================================
    app.post("/api/resendCode", async function(req, res) {
        try {
            // Generate a new verification code
            const verificationCode = generateVerificationCode();

            // Update the user's verification code in the database
            const user = await db.User.findOne({ where: { email: req.body.email } });

            if (user) {
                await user.update({ verificationCode: verificationCode });
            } else {
                return res.status(404).json({ success: false, error: "User not found" });
            }

            const mailOptions = {
                from: 'wittersocial@gmail.com',
                to: req.body.email,
                subject: 'Witter Email Verification Code',
                html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>
                <p>Please use this link to get back to the verification page: 
                <a href="https://localhost:8080/verificationCode?email=${req.body.email}">Verification Page</a></p>`
                };

            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.error("Error sending verification email:", error);
                    res.status(500).json({ success: false, error: "Error sending verification email" });
                } else {
                    console.log("Verification email sent:", info.response);
                    res.json({ success: true });
                }
            });
        } catch (error) {
            console.error("Error resending the verification email:", error);
            res.status(500).json({ success: false, error: "Error resending verification", details: error });
        }
    });
    
    // ============================================================
    // DELETE ACCOUNT AFTER VERIFICATION TIMEOUT ROUTE 
    // ============================================================
    app.post("/api/verificationTimeout", async function(req, res) {
        try {
            // Update the user's verification code in the database
            const user = await db.User.findOne({ where: { email: req.body.email } });

            if (user) {
                await user.destroy();
                return res.json({ success: true, message: "Account deleted successfully" });
            } else {
                return res.status(404).json({ success: false, error: "User not found" });
            }

        } catch (error) {
            console.error("Error deleting account", error);
            res.status(500).json({ success: false, error: "Error removing account", details: error });
        }
    })

    // ============================================================
    // CHECK FOR EXISTING USERNAME ROUTE 
    // ============================================================
    app.post("/api/check_username", function(req, res) {
        const usernameToCheck = req.body.username;

        // Query the database to check if the username exists
        db.User.findOne({
            where: {
                username: usernameToCheck
            }
        })
        .then(function(user) {
            res.json({ exists: !!user }); // Send whether the username exists as JSON
        })
        .catch(function(err) {
            console.error("Error checking username:", err);
            res.status(500).json({ error: "Internal Server Error" });
        });
    });

    // ============================================================
    // CHECK IF EMAIL EXISTS ROUTE   
    // ============================================================
    app.post("/api/check_email", function(req, res) {
        const emailToCheck = req.body.email;

        // Query the database to check if the email exists
        db.User.findOne({
            where: {
                email: emailToCheck
            }
        })
        .then(function(user) {
            res.json({ exists: !!user }); // Send whether the email exists as JSON
        })
        .catch(function(err) {
            console.error("Error checking email:", err);
            res.status(500).json({ error: "Internal Server Error" });
        });
    });

    // ============================================================
    // LOGOUT ROUTE
    // ============================================================
    app.get("/logout", function(req, res) {
        // req.logout is used by passport.js - commonly used with express.js
        req.logout(function(err) {
            if (err) {
                // Handle error, e.g., send an error response
                return res.status(500).json({ error: "Logout failed" });
            }
    
            // Successful logout, redirect or send a success response
            res.redirect("/");
        });
    });

    // ============================================================
    // GET USER DATA ROUTE 
    // ============================================================
    app.get("/api/user_data", function(req, res) {
        if (!req.user) {
            console.log("Not logged in");
            res.json({});
        } else {
            res.json({
                username: req.user.username,
                password: req.user.password,
                profilePicture: req.user.profilePicture
            });
        }
    });

    // ============================================================
    // GET FOLLOWER COUNT AND FOLLOWERS LIST FOR A USER
    // ============================================================
    app.get('/api/users/:username/followers', async function(req, res) {
        const username = req.params.username;

        try {
            // Find the user by username
            const user = await db.User.findOne({
                where: { username: username },
                attributes: ['followers', 'profilePicture']  // Fetch only the followers field
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Parse the followers field (which is stored as JSON)
            let followers = JSON.parse(user.followers || '[]');

            // Respond with the follower count and the list of followers
            return res.json({
                followerCount: followers.length,
                followers: followers,  // Return the list of followers
                ProfilePic: user.profilePicture
            });

        } catch (error) {
            console.error('Error fetching followers:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // ============================================================
    // FETCH ALL WITS ROUTE WITH PAGINATION
    // ============================================================
    app.get("/api/all_wits", function(req, res) {
        // Get limit and offset from the query parameters
        // const limit = parseInt(req.query.limit) || 10;  // Number of wits to load per request
        // const offset = parseInt(req.query.offset) || 0;  // Offset to load the next batch

        db.Wit.findAll({
            order: [['createdAt', 'DESC']]  // Fetch newest first
            // limit: limit,                    // Limit number of wits to return
            // offset: offset                   // Skip records for pagination
        })
        .then(function(results) {
            res.json(results);
        })
        .catch(function(error) {
            console.error("Error fetching wits:", error);
            res.status(500).json({ error: "Failed to fetch wits" });
        });
    });

    // ============================================================
    // FETCH ALL WITS FROM USERS YOU ARE FOLLOWING
    // ============================================================
    app.get("/api/all_following_wits", async function(req, res) {

        try {
            const loggedInUserId = req.user.id; // Assuming you're using session or JWT for auth

            // Get the logged-in user and parse their following field
            const user = await db.User.findOne({
                where: { id: loggedInUserId },
                attributes: ['following'] // Only select the following column
            });

            if (!user || !user.following) {
                return res.status(404).json({ error: "User not found or not following anyone" });
            }

            // Parse the following list (assuming it's stored as a JSON array)
            const followingArray = JSON.parse(user.following || '[]');

            if (followingArray.length === 0) {
                return res.json([]); // No users followed, return empty array
            }

            // Fetch all wits from users the logged-in user is following
            const wits = await db.Wit.findAll({
                where: {
                    author: followingArray // Fetch wits where the author is in the following array
                },
                order: [['createdAt', 'DESC']]  // Fetch newest wits first
                // limit: req.query.limit || 10,     // Limit the number of results
                // offset: req.query.offset || 0     // Skip records for pagination
            });

            res.json(wits);
        } catch (error) {
            console.error("Error fetching wits:", error);
            res.status(500).json({ error: "Failed to fetch wits" });
        }
    });


// ============================================================
// FETCH ALL WITS BY USER ROUTE FOR IMAGES  
// ============================================================
app.post("/api/witter", upload.single("image"), function (req, res) {
    console.log("Received Data:", req.body);  // Log other form data
    console.log("Received File:", req.file);  // Log the file data
    
    const { author, body } = req.body;
    const image = req.file;

    // Ensure the correct URL is used for S3, and handle local storage gracefully (if applicable)
    const imageUrl = image && image.location ? image.location : null;

    console.log("Author:", author);
    console.log("Body:", body);
    console.log("Image URL:", imageUrl);  // S3 URL

    db.Wit.create({
        author: author,
        body: body,
        image: imageUrl  // Save only the S3 URL (or null if no image was uploaded)
    })
    .then(function (results) {
        console.log("Wit Created:", results);
        res.json(results); // Send the created wit back as JSON
    })
    .catch(function (err) {
        console.log("Error creating wit:", err);
        res.status(401).json(err);
    });
});


    // ============================================================
    // FETCH TOP TRENDING WITS ROUTE 
    // ============================================================
    app.get("/api/top_wits", function(req, res) {
        db.Wit.findAll({
            limit: 3,
            order: [[db.Sequelize.fn('length', db.Sequelize.col('likes')), 'DESC']]  
        }).then(function(results) {
            res.json(results.reverse());
        }).catch(function(error) {
            console.error("Error fetching top wits:", error);
            res.status(500).json({ success: false, error: "Internal Server Error" });
        });
    });

    // ============================================================
    // LIKE WIT ROUTE
    // ============================================================

    app.post("/api/wits/:witId/like", async function (req, res) {
        const witId = req.params.witId;
        const username = req.body.username;
    
        try {
            // Find the wit by ID and include the likes field
            const wit = await db.Wit.findByPk(witId, { attributes: ['id', 'likes'] });
    
            if (!wit) {
                return res.status(404).json({ success: false, error: "Wit not found" });
            }
    
            // Safely parse the likes field or default to an empty array if parsing fails
            let existingLikes;
            try {
                existingLikes = JSON.parse(wit.likes || '[]'); // Default to an empty array if likes is null or invalid
            } catch (error) {
                console.warn("Invalid likes field, defaulting to empty array:", wit.likes);
                existingLikes = []; // If parsing fails, default to an empty array
            }
    
            // REMOVING A LIKE
            if (existingLikes.includes(username)) {
                console.log("USER ALREADY LIKED THIS WIT");
    
                // Remove the username from the likes array
                existingLikes = existingLikes.filter(user => user !== username);
    
                // Update the wit with the new likes array
                await wit.update({ likes: JSON.stringify(existingLikes) });
    
                const numLikes = existingLikes.length;
    
                return res.json({ success: true, message: "User already liked this wit", numLikes, userAlreadyLiked: false });
            }
    
            // Add the username to the likes array
            existingLikes.push(username);
    
            // Update the wit with the new likes array
            await wit.update({ likes: JSON.stringify(existingLikes) });
    
            const numLikes = existingLikes.length;
    
            return res.json({ success: true, message: "Wit liked successfully", numLikes, userAlreadyLiked: true });
    
        } catch (error) {
            console.error("Error liking wit in API-route:", error);
            return res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    });
    
// ============================================================
// FOLLOW/UNFOLLOW ROUTE
// ============================================================
app.post("/api/users/:username/follow", async function (req, res) {
    const targetUsername = req.params.username;   // The user to be followed/unfollowed
    const followerUsername = req.body.username;   // The logged-in user who is following/unfollowing

    try {
        // Find the target user (Person A) who is being followed/unfollowed
        const targetUser = await db.User.findOne({
            where: { username: targetUsername },
            attributes: ['id', 'username', 'followers']  // Include their followers field
        });

        // Find the user who is following/unfollowing (Person B)
        const followerUser = await db.User.findOne({
            where: { username: followerUsername },
            attributes: ['id', 'username', 'following']  // Include their following field
        });

        if (!targetUser || !followerUser) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        // Parse the followers of the target user and the following of the logged-in user
        let targetUserFollowers = JSON.parse(targetUser.followers || '[]');
        let followerUserFollowing = JSON.parse(followerUser.following || '[]');

        // Check if the follower is already following the target user
        if (targetUserFollowers.includes(followerUsername)) {
            // Unfollow: Remove the follower from the target user's followers list
            targetUserFollowers = targetUserFollowers.filter(user => user !== followerUsername);
            await targetUser.update({ followers: JSON.stringify(targetUserFollowers) });

            // Remove the target user from the follower's following list
            followerUserFollowing = followerUserFollowing.filter(user => user !== targetUsername);
            await followerUser.update({ following: JSON.stringify(followerUserFollowing) });

            return res.json({
                success: true,
                message: "Unfollowed successfully",
                followersCount: targetUserFollowers.length,
                isFollowing: false
            });
        }

        // Follow: Add the follower to the target user's followers list
        targetUserFollowers.push(followerUsername);
        await targetUser.update({ followers: JSON.stringify(targetUserFollowers) });

        // Add the target user to the follower's following list
        followerUserFollowing.push(targetUsername);
        await followerUser.update({ following: JSON.stringify(followerUserFollowing) });

        return res.json({
            success: true,
            message: "Followed successfully",
            followersCount: targetUserFollowers.length,
            isFollowing: true
        });

    } catch (error) {
        console.error("Error in follow/unfollow API route:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});
    


    // ============================================================
    // DELETE WIT ROUTE
    // ============================================================
    app.post("/api/wits/:witId/delete", async function (req, res) {
        const witId = req.params.witId;

        try {
            const wit = await db.Wit.findByPk(witId);

            if (!wit) {
                return res.status(404).json({ success: false, error: "Wit not found" });
            } else {
                await wit.destroy()
            }
        } catch (error) {
            console.error("Error removing wit in API-route:", error);
            return res.status(500).json({ success: false, error: "Internal Server Error" });

        }
    })

    // ============================================================
    // EDIT WIT ROUTE
    // ============================================================
    app.post("/api/wits/:witId/edit", async function (req, res) {
        const witId = req.params.witId;
        const newBodyInput = req.body.editPrompt;
    
        try {
            const wit = await db.Wit.findByPk(witId);
    
            if (!wit) {
                return res.status(404).json({ success: false, error: "Wit not found" });
            } else {
                await wit.update({ body: newBodyInput });
    
                // Send a response indicating the successful update
                return res.status(200).json({ success: true, message: "Wit updated successfully" });
            }
        } catch (error) {
            console.error("Error updating wit in API route:", error);
            return res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    });
    
    // ============================================================
    // CHANGE PROFILE PIC ROUTE
    // ============================================================
    app.post("/api/changeProfilePic", upload.single("profilePicture"), async function (req, res) {
        console.log("Received File:", req.file);  // Log the file data
    
        const username = req.body.username;
        const profilePicture = req.file;
    
        console.log("username:", username);
        console.log("profilePicture:", profilePicture);
    
        try {
            // Update the profile picture in the database
            await db.User.update(
                {
                    profilePicture: profilePicture ? (profilePicture.location || profilePicture.filename) : null
                },
                {
                    where: {
                        username: username
                    }
                }
            );
    
            // Fetch the updated user object
            const updatedUser = await db.User.findOne({ where: { username: username } });
    
            // Update the session user object
            req.user.profilePicture = updatedUser.profilePicture;
    
            console.log("Profile Picture Updated:", updatedUser);
            res.json(updatedUser); // Send the updated user object back as JSON
        } catch (err) {
            console.log("Error updating Profile Picture:", err);
            res.status(401).json(err);
        }
    });

    // ============================================================
    // FIND PROFILE PIC FOR WITTER.JS PAGE ROUTE
    // ============================================================
    app.get("/api/profilePicture/:username", function (req, res) {
        const username = req.params.username;

        // Query the database to get the profile picture filename for the given username
        db.User.findOne({
            where: { username: username }
        })
        .then(function (user) {
            res.json({ profilePicture: user ? user.profilePicture : null });
        })
        .catch(function (err) {
            console.log("Error fetching profile picture:", err);
            res.status(500).json({ error: "Internal Server Error" });
        });
    });
};