import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Create an admin user
// @route   POST /api/admin/create
// @access  Public (should be restricted)
const createAdminUser = asyncHandler(async (req, res) => {
  const { name, email, password, adminSecret } = req.body;

  // Vérifiez si le secret admin est correct
  if (adminSecret !== process.env.ADMIN_SECRET) {
    res.status(401);
    throw new Error('Non autorisé');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    // If user exists, update their role to admin
    userExists.role = 'admin';
    await userExists.save();
    res.status(200).json({
      _id: userExists._id,
      name: userExists.name,
      email: userExists.email,
      role: userExists.role,
      token: generateToken(userExists._id),
    });
  } else {
    // If user doesn't exist, create a new admin user
    const user = await User.create({
      name,
      email,
      password,
      role: 'admin',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Données utilisateur invalides');
    }
  }
});

export { createAdminUser };

