import User from "../models/userscehma.js";
import bcrypt from "bcryptjs";
import createTokenAndSaveCookie from "../jwt/generateToken.js";

export const signup = async (req, res) => {
    try {
        const { name, email, password, confirmpassword } = req.body;
        if (password !== confirmpassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: "Email already exists" });
        }

        //hashing the pwd
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await new User({
            name,
            email,
            password: hashedPassword,

        });
        await newUser.save();
        if (newUser) {
            createTokenAndSaveCookie(newUser._id, res);
            res.status(201).json({
                message: "User registered successfully", user: {
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,

                }
            });
        }

    }

    catch (error) {
        console.log(error);
        res.status(500).json({ message: "server error" });
    }
};




export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email })
        const isMatch = await bcrypt.compare(password, user.password);
        if (!user || !isMatch) {
            return res.status(404).json({ message: "invalid user or password" });
        }
        createTokenAndSaveCookie(user._id, res);
        res.status(201).json({
            message: "user logged in successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,

            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "server error" });

    };
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('jwt');
        res.status(200).json({ message: "user logged out successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "server error" });
    }
}



export const getuserProfile = async (req, res) => {
    try {
        const loggedInUser = req.User._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUser } }).select("-password");
        res.status(201).json({ filteredUsers });
    } catch (error) {
        console.log("error in allUsers controller: " + error);
        res.status(500).json({ message: "server error" });

    }
}