// const express = require("express");
// const crypto = require("crypto");
// const Company = require("../models/Company");
// const User = require("../models/User");
// const { authenticateToken, requireRole } = require("../middleware/auth");
// const { sendInvitationEmail } = require("../services/userEmail");

// const {
//   getCompanyUserPerformance,
// } = require("../controllers/companyJobController");

// const CompanyPipeline = require("../models/CompanyPipeline");
// const router = express.Router();

// // Get all companies (Super Admin only)
// router.get(
//   "/",
//   authenticateToken,
//   requireRole(["super_admin"]),
//   async (req, res) => {
//     try {
//       const companies = await Company.find().populate(
//         "admin",
//         "username email"
//       );
//       res.json(companies);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }
// );



// // Get single company details
// router.get("/:id", authenticateToken, async (req, res) => {
//   try {
//     const companyId = req.params.id;

//     if (req.user.role === "super_admin") {
//       const company = await Company.findById(companyId).populate(
//         "admin",
//         "username email"
//       );
//       if (!company) {
//         return res.status(404).json({ error: "Company not found" });
//       }
//       return res.json(company);
//     } else if (
//       req.user.role === "company_admin" &&
//       req.user.company._id.toString() === companyId
//     ) {
//       const company = await Company.findById(companyId).populate(
//         "admin",
//         "username email"
//       );
//       return res.json(company);
//     }

//     return res.status(403).json({ error: "Access denied" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Create company with admin via email invitation (Super Admin only)
// router.post(
//   "/",
//   authenticateToken,
//   requireRole(["super_admin"]),
//   async (req, res) => {
//     try {
//       const { companyName, companyDescription, adminEmail } = req.body;

//       if (!companyName || !adminEmail) {
//         return res
//           .status(400)
//           .json({ error: "Company name and admin email are required" });
//       }

//       // Check if company exists
//       const existingCompany = await Company.findOne({ name: companyName });
//       if (existingCompany) {
//         return res.status(400).json({ error: "Company name already exists" });
//       }

//       // Check if email exists
//       const existingUser = await User.findOne({ email: adminEmail });
//       if (existingUser) {
//         return res.status(400).json({ error: "Email already exists" });
//       }

//       // Generate temporary password
//       const temporaryPassword = crypto.randomBytes(8).toString("hex");
//       const adminUsername = adminEmail.split("@")[0] + "_admin";

//       // Create company first
//       const company = new Company({
//         name: companyName,
//         description: companyDescription || "",
//       });

//       const savedCompany = await company.save();

//       // Create company admin
//       const companyAdmin = new User({
//         username: adminUsername,
//         email: adminEmail,
//         password: temporaryPassword,
//         role: "company_admin",
//         company: savedCompany._id,
//       });

//       const savedAdmin = await companyAdmin.save();

//       // Update company with admin reference
//       savedCompany.admin = savedAdmin._id;
//       await savedCompany.save();

//       // Send invitation email (optional, don't fail if email fails)
//       try {
//         const loginLink = `${
//           process.env.FRONTEND_URL || "http://localhost:5173"
//         }/login`;
//         await sendInvitationEmail(
//           adminEmail,
//           companyName,
//           temporaryPassword,
//           loginLink
//         );
//       } catch (emailError) {
//         console.error("Failed to send invitation email:", emailError);
//       }

//       // Create pipeline per request
//       const pipeline = req.body.pipeline || {};
//       if (
//         pipeline.mode === "custom" &&
//         Array.isArray(pipeline.stages) &&
//         pipeline.stages.length
//       ) {
//         await CompanyPipeline.createCustomPipeline(
//           savedCompany._id,
//           savedAdmin._id,
//           pipeline.stages,
//           pipeline.settings
//         );
//       } else {
//         await CompanyPipeline.createDefaultPipeline(
//           savedCompany._id,
//           savedAdmin._id
//         );
//       }

//       res.status(201).json({
//         message: "Company created and invitation sent successfully",
//         company: {
//           id: savedCompany._id,
//           name: savedCompany.name,
//           description: savedCompany.description,
//         },
//         admin: {
//           id: savedAdmin._id,
//           email: savedAdmin.email,
//           username: savedAdmin.username,
//         },
//       });
//     } catch (error) {
//       if (error.code === 11000) {
//         const field = Object.keys(error.keyPattern)[0];
//         return res.status(400).json({ error: `${field} already exists` });
//       }
//       res.status(500).json({ error: error.message });
//     }
//   }
// );

// // Update company info (Company Admin can update their own company)
// router.put("/:id", authenticateToken, async (req, res) => {
//   try {
//     const { name, description } = req.body;
//     const companyId = req.params.id;

//     // Check permissions
//     if (
//       req.user.role === "company_admin" &&
//       req.user.company._id.toString() !== companyId
//     ) {
//       return res
//         .status(403)
//         .json({ error: "You can only update your own company" });
//     }

//     if (req.user.role !== "super_admin" && req.user.role !== "company_admin") {
//       return res.status(403).json({ error: "Insufficient permissions" });
//     }

//     // Check if name already exists (excluding current company)
//     if (name) {
//       const existingCompany = await Company.findOne({
//         name,
//         _id: { $ne: companyId },
//       });
//       if (existingCompany) {
//         return res.status(400).json({ error: "Company name already exists" });
//       }
//     }

//     const updateData = {};
//     if (name) updateData.name = name;
//     if (description !== undefined) updateData.description = description;

//     const updatedCompany = await Company.findByIdAndUpdate(
//       companyId,
//       updateData,
//       { new: true, runValidators: true }
//     ).populate("admin", "username email");

//     if (!updatedCompany) {
//       return res.status(404).json({ error: "Company not found" });
//     }

//     res.json({
//       message: "Company updated successfully",
//       company: updatedCompany,
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       const field = Object.keys(error.keyPattern)[0];
//       return res.status(400).json({ error: `${field} already exists` });
//     }
//     res.status(500).json({ error: error.message });
//   }
// });



// router.put(
//   "/:id/subscription",
//   authenticateToken,
//   requireRole(["super_admin", "company_admin"]),
//   async (req, res) => {
//     try {
//       const { subscriptionPlan, subscriptionStatus, jobsQuota } = req.body;
//       const companyId = req.params.id;

//       // Check permissions
//       if (
//         req.user.role === "company_admin" &&
//         req.user.company._id.toString() !== companyId
//       ) {
//         return res
//           .status(403)
//           .json({ error: "You can only update your own company subscription" });
//       }

//       const updateData = {};
//       if (subscriptionPlan) updateData.subscriptionPlan = subscriptionPlan;
//       if (subscriptionStatus)
//         updateData.subscriptionStatus = subscriptionStatus;
//       if (jobsQuota !== undefined) updateData.jobsQuota = jobsQuota;

//       // Set subscription dates based on plan
//       if (subscriptionPlan && subscriptionStatus === "active") {
//         updateData.subscriptionStartDate = new Date();
//         updateData.subscriptionEndDate = new Date(
//           Date.now() + 30 * 24 * 60 * 60 * 1000
//         ); // 30 days
//       }

//       const updatedCompany = await Company.findByIdAndUpdate(
//         companyId,
//         updateData,
//         { new: true, runValidators: true }
//       );

//       if (!updatedCompany) {
//         return res.status(404).json({ error: "Company not found" });
//       }

//       res.json({
//         message: "Subscription updated successfully",
//         company: updatedCompany,
//       });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }
// );

// // Get subscription status
// router.get("/:id/subscription", authenticateToken, async (req, res) => {
//   try {
//     const companyId = req.params.id;

//     // Check permissions
//     if (
//       req.user.role !== "super_admin" &&
//       req.user.company._id.toString() !== companyId
//     ) {
//       return res.status(403).json({ error: "Access denied" });
//     }

//     const company = await Company.findById(companyId).select(
//       "subscriptionPlan subscriptionStatus subscriptionStartDate subscriptionEndDate jobsQuota jobsUsed lastJobSync"
//     );

//     if (!company) {
//       return res.status(404).json({ error: "Company not found" });
//     }

//     res.json({
//       subscription: {
//         plan: company.subscriptionPlan,
//         status: company.subscriptionStatus,
//         startDate: company.subscriptionStartDate,
//         endDate: company.subscriptionEndDate,
//         jobsQuota: company.jobsQuota,
//         jobsUsed: company.jobsUsed,
//         lastJobSync: company.lastJobSync,
//         remainingJobs: company.jobsQuota - company.jobsUsed,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Get company with users (Super Admin only)
// router.get(
//   "/:id/users",
//   authenticateToken,
//   requireRole(["super_admin"]),
//   async (req, res) => {
//     try {
//       const companyId = req.params.id;

//       const company = await Company.findById(companyId).populate(
//         "admin",
//         "username email"
//       );
//       if (!company) {
//         return res.status(404).json({ error: "Company not found" });
//       }

//       const users = await User.find({
//         company: companyId,
//         isActive: true,
//       })
//         .select("-password -resetPasswordToken -resetPasswordExpires")
//         .sort({ createdAt: -1 });

//       res.json({
//         company,
//         users,
//         totalUsers: users.length,
//       });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }
// );


const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getCompanyUserPerformance } = require('../controllers/companyJobController');
const companyController = require('../controllers/companyController');
const { updateSubscription, getSubscription } = require('../controllers/companySubscriptionController');

const router = express.Router();

// Subscription (single source of truth)
router.put('/:companyId/subscription', authenticateToken, requireRole(['super_admin', 'company_admin']), updateSubscription);
router.get('/:companyId/subscription', authenticateToken, getSubscription);

// Companies
router.get('/', authenticateToken, requireRole(['super_admin']), companyController.listCompanies);
router.get('/:companyId', authenticateToken, companyController.getCompanyDetails);
router.post('/', authenticateToken, requireRole(['super_admin']), companyController.createCompanyWithAdmin);
router.put('/:companyId', authenticateToken, companyController.updateCompany);

// Company users
router.get('/:companyId/users', authenticateToken, requireRole(['super_admin']), companyController.getCompanyUsers);

// Performance
router.get('/:companyId/user-performance', authenticateToken, requireRole(['super_admin', 'company_admin']), getCompanyUserPerformance);
// Assign subscription plan to company (super admin only)
router.put('/:id/subscription', authenticateToken, requireRole(['super_admin']), companyController.assignSubscriptionPlan);
module.exports = router;